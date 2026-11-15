# Procedência dos recursos

## Personagens

Os 20 arquivos `public/images/*.svg` foram desenhados por código para este projeto, em `scripts/create-art.js`. Não derivam de downloads de sprites, screenshots, ripagens ou modelos comerciais. São ilustrações estilizadas inspiradas nos personagens e identificadas como tal; os direitos sobre os personagens e marcas Pokémon permanecem com seus titulares.

Cada arquivo mantém o identificador do catálogo, incluindo `ogerponwellspring`, `samurotthisui` e `zamazenta` (forma padrão, sem escudo equipado). Não há substituição por outro Pokémon ou por modelo oficial genérico.

## Pesquisa de modelos

Fontes consultadas: [Sketchfab e suas licenças](https://sketchfab.com/licenses), [regras de atribuição e download](https://sketchfab.com/developers/download-api/guidelines) e catálogos de modelos de Dragonite. Um resultado chamado [Dragonite (Official)](https://sketchfab.com/3d-models/dragonite-official-874c7fcdbd344c7bb9e8ed3e6a04dfac) não foi utilizado: o rótulo não comprova autorização dos titulares ou ausência de extração comercial. A existência de uma licença declarada pelo uploader não foi tomada como prova de origem autorizada.

Não foi verificado um conjunto completo de vinte GLB/glTF utilizável e redistribuível com essa procedência. Por isso **nenhum modelo externo foi baixado ou incluído**. O projeto utiliza a alternativa explícita permitida no requisito: ilustrações em planos no cenário Three.js. Para integrar modelos futuros, registre autor, URL exata, licença, atribuições, evidência de origem e correspondência de forma antes de substituir o plano.

## Cenário, efeitos e som

- Arena, anéis, grade, torres, materiais e partículas: geometrias procedurais próprias com Three.js.
- Animações: código do projeto usando GSAP.
- Música e efeitos: sequência e tons sintetizados pela Web Audio API em `src/services/audio.js`; sem samples ou trilhas de terceiros.
- Tipografia: fontes do sistema; nenhuma fonte externa.

## Dados

`src/data/catalog.json` é um recorte produzido por `scripts/create-data.js` a partir de `@pkmn/dex` 0.10.15, origem Pokémon Showdown. Contém atributos base, tipos, potência, precisão, categoria, prioridade, efeitos secundários e descrições curtas de movimentos. A lógica de combate deste jogo é própria e simplificada; não inclui o simulador completo Showdown.

- https://github.com/pkmn/ps
- https://github.com/pkmn/ps/blob/main/LICENSE
- https://github.com/smogon/pokemon-showdown
- https://github.com/smogon/pokemon-showdown/blob/master/LICENSE

Avisos MIT preservados em `public/THIRD_PARTY_NOTICES.txt`, copiado ao build. As descrições de movimentos são mantidas em inglês quando não há explicação própria em português.
