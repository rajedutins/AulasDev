import './styles/main.css';
import { pokemon, moves, colors, typeNames, findPokemon, phrases, effects } from './data/index.js';
import { createBattle, createFighter, resolveTurn } from './game/battleEngine.js';
import { calculateDamage, effectiveness } from './game/damageCalculator.js';
import { chooseMove } from './game/aiOpponent.js';
import { createTournament, advanceTournament, reorderRound } from './game/tournament.js';
import { loadData, saveData, ranking, recordBattle } from './services/storage.js';
import { setAudio, attackSound, victorySound } from './services/audio.js';

const $ = selector => document.querySelector(selector);
const base = import.meta.env.BASE_URL;
let data = loadData();
let selected = [];
let battle;
let mode = 'challenge';
let selectionMode = 'battle';
let tournamentSize = 4;
let tournament = null;
let choices = [null, null];
let busy = false;
let arena;
let lastPair;
let lastItems = [null, null];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const image = (id, className = '') => `<img class="${className}" src="${base}images/${id}.svg" alt="Ilustração estilizada de ${escape(findPokemon(id).name)}" loading="lazy">`;
const types = p => p.types.map(type => `<span class="type" style="--type:${colors[type]}">${typeNames[type]}</span>`).join('');
const name = id => escape(findPokemon(id)?.name || 'A definir');

function save() {
    $('#storage-warning').hidden = saveData(data);
}

function screen(html) {
    $('#screen').hidden = false;
    $('#battle-screen').hidden = true;
    if (arena) arena.pause();
    $('#screen').innerHTML = html;
    if (tournament && !tournament.finished && !html.includes('tournament-bracket')) {
        $('#screen').insertAdjacentHTML('afterbegin', '<p class="resume-tournament"><button class="button secondary" data-action="bracket">Retomar campeonato em andamento →</button></p>');
    }
    const title = $('#screen h1');
    if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
}

function home() {
    screen(`<section class="hero"><div><p class="eyebrow">POKÉMON BATTLE ARENA</p><h1>O desafio<br>dos <em>campeões.</em></h1><p class="hero-description">Escolha seus adversários. Domine os tipos.<br>Cada turno pode mudar a história.</p><div class="hero-actions"><button class="button primary" data-action="select">Iniciar batalha <span>↗</span></button><button class="button secondary" data-action="tournament">Campeonato 🏆</button></div><div class="hero-links"><button data-action="ranking">Ranking geral</button><button data-action="history">Histórico de batalhas</button><button data-action="settings">Configurações</button></div></div><div class="hero-art"><div class="hero-orbit"></div>${image('dragonite', 'hero-pokemon left')}${image('garchomp', 'hero-pokemon right')}<span class="hero-vs">VS</span><span class="art-note">ILUSTRAÇÕES ESTILIZADAS / ARENA 3D</span></div></section><div class="metrics"><div><strong>20</strong><span>POKÉMON DISPONÍVEIS</span></div><div><strong>41</strong><span>GOLPES PARA COMBINAR</span></div><div><strong>18</strong><span>TIPOS NA ARENA</span></div><div><strong>${data.battles.length.toString().padStart(2, '0')}</strong><span>BATALHAS CONCLUÍDAS</span></div></div><section class="intro-grid"><div class="info-card"><span>01 / ESTRATÉGIA</span><h2>O golpe certo.<br>No momento certo.</h2><p>Prioridade, velocidade e vantagens de tipos fazem parte de cada decisão.</p></div><div class="info-card"><span>02 / SUA JORNADA</span><h2>Da primeira batalha<br>ao topo do ranking.</h2><p>Acumule pontos, consulte o histórico e dispute campeonatos com 4, 8 ou 16 participantes.</p></div><div class="info-card"><span>03 / DOIS JEITOS DE JOGAR</span><h2>Controle os dois lados.<br>Ou enfrente a IA.</h2><p>Modo estratégico para estudar o combate; modo desafio para enfrentar um adversário automático.</p></div></section>`);
}

