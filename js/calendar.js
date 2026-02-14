// ============================================================
// ROUTINE OS — Calendar & Events
// ============================================================

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay();
    const endDay = lastDay.getDate();
    const prevEndDay = prevLastDay.getDate();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    let html = '';

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        html += `<div class="weekday">${day}</div>`;
    });

    for (let i = startDay - 1; i >= 0; i--) {
        html += `<div class="cal-day other-month">${prevEndDay - i}</div>`;
    }

    const today = new Date();
    for (let day = 1; day <= endDay; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateKey(date);
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();

        let classes = 'cal-day';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (dayEvents.length > 0) classes += ' has-events';

        html += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${day})">${day}</div>`;
    }

    const remainingDays = 42 - (startDay + endDay);
    for (let day = 1; day <= remainingDays; day++) {
        html += `<div class="cal-day other-month">${day}</div>`;
    }

    document.getElementById('calendar').innerHTML = html;
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    updateDateDisplay();
    renderEvents();
    renderCalendar();
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function goToToday() {
    const today = new Date();
    currentDate = new Date(today);
    selectedDate = new Date(today);
    updateDateDisplay();
    renderCalendar();
    renderEvents();
}

function updateDateDisplay() {
    document.getElementById('eventsDate').textContent = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderEvents() {
    const dateStr = formatDateKey(selectedDate);
    const dayEvents = events.filter(e => e.date === dateStr);
    const container = document.getElementById('eventsList');

    if (dayEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/></svg>
                <p>No events for this day</p>
            </div>
        `;
        return;
    }

    container.innerHTML = dayEvents.map(event => `
        <div class="event-item">
            <div class="event-info">
                ${event.time ? `<div class="event-time">${event.time}</div>` : ''}
                <div class="event-title">${event.title}</div>
                ${event.description ? `<div class="event-type">${event.description}</div>` : ''}
                ${event.type === 'recurring' ? '<div class="event-type">Daily</div>' : ''}
            </div>
            <button class="del-btn" onclick="deleteEvent('${event.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>
            </button>
        </div>
    `).join('');
}

function openAddEvent() {
    document.getElementById('addModal').classList.add('open');
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    document.getElementById('eventDate').value = `${year}-${month}-${day}`;
    document.getElementById('eventTime').value = '08:00';
    document.getElementById('eventTitle').focus();
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    if (!title) return;

    const eventDateInput = document.getElementById('eventDate').value;
    let eventDate;
    if (eventDateInput) {
        eventDate = eventDateInput;
    } else {
        eventDate = formatDateKey(selectedDate);
    }

    const eventTime = document.getElementById('eventTime').value;
    const alarmEnabled = document.getElementById('eventAlarmToggle').checked;
    let alarmTimestamp = null;
    let alarmNotified = false;
    if (eventTime) {
        const [h, m] = eventTime.split(':').map(v => parseInt(v, 10));
        const now = new Date();
        const alarmDate = new Date(eventDate);
        alarmDate.setHours(h, m, 0, 0);
        if (alarmDate <= now) alarmDate.setDate(alarmDate.getDate() + 1);
        alarmTimestamp = alarmDate.getTime();
        if (appSettings.notificationsEnabled) requestNotificationPermission();
    }

    const event = {
        id: Date.now().toString(),
        title,
        description: document.getElementById('eventDesc').value.trim(),
        time: eventTime,
        type: selectedEventType,
        date: eventDate,
        alarmEnabled: !!alarmEnabled,
        alarmTimestamp,
        alarmNotified
    };

    events.push(event);
    saveData();
    renderEvents();
    renderCalendar();
    closeAll();
}

function deleteEvent(id) {
    events = events.filter(e => e.id !== id);
    saveData();
    renderEvents();
    renderCalendar();
}

function pickEventType(btn) {
    selectedEventType = btn.dataset.type;
    document.querySelectorAll('#eventForm .tbtn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
}
