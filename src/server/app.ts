import { Server, Socket } from 'socket.io';
import fs from 'fs/promises';
import Timer from './Timer';

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(3000, {
  cors: {
    origin: true
  }
});

const UPDATE_SESSION_TIME = 1000;

const TIMINGS = {
  move: [3, 5, 10, 15, 30, Infinity],
  pause: 30
};

io.on('connection', function (socket) {
  socket.on('enter', async (username) => {
    const dbData = await readDb();
    if (isUserInSearch(dbData, socket.id, username)) return;

    let inSearch = true;
    let opponent = '',
      gameID = '';
    let opponentMoveTime = 10,
      moveTime = 10,
      finalMoveTime = 10;
    const timer = new Timer();

    const sessionsUpdater = async (
      socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >
    ) => {
      if (!inSearch) return;

      const dbData = await readDb();
      socket.emit(
        'sessionsupdate',
        getSessionDataFromPlayers(dbData.players, socket.id)
      );

      setTimeout(() => {
        sessionsUpdater(socket);
      }, UPDATE_SESSION_TIME);
    };

    const isSuccess = addUser(dbData, socket.id, username);
    if (!isSuccess) {
      socket.emit('enterFailure', 'username already exists');
      return;
    }
    socket.emit('enterSuccess');
    await updateDb(dbData);
    sessionsUpdater(socket);

    const leaveGame = async () => {
      const dbData = await readDb();
      if (!isUserInGame(dbData, socket.id)) {
        throw Error("Can't leave the game. Not in multiplayer currently!");
      }
      cancelGame(dbData, socket.id, false);
      updateDb(dbData);

      inSearch = true;
      opponent = gameID = '';
    };

    socket.on('invite', async (invited) => {
      const dbData = await readDb();
      if (!isUserInSearch(dbData, invited)) return;

      dbData.players[socket.id].invited.push(invited);
      dbData.players[invited].wasInvited.push(socket.id);

      updateDb(dbData);
    });

    socket.on('cancelInvite', async (inviter, wasInvited) => {
      const dbData = await readDb();
      if (!isUserInSearch(dbData, inviter)) return;

      if (wasInvited) {
        dbData.players[socket.id].invited.splice(
          dbData.players[socket.id].invited.indexOf(inviter),
          1
        );
        dbData.players[inviter].wasInvited.splice(
          dbData.players[inviter].wasInvited.indexOf(socket.id),
          1
        );
      } else {
        dbData.players[socket.id].wasInvited.splice(
          dbData.players[socket.id].wasInvited.indexOf(inviter),
          1
        );
        dbData.players[inviter].invited.splice(
          dbData.players[inviter].invited.indexOf(socket.id),
          1
        );
      }

      updateDb(dbData);
    });

    socket.on('acceptInvite', async (inviter) => {
      const dbData = await readDb();
      if (!isUserInSearch(dbData, inviter)) return;

      const room = {
        players: {
          [socket.id]: dbData.players[socket.id].username,
          [inviter]: dbData.players[inviter].username
        },
        currentGame: Array(9).fill(null) as BoardMoves
      };
      dbData.games[inviter] = room;

      io.to(socket.id).emit(
        'startGame',
        dbData.players[inviter].username,
        true
      );
      io.to(inviter).emit(
        'startGame',
        dbData.players[socket.id].username,
        false
      );

      deleteUser(dbData, inviter);
      deleteUser(dbData, socket.id);

      await updateDb(dbData);
    });

    socket.on('timeout', async (time: number = TIMINGS.pause) => {
      if (opponent === '' || gameID === '') {
        const dbData = await readDb();
        const isInGame: string | boolean = isUserInGame(dbData, socket.id);

        if (typeof isInGame === 'boolean') return;

        inSearch = false;
        gameID = isInGame;
        opponent = Object.keys(dbData.games[gameID].players).filter(
          (i) => i !== socket.id
        )[0];
      }

      if (timer.maxTime !== 0) timer.reset();
      timer.start(time * 1000, leaveGame);
    });

    // socket.on('changeMoveTime', (time) => {
    //     if (time !== Infinity && time > 30) return;
    //     io.to(opponent).emit('changeMoveTime', time);
    // });

    socket.on('restartMatch', async function initial() {
      io.to(opponent).emit('restartMatch');

      socket.on('restartMatch', function restartMatch() {
        io.to(socket.id).emit('restartMatch');
        io.to(opponent).emit('restartMatch');

        timer.reset();
        timer.start(finalMoveTime * 1000, () => {
          socket.emit('timeIsUp', true);
        });

        socket.on('restartMatch', initial);
        socket.off('restartMatch', restartMatch);
      });

      socket.off('restartMatch', initial);
    });

    socket.on('move', async (position) => {
      const dbData = await readDb();

      if (dbData.games[gameID].currentGame[position]) {
        restartMatch(dbData, gameID);
        io.to(gameID).emit('restartMatch');
      }
      dbData.games[gameID].currentGame[position] = 1;

      io.to(opponent).emit('move', position);
    });

    socket.on('leaveGame', leaveGame);

    socket.on('disconnect', async () => {
      console.log('disconnect');
      const dbData = await readDb();
      if (isUserInSearch(dbData, socket.id)) {
        deleteUser(dbData, socket.id);
      } else if (isUserInGame(dbData, socket.id)) {
        cancelGame(dbData, socket.id, true);
      } else {
        const errorMessage = `Something went wrong. Here is dbData:\n${dbData}`;
        throw Error(errorMessage);
      }
      updateDb(dbData);
    });
  });
});

