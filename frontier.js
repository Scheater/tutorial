/* frontier.js — full build (GitBook-like UI)
   - Tabs mit Hash (#tab)
   - Subnav auf/zu
   - Suche mit Highlight (schließt "refund-policy" von Auto-Open aus)
   - Dark/Light Mode inkl. System-Theme
   - Logo/Icon swap
*/
(() => {
  "use strict";

  // ---------- Helpers ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Elements ----------
  const nav            = $('.sidebar-nav');
  const tabLinks       = $$('.sidebar-nav a[data-tab]');
  const panels         = $$('.tab-content');

  const searchInput    = $('#search-input');
  const searchButton   = $('#search-button');

  const modeToggleBtn  = $('#mode-toggle');
  const modeIcon       = $('#mode-icon');
  const logoImg        = $('#logo-img');

  // ---------- Config ----------
  // Diese Panels werden NICHT durch Suche automatisch geöffnet
  const NO_AUTO_OPEN_PANELS = new Set(['refund-policy']);

  const STORAGE_DARK = 'darkMode'; // 'true' | 'false' | null (null = follow system)

  const LOGO = {
    dark:  'https://i.imgur.com/3owGgzP.png',
    light: 'https://i.imgur.com/W9L2gij.png'
  };
  const ICON = {
    dark:  'https://i.imgur.com/E0esEz2.png',
    light: 'https://i.imgur.com/VMdzMBW.png'
  };

  // ---------- Lookup Maps ----------
  const linkById  = Object.create(null);
  const panelById = Object.create(null);
  tabLinks.forEach(a => linkById[a.dataset.tab] = a);
  panels.forEach(p => panelById[p.id] = p);

  // ---------- Tabs ----------
  function deactivateAll() {
    tabLinks.forEach(a => {
      a.classList.remove('active');
      a.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
      p.tabIndex = -1;
    });
  }

  function expandParents(link) {
    const sub = link.closest('.sub-nav');
    if (sub) {
      sub.classList.add('show');
      const parentLink = sub.previousElementSibling;
      if (parentLink && parentLink.matches('a[data-tab]')) {
        parentLink.classList.add('active');
        parentLink.setAttribute('aria-selected', 'true');
      }
    }
  }

  function setActiveTab(id, { updateHash = true } = {}) {
    if (!panelById[id]) id = 'welcome';

    deactivateAll();

    const link  = linkById[id];
    const panel = panelById[id];

    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-selected', 'true');
      expandParents(link);
    }
    if (panel) {
      panel.classList.add('active');
      panel.setAttribute('aria-hidden', 'false');
      panel.tabIndex = 0;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (updateHash && location.hash.replace(/^#/, '') !== id) {
      history.pushState(null, '', `#${id}`);
    }
  }

  function initTabFromHash() {
    const id = location.hash.replace(/^#/, '');
    if (id && panelById[id]) {
      setActiveTab(id, { updateHash: false });
    } else {
      setActiveTab('welcome', { updateHash: false });
    }
  }

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace(/^#/, '');
    if (panelById[id]) setActiveTab(id, { updateHash: false });
  });

  // Event delegation: Sidebar Links & Parent-Toggle
  nav?.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-tab]');
    if (!a) return;

    // erlaubtes Öffnen in neuem Tab/Fenster
    if (e.button === 1 || e.metaKey || e.ctrlKey) return;

    e.preventDefault();

    // Subnav toggeln, falls vorhanden
    const maybeSub = a.nextElementSibling;
    if (maybeSub && maybeSub.classList.contains('sub-nav')) {
      maybeSub.classList.toggle('show');
    }

    setActiveTab(a.dataset.tab);
  });

  // ---------- Search + Highlight ----------
  function clearHighlights(root = document) {
    $$('.highlight', root).forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightInPanel(panel, query) {
    const targets = $$('h1,h2,h3,h4,p,li', panel);
    const re = new RegExp(escapeRegExp(query), 'gi');
    let hits = 0;

    targets.forEach(el => {
      if (el.closest('pre,code')) return; // Codeblöcke auslassen
      const html = el.innerHTML;
      if (!re.test(html)) return;
      el.innerHTML = html.replace(re, (m) => {
        hits++;
        return `<mark class="highlight">${m}</mark>`;
      });
    });

    return hits;
  }

  function performSearch() {
    const q = (searchInput?.value || '').trim();
    if (!q) return;

    // Alte Highlights löschen
    panels.forEach(p => clearHighlights(p));

    // Finde erstes Panel mit Treffer, das NICHT ausgeschlossen ist
    let targetPanel = null;
    for (const p of panels) {
      if (NO_AUTO_OPEN_PANELS.has(p.id)) continue;
      const text = (p.textContent || '').toLowerCase();
      if (text.includes(q.toLowerCase())) {
        targetPanel = p;
        break;
      }
    }

    if (!targetPanel) {
      alert('No results found.');
      return;
    }

    setActiveTab(targetPanel.id);
    highlightInPanel(targetPanel, q);

    const first = $('.highlight', targetPanel);
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  searchButton?.addEventListener('click', performSearch);
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // ---------- Dark / Light Mode ----------
  function applyDarkUI(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    if (modeIcon) {
      modeIcon.src = isDark ? ICON.dark : ICON.light;
      modeIcon.alt = isDark ? 'Enable light mode' : 'Enable dark mode';
    }
    if (logoImg) {
      logoImg.src = isDark ? LOGO.dark : LOGO.light;
    }
  }

  function setDarkMode(isDark, { persist = true } = {}) {
    applyDarkUI(isDark);
    if (persist) localStorage.setItem(STORAGE_DARK, isDark ? 'true' : 'false');
  }

  function initDarkMode() {
    const saved = localStorage.getItem(STORAGE_DARK);
    if (saved === null) {
      // Beim ersten Besuch: System-Theme übernehmen
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      setDarkMode(!!prefersDark, { persist: false });

      // Auf System-Änderungen reagieren, solange der Nutzer keine manuelle Wahl gespeichert hat
      try {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener?.('change', (e) => {
          if (localStorage.getItem(STORAGE_DARK) === null) {
            setDarkMode(e.matches, { persist: false });
          }
        });
      } catch { /* older browsers */ }
    } else {
      setDarkMode(saved === 'true', { persist: false });
    }
  }

  modeToggleBtn?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    setDarkMode(!isDark, { persist: true });
  });

  // ---------- Subnav-Open für aktiven Link ----------
  function ensureParentSubnavOpen() {
    const active = $('.sidebar-nav a.active');
    const sub = active?.closest('.sub-nav');
    if (sub) sub.classList.add('show');
  }

  // ---------- Init ----------
  function init() {
    initDarkMode();
    initTabFromHash();          // KEIN Tab-Persisting -> immer Hash oder 'welcome'
    ensureParentSubnavOpen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
