// ==========================================================
// Dough Calculator — page-data helpers (YouTube embeds, etc.)
// Reads the recipe/preferment JSON for the current route and
// renders any optional media it declares (e.g. "yt": "...").
// ==========================================================

window.DoughCalc = window.DoughCalc || {};

// Accepts a bare 11-char video ID, or a full YouTube URL in any
// common format (watch?v=, youtu.be/, shorts/, embed/).
DoughCalc.extractYouTubeId = function (input) {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  var patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = input.match(patterns[i]);
    if (m) return m[1];
  }
  return null;
};

// Appends a "Відео" card with a responsive 16:9 YouTube embed to
// the current fragment's <main>. Removes any leftover embed from
// a previous page first. Safe no-op if ytValue doesn't resolve.
DoughCalc.renderYouTube = function (ytValue) {
  var existing = document.getElementById('yt-section');
  if (existing) existing.remove();

  var id = DoughCalc.extractYouTubeId(ytValue);
  if (!id) return;

  var main = document.querySelector('#content-area main');
  if (!main) return;

  var section = document.createElement('section');
  section.className = 'card';
  section.id = 'yt-section';
  section.innerHTML =
    '<div class="card-title-row"><span class="card-title">Відео</span></div>' +
    '<div class="yt-wrap">' +
      '<iframe class="yt-frame" ' +
      'src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0" ' +
      'title="YouTube video" frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
      'allowfullscreen></iframe>' +
    '</div>';

  main.appendChild(section);
};

// Accepted photo file extensions for DoughCalc.renderPhoto below.
DoughCalc.PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

// Appends a "Фото" card with the recipe/preferment's photo (declared
// as an optional "photo": "img/photos/<file>.<ext>" field in the
// page's JSON, same convention as the "yt" field above) to the
// current fragment's <main>. Removes any leftover photo card from a
// previous page first. Validates the extension against
// PHOTO_EXTENSIONS and silently no-ops on an invalid/missing value;
// if the referenced file 404s at runtime the card also removes
// itself (img.onerror) rather than showing a broken-image icon.
DoughCalc.renderPhoto = function (photoValue) {
  var existing = document.getElementById('photo-section');
  if (existing) existing.remove();

  if (!photoValue || typeof photoValue !== 'string') return;
  var ext = (photoValue.split('.').pop() || '').toLowerCase();
  if (DoughCalc.PHOTO_EXTENSIONS.indexOf(ext) === -1) return;

  var main = document.querySelector('#content-area main');
  if (!main) return;

  var dict = DoughCalc.getLangDictSync();
  var section = document.createElement('section');
  section.className = 'card';
  section.id = 'photo-section';
  section.innerHTML =
    '<div class="card-title-row"><span class="card-title">' + (dict.PHOTO || 'Фото') + '</span></div>' +
    '<div class="recipe-photo-wrap"><img class="recipe-photo" alt="" loading="lazy"></div>';

  var img = section.querySelector('img');
  img.onerror = function () { section.remove(); };
  img.src = DoughCalc.withCacheBust(DoughCalc.BASE + photoValue);

  // Insert right where the "links" (Youtube/Recipe) block lives —
  // before it if that section is already in the fragment, otherwise
  // at the end of <main> (its usual position).
  var linksSection = Array.prototype.find.call(
    main.querySelectorAll('.card'),
    function (card) {
      return !!card.querySelector('#link-youtube, #link-recipe');
    }
  );
  if (linksSection) {
    linksSection.parentNode.insertBefore(section, linksSection);
  } else {
    main.appendChild(section);
  }
};

// Note: the page JSON itself is now fetched once by cat.js's
// navigate() (in parallel with the HTML fragment) and passed to
// both the route's init() and here as DoughCalc.renderYouTube(data.yt) —
// see cat.js. This file no longer needs its own fetch for it.

// ==========================================================
// Side drawer (hamburger menu) + theme/units/lang prefs.
// The drawer itself lives in index.html (persistent shell),
// not in a per-route fragment, so it survives navigation.
// Only "Тема" (light/dark) is actually applied right now —
// "Мова" and "Одиниці виміру" are saved but not yet wired
// into any i18n/unit-conversion logic anywhere else in the
// app; that's a bigger follow-up, not part of this raw pass.
// ==========================================================
DoughCalc.PREFS_KEY = 'doughcalc-prefs';

DoughCalc.loadPrefs = function () {
  try {
    return JSON.parse(localStorage.getItem(DoughCalc.PREFS_KEY)) || {};
  } catch (e) {
    return {};
  }
};

