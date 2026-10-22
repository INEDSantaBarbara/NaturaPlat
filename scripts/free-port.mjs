#!/usr/bin/env node
/**
 * Libera el puerto de desarrollo compartido por los proyectos MILAB.
 *
 * Todos los proyectos usan el puerto 4173. Un servidor viejo (o de otro
 * proyecto) impide levantar el propio y el navegador puede mostrar una página
 * cacheada que no corresponde. Este script identifica los procesos en escucha
 * y los cierra: primero con SIGTERM y, si no responden, con SIGKILL.
 *
 * Uso:
 *   node scripts/free-port.mjs            # libera 4173
 *   node scripts/free-port.mjs 8080       # libera otro puerto
 *   node scripts/free-port.mjs --check    # solo informa; no mata nada
 *
 * Códigos de salida: 0 puerto libre, 1 puerto ocupado o no se pudo liberar,
 * 2 uso inválido o falta `ss`/`lsof`.
 */

import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const portArg = args.find((arg) => /^\d+$/.test(arg));
const port = Number(portArg ?? process.env.PORT ?? 4173);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('✗ Puerto inválido. Uso: node scripts/free-port.mjs [puerto] [--check]');
  process.exit(2);
}

function run(command, commandArgs) {
  try {
    return execFileSync(command, commandArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

/** PIDs en escucha según `ss` (Linux), o null si la herramienta no está. */
function pidsFromSs() {
  const output = run('ss', ['-ltnp']);
  if (output === null) return null;

  const pids = new Set();
  const localPort = new RegExp(`[:.]${port}\\s`);
  for (const line of output.split('\n')) {
    if (!localPort.test(line)) continue;
    for (const match of line.matchAll(/pid=(\d+)/g)) pids.add(Number(match[1]));
  }
  return pids;
}

/** PIDs en escucha según `lsof` (Linux/macOS), o null si no está. */
function pidsFromLsof() {
  const output = run('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN']);
  if (output === null) return null;

  return new Set(
    output
      .split(/\s+/)
      .filter(Boolean)
      .map(Number)
      .filter((pid) => Number.isInteger(pid) && pid > 0)
  );
}

function listeners() {
  const fromSs = pidsFromSs();
  const fromLsof = pidsFromLsof();

  if (fromSs === null && fromLsof === null) {
    console.error('✗ No se encontró `ss` ni `lsof`. Instala uno para liberar el puerto.');
    process.exit(2);
  }
  if (fromSs && fromSs.size > 0) return fromSs;
  return fromLsof ?? fromSs ?? new Set();
}

function describe(pids) {
  const list = [...pids].join(',');
  const details = run('ps', ['-o', 'pid=,comm=,args=', '-p', list]);
  console.log(details ? details.trimEnd() : `PIDs: ${list}`);
}

const pids = listeners();

if (pids.size === 0) {
  console.log(`✓ Puerto ${port} libre.`);
  process.exit(0);
}

console.log(`✗ Puerto ${port} ocupado por:`);
describe(pids);

if (checkOnly) {
  console.log('  Libera con: make free-port');
  process.exit(1);
}

const targets = [...pids].filter((pid) => pid > 1 && pid !== process.pid);
if (targets.length === 0) {
  console.error('✗ El puerto lo ocupa un proceso protegido; ciérralo manualmente.');
  process.exit(1);
}

for (const pid of targets) {
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    /* el proceso ya terminó o no tenemos permiso */
  }
}

for (let attempt = 0; attempt < 50; attempt += 1) {
  if (listeners().size === 0) break;
  await delay(100);
}

let remaining = listeners();
if (remaining.size > 0) {
  console.log('Forzando cierre con SIGKILL...');
  for (const pid of remaining) {
    if (pid <= 1 || pid === process.pid) continue;
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      /* sin permiso o ya terminó */
    }
  }
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (listeners().size === 0) break;
    await delay(100);
  }
  remaining = listeners();
}

if (remaining.size > 0) {
  console.error(`✗ No se pudo liberar el puerto ${port}.`);
  process.exit(1);
}

console.log(`✓ Puerto ${port} libre.`);
