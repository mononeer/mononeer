document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Load todos from local storage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.textContent = todo.text;
            li.classList.toggle('completed', todo.completed);
            li.dataset.index = index;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');

            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    }

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            todos.push({ text: text, completed: false });
            todoInput.value = '';
            saveTodos();
            renderTodos();
        }
    });

    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const index = target.closest('li')?.dataset.index;

        if (index === undefined) return;

        if (target.classList.contains('delete-btn')) {
            todos.splice(index, 1);
        } else {
            todos[index].completed = !todos[index].completed;
        }

        saveTodos();
        renderTodos();
    });

    renderTodos();
});
