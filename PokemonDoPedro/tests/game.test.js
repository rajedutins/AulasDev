import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pokemon, moves, chart } from '../src/data/index.js';
import { effectiveness, calculateDamage, stageMultiplier } from '../src/game/damageCalculator.js';
import { createBattle, createFighter, resolveTurn, turnOrder } from '../src/game/battleEngine.js';
import { chooseMove } from '../src/game/aiOpponent.js';
import { createTournament, advanceTournament, reorderRound } from '../src/game/tournament.js';
import { emptyData, saveData, loadData, recordBattle, ranking } from '../src/services/storage.js';

const low = () => 0;
const mid = () => 0.5;
const high = () => 0.999;

test('20 Pokémon, formas corretas, 3 golpes e ilustrações para todos', () => {
    assert.equal(pokemon.length, 20);
    assert.equal(new Set(pokemon.map(p => p.id)).size, 20);
    for (const p of pokemon) {
        assert.equal(p.moves.length, 3);
        assert.ok(p.moves.every(id => moves[id]));
        assert.ok(fs.existsSync(new URL(`../public/images/${p.id}.svg`, import.meta.url)));
        assert.equal(Object.keys(p.baseStats).length, 6);
    }
    assert.deepEqual(createFighter('ogerponwellspring').types, ['Grass', 'Water']);
    assert.deepEqual(createFighter('zamazenta').types, ['Fighting']);
    assert.equal(createFighter('zamazenta').baseStats.def, 115);
});

test('atributos de nível 50, IV 31, EV 0 e natureza neutra', () => {
    const dragonite = createFighter('dragonite');
    assert.equal(dragonite.hp, 166);
    assert.equal(dragonite.stats.atk, 154);
    assert.equal(stageMultiplier(-2), 0.5);
    assert.equal(stageMultiplier(2), 2);
});

test('tabela completa 18×18 e valores permitidos', () => {
    assert.equal(Object.keys(chart).length, 18);
    for (const row of Object.values(chart)) {
        assert.equal(Object.keys(row).length, 18);
        assert.ok(Object.values(row).every(v => [0, 0.5, 1, 2].includes(v)));
    }
    assert.equal(effectiveness('Electric', ['Ground']), 0);
    assert.equal(effectiveness('Ground', ['Flying']), 0);
    assert.equal(effectiveness('Normal', ['Ghost']), 0);
    assert.equal(effectiveness('Fighting', ['Ghost']), 0);
    assert.equal(effectiveness('Poison', ['Steel']), 0);
    assert.equal(effectiveness('Psychic', ['Dark']), 0);
    assert.equal(effectiveness('Dragon', ['Fairy']), 0);
    assert.equal(effectiveness('Ice', ['Dragon', 'Flying']), 4);
    assert.equal(effectiveness('Grass', ['Fire', 'Flying']), 0.25);
    assert.equal(effectiveness('Ice', ['Water'], 'freezedry'), 2);
});

test('dano físico, especial, STAB, variação e imunidade', () => {
    const a = createFighter('dragonite'), b = createFighter('garchomp');
    const regular = calculateDamage(a, b, moves.dragonclaw, mid);
    assert.equal(regular.stab, 1.5);
    const noStab = { ...a, types: ['Normal'] };
    assert.ok(regular.damage > calculateDamage(noStab, b, moves.dragonclaw, mid).damage);
    b.stats.def *= 2;
    assert.ok(calculateDamage(a, b, moves.dragonclaw, mid).damage < regular.damage);
    const special = calculateDamage(a, b, moves.shadowball, mid).damage;
    b.stats.def *= 3;
    assert.equal(calculateDamage(a, b, moves.shadowball, mid).damage, special);
    b.stats.spd *= 2;
    assert.ok(calculateDamage(a, b, moves.shadowball, mid).damage < special);
    assert.ok(calculateDamage(a, b, moves.dragonclaw, low).damage <= calculateDamage(a, b, moves.dragonclaw, high).damage);
    assert.equal(calculateDamage(a, createFighter('dragapult'), moves.extremespeed, mid).damage, 0);
});

test('Body Press usa Defense; Acrobatics dobra sem item; Knock Off afeta apenas item removível', () => {
    const a = createFighter('corviknight'), b = createFighter('dragonite');
    const damage = calculateDamage(a, b, moves.bodypress, mid).damage;
    a.stats.atk *= 10;
    assert.equal(calculateDamage(a, b, moves.bodypress, mid).damage, damage);
    a.stats.def *= 2;
    assert.ok(calculateDamage(a, b, moves.bodypress, mid).damage > damage);
    const noItem = calculateDamage(a, b, moves.acrobatics, mid).damage;
    a.item = 'Training Charm';
    assert.ok(calculateDamage(a, b, moves.acrobatics, mid).damage < noItem);
    const base = calculateDamage(a, b, moves.knockoff, mid).damage;
    b.item = 'Training Charm';
    assert.ok(calculateDamage(a, b, moves.knockoff, mid).damage > base);
});

