"use strict";

// Motor independente da interface para facilitar o estudo e a verificação das regras.
const Football = (() => {
    const teams = [
        { id: 'fla', name: 'Flamengo', code: 'FLA', color: '#d43c45', secondary: '#201c24' },
        { id: 'pal', name: 'Palmeiras', code: 'PAL', color: '#19845b', secondary: '#e1f5e9' },
        { id: 'cor', name: 'Corinthians', code: 'COR', color: '#343b46', secondary: '#f6f6f6' },
        { id: 'sao', name: 'São Paulo', code: 'SAO', color: '#c93744', secondary: '#f2f2f2' },
        { id: 'san', name: 'Santos', code: 'SAN', color: '#414751', secondary: '#f7f7f7' },
        { id: 'gre', name: 'Grêmio', code: 'GRE', color: '#218fca', secondary: '#17222e' },
        { id: 'int', name: 'Internacional', code: 'INT', color: '#d23a4c', secondary: '#fff0ed' },
        { id: 'flu', name: 'Fluminense', code: 'FLU', color: '#922e54', secondary: '#2a825f' },
        { id: 'bot', name: 'Botafogo', code: 'BOT', color: '#323a44', secondary: '#f0f2f4' },
        { id: 'vas', name: 'Vasco', code: 'VAS', color: '#343b46', secondary: '#eb424b' },
        { id: 'cru', name: 'Cruzeiro', code: 'CRU', color: '#3567d3', secondary: '#dfeaff' },
        { id: 'atl', name: 'Atlético-MG', code: 'CAM', color: '#414751', secondary: '#f3f3f3' }
    ];

    function shuffle(items, random = Math.random) {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    function createSchedule(ids, random = Math.random) {
        // Método circular: cada clube joga uma vez por rodada, sem repetir adversário.
        const rotation = shuffle(ids, random);
        const rounds = [];
        for (let round = 0; round < ids.length - 1; round++) {
            const matches = [];
            for (let i = 0; i < ids.length / 2; i++) {
                const pair = [rotation[i], rotation[ids.length - 1 - i]];
                if ((round + i) % 2) pair.reverse();
                matches.push({ home: pair[0], away: pair[1] });
            }
            rounds.push(matches);
            rotation.splice(1, 0, rotation.pop());
        }
        return rounds.slice(0, 10);
    }

    function createSeason(random = Math.random) {
        return {
            schedule: createSchedule(teams.map(team => team.id), random),
            round: 0,
            table: teams.map(team => ({ ...team, points: 0, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 })),
            history: [],
            semifinals: [],
            final: null,
            champion: null
        };
    }

    function goals(random) {
        // Distribuição simples: 0 e 1 gol são mais comuns que goleadas.
        const outcomes = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5];
        return outcomes[Math.floor(random() * outcomes.length)];
    }

    function simulateMatch(match, knockout = false, random = Math.random) {
        const result = { ...match, homeGoals: goals(random), awayGoals: goals(random) };
        if (knockout) {
            if (result.homeGoals === result.awayGoals) {
                const homeWins = random() < 0.5;
                const loserScore = 3 + Math.floor(random() * 3);
                result.penalties = homeWins ? [loserScore + 1, loserScore] : [loserScore, loserScore + 1];
                result.winner = homeWins ? match.home : match.away;
            } else {
                result.winner = result.homeGoals > result.awayGoals ? match.home : match.away;
            }
        }
        return result;
    }

    function rank(table) {
        return [...table].sort((a, b) => b.points - a.points || b.wins - a.wins || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.name.localeCompare(b.name, 'pt-BR'));
    }

    function playRound(season, random = Math.random) {
        if (season.round >= 10) throw new Error('As dez rodadas já foram concluídas.');
        const results = season.schedule[season.round].map(match => simulateMatch(match, false, random));
        for (const match of results) {
            const home = season.table.find(team => team.id === match.home);
            const away = season.table.find(team => team.id === match.away);
            home.played++; away.played++;
            home.gf += match.homeGoals; home.ga += match.awayGoals;
            away.gf += match.awayGoals; away.ga += match.homeGoals;
            if (match.homeGoals === match.awayGoals) {
                home.draws++; away.draws++; home.points++; away.points++;
            } else {
                const winner = match.homeGoals > match.awayGoals ? home : away;
                const loser = winner === home ? away : home;
                winner.wins++; winner.points += 3; loser.losses++;
            }
        }
        season.history.push(results);
        season.round++;
        return results;
    }

    function playSemifinals(season, random = Math.random) {
        if (season.round !== 10 || season.semifinals.length) throw new Error('Semifinais indisponíveis.');
        const top = rank(season.table).slice(0, 4);
        season.semifinals = [
            simulateMatch({ home: top[0].id, away: top[3].id }, true, random),
            simulateMatch({ home: top[1].id, away: top[2].id }, true, random)
        ];
        return season.semifinals;
    }

    function playFinal(season, random = Math.random) {
        if (season.semifinals.length !== 2 || season.final) throw new Error('Final indisponível.');
        season.final = simulateMatch({ home: season.semifinals[0].winner, away: season.semifinals[1].winner }, true, random);
        season.champion = season.final.winner;
        return season.final;
    }

    return { teams, createSchedule, createSeason, simulateMatch, rank, playRound, playSemifinals, playFinal };
})();

if (typeof module !== 'undefined') module.exports = Football;
