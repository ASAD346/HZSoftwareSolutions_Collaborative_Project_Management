const API_URL = 'http://localhost:5000/api';

// State
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentToken = localStorage.getItem('token') || null;
let currentProject = null;

// DOM Elements
const views = {
    auth: document.getElementById('auth-container'),
    dashboard: document.getElementById('dashboard-view'),
    board: document.getElementById('board-view')
};

const navbar = document.getElementById('navbar');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const modalOverlay = document.getElementById('modal-overlay');

function toggleModal(modal, show = true) {
    if (show) {
        modalOverlay.classList.remove('hidden');
        modal.classList.remove('hidden');
    } else {
        modalOverlay.classList.add('hidden');
        modal.classList.add('hidden');
    }
}

// --- Initialization ---
function init() {
    if (currentUser && currentToken) {
        showDashboard();
    } else {
        showAuth();
    }
}

// --- Navigation & View Switching ---
function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');

    if (viewName === 'auth') {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
        userDisplay.textContent = `Hello, ${currentUser.username}`;
    }
}

function showAuth() {
    switchView('auth');
}

function showDashboard() {
    switchView('dashboard');
    loadProjects();
}

async function showBoard(projectId) {
    switchView('board');
    await loadBoardData(projectId);
}

// --- Authentication ---
document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            loginUser(data);
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Login failed');
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            document.getElementById('show-login').click();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Registration failed');
    }
});

function loginUser(data) {
    currentUser = data.user;
    currentToken = data.token;
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('token', currentToken);
    showDashboard();
}

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showAuth();
});

