"use strict";
// Arrays, regras de vitória, turnos e controle de estado.
let board, current, finished;
const container = document.querySelector('#board'),
    status = document.querySelector('#status');

const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function render() {
    container.replaceChildren();

    board.forEach((value, index) => {
        const b = document.createElement('button');
        b.textContent = value || '·';
        b.setAttribute('aria-label', 'Casa ' + (index + 1) + ': ' + (value || 'vazia'));
        b.disabled = finished || Boolean(value);

        b.onclick = () => {
            board[index] = current;
            const won = lines.some(line => line.every(i => board[i] === current));

            if (won) {
                finished = true;
                status.textContent = current + ' venceu!';
            } else if (board.every(Boolean)) {
                finished = true;
                status.textContent = 'Empate!';
            } else {
                current = current === 'X' ? 'O' : 'X';
                status.textContent = 'Vez de ' + current;
            }

            render();
        };

        container.append(b);
    });
}

function start() {
    board = Array(9).fill('');
    current = 'X';
    finished = false;
    status.textContent = 'Vez de X';
    render();
}

document.querySelector('#restart').onclick = start;
start();
