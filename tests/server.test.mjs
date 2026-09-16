import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from '../server.mjs';
test('offline server exposes no API or private files', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(base + '/')).status, 200);
    for (const file of ['/api/chat', '/.env', '/server.mjs', '/.git/config']) assert.equal((await fetch(base + file)).status, 404);
    assert.equal((await fetch(base + '/api/chat', { method: 'POST' })).status, 405);
    const source = await readFile(new URL('../assets/js/chat.js', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|WebSocket|sendBeacon/);
    assert.match(source, /tell me more/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
