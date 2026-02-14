// ============================================================
// ROUTINE OS — Data Persistence (IndexedDB + localStorage)
// ============================================================

const DB_NAME = 'routine-os-db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function idbGet(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
    });
}

async function idbSet(key, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        try {
            const persisted = await navigator.storage.persist();
            console.log('Storage persist:', persisted);
        } catch (e) {
            console.warn('Persist request failed', e);
        }
    }
}

async function loadData() {
    try {
        requestPersistentStorage();

        let storedEvents, storedTasks, storedContext, storedSelectedDate, storedSettings;
        try {
            storedEvents = await idbGet('routine-os-events');
            storedTasks = await idbGet('routine-os-tasks');
            storedContext = await idbGet('routine-os-context');
            storedSelectedDate = await idbGet('routine-os-selected-date');
            storedSettings = await idbGet('routine-os-settings');
        } catch (idbErr) {
            console.warn('IndexedDB load failed, using localStorage:', idbErr);
        }

        if (!storedEvents) storedEvents = localStorage.getItem('routine-os-events');
        if (!storedTasks) storedTasks = localStorage.getItem('routine-os-tasks');
        if (!storedContext) storedContext = localStorage.getItem('routine-os-context');
        if (!storedSettings) storedSettings = localStorage.getItem('routine-os-settings');

        if (storedEvents) {
            events = JSON.parse(storedEvents);
            events = events.filter(e => e && e.id && e.title && e.date);
            events.forEach(event => {
                if (typeof event.alarmEnabled !== 'boolean') event.alarmEnabled = false;
                if (!event.alarmTimestamp) event.alarmTimestamp = null;
                if (typeof event.alarmNotified !== 'boolean') event.alarmNotified = false;
            });
        }
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            tasks = tasks.filter(t => t && t.id && t.title && t.date);
            tasks.forEach(task => {
                if (!task.completed) task.completed = false;
                if (!task.skippedDates) task.skippedDates = [];
                if (!task.description) task.description = '';
                if (!task.type) task.type = 'onetime';
            });
        }
        if (storedContext) {
            currentContext = CONTEXT_ORDER.includes(storedContext) ? storedContext : 'calendar';
        }
        if (storedSelectedDate) {
            const parsedDate = new Date(storedSelectedDate);
            if (!isNaN(parsedDate.getTime())) {
                selectedDate = parsedDate;
                currentDate = new Date(parsedDate);
            }
        }
        if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            appSettings = {
                notificationsEnabled: parsedSettings.notificationsEnabled !== false,
                alarmsEnabled: parsedSettings.alarmsEnabled !== false
            };
        }

        console.log('Data loaded successfully:', { events: events.length, tasks: tasks.length, context: currentContext });
    } catch (error) {
        console.error('Error loading data:', error);
        events = [];
        tasks = [];
        currentContext = 'calendar';
        saveData();
    }
}

function saveData() {
    if (!dataLoaded) return;
    try {
        localStorage.setItem('routine-os-events', JSON.stringify(events));
        localStorage.setItem('routine-os-tasks', JSON.stringify(tasks));
        localStorage.setItem('routine-os-context', currentContext);
        localStorage.setItem('routine-os-selected-date', selectedDate.toISOString());
        localStorage.setItem('routine-os-settings', JSON.stringify(appSettings));
    } catch (e) {
        console.warn('localStorage save failed:', e);
    }

    try {
        const evJson = JSON.stringify(events);
        const taJson = JSON.stringify(tasks);
        const sdJson = selectedDate.toISOString();
        Promise.all([
            idbSet('routine-os-events', evJson),
            idbSet('routine-os-tasks', taJson),
            idbSet('routine-os-context', currentContext),
            idbSet('routine-os-selected-date', sdJson),
            idbSet('routine-os-settings', JSON.stringify(appSettings))
        ]).catch(err => console.warn('IndexedDB save failed:', err));
    } catch (e) {
        console.warn('IndexedDB save skipped:', e);
    }
}

function toggleSetting(key, value) {
    if (key === 'notifications') appSettings.notificationsEnabled = value;
    if (key === 'alarms') appSettings.alarmsEnabled = value;
    if (key === 'notifications' && value) requestNotificationPermission();
    saveData();
}

