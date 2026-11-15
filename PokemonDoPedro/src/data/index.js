import catalog from './catalog.json' with { type: 'json' };

export const { pokemon, moves, chart } = catalog;
export const findPokemon = id => pokemon.find(p => p.id === id);
export const colors = { Normal: '#a8a6a0', Fire: '#ff824b', Water: '#4dbeff', Electric: '#ffe273', Grass: '#6ce6a1', Ice: '#8be4ee', Fighting: '#e27567', Poison: '#ca83e9', Ground: '#dcb782', Flying: '#a8b6ff', Psychic: '#ff8eae', Bug: '#b5d36c', Rock: '#cbbb8a', Ghost: '#a08eff', Dragon: '#9891ff', Dark: '#a8a3c2', Steel: '#bac9db', Fairy: '#f4b1ee' };
export const typeNames = { Normal: 'Normal', Fire: 'Fogo', Water: 'Água', Electric: 'Elétrico', Grass: 'Planta', Ice: 'Gelo', Fighting: 'Lutador', Poison: 'Veneno', Ground: 'Terra', Flying: 'Voador', Psychic: 'Psíquico', Bug: 'Inseto', Rock: 'Pedra', Ghost: 'Fantasma', Dragon: 'Dragão', Dark: 'Sombrio', Steel: 'Aço', Fairy: 'Fada' };
export const phrases = [
    'A força dos dragões dominou os céus. Dragonite é imparável!',
    'O rei fez sua jogada final. O campo de batalha tem um soberano!',
    'Quando o dragão da terra avança, até os campeões tremem!',
    'Uma vitória que vale ouro! Gholdengo conquistou a arena!',
    'A força ancestral esmagou todos os obstáculos!',
    'O escudo lendário resistiu e conquistou a glória!',
    'Ninguém conseguiu acompanhar sua velocidade. Vitória fantasmagórica!',
    'O trovão ancestral rugiu mais alto que todos!',
    'O rugido da lua anunciou a chegada de um campeão!',
    'Precisão, poder e coragem. A vitória pertence ao guerreiro do futuro!',
    'A força das águas revelou uma campeã lendária!',
    'O frio absoluto tomou conta da arena. Kyurem reina soberano!',
    'Das sombras surgiu o verdadeiro pesadelo dos adversários!',
    'O golpe final incendiou a arena. Cinderace é campeão!',
    'A elegância das águas encontrou a força de uma campeã!',
    'O ritmo da vitória ecoou por toda a arena!',
    'A lâmina ancestral decidiu o destino da batalha!',
    'Dos céus veio o ataque que ninguém conseguiu evitar!',
    'As asas de aço conduziram o campeão à vitória!',
    'Uma fortaleza inabalável! Garganacl resistiu e venceu!'
];

export const effects = {
    scaleshot: '2–5 acertos; Speed +1 e Defense −1 ao acertar.',
    dragondarts: 'Dois acertos.',
    dracometeor: 'Special Attack −2 após acertar.',
    makeitrain: 'Special Attack −1 após acertar.',
    closecombat: 'Defense e Special Defense −1.',
    headlongrush: 'Defense e Special Defense −1.',
    bravebird: 'Recuo de 1/3 do dano causado.',
    woodhammer: 'Recuo de 1/3 do dano causado.',
    hornleech: 'Recupera metade do dano causado.',
    rapidspin: 'Speed +1 e remove armadilhas do seu lado.',
    saltcure: 'Dano residual: 1/4 do HP para Água/Aço; 1/8 para os demais.',
    ceaselessedge: 'Adiciona uma camada de Spikes; sem reservas, não há dano de entrada.',
    suckerpunch: 'Falha se o alvo já agiu ou não selecionou ataque.',
    thunderclap: 'Falha se o alvo já agiu ou não selecionou ataque.',
    acrobatics: 'Potência dobrada sem item.',
    knockoff: 'Potência ×1,5 e remove item removível.',
    highjumpkick: 'Perde metade do HP máximo se errar ou atingir imunidade.',
    uturn: 'Causa dano; não troca em batalhas 1×1 sem reservas.',
    freezedry: 'É super-efetivo contra Água; 10% de congelar.',
    outrage: 'Trava por 2–3 turnos; confusão ao terminar.',
    ivycudgel: 'Tipo Água na forma Wellspring; sem mecânica de crítico neste jogo.',
    grassyglide: 'Sem terreno ativo: prioridade 0.',
    bodypress: 'Usa Defense no lugar de Attack.',
    sparklingaria: 'Remove queimadura do alvo após causar dano.'
};