function renderSelection() {
    const championship = selectionMode === 'tournament';
    const stats = ranking(data);
    screen(`<section class="selection"><div class="section-heading"><div><p class="eyebrow">${championship ? 'CAMPEONATO / MONTE A CHAVE' : 'BATALHA / ESCOLHA DOS ADVERSÁRIOS'}</p><h1>${championship ? 'Quem disputa a taça?' : 'Escolha seu confronto.'}</h1></div><button class="button secondary" data-action="home">Voltar</button></div><div class="selection-options"><label>Modo de combate<select id="mode"><option value="challenge" ${mode === 'challenge' ? 'selected' : ''}>Desafio · você controla o lado 1</option><option value="strategic" ${mode === 'strategic' ? 'selected' : ''}>Estratégico · controle os dois lados</option></select></label>${championship ? `<label>Participantes<select id="tournament-size">${[4, 8, 16].map(n => `<option ${n === tournamentSize ? 'selected' : ''}>${n}</option>`).join('')}</select></label><button class="button secondary" data-action="randomize">Sortear participantes</button>` : '<p>Selecione dois Pokémon diferentes. O primeiro escolhido será o seu no modo desafio.</p>'}</div><div class="selection-summary" id="selection-summary"></div><div class="pokemon-grid">${pokemon.map(p => {
        const fighter = createFighter(p.id), record = stats.find(r => r.id === p.id);
        const index = selected.indexOf(p.id);
        return `<button class="pokemon-card ${index >= 0 ? 'selected' : ''}" data-pokemon="${p.id}" aria-pressed="${index >= 0}" style="--glow:${colors[p.types[0]]}"><span class="card-number">${index >= 0 ? `ESCOLHIDO ${index + 1}` : '#' + String(pokemon.indexOf(p) + 1).padStart(2, '0')}</span>${image(p.id)}<strong>${escape(p.name)}</strong><span class="types">${types(p)}</span><span class="card-stats"><span>HP <b>${fighter.maxHp}</b></span><span>ATK <b>${fighter.stats.atk}</b></span><span>DEF <b>${fighter.stats.def}</b></span><span>SPE <b>${fighter.stats.spe}</b></span></span><span class="card-record">${record.wins} vitórias <span>·</span> ${record.points} pts</span></button>`;
    }).join('')}</div><div class="selection-footer"><p id="selection-message" role="status">${championship ? `Selecione ${tournamentSize} participantes. A ordem define os pares da primeira fase.` : 'Toque nos cards para escolher seus adversários.'}</p><button id="start-fight" class="button primary" data-action="start">${championship ? 'Iniciar campeonato' : 'Iniciar confronto'} ↗</button></div></section>`);
    renderSelectionSummary();
}

function moveInfo(move) {
    return `${typeNames[move.type]} · ${move.category === 'Physical' ? 'Físico' : 'Especial'} · potência ${move.power}${move.id === 'scaleshot' ? ' × 2–5' : move.id === 'dragondarts' ? ' × 2' : ''} · precisão ${move.accuracy === true ? '—' : move.accuracy + '%'} · prioridade ${move.priority}`;
}

