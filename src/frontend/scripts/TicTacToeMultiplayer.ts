import { io, Socket } from 'socket.io-client';
import TicTacToeSingleplayer from './TicTacToeSigleplayer';

export default class TicTacToeMultiplayer extends TicTacToeSingleplayer {
  settingsButton: HTMLButtonElement;
  leaveButton: HTMLButtonElement;
  timer: HTMLDivElement;
  settingsForm: HTMLFormElement;

  socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;
  username: string;
  opponent: string | undefined;
  currentTurn: boolean;

  opponentMoveTime: HTMLDivElement | undefined;
  finalMoveTime: HTMLDivElement | undefined;

  constructor(
    optionButtons: HTMLButtonElement[],
    timer: HTMLDivElement,
    settingsForm: HTMLFormElement,
    boardProps: [
      cells: NodeListOf<HTMLDivElement>,
      board: HTMLDivElement,
      endMessage: HTMLDivElement
    ]
  ) {
    super(...boardProps);

    this.currentTurn = this.xTurn;
    this.username = <string>localStorage.getItem('username');
    this.settingsButton = optionButtons[0];
    this.leaveButton = optionButtons[1];
    this.timer = timer;
    this.settingsForm = settingsForm;

    this.startGame = this.startGame.bind(this);
  }
  initialize(
    opponent: string,
    firstTurn: boolean,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
  ) {
    this.opponent = opponent;
    this.xTurn = firstTurn;
    this.currentTurn = firstTurn;
    this.socket = socket;

    this.initializeSettings();

    this.setMessage(`Match against<br>${this.opponent}`, 'Start');
  }
  initializeSettings(): void {
    const settingsContainer = <HTMLElement>this.settingsForm.parentElement;
    const settingsLabel = <HTMLLabelElement>(
      this.settingsButton.lastElementChild
    );
    const moveTimeInput = <HTMLInputElement>(
      this.settingsForm.elements[
        'player-move-time' as keyof HTMLFormControlsCollection
      ]
    );

    this.settingsButton.addEventListener('click', () => {
      if (settingsContainer.classList.contains('show')) {
        settingsLabel.innerText = 'Game';
      } else settingsLabel.innerText = 'Settings';

      settingsContainer.classList.toggle('show');
    });

    // moveTimeInput.addEventListener('change', () => {
    //     this.socket?.emit('changeMoveTime', Number(moveTimeInput.value))
    // });

    // this.socket?.on('changeMoveTime', time => {

    // });

    this.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = <HTMLFormElement>e.currentTarget;
      const timeoutTime = <HTMLInputElement>(
        form.elements['timeout-time' as keyof HTMLFormControlsCollection]
      );

      this.socket?.emit('timeout', Number(timeoutTime.value) * 60);
    });

    this.leaveButton.addEventListener('click', (e) => {
      this.endMessage.classList.remove('show');
      settingsContainer.classList.remove('show');
      this.socket?.emit('leaveGame');
    });
  }

  protected swapSides(): void {
    this.xTurn = !this.xTurn;
    this.currentTurn = this.xTurn;
    this.setBoardHoverClass();
    this.clearBoard();
  }
  startGame(): void {
    this.swapSides();

    if (this.currentTurn) this.initializeMove();

    this.socket?.off('move');

    this.socket?.on('move', (position) => {
      this.makeMove(this.cells[position]);
      this.initializeMove();
    });
  }
  protected initializeMove() {
    const makeMove = this.makeMove;
    const socket = this.socket;

    const move = (e: Event) => {
      const cell = <HTMLDivElement>e.target;
      makeMove(cell);

      socket?.emit('move', this.cells.indexOf(cell));

      this.cells.forEach((cell) => {
        cell.removeEventListener('click', move);
      });
    };

    this.cells.forEach((cell) => {
      if (cell.classList.contains('x') || cell.classList.contains('o')) {
        return;
      }
      cell.addEventListener('click', move);
    });
  }
  protected makeMove(cell: HTMLDivElement): void {
    const currentClass: string = this.currentTurn === this.xTurn ? 'x' : 'o';
    this.placeMark(cell, currentClass);
    this.swapTurns();
    if (this.checkWin(currentClass)) this.gameOver();
    else if (this.checkDraw()) this.gameOver(true);
  }
  protected swapTurns(): void {
    this.currentTurn = !this.currentTurn;
    this.setBoardHoverClass();
  }
  protected gameOver(draw: boolean = false): void {
    const message: string = draw
      ? 'Draw!'
      : `${this.currentTurn ? this.username : this.opponent}'s Victory!`;

    this.setMessage(message, 'Restart');
  }
  protected setMessage(text: string, buttonText: string) {
    this.socket?.emit('timeout');

    const endText = <HTMLDivElement>(
      this.endMessage.querySelector('[data-end-text]')
    );
    const restartButton = <HTMLButtonElement>(
      this.endMessage.querySelector('[data-restart-button]')
    );

    endText.innerHTML = text;
    restartButton.innerText = buttonText;

    this.endMessage.classList.add('show');

    restartButton.addEventListener(
      'click',
      () => {
        this.socket?.emit('restartMatch');
        endText.innerText = 'Waiting for the opponent';
        restartButton.innerText = 'Wait';

        this.socket?.on('restartMatch', () => {
          this.socket?.emit('restartMatch');
          this.startGame();
          this.socket?.off('restartMatch');
        });
      },
      { once: true }
    );
  }
}
