// --- Self-contained Chess Game Logic for mononeer.com ---

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chess-board')) {
        initializeChessGame();
    }
});

function initializeChessGame() {
    const chessBoardElement = document.getElementById('chess-board');
    const gameStatusElement = document.getElementById('chess-status');

    let boardState = [];
    let currentPlayer = 'white';
    let selectedSquare = null;
    let isGameOver = false;
    let playerVsAiMode = true;

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

    function setupAndRender() {
        boardState = initialBoardSetup.map((row, rowIndex) => {
            const color = rowIndex < 2 ? 'black' : 'white';
            return row.map(type => type ? { type, color } : null);
        });
        chessBoardElement.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = r;
                square.dataset.col = c;
                const piece = boardState[r][c];
                if (piece) {
                    square.innerHTML = `<span class="chess-piece">${pieceUnicode[piece.type][piece.color]}</span>`;
                }
                chessBoardElement.appendChild(square);
            }
        }
        updateStatus();
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
            setTimeout(makeAiMove, 250);
        }
    }

    function makeAiMove() {
        const aiMove = findBestMove();
        if (aiMove) {
            movePiece(aiMove.from.r, aiMove.from.c, aiMove.to.r, aiMove.to.c);
        }
    }

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
        document.querySelectorAll('.in-check').forEach(s => s.classList.remove('in-check'));
        if (!text && isKingInCheck(currentPlayer)) {
            statusText += ' - Check!';
            const kingPos = findKing(currentPlayer);
            if (kingPos) document.querySelector(`[data-row='${kingPos.r}'][data-col='${kingPos.c}']`)?.classList.add('in-check');
        }
        gameStatusElement.textContent = statusText;
    }

    function checkGameState() {
        if (getAllLegalMoves(currentPlayer).length > 0) return;
        isGameOver = true;
        updateStatus(isKingInCheck(currentPlayer) ? `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins.` : 'Stalemate! Game is a draw.');
    }

    function getAllLegalMoves(playerColor) {
        const allMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && piece.color === playerColor) {
                    const moves = getValidMoves(piece, r, c);
                    if (moves.length > 0) {
                        allMoves.push(...moves.map(m => ({from: {r,c}, to: {r:m[0], c:m[1]}})));
                    }
                }
            }
        }
        return allMoves;
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
        const moves = [];
        const color = piece.color;

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
                if (r + dir >= 0 && r + dir < 8 && !boardState[r + dir][c]) {
                    moves.push([r + dir, c]);
                    if (r === startRow && !boardState[r + 2 * dir][c]) {
                        moves.push([r + 2 * dir, c]);
                    }
                }
                [-1, 1].forEach(dc => {
                    if (c + dc >= 0 && c + dc < 8 && r + dir >= 0 && r + dir < 8) {
                        const destPiece = boardState[r+dir][c+dc];
                        if (destPiece && destPiece.color !== color) {
                            moves.push([r + dir, c + dc]);
                        }
                    }
                });
                break;
            case 'rook':
                addSlidingMoves([[-1, 0], [1, 0], [0, -1], [0, 1]]);
                break;
            case 'knight':
                [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
                    const toR = r + dr, toC = c + dc;
                    if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8) {
                        const destPiece = boardState[toR][toC];
                        if (!destPiece || destPiece.color !== color) moves.push([toR, toC]);
                    }
                });
                break;
            case 'bishop':
                addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
                break;
            case 'queen':
                addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
                break;
            case 'king':
                [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
                    const toR = r + dr, toC = c + dc;
                     if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8) {
                        const destPiece = boardState[toR][toC];
                        if (!destPiece || destPiece.color !== color) moves.push([toR, toC]);
                    }
                });
                break;
        }
        return moves;
    }

    function findBestMove() {
        let bestMove = null;
        let bestValue = Infinity;
        const depth = 2;

        const allMoves = getAllLegalMoves('black');
        if (allMoves.length === 0) return null;

        for (const move of allMoves) {
            const { from, to } = move;
            const originalDestPiece = boardState[to.r][to.c];
            boardState[to.r][to.c] = boardState[from.r][from.c];
            boardState[from.r][from.c] = null;

            const boardValue = minimax(depth - 1, -Infinity, Infinity, true);

            boardState[from.r][from.c] = boardState[to.r][to.c];
            boardState[to.r][to.c] = originalDestPiece;

            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
        return bestMove;
    }

    function minimax(depth, alpha, beta, isMaximizingPlayer) {
        if (depth === 0) return evaluateBoard();

        const moves = getAllLegalMoves(isMaximizingPlayer ? 'white' : 'black');
        if (moves.length === 0) return evaluateBoard();

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const { from, to } = move;
                const originalDestPiece = boardState[to.r][to.c];
                boardState[to.r][to.c] = boardState[from.r][from.c];
                boardState[from.r][from.c] = null;
                const eval = minimax(depth - 1, alpha, beta, false);
                boardState[from.r][from.c] = boardState[to.r][to.c];
                boardState[to.r][to.c] = originalDestPiece;
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const { from, to } = move;
                const originalDestPiece = boardState[to.r][to.c];
                boardState[to.r][to.c] = boardState[from.r][from.c];
                boardState[from.r][from.c] = null;
                const eval = minimax(depth - 1, alpha, beta, true);
                boardState[from.r][from.c] = boardState[to.r][to.c];
                boardState[to.r][to.c] = originalDestPiece;
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function evaluateBoard() {
        let totalScore = 0;
        boardState.forEach(row => row.forEach(piece => {
            if (piece) totalScore += (piece.color === 'white' ? pieceValues[piece.type] : -pieceValues[piece.type]);
        }));
        return totalScore;
    }

    setupAndRender();
    chessBoardElement.addEventListener('click', handleSquareClick);
}
