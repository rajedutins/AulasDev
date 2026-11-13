'use strict';
// Aleatoriedade, condicionais, funções e placar.
const names = ['Pedra', 'Papel', 'Tesoura'];
let wins = 0,
    losses = 0,
    draws = 0;
function render() {
    document.querySelector('#score').textContent =
        'Vitórias: ' + wins + ' | Derrotas: ' + losses + ' | Empates: ' + draws;
}
document.querySelectorAll('[data-choice]').forEach(
    (button) =>
        (button.onclick = () => {
            const player = Number(button.dataset.choice),
                computer = Math.floor(Math.random() * 3);
            let message;
            if (player === computer) {
                draws++;
                message = 'Empate!';
            } else if ((player - computer + 3) % 3 === 1) {
                wins++;
                message = 'Você venceu!';
            } else {
                losses++;
                message = 'O computador venceu!';
            }
            document.querySelector('#round').textContent =
                'Você: ' +
                names[player] +
                ' • Computador: ' +
                names[computer] +
                '. ' +
                message;
            render();
        })
);
document.querySelector('#reset').onclick = () => {
    wins = losses = draws = 0;
    document.querySelector('#round').textContent = 'Faça sua escolha.';
    render();
};
render();
