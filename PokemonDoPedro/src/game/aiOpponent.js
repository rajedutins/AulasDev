import { moves } from '../data/index.js';
import { calculateDamage, stat } from './damageCalculator.js';

export function chooseMove(battle, index = 1) {
    const actor = battle.fighters[index], target = battle.fighters[1 - index];
    if (actor.lock) return actor.lockMove;
    const ranked = actor.moves.map(id => {
        const move = moves[id];
        let damage = calculateDamage(actor, target, move, () => 0.5).damage;
        if (id === 'dragondarts') damage *= 2;
        if (id === 'scaleshot') damage *= 3;
        let score = Math.min(damage, target.hp) * (move.accuracy === true ? 1 : move.accuracy / 100);
        if (move.priority > 0 && stat(actor, 'spe') < stat(target, 'spe')) score *= 1.15;
        if (damage >= target.hp) score += 30;
        if (move.drain && actor.hp < actor.maxHp / 2) score += damage / 3;
        if (move.recoil && actor.hp < damage / 3) score *= 0.5;
        if (id === 'saltcure' && !target.salt) score += target.maxHp / 5;
        if (id === 'dracometeor' && actor.stages.spa < 0) score *= 0.8;
        if (['suckerpunch', 'thunderclap'].includes(id) && target.moves.some(id => moves[id].priority > move.priority)) score *= 0.7;
        return { id, score };
    });
    return ranked.sort((a, b) => b.score - a.score)[0].id;
}
