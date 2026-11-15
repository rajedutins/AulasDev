# PokemonDoPedro — Pokémon Battle Arena

**O desafio dos campeões.** Jogo de batalhas Pokémon 1×1 desenvolvido com HTML5, CSS3, JavaScript ES Modules, Vite, Three.js, GSAP, Web Audio API e LocalStorage. Funciona inteiramente no navegador, sem servidor de autenticação ou banco de dados externo.

## Executar no VS Code

Requisitos: Node.js 22.12+ (ou 20.19+) e npm. No terminal:

```powershell
cd C:\Users\WORK\Documents\aulas\programacao\AulasDev\PokemonDoPedro
npm.cmd ci
npm.cmd run dev
```

Abra o endereço local que o Vite apresentar. **Os fontes usam Vite e ficam em `src/`, incluindo `src/index.html`.** O `index.html` da raiz é gerado para publicação. No PowerShell, `.cmd` evita problemas com a política de execução de scripts do npm.

## Como jogar

1. Clique em **Iniciar batalha** e escolha dois Pokémon diferentes. O primeiro será o lado controlado pelo jogador no modo Desafio.
2. Consulte tipos, atributos e os três movimentos de cada Pokémon nas prévias ampliadas.
3. Escolha o modo: **Desafio** (lado 2 controlado pela IA) ou **Estratégico** (o jogador escolhe ambos os movimentos).
4. Inicie o confronto. Selecione os movimentos e clique em **Executar turno**.
5. Acompanhe os efeitos, o HP, a pontuação e o diário. A batalha termina com o primeiro nocaute, incluindo eventuais efeitos de recuo do golpe decisivo.
6. Consulte a celebração, os resultados, o ranking e o histórico. É possível jogar nova batalha ou revanche.

No campeonato, escolha 4, 8 ou 16 Pokémon. A ordem de seleção define os pares iniciais; **Sortear participantes** oferece uma seleção aleatória. Antes de começar cada fase, **Organizar confrontos desta fase** permite reorganizar manualmente os pares ou sorteá-los entre os classificados. Depois da primeira batalha da fase, o chaveamento dessa fase fica travado. Você joga cada confronto, escolhendo movimentos ou enfrentando a IA conforme o modo selecionado. Em empate, o mesmo confronto é repetido. **Ver chave** e **Retomar campeonato** permitem acompanhar e continuar a competição.

## Funcionalidades

- Os vinte Pokémon e todos os movimentos definidos no documento de requisitos, incluindo formas Wellspring, Hisuian Samurott e Zamazenta Hero of Many Battles.
- Atributos base provenientes do catálogo Pokémon Showdown via `@pkmn/dex`; dados locais, sem chamada de API durante a partida.
- Tabela de efetividade dos dezoito tipos e multiplicação para tipos duplos.
- Ordem por prioridade, Speed modificada e desempate aleatório.
- Dano físico/especial, Defense para Body Press, STAB, imunidade, variação aleatória, estágios, precisão e efeitos de movimentos.
- Acertos múltiplos, recuo, recuperação, Salt Cure, Spikes, remoção de item, movimentos condicionais, travamento de Outrage, confusão e efeitos secundários.
- IA com estimativa de dano, efetividade, prioridade, HP, recuperação e recuo. Não lê a escolha atual do jogador.
- Arena Three.js com câmera orbital, iluminação, planos de personagens, animações GSAP e partículas coloridas por tipo.
- Ranking com os vinte Pokémon, vitórias, derrotas, empates, taxa de vitória e pontos.
- Histórico com data/hora local, HP, pontos, turnos, golpes, dano direto e eventos de combate.
- Histórico de campeonatos concluídos e chave visual das fases.
- Áudio sintetizado original, ativado somente após interação, com opção de desligar.
- Preferência de efeitos e respeito a `prefers-reduced-motion`.
- Interface responsiva, controles por teclado, mensagens de estado e fallback 2D se WebGL não estiver disponível.

## Padrões de combate e simplificações

