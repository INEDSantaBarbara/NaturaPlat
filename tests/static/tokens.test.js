import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CSS = join(ROOT, 'public/css');
const tokens = readFileSync(join(CSS, 'tokens.css'), 'utf8');
const files = readdirSync(CSS).filter((name) => name.endsWith('.css'));

const customProperties = (css) =>
  new Set([...css.matchAll(/--([a-z0-9-]+)\s*:/gi)].map((match) => match[1]));

test('la paleta oficial está declarada con sus valores exactos', () => {
  const palette = {
    void: '#317302',
    light: '#f2f2f2',
    leaf: '#58a60a',
    'leaf-soft': '#6fa660',
    lime: '#87d90d',
  };
  for (const [name, value] of Object.entries(palette)) {
    assert.match(tokens, new RegExp(`--np-${name}:\\s*${value};`));
  }
});

test('los roles de texto y error están definidos', () => {
  for (const role of [
    'on-dark',
    'on-dark-soft',
    'ink',
    'ink-soft',
    'danger',
    'line-dark',
    'line-light',
  ]) {
    assert.match(tokens, new RegExp(`--np-${role}\\s*:`), `falta --np-${role}`);
  }
});

test('toda variable usada está definida en tokens.css', () => {
  const defined = customProperties(tokens);
  const missing = [];
  for (const file of files) {
    const css = readFileSync(join(CSS, file), 'utf8');
    for (const match of css.matchAll(/var\(--([a-z0-9-]+)/gi)) {
      if (!defined.has(match[1])) missing.push(`${file}: --${match[1]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('tokens.css solo contiene :root', () => {
  const selectors = [...tokens.matchAll(/^([^{}\n]+)\{/gm)].map((match) => match[1].trim());
  assert.deepEqual(selectors, [':root']);
});

test('las tres familias tipográficas están declaradas', () => {
  for (const family of ['display', 'body', 'mono']) {
    assert.match(tokens, new RegExp(`--np-${family}\\s*:`));
  }
});
