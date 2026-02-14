// ============================================================
// ROUTINE OS — Alarms & Notifications
// ============================================================

let alarmAudioCtx = null;
let alarmInterval = null;

function playAlarmSound() {
    if (!appSettings.alarmsEnabled) return;
    stopAlarmSound();
    try {
        alarmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (alarmAudioCtx.state === 'suspended') alarmAudioCtx.resume();
        let beepCount = 0;
        const maxBeeps = 8;
        function beep() {
            if (beepCount >= maxBeeps || !alarmAudioCtx) { stopAlarmSound(); return; }
            const osc = alarmAudioCtx.createOscillator();
            const gain = alarmAudioCtx.createGain();
            osc.type = beepCount % 2 === 0 ? 'square' : 'sine';
            osc.frequency.value = beepCount % 2 === 0 ? 880 : 660;
            gain.gain.value = 0.35;
            gain.gain.setTargetAtTime(0, alarmAudioCtx.currentTime + 0.25, 0.05);
            osc.connect(gain);
            gain.connect(alarmAudioCtx.destination);
            osc.start();
            osc.stop(alarmAudioCtx.currentTime + 0.3);
            beepCount++;
        }
        beep();
        alarmInterval = setInterval(beep, 500);
    } catch (e) {
        console.warn('Alarm sound failed:', e);
    }
}

function stopAlarmSound() {
    if (alarmInterval) { clearInterval(alarmInterval); alarmInterval = null; }
    if (alarmAudioCtx) { alarmAudioCtx.close().catch(() => {}); alarmAudioCtx = null; }
}

function parseAlarmTime(cmd) {
    const match = cmd.match(/(\b\d{1,2}):(\d{2})\b/);
    if (!match) return null;
    const hours = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    const minutes = Math.min(59, Math.max(0, parseInt(match[2], 10)));
    return { hours, minutes, text: match[0] };
}

function requestNotificationPermission() {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    if (Notification.permission === 'granted') return Promise.resolve('granted');
    return Notification.requestPermission();
}

function scheduleAlarmTask(time, label) {
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(time.hours, time.minutes, 0, 0);
    if (alarmTime <= now) alarmTime.setDate(alarmTime.getDate() + 1);

    const task = {
        id: Date.now().toString(),
        title: label || 'Alarm',
        description: `Alarm at ${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`,
        completed: false,
        date: formatDateKey(alarmTime),
        alarmTime: `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`,
        alarmTimestamp: alarmTime.getTime(),
        alarmFired: false
    };
    tasks.push(task);
    saveData();
    return task;
}

function fireAlarm(task) {
    task.alarmFired = true;
    saveData();
    const body = `${task.title} — ${task.alarmTime}`;
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Routine OS Alarm', { body });
    } else {
        alert(`ALARM: ${body}`);
    }
    addCoachMessage(`<strong>ALARM</strong><br>${body}`, 'harsh');
}

function checkAlarms() {
    const now = Date.now();
    tasks.filter(t => t.alarmTimestamp && !t.alarmFired && t.alarmTimestamp <= now).forEach(fireAlarm);
    tasks = tasks.filter(t => !t.alarmFired || !t.alarmTimestamp || (now - t.alarmTimestamp) < 86400000);
    saveData();
}

function fireEventAlarm(event) {
    event.alarmNotified = true;
    saveData();
    const body = `${event.title}${event.time ? ` — ${event.time}` : ''}`;
    if (appSettings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Routine OS Event', { body });
    }
    if (event.alarmEnabled && appSettings.alarmsEnabled) {
        playAlarmSound();
    }
    addCoachMessage(`<strong>EVENT</strong><br>${body}`, 'advice');
}

function checkEventAlarms() {
    const now = Date.now();
    events.forEach(event => {
        if (!event.alarmTimestamp) return;
        if (!event.alarmNotified && event.alarmTimestamp <= now) {
            fireEventAlarm(event);
        }
        if (event.type === 'recurring' && event.alarmTimestamp <= now) {
            const next = new Date(event.alarmTimestamp);
            next.setDate(next.getDate() + 1);
            event.alarmTimestamp = next.getTime();
            event.alarmNotified = false;
        }
    });
    saveData();
}
