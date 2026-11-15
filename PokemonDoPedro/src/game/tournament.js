export function createTournament(ids, randomize = false, random = Math.random) {
    if (![4, 8, 16].includes(ids.length) || new Set(ids).size !== ids.length) throw new Error('Escolha 4, 8 ou 16 participantes diferentes.');
    const participants = [...ids];
    if (randomize) for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]];
    }
    return { id: crypto.randomUUID(), participants, rounds: [pair(participants)], round: 0, match: 0, finished: false, champion: null, created: new Date().toISOString() };
}

function pair(ids) {
    return Array.from({ length: ids.length / 2 }, (_, i) => ({ players: ids.slice(i * 2, i * 2 + 2), winner: null }));
}

export function reorderRound(tournament, ids) {
    if (tournament.finished || tournament.match !== 0) throw new Error('A fase já começou.');
    const current = tournament.rounds[tournament.round].flatMap(match => match.players);
    if (ids.length !== current.length || new Set(ids).size !== ids.length || ids.some(id => !current.includes(id))) throw new Error('Participantes inválidos.');
    tournament.rounds[tournament.round] = pair(ids);
}

export function advanceTournament(tournament, winner) {
    if (tournament.finished) throw new Error('Campeonato encerrado.');
    const round = tournament.rounds[tournament.round];
    const match = round[tournament.match];
    if (!match.players.includes(winner)) throw new Error('Vencedor inválido.');
    match.winner = winner;
    tournament.match++;
    if (tournament.match === round.length) {
        if (round.length === 1) { tournament.finished = true; tournament.champion = winner; }
        else {
            tournament.rounds.push(pair(round.map(match => match.winner)));
            tournament.round++;
            tournament.match = 0;
        }
    }
    return tournament;
}