function renderSelectionSummary() {
    const limit = selectionMode === 'tournament' ? tournamentSize : 2;
    $('#start-fight').disabled = selected.length !== limit;
    const records = selected.map(id => findPokemon(id));
    if (selectionMode === 'tournament') {
        $('#selection-summary').innerHTML = `<p>${selected.length}/${limit} selecionados. Clique novamente para remover. Cada par consecutivo forma um confronto.</p><div class="mini-bracket">${Array.from({ length: Math.ceil(selected.length / 2) }, (_, i) => `<span>${name(selected[i * 2])} <b>×</b> ${name(selected[i * 2 + 1])}</span>`).join('')}</div>`;
        return;
    }
    $('#selection-summary').innerHTML = records.length ? `<div class="previews">${records.map((p, index) => `<article class="preview">${image(p.id)}<div><span class="eyebrow">LADO ${index + 1}</span><h2>${escape(p.name)}</h2><div class="types">${types(p)}</div><ul>${p.moves.map(id => `<li><b>${escape(moves[id].name)}</b><small>${moveInfo(moves[id])}</small><small>${escape(effects[id] || moves[id].description)}</small></li>`).join('')}</ul><label>Item inicial ${p.id === 'ogerponwellspring' ? '<span>Wellspring Mask (fixo)</span>' : `<select data-item="${index}"><option value="">Sem item</option><option value="Training Charm" ${lastItems[index] ? 'selected' : ''}>Training Charm · removível, sem bônus</option></select>`}</label></div></article>`).join('')}</div>${records.length === 2 ? `<p class="type-advice">${records.map((p, i) => { const other = records[1 - i]; const best = Math.max(...p.moves.map(id => effectiveness(id === 'ivycudgel' ? 'Water' : moves[id].type, other.types, id))); return `${escape(p.name)}: melhor efetividade disponível ×${best}`; }).join(' · ')}</p>` : ''}` : '<p class="empty-selection">Seu próximo campeão está entre os 20 Pokémon abaixo.</p>';
}

async function startBattle(ids, items = [null, null]) {
    lastPair = [...ids]; lastItems = [...items];
    battle = createBattle(...ids, items);
    choices = [null, null];
    $('#screen').hidden = true; $('#battle-screen').hidden = false;
    $('#battle-result').innerHTML = ''; $('#log').replaceChildren();
    $('#execute-turn').hidden = false;
    $('#battle-title').textContent = `${findPokemon(ids[0]).name} × ${findPokemon(ids[1]).name}`;
    $('#turn-hint').textContent = mode === 'challenge' ? 'Escolha seu golpe. A IA decide o movimento do lado 2.' : 'Selecione um golpe para cada lado.';
    busy = true; setNavDisabled(true);
    renderHP(); renderMoves();
    if (!arena) {
        const { Arena } = await import('./graphics/arena3d.js');
        arena = new Arena($('#arena'));
    }
    arena.effects = data.settings.effects && !reducedMotion.matches;
    await arena.setFighters(ids);
    busy = false; setNavDisabled(false); renderMoves();
    $('#battle-title').tabIndex = -1; $('#battle-title').focus({ preventScroll: true });
}

function renderHP(state = battle.fighters) {
    $('#hp-panels').innerHTML = state.map((f, i) => {
        const original = battle.fighters[i], ratio = f.hp / f.maxHp;
        return `<article class="hp-panel"><div><h2>${escape(original.name)}</h2><span>NÍVEL 50 · ${mode === 'challenge' && i === 1 ? 'IA' : 'LADO ' + (i + 1)}</span></div><div class="types">${types(original)}</div><div class="hp-label"><span>HP ${f.hp}/${f.maxHp} ${f.status ? '· ' + escape(f.status.toUpperCase()) : ''}</span><b>${f.points} PTS</b></div><div class="hp-track" role="progressbar" aria-label="HP de ${escape(original.name)}" aria-valuemin="0" aria-valuemax="${f.maxHp}" aria-valuenow="${f.hp}"><span style="width:${ratio * 100}%;background:${ratio > 0.5 ? '#65e7b2' : ratio > 0.2 ? '#ffdc79' : '#ff6b85'}"></span></div></article>`;
    }).join('');
    $('#turn-badge').textContent = `TURNO ${battle.turn + (battle.finished ? 0 : 1)}`;
}

function renderMoves() {
    $('#move-controls').innerHTML = battle.fighters.map((f, i) => `<fieldset ${busy || battle.finished || (mode === 'challenge' && i === 1) ? 'disabled' : ''}><legend>${escape(f.name)} ${mode === 'challenge' && i === 1 ? '· controle da IA' : '· escolha seu golpe'}</legend><div class="move-list">${f.moves.map(id => `<button class="move-button ${choices[i] === id ? 'chosen' : ''}" data-move="${id}" data-side="${i}" aria-pressed="${choices[i] === id}" ${f.lock && f.lockMove !== id ? 'disabled' : ''} style="--type:${colors[moves[id].type]}"><span><strong>${escape(moves[id].name)}</strong><b>${moves[id].power}${id === 'dragondarts' ? '×2' : id === 'scaleshot' ? '×2–5' : ''}</b></span><small>${moveInfo(moves[id])}</small><small>${escape(effects[id] || moves[id].description)}</small></button>`).join('')}</div>${f.lock ? '<p class="lock-note">Outrage em andamento: o golpe está travado.</p>' : ''}</fieldset>`).join('');
    $('#execute-turn').disabled = busy || battle.finished || !choices[0] || (mode === 'strategic' && !choices[1]);
}

