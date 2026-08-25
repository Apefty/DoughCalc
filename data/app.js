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

// Shows/hides + pre-fills the "Посилання" (Youtube video / Recipe)
// card based on optional "yt" / "recipe_link" JSON fields — same
// silent-hide philosophy as renderPhoto above: if neither field is
// present, the whole card is removed instead of showing two empty,
// purposeless inputs. If only one is present, only that field's row
// is kept.
DoughCalc.renderLinks = function (data) {
  var main = document.querySelector('#content-area main');
  if (!main) return;
  var ytInput = document.getElementById('link-youtube');
  var recipeInput = document.getElementById('link-recipe');
  if (!ytInput && !recipeInput) return; // page has no links card at all

  var card = ytInput ? ytInput.closest('.card') : recipeInput.closest('.card');
  var hasYt = !!(data && data.yt);
  var hasRecipe = !!(data && data.recipe_link);

  if (!hasYt && !hasRecipe) {
    if (card) card.remove();
    return;
  }
  if (ytInput) {
    ytInput.value = hasYt ? data.yt : '';
    var ytRow = ytInput.closest('.field-row');
    if (ytRow) ytRow.style.display = hasYt ? '' : 'none';
  }
  if (recipeInput) {
    recipeInput.value = hasRecipe ? data.recipe_link : '';
    var recipeRow = recipeInput.closest('.field-row');
    if (recipeRow) recipeRow.style.display = hasRecipe ? '' : 'none';
  }
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
/*     '<div class="card-title-row"><span class="card-title">' + (dict.PHOTO || 'Фото') + '</span></div>' + */
    '<div class="recipe-photo-wrap"><img class="recipe-photo" alt="" loading="lazy"></div>';

  var img = section.querySelector('img');
  img.onerror = function () { section.remove(); };
  img.src = photoValue;

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

// Localizes the persistent shell (side drawer, bottom nav, <title>) —
// the parts of index.html that live outside #content-area. Unlike
// routed pages (data/pages/**/*.html), this markup is never fetched
// through DoughCalc.fetchPageHtml, so it never passes through
// Handlebars.compile(); {{lang.KEY}} placeholders here would just
// render as literal text. Instead these elements carry a plain
// data-i18n="KEY" attribute (with the default Ukrainian text already
// in place as a no-JS/no-flash fallback), and this function fills
// them in from the language dict — once on load, and again whenever
// the language switcher changes.
DoughCalc.localizeShell = function () {
  return DoughCalc.getLangDict(DoughCalc.currentLocale()).then(function (dict) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
  });
};
document.addEventListener('DOMContentLoaded', DoughCalc.localizeShell);

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
      // Routed content is handled by navigate() above; the persistent
      // shell (drawer/bottom-nav/title) needs its own pass since it's
      // never re-fetched.
      DoughCalc.localizeShell();
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

/* About page (data/pages/about/about.html). Static app-info + a
   "Оновлення" card. The GitHub Releases link is always shown (works
   identically on plain web/PWA and inside the native wrapper); the
   in-app check-for-updates button/status below it follows the exact
   same native-only-visibility rule as the settings page's update-card
   above (window.Capacitor.isNativePlatform()) since ota.js's
   checkForUpdate() no-ops on plain web anyway. Unlike the settings
   version, this one is i18n-aware (About was written after the i18n
   pass landed, so it's born converted rather than needing a
   follow-up fix — see the i18n entries for calc.js/calculator.html). */
DoughCalc.initAboutPage = function () {
  var updateCard = document.getElementById('about-update-card');
  var isNativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  if (updateCard && isNativeApp) updateCard.style.display = '';
};

function checkAppUpdateFromAbout() {
  var statusEl = document.getElementById('about-update-status');
  var btnEl = document.getElementById('about-update-btn');
  var dict = DoughCalc.getLangDictSync();
  if (!window.OTA || !window.OTA.checkForUpdate) return;
  if (btnEl) btnEl.disabled = true;
  window.OTA.checkForUpdate({
    force: true,
    onStatus: function (status) {
      if (!statusEl) return;
      if (status === 'checking') statusEl.textContent = dict.ABOUT_UPDATE_CHECKING || '';
      else if (status === 'up_to_date') { statusEl.textContent = dict.ABOUT_UPDATE_UP_TO_DATE || ''; if (btnEl) btnEl.disabled = false; }
      else if (status === 'downloading') statusEl.textContent = dict.ABOUT_UPDATE_DOWNLOADING || '';
      else if (status === 'updated') statusEl.textContent = dict.ABOUT_UPDATE_UPDATED || '';
      else if (status === 'error') { statusEl.textContent = dict.ABOUT_UPDATE_ERROR || ''; if (btnEl) btnEl.disabled = false; }
    }
  });
}

