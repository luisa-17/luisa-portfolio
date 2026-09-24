// Keep direct file browsing usable while retaining the hosted /leadership route.
if (location.protocol !== 'file:') {
  document.querySelectorAll('[data-leadership-link]').forEach(link => { link.href = '/leadership'; });
}

const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const navLinks = [...document.querySelectorAll('.nav a')];
const sections = [...document.querySelectorAll('main section[id]')];

if (header && menuToggle && mainNav) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);

    let current = 'home';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 180) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });

  function setMenuOpen(open) {
    mainNav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  menuToggle.addEventListener('click', () => {
    setMenuOpen(!mainNav.classList.contains('open'));
  });

  navLinks.forEach(link => link.addEventListener('click', () => {
    setMenuOpen(false);
  }));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mainNav.classList.contains('open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });

  window.matchMedia('(max-width: 860px)').addEventListener('change', () => setMenuOpen(false));
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const filterButtons = document.querySelectorAll('#projects .filter');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projectCards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      card.classList.toggle('hidden', filter !== 'all' && !categories.includes(filter));
    });
  });
});

const certificateFilters = document.querySelectorAll('[data-cert-filter]');
const certificateCards = document.querySelectorAll('.cert-grid [data-skills]');

certificateFilters.forEach(button => {
  button.addEventListener('click', () => {
    certificateFilters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    const skill = button.dataset.certFilter;
    certificateCards.forEach(card => {
      card.hidden = skill !== 'all' && !card.dataset.skills.split(' ').includes(skill);
    });
  });
});

const beyondWorkTabs = [...document.querySelectorAll('.beyond-work-tab')];

function activateBeyondWorkTab(selectedTab) {
  beyondWorkTabs.forEach(tab => {
    const selected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
}

beyondWorkTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateBeyondWorkTab(tab));
  tab.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % beyondWorkTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + beyondWorkTabs.length) % beyondWorkTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = beyondWorkTabs.length - 1;
    else return;

    event.preventDefault();
    activateBeyondWorkTab(beyondWorkTabs[nextIndex]);
    beyondWorkTabs[nextIndex].focus();
  });
});

document.querySelectorAll('.hosting-slider').forEach(slider => {
  const slides = [...slider.querySelectorAll('.hosting-slide')];
  const status = slider.querySelector('.hosting-slide-status');
  let current = 0;
  function showSlide(step) {
    current = (current + step + slides.length) % slides.length;
    slides.forEach((slide, index) => { slide.hidden = index !== current; });
    status.textContent = `Day ${current + 1} · January ${current + 7} · ${current + 1} / ${slides.length}`;
  }
  slider.querySelectorAll('[data-slide-step]').forEach(button => {
    button.addEventListener('click', () => showSlide(Number(button.dataset.slideStep)));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      showSlide(event.key === 'ArrowLeft' ? -1 : 1);
    });
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
