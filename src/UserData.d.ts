type SingleplayerProps = [
    cells: NodeListOf<HTMLDivElement>,
    board: HTMLDivElement,
    endMessage: HTMLDivElement
];
type MultiplayerProps = [
    optionButtons: HTMLButtonElement[],
    timer: HTMLDivElement,
    multiplayerSettingsForm: HTMLFormElement
];

type SessionData = {
    socketID: string;
    username: string;
    invited: boolean;
    wasInvited: boolean;
};

interface Players {
    [socketID: string]: {
        username: string;
        invited: string[];
        wasInvited: string[];
    };
}
type BoardMoves = [
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null,
    number | null
];
interface Games {
    [socketID: string]: {
        players: {
            [socketID: string]: string;
        };
        currentGame: BoardMoves;
    };
}

interface DbData {
    players: Players;
    games: Games;
}