// Auto-save every 30 seconds
setInterval(saveData, 30000);

// Save before page unload
window.addEventListener('beforeunload', saveData);

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('routine-os-')) {
        console.log('Data changed in another tab, reloading...');
        loadData();
        renderContextContent(currentContext);
    }
});

// Data Restore Function
function restoreFromFile() {
    const fileInput = document.getElementById('restoreFile');
    if (!fileInput.files.length) {
        addCoachMessage('No file selected. Please choose a backup file first.', 'harsh');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data || typeof data !== 'object') throw new Error('Invalid file format');

            if (data.events && Array.isArray(data.events)) {
                events = data.events.filter(e => e && e.id && e.title && e.date);
            }
            if (data.tasks && Array.isArray(data.tasks)) {
                tasks = data.tasks.filter(t => t && t.id && t.title && t.date);
                tasks.forEach(task => {
                    if (!task.completed) task.completed = false;
                    if (!task.skippedDates) task.skippedDates = [];
                    if (!task.description) task.description = '';
                });
            }
            if (data.settings && typeof data.settings === 'object') {
                appSettings = {
                    notificationsEnabled: data.settings.notificationsEnabled !== false,
                    alarmsEnabled: data.settings.alarmsEnabled !== false
                };
            }
            if (data.context && typeof data.context === 'string') {
                currentContext = data.context;
            }

            saveData();
            renderContextContent(currentContext);

            const backupDate = data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'unknown';
            addCoachMessage(`<strong>DATA RESTORED SUCCESSFULLY</strong><br>• Events: ${events.length}<br>• Tasks: ${tasks.length}<br>• Backup date: ${backupDate}<br><em>Your data has been restored and is ready to use.</em>`, 'advice');
        } catch (error) {
            console.error('Restore error:', error);
            addCoachMessage('<strong>RESTORE FAILED</strong><br>The file is not a valid backup or is corrupted.<br><em>Please try a different backup file.</em>', 'harsh');
        }
    };

    reader.onerror = function() {
        addCoachMessage('<strong>FILE READ ERROR</strong><br>Could not read the selected file.<br><em>Please try again or choose a different file.</em>', 'harsh');
    };

    reader.readAsText(file);
}

function importFromPaste() {
    const area = document.getElementById('importDataArea');
    if (!area) return;
    let raw = area.value.trim();
    if (!raw) {
        addCoachMessage('<strong>IMPORT FAILED</strong><br>The text area is empty. Paste the JSON from your export first.', 'harsh');
        return;
    }
    const jsonIdx = raw.lastIndexOf('{"events"');
    if (jsonIdx > 0) raw = raw.substring(jsonIdx);
    try {
        const data = JSON.parse(raw);
        if (data.events && Array.isArray(data.events)) {
            events = data.events.filter(e => e && e.id && e.title && e.date);
        }
        if (data.tasks && Array.isArray(data.tasks)) {
            tasks = data.tasks.filter(t => t && t.id && t.title);
            tasks.forEach(t => {
                if (!t.completed) t.completed = false;
                if (!t.skippedDates) t.skippedDates = [];
                if (!t.description) t.description = '';
                if (!t.date) t.date = formatDateKey(new Date());
            });
        }
        if (data.settings && typeof data.settings === 'object') {
            appSettings = {
                notificationsEnabled: data.settings.notificationsEnabled !== false,
                alarmsEnabled: data.settings.alarmsEnabled !== false
            };
        }
        saveData();
        renderContextContent(currentContext);
        const ts = data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'now';
        addCoachMessage(`<strong>IMPORT SUCCESSFUL</strong><br>• Events: ${events.length}<br>• Tasks: ${tasks.length}<br>• From: ${ts}<br><em>All data restored. This device is now a clone.</em>`, 'advice');
    } catch (err) {
        console.error('Import parse error:', err);
        addCoachMessage('<strong>IMPORT FAILED</strong><br>Could not parse JSON. Make sure you copied the full JSON line from the export.', 'harsh');
    }
}
