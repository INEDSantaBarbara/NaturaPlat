import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PUBLIC = join(ROOT, 'public');
const html = readFileSync(join(PUBLIC, 'index.html'), 'utf8');

test('el documento declara idioma, título y descripción', () => {
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<title>[^<]{10,}<\/title>/);
  const description = html.match(/<meta\b[^>]*name="description"[^>]*>/);
  assert.ok(description, 'falta meta description');
  const content = description[0].match(/content="([^"]+)"/);
  assert.ok(content && content[1].length >= 40, 'la descripción debe tener al menos 40 caracteres');
});

test('hay un solo h1 y todas las secciones tienen título', () => {
  const h1 = html.match(/<h1[\s>]/g) || [];
  assert.equal(h1.length, 1, 'debe haber exactamente un h1');
  const sections = html.match(/<section[\s>]/g) || [];
  const h2 = html.match(/<h2[\s>]/g) || [];
  assert.ok(sections.length > 0, 'debe haber secciones');
  assert.ok(h2.length >= sections.length, 'cada sección necesita un h2');
});

test('los id son únicos', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `id duplicado: ${ids.join(', ')}`);
});

test('todas las referencias locales existen dentro de public/', () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)]
    .map((m) => m[1])
    .filter((ref) => !ref.startsWith('//'));
  assert.ok(refs.length > 0);
  for (const ref of refs) {
    assert.ok(existsSync(join(PUBLIC, ref)), `falta el archivo referenciado: ${ref}`);
  }
});

test('las imágenes tienen alt y no hay manejadores inline', () => {
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(img[0], /\salt="[^"]*"/, `imagen sin alt: ${img[0]}`);
  }
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'no se permiten manejadores inline (on*)');
});

test('los formularios marcan los errores de forma accesible', () => {
  assert.match(html, /id="checkoutError"[^>]*role="alert"/);
  assert.match(html, /id="contactError"[^>]*role="alert"/);
});

test('el sitio avisa que es una demostración', () => {
  assert.match(html, /demostraci[oó]n/i);
  assert.match(html, /no se procesa/i);
});

test('tokens.css se carga antes que styles.css', () => {
  const tokens = html.indexOf('css/tokens.css');
  const styles = html.indexOf('css/styles.css');
  assert.ok(tokens > -1, 'falta el enlace a css/tokens.css');
  assert.ok(styles > -1, 'falta el enlace a css/styles.css');
  assert.ok(tokens < styles, 'tokens.css debe cargarse antes');
});

test('el JavaScript no usa innerHTML con datos', () => {
  const js = readFileSync(join(PUBLIC, 'js/main.js'), 'utf8');
  for (const match of js.matchAll(/innerHTML\s*=\s*([^;]+);/g)) {
    assert.match(match[1].trim(), /^''$/, 'innerHTML solo puede limpiarse con cadena vacía');
  }
});

test('la clave de almacenamiento usa el prefijo del proyecto', () => {
  const js = readFileSync(join(PUBLIC, 'js/main.js'), 'utf8');
  assert.match(js, /STORAGE_KEY\s*=\s*'naturaplat\./);
});

test('no hay hexadecimales fuera de tokens.css', () => {
  const files = readdirSync(join(PUBLIC, 'css')).filter((f) => f.endsWith('.css'));
  for (const file of files) {
    const css = readFileSync(join(PUBLIC, 'css', file), 'utf8');
    if (file === 'tokens.css') {
      assert.match(css, /:root\s*\{/);
      continue;
    }
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, `hexadecimal fuera de tokens.css en ${file}`);
  }
});