test('prioridade vence velocidade; desempate aleatório', () => {
    const b = createBattle('dragonite', 'dragapult');
    assert.equal(turnOrder(b, ['extremespeed', 'dragondarts'], mid)[0], 0);
    assert.equal(turnOrder(b, ['dragonclaw', 'dragondarts'], mid)[0], 1);
    b.fighters[0].stats.spe = b.fighters[1].stats.spe;
    assert.equal(turnOrder(b, ['dragonclaw', 'dragondarts'], low)[0], 0);
    assert.equal(turnOrder(b, ['dragonclaw', 'dragondarts'], high)[0], 1);
});

test('Dragon Darts atinge duas vezes; Scale Shot entre 2 e 5 vezes', () => {
    let b = createBattle('dragapult', 'garganacl');
    b.fighters[1].hp = b.fighters[1].maxHp = 5000;
    let events = resolveTurn(b, ['dragondarts', 'saltcure'], mid);
    assert.equal(events.find(e => e.move === 'dragondarts').hits, 2);
    b = createBattle('garchomp', 'garganacl');
    b.fighters[1].hp = b.fighters[1].maxHp = 5000;
    events = resolveTurn(b, ['scaleshot', 'saltcure'], mid);
    assert.equal(events.find(e => e.move === 'scaleshot').hits, 3);
    assert.equal(b.fighters[0].stages.spe, 1);
    assert.equal(b.fighters[0].stages.def, -1);
});

test('Draco Meteor, Close Combat, Headlong Rush e Make It Rain alteram atributos', () => {
    const cases = [
        ['ragingbolt', 'dracometeor', 'spa', -2],
        ['zamazenta', 'closecombat', 'def', -1],
        ['greattusk', 'headlongrush', 'spd', -1],
        ['gholdengo', 'makeitrain', 'spa', -1]
    ];
    for (const [id, move, stat, expected] of cases) {
        const b = createBattle(id, 'garganacl');
        b.fighters[1].hp = b.fighters[1].maxHp = 5000;
        resolveTurn(b, [move, 'saltcure'], low);
        assert.equal(b.fighters[0].stages[stat], expected, move);
    }
});

test('Horn Leech recupera HP sem exceder máximo e Brave Bird causa recuo', () => {
    const b = createBattle('ogerponwellspring', 'garganacl');
    b.fighters[0].hp = 60;
    const events = resolveTurn(b, ['hornleech', 'bodypress'], mid);
    const attack = events.find(e => e.move === 'hornleech');
    assert.ok(attack.state[0].hp > 60);
    assert.ok(attack.state[0].hp <= b.fighters[0].maxHp);
    const recoil = createBattle('corviknight', 'garganacl');
    const oldHp = recoil.fighters[0].hp;
    const hit = resolveTurn(recoil, ['bravebird', 'saltcure'], mid).find(e => e.move === 'bravebird');
    assert.ok(hit.state[0].hp < oldHp);
});

test('Salt Cure aplica residual agravado em Água; Ceaseless Edge registra armadilha', () => {
    const b = createBattle('garganacl', 'primarina');
    const events = resolveTurn(b, ['saltcure', 'sparklingaria'], low);
    const residual = events.find(e => e.kind === 'damage' && e.target === 1);
    assert.equal(residual.damage, Math.floor(b.fighters[1].maxHp / 4));
    const spikes = createBattle('samurotthisui', 'garganacl');
    resolveTurn(spikes, ['ceaselessedge', 'bodypress'], low);
    assert.equal(spikes.fighters[1].spikes, 1);
});

test('Rapid Spin aumenta velocidade; U-turn não troca; Knock Off remove item', () => {
    const b = createBattle('greattusk', 'gliscor', [null, 'Training Charm']);
    resolveTurn(b, ['rapidspin', 'uturn'], low);
    assert.equal(b.fighters[0].stages.spe, 1);
    assert.equal(b.fighters[1].id, 'gliscor');
    const knock = createBattle('kingambit', 'garganacl', [null, 'Training Charm']);
    resolveTurn(knock, ['kowtowcleave', 'saltcure'], low);
    const knock2 = createBattle('gliscor', 'garganacl', [null, 'Training Charm']);
    resolveTurn(knock2, ['knockoff', 'saltcure'], low);
    assert.equal(knock2.fighters[1].item, null);
});

