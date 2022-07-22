import { io, Socket } from 'socket.io-client';
import TicTacToeSingleplayer from './TicTacToeSigleplayer';
import TicTacToeInvitation from './TicTacToeInvitation';
import TicTacToeMultiplayer from './TicTacToeMultiplayer';

export default class TicTacToeGame {
  // Overall functionality
  modeButtons: HTMLButtonElement[];
  gameMode: string;
  multiPlayerMenu: HTMLDivElement;
  usernameForm: HTMLFormElement;

  // Multiplayer
  // optionButtons: HTMLButtonElement[];
  // timer: HTMLDivElement;
  // multiplayerSettingsForm: HTMLFormElement;
  // opponentMoveTime: HTMLDivElement;
  // finalMoveTime: HTMLDivElement;
  // opponent: string | undefined;

  singleplayer: TicTacToeSingleplayer | undefined;
  invitations: TicTacToeInvitation | undefined;
  multiplayer: TicTacToeMultiplayer | undefined;

  constructor(
    modeButtons: HTMLButtonElement[],
    usernameForm: HTMLFormElement,
    multiPlayerMenu: HTMLDivElement
  ) {
    this.modeButtons = modeButtons;
    this.multiPlayerMenu = multiPlayerMenu;
    this.usernameForm = usernameForm;
    this.gameMode = <string>this.findActiveModeButton().dataset.gameMode;
    this.changeMode = this.changeMode.bind(this);

    this.modeButtons.forEach((button) => {
      button.addEventListener('click', this.changeMode);
    });
  }

  initializeSingleplayer(
    cells: NodeListOf<HTMLDivElement>,
    board: HTMLDivElement,
    endMessage: HTMLDivElement
  ) {
    this.singleplayer = new TicTacToeSingleplayer(cells, board, endMessage);
    this.singleplayer.startGame();
  }
  initializeMultiplayer(
    singleplayerProps: SingleplayerProps,
    multiplayerProps: MultiplayerProps
  ) {
    this.multiplayer = new TicTacToeMultiplayer(
      ...multiplayerProps,
      singleplayerProps
    );

    this.invitations = new TicTacToeInvitation(
      this.multiPlayerMenu,
      this.multiplayer
    );

    this.usernameForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = this.getUsernameFormInputElement().value;
      if (username === '') return;

      this.invitations?.initialize(username);
    });
  }

  getUsernameFormInputElement(): HTMLInputElement {
    interface UsernameFormElements extends HTMLFormControlsCollection {
      username: HTMLInputElement;
    }
    return (this.usernameForm.elements as UsernameFormElements).username;
  }
  findActiveModeButton(): HTMLButtonElement {
    return this.modeButtons.filter((button) => {
      if (button.classList.contains('active')) return true;
      return false;
    })[0];
  }
  protected changeMode(e: Event): void {
    const button = <HTMLButtonElement>e.currentTarget;

    if (button.dataset.gameMode === this.gameMode) return;

    this.findActiveModeButton().classList.remove('active');
    this.gameMode = <string>button.dataset.gameMode;
    button.classList.add('active');

    if (this.gameMode === 'multi') {
      this.multiPlayerMenu.classList.add('entering-username');
      const username: string = localStorage.getItem('username') || '';
      this.getUsernameFormInputElement().value = username;
    } else {
      this.multiPlayerMenu.classList.remove('entering-username');
      this.multiPlayerMenu.classList.remove('search');

      if (this.singleplayer !== undefined) this.singleplayer.startGame();
    }
  }
}
