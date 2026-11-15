"use strict";

const $ = selector => document.querySelector(selector);
let selected = null;
let season = null;
let phase = 'selection';

function team(id) {
    return Football.teams.find(club => club.id === id);
}

// Escudo gráfico feito com CSS: não depende de imagens ou serviços externos.
function shield(id) {
    const club = team(id);
    return `<span class="shield" style="--club:${club.color};--club-secondary:${club.secondary}" aria-hidden="true"><span>${club.code}</span></span>`;
}

function showSelection() {
    phase = 'selection';
    season = null;
    selected = null;
    $('#selection').hidden = false;
    $('#championship').hidden = true;
    $('#new-season').hidden = true;
    $('#start').disabled = true;
    $('#selection-hint').textContent = 'Selecione um time para começar.';
    $('#team-grid').innerHTML = Football.teams.map(club => `<label class="team-option"><input type="radio" name="club" value="${club.id}">${shield(club.id)}<span class="club-name">${club.name}</span><span class="selection-check" aria-hidden="true">✓</span></label>`).join('');
    $('#team-grid').querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
        selected = input.value;
        $('#selection-hint').textContent = team(selected).name + ' é o seu clube. Vamos buscar a taça?';
        $('#start').disabled = false;
    }));
}

function renderStandings() {
    const table = Football.rank(season.table);
    $('#standings').innerHTML = table.map((club, index) => `<tr class="${index < 4 ? 'qualified' : ''} ${club.id === selected ? 'your-club' : ''}"><td>${index + 1}</td><th scope="row"><span class="table-team">${shield(club.id)}<span>${club.name}${club.id === selected ? '<small>SEU TIME</small>' : ''}</span></span></th><td class="points">${club.points}</td><td>${club.played}</td><td>${club.wins}</td><td>${club.draws}</td><td>${club.losses}</td><td>${club.gf - club.ga}</td></tr>`).join('');
    const mine = season.table.find(club => club.id === selected);
    $('#my-team').innerHTML = `${shield(selected)}<div><small>SEU CLUBE</small><strong>${mine.name}</strong><span>${table.findIndex(club => club.id === selected) + 1}º lugar · ${mine.points} pontos</span></div>`;
    $('#progress').innerHTML = Array.from({ length: 10 }, (_, i) => `<li class="${i < season.round ? 'completed' : ''} ${i === season.round && phase === 'fixture' ? 'current' : ''}" ${i === season.round && phase === 'fixture' ? 'aria-current="step"' : ''}><span>${i + 1}</span><small>RODADA</small></li>`).join('');
}

function matchMarkup(match, actionable = false) {
    const played = match.homeGoals !== undefined;
    const mine = match.home === selected || match.away === selected;
    const home = team(match.home), away = team(match.away);
    const content = `<span class="match-team">${shield(home.id)}<span>${home.name}</span></span><span class="score">${played ? `${match.homeGoals} <i>×</i> ${match.awayGoals}` : '<i>×</i>'}</span><span class="match-team away"><span>${away.name}</span>${shield(away.id)}</span>`;
    const penalties = match.penalties ? `<small class="penalties">Pênaltis: ${match.penalties[0]} × ${match.penalties[1]} · ${team(match.winner).name} avança${season.champion ? ' e é campeão' : ''}</small>` : '';
    if (actionable && mine) return `<button class="match-card playable" id="play-match"><span class="match-caption">SEU JOGO · CLIQUE PARA SIMULAR A RODADA →</span><span class="match-content">${content}</span></button>`;
    return `<div class="match-card ${mine ? 'my-match' : ''}">${mine ? '<span class="match-caption">SEU JOGO</span>' : ''}<div class="match-content">${content}</div>${penalties}</div>`;
}

function fixture() {
    phase = 'fixture';
    $('#stage-label').textContent = 'FASE DE CLASSIFICAÇÃO';
    $('#season-title').textContent = 'Cada rodada conta.';
    $('#season-description').textContent = 'Escolha a partida do seu clube. O computador simula todos os jogos da rodada.';
    $('#matches-title').textContent = 'Jogos da rodada';
    $('#round-label').textContent = `${season.round + 1} / 10`;
    $('#match-instruction').textContent = 'O jogo destacado é o seu. Clique nele para começar.';
    $('#matches').innerHTML = season.schedule[season.round].map(match => matchMarkup(match, true)).join('');
    $('#advance').hidden = true;
    $('#announcement').textContent = `Rodada ${season.round + 1} pronta para jogar.`;
    renderStandings();
    $('#play-match').addEventListener('click', playRound);
}

