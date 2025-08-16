document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');

    async function fetchGitHubProjects() {
        if (!projectsContainer) {
            console.error('Projects container not found');
            return;
        }

        try {
            const response = await fetch('https://api.github.com/users/mononeer/repos?sort=pushed&per_page=6');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const projects = await response.json();

            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p>No public projects found.</p>';
                return;
            }

            projectsContainer.classList.add('gallery-container');
            const projectsHTML = projects.map(project => `
                <a href="/project-detail/?repo=${project.name}" class="gallery-item">
                    <h3>${project.name}</h3>
                    <p>${project.description || 'No description available.'}</p>
                    <div class="project-footer">
                        <span>${project.language ? `Language: ${project.language}` : ''}</span>
                        <span>⭐ ${project.stargazers_count}</span>
                    </div>
                </a>
            `).join('');

            projectsContainer.innerHTML = projectsHTML;

        } catch (error) {
            console.error('Error fetching GitHub projects:', error);
            projectsContainer.innerHTML = '<p>Could not fetch projects from GitHub. Please try again later.</p>';
        }
    }

    fetchGitHubProjects();
    initializeTttGame();
    if (typeof initializeChessGame === 'function') {
        initializeChessGame();
    }
    initializeCalculator();
    initializeSearch();
});

// --- Tic-Tac-Toe Game Logic ---
function initializeTttGame() {
    const tttBoard = document.getElementById('tic-tac-toe-board');
    const tttStatus = document.getElementById('tic-tac-toe-status');
    const tttRestartBtn = document.getElementById('tic-tac-toe-restart');

    if (!tttBoard || !tttStatus || !tttRestartBtn) {
        return; // Don't run if elements aren't on the page
    }

    let tttState = ['', '', '', '', '', '', '', '', ''];
    let tttCurrentPlayer = 'X';
    let tttGameActive = true;

    const tttWinningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (tttState[clickedCellIndex] !== '' || !tttGameActive) {
            return;
        }

        tttState[clickedCellIndex] = tttCurrentPlayer;
        clickedCell.textContent = tttCurrentPlayer;
        handleResultValidation();
    }

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i < tttWinningConditions.length; i++) {
            const winCondition = tttWinningConditions[i];
            let a = tttState[winCondition[0]];
            let b = tttState[winCondition[1]];
            let c = tttState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            tttStatus.textContent = `Player ${tttCurrentPlayer} has won!`;
            tttGameActive = false;
            return;
        }

        if (!tttState.includes('')) {
            tttStatus.textContent = `Game ended in a draw!`;
            tttGameActive = false;
            return;
        }

        tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
        tttStatus.textContent = `It's ${tttCurrentPlayer}'s turn`;
    }

    function restartTttGame() {
        tttState = ['', '', '', '', '', '', '', '', ''];
        tttGameActive = true;
        tttCurrentPlayer = 'X';
        tttStatus.textContent = `It's ${tttCurrentPlayer}'s turn`;
        document.querySelectorAll('.tic-tac-toe-cell').forEach(cell => cell.textContent = '');
    }

    function setupBoard() {
        tttBoard.innerHTML = ''; // Clear board
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tic-tac-toe-cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            tttBoard.appendChild(cell);
        }
        tttStatus.textContent = `It's ${tttCurrentPlayer}'s turn`;
        tttRestartBtn.addEventListener('click', restartTttGame);
    }

    setupBoard();
}

// Chess logic is now in js/chess.js

// --- Calculator Logic ---
function initializeCalculator() {
    const calculator = document.querySelector('.calculator');
    if (!calculator) return;

    const display = calculator.querySelector('.calculator-display');
    const keys = calculator.querySelector('.calculator-keys');

    let state = {
        displayValue: '0',
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
    };

    function updateDisplay() {
        display.textContent = state.displayValue;
    }

    updateDisplay();

    function handleKeyClick(e) {
        const key = e.target;
        const action = key.dataset.action;
        const number = key.dataset.number;

        if (number) {
            inputDigit(number);
        } else if (action) {
            handleAction(action);
        }
        updateDisplay();
    }

    function inputDigit(digit) {
        if (state.waitingForSecondOperand) {
            state.displayValue = digit;
            state.waitingForSecondOperand = false;
        } else {
            state.displayValue = state.displayValue === '0' ? digit : state.displayValue + digit;
        }
    }

    function handleAction(action) {
        switch (action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                handleOperator(action);
                break;
            case 'decimal':
                inputDecimal();
                break;
            case 'clear':
                clear();
                break;
            case 'calculate':
                calculate();
                break;
            case 'sign':
                toggleSign();
                break;
            case 'percent':
                inputPercent();
                break;
        }
    }

    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = state;
        const inputValue = parseFloat(displayValue);

        if (operator && state.waitingForSecondOperand) {
            state.operator = nextOperator;
            return;
        }

        if (firstOperand === null && !isNaN(inputValue)) {
            state.firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation(firstOperand, inputValue, operator);
            state.displayValue = `${parseFloat(result.toFixed(7))}`;
            state.firstOperand = result;
        }

        state.waitingForSecondOperand = true;
        state.operator = nextOperator;
    }

    const performCalculation = (first, second, op) => {
        const opMap = {
            add: (a, b) => a + b,
            subtract: (a, b) => a - b,
            multiply: (a, b) => a * b,
            divide: (a, b) => a / b,
        };
        return opMap[op](first, second);
    };

    function inputDecimal() {
        if (!state.displayValue.includes('.')) {
            state.displayValue += '.';
        }
    }

    function clear() {
        state.displayValue = '0';
        state.firstOperand = null;
        state.operator = null;
        state.waitingForSecondOperand = false;
    }

    function calculate() {
        const { firstOperand, displayValue, operator } = state;
        if (operator && !state.waitingForSecondOperand) {
            const secondOperand = parseFloat(displayValue);
            const result = performCalculation(firstOperand, secondOperand, operator);
            state.displayValue = `${parseFloat(result.toFixed(7))}`;
            state.firstOperand = result; // for chaining operations
            state.operator = null;
            state.waitingForSecondOperand = true; // wait for new number
        }
    }

    function toggleSign() {
        state.displayValue = (parseFloat(state.displayValue) * -1).toString();
    }

    function inputPercent() {
        state.displayValue = (parseFloat(state.displayValue) / 100).toString();
    }

    keys.addEventListener('click', handleKeyClick);
}

// --- Search Logic ---
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchContext = document.querySelector('main');

    if (!searchInput || !searchContext) return;

    function performSearch() {
        const keyword = searchInput.value;
        // Re-create the Mark instance on each search to handle dynamic content
        const markInstance = new Mark(searchContext);

        // Unmark previous searches and then mark the new keyword
        markInstance.unmark({
            done: () => {
                if (keyword.length > 1) { // Only search for keywords longer than 1 character
                    markInstance.mark(keyword, {
                        separateWordSearch: true,
                        accuracy: "partially"
                    });
                }
            }
        });
    }

    // Debounce the search function to avoid performance issues on every keystroke
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300); // Wait 300ms after user stops typing
    });
}
