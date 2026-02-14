// ============================================================
// ROUTINE OS — Coach Engine (Commands, Stories, Advice, Progress)
// ============================================================

let coachLog = [];
let lastFeedbackHour = -1;

const MOTIVATIONAL_STORIES = [
    { title: 'Leonidas at Thermopylae', text: '480 BC. 300 Spartans held the pass at Thermopylae against 100,000+ Persians for three days. Leonidas knew it was a suicide mission before he marched. When told Persian arrows would block out the sun, Dienekes replied: "Then we shall fight in the shade." They didn\'t fight because they could win. They fought because standing your ground is what separates men from cowards. What\'s your Thermopylae today? Face it.' },
    { title: 'Marcus Aurelius — Emperor Under Plague', text: 'Marcus Aurelius ruled Rome during the Antonine Plague that killed 5 million. He didn\'t retreat. He sold palace furniture to fund the army rather than raise taxes. He wrote Meditations — not for publication, but as self-discipline notes. "The impediment to action advances action. What stands in the way becomes the way." He governed an empire while writing philosophy at 4 AM. You can\'t handle your schedule?' },
    { title: 'Seneca\'s Exile', text: 'Seneca was exiled to Corsica for 8 years. No wealth, no status, no comfort. Instead of breaking, he wrote some of the most important philosophy in human history. "We suffer more in imagination than in reality." He returned to Rome and became the most powerful advisor in the empire. Your discomfort is not exile. It\'s training. Use it.' },
    { title: 'Epictetus — From Slave to Philosopher', text: 'Epictetus was born a slave. His master broke his leg. He couldn\'t choose his circumstances — but he chose his response. He became the most influential Stoic teacher in Rome. "It\'s not what happens to you, but how you react to it that matters." You have freedom he never had. What\'s your excuse for not using it?' },
    { title: 'Cato\'s March Through the Desert', text: 'Cato the Younger marched his army through the Libyan desert — 1,000 miles on foot. No horses for him. He walked with his men, drank last, ate last. When offered water before his soldiers, he refused: "A leader drinks after his men." Discipline isn\'t convenient. It\'s a standard you hold when no one is watching.' },
    { title: 'The Spartan Boy and the Fox', text: 'A Spartan boy stole a fox and hid it under his cloak. Rather than reveal the theft when caught, he let the fox claw his stomach open. He died without making a sound. Extreme? Yes. But the principle stands: endure discomfort silently. Stop announcing your struggles. Handle them.' },
    { title: 'Hannibal Crossing the Alps', text: '218 BC. Hannibal took 30,000 soldiers, 15,000 horses, and 37 war elephants across the Alps in winter. Half his army died. He did it anyway and defeated Rome on their own soil for 15 years. "We will either find a way, or make one." Your obstacle is not the Alps. It\'s your own weakness. Move.' },
    { title: 'Miyamoto Musashi — 61 Duels, Zero Losses', text: 'Musashi fought his first duel at 13. By 30, he had fought 61 duels and never lost. His secret? "Do nothing that is of no use." He eliminated all wasted motion, all wasted thought. Every action had purpose. Examine your day: how much of it is wasted motion? Cut it. Ruthlessly.' },
    { title: 'Diogenes and Alexander', text: 'Alexander the Great visited Diogenes, who lived in a barrel. "Ask me for anything," said the most powerful man alive. Diogenes replied: "Stand out of my sunlight." He needed nothing from the conqueror of the world. Real strength isn\'t accumulation — it\'s the elimination of dependency. What are you dependent on that you shouldn\'t be?' },
    { title: 'Stockdale Paradox', text: 'Admiral James Stockdale spent 7 years as a POW in Vietnam. Tortured repeatedly. The optimists — "We\'ll be out by Christmas" — broke first. Stockdale survived by confronting brutal reality while maintaining faith in the outcome. "You must never confuse faith that you will prevail with the discipline to confront the most brutal facts." Stop hoping. Start acting.' }
];

