document.addEventListener('DOMContentLoaded', () => {
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
            state.firstOperand = null;
            state.operator = null;
            state.waitingForSecondOperand = false;
        }
    }

    function toggleSign() {
        state.displayValue = (parseFloat(state.displayValue) * -1).toString();
    }

    function inputPercent() {
        state.displayValue = (parseFloat(state.displayValue) / 100).toString();
    }

    keys.addEventListener('click', handleKeyClick);
});