/* ----------------------------------------------------------
   Favorites — storage + toggle button (shared across every page)

   prefs.favorites is a plain array of route strings (the same
   strings used as data-route / location.hash — e.g. "preferments/biga",
   "bread/durum"). Lives in the same localStorage blob as theme/lang/
   units, via the existing loadPrefs()/savePrefs().

   The toggle button itself: any element matching [data-favorite-toggle]
   containing a nested .iconify icon. Two ways it's used:
   - On a card page (biga.html etc.): no data-route attribute — the
     button always refers to *this* page, so the route is read from
     location.hash at click time.
   - On the favorites list (favorites.html, rendered below): each
     card's button carries its own data-route, since the list shows
     many different routes on one page.
   ---------------------------------------------------------- */
DoughCalc.isFavorite = function (route) {
  var favs = DoughCalc.loadPrefs().favorites || [];
  return favs.indexOf(route) > -1;
};

DoughCalc.toggleFavorite = function (route) {
  var prefs = DoughCalc.loadPrefs();
  var favs = prefs.favorites || [];
  var i = favs.indexOf(route);
  if (i > -1) favs.splice(i, 1); else favs.push(route);
  prefs.favorites = favs;
  DoughCalc.savePrefs(prefs);
  return i === -1; // true if the route is now favorited, false if just removed
};

DoughCalc._setFavoriteBtnState = function (btn, isFav) {
  btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
  var icon = btn.querySelector('.iconify');
  if (icon) icon.setAttribute('data-icon', isFav ? 'tabler:heart-filled' : 'tabler:heart');
};

/* Wires up every [data-favorite-toggle] button found under `root`
   (defaults to the whole document). Called once per navigation from
   cat.js's navigate(), scoped to the freshly-inserted #content-area,
   so it picks up the button on whichever page just loaded — no
   per-route wiring needed in cat.js's route table. Works for a real
   <button> (card pages) as well as a <span role="button"> (the
   favorites list below, where the toggle sits inside a .menu-card
   <a> — nesting a real <button> inside an <a> isn't valid HTML). */
DoughCalc.initFavoriteToggle = function (root) {
  (root || document).querySelectorAll('[data-favorite-toggle]').forEach(function (btn) {
    if (btn._favoriteWired) return; // avoid double-binding if called twice on the same element
    btn._favoriteWired = true;
    var ownRoute = btn.getAttribute('data-route');
    var route = ownRoute != null ? ownRoute : (location.hash.slice(1) || '');
    DoughCalc._setFavoriteBtnState(btn, DoughCalc.isFavorite(route));

    function activate(e) {
      e.preventDefault();
      e.stopPropagation(); // in case the toggle sits inside a clickable card <a>
      var nowFav = DoughCalc.toggleFavorite(route);
      DoughCalc._setFavoriteBtnState(btn, nowFav);
      // Unfavoriting from within the favorites list itself — refresh
      // it so the card disappears immediately instead of waiting for
      // the next visit.
      if (!nowFav && (location.hash.slice(1) || '') === 'favorites') {
        DoughCalc.initFavoritesPage();
      }
    }
    btn.addEventListener('click', activate);
    if (btn.tagName !== 'BUTTON') {
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') activate(e);
      });
    }
  });
};