Todos começam no **nível 50**, com **IV 31 em todos os atributos, EV 0 e natureza neutra**. HP = `floor((2 × base + 31) × 50 / 100) + 60`; demais atributos = `floor((2 × base + 31) × 50 / 100) + 5`.

O dano usa a estrutura `(((2 × nível / 5 + 2) × potência × ataque / defesa) / 50 + 2) × STAB × efetividade × variação × queimadura`, com arredondamentos intermediários simplificados. Variação inteira entre 85% e 100%; sem críticos.

- Sem habilidades, clima, terreno, Terastal, reservas ou regras de equipe. Portanto, Zamazenta não recebe Dauntless Shield, Cinderace não usa Libero, etc.
- PP ilimitado; não é um simulador competitivo completo nem reproduz todos os arredondamentos dos jogos comerciais.
- Sucker Punch e Thunderclap falham se o adversário já agiu. Todos os movimentos selecionáveis são de dano.
- Dragon Darts tem dois acertos. Scale Shot tem 2/3/4/5 acertos com chances de 35%/35%/15%/15%, com teste de precisão único.
- Draco Meteor e Make It Rain reduzem Special Attack; Close Combat e Headlong Rush reduzem ambas as defesas; Rapid Spin aumenta Speed; Scale Shot aumenta Speed e reduz Defense.
- Brave Bird e Wood Hammer aplicam recuo. Horn Leech cura com base no dano real. High Jump Kick aplica penalidade de metade do HP máximo ao errar ou encontrar imunidade.
- Salt Cure causa dano residual de 1/4 do HP máximo em Água/Aço, 1/8 nos demais. Se um residual nocauteia, a batalha termina antes do próximo efeito residual.
- Ceaseless Edge registra até três camadas de Spikes; sem reservas e trocas, não existe entrada para ativar o dano. Rapid Spin limpa essas camadas.
- U-turn causa dano e não troca. Acrobatics dobra sem item. Knock Off remove itens removíveis e aumenta a potência nesses casos.
- Ogerpon Wellspring possui máscara fixa, tipo Planta/Água e Ivy Cudgel de Água. A máscara não é removível e não concede bônus adicional de dano neste protótipo. Demais Pokémon começam sem item ou, na batalha livre, com Training Charm removível e sem bônus.
- Outrage trava por 2–3 turnos e termina em confusão. Estados de paralisia, queimadura, veneno e congelamento e efeitos secundários são processados sem habilidades. Não há animação específica para cada estado.
- Empate por nocaute duplo ou limite de 200 turnos; no campeonato, o usuário repete o confronto.
- Ranking e histórico persistem no navegador. Campeonatos em andamento e batalhas parciais não são restaurados após recarregar; campeonatos concluídos são salvos. Não existe sincronização entre dispositivos.

## Pontuação

Participação +10 por Pokémon; movimento que causa dano +5; +1 por cada dez HP efetivamente removidos **por movimento** (arredondado para baixo); super-efetivo com dano +15; vitória +100; vitória com mais de 50% do HP +50; vitória sem receber qualquer dano +100 adicionais. Dano excedente não pontua. Movimentos múltiplos pontuam como um único ataque. Residual, confusão e recuo não pontuam como ataque. A pontuação é independente de HP e potência.

## Arte e modelos 3D — limitação explícita

**Os vinte personagens são ilustrações vetoriais estilizadas próprias renderizadas em planos 3D, não modelos volumétricos ou oficiais de Pokémon.** As alternativas são identificadas na arena e no rodapé. Os desenhos são aproximações estilizadas; não têm fidelidade de sprites comerciais. O cenário, iluminação, profundidade e câmera são tridimensionais.

Nenhum GLB/glTF, sprite comercial ou arquivo extraído de jogo foi incluído. A pesquisa de modelos não produziu um conjunto com origem, licença e autorização verificáveis para os vinte personagens. Um arquivo rotulado como “official” ou “free” em um site de modelos não foi tratado como autorização para redistribuição. Consulte `ASSETS.md`.