const ADVICE_DATABASE = {
    'sleep hygiene': {
        title: 'SLEEP HYGIENE — Non-Negotiable Protocol',
        checklist: [
            'No screens 60 minutes before bed. Blue light destroys melatonin. No exceptions.',
            'Room temperature: 18-19°C (65-67°F). Your body needs to cool down to sleep.',
            'Total darkness. Blackout curtains or eye mask. Any light = degraded sleep.',
            'No caffeine after 2:00 PM. Half-life is 5-6 hours. Do the math.',
            'Last meal 3 hours before bed. Digestion and sleep don\'t mix.',
            'Wake time is non-negotiable. Same time every day including weekends.',
            'Bed is for sleep only. No phone, no laptop, no TV in bed.'
        ],
        suggestion: 'Move your wake-up time to 5:00 AM. Your body adapts in 4 days. The first 3 days will hurt. That\'s the point — you\'re building discipline, not comfort.'
    },
    'work density': {
        title: 'WORK DENSITY — Maximum Output Protocol',
        checklist: [
            'Time-block in 90-minute deep work sprints. No multitasking.',
            'Phone in another room during work blocks. Not on silent — physically removed.',
            'First work block starts within 30 min of waking. Peak cortisol = peak focus.',
            'Batch all communication (email, Slack) into 2 windows: 11 AM and 4 PM.',
            'Define 3 MIT (Most Important Tasks) the night before. Non-negotiable.',
            'No meetings before noon. Protect your cognitive prime time.',
            'Track deep work hours daily. If it\'s under 4 hours, you\'re coasting.'
        ],
        suggestion: 'Schedule your hardest task as the first event tomorrow at 5:30 AM. Zero warmup. Attack it cold. Your brain is sharpest before the world corrupts your focus.'
    },
    'exercise': {
        title: 'EXERCISE — Physical Discipline Protocol',
        checklist: [
            'Minimum 30 minutes of elevated heart rate daily. Walking doesn\'t count.',
            'Strength training 3x per week. Compound movements: squat, deadlift, press.',
            'Morning exercise > evening exercise. Sets your circadian rhythm.',
            'No skipping because you\'re "tired." Tired is the default. Move anyway.',
            'Cold shower after every workout. 2 minutes minimum. Builds mental toughness.',
            'Track every workout. What gets measured gets managed.'
        ],
        suggestion: 'Add a "Morning Training" event at 6:00 AM tomorrow. 30 min minimum. If you skip it, I\'ll know — and there will be consequences.'
    },
    'nutrition': {
        title: 'NUTRITION — Fuel Protocol',
        checklist: [
            'Protein with every meal. Minimum 1.6g per kg of bodyweight daily.',
            'No processed sugar. It\'s poison dressed as pleasure.',
            'Hydrate: 250ml water every 2 hours minimum. Your brain is 75% water.',
            'Meal prep on Sundays. Decision fatigue kills discipline.',
            'No eating after 8 PM. Your gut needs rest.',
            'If you can\'t pronounce an ingredient, don\'t eat it.'
        ],
        suggestion: 'Your water target is 2000ml. If you haven\'t hit it by 3 PM, you\'re behind. Set hourly water alarms. Dehydration = degraded performance.'
    },
    'focus': {
        title: 'FOCUS — Mental Warfare Protocol',
        checklist: [
            'Delete social media from your phone. Access only via desktop, time-boxed.',
            'Use website blockers during deep work. willpower is finite; systems aren\'t.',
            '5-minute meditation before each work block. Not optional.',
            'Single-task ruthlessly. Context switching costs 23 minutes per switch.',
            'Write down distracting thoughts on paper. Address them AFTER the work block.',
            'Environment design: clean desk, noise-cancelling headphones, door closed.'
        ],
        suggestion: 'Remove all notification badges from your phone right now. Every badge is someone else\'s agenda stealing your attention. Take control.'
    }
};

function addCoachMessage(text, type) {
    coachLog.push({ text, type, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) });
    renderCoachLog();
}

