import { pokemon } from '../data/index.js';

const KEY = 'pokemon-do-pedro-v1';
export const emptyData = () => ({ battles: [], tournaments: [], settings: { audio: false, effects: true } });

export function loadData(storage = globalThis.localStorage) {
    try {
        const data = JSON.parse(storage.getItem(KEY));
        if (!data || !Array.isArray(data.battles) || !Array.isArray(data.tournaments)) return emptyData();
        // Dados do navegador não são confiáveis: só aceitamos registros conhecidos.
        const validId = id => pokemon.some(p => p.id === id);
        data.battles = data.battles.filter(b => b && typeof b.id === 'string' && Array.isArray(b.fighters) && b.fighters.length === 2 && b.fighters.every(f => f && validId(f.id) && Number.isFinite(f.points) && Number.isFinite(f.hp)) && (b.winner === null || b.winner === 0 || b.winner === 1) && Array.isArray(b.events));
        data.tournaments = data.tournaments.filter(t => t && validId(t.champion) && Array.isArray(t.rounds));
        data.settings = { audio: data.settings?.audio === true, effects: data.settings?.effects !== false };
        return data;
    } catch { return emptyData(); }
}

export function saveData(data, storage = globalThis.localStorage) {
    try { storage.setItem(KEY, JSON.stringify(data)); return true; } catch { return false; }
}

export function ranking(data) {
    return pokemon.map(p => {
        const records = data.battles.flatMap(b => b.fighters.map((f, i) => ({ f, winner: b.winner === i, draw: b.winner === null }))).filter(r => r.f.id === p.id);
        const wins = records.filter(r => r.winner).length;
        return { ...p, battles: records.length, wins, losses: records.filter(r => !r.winner && !r.draw).length, draws: records.filter(r => r.draw).length, rate: records.length ? wins / records.length : 0, points: records.reduce((sum, r) => sum + r.f.points, 0) };
    }).sort((a, b) => b.points - a.points || b.wins - a.wins || b.rate - a.rate || a.name.localeCompare(b.name));
}

export function recordBattle(data, battle) {
    if (!battle.finished || battle.scored) return false;
    const record = { id: crypto.randomUUID(), date: new Date().toISOString(), fighters: structuredClone(battle.fighters), winner: battle.winner, turn: battle.turn, decisive: battle.decisive, events: structuredClone(battle.events) };
    data.battles.push(record);
    battle.scored = true;
    return true;
}
