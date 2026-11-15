import { findPokemon, moves } from '../data/index.js';
import { calculateDamage, stat } from './damageCalculator.js';

export function createFighter(id, item = null) {
    const species = findPokemon(id);
    if (!species) throw new Error('Pokémon desconhecido.');
    // Nível 50, IV 31 em todos os atributos, EV 0, natureza neutra.
    const stats = Object.fromEntries(Object.entries(species.baseStats).map(([key, base]) => [key,
        Math.floor((2 * base + 31) * 50 / 100) + (key === 'hp' ? 60 : 5)
    ]));
    return {
        ...structuredClone(species), stats, hp: stats.hp, maxHp: stats.hp,
        stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, status: '',
        salt: false, saltSource: null, confusion: 0, lock: 0, lockMove: null,
        item: id === 'ogerponwellspring' ? 'Wellspring Mask' : item,
        itemLocked: id === 'ogerponwellspring', points: 10,
        damageDealt: 0, received: 0, attacks: {}, spikes: 0
    };
}

export function createBattle(left, right, items = [null, null]) {
    if (left === right) throw new Error('Selecione dois Pokémon diferentes.');
    return { fighters: [createFighter(left, items[0]), createFighter(right, items[1])], turn: 0, finished: false, winner: null, decisive: '', events: [], scored: false };
}

function changeStage(fighter, name, amount) {
    fighter.stages[name] = Math.max(-6, Math.min(6, fighter.stages[name] + amount));
}

function hurt(fighter, damage) {
    const actual = Math.min(fighter.hp, Math.max(0, Math.floor(damage)));
    fighter.hp -= actual;
    fighter.received += actual;
    return actual;
}

function snapshot(battle) {
    return battle.fighters.map(f => ({ hp: f.hp, maxHp: f.maxHp, points: f.points, status: f.status, stages: { ...f.stages } }));
}

function event(battle, text, data = {}) {
    const result = { text, turn: battle.turn, ...data, state: snapshot(battle) };
    battle.events.push(result);
    return result;
}

function finish(battle) {
    const fainted = battle.fighters.map(f => f.hp <= 0);
    if (!fainted.some(Boolean)) return false;
    battle.finished = true;
    battle.winner = fainted[0] && fainted[1] ? null : fainted[0] ? 1 : 0;
    if (battle.winner !== null) {
        const winner = battle.fighters[battle.winner];
        winner.points += 100 + (winner.hp > winner.maxHp / 2 ? 50 : 0) + (winner.received === 0 ? 100 : 0);
    }
    event(battle, battle.winner === null ? 'Nocaute duplo: empate!' : `${battle.fighters[battle.winner].name} venceu!`, { kind: 'finish', winner: battle.winner });
    return true;
}

export function turnOrder(battle, choices, random = Math.random) {
    const [a, b] = battle.fighters;
    const priority = moves[choices[0]].priority - moves[choices[1]].priority;
    if (priority) return priority > 0 ? [0, 1] : [1, 0];
    const speed = stat(a, 'spe') - stat(b, 'spe');
    return speed ? speed > 0 ? [0, 1] : [1, 0] : random() < 0.5 ? [0, 1] : [1, 0];
}

function applySecondary(attacker, defender, move, random) {
    if (move.id === 'sparklingaria' && defender.status === 'brn') defender.status = '';
    const s = move.secondary;
    if (!s || random() * 100 >= s.chance) return false;
    if (s.boosts) for (const [name, value] of Object.entries(s.boosts)) changeStage(defender, name, value);
    if (s.status && !defender.status) {
        const immune = (s.status === 'par' && defender.types.includes('Electric')) ||
            (s.status === 'brn' && defender.types.includes('Fire')) ||
            (s.status === 'frz' && defender.types.includes('Ice')) ||
            (s.status === 'psn' && defender.types.some(t => ['Poison', 'Steel'].includes(t)));
        if (!immune) defender.status = s.status;
    }
    return s.volatileStatus === 'flinch';
}

