/**
 * Servidor de desarrollo local sin dependencias.
 *
 * Sirve public/ y responde siempre con `Cache-Control: no-cache, must-revalidate`.
 * Todos los proyectos MILAB comparten el puerto 4173: sin esa cabecera el navegador
 * puede mostrar la página cacheada de otro proyecto (ver estándar MILAB v2, regla 3).
 *
 * Uso:
 *   node server.js
 *   make run
 *
 * Variables de entorno:
 *   HOST  (127.0.0.1)
 *   PORT  (4173)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(PROJECT_ROOT, 'public');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 4173;

/**
 * Carga .env.local si existe. El servidor de desarrollo no necesita dependencias
 * y así la guía puede probarse en local sin exportar variables a mano.
 */
function loadEnvFile() {
  const file = path.join(PROJECT_ROOT, '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** Resuelve una URL a un archivo dentro de ROOT, o null si no es seguro. */
function safeFile(urlPath) {
  let rel;
  try {
    rel = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  if (rel === '/' || rel === '') rel = '/index.html';
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT + path.sep)) return null;
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return null;
  return abs;
}

function sendText(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = (req.url || '/').split('?')[0];

  if (url === '/api/chat') {
    const { default: chat } = await import('./api/chat.js');
    await chat(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 405, '405 - Método no permitido');
    return;
  }

  const file = safeFile(url);
  if (!file) {
    sendText(res, 404, '404 - No encontrado');
    return;
  }

  const ext = path.extname(file).toLowerCase();
  const stat = fs.statSync(file);
  const lastModified = stat.mtime.toUTCString();

  if (req.headers['if-modified-since']) {
    const since = new Date(req.headers['if-modified-since']);
    if (!isNaN(since.getTime()) && since >= new Date(stat.mtime)) {
      res.statusCode = 304;
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.setHeader('Last-Modified', lastModified);
      res.end();
      return;
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Last-Modified', lastModified);

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log('┌───────────────────────────────────────────────────────────');
  console.log('│  NaturaPlát · vajilla biodegradable');
  console.log('├───────────────────────────────────────────────────────────');
  console.log('│  Abre la página:  http://' + HOST + ':' + PORT);
  console.log('│  Sin caché: se envía Cache-Control: no-cache, must-revalidate');
  console.log('└───────────────────────────────────────────────────────────');
});
