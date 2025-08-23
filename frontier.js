document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('.sidebar-nav a[data-tab]');
  var tabContents = document.querySelectorAll('.tab-content');
  var searchInput = document.getElementById('search-input');
  var searchButton = document.getElementById('search-button');
  var darkModeToggle = document.querySelector('.dark-mode-toggle');
  var modeIcon = document.getElementById('mode-icon');
  var sidebar = document.querySelector('.sidebar');
  var subNavs = document.querySelectorAll('.sub-nav');
  var logoImg = document.querySelector('.logo-title img');

  var overlay = document.createElement('div');
  overlay.id = 'mode-toggle-overlay';
  document.body.appendChild(overlay);

  function deactivateAllTabs() {
    for (var k = 0; k < tabs.length; k++) {
      tabs[k].classList.remove('active');
    }
    for (var l = 0; l < tabContents.length; l++) {
      tabContents[l].classList.remove('active');
    }
    for (var m = 0; m < subNavs.length; m++) {
      subNavs[m].classList.remove('show');
    }
  }

  function activateTab(tabName) {
    deactivateAllTabs();

    var tabLink = document.querySelector('.sidebar-nav a[data-tab="' + tabName + '"]');
    if (tabLink) {
      tabLink.classList.add('active');
      var parentSubNav = tabLink.closest('.sub-nav');
      if (parentSubNav) {
        parentSubNav.classList.add('show');
        var parentLiLink = parentSubNav.previousElementSibling;
        if (parentLiLink && parentLiLink.tagName === 'A') {
          parentLiLink.classList.add('active');
        }
      }
    }

    var content = document.getElementById(tabName);
    if (content) {
      content.classList.add('active');
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    history.replaceState(null, '', '/' + tabName);
  }

  // Neue Funktion außerhalb der Schleife
  function handleTabClick(e) {
    e.preventDefault();
    var id = this.getAttribute('data-tab');
    if (id) {
      activateTab(id);
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
      }
    }
  }

  // Tabs Listener setzen
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', handleTabClick);
  }

  // Sidebar Subnav toggle
  function handleSidebarClick(e) {
    e.preventDefault();
    var nextEl = this.nextElementSibling;
    if (nextEl && nextEl.classList.contains('sub-nav')) {
      nextEl.classList.toggle('show');
    }
  }

  var parentLinks = document.querySelectorAll('.sidebar-nav > ul > li > a');
  for (var j = 0; j < parentLinks.length; j++) {
    parentLinks[j].addEventListener('click', handleSidebarClick);
  }

  function performSearch() {
    var query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    var found = false;
    for (var n = 0; n < tabs.length; n++) {
      var tab = tabs[n];
      var id = tab.getAttribute('data-tab');
      var content = document.getElementById(id);
      if (content && content.textContent.toLowerCase().indexOf(query) !== -1) {
        activateTab(id);
        found = true;
        break;
      }
    }

    if (!found) {
      alert('No results found.');
    }
  }

  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  function updateLogo(isDark) {
    if (!logoImg) return;
    logoImg.src = isDark ? 'https://i.imgur.com/3owGgzP.png' : 'https://i.imgur.com/W9L2gij.png';
  }

  function updateDarkModeIcon(isDark) {
    if (!modeIcon) return;
    modeIcon.src = isDark ? 'https://i.imgur.com/E0esEz2.png' : 'https://i.imgur.com/VMdzMBW.png';
    modeIcon.alt = isDark ? 'Enable light mode' : 'Enable dark mode';
  }

  function toggleModeAnimation(enabled, callback) {
    overlay.classList.add('active');
    setTimeout(function () {
      document.body.classList.toggle('dark-mode', enabled);
      updateDarkModeIcon(enabled);
      updateLogo(enabled);
    }, 250);
    setTimeout(function () {
      overlay.classList.remove('active');
      if (typeof callback === 'function') {
        callback();
      }
    }, 500);
  }

  function setDarkMode(enabled, skipAnimation) {
    if (skipAnimation) {
      document.body.classList.toggle('dark-mode', enabled);
      updateDarkModeIcon(enabled);
      updateLogo(enabled);
      localStorage.setItem('darkMode', enabled ? 'true' : 'false');
    } else {
      toggleModeAnimation(enabled, function () {
        localStorage.setItem('darkMode', enabled ? 'true' : 'false');
      });
    }
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function () {
      var isDark = document.body.classList.contains('dark-mode');
      setDarkMode(!isDark);
    });
  }

  var savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === null) {
    updateDarkModeIcon(true);
    updateLogo(true);
  } else {
    setDarkMode(savedDarkMode === 'true', true);
  }

  var menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('show');
    });
  }

  var redirectedPath = sessionStorage.getItem('redirectPath');
  if (redirectedPath) {
    sessionStorage.removeItem('redirectPath');
    var redirectedTab = redirectedPath.replace(/^\/+/, '').split('/').join('-');
    if (document.getElementById(redirectedTab)) {
      activateTab(redirectedTab);
    } else {
      activateTab('welcome');
    }
  } else {
    var path = window.location.pathname.replace(/^\/+/, '');
    var pathTab = path.split('/').join('-');
    if (document.getElementById(pathTab)) {
      activateTab(pathTab);
    } else {
      activateTab('welcome');
    }
  }
});
