# Pedro's Ball

Simulador de futebol em HTML5, CSS3 e JavaScript puro. Escolha um clube, acompanhe dez rodadas e descubra quem fica com a taça.

## Executar

Abra `index.html` no navegador ou use o Live Server do VS Code. Nenhuma instalação ou biblioteca externa é necessária. Os componentes visuais — escudos estilizados, campo, cartões de partidas, tabela e confetes — são feitos com HTML e CSS e funcionam sem conexão.

## Como jogar

1. Selecione seu clube e clique em **Iniciar campeonato**.
2. Clique no jogo destacado do seu time. O computador simula todas as seis partidas da rodada.
3. Confira os placares e a tabela. Avance para a próxima rodada e repita até completar dez.
4. Confira as semifinais: **1º × 4º** e **2º × 3º**.
5. Simule as semifinais e depois a final para conhecer o campeão.

Caso seu clube seja eliminado, você pode continuar acompanhando o campeonato até a final. “Nova temporada” permite reiniciar com confirmação. Ao terminar, “Jogar outra temporada” retorna à seleção de clubes. Recarregar a página reinicia a partida; não há persistência.

## Regras

- Vitória: **3 pontos**. Empate: **1 ponto para cada clube**. Derrota: **0**.
- 12 clubes, seis jogos por rodada e dez rodadas, sem repetição de adversários. O método circular gera 11 rodadas e o jogo utiliza as primeiras dez.
- Desempates: pontos, vitórias, saldo de gols, gols marcados e nome em ordem alfabética.
- Semifinais e final em jogo único. Empates são resolvidos por uma simulação de pênaltis, exibida junto ao resultado.
- Mata-mata não altera a classificação da fase inicial.
- Todos os clubes usam a mesma distribuição aleatória de gols, sem atributos de força.

Seleção ilustrativa de clubes brasileiros de destaque, sem compromisso com a composição oficial da Série A de uma temporada específica. O formato é fictício e não tem vínculo com a CBF ou com os clubes. Os escudos são representações gráficas próprias, não logotipos oficiais.

## Organização e conceitos para aula

- `index.html`: estrutura semântica e componentes da interface.
- `css/style.css`: layout responsivo, escudos em CSS, campo e animações; respeita a preferência por movimento reduzido.
- `js/engine.js`: calendário, resultados, pontuação, ordenação e mata-mata, separados do DOM.
- `js/script.js`: eventos, seleção de time, estados da interface e renderização.
- `tests/engine.test.cjs`: verificação de temporadas completas usando somente o Node.js.

Trabalha arrays, objetos, funções, números aleatórios, ordenação, eventos, máquinas de estado, DOM e separação entre regras e interface. JavaScript com indentação de quatro espaços.

## Verificar

Com Node.js instalado:

```sh
node --check js/engine.js
node --check js/script.js
node tests/engine.test.cjs
```

No navegador: teste escolha por teclado, cliques repetidos, dez rodadas, time fora do G4, semifinais, final, reinício e tela pequena. A tabela permite rolagem horizontal quando necessário.

## Desafios

Adicionar persistência, mais clubes, forças diferentes, histórico de temporadas e comentários de partida. Para reproduzir uma competição oficial, atualize os participantes e o regulamento correspondente.
