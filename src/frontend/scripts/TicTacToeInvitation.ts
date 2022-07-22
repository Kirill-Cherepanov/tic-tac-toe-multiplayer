import { io, Socket } from 'socket.io-client';
import TicTacToeMultiplayer from './TicTacToeMultiplayer';

export default class TicTacToeInvitation {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;
  opponent: string | undefined;
  multiPlayerMenu: HTMLDivElement;
  sessions: HTMLButtonElement[];
  multiplayer: TicTacToeMultiplayer;

  constructor(
    multiPlayerMenu: HTMLDivElement,
    multiplayer: TicTacToeMultiplayer
  ) {
    this.multiPlayerMenu = multiPlayerMenu;
    this.sessions = [];
    this.multiplayer = multiplayer;

    // document.addEventListener('keydown', (e) => {
    //   if (e.key === 'q') this.socket?.emit('restartMatch');
    // });
  }

  initialize(username: string): void {
    localStorage.setItem('username', username);

    this.multiPlayerMenu.classList.remove('entering-username');
    this.multiPlayerMenu.classList.add('search');

    this.connectToServer();

    if (this.socket === undefined) {
      throw Error('Failed to connect to the server!');
    }

    this.socket.emit('enter', username);
  }
  protected noChangesInSessions(sessionsData: SessionData[]): boolean {
    // Fetching SessionData from this.sessions
    const prevData: SessionData[] = sortSessionData(
      this.sessions.map((session) => {
        return {
          socketID: <string>session.dataset.token,
          username: session.innerText,
          invited: session.classList.contains('pending'),
          wasInvited: session.classList.contains('active')
        };
      })
    );

    return compareSessionData(prevData, sortSessionData(sessionsData));

    function sortSessionData(data: SessionData[]) {
      return data.sort((a, b) => {
        if (a.socketID > b.socketID) {
          return 1;
        }
        if (a.socketID < b.socketID) {
          return -1;
        }
        return 0;
      });
    }
    function compareSessionData(data1: SessionData[], data2: SessionData[]) {
      return (
        data1.length === data2.length &&
        data1.every((session, i) => {
          return (
            session.socketID === data2[i].socketID &&
            session.username === data2[i].username &&
            session.invited === data2[i].invited &&
            session.wasInvited === data2[i].wasInvited
          );
        })
      );
    }
  }
  protected clearSessions() {
    this.sessions.forEach((session) => {
      session.parentElement?.removeChild(session);
    });
    this.sessions = [];
  }
  protected createSessionElement(sessionData: SessionData): HTMLButtonElement {
    const sessionElement: HTMLButtonElement = document.createElement('button');
    sessionElement.classList.add('multiplayer-session');
    if (sessionData.wasInvited) sessionElement.classList.add('active');
    if (sessionData.invited) sessionElement.classList.add('pending');
    sessionElement.dataset['token'] = sessionData.socketID;

    const nicknameSpan: HTMLSpanElement = document.createElement('span');
    nicknameSpan.classList.add('multiplayer-nickname');
    nicknameSpan.dataset['sessionNickname'] = '';
    nicknameSpan.innerText = sessionData.username;

    const cancelIcon: HTMLElement = document.createElement('i');
    cancelIcon.classList.add('cancel-icon');
    cancelIcon.classList.add('session-icon');

    const acceptIcon: HTMLElement = document.createElement('i');
    acceptIcon.classList.add('accept-icon');
    acceptIcon.classList.add('session-icon');

    sessionElement.addEventListener('click', (e: Event) => {
      if (
        (e.target !== sessionElement && e.target !== nicknameSpan) ||
        sessionElement.classList.contains('confirm') ||
        sessionElement.classList.contains('active')
      ) {
        return;
      }

      sessionElement.classList.add('confirm');
    });

    acceptIcon.addEventListener('click', () => {
      if (sessionElement.classList.contains('pending')) {
        this.socket?.emit('acceptInvite', sessionData.socketID);
        return;
      }

      const pendingInvites = <HTMLDivElement>(
        this.multiPlayerMenu.querySelector('.pending-invites')
      );

      if (!pendingInvites.classList.contains('show')) {
        pendingInvites.classList.add('show');
      }

      sessionElement.parentElement?.previousElementSibling?.append(
        sessionElement
      );
      this.socket?.emit('invite', sessionData.socketID);

      sessionElement.classList.remove('confirm');
      sessionElement.classList.add('active');
    });

    cancelIcon.addEventListener('click', () => {
      const handleCancelInvite = (wasInvited: boolean): void => {
        const pendingInvites = <HTMLDivElement>(
          this.multiPlayerMenu.querySelector('.pending-invites')
        );
        this.socket?.emit('cancelInvite', sessionData.socketID, wasInvited);
        pendingInvites.nextElementSibling?.append(sessionElement);
        if (pendingInvites.childElementCount === 0) {
          pendingInvites.classList.remove('show');
        }
      };

      if (sessionElement.classList.contains('active')) {
        handleCancelInvite(true);
      } else if (sessionElement.classList.contains('pending')) {
        handleCancelInvite(false);
      }

      sessionElement.classList.remove('confirm');
      sessionElement.classList.remove('active');
      sessionElement.classList.remove('pending');
    });

    sessionElement.append(nicknameSpan, cancelIcon, acceptIcon);
    return sessionElement;
  }
  protected updateSessions(sessionsData: SessionData[]) {
    if (this.noChangesInSessions(sessionsData)) return;

    this.clearSessions();

    const pendingInvites = <HTMLDivElement>(
      this.multiPlayerMenu.querySelector('.pending-invites')
    );

    sessionsData.forEach((sessionData) => {
      const sessionElement: HTMLButtonElement =
        this.createSessionElement(sessionData);

      this.sessions.push(sessionElement);

      if (
        (sessionElement.classList.contains('active') ||
          sessionElement.classList.contains('pending')) &&
        !sessionElement.classList.contains('confirm')
      ) {
        if (!pendingInvites.classList.contains('show')) {
          pendingInvites.classList.add('show');
        }
        pendingInvites.append(sessionElement);
      } else {
        pendingInvites.nextElementSibling?.append(sessionElement);
      }
    });

    if (
      pendingInvites.classList.contains('show') ===
      (pendingInvites.childElementCount === 0)
    ) {
      pendingInvites.classList.toggle('show');
    }
  }
  protected connectToServer() {
    if (this.socket !== undefined) return;

    this.socket = io('http://192.168.100.2:3000/') as Socket<
      ServerToClientEvents,
      ClientToServerEvents
    >;

    this.socket.on('sessionsupdate', (sessionsData) => {
      this.updateSessions(sessionsData);
    });

    this.socket.on('startGame', (...args) => {
      if (this.socket === undefined)
        throw Error('How in the world has this happened? Socket is undefined!');

      this.multiPlayerMenu.classList.remove('entering-username');
      this.multiPlayerMenu.classList.remove('search');
      this.multiPlayerMenu.parentElement?.classList.add('multiplayer');

      this.multiplayer.initialize(...args, this.socket);

      this.socket.on('gameOver', () => {
        this.multiPlayerMenu.classList.add('search');
        this.multiPlayerMenu.parentElement?.classList.remove('multiplayer');
      });
    });

    this.multiplayer.leaveButton.addEventListener('click', (e) => {
      this.multiPlayerMenu.classList.add('search');
      this.multiPlayerMenu.parentElement?.classList.remove('multiplayer');
    });
  }
}
