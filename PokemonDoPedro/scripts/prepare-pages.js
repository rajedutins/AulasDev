import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
// Copia somente a versão compilada para o caminho servido pelo Pages.
// Os fontes permanecem em src/; node_modules e dist não são enviados ao Git.
if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('Execute o build primeiro.');
for (const entry of fs.readdirSync(output, { withFileTypes: true })) {
    const source = path.join(output, entry.name);
    const target = path.join(root, entry.name);
    if (!['index.html', 'assets', 'images', 'THIRD_PARTY_NOTICES.txt'].includes(entry.name)) {
        throw new Error(`Saída de build inesperada: ${entry.name}`);
    }
    fs.cpSync(source, target, { recursive: true });
}
console.log('GitHub Pages preparado em PokemonDoPedro/. Fontes preservados em src/.');
