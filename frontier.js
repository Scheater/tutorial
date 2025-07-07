document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.sidebar-nav a[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  const modeIcon = document.getElementById('mode-icon');
  const sidebar = document.querySelector('.sidebar');
  const subNavs = document.querySelectorAll('.sub-nav');
  const logoImg = document.querySelector('.logo-title img');

  // Overlay für Darkmode-Animation erstellen
  const overlay = document.createElement('div');
  overlay.id = 'mode-toggle-overlay';
  document.body.appendChild(overlay);

  function deactivateAllTabs() {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    subNavs.forEach(snav => snav.classList.remove('show'));
  }

  function activateTab(id) {
    deactivateAllTabs();

    const tabLink = document.querySelector(`.sidebar-nav a[data-tab="${id}"]`);
    if (tabLink) {
      tabLink.classList.add('active');

      const parentSubNav = tabLink.closest('.sub-nav');
      if (parentSubNav) {
        parentSubNav.classList.add('show');
        const parentLiLink = parentSubNav.previousElementSibling;
        if (parentLiLink && parentLiLink.tagName === 'A') {
          parentLiLink.classList.add('active');
        }
      }
    }

    const content = document.getElementById(id);
    if (content) {
      content.classList.add('active');
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update URL (z. B. /fivem/troubleshooting)
    history.replaceState(null, '', `/${id}`);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const id = tab.getAttribute('data-tab');
      if (id) {
        activateTab(id);
        if (window.innerWidth <= 768) sidebar.classList.remove('show');
      }
    });
  });

  // Sidebar Untermenü toggeln
  const parentLinks = document.querySelectorAll('.sidebar-nav > ul > li > a');
  parentLinks.forEach(link => {
    const nextEl = link.nextElementSibling;
    if (nextEl && nextEl.classList.contains('sub-nav')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        nextEl.classList.toggle('show');
      });
    }
  });

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    let found = false;
    for (const tab of tabs) {
      const id = tab.getAttribute('data-tab');
      const content = document.getElementById(id);
      if (content && content.textContent.toLowerCase().includes(query)) {
        activateTab(id);
        found = true;
        break;
      }
    }

    if (!found) alert('Kein Ergebnis gefunden.');
  }

  searchButton?.addEventListener('click', performSearch);
  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') performSearch();
  });

  function updateLogo(isDark) {
    if (!logoImg) return;
    logoImg.src = isDark ? 'https://i.imgur.com/3owGgzP.png' : 'https://i.imgur.com/W9L2gij.png';
  }

  function updateDarkModeIcon(isDark) {
    modeIcon.src = isDark ? 'https://i.imgur.com/E0esEz2.png' : 'https://i.imgur.com/VMdzMBW.png';
    modeIcon.alt = isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren';
  }

  function toggleModeAnimation(enabled) {
    return new Promise(resolve => {
      overlay.classList.add('active');
      setTimeout(() => {
        document.body.classList.toggle('dark-mode', enabled);
        updateDarkModeIcon(enabled);
        updateLogo(enabled);
      }, 250);
      setTimeout(() => {
        overlay.classList.remove('active');
        resolve();
      }, 500);
    });
  }

  async function setDarkMode(enabled) {
    await toggleModeAnimation(enabled);
    localStorage.setItem('darkMode', enabled ? 'true' : 'false');
  }

  darkModeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    setDarkMode(!isDark);
  });

  const savedDarkMode = localStorage.getItem('darkMode');
  setDarkMode(savedDarkMode === 'true');

  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  // -------- SPA Redirect von 404.html --------
  const redirectedPath = sessionStorage.getItem('redirectPath');
  if (redirectedPath) {
    sessionStorage.removeItem('redirectPath');
    const tabId = redirectedPath.replace(/^\/+/, '').split('/').join('-'); // z. B. /fivem/troubleshooting → fivem-troubleshooting
    if (document.getElementById(tabId)) {
      activateTab(tabId);
    } else {
      activateTab('welcome');
    }
  } else {
    // Tab aktivieren basierend auf aktueller URL
    const path = window.location.pathname.replace(/^\/+/, '');
    const tabId = path.split('/').join('-'); // z. B. fivem/troubleshooting → fivem-troubleshooting
    if (document.getElementById(tabId)) {
      activateTab(tabId);
    } else {
      activateTab('welcome');
    }
  }
});
