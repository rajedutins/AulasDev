import { Dex } from '@pkmn/dex';
import fs from 'node:fs';

const catalog = [
    ['Dragonite', ['Extreme Speed', 'Earthquake', 'Dragon Claw']],
    ['Kingambit', ['Kowtow Cleave', 'Sucker Punch', 'Iron Head']],
    ['Garchomp', ['Earthquake', 'Dragon Claw', 'Scale Shot']],
    ['Gholdengo', ['Make It Rain', 'Shadow Ball', 'Thunderbolt']],
    ['Great Tusk', ['Headlong Rush', 'Close Combat', 'Rapid Spin']],
    ['Zamazenta', ['Close Combat', 'Body Press', 'Crunch']],
    ['Dragapult', ['Dragon Darts', 'Shadow Ball', 'U-turn']],
    ['Raging Bolt', ['Draco Meteor', 'Thunderbolt', 'Thunderclap']],
    ['Roaring Moon', ['Outrage', 'Knock Off', 'Acrobatics']],
    ['Iron Valiant', ['Close Combat', 'Moonblast', 'Knock Off']],
    ['Ogerpon-Wellspring', ['Ivy Cudgel', 'Power Whip', 'Horn Leech']],
    ['Kyurem', ['Draco Meteor', 'Ice Beam', 'Freeze-Dry']],
    ['Darkrai', ['Dark Pulse', 'Ice Beam', 'Sludge Bomb']],
    ['Cinderace', ['High Jump Kick', 'Pyro Ball', 'U-turn']],
    ['Primarina', ['Hydro Pump', 'Moonblast', 'Sparkling Aria']],
    ['Rillaboom', ['Wood Hammer', 'Knock Off', 'Grassy Glide']],
    ['Samurott-Hisui', ['Razor Shell', 'Ceaseless Edge', 'Aqua Jet']],
    ['Gliscor', ['Earthquake', 'Knock Off', 'U-turn']],
    ['Corviknight', ['Brave Bird', 'Body Press', 'U-turn']],
    ['Garganacl', ['Body Press', 'Salt Cure', 'Earthquake']]
];
const pokemon = catalog.map(([name, moves]) => {
    const p = Dex.species.get(name);
    if (!p.exists) throw new Error(name);
    return { id: p.id, name: p.name, types: p.types, baseStats: p.baseStats, moves: moves.map(name => Dex.moves.get(name).id) };
});
const moves = Object.fromEntries([...new Set(pokemon.flatMap(p => p.moves))].map(id => {
    const m = Dex.moves.get(id);
    return [id, { id, name: m.name, type: m.type, power: m.basePower, accuracy: m.accuracy, category: m.category, priority: m.priority, description: m.shortDesc, multihit: m.multihit || 1, recoil: m.recoil || null, drain: m.drain || null, secondary: m.secondary || null }];
}));
const types = Dex.types.all().filter(t => t.name !== 'Stellar' && t.name !== '???');
const chart = Object.fromEntries(types.map(attack => [attack.name, Object.fromEntries(types.map(defense => {
    const value = defense.damageTaken[attack.name];
    return [defense.name, value === 1 ? 2 : value === 2 ? 0.5 : value === 3 ? 0 : 1];
}))]));
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/catalog.json', JSON.stringify({ pokemon, moves, chart }, null, 4) + '\n');
console.log(`${pokemon.length} espécies, ${Object.keys(moves).length} golpes, ${types.length} tipos exportados.`);
