// TO-DO List Application
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTodos();
        this.updateStats();
        this.setDefaultDueDate();
    }

    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addTodoBtn = document.getElementById('addTodo');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.dueDateInput = document.getElementById('dueDate');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Add some sample todos on first load
        if (this.todos.length === 0) {
            this.addSampleTodos();
        }
    }

    setDefaultDueDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.dueDateInput.value = tomorrow.toISOString().split('T')[0];
    }

    addSampleTodos() {
        const sampleTodos = [
            {
                id: Date.now() + 1,
                text: 'Welcome to your new TO-DO list! 🎉',
                completed: false,
                priority: 'high',
                dueDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                text: 'Click the checkbox to mark as complete',
                completed: false,
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                text: 'Use filters to organize your tasks',
                completed: false,
                priority: 'low',
                dueDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        ];

        this.todos = sampleTodos;
        this.saveTodos();
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: this.prioritySelect.value,
            dueDate: this.dueDateInput.value,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.todoInput.value = '';
        this.todoInput.focus();

        // Show success animation
        this.showNotification('Task added successfully! ✨');
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingId = id;
        this.todoInput.value = todo.text;
        this.prioritySelect.value = todo.priority;
        this.dueDateInput.value = todo.dueDate;
        this.addTodoBtn.innerHTML = '<i class="fas fa-save"></i>';
        this.addTodoBtn.onclick = () => this.saveEdit();
        
        this.todoInput.focus();
        this.todoInput.select();
    }

    saveEdit() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todoIndex = this.todos.findIndex(t => t.id === this.editingId);
        if (todoIndex === -1) return;

        this.todos[todoIndex].text = text;
        this.todos[todoIndex].priority = this.prioritySelect.value;
        this.todos[todoIndex].dueDate = this.dueDateInput.value;

        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        
        // Reset form
        this.todoInput.value = '';
        this.addTodoBtn.innerHTML = '<i class="fas fa-plus"></i>';
        this.addTodoBtn.onclick = () => this.addTodo();
        this.editingId = null;

        this.showNotification('Task updated successfully! ✏️');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification('Task deleted! 🗑️');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTodos();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.todoList.style.display = 'flex';
            this.emptyState.style.display = 'none';
            
            this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        }
    }

    createTodoHTML(todo) {
        const isOverdue = !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date();
        const dueDateClass = isOverdue ? 'overdue' : '';
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-header">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="todoApp.toggleTodo(${todo.id})"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-actions">
                        <button class="action-btn edit-btn" onclick="todoApp.editTodo(${todo.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="todoApp.deleteTodo(${todo.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="todo-meta">
                    <span class="todo-priority priority-${todo.priority}">
                        ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>
                    <span class="todo-due-date ${dueDateClass}">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(todo.dueDate)}
                        ${isOverdue ? ' (Overdue!)' : ''}
                    </span>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return 'No due date';
        
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;

        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Add some additional CSS for overdue items
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .overdue {
        color: #dc2626 !important;
        font-weight: 600;
    }
    
    .todo-item.overdue {
        border-left: 4px solid #dc2626;
    }
    
    .notification {
        font-family: 'Inter', sans-serif;
    }
`;
document.head.appendChild(additionalStyles);