test('Sucker Punch falha se alvo já agiu; High Jump Kick erra com penalidade', () => {
    const b = createBattle('kingambit', 'dragonite');
    const events = resolveTurn(b, ['suckerpunch', 'extremespeed'], mid);
    assert.ok(events.some(e => e.move === 'suckerpunch' && e.kind === 'miss'));
    const hjk = createBattle('cinderace', 'garganacl');
    const hp = hjk.fighters[0].hp;
    const crash = resolveTurn(hjk, ['highjumpkick', 'bodypress'], high).find(e => e.move === 'highjumpkick');
    assert.equal(crash.kind, 'miss');
    assert.equal(crash.state[0].hp, hp - Math.floor(hp / 2));
});

test('pontos contam dano real sem excedente e fim imediato impede segundo ataque', () => {
    const b = createBattle('garchomp', 'garganacl');
    b.fighters[1].hp = 1;
    const events = resolveTurn(b, ['earthquake', 'bodypress'], mid);
    assert.equal(b.finished, true);
    assert.equal(b.winner, 0);
    assert.equal(b.fighters[0].damageDealt, 1);
    assert.equal(events.filter(e => e.kind === 'attack').length, 1);
    assert.equal(b.fighters[0].points, 10 + 5 + 15 + 100 + 50 + 100);
    assert.equal(b.fighters[1].points, 10);
    assert.throws(() => resolveTurn(b, ['earthquake', 'bodypress']));
});

test('ataques imunes e erros não pontuam', () => {
    const b = createBattle('dragonite', 'dragapult');
    resolveTurn(b, ['extremespeed', 'uturn'], high);
    assert.equal(b.fighters[0].points, 10);
});

test('persistência de ranking e histórico; registro sem duplicação e dados corrompidos', () => {
    const b = createBattle('garchomp', 'garganacl');
    b.fighters[1].hp = 1;
    resolveTurn(b, ['earthquake', 'bodypress'], mid);
    const data = emptyData();
    assert.equal(recordBattle(data, b), true);
    assert.equal(recordBattle(data, b), false);
    let value;
    const storage = { setItem: (_, input) => value = input, getItem: () => value };
    assert.equal(saveData(data, storage), true);
    const loaded = loadData(storage);
    assert.equal(loaded.battles.length, 1);
    const top = ranking(loaded)[0];
    assert.equal(top.id, 'garchomp');
    assert.equal(top.wins, 1);
    assert.equal(top.points, b.fighters[0].points);
    assert.equal(loadData({ getItem: () => '{invalid' }).battles.length, 0);
    assert.equal(saveData(data, { setItem: () => { throw Error('quota'); } }), false);
});

test('chaveamento 4, 8 e 16; pares sem repetição; campeão válido; rejeita entradas inválidas', () => {
    for (const size of [4, 8, 16]) {
        const ids = pokemon.slice(0, size).map(p => p.id);
        const t = createTournament(ids, true, mid);
        let battles = 0;
        while (!t.finished) {
            const match = t.rounds[t.round][t.match];
            advanceTournament(t, match.players[0]); battles++;
        }
        assert.equal(battles, size - 1);
        assert.equal(t.rounds.length, Math.log2(size));
        assert.ok(ids.includes(t.champion));
        assert.throws(() => advanceTournament(t, ids[0]));
    }
    assert.throws(() => createTournament(['a', 'a', 'b', 'c']));
    assert.throws(() => createTournament(['a', 'b']));
});

test('todos os 190 confrontos com IA terminam, HP limitado e estatísticas consistentes', () => {
    let seed = 100;
    const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let a = 0; a < pokemon.length; a++) for (let b = a + 1; b < pokemon.length; b++) {
        const battle = createBattle(pokemon[a].id, pokemon[b].id);
        while (!battle.finished) resolveTurn(battle, [chooseMove(battle, 0), chooseMove(battle, 1)], rng);
        assert.ok(battle.turn <= 200);
        assert.ok(battle.fighters.every(f => f.hp >= 0 && f.hp <= f.maxHp && f.points >= 10));
        if (battle.winner !== null) assert.ok(battle.fighters[battle.winner].hp > 0);
    }
});

test('confrontos podem ser reorganizados antes de cada fase, preservando vencedores', () => {
    const ids = pokemon.slice(0, 8).map(p => p.id);
    const t = createTournament(ids);
    reorderRound(t, [...ids].reverse());
    assert.deepEqual(t.rounds[0][0].players, [ids[7], ids[6]]);
    advanceTournament(t, ids[7]);
    assert.throws(() => reorderRound(t, ids));
    while (t.round === 0) advanceTournament(t, t.rounds[0][t.match].players[0]);
    const winners = t.rounds[1].flatMap(match => match.players);
    reorderRound(t, [...winners].reverse());
    assert.deepEqual(t.rounds[1].flatMap(match => match.players), [...winners].reverse());
    assert.throws(() => reorderRound(t, ids.slice(0, 4)));
});
