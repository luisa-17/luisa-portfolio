import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('KPIs count published entries, deduplicate tools, and refresh after edits', async () => {
  const source = await readFile(new URL('../assets/js/kpis.js', import.meta.url), 'utf8');
  const output = ['projects', 'tools', 'roles', 'graduation'].map(key => ({ dataset: { portfolioKpi: key } }));
  const tool = (text, competency = false) => ({ textContent: text, closest: () => competency, hasAttribute: () => false });
  const entries = {
    '#projects .project-card': [{}, {}],
    '#experience .timeline-item': [{}],
    '#about .skills-grid .skill-list > span': [tool('Python'), tool(' python '), tool('SQL'), tool('Leadership', true)],
    '[data-portfolio-kpi]': output
  };
  let year = '2026-08';
  let onEdit;
  vm.runInNewContext(source, {
    document: {
      querySelectorAll: selector => entries[selector],
      querySelector: selector => selector === '[data-degree-date]' ? { getAttribute: () => year } : {}
    },
    MutationObserver: class { constructor(callback) { onEdit = callback; } observe() {} }
  });
  assert.deepEqual(output.map(item => item.textContent), ['2', '2', '1', '2026']);
  entries['#projects .project-card'].push({});
  entries['#about .skills-grid .skill-list > span'].push(tool('Power BI'));
  entries['#experience .timeline-item'].push({});
  year = '2027-06';
  onEdit();
  assert.deepEqual(output.map(item => item.textContent), ['3', '3', '2', '2027']);
});
