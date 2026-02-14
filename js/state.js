// ============================================================
// ROUTINE OS — Global State & Constants
// ============================================================

let dataLoaded = false;
let currentDate = new Date();
let selectedDate = new Date();
let events = [];
let tasks = [];
let selectedEventType = 'onetime';
let selectedTaskType = 'onetime';
let editingTaskId = null;
let currentContext = 'calendar';

let appSettings = {
    notificationsEnabled: true,
    alarmsEnabled: true
};

const CONTEXTS = {
    calendar: {
        title: 'Calendar',
        subtitle: 'Today',
        icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>'
    },
    tasks: {
        title: 'Tasks',
        subtitle: 'Daily Checklist',
        icon: '<path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    coach: {
        title: 'Coach',
        subtitle: 'AI Assistant',
        icon: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 7l4-4 4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    }
};

const CONTEXT_ORDER = ['calendar', 'tasks', 'coach'];
