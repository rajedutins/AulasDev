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
        label: 'CPF',
        placeholder: 'Digite seu CPF',
        hint: 'Informe seu CPF, somente números.',
        passwordLabel: 'Senha'
    },
    professor: {
        label: 'Usuário institucional',
        placeholder: 'Digite seu usuário institucional',
        hint: 'Use seu usuário institucional de professor.',
        passwordLabel: 'Senha'
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

    if (event.target.value === 'visitante') {
        password.value = '';
        hidePassword();
        form.hidden = true;
        visitorForm.hidden = false;
        document.querySelector('#access-title').textContent = 'Cadastro de visitante';
        document.querySelector('#access-intro').textContent = 'Preencha seus dados para solicitar acesso à rede.';
        visitorName.focus();
        return;
    }

    const profile = profiles[event.target.value];
    document.querySelector('#identity-label').textContent = profile.label;
    document.querySelector('#identity-hint').textContent = profile.hint;
    document.querySelector('#password-label').textContent = profile.passwordLabel;
    identity.placeholder = profile.placeholder;
    identity.inputMode = event.target.value === 'aluno' ? 'numeric' : 'text';
    identity.maxLength = event.target.value === 'aluno' ? 11 : 100;
    if (event.target.value === 'aluno') {
        identity.pattern = '[0-9]{11}';
    } else {
        identity.removeAttribute('pattern');
    }
    document.querySelector('#first-access').hidden = event.target.value !== 'aluno';
    document.querySelector('#consent').checked = false;
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

const visitorForm = document.querySelector('#visitor-form');
const visitorName = document.querySelector('#visitor-name');
const visitorCpf = document.querySelector('#visitor-cpf');
const visitorEmail = document.querySelector('#visitor-email');
const visitorFeedback = document.querySelector('#visitor-feedback');

// Verifica apenas a estrutura e os dígitos verificadores, sem consultar titularidade.
function isValidCpf(value) {
    const digits = value.replace(/\D/g, '');

    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
        return false;
    }

    for (let length = 9; length <= 10; length++) {
        let sum = 0;

        for (let index = 0; index < length; index++) {
            sum += Number(digits[index]) * (length + 1 - index);
        }

        const remainder = (sum * 10) % 11;
        const checkDigit = remainder === 10 ? 0 : remainder;

        if (checkDigit !== Number(digits[length])) {
            return false;
        }
    }

    return true;
}

visitorCpf.addEventListener('input', () => {
    const digits = visitorCpf.value.replace(/\D/g, '').slice(0, 11);
    visitorCpf.value = digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
});

[visitorName, visitorCpf, visitorEmail].forEach((input) => {
    input.addEventListener('input', () => {
        input.setCustomValidity('');
        visitorFeedback.textContent = '';
    });
});

visitorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    visitorName.setCustomValidity(
        visitorName.value.trim().split(/\s+/).length < 2
            ? 'Informe seu nome completo.'
            : ''
    );
    visitorCpf.setCustomValidity(
        isValidCpf(visitorCpf.value) ? '' : 'Informe um CPF válido.'
    );

    if (!visitorForm.reportValidity()) {
        return;
    }

    // Protótipo: nenhum dado pessoal é armazenado ou transmitido.
    visitorForm.reset();
    visitorFeedback.textContent = 'Demonstração: dados validados. Nenhum cadastro foi salvo e o acesso à rede ainda depende de integração.';
});

document.querySelector('#visitor-terms').addEventListener('click', () => {
    terms.showModal();
});

document.querySelector('#back-to-login').addEventListener('click', () => {
    visitorForm.reset();
    [visitorName, visitorCpf, visitorEmail].forEach((input) => input.setCustomValidity(''));
    visitorFeedback.textContent = '';
    visitorForm.hidden = true;
    form.hidden = false;
    document.querySelector('#access-title').textContent = 'Acesso à internet';
    document.querySelector('#access-intro').textContent = 'Escolha seu perfil e informe suas credenciais de acesso.';
    const studentProfile = form.querySelector('[value="aluno"]');
    studentProfile.checked = true;
    studentProfile.dispatchEvent(new Event('change', { bubbles: true }));
    identity.focus();
});