// --- Projects ---
async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '<p>Loading projects...</p>';

    try {
        const res = await fetch(`${API_URL}/projects`, {
            headers: { 'x-auth-token': currentToken }
        });
        const projects = await res.json();

        grid.innerHTML = '';
        if (projects.length === 0) {
            grid.innerHTML = '<p>No projects found. Create one!</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description || 'No description'}</p>
                <div class="project-meta">
                    <span>Owner: ${project.owner_name}</span>
                </div>
            `;
            card.addEventListener('click', () => showBoard(project.id));
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = '<p>Error loading projects</p>';
    }
}

// Create Project Modal
const createProjectModal = document.getElementById('create-project-modal');
document.getElementById('new-project-btn').addEventListener('click', () => {
    toggleModal(createProjectModal, true);
});

document.getElementById('create-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-project-name').value;
    const description = document.getElementById('new-project-desc').value;

    try {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': currentToken
            },
            body: JSON.stringify({ name, description })
        });

        if (res.ok) {
            toggleModal(createProjectModal, false);
            loadProjects();
            e.target.reset();
        } else {
            alert('Failed to create project');
        }
    } catch (err) {
        console.error(err);
    }
});

// --- Board & Tasks ---
async function loadBoardData(projectId) {
    document.getElementById('board-columns').innerHTML = 'Loading board...';

    try {
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
            headers: { 'x-auth-token': currentToken }
        });

        if (!res.ok) throw new Error('Failed to load project');

        const data = await res.json();
        currentProject = data.project;
        document.getElementById('board-title').textContent = currentProject.name;

        renderBoard(data.columns, data.tasks);
    } catch (err) {
        alert(err.message);
        showDashboard();
    }
}

function renderBoard(columns, tasks) {
    const boardContainer = document.getElementById('board-columns');
    boardContainer.innerHTML = '';

    columns.forEach(col => {
        const colEl = document.createElement('div');
        colEl.className = 'column';
        colEl.setAttribute('data-id', col.id);

        // Filter tasks for this column
        const colTasks = tasks.filter(t => t.column_id === col.id);

        colEl.innerHTML = `
            <div class="column-header">
                <span>${col.name}</span>
                <span class="badge">${colTasks.length}</span>
            </div>
            <div class="task-list" id="col-${col.id}" ondragover="allowDrop(event)" ondrop="drop(event, ${col.id})">
                ${colTasks.map(t => createTaskHTML(t)).join('')}
            </div>
            <button class="add-task-btn" onclick="openCreateTaskModal(${col.id})">+ Add Task</button>
        `;
        boardContainer.appendChild(colEl);
    });

    // Re-attach event listeners for task clicks
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('dragstart', drag);
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.task-card-meta')) { // Avoid clicking if verifying meta
                openTaskDetails(card.dataset.id);
            }
        });
    });
}

function createTaskHTML(task) {
    return `
        <div class="task-card" draggable="true" data-id="${task.id}" id="task-${task.id}">
            <h4>${task.title}</h4>
            <div class="task-card-meta">
                <span>${task.assignee_name || 'Unassigned'}</span>
                ${task.due_date ? `<span>${new Date(task.due_date).toLocaleDateString()}</span>` : ''}
            </div>
        </div>
    `;
}

// Drag and Drop
function allowDrop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.dataset.id);
}

async function drop(ev, columnId) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const taskId = ev.dataTransfer.getData("text/plain");

    // Optimistic UI Update
    const taskCard = document.getElementById(`task-${taskId}`);
    ev.currentTarget.appendChild(taskCard);

    // API Call
    try {
        await fetch(`${API_URL}/tasks/${taskId}/move`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': currentToken
            },
            body: JSON.stringify({ column_id: columnId })
        });
    } catch (err) {
        console.error('Failed to move task', err);
        // Revert UI if needed (omitted for simplicity)
    }
}

document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('dragleave', (e) => {
        e.currentTarget.classList.remove('drag-over');
    });
});

// Create Task
const createTaskModal = document.getElementById('create-task-modal');
window.openCreateTaskModal = (columnId) => {
    document.getElementById('new-task-column-id').value = columnId;
    toggleModal(createTaskModal, true);
};

document.getElementById('create-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const columnId = document.getElementById('new-task-column-id').value;
    const title = document.getElementById('new-task-title').value;
    const desc = document.getElementById('new-task-desc').value;

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': currentToken
            },
            body: JSON.stringify({
                project_id: currentProject.id,
                column_id: columnId,
                title,
                description: desc
            })
        });

        if (res.ok) {
            toggleModal(createTaskModal, false);
            loadBoardData(currentProject.id); // Reload board
            e.target.reset();
        }
    } catch (err) {
        alert('Failed to create task');
    }
});

// Task Details & Comments
const taskModal = document.getElementById('task-modal');
async function openTaskDetails(taskId) {
    // 1. Fetch task details (we check logic from loaded tasks or fetch fresh)
    // For simplicity, we just fetch comments and use partial data or re-fetch details if needed.
    // Let's assume we need to show comments.

    // Find task in UI basics
    const taskCard = document.getElementById(`task-${taskId}`);
    const title = taskCard.querySelector('h4').textContent;

    document.getElementById('modal-task-title').textContent = title;
    document.getElementById('modal-task-desc').textContent = "Loading details...";
    toggleModal(taskModal, true);

    // Load comments
    loadComments(taskId);

    // Setup comment form
    const commentForm = document.getElementById('comment-form');
    commentForm.onsubmit = async (e) => {
        e.preventDefault();
        const content = document.getElementById('new-comment-input').value;
        await addComment(taskId, content);
        document.getElementById('new-comment-input').value = '';
    };
}

async function loadComments(taskId) {
    const list = document.getElementById('comments-list');
    list.innerHTML = 'Loading comments...';

    try {
        const res = await fetch(`${API_URL}/comments/task/${taskId}`, {
            headers: { 'x-auth-token': currentToken }
        });
        const comments = await res.json();

        list.innerHTML = '';
        comments.forEach(c => {
            const el = document.createElement('div');
            el.className = 'comment';
            el.innerHTML = `
                <div class="comment-author">${c.username}</div>
                <div>${c.content}</div>
            `;
            list.appendChild(el);
        });
    } catch (err) {
        list.innerHTML = 'Error loading comments';
    }
}

async function addComment(taskId, content) {
    try {
        await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': currentToken
            },
            body: JSON.stringify({ task_id: taskId, content })
        });
        loadComments(taskId);
    } catch (err) {
        alert('Failed to add comment');
    }
}

// Utility
document.getElementById('back-to-dashboard').addEventListener('click', showDashboard);

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        toggleModal(e.target.closest('.modal'), false);
    });
    // Also close on background click?
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        document.querySelectorAll('.modal:not(.hidden)').forEach(m => toggleModal(m, false));
    }
});

// Init
init();