function playRound() {
    if (phase !== 'fixture') return;
    phase = 'results';
    const results = Football.playRound(season);
    $('#matches').innerHTML = results.map(match => matchMarkup(match)).join('');
    $('#match-instruction').textContent = 'Rodada encerrada. Confira os placares e a classificação atualizada.';
    const mine = results.find(match => match.home === selected || match.away === selected);
    $('#announcement').textContent = `Rodada ${season.round} encerrada: ${team(mine.home).name} ${mine.homeGoals} a ${mine.awayGoals} ${team(mine.away).name}.`;
    $('#advance').hidden = false;
    $('#advance').textContent = season.round === 10 ? 'Ver classificados e semifinais →' : 'Próxima rodada →';
    renderStandings();
}

function prepareSemifinals() {
    phase = 'semifinal-ready';
    const top = Football.rank(season.table).slice(0, 4);
    const matches = [{ home: top[0].id, away: top[3].id }, { home: top[1].id, away: top[2].id }];
    $('#stage-label').textContent = 'MATA-MATA';
    $('#season-title').textContent = 'Quatro clubes. Um sonho.';
    $('#season-description').textContent = 'Semifinais em jogo único. Empates são decididos nos pênaltis.';
    $('#matches-title').textContent = 'Semifinais';
    $('#round-label').textContent = 'TOP 4';
    $('#match-instruction').textContent = '1º enfrenta o 4º; 2º enfrenta o 3º. A classificação da primeira fase fica preservada.';
    $('#matches').innerHTML = matches.map((match, index) => `<p class="pairing">${index === 0 ? '1º × 4º' : '2º × 3º'}</p>${matchMarkup(match)}`).join('');
    const qualified = top.some(club => club.id === selected);
    $('#announcement').textContent = qualified ? 'Seu time está nas semifinais! A taça está mais perto.' : 'Seu time encerrou sua participação. Acompanhe a disputa pelo título!';
    $('#advance').textContent = 'Simular semifinais →';
    renderStandings();
}

function simulateSemifinals() {
    if (phase !== 'semifinal-ready') return;
    const matches = Football.playSemifinals(season);
    phase = 'final-ready';
    $('#matches-title').textContent = 'Resultados das semifinais';
    $('#matches').innerHTML = matches.map(match => matchMarkup(match)).join('');
    $('#playoffs').hidden = false;
    $('#bracket').innerHTML = '<h3>Final</h3>' + matchMarkup({ home: matches[0].winner, away: matches[1].winner });
    $('#announcement').textContent = `${team(matches[0].winner).name} e ${team(matches[1].winner).name} estão na final!`;
    $('#advance').textContent = 'Simular a grande final 🏆';
}

function simulateFinal() {
    if (phase !== 'final-ready') return;
    const result = Football.playFinal(season);
    phase = 'finished';
    $('#bracket').innerHTML = '<h3>Final</h3>' + matchMarkup(result);
    $('#stage-label').textContent = 'TEMPORADA CONCLUÍDA';
    $('#season-title').textContent = 'Pode soltar o grito!';
    $('#season-description').textContent = 'Dez rodadas e uma decisão para ficar na história.';
    $('#advance').hidden = true;
    $('#champion').hidden = false;
    $('#champion-title').textContent = team(result.winner).name + ' é campeão!';
    $('#champion-description').textContent = result.winner === selected ? 'Seu clube conquistou a taça. A festa é da sua torcida!' : 'O campeão foi definido. Uma nova temporada pode mudar tudo.';
    $('#announcement').textContent = team(result.winner).name + ' conquistou o Pedro’s Ball!';
    $('#confetti').innerHTML = Array.from({ length: 30 }, (_, i) => `<span style="--x:${(i * 37) % 100}%;--delay:${(i % 7) * 0.15}s;--tilt:${i * 29}deg"></span>`).join('');
    $('#champion').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

$('#start').addEventListener('click', () => {
    if (!selected) return;
    season = Football.createSeason();
    $('#selection').hidden = true;
    $('#championship').hidden = false;
    $('#new-season').hidden = false;
    $('#playoffs').hidden = true;
    $('#champion').hidden = true;
    fixture();
    $('#season-title').setAttribute('tabindex', '-1');
    $('#season-title').focus();
});

$('#advance').addEventListener('click', () => {
    if (phase === 'results') season.round === 10 ? prepareSemifinals() : fixture();
    else if (phase === 'semifinal-ready') simulateSemifinals();
    else if (phase === 'final-ready') simulateFinal();
});

$('#new-season').addEventListener('click', () => $('#restart-dialog').showModal());
$('#cancel-restart').addEventListener('click', () => $('#restart-dialog').close());
$('#confirm-restart').addEventListener('click', () => {
    $('#restart-dialog').close();
    showSelection();
    $('#team-grid input').focus();
});
$('#play-again').addEventListener('click', () => {
    showSelection();
    $('#team-grid input').focus();
});
showSelection();