function setNavDisabled(disabled) {
    document.querySelectorAll('.header button').forEach(button => button.disabled = disabled);
}

async function executeTurn() {
    if (busy || battle.finished || !choices[0] || mode === 'strategic' && !choices[1]) return;
    busy = true; setNavDisabled(true); renderMoves();
    if (mode === 'challenge') choices[1] = chooseMove(battle, 1);
    const events = resolveTurn(battle, choices);
    try {
        for (const event of events) {
            const li = document.createElement('li');
            li.textContent = `T${event.turn} · ${event.text}`;
            if (event.kind === 'attack') attackSound(event.type);
            $('#log').append(li);
            $('#log').scrollTop = $('#log').scrollHeight;
            await arena.animate(event);
            renderHP(event.state);
        }
    } catch (error) {
        console.error('Falha no efeito visual:', error);
        $('#turn-hint').textContent = 'Efeito visual interrompido. O resultado do turno foi preservado.';
    } finally {
        busy = false; setNavDisabled(false); renderHP();
        choices = battle.fighters.map(f => f.lock ? f.lockMove : null);
        renderMoves();
    }
    if (battle.finished) finishBattle();
    else $('#turn-hint').textContent = 'Turno concluído. Escolha os próximos movimentos.';
}

function finishBattle() {
    if (!recordBattle(data, battle)) return;
    const winner = battle.winner === null ? null : battle.fighters[battle.winner];
    if (tournament && winner) {
        advanceTournament(tournament, winner.id);
        if (tournament.finished) data.tournaments.push(structuredClone(tournament));
    }
    save(); victorySound();
    $('#execute-turn').hidden = true;
    const title = tournament?.finished ? 'CAMPEÃO SUPREMO DA POKÉMON BATTLE ARENA' : winner ? 'TEMOS UM CAMPEÃO!' : 'EMPATE NA ARENA';
    $('#battle-result').innerHTML = `<section class="victory ${!data.settings.effects || reducedMotion.matches ? 'no-effects' : ''}"><p class="eyebrow">${title}</p>${winner ? image(winner.id, 'winner-art') : '<span class="draw-icon">⚖</span>'}<h2>${winner ? `${escape(winner.name)} é o grande vencedor!` : 'Os dois deram tudo de si.'}</h2><p>${winner ? phrases[pokemon.findIndex(p => p.id === winner.id)] : 'Nocaute duplo ou limite de turnos: uma revanche decide o próximo campeão.'}</p><div class="result-stats"><span><b>${battle.turn}</b> turnos</span><span><b>${escape(battle.decisive || '—')}</b> golpe decisivo</span>${battle.fighters.map(f => `<span><b>${escape(f.name)}</b>${f.points} pts · ${f.hp}/${f.maxHp} HP<br>${f.damageDealt} HP de dano direto</span>`).join('')}</div>${battle.fighters.map(f => {
        const best = Object.entries(f.attacks).sort((a, b) => b[1] - a[1])[0];
        return `<p class="best-move">Maior dano acumulado de ${escape(f.name)}: ${best ? escape(moves[best[0]].name) + ' (' + best[1] + ' HP)' : 'nenhum'}</p>`;
    }).join('')}<div class="victory-actions">${tournament && !tournament.finished ? `<button class="button primary" data-action="${winner ? 'next-match' : 'rematch'}">${winner ? 'Próximo confronto do campeonato' : 'Repetir confronto empatado'}</button>` : '<button class="button primary" data-action="select">Nova batalha</button><button class="button secondary" data-action="rematch">Revanche</button>'}<button class="button secondary" data-action="ranking">Ver ranking</button><button class="button secondary" data-action="home">Voltar ao menu</button>${tournament ? '<button class="button secondary" data-action="bracket">Ver chave</button>' : ''}</div></section>`;
    $('#battle-result').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
}