export function resolveTurn(battle, selected, random = Math.random) {
    if (battle.finished) throw new Error('Batalha encerrada.');
    if (selected.length !== 2 || selected.some((id, i) => !battle.fighters[i].moves.includes(id))) throw new Error('Golpes inválidos.');
    const choices = selected.map((id, i) => battle.fighters[i].lock > 0 ? battle.fighters[i].lockMove : id);
    const start = battle.events.length;
    battle.turn++;
    const order = turnOrder(battle, choices, random);
    const acted = new Set();
    const flinched = new Set();

    for (const index of order) {
        const attacker = battle.fighters[index], defender = battle.fighters[1 - index];
        const move = moves[choices[index]];
        if (flinched.has(index)) {
            event(battle, `${attacker.name} hesitou e não atacou.`); acted.add(index); continue;
        }
        if (attacker.status === 'frz') {
            if (random() < 0.2) attacker.status = '';
            else { event(battle, `${attacker.name} está congelado.`); acted.add(index); continue; }
        }
        if (attacker.status === 'par' && random() < 0.25) {
            event(battle, `${attacker.name} está paralisado.`); acted.add(index); continue;
        }
        if (attacker.confusion > 0) {
            attacker.confusion--;
            if (random() < 1 / 3) {
                const damage = Math.floor(((22 * 40 * stat(attacker, 'atk') / stat(attacker, 'def')) / 50) + 2);
                hurt(attacker, damage);
                battle.decisive = 'Confusão';
                event(battle, `${attacker.name} feriu a si mesmo por confusão.`, { kind: 'damage', target: index });
                if (finish(battle)) break;
                acted.add(index); continue;
            }
        }
        const conditional = ['suckerpunch', 'thunderclap'].includes(move.id) && (acted.has(1 - index) || moves[choices[1 - index]].category === 'Status');
        const calculation = calculateDamage(attacker, defender, move, random);
        const misses = move.accuracy !== true && random() * 100 >= move.accuracy;
        if (conditional || misses || calculation.factor === 0) {
            if (move.id === 'highjumpkick' && !conditional) {
                hurt(attacker, Math.floor(attacker.maxHp / 2));
                battle.decisive = 'High Jump Kick (falha)';
            }
            event(battle, `${attacker.name}: ${move.name} ${conditional ? 'falhou pela condição de prioridade' : misses ? 'errou' : 'não afeta o alvo'}!`, { kind: 'miss', actor: index, move: move.id });
            if (finish(battle)) break;
            acted.add(index); continue;
        }

        let hits = move.id === 'dragondarts' ? 2 : 1;
        if (move.id === 'scaleshot') {
            const chance = random();
            hits = chance < 0.35 ? 2 : chance < 0.7 ? 3 : chance < 0.85 ? 4 : 5;
        }
        let total = 0, actualHits = 0;
        for (let hit = 0; hit < hits && defender.hp > 0; hit++) {
            const { damage } = hit === 0 ? calculation : calculateDamage(attacker, defender, move, random);
            total += hurt(defender, damage); actualHits++;
        }
        attacker.points += 5 + Math.floor(total / 10) + (calculation.factor > 1 ? 15 : 0);
        attacker.damageDealt += total;
        attacker.attacks[move.id] = (attacker.attacks[move.id] || 0) + total;
        battle.decisive = move.name;
        const change = (name, amount) => changeStage(attacker, name, amount);
        if (['closecombat', 'headlongrush'].includes(move.id)) { change('def', -1); change('spd', -1); }
        if (move.id === 'dracometeor') change('spa', -2);
        if (move.id === 'makeitrain') change('spa', -1);
        if (move.id === 'scaleshot') { change('spe', 1); change('def', -1); }
        if (move.id === 'rapidspin') { change('spe', 1); attacker.spikes = 0; }
        if (move.id === 'knockoff' && !defender.itemLocked) defender.item = null;
        if (move.id === 'saltcure') { defender.salt = true; defender.saltSource = index; }
        if (move.id === 'ceaselessedge') defender.spikes = Math.min(3, defender.spikes + 1);
        if (move.recoil) hurt(attacker, Math.max(1, Math.round(total * move.recoil[0] / move.recoil[1])));
        if (move.drain) attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.max(1, Math.round(total * move.drain[0] / move.drain[1])));
        if (move.id === 'outrage') {
            if (!attacker.lock) attacker.lock = 2 + Math.floor(random() * 2);
            attacker.lockMove = move.id;
        }
        if (applySecondary(attacker, defender, move, random)) flinched.add(1 - index);
        event(battle, `${attacker.name} usou ${move.name}: ${total} HP${actualHits > 1 ? ` em ${actualHits} acertos` : ''}.${calculation.factor > 1 ? ' Super-efetivo!' : calculation.factor < 1 ? ' Pouco efetivo.' : ''}`, { kind: 'attack', actor: index, target: 1 - index, move: move.id, type: calculation.type, damage: total, hits: actualHits, factor: calculation.factor });
        if (finish(battle)) break;
        acted.add(index);
    }

    if (!battle.finished) {
        for (let index = 0; index < 2; index++) {
            const fighter = battle.fighters[index];
            if (fighter.lock > 0 && acted.has(index)) {
                fighter.lock--;
                if (!fighter.lock) { fighter.lockMove = null; fighter.confusion = 2 + Math.floor(random() * 3); }
            }
            if (fighter.salt) {
                const fraction = fighter.types.some(type => ['Water', 'Steel'].includes(type)) ? 4 : 8;
                const damage = hurt(fighter, Math.max(1, Math.floor(fighter.maxHp / fraction)));
                battle.decisive = 'Salt Cure (residual)';
                event(battle, `${fighter.name} perdeu ${damage} HP por Salt Cure.`, { kind: 'damage', target: index, damage });
                if (finish(battle)) break;
            }
            if (['psn', 'brn'].includes(fighter.status)) {
                const damage = hurt(fighter, Math.max(1, Math.floor(fighter.maxHp / (fighter.status === 'psn' ? 8 : 16))));
                battle.decisive = fighter.status === 'psn' ? 'Veneno' : 'Queimadura';
                event(battle, `${fighter.name} perdeu ${damage} HP pelo estado ${fighter.status}.`, { kind: 'damage', target: index, damage });
                if (finish(battle)) break;
            }
        }
    }
    if (!battle.finished && battle.turn >= 200) {
        battle.finished = true;
        event(battle, 'Limite de 200 turnos: empate técnico.', { kind: 'finish', winner: null });
    }
    return battle.events.slice(start);
}
