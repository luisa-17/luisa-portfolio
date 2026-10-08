function selectRecentUpdates(entries, now = new Date()) {
  // Use Philippine calendar days so date-only milestones do not shift by timezone.
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);
  const todayTime = Date.parse(today + 'T00:00:00Z');
  return entries.filter(entry => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !entry.title) return false;
    const time = Date.parse(entry.date + 'T00:00:00Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== entry.date) return false;
    const age = (todayTime - time) / 86400000;
    return age >= 0 && age < 30;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

if (typeof document !== 'undefined') {
  const list = document.getElementById('latestUpdatesList');
  const empty = document.getElementById('latestUpdatesEmpty');
  let lastContent;
  function renderUpdates() {
    const entries = selectRecentUpdates(window.portfolioUpdates || []);
    const content = JSON.stringify(entries);
    if (content === lastContent) return;
    lastContent = content;
    list.replaceChildren();
    empty.hidden = entries.length > 0;
    entries.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'update-card';
      const meta = document.createElement('div');
      meta.className = 'update-meta';
      const category = document.createElement('span');
      category.textContent = entry.category || 'Update';
      const date = document.createElement('time');
      date.dateTime = entry.date;
      date.textContent = new Intl.DateTimeFormat('en', {
        timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'
      }).format(new Date(entry.date + 'T00:00:00Z'));
      meta.append(category, date);
      const title = document.createElement('h3');
      title.textContent = entry.title;
      card.append(meta, title);
      if (entry.description) {
        const description = document.createElement('p');
        description.textContent = entry.description;
        card.append(description);
      }
      if (entry.href) {
        const url = new URL(entry.href, location.href);
        if (['http:', 'https:'].includes(url.protocol) || (location.protocol === 'file:' && url.protocol === 'file:')) {
          const link = document.createElement('a');
          link.href = entry.href;
          link.className = 'text-link';
          link.textContent = 'View details ↗';
          card.append(link);
        }
      }
      list.append(card);
    });
  }
  if (list && empty) {
    renderUpdates();
    setInterval(renderUpdates, 3600000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) renderUpdates();
    });
  }
}
