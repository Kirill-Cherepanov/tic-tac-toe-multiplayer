import TicTacToe from './TicTacToe';
import '../styles/styles.sass';

const cellElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('[data-cell]');
const board = <HTMLDivElement>document.getElementById('gameboard');
const endMessage = <HTMLDivElement>document.querySelector('[data-end-message]');
const endText = <HTMLDivElement>document.querySelector('[data-end-text]');
const restartButton = <HTMLDivElement>(
    document.querySelector('[data-restart-button]')
);
const singlePlayerButton = <HTMLButtonElement>(
    document.getElementById('single-button')
);
const multiPlayerButton = <HTMLButtonElement>(
    document.getElementById('multi-button')
);
const aiButton = <HTMLButtonElement>document.getElementById('ai-button');
const multiPlayerMenu = <HTMLDivElement>(
    document.querySelector('[data-multiplayer-menu]')
);
const usernameForm = <HTMLFormElement>document.getElementById('username-form');

const settingsButton = <HTMLButtonElement>document.getElementById('settings-btn');
const leaveButton = <HTMLButtonElement>document.getElementById('leave-btn');

const timer = <HTMLDivElement>document.querySelector('[data-timer]');
const multiplayerSettingsForm = <HTMLFormElement>document.querySelector('[data-settings]');
const opponentMoveTime = <HTMLDivElement>document.querySelector('[data-opponent-move-time]');
const finalMoveTime = <HTMLDivElement>document.querySelector('[data-final-move-time]');

const tictactoe: TicTacToe = new TicTacToe([singlePlayerButton, multiPlayerButton, aiButton], usernameForm, multiPlayerMenu);

const singleplayerProps: SingleplayerProps= [cellElements, board, endMessage];
const multiplayerProps: MultiplayerProps = [[settingsButton, leaveButton], timer, multiplayerSettingsForm]

tictactoe.initializeSingleplayer(...singleplayerProps);
tictactoe.initializeMultiplayer(singleplayerProps, multiplayerProps);
