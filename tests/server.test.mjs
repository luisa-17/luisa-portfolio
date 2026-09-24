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
    assert.match(source, /offlineAsk/);
    assert.match(source, /tell me more/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('leadership routes support direct visits and shared assets', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/leadership', '/leadership/', '/leadership.html']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /Leadership &amp; Involvement/);
      for (const id of ['leadership', 'technology-communities', 'events-initiatives', 'hosting', 'events-production']) {
        assert.ok(html.includes(`id="${id}"`), id);
      }
      assert.match(html, /href="index.html"/);
      assert.doesNotMatch(html, /id="(?:mainNav|siteHeader|menuToggle)"/);
      const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
      for (const link of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(link[1]), link[1]);
      // The base must represent the page itself so fragments never navigate home.
      const pageBase = new URL('/leadership', base);
      for (const link of html.matchAll(/href="([^" ]+)"/g)) {
        if (link[1].startsWith('#')) assert.equal(new URL(link[1], pageBase).pathname, '/leadership');
      }
      for (const asset of [...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)]) {
        assert.equal((await fetch(new URL(asset[1], base), { method: 'HEAD' })).status, 200, asset[1]);
      }
    }
    const home = await (await fetch(base)).text();
    const nav = home.match(/<nav class="nav"[\s\S]*?<\/nav>/)[0];
    assert.deepEqual([...nav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), ['home', 'about', 'experience', 'projects', 'certifications', 'contact']);
    assert.equal([...home.matchAll(/class="certificate-photo"/g)].length, 25);
    assert.doesNotMatch(home, /id="(?:services|leadership|beyond-work)"/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