DoughCalc.savePrefs = function (prefs) {
  try {
    localStorage.setItem(DoughCalc.PREFS_KEY, JSON.stringify(prefs));
  } catch (e) { /* ignore (private browsing, storage full, etc.) */ }
};

DoughCalc.applyTheme = function (theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
};

DoughCalc.initDrawer = function () {
  var overlay = document.getElementById('drawer-overlay');
  var drawer = document.getElementById('side-drawer');
  var closeBtn = document.getElementById('drawer-close-btn');
  var langSelect = document.getElementById('drawer-lang');
  var themeSelect = document.getElementById('drawer-theme');
  var unitsSelect = document.getElementById('drawer-units');
  if (!drawer || !overlay) return;

  var prefs = DoughCalc.loadPrefs();
  if (prefs.theme) DoughCalc.applyTheme(prefs.theme);
  if (langSelect && prefs.lang) langSelect.value = prefs.lang;
  if (themeSelect && prefs.theme) themeSelect.value = prefs.theme;
  if (unitsSelect && prefs.units) unitsSelect.value = prefs.units;

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
  }

  // Delegated so it keeps working after route fragments swap
  // #content-area's contents (the hamburger/gear buttons live
  // in home.html's fragment, not the persistent shell).
  document.body.addEventListener('click', function (e) {
    if (e.target.closest('#menu-btn')) openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('.drawer-link').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  if (langSelect) {
    langSelect.addEventListener('change', function () {
      var p = DoughCalc.loadPrefs();
      p.lang = langSelect.value;
      DoughCalc.savePrefs(p);
      // Re-fetch the current route so the new language takes effect
      // immediately — no server round-trip needed, this is a static
      // per-locale file fetch (see DoughCalc.fetchLocalizedHtml in cat.js).
      DoughCalc.navigate(location.hash.slice(1) || '');
    });
  }
  if (themeSelect) {
    themeSelect.addEventListener('change', function () {
      DoughCalc.applyTheme(themeSelect.value);
      var p = DoughCalc.loadPrefs();
      p.theme = themeSelect.value;
      DoughCalc.savePrefs(p);
      var settingsTheme = document.getElementById('settings-theme');
      if (settingsTheme) settingsTheme.value = themeSelect.value;
    });
  }
  if (unitsSelect) {
    unitsSelect.addEventListener('change', function () {
      var p = DoughCalc.loadPrefs();
      p.units = unitsSelect.value;
      DoughCalc.savePrefs(p);
      var settingsUnits = document.getElementById('settings-units');
      if (settingsUnits) settingsUnits.value = unitsSelect.value;
    });
  }
};

document.addEventListener('DOMContentLoaded', DoughCalc.initDrawer);

/* ==========================================================
   Home search — filters the static data/search-index.json
   (route + section + title-dict-key per card, built from
   DoughCalc.routes) against the currently active language
   dictionary. Lives only in home.html's fragment; UI pattern
   adapted from the Les Grandes Sauces project's search box.
   ========================================================== */
DoughCalc.escapeHtml = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

DoughCalc.searchIndexCache = null;
DoughCalc.loadSearchIndex = function () {
  if (DoughCalc.searchIndexCache) return Promise.resolve(DoughCalc.searchIndexCache);
  return fetch(DoughCalc.withCacheBust(DoughCalc.BASE + 'data/search-index.json')).then(function (res) {
    if (!res.ok) throw new Error('Failed to load search index');
    return res.json();
  }).then(function (list) {
    DoughCalc.searchIndexCache = list;
    return list;
  });
};

DoughCalc.initHomeSearch = function () {
  var input = document.getElementById('home-search-input');
  var clearBtn = document.getElementById('home-search-clear');
  var resultsBox = document.getElementById('search-results');
  if (!input || !resultsBox) return;

  document.body.classList.remove('search-active');
  resultsBox.classList.remove('is-open');
  resultsBox.innerHTML = '';
  input.value = '';
  if (clearBtn) clearBtn.style.display = 'none';

  function render(query) {
    query = (query || '').trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

    if (!query) {
      document.body.classList.remove('search-active');
      resultsBox.classList.remove('is-open');
      resultsBox.innerHTML = '';
      return;
    }

    Promise.all([DoughCalc.loadSearchIndex(), DoughCalc.getLangDict(DoughCalc.currentLocale())])
      .then(function (results) {
        // Guard against a stale response landing after the query changed again.
        if (input.value.trim().toLowerCase() !== query) return;

        var index = results[0], dict = results[1];
        var matches = index.filter(function (e) {
          var name = e.titleKey ? (dict[e.titleKey] || '') : (e.title || '');
          return name.toLowerCase().indexOf(query) > -1;
        }).slice(0, 30);

        document.body.classList.add('search-active');
        resultsBox.classList.add('is-open');

        if (!matches.length) {
          resultsBox.innerHTML = '<div class="search-no-results">' + DoughCalc.escapeHtml(dict.SEARCH_NO_RESULTS || '') + '</div>';
          return;
        }

        resultsBox.innerHTML = matches.map(function (e) {
          var name = e.titleKey ? (dict[e.titleKey] || '') : (e.title || '');
          var section = e.sectionKey ? (dict[e.sectionKey] || '') : '';
          return '<a class="search-result-item" data-route="' + e.route + '">'
            + '<div>'
            + '<div class="search-result-name">' + DoughCalc.escapeHtml(name) + '</div>'
            + (section ? '<div class="search-result-path">' + DoughCalc.escapeHtml(section) + '</div>' : '')
            + '</div></a>';
        }).join('');
      });
  }

  input.addEventListener('input', function () { render(input.value); });
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      input.value = '';
      render('');
      input.focus();
    });
  }
};

