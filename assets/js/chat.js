(() => {
  const panel = document.getElementById('portfolioChat');
  const launcher = document.getElementById('chatLauncher');
  const input = document.getElementById('chatQuestion');
  const log = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  let lastMatches = [];
  let nextMatch = 0;
  const stopWords = new Set('a an the is are was were do does did what which who where when how can could would you your she her luisa gonzales about tell me please has have had and or of in on at to for with i s'.split(' '));
  const tokens = text => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(word => word && !stopWords.has(word));
  const selectors = '.hero-lead, .about-panel, .mini-card, .skill-group, .timeline-item, .project-card, #leadership .lead-row, .volunteer-gallery .lead-row, .hosting-card, .cert-grid > div, .contact-card';
  const records = [...document.querySelectorAll(selectors)].map(element => {
    const copy = element.cloneNode(true);
    copy.querySelectorAll('img, button, .project-visual').forEach(node => node.remove());
    copy.querySelectorAll('p, h2, h3, span, strong, li, a').forEach(node => node.append(document.createTextNode(' ')));
    const text = copy.textContent.replace(/\s+/g, ' ').trim();
    const section = element.closest('section');
    const group = element.closest('[role="tabpanel"]');
    const category = element.matches('.cert-grid > div') ? 'certification certificate training courses' : element.matches('.skill-group') ? 'skills toolkit technologies' : section.id === 'experience' && element.querySelector('li') ? 'experience work employment internship' : section.id === 'projects' ? 'projects' : section.id === 'leadership' ? 'leadership organizations roles' : group?.id === 'hosting-panel' ? 'hosting events' : group?.id === 'volunteering-panel' ? 'volunteering' : section.id === 'contact' ? 'contact email phone location linkedin' : '';
    const timelineHeading = element.closest('.timeline')?.previousElementSibling;
    const topic = timelineHeading?.matches('.timeline-heading') ? timelineHeading.textContent : '';
    return { element, text, group, section, words: new Set(tokens(`${text} ${category} ${topic}`)) };
  });

  function message(text, user = false) {
    const item = document.createElement('div');
    item.className = user ? 'chat-message chat-user' : 'chat-message';
    const label = document.createElement('strong');
    label.textContent = user ? 'You' : 'Lui';
    const body = document.createElement('p');
    body.textContent = text;
    item.append(label, body);
    log.append(item);
    // Keep the in-memory conversation bounded.
    while (log.children.length > 40) log.firstElementChild.remove();
    return item;
  }

  function ask(question) {
    question = question.trim().slice(0, 300);
    if (!question) return;
    message(question, true);
    if (/^(hi|hello|hey)[!. ]*$/i.test(question)) {
      message('Hi there! I’m Lui, Luisa’s offline portfolio guide. Want to explore her work, skills, or projects?');
    } else if (/^(thanks|thank you|thank you lui)[!. ]*$/i.test(question)) {
      message('You’re welcome! What else would you like to know about Luisa?');
    } else if (/^(who are you|what is your name|are you human)[?!. ]*$/i.test(question)) {
      message('I’m Lui, an automated portfolio guide. I work offline using the information Luisa has published here.');
    } else if (/^(tell me more|more|go on|what else|continue)[?!. ]*$/i.test(question)) {
      if (nextMatch < lastMatches.length) showMatches(lastMatches.slice(nextMatch, nextMatch += 2));
      else message('That’s all I found for that topic. Try asking about another skill, employer, or project.');
    } else localAnswer(question);
    log.scrollTop = log.scrollHeight;
  }
  function localAnswer(question) {
    const aliases = { certificates: 'certificate', certifications: 'certification', jobs: 'employment', job: 'employment', worked: 'work', technologies: 'technologies', studied: 'education', school: 'education', degree: 'education', graduate: 'education', hosting: 'hosting' };
    const words = [...new Set(tokens(question).map(word => aliases[word] || word))];
    // Require every meaningful query word, rather than accepting half a question.
    // An unknown detail such as "Accenture salary" must not return general experience.
    const matches = records.map(record => ({ record, score: words.filter(word => record.words.has(word)).length })).filter(result => words.length > 0 && result.score === words.length).sort((a, b) => {
      const specific = record => record.element.matches('.timeline-item, .project-card, .cert-grid > div, .skill-group, .lead-row') ? 1 : 0;
      return specific(b.record) - specific(a.record);
    });
    if (!matches.length) {
      lastMatches = []; nextMatch = 0;
      message('I don’t have that detail in Luisa’s portfolio yet. Try a specific employer, project, skill, or certificate. For details not listed here, please contact Luisa through the Contact section.');
    } else {
      lastMatches = matches;
      nextMatch = 1;
      showMatches(matches.slice(0, nextMatch));
    }
  }
  function showMatches(matches) {
      const list = values => new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(values);
      // Rephrase published action statements without inventing new facts.
      const thirdPerson = text => {
        const verbs = { Develop: 'develops', Perform: 'performs', Help: 'helps', Coordinate: 'coordinates', Represent: 'represents' };
        const verb = text.split(' ')[0];
        if (verbs[verb]) return 'She ' + verbs[verb] + text.slice(verb.length);
        if (/^(Designed|Developed|Improved|Gained|Built|Created|Led|Managed|Coordinated|Supported|Organized|Hosted|Co-hosted|Served|Graduated|Contributed|Moderated|Helped|Completed|Oversaw)\b/.test(text)) return 'She ' + text.charAt(0).toLowerCase() + text.slice(1);
        return text.replace(/\bI’m\b/g, 'She is').replace(/\bI have\b/g, 'She has').replace(/\bI\b/g, 'She').replace(/\bmy\b/gi, 'her');
      };
      matches.forEach(({ record }) => {
        const heading = record.element.querySelector('h3, .skill-label, strong')?.textContent.trim();
        const paragraphs = [...record.element.querySelectorAll('p')].map(p => thirdPerson(p.textContent.trim()));
        let detail = paragraphs.length ? ((heading ? `About ${heading}:\n\n` : '') + paragraphs.join('\n\n')) : record.text;
        if (record.element.matches('.skill-group')) {
          const skills = [...record.element.querySelectorAll('.skill-list span')].map(node => node.textContent.trim());
          const label = (heading || 'technical').toLowerCase();
          detail = label === 'programming'
            ? `Her programming toolkit includes ${list(skills)}.`
            : `Her ${label} toolkit includes ${list(skills)}.`;
        } else if (record.element.matches('.cert-grid > div')) {
          const metadata = record.element.querySelector('span')?.textContent.trim();
          detail = `She has a certificate for “${heading}”.\n\n${metadata}`;
        } else if (record.element.matches('#leadership .lead-row')) {
          const organization = record.element.querySelector('strong')?.textContent.trim();
          const duties = [...record.element.querySelectorAll('li')].map(node => node.textContent.trim());
          detail = `Her listed role at ${organization} is ${heading}.`;
        } else if (record.element.matches('.timeline-item')) {
          const organization = record.element.querySelector('.company')?.textContent.trim();
          const date = record.element.querySelector('.timeline-date')?.textContent.trim();
          const duties = [...record.element.querySelectorAll('li')].map(node => thirdPerson(node.textContent.trim()));
          const company = organization?.split(' · ')[0];
          if (duties.length) {
            const current = /Present/i.test(date);
            detail = `At ${company}, she ${current ? 'works' : 'worked'} as ${/^[aeiou]/i.test(heading) ? 'an' : 'a'} ${heading} (${date}).\n\n${duties.join('\n\n')}`;
          } else {
            detail = `Her background includes ${heading} at ${company} (${date}).\n\n${paragraphs.join('\n\n')}`;
          }
        } else if (record.element.matches('.project-card')) {
          detail = `One of her projects is ${heading}.\n\n${paragraphs.join('\n\n')}`;
        } else if (record.element.matches('.contact-card')) {
          const email = record.element.querySelector('a[href^="mailto:"]')?.getAttribute('href').slice(7);
          detail = `You can reach her at ${email}.`;
        }
        const item = message(detail);
        const link = document.createElement('a');
        link.href = `#${record.section.id || 'about'}`;
        link.textContent = 'View in portfolio →';
        link.addEventListener('click', event => {
          event.preventDefault();
          if (record.group) document.getElementById(record.group.getAttribute('aria-labelledby')).click();
          if (record.element.matches('.cert-grid > div')) document.querySelector('[data-cert-filter="all"]').click();
          if (record.element.matches('.project-card')) document.querySelector('#projects [data-filter="all"]').click();
          setOpen(false);
          record.element.scrollIntoView({ block: 'center' });
          record.element.setAttribute('tabindex', '-1');
          record.element.focus({ preventScroll: true });
        });
        item.append(link);
      });
    log.scrollTop = log.scrollHeight;
  }
  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    (open ? input : launcher).focus();
  }
  launcher.hidden = false;
  launcher.addEventListener('click', () => setOpen(panel.hidden));
  document.getElementById('chatClose').addEventListener('click', () => setOpen(false));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); }
  });
  document.getElementById('chatForm').addEventListener('submit', event => { event.preventDefault(); ask(input.value); input.value = ''; input.focus(); });
  document.querySelectorAll('.chat-suggestions button').forEach(button => button.addEventListener('click', () => {
    document.getElementById('chatIdeas').open = false;
    ask(button.textContent);
    input.focus();
  }));
  message('Hi, I’m Lui, Luisa’s automated portfolio guide! What would you like to know about her?');
})();
