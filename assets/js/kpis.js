// KPI sources are the published cards and toolkit, never manually entered totals.
(() => {
  const sources = ['#projects', '#about', '#experience'];
  function updateKpis() {
    const tools = new Set(
      [...document.querySelectorAll('#about .skills-grid .skill-list > span')]
        .filter(tool => !tool.closest('[data-competencies]') && !tool.hasAttribute('data-competency'))
        .map(tool => tool.textContent.trim().replace(/\s+/g, ' ').toLowerCase())
        .filter(Boolean)
    );
    const date = document.querySelector('[data-degree-date]')?.getAttribute('datetime');
    const values = {
      projects: document.querySelectorAll('#projects .project-card').length,
      tools: tools.size,
      roles: document.querySelectorAll('#experience .timeline-item').length,
      graduation: date?.match(/^\d{4}/)?.[0] || '—'
    };
    document.querySelectorAll('[data-portfolio-kpi]').forEach(element => {
      element.textContent = String(values[element.dataset.portfolioKpi]);
    });
  }
  updateKpis();
  const observer = new MutationObserver(updateKpis);
  sources.forEach(selector => {
    const source = document.querySelector(selector);
    if (source) observer.observe(source, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['datetime', 'data-competency', 'data-competencies']
    });
  });
})();
