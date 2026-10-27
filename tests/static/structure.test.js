import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PUBLIC = join(ROOT, 'public');
const html = readFileSync(join(PUBLIC, 'index.html'), 'utf8');
const slides = html
  .split(/<section\b/)
  .slice(1)
  .filter((block) => block.includes('data-chapter='));

test('el documento declara idioma, título y descripción', () => {
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<title>[^<]{10,}<\/title>/);
  const meta = html.match(/<meta\b[^>]*name="description"[^>]*>/);
  assert.ok(meta, 'falta meta description');
  assert.ok((meta[0].match(/content="([^"]+)"/)?.[1] || '').length >= 40);
});

test('hay un solo h1 y 18 diapositivas con título', () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.equal(slides.length, 18, 'el recorrido debe tener 18 diapositivas');
  for (const block of slides) assert.match(block, /<h[12][\s>]/, 'diapositiva sin título');
});

test('hay siete capítulos y cada uno tiene pestaña', () => {
  const names = ['inicio', 'problema', 'producto', 'proceso', 'impacto', 'equipo', 'cierre'];
  for (const name of names) {
    assert.match(html, new RegExp(`class="chap"[^>]*data-chapter="${name}"`));
    assert.match(html, new RegExp(`data-chapter="${name}"`));
  }
});

test('los id son únicos', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('las referencias locales existen dentro de public/', () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((match) => match[1]);
  for (const ref of refs) assert.ok(existsSync(join(PUBLIC, ref)), `falta ${ref}`);
});

test('las imágenes tienen alt y no hay manejadores inline', () => {
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\salt="[^"]*"/);
  }
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
});

test('el video del producto tiene poster y fuente local', () => {
  const video = html.match(/<video\b[^>]*id="productVideo"[^>]*>/);
  assert.ok(video, 'falta el video del producto');
  assert.match(video[0], /\bmuted\b/);
  assert.match(video[0], /\bloop\b/);
  assert.match(video[0], /\bplaysinline\b/);
  const poster = video[0].match(/poster="([^"]+)"/)?.[1];
  assert.ok(poster && existsSync(join(PUBLIC, poster)), 'falta el poster del video');
  const source = html.match(/<source\s+src="(video\/[^"]+\.mp4)"/);
  assert.ok(source && existsSync(join(PUBLIC, source[1])), 'falta la fuente del video');
});

test('las fotos usan srcset, dimensiones y carga diferida', () => {
  const photos = [...html.matchAll(/<img\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => /img\/(evidencia|producto)\//.test(tag));
  assert.ok(photos.length >= 5);
  for (const photo of photos) {
    assert.match(photo, /srcset=/);
    assert.match(photo, /\swidth="/);
    assert.match(photo, /\sheight="/);
    assert.match(photo, /loading="(lazy|eager)"/);
  }
});

test('el checkout marca el error de forma accesible', () => {
  assert.match(html, /id="checkoutError"[^>]*role="alert"/);
});

test('el sitio avisa que es una demostración', () => {
  assert.match(html, /demostraci[oó]n/i);
  assert.match(html, /no se procesa/i);
});

test('tokens.css se carga antes que styles.css', () => {
  assert.ok(html.indexOf('css/tokens.css') > -1);
  assert.ok(html.indexOf('css/tokens.css') < html.indexOf('css/styles.css'));
});

test('el JavaScript no usa innerHTML', () => {
  for (const file of readdirSync(join(PUBLIC, 'js'))) {
    const source = readFileSync(join(PUBLIC, 'js', file), 'utf8');
    assert.doesNotMatch(source, /innerHTML\s*=/, `${file} usa innerHTML`);
  }
});

test('la clave del carrito usa el prefijo del proyecto', () => {
  const source = readFileSync(join(PUBLIC, 'js/cart.js'), 'utf8');
  assert.match(source, /STORAGE_KEY\s*=\s*'naturaplat\./);
});

test('el impacto conserva siete pasos y diez fuentes', () => {
  assert.equal((html.match(/Impacto · Paso \d de 7/g) || []).length, 7);
  const sources = html.split('class="sources"')[1].split('</ol>')[0];
  assert.equal((sources.match(/<li>/g) || []).length, 10);
});

test('los gráficos tienen rol de imagen y descripción', () => {
  for (const id of ['imp-person-chart', 'imp-terr-chart']) {
    const tag = html.match(new RegExp(`<svg[^>]*id="${id}"[^>]*>`));
    assert.ok(tag, `falta ${id}`);
    assert.match(tag[0], /role="img"/);
    assert.match(tag[0], /aria-label="[^"]{20,}"/);
  }
});

test('no hay hexadecimales fuera de tokens.css', () => {
  for (const file of readdirSync(join(PUBLIC, 'css')).filter((name) => name.endsWith('.css'))) {
    const css = readFileSync(join(PUBLIC, 'css', file), 'utf8');
    if (file === 'tokens.css') {
      assert.match(css, /:root\s*\{/);
      continue;
    }
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, `hexadecimal fuera de tokens.css en ${file}`);
  }
});
