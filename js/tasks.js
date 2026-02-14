// ============================================================
// ROUTINE OS — Tasks (CRUD, Trackable, Rendering)
// ============================================================

function toggleTrackableFields(prefix) {
    const cb = document.getElementById(prefix + 'Trackable');
    const fields = document.getElementById(prefix + 'TrackableFields');
    if (cb && fields) fields.style.display = cb.checked ? 'block' : 'none';
}

function getTrackCurrent(task, today) {
    if (!task.trackable) return 0;
    if (!task.trackProgress) task.trackProgress = {};
    return task.trackProgress[today] || 0;
}

function trackIncrement(taskId, amount) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.trackable) return;
    const today = formatDateKey(new Date());
    if (!task.trackProgress) task.trackProgress = {};
    task.trackProgress[today] = Math.max(0, (task.trackProgress[today] || 0) + amount);
    if (task.trackProgress[today] >= task.trackTarget) task.completed = true;
    saveData();
    renderTasks();
}

function trackReset(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.trackable) return;
    const today = formatDateKey(new Date());
    if (!task.trackProgress) task.trackProgress = {};
    task.trackProgress[today] = 0;
    task.completed = false;
    saveData();
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('tasksList');
    const today = formatDateKey(new Date());
    const todayTasks = tasks.filter(task => task.date === today || task.type === 'recurring');

    if (todayTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <p>No tasks for today</p>
            </div>
        `;
        return;
    }

    container.innerHTML = todayTasks.map(task => {
        const skipped = task.skippedDates && task.skippedDates.includes(today);
        const taskClass = skipped ? 'task-skipped' : task.completed ? 'task-done' : '';
        const isSkipped = skipped;
        const cur = getTrackCurrent(task, today);
        const pct = task.trackable ? Math.min(100, Math.round((cur / task.trackTarget) * 100)) : 0;
        const trackHtml = task.trackable ? `
            <div class="track-bar"><div class="track-fill" style="width:${pct}%"></div></div>
            <div class="track-info"><span>${cur} / ${task.trackTarget} ${task.trackUnit || ''}</span><span>${pct}%</span></div>
            <div class="track-btns">
                <button class="track-btn" onclick="trackIncrement('${task.id}', ${task.trackIncrement || 1})">+${task.trackIncrement || 1} ${task.trackUnit || ''}</button>
                <button class="track-btn" onclick="trackIncrement('${task.id}', -${task.trackIncrement || 1})">-${task.trackIncrement || 1}</button>
                <button class="track-btn reset" onclick="trackReset('${task.id}')">Reset</button>
            </div>
        ` : '';
        return `
        <div class="event-item ${taskClass}">
            <div class="task-content" style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:8px">
                    <div class="task-title" style="font-size:14px;font-weight:500">${task.title}</div>
                    ${task.type === 'recurring' ? '<span style="font-size:9px;color:#a855f7;background:rgba(168,85,247,.1);padding:2px 6px;border-radius:4px;font-weight:600">DAILY</span>' : ''}
                </div>
                ${task.description ? `<div style="font-size:12px;color:#9ca3af;margin-top:2px">${task.description}</div>` : ''}
                ${trackHtml}
                ${isSkipped ? '<span style="font-size:9px;color:#f59e0b;background:rgba(245,158,11,.1);padding:2px 6px;border-radius:4px;font-weight:600;margin-top:4px;display:inline-block">SKIPPED</span>' : ''}
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
                <button class="del-btn" style="background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.3);color:#60a5fa" onclick="openEditTask('${task.id}')" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="2"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button class="del-btn" style="background:${task.completed ? 'rgba(34,197,94,.15)' : 'rgba(34,197,94,.08)'};border-color:${task.completed ? '#22c55e' : 'rgba(34,197,94,.3)'};color:#22c55e" onclick="toggleTask('${task.id}')" title="${task.completed ? 'Undo' : 'Complete'}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">${task.completed ? '<path d="M3 12h18" stroke="currentColor" stroke-width="2"/>' : '<path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'}</svg>
                </button>
                <button class="del-btn" style="background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.3);color:#f59e0b" onclick="skipTask('${task.id}')" title="Skip today">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button class="del-btn" onclick="deleteTask('${task.id}')" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
                </button>
            </div>
        </div>
    `;}).join('');
}

function addTask() {
    document.getElementById('taskModal').classList.add('open');
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskTrackable').checked = false;
    document.getElementById('taskTrackableFields').style.display = 'none';
    document.getElementById('taskTarget').value = '';
    document.getElementById('taskUnit').value = '';
    document.getElementById('taskIncrement').value = '';
    selectedTaskType = 'onetime';
    document.querySelectorAll('#taskForm .tbtn').forEach(b => b.classList.remove('on'));
    const defaultTaskBtn = document.querySelector('#taskForm .tbtn[data-type="onetime"]');
    if (defaultTaskBtn) defaultTaskBtn.classList.add('on');
    document.getElementById('taskTitle').focus();
}

function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const taskType = getSelectedType('#taskForm');
    const isTrackable = document.getElementById('taskTrackable').checked;

    const task = {
        id: Date.now().toString(),
        title,
        description: document.getElementById('taskDesc').value.trim(),
        completed: false,
        date: formatDateKey(new Date()),
        type: taskType,
        trackable: isTrackable
    };

    if (isTrackable) {
        task.trackTarget = parseFloat(document.getElementById('taskTarget').value) || 1;
        task.trackUnit = document.getElementById('taskUnit').value.trim() || '';
        task.trackIncrement = parseFloat(document.getElementById('taskIncrement').value) || 1;
        task.trackProgress = {};
    }

    tasks.push(task);
    saveData();
    renderTasks();
    closeAll();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
    }
}

function skipTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        if (!task.skippedDates) task.skippedDates = [];
        const today = formatDateKey(new Date());
        if (!task.skippedDates.includes(today)) {
            task.skippedDates.push(today);
        }
        saveData();
        renderTasks();
    }
}

function deleteTask(taskId) {
    if (confirm('Delete this task permanently?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveData();
        renderTasks();
    }
}

function openEditTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId;
    document.getElementById('editTaskTitle').value = task.title || '';
    document.getElementById('editTaskDesc').value = task.description || '';
    document.querySelectorAll('#editTaskForm .tbtn').forEach(b => b.classList.remove('on'));
    const selectedBtn = document.querySelector(`#editTaskForm .tbtn[data-type="${task.type || 'onetime'}"]`);
    if (selectedBtn) selectedBtn.classList.add('on');
    const trackCb = document.getElementById('editTaskTrackable');
    trackCb.checked = !!task.trackable;
    document.getElementById('editTaskTrackableFields').style.display = task.trackable ? 'block' : 'none';
    document.getElementById('editTaskTarget').value = task.trackTarget || '';
    document.getElementById('editTaskUnit').value = task.trackUnit || '';
    document.getElementById('editTaskIncrement').value = task.trackIncrement || '';
    document.getElementById('editTaskModal').classList.add('open');
    document.getElementById('editTaskTitle').focus();
}

function saveEditTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;
    const title = document.getElementById('editTaskTitle').value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    const desc = document.getElementById('editTaskDesc').value.trim();
    const taskType = getSelectedType('#editTaskForm');
    const isTrackable = document.getElementById('editTaskTrackable').checked;

    task.title = title;
    task.description = desc;
    task.type = taskType;
    task.trackable = isTrackable;

    if (isTrackable) {
        task.trackTarget = parseFloat(document.getElementById('editTaskTarget').value) || 1;
        task.trackUnit = document.getElementById('editTaskUnit').value.trim() || '';
        task.trackIncrement = parseFloat(document.getElementById('editTaskIncrement').value) || 1;
        if (!task.trackProgress) task.trackProgress = {};
    } else {
        delete task.trackTarget;
        delete task.trackUnit;
        delete task.trackIncrement;
        delete task.trackProgress;
    }

    saveData();
    renderTasks();
    closeAll();
}

function pickTaskType(btn) {
    selectedTaskType = btn.dataset.type;
    document.querySelectorAll('#taskForm .tbtn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
}

function pickEditTaskType(btn) {
    if (!editingTaskId) return;
    const modal = document.getElementById('editTaskForm');
    modal.querySelectorAll('.tbtn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
}
