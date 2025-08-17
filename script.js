// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');

// App State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    updateTaskCount();
    updateEmptyState();
});

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Functions
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showNotification('Please enter a task!', 'error');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(newTask);
    saveToLocalStorage();
    renderTodos();
    updateTaskCount();
    updateEmptyState();
    
    taskInput.value = '';
    taskInput.focus();
    
    showNotification('Task added successfully!', 'success');
}

function toggleTask(id) {
    const task = todos.find(todo => todo.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTodos();
        updateTaskCount();
    }
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    taskElement.classList.add('removing');
    
    setTimeout(() => {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
        updateTaskCount();
        updateEmptyState();
        showNotification('Task deleted!', 'info');
    }, 300);
}

function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to clear!', 'info');
        return;
    }
    
    todos = todos.filter(todo => !todo.completed);
    saveToLocalStorage();
    renderTodos();
    updateTaskCount();
    showNotification(`${completedCount} completed task(s) cleared!`, 'success');
}

function renderTodos() {
    let filteredTodos = todos;
    
    // Apply filter
    switch (currentFilter) {
        case 'active':
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(todo => todo.completed);
            break;
        default:
            filteredTodos = todos;
    }
    
    todoList.innerHTML = '';
    
    filteredTodos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

function createTodoElement(todo) {
    const todoItem = document.createElement('div');
    todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    todoItem.dataset.id = todo.id;
    
    todoItem.innerHTML = `
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTask(${todo.id})"></div>
        <div class="todo-text">${escapeHtml(todo.text)}</div>
        <button class="delete-btn" onclick="deleteTask(${todo.id})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return todoItem;
}

function updateTaskCount() {
    const activeTasks = todos.filter(todo => !todo.completed).length;
    const totalTasks = todos.length;
    
    if (totalTasks === 0) {
        taskCount.textContent = 'No tasks';
    } else if (activeTasks === 0) {
        taskCount.textContent = 'All tasks completed!';
    } else {
        taskCount.textContent = `${activeTasks} of ${totalTasks} task${totalTasks !== 1 ? 's' : ''} remaining`;
    }
}

function updateEmptyState() {
    const hasTasks = todos.length > 0;
    const hasFilteredTasks = getFilteredTodos().length > 0;
    
    if (!hasTasks) {
        emptyState.classList.add('show');
        todoList.style.display = 'none';
    } else if (!hasFilteredTasks) {
        emptyState.classList.add('show');
        todoList.style.display = 'none';
        emptyState.innerHTML = `
            <i class="fas fa-filter"></i>
            <h3>No ${currentFilter} tasks!</h3>
            <p>Try changing the filter or add new tasks.</p>
        `;
    } else {
        emptyState.classList.remove('show');
        todoList.style.display = 'block';
    }
}

function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        addTask();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        taskInput.value = '';
        taskInput.blur();
    }
});

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
}); 