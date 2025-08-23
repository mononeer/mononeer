// --- Self-contained Chess Game Logic for mononeer.com ---

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize the game if the chess board element exists on the page
    if (document.getElementById('chess-board')) {
        initializeChessGame();
    }
});

function initializeChessGame() {
    const chessBoardElement = document.getElementById('chess-board');
    const gameStatusElement = document.getElementById('chess-status');

    // --- Game State Variables ---
    let boardState = [];
    let currentPlayer = 'white';
    let selectedSquare = null;
    let isGameOver = false;
    let playerVsAiMode = true;

    // --- Constants ---
    const initialBoardSetup = [
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
        Array(8).fill(null), Array(8).fill(null), Array(8).fill(null), Array(8).fill(null),
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
    ];
    const pieceUnicode = {
        'king': { 'white': '♔', 'black': '♚' }, 'queen': { 'white': '♕', 'black': '♛' },
        'rook': { 'white': '♖', 'black': '♜' }, 'bishop': { 'white': '♗', 'black': '♝' },
        'knight': { 'white': '♘', 'black': '♞' }, 'pawn': { 'white': '♙', 'black': '♟︎' },
    };
    const pieceValues = {
        'pawn': 10, 'knight': 30, 'bishop': 30, 'rook': 50, 'queen': 90, 'king': 900
    };

    // --- Core Game Flow ---

    function setupInitialBoard() {
        boardState = initialBoardSetup.map((row, rowIndex) => {
            const color = rowIndex < 2 ? 'black' : 'white';
            return row.map(type => type ? { type, color } : null);
        });
    }

    function renderBoard() {
        chessBoardElement.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = r;
                square.dataset.col = c;
                const piece = boardState[r][c];
                if (piece) {
                    square.innerHTML = `<span class="chess-piece" style="color: ${piece.color === 'white' ? '#EEE' : '#333'}">${pieceUnicode[piece.type][piece.color]}</span>`;
                }
                chessBoardElement.appendChild(square);
            }
        }
    }

    function handleSquareClick(event) {
        if (isGameOver || (playerVsAiMode && currentPlayer === 'black')) return;
        const square = event.target.closest('.chess-square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = boardState[row][col];

        if (selectedSquare) {
            const fromRow = parseInt(selectedSquare.dataset.row);
            const fromCol = parseInt(selectedSquare.dataset.col);
            const validMoves = getValidMoves(boardState[fromRow][fromCol], fromRow, fromCol);
            if (validMoves.some(m => m[0] === row && m[1] === col)) {
                movePiece(fromRow, fromCol, row, col);
            }
            clearHighlights();
            selectedSquare = null;
        } else if (piece && piece.color === currentPlayer) {
            selectPiece(square);
        }
    }

    function movePiece(fromR, fromC, toR, toC) {
        boardState[toR][toC] = boardState[fromR][fromC];
        boardState[fromR][fromC] = null;
        currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
        updateBoardView(fromR, fromC, toR, toC);
        updateStatus();
        checkGameState();

        if (playerVsAiMode && currentPlayer === 'black' && !isGameOver) {
            setTimeout(makeAiMove, 500);
        }
    }

    function makeAiMove() {
        const aiMove = getAiMove();
        if (aiMove) {
            movePiece(aiMove.from.r, aiMove.from.c, aiMove.to.r, aiMove.to.c);
        }
    }

    // --- UI Update Functions ---

    function selectPiece(square) {
        clearHighlights();
        selectedSquare = square;
        square.classList.add('selected');
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const validMoves = getValidMoves(boardState[row][col], row, col);
        highlightValidMoves(validMoves);
    }

    function clearHighlights() {
        document.querySelectorAll('.selected, .valid-move').forEach(el => el.classList.remove('selected', 'valid-move'));
    }

    function highlightValidMoves(moves) {
        moves.forEach(([r, c]) => document.querySelector(`[data-row='${r}'][data-col='${c}']`)?.classList.add('valid-move'));
    }

    function updateBoardView(fromR, fromC, toR, toC) {
        const fromSquare = document.querySelector(`[data-row='${fromR}'][data-col='${fromC}']`);
        const toSquare = document.querySelector(`[data-row='${toR}'][data-col='${toC}']`);
        if (fromSquare && toSquare) {
            toSquare.innerHTML = fromSquare.innerHTML;
            fromSquare.innerHTML = '';
        }
    }

    function updateStatus(text) {
        let statusText = text || `Turn: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
        if (!text && isKingInCheck(currentPlayer)) {
            statusText += ' - Check!';
            const kingPos = findKing(currentPlayer);
            document.querySelectorAll('.in-check').forEach(s => s.classList.remove('in-check'));
            if (kingPos) document.querySelector(`[data-row='${kingPos.r}'][data-col='${kingPos.c}']`)?.classList.add('in-check');
        }
        gameStatusElement.textContent = statusText;
    }

    // --- Game State & Rules Logic ---

    function checkGameState() {
        if (playerHasLegalMoves(currentPlayer)) return;
        isGameOver = true;
        updateStatus(isKingInCheck(currentPlayer) ? `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins.` : 'Stalemate! Game is a draw.');
    }

    function playerHasLegalMoves(playerColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && piece.color === playerColor && getValidMoves(piece, r, c).length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function getValidMoves(piece, r, c) {
        const pseudoLegalMoves = getPseudoLegalMoves(piece, r, c);
        return pseudoLegalMoves.filter(move => {
            const [toR, toC] = move;
            const originalDestPiece = boardState[toR][toC];
            boardState[toR][toC] = piece;
            boardState[r][c] = null;
            const isLegal = !isKingInCheck(piece.color);
            boardState[r][c] = piece;
            boardState[toR][toC] = originalDestPiece;
            return isLegal;
        });
    }

    function isKingInCheck(kingColor) {
        const kingPos = findKing(kingColor);
        if (!kingPos) return false;
        const opponentColor = kingColor === 'white' ? 'black' : 'white';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && piece.color === opponentColor) {
                    if (getPseudoLegalMoves(piece, r, c).some(m => m[0] === kingPos.r && m[1] === kingPos.c)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function findKing(color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (boardState[r][c]?.type === 'king' && boardState[r][c]?.color === color) return { r, c };
            }
        }
        return null;
    }

    function getPseudoLegalMoves(piece, r, c) {
        // Piece-specific move logic (rook, knight, bishop, queen, king, pawn)...
        // This is a simplified placeholder for the large switch statement
        const moves = [];
        const color = piece.color;
        const addMove = (toR, toC, canCapture) => {
            if (toR < 0 || toR >= 8 || toC < 0 || toC >= 8) return;
            const destPiece = boardState[toR][toC];
            if (destPiece) {
                if (destPiece.color !== color && canCapture) moves.push([toR, toC]);
            } else {
                if (!canCapture) moves.push([toR, toC]);
            }
        };
        const addSlidingMoves = (directions) => {
             for (const [dr, dc] of directions) {
                for (let i = 1; i < 8; i++) {
                    const toR = r + i * dr, toC = c + i * dc;
                    if (toR < 0 || toR >= 8 || toC < 0 || toC >= 8) break;
                    const destPiece = boardState[toR][toC];
                    if (destPiece) {
                        if (destPiece.color !== color) moves.push([toR, toC]);
                        break;
                    }
                    moves.push([toR, toC]);
                }
            }
        };

        switch (piece.type) {
            case 'pawn':
                const dir = color === 'white' ? -1 : 1;
                const startRow = color === 'white' ? 6 : 1;
                if (!boardState[r + dir][c]) {
                    moves.push([r + dir, c]);
                    if (r === startRow && !boardState[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
                }
                [-1, 1].forEach(dc => {
                    if (c + dc >= 0 && c + dc < 8 && boardState[r + dir][c + dc] && boardState[r + dir][c + dc].color !== color) {
                        moves.push([r + dir, c + dc]);
                    }
                });
                break;
            case 'rook': addSlidingMoves([[-1, 0], [1, 0], [0, -1], [0, 1]]); break;
            case 'knight': [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => addMove(r + dr, c + dc, true)); break;
            case 'bishop': addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1]]); break;
            case 'queen': addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]); break;
            case 'king': [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => addMove(r + dr, c + dc, true)); break;
        }
        return moves;
    }

    // --- AI Logic ---
    function getAiMove() {
        let bestMove = null;
        let bestScore = Infinity;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece?.color === 'black') {
                    for (const move of getValidMoves(piece, r, c)) {
                        const [toR, toC] = move;
                        const originalDestPiece = boardState[toR][toC];
                        boardState[toR][toC] = piece;
                        boardState[r][c] = null;
                        const score = evaluateBoard(boardState);
                        boardState[r][c] = piece;
                        boardState[toR][toC] = originalDestPiece;
                        if (score < bestScore) {
                            bestScore = score;
                            bestMove = { from: { r, c }, to: { r: toR, c: toC } };
                        }
                    }
                }
            }
        }
        return bestMove;
    }

    function evaluateBoard(board) {
        let totalScore = 0;
        board.forEach(row => row.forEach(piece => {
            if (piece) totalScore += (piece.color === 'white' ? pieceValues[piece.type] : -pieceValues[piece.type]);
        }));
        return totalScore;
    }

    // --- Initializer Kick-off ---
    setupInitialBoard();
    renderBoard();
    chessBoardElement.addEventListener('click', handleSquareClick);
    updateStatus();
}
