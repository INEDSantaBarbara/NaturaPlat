import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CSS = join(ROOT, 'public/css');
const tokens = readFileSync(join(CSS, 'tokens.css'), 'utf8');
const files = readdirSync(CSS).filter((f) => f.endsWith('.css'));

function customProperties(css) {
  return new Set([...css.matchAll(/--([a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
}

test('toda variable usada está definida en tokens.css', () => {
  const defined = customProperties(tokens);
  const missing = [];
  for (const file of files) {
    const css = readFileSync(join(CSS, file), 'utf8');
    for (const match of css.matchAll(/var\(--([a-z0-9-]+)/gi)) {
      if (!defined.has(match[1])) missing.push(`${file}: --${match[1]}`);
    }
  }
  assert.deepEqual(missing, [], `variables sin definir: ${missing.join(', ')}`);
});

test('tokens.css no contiene reglas de componentes', () => {
  const selectors = [...tokens.matchAll(/^([^{}\n]+)\{/gm)].map((m) => m[1].trim());
  assert.deepEqual(selectors, [':root']);
});

test('los tokens conservan los seis roles de la marca', () => {
  for (const token of ['follaje', 'sombra', 'hoja', 'lavada', 'fibra', 'cascara']) {
    assert.match(tokens, new RegExp(`--${token}\\s*:`), `falta --${token}`);
  }
});
