import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/js/latest-updates.js', import.meta.url), 'utf8');
const select = vm.runInNewContext(source + '\nselectRecentUpdates;');
const milestone = date => ({ date, title: 'Verified milestone' });

test('updates include today and the previous 29 days, sorted newest first', () => {
  const entries = ['2026-09-09', '2026-10-09', '2026-09-08', '2026-10-08'].map(milestone);
  const actual = select(entries, new Date('2026-10-08T04:00:00Z'));
  assert.equal(JSON.stringify(actual.map(x => x.date)), JSON.stringify(['2026-10-08', '2026-09-09']));
  assert.equal(entries.length, 4);
});

test('updates expire at Philippine midnight and reject invalid dates', () => {
  const entries = [milestone('2026-09-09'), milestone('2026-02-30'), milestone('bad date')];
  assert.equal(select(entries, new Date('2026-10-08T15:59:59Z')).length, 1);
  assert.equal(select(entries, new Date('2026-10-08T16:00:00Z')).length, 0);
  assert.equal(select([], new Date()).length, 0);
});