As texturas são carregadas assincronamente e mantidas em cache limitado aos personagens ativos; geometrias, materiais e texturas fora de uso são descartados. A renderização pausa fora da arena e quando a aba está oculta; a resolução usa limite de pixel ratio. Falha na inicialização WebGL mantém o combate disponível com imagens 2D.

## Estrutura

```text
PokemonDoPedro/
├── index.html / assets/ / images/  # Versão compilada para o GitHub Pages
├── package.json / package-lock.json
├── vite.config.js / playwright.config.js
├── public/images/                  # 20 SVGs locais
├── public/THIRD_PARTY_NOTICES.txt
├── scripts/
│   ├── create-data.js              # Extrai catálogo com procedência
│   └── create-art.js               # Gera ilustrações vetoriais
├── src/
│   ├── main.js                    # Telas e eventos
│   ├── index.html                 # HTML-fonte da aplicação
│   ├── data/                      # Catálogo, tipos, cores, frases
│   ├── game/                      # Dano, turnos, IA e campeonato
│   ├── graphics/arena3d.js         # Three.js e GSAP
│   ├── services/                  # Persistência e Web Audio
│   └── styles/main.css
└── tests/
    ├── game.test.js
    └── browser/arena.spec.js
```

## Build para produção e GitHub Pages

```powershell
npm.cmd run build
npm.cmd run preview
```

O resultado está em **`dist/`**. `base: './'` permite hospedar em uma subpasta. Para preparar a publicação na configuração atual do AulasDev, execute:

```powershell
npm.cmd run prepare:pages
```

Esse comando faz o build e copia a saída para `PokemonDoPedro/index.html`, `assets/`, `images/` e o aviso de terceiros. Os fontes ficam preservados em `src/`. Envie esses arquivos junto com o projeto ao repositório; `node_modules/` e `dist/` permanecem ignorados. Não edite os arquivos compilados manualmente: altere `src/` e repita o comando antes de cada publicação. Não é necessário mudar a configuração de hospedagem dos demais jogos.

Endereço no GitHub Pages: https://rajedutins.github.io/AulasDev/PokemonDoPedro/

## Testes

```powershell
npm.cmd test
npm.cmd run test:browser
```

Os testes unitários usam o test runner nativo do Node, com 190 confrontos únicos entre os vinte Pokémon, cálculos, golpes, tipos, pontuação, persistência e chaveamentos. Os testes de navegador usam Playwright com Microsoft Edge instalado, passando pelo WebGL, batalha completa, ranking, histórico, campeonato e viewport de celular. Ajuste `channel` em `playwright.config.js` caso use outro navegador. Capturas e relatórios são temporários e ignorados pelo Git.

Validação realizada: **18 testes unitários e 5 testes de navegador aprovados**, incluindo animações e fallback sem WebGL. Build de produção concluído. A arena é carregada em módulo separado ao iniciar a primeira batalha. O Vite pode avisar sobre o tamanho do módulo Three.js/GSAP (~583 kB sem compressão); isso não impede o build e os recursos não são carregados no menu inicial.

Para regenerar os dados ou as ilustrações durante o desenvolvimento:

```powershell
npm.cmd run data
node scripts/create-art.js
```

## Dependências e fontes

- [Three.js](https://threejs.org/) — renderização; licença MIT.
- [GSAP](https://gsap.com/docs/v3/) — animações; licença própria Standard, consulte os termos distribuídos no pacote.
- [Vite](https://vite.dev/) — servidor e build; MIT.
- [@pkmn/dex](https://github.com/pkmn/ps/tree/main/dex) — catálogo, dependência de desenvolvimento; MIT.
- [Pokémon Showdown](https://github.com/smogon/pokemon-showdown) — origem dos dados e referência de movimentos; MIT para o código e dados do repositório, não autorização para reutilizar assets comerciais de Pokémon.
- [Playwright](https://playwright.dev/) — testes de navegador; Apache-2.0.

As versões instaladas estão fixadas em `package-lock.json`. Consulte `ASSETS.md` e os avisos de terceiros. Pokémon e os nomes/personagens associados pertencem aos respectivos titulares. Este é um projeto educacional de fã, sem afiliação ou aprovação oficial.
