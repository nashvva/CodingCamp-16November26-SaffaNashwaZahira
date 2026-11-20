/* =============================================================
   Life Dashboard — app.js
   Features: Clock/Greeting, Focus Timer (custom duration),
             To-Do List (add/edit/delete/done/sort/no-duplicates),
             Quick Links, Custom Name, Light/Dark Mode
   Storage:  LocalStorage (all data client-side)
   ============================================================= */

/* ───────────────────────────────────────────────
   STORAGE HELPERS
─────────────────────────────────────────────── */
const store = {
  get(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

/* ───────────────────────────────────────────────
   TOAST
─────────────────────────────────────────────── */
let toastTimer = null;

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ───────────────────────────────────────────────
   CLOCK & GREETING
─────────────────────────────────────────────── */
const clockEl    = document.getElementById('clock');
const dateEl     = document.getElementById('date');
const greetingEl = document.getElementById('greeting');

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function updateClock() {
  const now  = new Date();
  const h    = String(now.getHours()).padStart(2, '0');
  const m    = String(now.getMinutes()).padStart(2, '0');
  const s    = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${h}:${m}:${s}`;

  const day   = DAYS[now.getDay()];
  const month = MONTHS[now.getMonth()];
  const date  = now.getDate();
  const year  = now.getFullYear();
  dateEl.textContent = `${day}, ${month} ${date}, ${year}`;

  const hour = now.getHours();
  let greet;
  if (hour >= 5 && hour < 12)       greet = 'Good Morning';
  else if (hour >= 12 && hour < 17) greet = 'Good Afternoon';
  else if (hour >= 17 && hour < 21) greet = 'Good Evening';
  else                               greet = 'Good Night';

  const name = store.get('userName', '');
  greetingEl.textContent = name ? `${greet}, ${name}! 👋` : `${greet}! 👋`;
}

setInterval(updateClock, 1000);
updateClock();

/* ───────────────────────────────────────────────
   CUSTOM NAME
─────────────────────────────────────────────── */
const displayNameEl  = document.getElementById('displayName');
const editNameBtn    = document.getElementById('editNameBtn');
const nameEditForm   = document.getElementById('nameEditForm');
const nameInput      = document.getElementById('nameInput');
const saveNameBtn    = document.getElementById('saveNameBtn');

function renderName() {
  const name = store.get('userName', '');
  displayNameEl.textContent = name ? `— ${name}` : 'Set your name…';
}

editNameBtn.addEventListener('click', () => {
  nameEditForm.classList.toggle('hidden');
  if (!nameEditForm.classList.contains('hidden')) {
    nameInput.value = store.get('userName', '');
    nameInput.focus();
  }
});

saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });

function saveName() {
  const name = nameInput.value.trim();
  store.set('userName', name);
  renderName();
  updateClock();
  nameEditForm.classList.add('hidden');
  if (name) showToast(`Welcome, ${name}! 🎉`);
}

renderName();

/* ───────────────────────────────────────────────
   FOCUS TIMER
─────────────────────────────────────────────── */
const timerDisplay   = document.getElementById('timerDisplay');
const startBtn       = document.getElementById('startBtn');
const stopBtn        = document.getElementById('stopBtn');
const resetBtn       = document.getElementById('resetBtn');
const timerMinInput  = document.getElementById('timerMinutes');
const applyDurationBtn = document.getElementById('applyDurationBtn');
const timerCard      = document.querySelector('.timer-card');

let timerDuration = store.get('timerDuration', 25) * 60; // seconds
let timeLeft      = timerDuration;
let timerInterval = null;
let timerRunning  = false;

timerMinInput.value = store.get('timerDuration', 25);

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerCard.classList.add('timer-running');
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerCard.classList.remove('timer-running');
      showToast('⏰ Focus session complete!');
      return;
    }
    timeLeft--;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerCard.classList.remove('timer-running');
}

function resetTimer() {
  stopTimer();
  timeLeft = timerDuration;
  renderTimer();
}

applyDurationBtn.addEventListener('click', () => {
  const val = parseInt(timerMinInput.value, 10);
  if (!val || val < 1 || val > 90) {
    showToast('Enter a duration between 1 and 90 minutes.');
    return;
  }
  stopTimer();
  timerDuration = val * 60;
  timeLeft = timerDuration;
  store.set('timerDuration', val);
  renderTimer();
  showToast(`Timer set to ${val} minutes ✅`);
});

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

renderTimer();

/* ───────────────────────────────────────────────
   TO-DO LIST
─────────────────────────────────────────────── */
const taskInput   = document.getElementById('taskInput');
const addTaskBtn  = document.getElementById('addTaskBtn');
const taskListEl  = document.getElementById('taskList');
const sortTasksBtn = document.getElementById('sortTasksBtn');

let tasks     = store.get('tasks', []);
let sortedAsc = false;

function saveTasks() {
  store.set('tasks', tasks);
}

function renderTasks() {
  taskListEl.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.index = index;

    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(index));

    const textSpan = document.createElement('span');
    textSpan.className   = 'task-text';
    textSpan.textContent = task.text;
    textSpan.title       = 'Double-click to edit';
    textSpan.addEventListener('dblclick', () => startEdit(index, li, textSpan));

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'btn btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(index));

    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(actions);
    taskListEl.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    showToast('Task cannot be empty.');
    return;
  }

  // Challenge: Prevent duplicate tasks (case-insensitive)
  const duplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    showToast('⚠️ Task already exists!');
    return;
  }

  tasks.push({ text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function startEdit(index, li, textSpan) {
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'task-edit-input';
  editInput.value     = tasks[index].text;
  editInput.maxLength = 100;

  li.replaceChild(editInput, textSpan);
  editInput.focus();
  editInput.select();

  function commitEdit() {
    const newText = editInput.value.trim();
    if (!newText) {
      showToast('Task cannot be empty.');
      renderTasks();
      return;
    }
    // Prevent duplicate on edit (exclude self)
    const duplicate = tasks.some((t, i) =>
      i !== index && t.text.toLowerCase() === newText.toLowerCase()
    );
    if (duplicate) {
      showToast('⚠️ Task already exists!');
      renderTasks();
      return;
    }
    tasks[index].text = newText;
    saveTasks();
    renderTasks();
  }

  editInput.addEventListener('blur', commitEdit);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { editInput.blur(); }
    if (e.key === 'Escape') { renderTasks(); }
  });
}

// Challenge: Sort tasks (incomplete first → alphabetical, done tasks at bottom)
sortTasksBtn.addEventListener('click', () => {
  sortedAsc = !sortedAsc;
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const cmp = a.text.localeCompare(b.text);
    return sortedAsc ? cmp : -cmp;
  });
  saveTasks();
  renderTasks();
  showToast(sortedAsc ? 'Sorted A → Z' : 'Sorted Z → A');
});

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

renderTasks();

/* ───────────────────────────────────────────────
   QUICK LINKS
─────────────────────────────────────────────── */
const linkNameInput = document.getElementById('linkName');
const linkUrlInput  = document.getElementById('linkUrl');
const addLinkBtn    = document.getElementById('addLinkBtn');
const linksListEl   = document.getElementById('linksList');

let links = store.get('quickLinks', [
  { name: 'Google',   url: 'https://google.com'   },
  { name: 'Gmail',    url: 'https://gmail.com'    },
  { name: 'Calendar', url: 'https://calendar.google.com' },
]);

function saveLinks() {
  store.set('quickLinks', links);
}

function renderLinks() {
  linksListEl.innerHTML = '';
  links.forEach((link, index) => {
    const a = document.createElement('a');
    a.className = 'link-chip';
    a.href      = link.url;
    a.target    = '_blank';
    a.rel       = 'noopener noreferrer';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = link.name;

    const removeBtn = document.createElement('button');
    removeBtn.className   = 'link-remove';
    removeBtn.textContent = '×';
    removeBtn.title       = 'Remove link';
    removeBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      removeLink(index);
    });

    a.appendChild(nameSpan);
    a.appendChild(removeBtn);
    linksListEl.appendChild(a);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();

  if (!name || !url) {
    showToast('Enter both a name and a URL.');
    return;
  }

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    new URL(url); // validate
  } catch {
    showToast('Please enter a valid URL.');
    return;
  }

  links.push({ name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

function removeLink(index) {
  links.splice(index, 1);
  saveLinks();
  renderLinks();
}

addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();

/* ───────────────────────────────────────────────
   LIGHT / DARK MODE  (Challenge)
─────────────────────────────────────────────── */
const themeToggleBtn = document.getElementById('themeToggle');
const html           = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeToggleBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  store.set('theme', next);
  applyTheme(next);
});

// Load saved theme or respect OS preference
const savedTheme = store.get('theme', null);
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}
