'use strict';
// Operadores, condicionais, formulários e conversão numérica.
const form = document.querySelector('#calc'),
    result = document.querySelector('#result');
form.onsubmit = (event) => {
    event.preventDefault();
    const a = Number(document.querySelector('#a').value),
        b = Number(document.querySelector('#b').value),
        op = document.querySelector('#op').value;
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
        result.textContent = 'Digite números válidos.';
        return;
    }
    if (op === '/' && b === 0) {
        result.textContent = 'Não é possível dividir por zero.';
        return;
    }
    const operations = {
        '+': () => a + b,
        '-': () => a - b,
        '*': () => a * b,
        '/': () => a / b
    };
    const answer = operations[op]();
    result.textContent = Number.isFinite(answer)
        ? answer.toLocaleString('pt-BR', { maximumFractionDigits: 10 })
        : 'Resultado fora do limite numérico.';
};
form.onreset = () => {
    result.textContent = '0';
};