function showRanking() {
    screen(`<div class="section-heading"><div><p class="eyebrow">HALL DOS CAMPEÕES</p><h1>Ranking geral.</h1></div><button class="button secondary" data-action="select">Nova batalha ↗</button></div><p class="muted">Pontos → vitórias → taxa de vitória. Empates contam como batalha, mas não como derrota.</p><div class="table-scroll"><table><caption class="sr-only">Ranking geral dos vinte Pokémon.</caption><thead><tr><th>#</th><th>Pokémon</th><th>Batalhas</th><th>Vitórias</th><th>Derrotas</th><th>Empates</th><th>Taxa</th><th>Pontos</th></tr></thead><tbody>${ranking(data).map((p, i) => `<tr class="${i < 3 ? 'top-rank' : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><th scope="row"><span class="ranking-name">${image(p.id)}${escape(p.name)}</span></th><td>${p.battles}</td><td>${p.wins}</td><td>${p.losses}</td><td>${p.draws}</td><td>${Math.round(p.rate * 100)}%</td><td class="ranking-points">${p.points}</td></tr>`).join('')}</tbody></table></div>`);
}

function showHistory() {
    screen(`<div class="section-heading"><div><p class="eyebrow">SEU CAMINHO NA ARENA</p><h1>Histórico de batalhas.</h1></div><button class="button secondary" data-action="home">Voltar</button></div><p class="muted">Abra uma batalha para consultar os turnos, golpes e resultados.</p><div class="history-list">${data.battles.length ? [...data.battles].reverse().map(b => `<details class="history-entry"><summary><span>${escape(new Date(b.date).toLocaleString('pt-BR'))}</span><strong>${name(b.fighters[0].id)} × ${name(b.fighters[1].id)}</strong><span>${b.winner === null ? 'Empate' : name(b.fighters[b.winner].id) + ' venceu'} · ${Number(b.turn)} turnos</span></summary><div class="history-body">${b.fighters.map(f => `<p>${name(f.id)}: ${Number(f.points)} pontos · HP ${Number(f.hp)}/${Number(f.maxHp)} · dano ${Number(f.damageDealt)} HP</p>`).join('')}<p>Golpe decisivo: ${escape(b.decisive)}</p><ol>${b.events.map(e => `<li>T${Number(e.turn)} · ${escape(e.text)}</li>`).join('')}</ol></div></details>`).join('') : '<p class="empty-state">Sua história começa na primeira batalha. Escolha dois Pokémon e entre na arena.</p>'}</div><h2 class="history-title">Campeonatos concluídos</h2>${data.tournaments.length ? [...data.tournaments].reverse().map(t => `<article class="tournament-record"><strong>🏆 ${name(t.champion)}</strong><span>${t.participants?.length || '—'} participantes · ${escape(new Date(t.created).toLocaleDateString('pt-BR'))}</span></article>`).join('') : '<p class="muted">Nenhum campeonato concluído ainda.</p>'}`);
}

function showSettings() {
    screen(`<div class="section-heading"><div><p class="eyebrow">JOGUE DO SEU JEITO</p><h1>Configurações.</h1></div></div><div class="settings-panel"><label class="switch-row"><span><strong>Áudio da arena</strong><small>Trilha original sintetizada e efeitos de ataque.</small></span><input id="audio-toggle" type="checkbox" ${data.settings.audio ? 'checked' : ''}></label><label class="switch-row"><span><strong>Animações e efeitos</strong><small>Partículas, movimento dos personagens e celebração.${reducedMotion.matches ? ' Seu sistema está configurado para movimento reduzido.' : ''}</small></span><input id="effects-toggle" type="checkbox" ${data.settings.effects ? 'checked' : ''}></label><p class="muted">A preferência de movimento reduzido do dispositivo é respeitada. O áudio só começa após interação. Dados e resultados são armazenados apenas neste navegador.</p><button class="button secondary" data-action="clear-data">Apagar ranking e histórico</button></div><details class="rules"><summary>Regras e simplificações do combate</summary><p>Nível 50, IV 31, EV 0 e natureza neutra. Sem habilidades, críticos, clima, terreno, Terastal ou reservas. PP ilimitado. U-turn não troca; Spikes é registrado, mas não causa dano de entrada sem reservas. Outrage trava por 2–3 turnos. Golpes com efeitos secundários podem causar estados e alterações de atributos. Empates por nocaute duplo são registrados; no campeonato, o confronto é repetido.</p><p>Pontos: participar +10; ataque com dano +5; +1 por cada 10 HP retirados por movimento; super-efetivo com dano +15; vitória +100; vitória com mais de 50% de HP +50; sem receber dano +100. Dano residual, recuo e confusão não pontuam como ataque. Acertos múltiplos pontuam como um movimento. Fórmula de dano inspirada nos jogos, com arredondamentos simplificados.</p><p>Arte: ilustrações vetoriais estilizadas próprias, em planos 3D. Não são modelos volumétricos oficiais. Nomes e personagens Pokémon pertencem a seus titulares. Projeto educacional de fã, sem afiliação.</p></details><button class="button primary" data-action="home">Voltar ao menu</button>`);
}

function showBracket() {
    if (!tournament) { selectionMode = 'tournament'; selected = []; renderSelection(); return; }
    const labels = { 8: 'Oitavas de final', 4: 'Quartas de final', 2: 'Semifinais', 1: 'Final' };
    const currentIds = tournament.rounds[tournament.round].flatMap(match => match.players);
    const pairingEditor = !tournament.finished && tournament.match === 0 ? `<details class="pairing-editor"><summary>Organizar confrontos desta fase</summary><p class="muted">Antes de iniciar a fase, escolha os pares manualmente ou sorteie. Alterar uma posição troca os dois participantes.</p><div class="pair-slots">${currentIds.map((id, slot) => `<label>Jogo ${Math.floor(slot / 2) + 1} · lado ${slot % 2 + 1}<select data-pair-slot="${slot}">${currentIds.map(option => `<option value="${option}" ${option === id ? 'selected' : ''}>${name(option)}</option>`).join('')}</select></label>`).join('')}</div><button class="button secondary" data-action="shuffle-round">Sortear confrontos desta fase</button></details>` : '';
    screen(`<div class="section-heading"><div><p class="eyebrow">CAMPEONATO</p><h1>${tournament.finished ? 'A taça foi conquistada.' : 'O caminho até a glória.'}</h1></div></div>${pairingEditor}<div class="tournament-bracket">${Array.from({ length: Math.log2(tournament.participants.length) }, (_, i) => {
        const count = tournament.participants.length / 2 ** (i + 1), round = tournament.rounds[i];
        return `<section><h2>${labels[count]}</h2>${Array.from({ length: count }, (_, j) => `<div class="bracket-match ${i === tournament.round && j === tournament.match ? 'current' : ''}">${round ? round[j].players.map(id => `<span class="${round[j].winner === id ? 'winner' : ''}">${image(id)}${name(id)}${round[j].winner === id ? ' ✓' : ''}</span>`).join('') : '<span>A definir</span><span>A definir</span>'}</div>`).join('')}</section>`;
    }).join('')}</div>${tournament.finished ? `<section class="supreme"><p class="eyebrow">CAMPEÃO SUPREMO DA POKÉMON BATTLE ARENA</p>${image(tournament.champion)}<h2>${name(tournament.champion)}</h2></section>` : '<button class="button primary" data-action="next-match">Jogar confronto pendente ↗</button>'}<button class="button secondary" data-action="tournament">Novo campeonato</button>`);
}

function nextMatch() {
    const match = tournament.rounds[tournament.round][tournament.match];
    startBattle(match.players);
}

async function action(action) {
    if (busy) return;
    if (battle && !battle.finished && !$('#battle-screen').hidden && !window.confirm('Sair deste confronto? A batalha em andamento não será registrada.')) return;
    if (action === 'home') home();
    if (action === 'select') { tournament = null; selectionMode = 'battle'; selected = []; lastItems = [null, null]; renderSelection(); }
    if (action === 'tournament') {
        if (tournament && !tournament.finished && !window.confirm('Substituir o campeonato em andamento?')) return;
        tournament = null; selectionMode = 'tournament'; selected = []; renderSelection();
    }
    if (action === 'ranking') showRanking();
    if (action === 'history') showHistory();
    if (action === 'settings') showSettings();
    if (action === 'randomize') {
        const shuffled = [...pokemon];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        selected = shuffled.slice(0, tournamentSize).map(p => p.id);
        renderSelection();
    }
    if (action === 'start') {
        if (selectionMode === 'tournament') {
            if (selected.length !== tournamentSize) return;
            tournament = createTournament(selected);
            showBracket();
        } else if (selected.length === 2) await startBattle(selected, lastItems);
    }
    if (action === 'bracket') showBracket();
    if (action === 'shuffle-round' && tournament) {
        const ids = tournament.rounds[tournament.round].flatMap(match => match.players);
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        reorderRound(tournament, ids);
        showBracket();
    }
    if (action === 'next-match' && tournament && !tournament.finished) nextMatch();
    if (action === 'rematch' && lastPair) {
        if (tournament?.finished) tournament = null;
        await startBattle(lastPair, lastItems);
    }
    if (action === 'clear-data' && window.confirm('Apagar definitivamente o ranking e os históricos deste navegador?')) {
        data.battles = []; data.tournaments = []; save(); showSettings();
    }
}

document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled || busy) return;
    if (button.dataset.action) action(button.dataset.action);
    if (button.dataset.pokemon) {
        const id = button.dataset.pokemon, index = selected.indexOf(id);
        if (index >= 0) selected.splice(index, 1);
        else if (selected.length < (selectionMode === 'battle' ? 2 : tournamentSize)) selected.push(id);
        else { $('#selection-message').textContent = 'Remova um Pokémon selecionado antes de escolher outro.'; return; }
        const activeId = id;
        renderSelection();
        $(`[data-pokemon="${activeId}"]`).focus({ preventScroll: true });
    }
    if (button.dataset.move) {
        choices[Number(button.dataset.side)] = button.dataset.move;
        renderMoves();
        $(`[data-side="${button.dataset.side}"][data-move="${button.dataset.move}"]`).focus({ preventScroll: true });
    }
});

