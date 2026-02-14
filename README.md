# Routine OS

A minimalist mobile-first Progressive Web App (PWA) for daily routine management.

## Features

- **Calendar View** — Monthly calendar with event management and alarm support
- **Daily Tasks** — Task tracking with completion, skip, and trackable progress (water, exercise, reps, etc.)
- **The Coach** — AI coaching system with motivational stories, progress reviews, tactical advice, and data export/import
- **Trackable Tasks** — Embed metrics directly into tasks with targets, units, and increment buttons
- **Export/Import** — LLM-friendly data export + JSON for cloning to another device
- **Alarms & Notifications** — Browser-based alarm system with notification support
- **Data Persistence** — IndexedDB + localStorage dual-layer persistence
- **PWA** — Installable progressive web app with offline support

## Tech Stack

- **Frontend**: Vanilla JS (no build step required)
- **Styling**: Custom CSS
- **Storage**: IndexedDB + localStorage
- **PWA**: Service Worker with static cache

## Getting Started

Just open `index.html` in a browser, or serve with any static file server:

```bash
npx serve .
```

Or deploy to GitHub Pages / Netlify as-is.

## Project Structure

```
├── index.html       # HTML shell (markup only)
├── css/
│   └── styles.css   # All styles
├── js/
│   ├── state.js     # Global state & constants
│   ├── utils.js     # Utility functions
│   ├── storage.js   # IndexedDB + localStorage persistence, import/export
│   ├── alarms.js    # Alarm sound, notifications, event/task alarms
│   ├── calendar.js  # Calendar rendering, events CRUD, navigation
│   ├── tasks.js     # Tasks CRUD, trackable progress, rendering
│   ├── coach.js     # Coach engine, commands, stories, advice, progress review
│   └── app.js       # Init, context switching, modals, voice input, FAB
├── sw.js            # Service worker
├── manifest.json    # PWA manifest
└── icon-192.png     # App icon
```

## Design System

- **Colors**: Deep black (#000) background, charcoal (#0a0a0a) cards, purple (#a855f7) accents
- **Typography**: Helvetica Neue Condensed / system fonts
- **Borders**: 0.5px purple lines for visual hierarchy
- **Touch Targets**: Minimum 44px for mobile accessibility

## License

MIT