// Settings page (data/pages/settings/settings.html) — same
// prefs object as the drawer, so a change on either screen
// stays in sync (both round-trip through localStorage).
DoughCalc.initSettingsPage = function () {
  var themeSelect = document.getElementById('settings-theme');
  var langSelect = document.getElementById('settings-lang');
  var unitsSelect = document.getElementById('settings-units');
  var roundingSelect = document.getElementById('settings-rounding');
  var timersCheckbox = document.getElementById('settings-timers');

  var prefs = DoughCalc.loadPrefs();
  if (themeSelect && prefs.theme) themeSelect.value = prefs.theme;
  if (langSelect && prefs.lang) langSelect.value = prefs.lang;
  if (unitsSelect && prefs.units) unitsSelect.value = prefs.units;
  if (roundingSelect && prefs.rounding) roundingSelect.value = prefs.rounding;
  if (timersCheckbox) timersCheckbox.checked = !!prefs.timers;

  function saveField(key, value) {
    var p = DoughCalc.loadPrefs();
    p[key] = value;
    DoughCalc.savePrefs(p);
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', function () {
      DoughCalc.applyTheme(themeSelect.value);
      saveField('theme', themeSelect.value);
      var drawerTheme = document.getElementById('drawer-theme');
      if (drawerTheme) drawerTheme.value = themeSelect.value;
    });
  }
  if (langSelect) {
    langSelect.addEventListener('change', function () {
      saveField('lang', langSelect.value);
      var drawerLang = document.getElementById('drawer-lang');
      if (drawerLang) drawerLang.value = langSelect.value;
      // Re-render the settings page itself in the new language.
      DoughCalc.navigate('settings');
    });
  }
  if (unitsSelect) {
    unitsSelect.addEventListener('change', function () {
      saveField('units', unitsSelect.value);
      var drawerUnits = document.getElementById('drawer-units');
      if (drawerUnits) drawerUnits.value = unitsSelect.value;
    });
  }
  if (roundingSelect) {
    roundingSelect.addEventListener('change', function () {
      saveField('rounding', roundingSelect.value);
    });
  }
  if (timersCheckbox) {
    timersCheckbox.addEventListener('change', function () {
      saveField('timers', timersCheckbox.checked);
    });
  }

  // Update-check card — same pattern as "Les Grandes Sauces": only
  // shown inside a native Capacitor app (window.Capacitor.isNativePlatform()).
  // On plain web/PWA (DoughCalc's current state — no native wrapper yet)
  // this card stays hidden and ota.js's checkForUpdate() no-ops anyway.
  var updateCard = document.getElementById('update-card');
  var isNativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  if (updateCard && isNativeApp) updateCard.style.display = '';
};

function checkAppUpdateFromSettings() {
  var statusEl = document.getElementById('settings-update-status');
  var btnEl = document.getElementById('settings-update-btn');
  if (!window.OTA || !window.OTA.checkForUpdate) return;
  if (btnEl) btnEl.disabled = true;
  window.OTA.checkForUpdate({
    force: true,
    onStatus: function (status) {
      if (!statusEl) return;
      if (status === 'checking') statusEl.textContent = 'Перевірка оновлень…';
      else if (status === 'up_to_date') { statusEl.textContent = 'Вже встановлена остання версія.'; if (btnEl) btnEl.disabled = false; }
      else if (status === 'downloading') statusEl.textContent = 'Завантаження оновлення…';
      else if (status === 'updated') statusEl.textContent = 'Оновлення встановлено, перезапуск…';
      else if (status === 'error') { statusEl.textContent = 'Помилка перевірки оновлення.'; if (btnEl) btnEl.disabled = false; }
    }
  });
}
