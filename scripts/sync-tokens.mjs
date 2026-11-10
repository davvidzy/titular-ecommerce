/*
  sync-tokens — copia brand/tokens.css para assets/tokens.css

  O Shopify só serve arquivos de assets/, então o tema carrega uma cópia
  dos tokens. A origem continua sendo brand/tokens.json -> brand/tokens.css
  (ver CLAUDE.md). Depois de regenerar brand/tokens.css, rode:

    node scripts/sync-tokens.mjs          # copia
    node scripts/sync-tokens.mjs --check  # só confere (falha se divergir)
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'brand', 'tokens.css');
const dest = join(root, 'assets', 'tokens.css');

const source = readFileSync(src, 'utf8');
let current = '';
try { current = readFileSync(dest, 'utf8'); } catch {}

if (process.argv.includes('--check')) {
  if (source !== current) {
    console.error('assets/tokens.css está diferente de brand/tokens.css. Rode: node scripts/sync-tokens.mjs');
    process.exit(1);
  }
  console.log('tokens em dia.');
} else {
  writeFileSync(dest, source);
  console.log('assets/tokens.css atualizado a partir de brand/tokens.css.');
}
