// Role links and old event bookmarks can point inside collapsed highlights.
(() => {
  function revealTarget() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    let disclosure = target.closest('details');
    while (disclosure) {
      disclosure.open = true;
      disclosure = disclosure.parentElement.closest('details');
    }
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  window.addEventListener('hashchange', revealTarget);
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (link.hash === location.hash) revealTarget();
    });
  });
  if (location.hash) revealTarget();
})();
