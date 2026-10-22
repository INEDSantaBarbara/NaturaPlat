import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = join(ROOT, 'scripts/free-port.mjs');
const SERVER = join(ROOT, 'server.js');

function runNode(args) {
  return new Promise((resolvePromise) => {
    execFile(process.execPath, args, { cwd: ROOT }, (error, stdout, stderr) => {
      resolvePromise({ code: error ? Number(error.code) : 0, stdout, stderr });
    });
  });
}

/** Pide al sistema un puerto libre y lo devuelve cerrado. */
async function findFreePort() {
  return new Promise((resolvePromise, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePromise(port));
    });
  });
}

async function waitForPort(port, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const open = await new Promise((resolvePromise) => {
      const socket = net.connect({ port, host: '127.0.0.1' });
      socket.once('connect', () => {
        socket.destroy();
        resolvePromise(true);
      });
      socket.once('error', () => resolvePromise(false));
    });
    if (open) return;
    await delay(100);
  }
  throw new Error(`el puerto ${port} no abrió a tiempo`);
}

async function isFree(port) {
  return new Promise((resolvePromise) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      resolvePromise(false);
    });
    socket.once('error', () => resolvePromise(true));
  });
}

function startServer(port) {
  return spawn(process.execPath, [SERVER], {
    cwd: ROOT,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: 'ignore',
  });
}

test('si el puerto está libre, no falla', async () => {
  const port = await findFreePort();
  const result = await runNode([SCRIPT, String(port), '--check']);
  assert.equal(result.code, 0);
  assert.match(result.stdout, new RegExp(`Puerto ${port} libre`));
});

test('--check detecta el ocupante sin matarlo', async () => {
  const port = await findFreePort();
  const child = startServer(port);
  const exited = new Promise((resolvePromise) => child.once('exit', resolvePromise));
  try {
    await waitForPort(port);
    const result = await runNode([SCRIPT, String(port), '--check']);
    assert.equal(result.code, 1);
    assert.match(result.stdout + result.stderr, new RegExp(`Puerto ${port} ocupado`));
    assert.equal(await isFree(port), false, 'el proceso debe seguir vivo');
  } finally {
    child.kill('SIGKILL');
    await exited;
  }
});

test('libera el puerto y termina el servidor', async () => {
  const port = await findFreePort();
  const child = startServer(port);
  const exited = new Promise((resolvePromise) => child.once('exit', resolvePromise));
  try {
    await waitForPort(port);
    const result = await runNode([SCRIPT, String(port)]);
    assert.equal(result.code, 0);
    assert.match(result.stdout, new RegExp(`Puerto ${port} libre`));
    await exited;
    assert.equal(await isFree(port), true);
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL');
  }
});
