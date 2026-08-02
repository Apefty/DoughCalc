// ==========================================================
// Dough Calculator — SPA router
// Loads page fragments (pages/.../*.html — no <head>, no
// bottom-nav, just <header>+<main>) into #content-area and
// runs the matching init function from calc.js afterwards.
// ==========================================================

window.DoughCalc = window.DoughCalc || {};

// Reliable base path for fetch() calls — works whether the page was opened
// as ".../DoughCalc" or ".../DoughCalc/" (GitHub Pages project sites don't
// always have a trailing slash, which otherwise breaks relative fetch paths).
DoughCalc.BASE = (function () {
  var path = location.pathname;
  if (!path.endsWith('/')) {
    path = path.substring(0, path.lastIndexOf('/') + 1);
  }
  return path;
})();

DoughCalc.routes = {
  '': {
    file: 'pages/home.html'
  },

  'preferments': { file: 'pages/preferments/pref.html' },
  'preferments/biga': {
    file: 'pages/preferments/biga.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS.biga); }
  },
  'preferments/poolish': {
    file: 'pages/preferments/poolish.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS.poolish); }
  },
  'preferments/pf': {
    file: 'pages/preferments/pf.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS.pf); }
  },
  'preferments/levain': {
    file: 'pages/preferments/levain.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS.levain); }
  },
  'preferments/opara': {
    file: 'pages/preferments/opara.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS.opara); }
  },
  'preferments/lievito-madre': {
    file: 'pages/preferments/lievito-madre.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS['lievito-madre']); }
  },
  'preferments/sponge': {
    file: 'pages/preferments/sponge.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS.sponge); }
  },
  'preferments/sourdough': {
    file: 'pages/preferments/sourdough.html',
    init: function () { DoughCalc.initPrefermentPage(DoughCalc.PREFERMENTS.sourdough); }
  },

  'bread': { file: 'pages/bread/bread.html' },
  'bread/wheat': { file: 'pages/bread/wheat.html', init: function () { DoughCalc.initRecipePage(); } },
  'bread/rye': { file: 'pages/bread/rye.html', init: function () { DoughCalc.initRecipePage(); } },
  'bread/sourdough-bread': { file: 'pages/bread/sourdough-bread.html', init: function () { DoughCalc.initRecipePage(); } },
  'bread/wholegrain': { file: 'pages/bread/wholegrain.html', init: function () { DoughCalc.initRecipePage(); } },
  'bread/pan': { file: 'pages/bread/pan.html', init: function () { DoughCalc.initRecipePage(); } },
  'bread/rustic': { file: 'pages/bread/rustic.html', init: function () { DoughCalc.initRecipePage(); } },
  'bread/additions': { file: 'pages/bread/additions.html', init: function () { DoughCalc.initRecipePage(); } },

  'pizza': { file: 'pages/pizza/pizza.html' },
  'pizza/neapolitan': {
    file: 'pages/pizza/neapolitan.html',
    init: function () {
      var flourTypesWidget = DoughCalc.initFlourTypes([
        { name: 'Борошно 00', pct: 90 },
        { name: 'Семола', pct: 10 }
      ]);
      DoughCalc.initRecipePage({
        onFlourChange: function (mainFlour) { flourTypesWidget.setMainFlour(mainFlour); }
      });
    }
  },
  'pizza/roman': {
    file: 'pages/pizza/roman.html',
    init: function () {
      var flourTypesWidget = DoughCalc.initFlourTypes([
        { name: 'Борошно 00', pct: 70 },
        { name: 'Манітоба (сильна)', pct: 30 }
      ]);
      DoughCalc.initRecipePage({
        onFlourChange: function (mainFlour) { flourTypesWidget.setMainFlour(mainFlour); }
      });
    }
  },
  'pizza/sicilian': {
    file: 'pages/pizza/sicilian.html',
    init: function () { DoughCalc.initRecipePage(); }
  },

  'baguette': {
    file: 'pages/baguette/baguette.html',
    init: function () { DoughCalc.initRecipePage(); }
  }
};

DoughCalc.navigate = function (route) {
  var contentArea = document.getElementById('content-area');
  var r = DoughCalc.routes[route];

  if (!r) {
    // Route not built yet (e.g. #sweet, #laminated, #calculator placeholders) — no-op for now.
    return;
  }

  fetch(DoughCalc.BASE + r.file)
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load ' + r.file);
      return res.text();
    })
    .then(function (html) {
      contentArea.innerHTML = html;
      if (typeof r.init === 'function') r.init();
      window.scrollTo(0, 0);
      DoughCalc.updateBottomNav(route);
    })
    .catch(function (err) {
      contentArea.innerHTML = '<p style="padding:20px;color:var(--text-muted);">Не вдалося завантажити сторінку: ' + (DoughCalc.BASE + r.file) + '<br>' + err.message + '</p>';
      console.error(err);
    });
};

/* Highlights the right bottom-nav tab for the current top-level section. */
DoughCalc.updateBottomNav = function (route) {
  var items = document.querySelectorAll('.bottom-nav-item');
  var section = route === '' ? 'home'
    : (route.indexOf('/') > -1 ? route.split('/')[0] : route);
  var activeKey = (section === 'home') ? 'home'
    : (['preferments', 'bread', 'pizza', 'baguette', 'sweet'].indexOf(section) > -1) ? 'recipes'
    : section;

  items.forEach(function (item) {
    item.classList.toggle('is-active', item.getAttribute('data-nav') === activeKey);
  });
};

DoughCalc.initRouter = function () {
  document.body.addEventListener('click', function (e) {
    var link = e.target.closest('[data-route]');
    if (!link) return;
    e.preventDefault();
    var route = link.getAttribute('data-route');
    if (location.hash.slice(1) === route) {
      DoughCalc.navigate(route);
    } else {
      location.hash = route;
    }
  });

  window.addEventListener('hashchange', function () {
    DoughCalc.navigate(location.hash.slice(1));
  });

  DoughCalc.navigate(location.hash.slice(1) || '');
};

document.addEventListener('DOMContentLoaded', DoughCalc.initRouter);