// Favorites page (data/pages/favorites/favorites.html). Renders each
// favorited route as a .menu-card, using data/search-index.json for
// the title/section (the same index the search box uses) — so any
// route that's favoritable is already guaranteed to have a display
// name here, with no separate data file to keep in sync.
DoughCalc.initFavoritesPage = function () {
  var empty = document.getElementById('favorites-empty');
  var grid = document.getElementById('favorites-grid');
  if (!empty || !grid) return;

  var favorites = DoughCalc.loadPrefs().favorites || [];
  if (!favorites.length) {
    empty.style.display = '';
    grid.style.display = 'none';
    grid.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  grid.style.display = '';

  Promise.all([DoughCalc.loadSearchIndex(), DoughCalc.getLangDict(DoughCalc.currentLocale())])
    .then(function (results) {
      var index = results[0], dict = results[1];
      var byRoute = {};
      index.forEach(function (e) { byRoute[e.route] = e; });

      grid.innerHTML = favorites.map(function (route) {
        var e = byRoute[route];
        var title = e ? (e.titleKey ? (dict[e.titleKey] || route) : (e.title || route)) : route;
        var section = e && e.sectionKey ? (dict[e.sectionKey] || '') : '';
        return '<a data-route="' + route + '" class="menu-card">'
          + '<div class="menu-card-text">'
          + '<span class="menu-card-title">' + DoughCalc.escapeHtml(title) + '</span>'
          + (section ? '<span class="menu-card-sub">' + DoughCalc.escapeHtml(section) + '</span>' : '')
          + '</div>'
          + '<span class="favorite-btn" data-favorite-toggle data-route="' + route + '" role="button" tabindex="0" aria-label="' + DoughCalc.escapeHtml(dict.FAVORITE_REMOVE || '') + '">'
          + '<span class="iconify" data-icon="tabler:heart-filled"></span>'
          + '</span>'
          + '</a>';
      }).join('');

      DoughCalc.initFavoriteToggle(grid);
    });
};

/* Bread hub sort (data/pages/bread/bread.html, route 'bread' only —
   see the memory/architecture note for why only this hub: flour type
   and grain count only meaningfully vary within Bread, and every
   card there already carries data-flour/data-grain/data-preferment
   set by hand alongside the JSON at authoring time). Reorders the
   .menu-card elements inside #bread-menu-grid in place; independent
   of DoughCalc.initHomeSearch()'s own show/hide-on-search behavior.
   Preferment-group order is alphabetical by each preferment's own
   localized name, fetched via the existing DoughCalc.fetchPreferment
   cache (calc.js) — the same source of truth the recipe pages'
   preferment dropdown already uses, so labels can't drift. */
DoughCalc.BREAD_FLOUR_ORDER = ['wheat', 'rye', 'spelt', 'durum'];

DoughCalc.initBreadSort = function () {
  var select = document.getElementById('bread-sort-select');
  var grid = document.getElementById('bread-menu-grid');
  if (!select || !grid) return;

  function cards() {
    return Array.prototype.slice.call(grid.querySelectorAll('.menu-card'));
  }
  function titleOf(card) {
    var el = card.querySelector('.menu-card-title');
    return el ? el.textContent.trim() : '';
  }
  function locale() {
    return (DoughCalc.currentLocale && DoughCalc.currentLocale()) || 'uk';
  }
  function clearDividers() {
    Array.prototype.slice.call(grid.querySelectorAll('.menu-card-group-divider'))
      .forEach(function (d) { d.remove(); });
  }
  function render(list, groupKeyFn) {
    clearDividers();
    var lastKey = null;
    list.forEach(function (card, i) {
      if (groupKeyFn) {
        var key = groupKeyFn(card);
        if (i > 0 && key !== lastKey) {
          var hr = document.createElement('div');
          hr.className = 'menu-card-group-divider';
          grid.appendChild(hr);
        }
        lastKey = key;
      }
      grid.appendChild(card);
    });
  }

  function sortAlpha(dir) {
    var list = cards().sort(function (a, b) {
      return titleOf(a).localeCompare(titleOf(b), locale());
    });
    if (dir === 'za') list.reverse();
    render(list, null);
  }

  function sortByFlour() {
    var order = DoughCalc.BREAD_FLOUR_ORDER;
    var list = cards().sort(function (a, b) {
      var fa = order.indexOf(a.getAttribute('data-flour'));
      var fb = order.indexOf(b.getAttribute('data-flour'));
      if (fa !== fb) return fa - fb;
      return titleOf(a).localeCompare(titleOf(b), locale());
    });
    render(list, null);
  }

  function sortByGrain() {
    var list = cards().sort(function (a, b) {
      var ga = parseInt(a.getAttribute('data-grain'), 10) || 0;
      var gb = parseInt(b.getAttribute('data-grain'), 10) || 0;
      if (ga !== gb) return ga - gb;
      return titleOf(a).localeCompare(titleOf(b), locale());
    });
    render(list, null);
  }

  function sortByPreferment() {
    var dict = DoughCalc.getLangDictSync();
    var specialLabels = {
      any: dict.SORT_PREFERMENT_ANY || 'Без фіксованого преферементу',
      multi: dict.SORT_PREFERMENT_MULTI || 'Багатоетапні',
      none: dict.SORT_PREFERMENT_NONE || 'Без преферементу'
    };
    var ids = [];
    cards().forEach(function (c) {
      var id = c.getAttribute('data-preferment');
      if (ids.indexOf(id) === -1) ids.push(id);
    });
    var names = {};
    ids.forEach(function (id) { if (specialLabels[id]) names[id] = specialLabels[id]; });
    var realIds = ids.filter(function (id) { return !specialLabels[id]; });

    function finish() {
      var list = cards().sort(function (a, b) {
        var na = names[a.getAttribute('data-preferment')] || a.getAttribute('data-preferment');
        var nb = names[b.getAttribute('data-preferment')] || b.getAttribute('data-preferment');
        if (na !== nb) return na.localeCompare(nb, locale());
        return titleOf(a).localeCompare(titleOf(b), locale());
      });
      render(list, function (c) { return c.getAttribute('data-preferment'); });
    }

    var remaining = realIds.length;
    if (!remaining) { finish(); return; }
    realIds.forEach(function (id) {
      DoughCalc.fetchPreferment(id, function (data) {
        names[id] = (data && DoughCalc.pickLocalized(data.name)) || id;
        if (--remaining === 0) finish();
      });
    });
  }

  function applySort() {
    var mode = select.value;
    if (mode === 'za') sortAlpha('za');
    else if (mode === 'flour') sortByFlour();
    else if (mode === 'grain') sortByGrain();
    else if (mode === 'preferment') sortByPreferment();
    else sortAlpha('az');
  }

  select.addEventListener('change', applySort);
  applySort();
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

/* Floating mini-calculator (2026-08-22). A single global draggable
   popup for quick arithmetic while filling in the calculator's own
   number fields — not tied to any recipe's data, just plain +-×÷.
   Built once, appended to <body> (outside #content-area) so it
   survives route changes; the trigger icon is injected into every
   recipe page's "Режим вводу" card by DoughCalc.initRecipePage()
   (calc.js) calling DoughCalc.initMiniCalcTrigger() — no per-page
   HTML edits needed across the ~250 recipe pages. */
DoughCalc.miniCalcState = { current: '0', operator: null, previous: null, resetNext: false };

DoughCalc.initMiniCalcTrigger = function () {
  var entryToggle = document.getElementById('entry-toggle');
  if (!entryToggle) return;
  var row = entryToggle.parentElement;
  if (!row || row.querySelector('.mini-calc-trigger')) return; // already injected, or wrong markup

  var dict = DoughCalc.getLangDictSync();
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'icon-btn mini-calc-trigger';
  btn.setAttribute('aria-label', dict.MINI_CALC_OPEN || 'Калькулятор');
  btn.innerHTML = '<span class="iconify" data-icon="tabler:calculator"></span>';
  btn.addEventListener('click', function () { DoughCalc.toggleMiniCalc(); });

  row.insertBefore(btn, entryToggle);
  entryToggle.style.marginLeft = 'auto';
};

DoughCalc.toggleMiniCalc = function () {
  var el = document.getElementById('mini-calc');
  if (!el) {
    el = DoughCalc.buildMiniCalc();
    document.body.appendChild(el);
    // first open: park it near the bottom-right, fully on-screen
    var w = el.offsetWidth || 220, h = el.offsetHeight || 300;
    el.style.left = Math.max(8, window.innerWidth - w - 16) + 'px';
    el.style.top = Math.max(8, window.innerHeight - h - 88) + 'px';
  }
  el.style.display = (el.style.display === 'none' || !el.style.display) ? 'flex' : 'none';
};

DoughCalc.buildMiniCalc = function () {
  var dict = DoughCalc.getLangDictSync();
  var el = document.createElement('div');
  el.id = 'mini-calc';
  el.innerHTML =
    '<div class="mini-calc-header" id="mini-calc-drag">' +
      '<span class="iconify" data-icon="tabler:calculator"></span>' +
      '<span class="mini-calc-title">' + (dict.MINI_CALC_TITLE || 'Калькулятор') + '</span>' +
      '<button type="button" class="icon-btn mini-calc-close" aria-label="' + (dict.CLOSE || 'Закрити') + '">' +
        '<span class="iconify" data-icon="tabler:x"></span>' +
      '</button>' +
    '</div>' +
    '<div class="mini-calc-display" id="mini-calc-display">0</div>' +
    '<div class="mini-calc-grid">' +
      '<button data-mc="clear" class="mc-btn mc-btn-op">C</button>' +
      '<button data-mc="back" class="mc-btn mc-btn-op">⌫</button>' +
      '<button data-mc="percent" class="mc-btn mc-btn-op">%</button>' +
      '<button data-mc="op-÷" class="mc-btn mc-btn-op">÷</button>' +
      '<button data-mc="7" class="mc-btn">7</button>' +
      '<button data-mc="8" class="mc-btn">8</button>' +
      '<button data-mc="9" class="mc-btn">9</button>' +
      '<button data-mc="op-×" class="mc-btn mc-btn-op">×</button>' +
      '<button data-mc="4" class="mc-btn">4</button>' +
      '<button data-mc="5" class="mc-btn">5</button>' +
      '<button data-mc="6" class="mc-btn">6</button>' +
      '<button data-mc="op-−" class="mc-btn mc-btn-op">−</button>' +
      '<button data-mc="1" class="mc-btn">1</button>' +
      '<button data-mc="2" class="mc-btn">2</button>' +
      '<button data-mc="3" class="mc-btn">3</button>' +
      '<button data-mc="op-+" class="mc-btn mc-btn-op">+</button>' +
      '<button data-mc="0" class="mc-btn" style="grid-column: span 2;">0</button>' +
      '<button data-mc="dot" class="mc-btn">.</button>' +
      '<button data-mc="equals" class="mc-btn mc-btn-equals">=</button>' +
    '</div>';

  var display = null;
  function render() {
    if (!display) display = el.querySelector('#mini-calc-display');
    display.textContent = DoughCalc.miniCalcState.current;
  }

  el.querySelectorAll('.mc-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      DoughCalc.miniCalcPress(b.getAttribute('data-mc'));
      render();
    });
  });
  el.querySelector('.mini-calc-close').addEventListener('click', function () {
    el.style.display = 'none';
  });

  DoughCalc.makeDraggable(el.querySelector('#mini-calc-drag'), el);
  render();
  return el;
};

