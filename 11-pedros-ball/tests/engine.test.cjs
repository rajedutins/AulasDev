const assert = require('node:assert/strict');
const Football = require('../js/engine.js');

// Gerador determinístico para tornar as verificações reproduzíveis.
let seed = 42;
function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
}

for (let simulation = 0; simulation < 100; simulation++) {
    const season = Football.createSeason(random);
    const pairs = new Set();
    assert.equal(season.schedule.length, 10);
    for (const round of season.schedule) {
        assert.equal(round.length, 6);
        const participants = round.flatMap(match => [match.home, match.away]);
        assert.equal(new Set(participants).size, 12);
        for (const match of round) {
            const pair = [match.home, match.away].sort().join('-');
            assert.ok(!pairs.has(pair), 'Adversário repetido');
            pairs.add(pair);
        }
    }
    assert.throws(() => Football.playSemifinals(season, random));
    for (let round = 0; round < 10; round++) {
        Football.playRound(season, random);
        for (const club of season.table) {
            assert.equal(club.played, round + 1);
            assert.equal(club.played, club.wins + club.draws + club.losses);
            assert.equal(club.points, club.wins * 3 + club.draws);
        }
        assert.equal(season.table.reduce((sum, club) => sum + club.gf - club.ga, 0), 0);
    }
    assert.throws(() => Football.playRound(season, random));
    const ranking = Football.rank(season.table);
    const tableBefore = JSON.stringify(season.table);
    const semifinals = Football.playSemifinals(season, random);
    assert.deepEqual(semifinals.map(match => [match.home, match.away]), [
        [ranking[0].id, ranking[3].id], [ranking[1].id, ranking[2].id]
    ]);
    assert.throws(() => Football.playSemifinals(season, random));
    const final = Football.playFinal(season, random);
    assert.equal(final.home, semifinals[0].winner);
    assert.equal(final.away, semifinals[1].winner);
    assert.ok([final.home, final.away].includes(season.champion));
    assert.equal(JSON.stringify(season.table), tableBefore);
    assert.throws(() => Football.playFinal(season, random));
}

const draw = Football.simulateMatch({ home: 'fla', away: 'pal' }, true, () => 0);
assert.equal(draw.homeGoals, draw.awayGoals);
assert.ok(draw.penalties[0] !== draw.penalties[1]);
assert.equal(draw.winner, 'fla');

const drawsOnly = Football.createSeason(() => 0);
for (let round = 0; round < 10; round++) Football.playRound(drawsOnly, () => 0);
assert.ok(drawsOnly.table.every(club => club.points === 10 && club.draws === 10));
console.log('100 temporadas completas verificadas: calendário, pontuação, classificação, mata-mata e pênaltis.');
