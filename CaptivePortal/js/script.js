"use strict";

// Este protótipo demonstra apenas a interface. Não envia credenciais.
const form = document.querySelector('#login-form');
const identity = document.querySelector('#identity');
const password = document.querySelector('#password');
const feedback = document.querySelector('#feedback');
const togglePassword = document.querySelector('#toggle-password');
const terms = document.querySelector('#terms');

const profiles = {
    aluno: {
        label: 'Matrícula',
        placeholder: 'Digite sua matrícula',
        hint: 'Use a mesma matrícula do portal acadêmico.',
        passwordLabel: 'Senha'
    },
    colaborador: {
        label: 'Usuário institucional',
        placeholder: 'Digite seu usuário institucional',
        hint: 'Para professores e demais colaboradores do campus.',
        passwordLabel: 'Senha'
    },
    visitante: {
        label: 'Identificação do visitante',
        placeholder: 'Digite a identificação recebida',
        hint: 'Solicite suas credenciais de visitante na recepção.',
        passwordLabel: 'Código de acesso'
    }
};

function hidePassword() {
    password.type = 'password';
    togglePassword.textContent = 'Mostrar';
    togglePassword.setAttribute('aria-pressed', 'false');
}

form.addEventListener('change', (event) => {
    if (event.target.name !== 'profile') {
        return;
    }

    const profile = profiles[event.target.value];
    document.querySelector('#identity-label').textContent = profile.label;
    document.querySelector('#identity-hint').textContent = profile.hint;
    document.querySelector('#password-label').textContent = profile.passwordLabel;
    identity.placeholder = profile.placeholder;
    password.placeholder = profile.passwordLabel === 'Senha'
        ? 'Digite sua senha'
        : 'Digite o código recebido';
    identity.value = '';
    identity.setCustomValidity('');
    password.value = '';
    password.setCustomValidity('');
    feedback.textContent = '';
    hidePassword();
});

togglePassword.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    togglePassword.textContent = show ? 'Ocultar' : 'Mostrar';
    togglePassword.setAttribute('aria-pressed', String(show));
});

[identity, password].forEach((input) => {
    input.addEventListener('input', () => {
        input.setCustomValidity('');
        feedback.textContent = '';
    });
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!identity.value.trim()) {
        identity.setCustomValidity('Informe sua identificação.');
    }

    if (!password.value.trim()) {
        password.setCustomValidity('Informe sua senha ou código de acesso.');
    }

    if (!form.reportValidity()) {
        return;
    }

    // A autenticação real deverá ser implementada com o gateway da instituição.
    // Nunca registre senhas em logs nem em localStorage.
    password.value = '';
    hidePassword();
    feedback.textContent = 'Demonstração concluída. O formulário foi validado, mas o acesso à internet depende da integração com o sistema de autenticação do campus.';
});

document.querySelector('#open-terms').addEventListener('click', () => {
    terms.showModal();
});

document.querySelector('#year').textContent = new Date().getFullYear();
