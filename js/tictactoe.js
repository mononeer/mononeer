document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('tic-tac-toe-board');
    const statusElement = document.getElementById('tic-tac-toe-status');
    const restartBtn = document.getElementById('tic-tac-toe-restart');

    if (!boardElement) return;

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusElement.textContent = `Player ${currentPlayer} has won!`;
            gameActive = false;
            return;
        }

        if (!board.includes('')) {
            statusElement.textContent = 'Game ended in a draw!';
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusElement.textContent = `It's ${currentPlayer}'s turn`;
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.dataset.index);

        if (board[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        board[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        handleResultValidation();
    }

    function restartGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        statusElement.textContent = `It's ${currentPlayer}'s turn`;
        document.querySelectorAll('.tic-tac-toe-cell').forEach(cell => cell.textContent = '');
    }

    function createBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tic-tac-toe-cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }

    createBoard();
    statusElement.textContent = `It's ${currentPlayer}'s turn`;
    restartBtn.addEventListener('click', restartGame);
});
