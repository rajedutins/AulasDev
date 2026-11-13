'use strict';
// Grade, arrays de coordenadas, temporizadores, colisões e crescimento.
const canvas = document.querySelector('#game'),
    ctx = canvas.getContext('2d'),
    status = document.querySelector('#status'),
    pause = document.querySelector('#pause');
const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};
let snake = [{ x: 10, y: 10 }],
    direction = directions.right,
    next = direction,
    food = { x: 15, y: 10 },
    score = 0,
    running = false,
    paused = false,
    interval;
function spawnFood() {
    const free = [];
    for (let y = 0; y < 20; y++)
        for (let x = 0; x < 20; x++)
            if (!snake.some((p) => p.x === x && p.y === y)) free.push({ x, y });
    return free[Math.floor(Math.random() * free.length)];
}
function draw() {
    ctx.clearRect(0, 0, 400, 400);
    if (food) {
        ctx.fillStyle = '#ffadad';
        ctx.fillRect(food.x * 20 + 2, food.y * 20 + 2, 16, 16);
    }
    snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? '#ffd166' : '#82e0d0';
        ctx.fillRect(part.x * 20 + 1, part.y * 20 + 1, 18, 18);
    });
}
function end(message) {
    running = false;
    clearInterval(interval);
    pause.disabled = true;
    status.textContent = message + ' Pontuação: ' + score;
}
function tick() {
    if (!running || paused) return;
    direction = next;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y },
        eat = head.x === food.x && head.y === food.y;
    const body = eat ? snake : snake.slice(0, -1);
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= 20 ||
        head.y >= 20 ||
        body.some((p) => p.x === head.x && p.y === head.y)
    ) {
        end('Fim de jogo!');
        return;
    }
    snake.unshift(head);
    if (eat) {
        score += 10;
        food = spawnFood();
        if (!food) {
            draw();
            end('Você preencheu o tabuleiro!');
            return;
        }
    } else snake.pop();
    status.textContent = 'Pontuação: ' + score;
    draw();
}
function turn(name) {
    const candidate = directions[name];
    if (
        candidate &&
        !(candidate.x === -direction.x && candidate.y === -direction.y)
    )
        next = candidate;
}
document.addEventListener('keydown', (e) => {
    const map = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right'
    };
    const name = map[e.key] || map[e.key.toLowerCase()];
    if (name) {
        e.preventDefault();
        turn(name);
    }
});
document
    .querySelectorAll('[data-dir]')
    .forEach((b) => (b.onclick = () => turn(b.dataset.dir)));
document.querySelector('#start').onclick = () => {
    clearInterval(interval);
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = next = directions.right;
    score = 0;
    food = spawnFood();
    running = true;
    paused = false;
    pause.disabled = false;
    pause.textContent = 'Pausar';
    status.textContent = 'Pontuação: 0';
    draw();
    interval = setInterval(tick, 130);
};
pause.onclick = () => {
    paused = !paused;
    pause.textContent = paused ? 'Continuar' : 'Pausar';
    status.textContent = 'Pontuação: ' + score + (paused ? ' — Pausado' : '');
};
window.addEventListener('blur', () => {
    if (running) {
        paused = true;
        pause.textContent = 'Continuar';
        status.textContent = 'Pontuação: ' + score + ' — Pausado';
    }
});
status.textContent = 'Clique em Iniciar.';
draw();
