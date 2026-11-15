import { chart } from '../data/index.js';

export function effectiveness(type, defenderTypes, moveId = '') {
    return defenderTypes.reduce((factor, defense) => factor * (moveId === 'freezedry' && defense === 'Water' ? 2 : chart[type][defense]), 1);
}

export function stageMultiplier(stage) {
    return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

export function stat(fighter, name) {
    let value = fighter.stats[name] * stageMultiplier(fighter.stages[name] || 0);
    if (name === 'spe' && fighter.status === 'par') value *= 0.5;
    return value;
}

export function calculateDamage(attacker, defender, move, random = Math.random) {
    const type = move.id === 'ivycudgel' && attacker.id === 'ogerponwellspring' ? 'Water' : move.type;
    const factor = effectiveness(type, defender.types, move.id);
    if (!factor) return { damage: 0, factor, stab: 1, type };
    let power = move.power;
    if (move.id === 'acrobatics' && !attacker.item) power *= 2;
    if (move.id === 'knockoff' && defender.item && !defender.itemLocked) power *= 1.5;
    const physical = move.category === 'Physical';
    const attack = stat(attacker, move.id === 'bodypress' ? 'def' : physical ? 'atk' : 'spa');
    const defense = stat(defender, physical ? 'def' : 'spd');
    const stab = attacker.types.includes(type) ? 1.5 : 1;
    const burn = physical && attacker.status === 'brn' && move.id !== 'bodypress' ? 0.5 : 1;
    const variation = (85 + Math.floor(random() * 16)) / 100;
    const base = Math.floor(Math.floor((2 * 50 / 5 + 2) * power * attack / defense) / 50) + 2;
    return { damage: Math.max(1, Math.floor(base * stab * factor * variation * burn)), factor, stab, type };
}
