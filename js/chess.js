// All chess game logic will go in this file.

function initializeChessGame() {
    const chessBoardElement = document.getElementById('chess-board');
    if (!chessBoardElement) return;

    // Represents the board state. `null` for empty squares.
    // Piece objects will have { type: 'pawn', color: 'white' }
    let boardState = [];

    const initialBoardSetup = [
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
        ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
    ];

    const pieceUnicode = {
        'king': { 'white': '♔', 'black': '♚' },
        'queen': { 'white': '♕', 'black': '♛' },
        'rook': { 'white': '♖', 'black': '♜' },
        'bishop': { 'white': '♗', 'black': '♝' },
        'knight': { 'white': '♘', 'black': '♞' },
        'pawn': { 'white': '♙', 'black': '♟︎' },
    };

    function setupInitialBoard() {
        boardState = initialBoardSetup.map((row, rowIndex) => {
            const color = rowIndex < 2 ? 'black' : 'white';
            return row.map(pieceType => {
                if (pieceType) {
                    return { type: pieceType, color: color };
                }
                return null;
            });
        });
    }

    function renderBoard() {
        chessBoardElement.innerHTML = ''; // Clear the board

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('chess-square');
                square.dataset.row = row;
                square.dataset.col = col;

                const isLight = (row + col) % 2 === 0;
                square.classList.add(isLight ? 'light' : 'dark');

                const piece = boardState[row][col];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('chess-piece');
                    pieceElement.textContent = pieceUnicode[piece.type][piece.color];
                    pieceElement.style.color = piece.color === 'white' ? '#f0f0f0' : '#333';
                    square.appendChild(pieceElement);
                }

                chessBoardElement.appendChild(square);
            }
        }
    }

    let selectedSquare = null;
    let currentPlayer = 'white'; // White starts
    let isGameOver = false;

    function handleSquareClick(event) {
        if (isGameOver) return;
        const square = event.target.closest('.chess-square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = boardState[row] ? boardState[row][col] : null;

        if (selectedSquare) {
            const toRow = parseInt(square.dataset.row);
            const toCol = parseInt(square.dataset.col);
            const fromRow = parseInt(selectedSquare.square.dataset.row);
            const fromCol = parseInt(selectedSquare.square.dataset.col);

            const validMoves = getValidMoves(selectedSquare.piece, fromRow, fromCol);
            const isMoveValid = validMoves.some(move => move[0] === toRow && move[1] === toCol);

            if (isMoveValid) {
                movePiece(fromRow, fromCol, toRow, toCol);
            }

            clearHighlights();
            selectedSquare = null;
        } else if (piece && piece.color === currentPlayer) {
            // This is the first click (select)
            selectPiece(square, piece);
        }
    }

    function selectPiece(square, piece) {
        clearHighlights();
        selectedSquare = { square, piece };
        square.classList.add('selected');

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const validMoves = getValidMoves(piece, row, col);
        highlightValidMoves(validMoves);
    }

    function clearHighlights() {
        document.querySelectorAll('.chess-square.selected').forEach(s => s.classList.remove('selected'));
        document.querySelectorAll('.chess-square.valid-move').forEach(s => s.classList.remove('valid-move'));
    }

    setupInitialBoard();
    renderBoard();
    chessBoardElement.addEventListener('click', handleSquareClick);

    function getValidMoves(piece, r, c) {
        const pseudoLegalMoves = getPseudoLegalMoves(piece, r, c);
        const legalMoves = [];

        for (const move of pseudoLegalMoves) {
            const [toR, toC] = move;

            // Temporarily make the move on the board state
            const originalPieceAtDest = boardState[toR][toC];
            boardState[toR][toC] = piece;
            boardState[r][c] = null;

            // Check if the king of the same color is in check
            if (!isKingInCheck(piece.color)) {
                legalMoves.push(move);
            }

            // Undo the move
            boardState[r][c] = piece;
            boardState[toR][toC] = originalPieceAtDest;
        }
        return legalMoves;
    }

    function getPseudoLegalMoves(piece, r, c) {
        if (!piece) return [];

        switch (piece.type) {
            case 'rook':
                return getValidRookMoves(r, c, piece.color);
            case 'knight':
                return getValidKnightMoves(r, c, piece.color);
            case 'bishop':
                return getValidBishopMoves(r, c, piece.color);
            case 'queen':
                return getValidQueenMoves(r, c, piece.color);
            case 'king':
                return getValidKingMoves(r, c, piece.color);
            case 'pawn':
                return getValidPawnMoves(r, c, piece.color);
            default:
                return [];
        }
    }

    function getValidRookMoves(r, c, color) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newR = r + i * dr;
                const newC = c + i * dc;

                if (newR < 0 || newR >= 8 || newC < 0 || newC >= 8) break; // Off board

                const pieceAtDest = boardState[newR][newC];
                if (pieceAtDest) {
                    if (pieceAtDest.color !== color) {
                        moves.push([newR, newC]); // Can capture
                    }
                    break; // Blocked
                }
                moves.push([newR, newC]); // Empty square
            }
        }
        return moves;
    }

    function highlightValidMoves(moves) {
        moves.forEach(([r, c]) => {
            const square = document.querySelector(`.chess-square[data-row='${r}'][data-col='${c}']`);
            if (square) {
                square.classList.add('valid-move');
            }
        });
    }

    function movePiece(fromR, fromC, toR, toC) {
        const piece = boardState[fromR][fromC];
        boardState[toR][toC] = piece;
        boardState[fromR][fromC] = null;

        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';

        updateStatus();
        updateBoardView(fromR, fromC, toR, toC);
        checkGameState();
    }

    function updateStatus() {
        const gameStatusElement = document.getElementById('chess-status');
        if (gameStatusElement) {
            let statusText = `Turn: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;

            // Remove previous check highlight
            document.querySelectorAll('.in-check').forEach(s => s.classList.remove('in-check'));

            if (isKingInCheck(currentPlayer)) {
                statusText += ' - Check!';
                const kingPos = findKing(currentPlayer);
                if (kingPos) {
                    const kingSquare = document.querySelector(`.chess-square[data-row='${kingPos.r}'][data-col='${kingPos.c}']`);
                    if (kingSquare) {
                        kingSquare.classList.add('in-check');
                    }
                }
            }
            gameStatusElement.textContent = statusText;
        }
    }

    function updateBoardView(fromR, fromC, toR, toC) {
        const fromSquare = document.querySelector(`.chess-square[data-row='${fromR}'][data-col='${fromC}']`);
        const toSquare = document.querySelector(`.chess-square[data-row='${toR}'][data-col='${toC}']`);

        const pieceElement = fromSquare.querySelector('.chess-piece');

        // Clear the destination square of any existing piece (capture)
        if (toSquare.firstChild) {
            toSquare.innerHTML = '';
        }

        if (pieceElement) {
            toSquare.appendChild(pieceElement);
        }
    }

    function getValidKnightMoves(r, c, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of knightMoves) {
            const newR = r + dr;
            const newC = c + dc;

            if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
                const pieceAtDest = boardState[newR][newC];
                if (!pieceAtDest || pieceAtDest.color !== color) {
                    moves.push([newR, newC]);
                }
            }
        }
        return moves;
    }

    function getValidBishopMoves(r, c, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // diagonal

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newR = r + i * dr;
                const newC = c + i * dc;

                if (newR < 0 || newR >= 8 || newC < 0 || newC >= 8) break;

                const pieceAtDest = boardState[newR][newC];
                if (pieceAtDest) {
                    if (pieceAtDest.color !== color) {
                        moves.push([newR, newC]);
                    }
                    break;
                }
                moves.push([newR, newC]);
            }
        }
        return moves;
    }

    function getValidQueenMoves(r, c, color) {
        const rookMoves = getValidRookMoves(r, c, color);
        const bishopMoves = getValidBishopMoves(r, c, color);
        return [...rookMoves, ...bishopMoves];
    }

    function getValidKingMoves(r, c, color) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of kingMoves) {
            const newR = r + dr;
            const newC = c + dc;

            if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
                const pieceAtDest = boardState[newR][newC];
                if (!pieceAtDest || pieceAtDest.color !== color) {
                    moves.push([newR, newC]);
                }
            }
        }
        return moves;
    }

    function getValidPawnMoves(r, c, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // 1. Forward move
        const oneStep = r + direction;
        if (oneStep >= 0 && oneStep < 8 && !boardState[oneStep][c]) {
            moves.push([oneStep, c]);

            // 2. Two-step forward move from start
            if (r === startRow) {
                const twoSteps = r + 2 * direction;
                if (!boardState[twoSteps][c]) {
                    moves.push([twoSteps, c]);
                }
            }
        }

        // 3. Captures
        const captureCols = [c - 1, c + 1];
        for (const capC of captureCols) {
            if (capC >= 0 && capC < 8) {
                const pieceAtDest = boardState[oneStep] ? boardState[oneStep][capC] : undefined;
                if (pieceAtDest && pieceAtDest.color !== color) {
                    moves.push([oneStep, capC]);
                }
            }
        }

        return moves;
    }

    function checkGameState() {
        const hasLegalMoves = playerHasLegalMoves(currentPlayer);

        if (!hasLegalMoves) {
            isGameOver = true;
            if (isKingInCheck(currentPlayer)) {
                updateStatus(`Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins.`);
            } else {
                updateStatus('Stalemate! The game is a draw.');
            }
        }
    }

    function playerHasLegalMoves(playerColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && piece.color === playerColor) {
                    const moves = getValidMoves(piece, r, c);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function isKingInCheck(kingColor) {
        const kingPos = findKing(kingColor);
        if (!kingPos) return false;

        const opponentColor = kingColor === 'white' ? 'black' : 'white';

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && piece.color === opponentColor) {
                    const moves = getPseudoLegalMoves(piece, r, c);
                    if (moves.some(move => move[0] === kingPos.r && move[1] === kingPos.c)) {
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
                const piece = boardState[r][c];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { r, c };
                }
            }
        }
        return null;
    }
}
