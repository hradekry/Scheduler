// ============================================================
// ROUTINE OS — App Init, Context Switching, Modals, Voice
// ============================================================

// ---- CONTEXT SWITCHING ----

function setContext(context) {
    currentContext = context;
    saveData();

    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });
    const activeView = document.getElementById(context + 'View');
    if (activeView) activeView.classList.add('active');

    const ctx = CONTEXTS[context];
    document.getElementById('contextTitle').textContent = ctx.title;
    document.getElementById('contextSubtitle').textContent = ctx.subtitle;
    document.getElementById('contextIcon').innerHTML = ctx.icon;

    renderContextContent(context);
}

function cycleContext() {
    const idx = CONTEXT_ORDER.indexOf(currentContext);
    const next = CONTEXT_ORDER[(idx + 1) % CONTEXT_ORDER.length];
    setContext(next);
}

function renderContextContent(context) {
    switch(context) {
        case 'calendar':
            renderCalendar();
            renderEvents();
            updateDateDisplay();
            break;
        case 'tasks':
            renderTasks();
            break;
        case 'coach':
            renderCoachLog();
            break;
    }
}

// ---- MODALS ----

function closeAll() {
    document.querySelectorAll('.overlay').forEach(o => o.classList.remove('open'));
    const ef = document.getElementById('eventForm');
    if (ef) ef.reset();
    const tf = document.getElementById('taskForm');
    if (tf) tf.reset();
    const etf = document.getElementById('editTaskForm');
    if (etf) etf.reset();
    selectedEventType = 'onetime';
    selectedTaskType = 'onetime';
    document.querySelectorAll('#eventForm .tbtn').forEach(b => b.classList.remove('on'));
    const defaultEventBtn = document.querySelector('#eventForm .tbtn[data-type="onetime"]');
    if (defaultEventBtn) defaultEventBtn.classList.add('on');
    document.querySelectorAll('#taskForm .tbtn').forEach(b => b.classList.remove('on'));
    const defaultTaskBtn = document.querySelector('#taskForm .tbtn[data-type="onetime"]');
    if (defaultTaskBtn) defaultTaskBtn.classList.add('on');
    document.querySelectorAll('#editTaskForm .tbtn').forEach(b => b.classList.remove('on'));
    const defaultEditTaskBtn = document.querySelector('#editTaskForm .tbtn[data-type="onetime"]');
    if (defaultEditTaskBtn) defaultEditTaskBtn.classList.add('on');
}

// Close modals on overlay click
document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAll();
    });
});

// ---- CONTEXT-AWARE FAB ----

function handleFabClick() {
    switch(currentContext) {
        case 'calendar':
            openAddEvent();
            break;
        case 'tasks':
            addTask();
            break;
        case 'coach':
            document.getElementById('coachInput').focus();
            break;
    }
}

// ---- FEEDBACK BANNER ----

function dismissFeedback() {
    document.getElementById('feedbackBanner').classList.remove('show');
}

// ---- VOICE INPUT ----

let voiceRecognizer = null;
let isListening = false;

function toggleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('coachMic');
    if (!SpeechRecognition) {
        addCoachMessage('Voice input is not supported in this browser. Try Chrome or Edge.', 'advice');
        return;
    }
    if (!voiceRecognizer) {
        voiceRecognizer = new SpeechRecognition();
        voiceRecognizer.lang = 'en-US';
        voiceRecognizer.interimResults = false;
        voiceRecognizer.maxAlternatives = 1;
        voiceRecognizer.onresult = (event) => {
            const text = event.results[0][0].transcript;
            const input = document.getElementById('coachInput');
            input.value = text;
            sendCoachCommand();
        };
        voiceRecognizer.onend = () => {
            isListening = false;
            if (micBtn) micBtn.classList.remove('active');
        };
    }
    if (isListening) {
        voiceRecognizer.stop();
        isListening = false;
        if (micBtn) micBtn.classList.remove('active');
        return;
    }
    isListening = true;
    if (micBtn) micBtn.classList.add('active');
    voiceRecognizer.start();
}

// ---- PWA SERVICE WORKER ----

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    });
}

// ---- APP INITIALIZATION ----

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();

    // Set initial context
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(currentContext + 'View').classList.add('active');

    // Update header and switcher icon
    const ctx = CONTEXTS[currentContext];
    document.getElementById('contextTitle').textContent = ctx.title;
    document.getElementById('contextSubtitle').textContent = ctx.subtitle;
    document.getElementById('contextIcon').innerHTML = ctx.icon;

    // Restore selected date if available
    const storedSelectedDate = localStorage.getItem('routine-os-selected-date');
    if (storedSelectedDate) {
        const parsedDate = new Date(storedSelectedDate);
        if (!isNaN(parsedDate.getTime())) {
            selectedDate = parsedDate;
            currentDate = new Date(parsedDate);
        }
    }

    // Initialize settings toggles
    const notifToggle = document.getElementById('settingNotifications');
    const alarmToggle = document.getElementById('settingAlarms');
    if (notifToggle) notifToggle.checked = appSettings.notificationsEnabled;
    if (alarmToggle) alarmToggle.checked = appSettings.alarmsEnabled;

    // Render initial content
    renderContextContent(currentContext);

    dataLoaded = true;

    // Start intervals AFTER data is loaded
    setInterval(checkAutoFeedback, 60000);
    checkAutoFeedback();
    setInterval(checkAlarms, 30000);
    checkAlarms();
    setInterval(checkEventAlarms, 30000);
    checkEventAlarms();
    renderCoachLog();

    document.getElementById('coachInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendCoachCommand();
    });
});