function updateDb(dbData: DbData) {
  return fs.writeFile('CurrentPlayers.json', JSON.stringify(dbData));
}

async function readDb(): Promise<DbData> {
  return <DbData>(
    JSON.parse((await fs.readFile('CurrentPlayers.json')).toString('utf-8'))
  );
}

function getSessionDataFromPlayers(
  players: Players,
  socketID: string
): SessionData[] {
  return Object.entries(players)
    .filter((player) => player[0] !== socketID)
    .map((player) => {
      return {
        socketID: player[0],
        username: player[1].username,
        invited: player[1].invited.includes(socketID),
        wasInvited: player[1].wasInvited.includes(socketID)
      };
    });
}

function addUser(dbData: DbData, socketID: string, username: string): boolean {
  const isUsernameInDb = Object.values(dbData.players)
    .map((player) => player.username)
    .includes(username);
  if (isUsernameInDb) return false;

  dbData.players[socketID] = {
    username: username,
    invited: [],
    wasInvited: []
  };
  return true;
}

function deleteUser(dbData: DbData, socketID: string): void {
  if (dbData.players[socketID] === undefined) {
    const errorMessage = `Can not delete the user ${socketID}.\nThere is no such user in\n${dbData.players}!`;
    throw Error(errorMessage);
  }

  for (let invited of dbData.players[socketID].invited) {
    if (dbData.players[invited] === undefined) continue;

    dbData.players[invited].wasInvited.splice(
      dbData.players[invited].wasInvited.indexOf(socketID),
      1
    );
  }
  for (let inviter of dbData.players[socketID].invited) {
    if (dbData.players[inviter] === undefined) continue;

    dbData.players[inviter].invited.splice(
      dbData.players[inviter].invited.indexOf(socketID),
      1
    );
  }

  delete dbData.players[socketID];
  return;
}

function restartMatch(dbData: DbData, room: string) {
  dbData.games[room].currentGame = Array(9).fill(null) as BoardMoves;
}

function isUserInSearch(
  dbData: DbData,
  socketID: string,
  username: string = ''
): boolean {
  return (
    Object.keys(dbData.players).includes(socketID) &&
    (username === '' || dbData.players[socketID].username === username)
  );
}

function isUserInGame(dbData: DbData, socketID: string): string | boolean {
  const games = Object.values(dbData.games);
  let room: string | undefined;

  for (let game of games) {
    if (Object.keys(game.players).includes(socketID)) {
      room = Object.keys(game.players)[1];
    }
  }

  return room || false;
}

function cancelGame(
  dbData: DbData,
  socketID: string,
  isDisconnected: boolean
): void {
  let room_id: string | undefined;
  let opponent: [string, string] | undefined;
  let username: string | undefined;

  for (let game of Object.entries(dbData.games)) {
    if (Object.keys(game[1].players).includes(socketID)) {
      room_id = game[0];
      opponent = Object.entries(game[1].players).filter(
        (i) => i[0] !== socketID
      )[0];
      username = game[1].players[socketID];
    }
  }
  if (
    opponent === undefined ||
    room_id === undefined ||
    username === undefined
  ) {
    const errorMessage = `Can not delete the user ${socketID}.\nThere is no such user in\n${JSON.stringify(
      dbData.games
    )}!`;
    throw Error(errorMessage);
  }

  if (!isDisconnected) {
    dbData.players[socketID] = {
      username: username,
      invited: [],
      wasInvited: []
    };
  }

  dbData.players[opponent[0]] = {
    username: opponent[1],
    invited: [],
    wasInvited: []
  };
  io.to(opponent[0]).emit('gameOver');

  delete dbData.games[room_id];
}
