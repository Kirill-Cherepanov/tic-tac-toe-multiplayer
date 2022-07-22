export default class TicTacToeSingleplayer {
    cells: HTMLDivElement[];
    board: HTMLDivElement;
    endMessage: HTMLDivElement;
    xTurn: boolean;
    WINNING_COMBINATIONS: [number, number, number][];

    constructor(
        cells: NodeListOf<HTMLDivElement>,
        board: HTMLDivElement,
        endMessage: HTMLDivElement
    ) {
        this.cells = [...cells];
        this.board = board;
        this.endMessage = endMessage;

        this.xTurn = true;
        this.WINNING_COMBINATIONS = [
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        this.makeMove = this.makeMove.bind(this);
    }
    protected clearBoard(): void {
        this.endMessage.classList.remove('show');

        [...this.board.childNodes].forEach(child => {
            this.board.removeChild(child);
        });

        this.cells.forEach((cell, i) => {
            const newNode = <HTMLDivElement>cell.cloneNode(true);
            newNode.classList.remove('x');
            newNode.classList.remove('o');
            this.board.append(newNode);
            this.cells[i] = newNode;
        });
    }
    startGame(): void {
        this.setBoardHoverClass();
        this.clearBoard();

        this.cells.forEach((cell) => {
            cell.addEventListener('click', this.makeMove, {
                once: true
            });
        });
    }
    protected makeMove(cell: HTMLDivElement | Event): void {
        if (cell instanceof Event) cell = <HTMLDivElement>cell.target;
        const currentClass: string = this.xTurn ? 'x' : 'o';
        this.placeMark(cell, currentClass);
        this.swapTurns();
        if (this.checkWin(currentClass)) this.gameOver();
        else if (this.checkDraw()) this.gameOver(true);
    }
    protected placeMark(cell: HTMLDivElement, currentClass: string): void {
        cell.classList.add(currentClass);
    }
    protected swapTurns(): void {
        this.xTurn = !this.xTurn;
        this.setBoardHoverClass();
    }
    protected setBoardHoverClass(): void {
        this.board.classList.remove('o');
        this.board.classList.remove('x');

        if (this.xTurn) {
            this.board.classList.add('x');
        } else {
            this.board.classList.add('o');
        }
    }
    protected checkWin(currentClass: string): boolean {
        return this.WINNING_COMBINATIONS.some(combination => {
            return combination.every(index => {
                return this.cells[index].classList.contains(currentClass);
            });
        });
    }
    protected checkDraw(): boolean {
        return [...this.cells].every((cell) => {
            return cell.classList.contains('x') || cell.classList.contains('o');
        });
    }
    protected gameOver(draw: boolean = false): void {
        let message: string;

        message = draw
            ? 'Draw!'
            : `${this.xTurn ? 'Circle' : 'Cross'} player Wins!`;
        
        this.setMessage(message, 'Restart', (e: Event): void => {
            this.endMessage.classList.remove('show');
            this.startGame.call(this);
        });
    }
    protected setMessage(
        text: string,
        buttonText: string,
        callback: Function
    ) {
        this.endMessage.classList.add('show');
        const endText = <HTMLDivElement>(
            this.endMessage.querySelector('[data-end-text]')
        );
        const restartButton = <HTMLButtonElement>(
            this.endMessage.querySelector('[data-restart-button]')
        );

        endText.innerHTML = text;
        restartButton.innerText = buttonText;

        restartButton.addEventListener('click', e => callback(e), { once: true });
    }
}
