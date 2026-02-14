// ============================================================
// ROUTINE OS — Utility Functions
// ============================================================

function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getSelectedType(formSelector) {
    const active = document.querySelector(`${formSelector} .tbtn.on`);
    return active ? active.dataset.type : 'onetime';
}
