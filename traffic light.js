const r = document.getElementById('r');
const a = document.getElementById('a');
const g = document.getElementById('g');
const phaseLabel = document.getElementById('phase-label');
const states = [
    { r: false, a: false, g: true, label: 'GREEN', duration: 5000 },
    { r: false, a: true, g: false, label: 'AMBER', duration: 2000 },
    { r: true, a: false, g: false, label: 'RED', duration: 4000 },
];
let idx = 0;
function setLight(state) {
    g.className = 'light' + (state.g ? ' green-on' : '');
    a.className = 'light' + (state.a ? ' amber-on' : '');
    r.className = 'light' + (state.r ? ' red-on' : '');
    if (phaseLabel) phaseLabel.textContent = state.label;
}
function cycle() {
    const current = states[idx];
    setLight(current);
    const duration = current.duration;
    setTimeout(() => {
        idx = (idx + 1) % states.length;
        cycle();
    }, duration);
}
cycle();