function renderCoachLog() {
    const el = document.getElementById('coachLog');
    if (!coachLog.length) {
        el.innerHTML = '<div style="padding:20px;text-align:center;color:#4b5563;font-size:12px">The Coach is watching. Type a command or tap a quick action.</div>';
        return;
    }
    el.innerHTML = coachLog.map(m => {
        if (m.type === 'user') return `<div class="coach-msg user-cmd">${esc(m.text)}<div style="font-size:9px;color:#6b7280;margin-top:4px">${m.time}</div></div>`;
        const typeClass = m.type || '';
        const tagMap = { harsh: 'THE SPARTAN', motivate: 'MOTIVATION', advice: 'TACTICAL ADVICE', feedback: 'METRIC REVIEW' };
        const tag = tagMap[m.type] || 'COACH';
        return `<div class="coach-msg coach-resp ${typeClass}"><div class="coach-tag">${tag}</div>${m.text}<div style="font-size:9px;color:#4b5563;margin-top:4px">${m.time}</div></div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

function coachCommand(cmd) {
    addCoachMessage(cmd, 'user');
    processCoachCommand(cmd.toLowerCase());
}

function sendCoachCommand() {
    const input = document.getElementById('coachInput');
    const cmd = input.value.trim();
    if (!cmd) return;
    input.value = '';
    coachCommand(cmd);
}

// ---- PROGRESS AWARENESS ----

function getProgressSummary() {
    const today = formatDateKey(new Date());
    const todayTasks = tasks.filter(t => t.date === today || t.type === 'recurring');
    const activeTasks = todayTasks.filter(t => !t.skippedDates || !t.skippedDates.includes(today));
    const completedTasks = activeTasks.filter(t => t.completed);
    const skippedTasks = todayTasks.filter(t => t.skippedDates && t.skippedDates.includes(today));
    const todayEvents = events.filter(e => e.date === today);
    const trackableTasks = activeTasks.filter(t => t.trackable);
    const trackableProgress = trackableTasks.map(t => {
        const cur = t.trackProgress && t.trackProgress[today] ? t.trackProgress[today] : 0;
        return { title: t.title, current: cur, target: t.trackTarget, unit: t.trackUnit || '', pct: Math.min(100, Math.round((cur / t.trackTarget) * 100)) };
    });

    return {
        today,
        tasks: { total: todayTasks.length, active: activeTasks.length, completed: completedTasks.length, skipped: skippedTasks.length, items: activeTasks },
        events: { total: todayEvents.length, items: todayEvents },
        trackable: trackableProgress
    };
}

// ---- COMMAND PROCESSING ----

function processCoachCommand(cmd) {
    // ALARMS
    if (cmd.includes('alarm') || cmd.includes('notify') || cmd.includes('remind')) {
        const t = parseAlarmTime(cmd);
        if (!t) {
            addCoachMessage('Give me a time like <strong>08:30</strong>. Example: "alarm 08:30 workout".', 'advice');
            return;
        }
        requestNotificationPermission().then((perm) => {
            const label = cmd.replace(t.text, '').replace(/alarm|notify|remind/gi, '').trim() || 'Alarm';
            const alarmTask = scheduleAlarmTask(t, label);
            const permText = perm === 'granted' ? 'Notifications enabled.' : 'Notifications blocked — I will use an on-screen alert.';
            addCoachMessage(`<strong>ALARM TASK SET</strong><br>${alarmTask.alarmTime} — ${esc(label)}<br><em>${permText}</em>`, 'advice');
        });
        return;
    }

    if (cmd.includes('list alarms') || cmd.includes('alarms')) {
        const alarmTasks = tasks.filter(t => t.alarmTimestamp);
        if (!alarmTasks.length) {
            addCoachMessage('No alarms scheduled. Use: <strong>alarm 08:30 wake up</strong>.', 'advice');
            return;
        }
        const list = alarmTasks.map(a => `• ${a.alarmTime} — ${esc(a.title)}`).join('<br>');
        addCoachMessage(`<strong>ALARMS</strong><br>${list}`, 'advice');
        return;
    }

    // DATA MANAGEMENT
    if (cmd.includes('export')) {
        const today = formatDateKey(new Date());
        let txt = `=== ROUTINE OS DATA EXPORT (${today}) ===\n\n`;
        txt += `EVENTS (${events.length}):\n`;
        if (events.length === 0) txt += '  (none)\n';
        events.forEach(e => {
            txt += `- ${e.title}`;
            if (e.date) txt += ` | ${e.date}`;
            if (e.time) txt += ` ${e.time}`;
            txt += ` | ${e.type === 'recurring' ? 'Daily' : 'One-time'}`;
            if (e.alarmEnabled) txt += ' | Alarm: On';
            if (e.description) txt += ` | ${e.description}`;
            txt += '\n';
        });
        txt += `\nTASKS (${tasks.length}):\n`;
        if (tasks.length === 0) txt += '  (none)\n';
        tasks.forEach(t => {
            txt += `- ${t.title}`;
            txt += ` | ${t.type === 'recurring' ? 'Daily' : 'One-time'}`;
            if (t.trackable) {
                const cur = t.trackProgress && t.trackProgress[today] ? t.trackProgress[today] : 0;
                txt += ` | Trackable: ${cur}/${t.trackTarget} ${t.trackUnit || ''}`;
            }
            txt += ` | ${t.completed ? 'Completed' : 'Active'}`;
            if (t.description) txt += ` | ${t.description}`;
            txt += '\n';
        });
        txt += `\nSETTINGS:\n`;
        txt += `  Notifications: ${appSettings.notificationsEnabled ? 'On' : 'Off'}\n`;
        txt += `  Alarms: ${appSettings.alarmsEnabled ? 'On' : 'Off'}\n`;
        const jsonData = JSON.stringify({ events, tasks, settings: appSettings, timestamp: new Date().toISOString() });
        txt += `\n=== JSON (paste into "import" to clone on another device) ===\n${jsonData}`;
        const escapedTxt = txt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
        addCoachMessage(`<strong>DATA EXPORT</strong><br><div style="background:#111;border:1px solid rgba(168,85,247,.3);border-radius:8px;padding:12px;margin-top:8px;font-family:monospace;font-size:11px;line-height:1.6;word-break:break-all;user-select:all;-webkit-user-select:all;cursor:text">${escapedTxt}</div><br><em>Tap and hold the text above to select all, then copy. Paste it into Gemini/ChatGPT or into "import" on another device.</em>`, 'advice');
        return;
    }

    if (cmd.includes('import') || cmd.includes('restore')) {
        addCoachMessage(`<strong>IMPORT DATA</strong><br>Paste your exported JSON below and click Import.<br><br><textarea id="importDataArea" style="width:100%;min-height:80px;background:#111;border:1px solid rgba(168,85,247,.4);border-radius:8px;padding:10px;color:#fff;font-family:monospace;font-size:11px;resize:vertical" placeholder="Paste the JSON line from your export here..."></textarea><br><button onclick="importFromPaste()" style="margin-top:8px;padding:10px 20px;background:#a855f7;color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px">Import Now</button><br><br>Or choose a backup file:<br><input type="file" id="restoreFile" accept=".json" style="color:#fff;margin-top:6px"><br><button onclick="restoreFromFile()" style="margin-top:6px;padding:8px 16px;background:rgba(168,85,247,.2);color:#a855f7;border:1px solid rgba(168,85,247,.4);border-radius:6px;cursor:pointer;font-size:12px">Restore from File</button>`, 'advice');
        return;
    }

    if (cmd.includes('clear data') || cmd.includes('reset all') || cmd.includes('delete all')) {
        if (confirm('This will delete ALL your data (tasks, events). This cannot be undone. Are you sure?')) {
            if (confirm('Final confirmation: All data will be permanently deleted. Continue?')) {
                events = [];
                tasks = [];
                currentContext = 'calendar';
                saveData();
                renderContextContent(currentContext);
                addCoachMessage('<strong>ALL DATA CLEARED</strong><br>Your scheduler has been reset to factory defaults.<br><em>Start fresh by adding new tasks and events.</em>', 'harsh');
                return;
            }
        }
        addCoachMessage('Data clear cancelled. Your data is safe.', 'advice');
        return;
    }

    if (cmd.includes('storage') || cmd.includes('data info')) {
        const storageUsed = JSON.stringify(localStorage).length;
        addCoachMessage(`<strong>STORAGE INFO</strong><br>• Events: ${events.length}<br>• Tasks: ${tasks.length}<br>• Storage used: ~${Math.round(storageUsed/1024)}KB<br><br>Commands: "export", "import", "clear data"`, 'advice');
        return;
    }

    // PROGRESS REVIEW
    if (cmd.includes('progress') || cmd.includes('how am i') || cmd.includes('status') || cmd.includes('check')) {
        runProgressReview();
        return;
    }

    // RECOMMEND
    if (cmd.includes('recommend') || cmd.includes('suggest') || cmd.includes('what should') || cmd.includes('improve') || cmd.includes('next step') || cmd.includes('more reps') || cmd.includes('level up')) {
        runRecommendations();
        return;
    }

    // MOTIVATE
    if (cmd.includes('motivat') || cmd.includes('inspire') || cmd.includes('story') || cmd.includes('push me') || cmd.includes('fire me up')) {
        const story = rand(MOTIVATIONAL_STORIES);
        addCoachMessage(`<strong>${story.title}</strong><br><br>${story.text}`, 'motivate');
        return;
    }

    // ADVICE — match specific topics
    for (const [key, data] of Object.entries(ADVICE_DATABASE)) {
        if (cmd.includes(key) || (key === 'sleep hygiene' && cmd.includes('sleep')) || (key === 'work density' && (cmd.includes('work') || cmd.includes('productivity') || cmd.includes('focus')))) {
            let html = `<strong>${data.title}</strong><br><br>`;
            html += '<div style="margin:8px 0">';
            data.checklist.forEach((item, i) => {
                html += `<div style="margin-bottom:6px;padding-left:12px;border-left:1px solid rgba(168,85,247,.3)"><span style="color:#a855f7;font-weight:600">${i+1}.</span> ${item}</div>`;
            });
            html += '</div>';
            html += `<div style="margin-top:10px;padding:8px 10px;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:6px;font-size:12px"><strong style="color:#a855f7">SCHEDULE CHANGE:</strong> ${data.suggestion}</div>`;
            addCoachMessage(html, 'advice');
            return;
        }
    }

    // REVIEW (legacy alias)
    if (cmd.includes('review')) {
        runProgressReview();
        return;
    }

    // GENERIC HARSH RESPONSE
    const p = getProgressSummary();
    const trackSummary = p.trackable.length > 0 ? p.trackable.map(t => `${t.title}: ${t.current}/${t.target} ${t.unit}`).join(', ') : '';
    const fallbackResponses = [
        `I don\'t have a direct command for "${esc(cmd)}" yet. Snapshot: tasks ${p.tasks.completed}/${p.tasks.active}${trackSummary ? ', ' + trackSummary : ''}, ${p.events.total} events. Try: "progress" or "recommend".`,
        `Command not recognized. You\'ve got ${p.tasks.active} task${p.tasks.active === 1 ? '' : 's'} and ${p.events.total} event${p.events.total === 1 ? '' : 's'} today. Try "progress" or "recommend".`,
        `"${esc(cmd)}" isn\'t in my playbook. If you want a review, say "progress". If you want the next move, say "recommend".`,
        `I can\'t parse that, but I can still help: ${p.tasks.completed}/${p.tasks.active} tasks done${trackSummary ? ', ' + trackSummary : ''}. What do you want to optimize?`
    ];
    addCoachMessage(rand(fallbackResponses), 'advice');
}

// ---- PROGRESS REVIEW ----

function runProgressReview() {
    const p = getProgressSummary();
    let score = 0;
    let lines = [];

    if (p.tasks.active === 0) {
        lines.push(`<span style="color:#fbbf24">TASKS: No tasks set for today. Direction beats motivation. Add 2–3 concrete tasks to anchor the day.</span>`);
    } else {
        const taskPct = Math.round((p.tasks.completed / p.tasks.active) * 100);
        if (taskPct === 100) {
            score += 2;
            lines.push(`<span style="color:#4ade80">TASKS: ${p.tasks.completed}/${p.tasks.active} — all complete. Strong execution.</span>`);
        } else if (taskPct >= 50) {
            score += 1;
            lines.push(`<span style="color:#fbbf24">TASKS: ${p.tasks.completed}/${p.tasks.active} done (${taskPct}%). ${p.tasks.active - p.tasks.completed} remaining. Tighten focus.</span>`);
        } else {
            lines.push(`<span style="color:#f87171">TASKS: ${p.tasks.completed}/${p.tasks.active} done (${taskPct}%). Momentum is low. ${p.tasks.skipped > 0 ? 'You skipped ' + p.tasks.skipped + '. Attack the hardest item first tomorrow.' : 'Start with the smallest action and build.'}</span>`);
        }
    }

    if (p.trackable.length > 0) {
        p.trackable.forEach(t => {
            if (t.pct >= 100) {
                score += 1;
                lines.push(`<span style="color:#4ade80">${t.title.toUpperCase()}: ${t.current}/${t.target} ${t.unit} — target met.</span>`);
            } else if (t.pct >= 50) {
                score += 0.5;
                lines.push(`<span style="color:#fbbf24">${t.title.toUpperCase()}: ${t.current}/${t.target} ${t.unit} (${t.pct}%) — keep going.</span>`);
            } else {
                lines.push(`<span style="color:#f87171">${t.title.toUpperCase()}: ${t.current}/${t.target} ${t.unit} (${t.pct}%) — behind. Fix it now.</span>`);
            }
        });
    }

    if (p.events.total === 0) { lines.push(`<span style="color:#f87171">SCHEDULE: zero events. Block at least one focused work block or training slot.</span>`); }
    else { score += 1; lines.push(`<span style="color:#d8b4fe">SCHEDULE: ${p.events.total} event${p.events.total > 1 ? 's' : ''} planned. Protect the most important block.</span>`); }

    const maxScore = 3 + p.trackable.length;
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    let verdict, vtype;
    if (pct >= 70) {
        verdict = `<div style="margin-top:10px;padding:8px;background:rgba(34,197,94,.1);border:0.5px solid rgba(34,197,94,.3);border-radius:6px"><strong style="color:#4ade80">SCORE: ${pct}% — SOLID</strong><br>Good execution. Type "recommend" to push higher.</div>`;
        vtype = 'advice';
    } else if (pct >= 40) {
        verdict = `<div style="margin-top:10px;padding:8px;background:rgba(251,191,36,.1);border:0.5px solid rgba(251,191,36,.3);border-radius:6px"><strong style="color:#fbbf24">SCORE: ${pct}% — MIDLINE</strong><br>Mixed signals. Pick one lever to fix. Type "recommend".</div>`;
        vtype = 'motivate';
    } else {
        verdict = `<div style="margin-top:10px;padding:8px;background:rgba(239,68,68,.1);border:0.5px solid rgba(239,68,68,.3);border-radius:6px"><strong style="color:#f87171">SCORE: ${pct}% — OFF-TRACK</strong><br>No shame, just data. Start with one corrective action.</div>`;
        vtype = 'harsh';
    }

    addCoachMessage(`<strong>PROGRESS REVIEW</strong><br><br>${lines.join('<br><br>')}${verdict}`, vtype);
}

// ---- RECOMMENDATIONS ----

function runRecommendations() {
    const p = getProgressSummary();
    let recs = [];

    if (p.tasks.active === 0) {
        recs.push({cat: 'TASKS', text: 'You have zero tasks today. Add at least 3 concrete tasks right now. Not goals — actions. "Do 50 pushups" not "exercise more".'});
    } else if (p.tasks.completed === p.tasks.active && p.tasks.active > 0) {
        recs.push({cat: 'TASKS', text: `All ${p.tasks.completed} tasks complete. Time to raise the bar. Add 2 more challenging tasks. If it\'s not uncomfortable, you\'re not growing.`});
    } else if (p.tasks.completed === 0 && p.tasks.active > 0) {
        recs.push({cat: 'TASKS', text: `Zero tasks completed out of ${p.tasks.active}. Pick the easiest one. Do it in the next 5 minutes. Momentum builds from a single action.`});
    }
    if (p.tasks.skipped > 0) {
        recs.push({cat: 'DISCIPLINE', text: `You skipped ${p.tasks.skipped} task${p.tasks.skipped > 1 ? 's' : ''}. Tomorrow, do the skipped ones FIRST. Avoidance compounds. Attack what you fear.`});
    }

    p.trackable.forEach(t => {
        if (t.pct < 50) {
            recs.push({cat: t.title.toUpperCase(), text: `${t.current}/${t.target} ${t.unit} (${t.pct}%). You\'re behind on this. Focus on hitting the target before the day ends.`});
        } else if (t.pct < 100) {
            const remaining = t.target - t.current;
            recs.push({cat: t.title.toUpperCase(), text: `${remaining} ${t.unit} to go. You\'re close — finish strong.`});
        }
    });

    if (p.events.total === 0) {
        recs.push({cat: 'SCHEDULE', text: 'Empty schedule. Block out tomorrow: deep work 6-8 AM, exercise 8-9 AM, focused work 10-12. Structure creates freedom. Add these events now.'});
    }

    let html = '<strong>RECOMMENDATIONS</strong><br><br>';
    recs.forEach(r => {
        html += `<div style="margin-bottom:10px;padding:8px 10px;background:rgba(168,85,247,.05);border-left:2px solid #a855f7;border-radius:0 6px 6px 0"><strong style="color:#a855f7;font-size:10px;text-transform:uppercase;letter-spacing:.5px">${r.cat}</strong><br><span style="font-size:13px">${r.text}</span></div>`;
    });

    if (recs.length === 0) {
        html += '<div style="padding:8px;background:rgba(34,197,94,.1);border:0.5px solid rgba(34,197,94,.3);border-radius:6px"><strong style="color:#4ade80">You\'re on track.</strong> All tasks and targets green. Maintain discipline.</div>';
    }

    addCoachMessage(html, 'advice');
}

// ---- AUTO FEEDBACK ----

function checkAutoFeedback() {
    const now = new Date();
    const hour = now.getHours();
    const feedbackHours = [8, 12, 16, 20];
    const currentSlot = feedbackHours.find(h => hour >= h && hour < h + 1);

    if (currentSlot !== undefined && lastFeedbackHour !== currentSlot) {
        lastFeedbackHour = currentSlot;
        const p = getProgressSummary();
        const failingTasks = p.tasks.active > 0 && p.tasks.completed === 0 && hour >= 12;
        const failingTrackable = p.trackable.some(t => t.pct < 30);

        if (failingTasks || failingTrackable) {
            let msg = `<strong>${currentSlot}:00 CHECK-IN</strong><br><br>`;
            if (failingTasks) msg += `Tasks: ${p.tasks.completed}/${p.tasks.active} complete. It\'s ${currentSlot}:00 and you haven\'t finished a single task.<br><br>`;
            if (failingTrackable) {
                p.trackable.filter(t => t.pct < 30).forEach(t => {
                    msg += `${t.title}: ${t.current}/${t.target} ${t.unit} (${t.pct}%) — way behind.<br>`;
                });
                msg += '<br>';
            }
            msg += `<em>Check-in ${feedbackHours.indexOf(currentSlot) + 1} of ${feedbackHours.length}. I\'m watching.</em>`;
            addCoachMessage(msg, 'harsh');

            const banner = document.getElementById('feedbackBanner');
            document.getElementById('feedbackBannerText').textContent = `${currentSlot}:00 — The Coach reviewed your progress. You\'re falling behind.`;
            banner.classList.add('show');
        }
    }
}