DoughCalc.miniCalcPress = function (key) {
  var s = DoughCalc.miniCalcState;
  function computeNow() {
    var prev = s.previous, curr = parseFloat(s.current);
    if (prev === null || s.operator === null || isNaN(curr)) return;
    var result;
    if (s.operator === '+') result = prev + curr;
    else if (s.operator === '−') result = prev - curr;
    else if (s.operator === '×') result = prev * curr;
    else if (s.operator === '÷') result = curr === 0 ? NaN : prev / curr;
    result = Math.round((result + Number.EPSILON) * 1e10) / 1e10; // trim fp noise
    s.current = String(result);
    s.operator = null;
    s.previous = null;
  }

  if (key === 'clear') {
    s.current = '0'; s.operator = null; s.previous = null; s.resetNext = false;
  } else if (key === 'back') {
    s.current = s.current.length > 1 ? s.current.slice(0, -1) : '0';
  } else if (key === 'dot') {
    if (s.resetNext) { s.current = '0.'; s.resetNext = false; }
    else if (s.current.indexOf('.') === -1) s.current += '.';
  } else if (key === 'percent') {
    var val = parseFloat(s.current);
    if (!isNaN(val)) {
      if (s.previous !== null && (s.operator === '+' || s.operator === '−')) {
        s.current = String(s.previous * val / 100);
      } else {
        s.current = String(val / 100);
      }
    }
  } else if (key === 'equals') {
    computeNow();
    s.resetNext = true;
  } else if (key.indexOf('op-') === 0) {
    var op = key.slice(3);
    if (s.operator && !s.resetNext) computeNow();
    s.previous = parseFloat(s.current);
    s.operator = op;
    s.resetNext = true;
  } else {
    // digit
    if (s.resetNext) { s.current = key; s.resetNext = false; }
    else s.current = s.current === '0' ? key : s.current + key;
  }
};

/* Generic draggable helper — used by the mini-calculator, kept
   general (handle element + the element it moves) in case another
   floating widget wants it later. Clamps fully within the viewport. */
DoughCalc.makeDraggable = function (handleEl, moveEl) {
  var dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;
  handleEl.style.cursor = 'move';
  handleEl.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return; // let buttons inside the handle (e.g. close) work normally
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    var rect = moveEl.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    handleEl.setPointerCapture(e.pointerId);
  });
  handleEl.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var w = moveEl.offsetWidth, h = moveEl.offsetHeight;
    var newX = origX + (e.clientX - startX);
    var newY = origY + (e.clientY - startY);
    newX = Math.max(0, Math.min(window.innerWidth - w, newX));
    newY = Math.max(0, Math.min(window.innerHeight - h, newY));
    moveEl.style.left = newX + 'px';
    moveEl.style.top = newY + 'px';
  });
  ['pointerup', 'pointercancel'].forEach(function (evt) {
    handleEl.addEventListener(evt, function () { dragging = false; });
  });
};