document.addEventListener('change', async event => {
    const input = event.target;
    if (input.id === 'mode') mode = input.value;
    if (input.id === 'tournament-size') { tournamentSize = Number(input.value); selected = []; renderSelection(); }
    if (input.dataset.item !== undefined) lastItems[Number(input.dataset.item)] = input.value || null;
    if (input.dataset.pairSlot !== undefined && tournament) {
        const ids = tournament.rounds[tournament.round].flatMap(match => match.players);
        const slot = Number(input.dataset.pairSlot), other = ids.indexOf(input.value);
        [ids[slot], ids[other]] = [ids[other], ids[slot]];
        reorderRound(tournament, ids);
        showBracket();
        $('.pairing-editor').open = true;
        $(`[data-pair-slot="${slot}"]`).focus();
    }
    if (input.id === 'audio-toggle') { data.settings.audio = input.checked; await setAudio(input.checked); save(); }
    if (input.id === 'effects-toggle') { data.settings.effects = input.checked; if (arena) arena.effects = input.checked && !reducedMotion.matches; save(); }
});

$('#execute-turn').addEventListener('click', executeTurn);
document.addEventListener('pointerdown', () => { if (data.settings.audio) setAudio(true); }, { once: true });
reducedMotion.addEventListener('change', () => { if (arena) arena.effects = data.settings.effects && !reducedMotion.matches; });
window.addEventListener('pagehide', () => { if (arena) arena.pause(); setAudio(false); });
home();
