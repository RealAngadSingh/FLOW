const qlen = document.getElementById('qlen');
const wait = document.getElementById('wait');
const vcnt = document.getElementById('vcnt');
setInterval(() => {
    qlen.textContent = Math.floor(Math.random() * 20 + 5);

    wait.textContent = Math.floor(Math.random() * 30 + 8) + 's';

    vcnt.textContent = Math.floor(Math.random() * 40 + 30);

}, 1500);