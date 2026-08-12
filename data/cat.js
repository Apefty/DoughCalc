// ==========================================================
// Dough Calculator — SPA router
// Loads page fragments (data/pages/.../*.html — no <head>, no
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

/* Cache-busting for fetch() calls. GitHub Pages serves data/pages/*.html
   and data/json/*.json with caching headers that can make browsers keep
   showing stale content after a push (symptom: page shows an older
   recipe/number even though the repo is up to date). Appending a
   per-page-load version param forces a fresh request every visit
   without needing a manual hard-refresh. */
DoughCalc.CACHE_BUST = Date.now();
DoughCalc.withCacheBust = function (url) {
  return url + (url.indexOf('?') > -1 ? '&' : '?') + 'v=' + DoughCalc.CACHE_BUST;
};

DoughCalc.routes = {
  '': {
    file: 'data/pages/home.html'
  },

  'preferments': {
    file: 'data/pages/preferments/pref.html',
    init: function () { DoughCalc.initPrefermentsCatalog(); }
  },
  'preferments/biga': {
    file: 'data/pages/preferments/biga.html',
    json: 'data/json/pre/biga.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/poolish': {
    file: 'data/pages/preferments/poolish.html',
    json: 'data/json/pre/poolish.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/pf': {
    file: 'data/pages/preferments/pf.html',
    json: 'data/json/pre/pf.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/levain': {
    file: 'data/pages/preferments/levain.html',
    json: 'data/json/pre/levain.json',
    init: function (data) { DoughCalc.initLevainPage(data); }
  },
  'preferments/milk-levain': {
    file: 'data/pages/preferments/milk-levain.html',
    json: 'data/json/pre/milk-levain.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/opara': {
    file: 'data/pages/preferments/opara.html',
    json: 'data/json/pre/opara.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/lievito-madre': {
    file: 'data/pages/preferments/lievito-madre.html',
    json: 'data/json/pre/lievito-madre.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/sponge': {
    file: 'data/pages/preferments/sponge.html',
    init: function () {
      DoughCalc.initTabbedPreferentPage('sponge-calc-panel', 'sponge-tabs', {
        classic: 'sponge-classic',
        liquid: 'sponge-liquid',
        short: 'sponge-short'
      }, 'classic');
    }
  },
  'preferments/sourdough': {
    file: 'data/pages/preferments/sourdough.html',
    json: 'data/json/pre/sourdough.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/desem': {
    file: 'data/pages/preferments/desem.html',
    json: 'data/json/pre/desem.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/detmolder': {
    file: 'data/pages/preferments/detmolder.html',
    json: 'data/json/pre/detmolder.json',
    init: function () {
      DoughCalc.initTabbedPreferentPage('detmolder-calc-panel', 'detmolder-tabs', {
        anfrischsauer: 'detmolder-anfrischsauer',
        grundsauer: 'detmolder-grundsauer',
        vollsauer: 'detmolder-vollsauer'
      }, 'anfrischsauer');
    }
  },
  'preferments/zavarka': {
    file: 'data/pages/preferments/zavarka.html',
    json: 'data/json/pre/zavarka.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/salzsauer': {
    file: 'data/pages/preferments/salzsauer.html',
    json: 'data/json/pre/salzsauer.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/pie-de-masa': {
    file: 'data/pages/preferments/pie-de-masa.html',
    json: 'data/json/pre/pie-de-masa.json',
    init: function (data) { DoughCalc.initPrefermentPage(data); }
  },
  'preferments/raisin-juice': {
    file: 'data/pages/preferments/raisin-juice.html',
    json: 'data/json/pre/raisin-juice.json',
    init: function () {
      DoughCalc.initTabbedPreferentPage('raisin-juice-calc-panel', 'raisin-juice-tabs', {
        soak: 'raisin-soak',
        build1: 'raisin-build1',
        build2: 'raisin-build2'
      }, 'soak');
    }
  },
  'preferments/soakers': {
    file: 'data/pages/preferments/soakers.html',
    json: 'data/json/pre/soakers.json',
    init: function () {
      DoughCalc.initTabbedPreferentPage('soakers-calc-panel', 'soakers-tabs', {
        general: 'soaker-general',
        flax: 'soaker-flax',
        barley: 'soaker-barley'
      }, 'general');
    }
  },

  'bread': { file: 'data/pages/bread/bread.html' },
  'bread/wheat': { file: 'data/pages/bread/wheat.html', json: 'data/json/bread/wheat.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/rye': { file: 'data/pages/bread/rye.html', json: 'data/json/bread/rye.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/sourdough-bread': { file: 'data/pages/bread/sourdough-bread.html', json: 'data/json/bread/sourdough-bread.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/wholegrain': { file: 'data/pages/bread/wholegrain.html', json: 'data/json/bread/wholegrain.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/pan': { file: 'data/pages/bread/pan.html', json: 'data/json/bread/pan.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/rustic': { file: 'data/pages/bread/rustic.html', json: 'data/json/bread/rustic.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/pain-rustique': { file: 'data/pages/bread/pain-rustique.html', json: 'data/json/bread/pain-rustique.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/country': {
    file: 'data/pages/bread/country.html',
    json: 'data/json/bread/country.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 90 },
          { name: 'Цільнозернове борошно', pct: 10 }
        ]
      });
    }
  },
  'bread/honey-spelt': { file: 'data/pages/bread/honey-spelt.html', json: 'data/json/bread/honey-spelt.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'bread/five-grain-pf': {
    file: 'data/pages/bread/five-grain-pf.html',
    json: 'data/json/bread/five-grain-pf.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 80 },
          { name: 'Цільнозернове борошно', pct: 10 },
          { name: 'Житнє борошно', pct: 10 }
        ]
      });
    }
  },
  'bread/sunflower-pf': {
    file: 'data/pages/bread/sunflower-pf.html',
    json: 'data/json/bread/sunflower-pf.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 95 },
          { name: 'Житнє борошно', pct: 5 }
        ]
      });
    }
  },
  'bread/corn': {
    file: 'data/pages/bread/corn.html',
    json: 'data/json/bread/corn.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 75 },
          { name: 'Кукурудзяне борошно', pct: 25 }
        ]
      });
    }
  },
  'bread/whole-wheat': {
    file: 'data/pages/bread/whole-wheat.html',
    json: 'data/json/bread/whole-wheat.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Цільнозернове борошно', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/whole-wheat-multigrain': {
    file: 'data/pages/bread/whole-wheat-multigrain.html',
    json: 'data/json/bread/whole-wheat-multigrain.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Цільнозернове борошно', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/ww-multigrain-soaker': {
    file: 'data/pages/bread/ww-multigrain-soaker.html',
    json: 'data/json/bread/ww-multigrain-soaker.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Цільнозернове борошно', pct: 100 }
        ]
      });
    }
  },
  'bread/cracked-wheat': {
    file: 'data/pages/bread/cracked-wheat.html',
    json: 'data/json/bread/cracked-wheat.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'bread/vermont-sourdough': {
    file: 'data/pages/bread/vermont-sourdough.html',
    json: 'data/json/bread/vermont-sourdough.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 90 },
          { name: 'Цільнозернове борошно', pct: 10 }
        ]
      });
    }
  },
  'bread/vermont-sourdough-ww': {
    file: 'data/pages/bread/vermont-sourdough-ww.html',
    json: 'data/json/bread/vermont-sourdough-ww.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 85 },
          { name: 'Цільнозернове борошно', pct: 15 }
        ]
      });
    }
  },
  'bread/vermont-sourdough-increased-wg': {
    file: 'data/pages/bread/vermont-sourdough-increased-wg.html',
    json: 'data/json/bread/vermont-sourdough-increased-wg.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 70 },
          { name: 'Цільнозернове борошно', pct: 30 }
        ]
      });
    }
  },
  'bread/pain-au-levain': {
    file: 'data/pages/bread/pain-au-levain.html',
    json: 'data/json/bread/pain-au-levain.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 95 },
          { name: 'Цільнозернове борошно', pct: 5 }
        ]
      });
    }
  },
  'bread/pain-au-levain-ww': {
    file: 'data/pages/bread/pain-au-levain-ww.html',
    json: 'data/json/bread/pain-au-levain-ww.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 90 },
          { name: 'Цільнозернове борошно', pct: 10 }
        ]
      });
    }
  },
  'bread/pal-mixed-starters': {
    file: 'data/pages/bread/pal-mixed-starters.html',
    json: 'data/json/bread/pal-mixed-starters.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 95 },
          { name: 'Житнє борошно', pct: 5 }
        ]
      });
    }
  },
  'bread/miche-pointe-a-calliere': {
    file: 'data/pages/bread/miche-pointe-a-calliere.html',
    json: 'data/json/bread/miche-pointe-a-calliere.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Цільнозернове борошно (в.в.)', pct: 100 }
        ]
      });
    }
  },
  'bread/mixed-flour-miche': {
    file: 'data/pages/bread/mixed-flour-miche.html',
    json: 'data/json/bread/mixed-flour-miche.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 50 },
          { name: 'Цільнозернове борошно', pct: 40 },
          { name: 'Житнє борошно', pct: 10 }
        ]
      });
    }
  },
  'bread/whole-wheat-levain': {
    file: 'data/pages/bread/whole-wheat-levain.html',
    json: 'data/json/bread/whole-wheat-levain.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Цільнозернове борошно', pct: 100 }
        ]
      });
    }
  },
  'bread/durum': {
    file: 'data/pages/bread/durum.html',
    json: 'data/json/bread/durum.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Борошно дурум', pct: 100 }
        ]
      });
    }
  },
  'bread/harvest': {
    file: 'data/pages/bread/harvest.html',
    json: 'data/json/bread/harvest.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 80 },
          { name: 'Цільнозернове борошно', pct: 15 },
          { name: 'Житнє борошно', pct: 5 }
        ]
      });
    }
  },
  'bread/five-grain-levain': {
    file: 'data/pages/bread/five-grain-levain.html',
    json: 'data/json/bread/five-grain-levain.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 75 },
          { name: 'Цільнозернове борошно', pct: 25 }
        ]
      });
    }
  },
  'bread/sourdough-seed': {
    file: 'data/pages/bread/sourdough-seed.html',
    json: 'data/json/bread/sourdough-seed.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 92 },
          { name: 'Житнє борошно', pct: 8 }
        ]
      });
    }
  },
  'bread/rye-caraway-40': {
    file: 'data/pages/bread/rye-caraway-40.html',
    json: 'data/json/bread/rye-caraway-40.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 40 },
          { name: 'Хлібне борошно', pct: 60 }
        ]
      });
    }
  },
  'bread/whole-rye-whole-wheat': {
    file: 'data/pages/bread/whole-rye-whole-wheat.html',
    json: 'data/json/bread/whole-rye-whole-wheat.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 50 },
          { name: 'Цільнозернове борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/deli-rye': {
    file: 'data/pages/bread/deli-rye.html',
    json: 'data/json/bread/deli-rye.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 30 },
          { name: 'Хлібне борошно (clear flour)', pct: 70 }
        ]
      });
    }
  },
  'bread/sourdough-rye-walnuts': {
    file: 'data/pages/bread/sourdough-rye-walnuts.html',
    json: 'data/json/bread/sourdough-rye-walnuts.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/3stage-rye-90': {
    file: 'data/pages/bread/3stage-rye-90.html',
    json: 'data/json/bread/3stage-rye-90.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 90 },
          { name: 'Хлібне борошно', pct: 10 }
        ]
      });
    }
  },
  'bread/3stage-rye-80': {
    file: 'data/pages/bread/3stage-rye-80.html',
    json: 'data/json/bread/3stage-rye-80.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 80 },
          { name: 'Хлібне борошно', pct: 20 }
        ]
      });
    }
  },
  'bread/3stage-rye-70': {
    file: 'data/pages/bread/3stage-rye-70.html',
    json: 'data/json/bread/3stage-rye-70.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 70 },
          { name: 'Хлібне борошно', pct: 30 }
        ]
      });
    }
  },
  'bread/rye-raisins-walnuts': {
    file: 'data/pages/bread/rye-raisins-walnuts.html',
    json: 'data/json/bread/rye-raisins-walnuts.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/quarkbrot': {
    file: 'data/pages/bread/quarkbrot.html',
    json: 'data/json/bread/quarkbrot.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/rye-sourdough-66': {
    file: 'data/pages/bread/rye-sourdough-66.html',
    json: 'data/json/bread/rye-sourdough-66.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 66 },
          { name: 'Хлібне борошно', pct: 34 }
        ]
      });
    }
  },
  'bread/flaxseed': {
    file: 'data/pages/bread/flaxseed.html',
    json: 'data/json/bread/flaxseed.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 40 },
          { name: 'Хлібне борошно', pct: 60 }
        ]
      });
    }
  },
  'bread/rye-flour-soaker-80': {
    file: 'data/pages/bread/rye-flour-soaker-80.html',
    json: 'data/json/bread/rye-flour-soaker-80.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 80 },
          { name: 'Хлібне борошно', pct: 20 }
        ]
      });
    }
  },
  'bread/rye-soaker-ww-70': {
    file: 'data/pages/bread/rye-soaker-ww-70.html',
    json: 'data/json/bread/rye-soaker-ww-70.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 70 },
          { name: 'Цільнозернове борошно', pct: 30 }
        ]
      });
    }
  },
  'bread/vollkornbrot': {
    file: 'data/pages/bread/vollkornbrot.html',
    json: 'data/json/bread/vollkornbrot.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 100 }
        ]
      });
    }
  },
  'bread/vollkornbrot-flax': {
    file: 'data/pages/bread/vollkornbrot-flax.html',
    json: 'data/json/bread/vollkornbrot-flax.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 100 }
        ]
      });
    }
  },
  'bread/vollkornbrot-currants': {
    file: 'data/pages/bread/vollkornbrot-currants.html',
    json: 'data/json/bread/vollkornbrot-currants.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 100 }
        ]
      });
    }
  },
  'bread/horst-bandel-pumpernickel': {
    file: 'data/pages/bread/horst-bandel-pumpernickel.html',
    json: 'data/json/bread/horst-bandel-pumpernickel.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 100 }
        ]
      });
    }
  },
  'bread/flax-rye-old-bread': {
    file: 'data/pages/bread/flax-rye-old-bread.html',
    json: 'data/json/bread/flax-rye-old-bread.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 60 },
          { name: 'Хлібне борошно', pct: 40 }
        ]
      });
    }
  },
  'bread/black-bread': {
    file: 'data/pages/bread/black-bread.html',
    json: 'data/json/bread/black-bread.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 60 },
          { name: 'Хлібне борошно', pct: 40 }
        ]
      });
    }
  },
  'bread/5grain-sourdough-rye': {
    file: 'data/pages/bread/5grain-sourdough-rye.html',
    json: 'data/json/bread/5grain-sourdough-rye.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/sunflower-seed-rye': {
    file: 'data/pages/bread/sunflower-seed-rye.html',
    json: 'data/json/bread/sunflower-seed-rye.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/beer-bread': {
    file: 'data/pages/bread/beer-bread.html',
    json: 'data/json/bread/beer-bread.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 40 },
          { name: 'Хлібне борошно', pct: 60 }
        ]
      });
    }
  },
  'bread/rye-sourdough-65': {
    file: 'data/pages/bread/rye-sourdough-65.html',
    json: 'data/json/bread/rye-sourdough-65.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 65 },
          { name: 'Хлібне борошно', pct: 35 }
        ]
      });
    }
  },
  'bread/rye-firm-white-levain-65': {
    file: 'data/pages/bread/rye-firm-white-levain-65.html',
    json: 'data/json/bread/rye-firm-white-levain-65.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 65 },
          { name: 'Хлібне борошно', pct: 35 }
        ]
      });
    }
  },
  'bread/rye-no-acidified-65': {
    file: 'data/pages/bread/rye-no-acidified-65.html',
    json: 'data/json/bread/rye-no-acidified-65.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 65 },
          { name: 'Хлібне борошно', pct: 35 }
        ]
      });
    }
  },
  'bread/hand-mixed-white': {
    file: 'data/pages/bread/hand-mixed-white.html',
    json: 'data/json/bread/hand-mixed-white.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'bread/french-bread': {
    file: 'data/pages/bread/french-bread.html',
    json: 'data/json/bread/french-bread.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'bread/five-grain-straight': {
    file: 'data/pages/bread/five-grain-straight.html',
    json: 'data/json/bread/five-grain-straight.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'bread/whey': {
    file: 'data/pages/bread/whey.html',
    json: 'data/json/bread/whey.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'bread/ww-pecans-raisins': {
    file: 'data/pages/bread/ww-pecans-raisins.html',
    json: 'data/json/bread/ww-pecans-raisins.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Цільнозернове борошно', pct: 100 }
        ]
      });
    }
  },
  'bread/hazelnut-fig-rosemary': {
    file: 'data/pages/bread/hazelnut-fig-rosemary.html',
    json: 'data/json/bread/hazelnut-fig-rosemary.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'bread/german-farmers': {
    file: 'data/pages/bread/german-farmers.html',
    json: 'data/json/bread/german-farmers.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно', pct: 70 },
          { name: 'Хлібне борошно', pct: 30 }
        ]
      });
    }
  },
  'italian/pizza/classic': {
    file: 'data/pages/italian/pizza/classic.html',
    json: 'data/json/italian/pizza/classic.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'italian/focaccia/hamelman': {
    file: 'data/pages/italian/focaccia/hamelman.html',
    json: 'data/json/italian/focaccia/hamelman.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'italian/focaccia/fougasse-olives': {
    file: 'data/pages/italian/focaccia/fougasse-olives.html',
    json: 'data/json/italian/focaccia/fougasse-olives.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'italian/pasta': { file: 'data/pages/italian/pasta/pasta.html' },
  'italian/pasta/yellow': {
    file: 'data/pages/italian/pasta/yellow.html',
    json: 'data/json/italian/pasta/yellow.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pasta/green': {
    file: 'data/pages/italian/pasta/green.html',
    json: 'data/json/italian/pasta/green.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pasta/apulian-orecchiette': {
    file: 'data/pages/italian/pasta/apulian-orecchiette.html',
    json: 'data/json/italian/pasta/apulian-orecchiette.json',
      init: function (data) {
        DoughCalc.initRecipePage(data, {
          flourTypes: [
          { name: 'Семоліна', pct: 34 },
          { name: 'Універсальне борошно', pct: 66 }
          ]
        });
      }
  },
  'italian/pasta/buckwheat-pizzoccheri': {
    file: 'data/pages/italian/pasta/buckwheat-pizzoccheri.html',
    json: 'data/json/italian/pasta/buckwheat-pizzoccheri.json',
      init: function (data) {
        DoughCalc.initRecipePage(data, {
          flourTypes: [
          { name: 'Гречане борошно', pct: 70 },
          { name: 'Універсальне борошно', pct: 30 }
          ]
        });
      }
  },
  'italian/batters': { file: 'data/pages/italian/batters/batters.html' },
  'italian/batters/crespelle': {
    file: 'data/pages/italian/batters/crespelle.html',
    json: 'data/json/italian/batters/crespelle.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/hazan': {
    file: 'data/pages/italian/pizza/hazan.html',
    json: 'data/json/italian/pizza/hazan.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/sfinciuni': {
    file: 'data/pages/italian/focaccia/sfinciuni.html',
    json: 'data/json/italian/focaccia/sfinciuni.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/genovese-hazan': {
    file: 'data/pages/italian/focaccia/genovese-hazan.html',
    json: 'data/json/italian/focaccia/genovese-hazan.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/crescentina': {
    file: 'data/pages/italian/focaccia/crescentina.html',
    json: 'data/json/italian/focaccia/crescentina.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/focaccette': {
    file: 'data/pages/italian/focaccia/focaccette.html',
    json: 'data/json/italian/focaccia/focaccette.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'bread/mantovana': {
    file: 'data/pages/bread/mantovana.html',
    json: 'data/json/bread/mantovana.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'bread/pane-integrale': {
    file: 'data/pages/bread/pane-integrale.html',
    json: 'data/json/bread/pane-integrale.json',
      init: function (data) {
        DoughCalc.initRecipePage(data, {
          flourTypes: [
          { name: 'Цільнозернове борошно', pct: 35 },
          { name: 'Універсальне борошно', pct: 65 }
          ]
        });
      }
  },
  'bread/pane-di-grano-duro': {
    file: 'data/pages/bread/pane-di-grano-duro.html',
    json: 'data/json/bread/pane-di-grano-duro.json',
      init: function (data) {
        DoughCalc.initRecipePage(data, {
          flourTypes: [
          { name: 'Борошно дурум', pct: 100 }
          ]
        });
      }
  },
  'bread/apulia-olive': {
    file: 'data/pages/bread/apulia-olive.html',
    json: 'data/json/bread/apulia-olive.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'flatbread/piadina': {
    file: 'data/pages/flatbread/piadina.html',
    json: 'data/json/flatbread/piadina.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'flatbread/cassoni': {
    file: 'data/pages/flatbread/cassoni.html',
    json: 'data/json/flatbread/cassoni.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/pasta-frolla': {
    file: 'data/pages/sweet/pasta-frolla.html',
    json: 'data/json/sweet/pasta-frolla.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/pastry-fritters': {
    file: 'data/pages/sweet/pastry-fritters.html',
    json: 'data/json/sweet/pastry-fritters.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'bread/semolina': {
    file: 'data/pages/bread/semolina.html',
    json: 'data/json/bread/semolina.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 40 },
          { name: 'Борошно дурум', pct: 60 }
        ]
      });
    }
  },
  'bread/semolina-durum': {
    file: 'data/pages/bread/semolina-durum.html',
    json: 'data/json/bread/semolina-durum.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Борошно дурум', pct: 50 },
          { name: 'Хлібне борошно', pct: 50 }
        ]
      });
    }
  },
  'bread/semolina-soaker': {
    file: 'data/pages/bread/semolina-soaker.html',
    json: 'data/json/bread/semolina-soaker.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Борошно дурум', pct: 60 },
          { name: 'Хлібне борошно', pct: 40 }
        ]
      });
    }
  },
  'bread/additions': { file: 'data/pages/bread/additions.html', json: 'data/json/bread/additions.json', init: function (data) { DoughCalc.initRecipePage(data); } },

  'italian': { file: 'data/pages/italian/italian.html' },

  'italian/pizza': { file: 'data/pages/italian/pizza/pizza.html' },
  'italian/pizza/neapolitan': {
    file: 'data/pages/italian/pizza/neapolitan.html',
    json: 'data/json/italian/pizza/neapolitan.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Борошно 00', pct: 90 },
          { name: 'Семола', pct: 10 }
        ]
      });
    }
  },
  'italian/pizza/roman': {
    file: 'data/pages/italian/pizza/roman.html',
    json: 'data/json/italian/pizza/roman.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Борошно 00', pct: 70 },
          { name: 'Манітоба', pct: 30 }
        ]
      });
    }
  },
  'italian/pizza/sicilian': {
    file: 'data/pages/italian/pizza/sicilian.html',
    json: 'data/json/italian/pizza/sicilian.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },

  'italian/pizza/same-day': {
    file: 'data/pages/italian/pizza/same-day.html',
    json: 'data/json/italian/pizza/same-day.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/overnight-straight': {
    file: 'data/pages/italian/pizza/overnight-straight.html',
    json: 'data/json/italian/pizza/overnight-straight.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/bertinet': {
    file: 'data/pages/italian/pizza/bertinet.html',
    json: 'data/json/italian/pizza/bertinet.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/alsatian-ham': {
    file: 'data/pages/italian/pizza/alsatian-ham.html',
    json: 'data/json/italian/pizza/alsatian-ham.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/poolish-overnight': {
    file: 'data/pages/italian/pizza/poolish-overnight.html',
    json: 'data/json/italian/pizza/poolish-overnight.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/poolish-variation': {
    file: 'data/pages/italian/pizza/poolish-variation.html',
    json: 'data/json/italian/pizza/poolish-variation.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/biga': {
    file: 'data/pages/italian/pizza/biga.html',
    json: 'data/json/italian/pizza/biga.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/pizza/pissaladiere': {
    file: 'data/pages/italian/pizza/pissaladiere.html',
    json: 'data/json/italian/pizza/pissaladiere.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Біле борошно', pct: 80 },
          { name: 'Цільнозернове борошно', pct: 20 }
        ]
      });
    }
  },
  'italian/pizza/levain-overnight': {
    file: 'data/pages/italian/pizza/levain-overnight.html',
    json: 'data/json/italian/pizza/levain-overnight.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Біле борошно', pct: 98 },
          { name: 'Цільнозернове борошно', pct: 2 }
        ]
      });
    }
  },

  'italian/ciabatta': { file: 'data/pages/italian/ciabatta/ciabatta.html' },
  'italian/ciabatta/stiff-biga': {
    file: 'data/pages/italian/ciabatta/stiff-biga.html',
    json: 'data/json/italian/ciabatta/stiff-biga.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/ciabatta/poolish': {
    file: 'data/pages/italian/ciabatta/poolish.html',
    json: 'data/json/italian/ciabatta/poolish.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/ciabatta/olive-wheat-germ': {
    file: 'data/pages/italian/ciabatta/olive-wheat-germ.html',
    json: 'data/json/italian/ciabatta/olive-wheat-germ.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 95 },
          { name: 'Зародки пшениці', pct: 5 }
        ]
      });
    }
  },
  'italian/ciabatta/walnut-raisin': {
    file: 'data/pages/italian/ciabatta/walnut-raisin.html',
    json: 'data/json/italian/ciabatta/walnut-raisin.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Змішане борошно', pct: 95 },
          { name: 'Зародки пшениці', pct: 5 }
        ]
      });
    }
  },
  'italian/ciabatta/levain': {
    file: 'data/pages/italian/ciabatta/levain.html',
    json: 'data/json/italian/ciabatta/levain.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/ciabatta/overnight-autolyse': {
    file: 'data/pages/italian/ciabatta/overnight-autolyse.html',
    json: 'data/json/italian/ciabatta/overnight-autolyse.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 80 },
          { name: 'Житнє борошно', pct: 10 },
          { name: 'Цільнозернове борошно', pct: 10 }
        ]
      });
    }
  },

  'italian/focaccia': { file: 'data/pages/italian/focaccia/focaccia.html' },
  'italian/focaccia/ciabatta-style': {
    file: 'data/pages/italian/focaccia/ciabatta-style.html',
    json: 'data/json/italian/focaccia/ciabatta-style.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/genovese': {
    file: 'data/pages/italian/focaccia/genovese.html',
    json: 'data/json/italian/focaccia/genovese.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/olive-dough': {
    file: 'data/pages/italian/focaccia/olive-dough.html',
    json: 'data/json/italian/focaccia/olive-dough.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 96 },
          { name: 'Семоліна', pct: 4 }
        ]
      });
    }
  },
  'italian/focaccia/olive-anchovy': {
    file: 'data/pages/italian/focaccia/olive-anchovy.html',
    json: 'data/json/italian/focaccia/olive-anchovy.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 96 },
          { name: 'Семоліна', pct: 4 }
        ]
      });
    }
  },
  'italian/focaccia/ferrandi': {
    file: 'data/pages/italian/focaccia/ferrandi.html',
    json: 'data/json/italian/focaccia/ferrandi.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/pissaladiere': {
    file: 'data/pages/italian/focaccia/pissaladiere.html',
    json: 'data/json/italian/focaccia/pissaladiere.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 80 },
          { name: 'Цільнозернове борошно', pct: 20 }
        ]
      });
    }
  },
  'italian/focaccia/spanish-cocas': {
    file: 'data/pages/italian/focaccia/spanish-cocas.html',
    json: 'data/json/italian/focaccia/spanish-cocas.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'italian/focaccia/zucchini': {
    file: 'data/pages/italian/focaccia/zucchini.html',
    json: 'data/json/italian/focaccia/zucchini.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },

  'baguette': { file: 'data/pages/baguette/baguette.html' },
  'baguette/tradition': { file: 'data/pages/baguette/tradition.html', json: 'data/json/baguette/tradition.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/pointage-en-bac': { file: 'data/pages/baguette/pointage-en-bac.html', json: 'data/json/baguette/pointage-en-bac.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/unkneaded': { file: 'data/pages/baguette/unkneaded.html', json: 'data/json/baguette/unkneaded.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/white-dough': { file: 'data/pages/baguette/white-dough.html', json: 'data/json/baguette/white-dough.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/pf': { file: 'data/pages/baguette/pf.html', json: 'data/json/baguette/pf.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/poolish': { file: 'data/pages/baguette/poolish.html', json: 'data/json/baguette/poolish.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/traditional-poolish': { file: 'data/pages/baguette/traditional-poolish.html', json: 'data/json/baguette/traditional-poolish.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/multiseed-poolish': { file: 'data/pages/baguette/multiseed-poolish.html', json: 'data/json/baguette/multiseed-poolish.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/vienna': { file: 'data/pages/baguette/vienna.html', json: 'data/json/baguette/vienna.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/choc-vienna': { file: 'data/pages/baguette/choc-vienna.html', json: 'data/json/baguette/choc-vienna.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/sourdough': { file: 'data/pages/baguette/sourdough.html', json: 'data/json/baguette/sourdough.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/rustic-sourdough': { file: 'data/pages/baguette/rustic-sourdough.html', json: 'data/json/baguette/rustic-sourdough.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/marchand-du-vin': { file: 'data/pages/baguette/marchand-du-vin.html', json: 'data/json/baguette/marchand-du-vin.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'baguette/bacon-rolls': { file: 'data/pages/baguette/bacon-rolls.html', json: 'data/json/baguette/bacon-rolls.json', init: function (data) { DoughCalc.initRecipePage(data); } },

  'laminated': { file: 'data/pages/laminated/laminated.html' },
  'laminated/croissant': { file: 'data/pages/laminated/croissant.html' },
  'laminated/croissant/standard': {
    file: 'data/pages/laminated/croissant/standard.html',
    json: 'data/json/laminated/croissant/standard.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'laminated/croissant/choc': {
    file: 'data/pages/laminated/croissant/choc.html',
    json: 'data/json/laminated/croissant/choc.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'laminated/croissant/garlic-herb': {
    file: 'data/pages/laminated/croissant/garlic-herb.html',
    json: 'data/json/laminated/croissant/garlic-herb.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'laminated/croissant/flaky-rolls': {
    file: 'data/pages/laminated/croissant/flaky-rolls.html',
    json: 'data/json/laminated/croissant/flaky-rolls.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'laminated/feuillete': {
    file: 'data/pages/laminated/feuillete.html',
    json: 'data/json/laminated/feuillete.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'laminated/feuillete-ferrandi': {
    file: 'data/pages/laminated/feuillete-ferrandi.html',
    json: 'data/json/laminated/feuillete-ferrandi.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },

  'sweet': { file: 'data/pages/sweet/sweet.html' },
  'sweet/tart': { file: 'data/pages/sweet/tart.html' },
  'sweet/brioche': { file: 'data/pages/sweet/brioche.html' },
  'sweet/brioche/standard': { file: 'data/pages/sweet/brioche/standard.html', json: 'data/json/sweet/brioche/standard.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/vendee': { file: 'data/pages/sweet/brioche/vendee.html', json: 'data/json/sweet/brioche/vendee.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/gache': { file: 'data/pages/sweet/brioche/gache.html', json: 'data/json/sweet/brioche/gache.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/cardamom': { file: 'data/pages/sweet/brioche/cardamom.html', json: 'data/json/sweet/brioche/cardamom.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/pandoro': { file: 'data/pages/sweet/brioche/pandoro.html', json: 'data/json/sweet/brioche/pandoro.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/ferrandi-dough': { file: 'data/pages/sweet/brioche/ferrandi-dough.html', json: 'data/json/sweet/brioche/ferrandi-dough.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/sweet-dough': { file: 'data/pages/sweet/brioche/sweet-dough.html', json: 'data/json/sweet/brioche/sweet-dough.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/milk-rolls': { file: 'data/pages/sweet/brioche/milk-rolls.html', json: 'data/json/sweet/brioche/milk-rolls.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/brioche/vegan': { file: 'data/pages/sweet/brioche/vegan.html', json: 'data/json/sweet/brioche/vegan.json', init: function (data) { DoughCalc.initRecipePage(data); } },
  'sweet/paska': { file: 'data/pages/sweet/paska.html' },
  'sweet/paska/podilska': {
    file: 'data/pages/sweet/paska/podilska.html',
    json: 'data/json/sweet/paska/podilska.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/paska/zvychayna': {
    file: 'data/pages/sweet/paska/zvychayna.html',
    json: 'data/json/sweet/paska/zvychayna.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/paska/svyatkova': {
    file: 'data/pages/sweet/paska/svyatkova.html',
    json: 'data/json/sweet/paska/svyatkova.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/paska/pokutska': {
    file: 'data/pages/sweet/paska/pokutska.html',
    json: 'data/json/sweet/paska/pokutska.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/paska/grecka': {
    file: 'data/pages/sweet/paska/grecka.html',
    json: 'data/json/sweet/paska/grecka.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/panettone': {
    file: 'data/pages/sweet/panettone.html',
    json: 'data/json/sweet/panettone.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/kolomba': {
    file: 'data/pages/sweet/kolomba.html',
    json: 'data/json/sweet/kolomba.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/brioche/savory': {
    file: 'data/pages/sweet/brioche/savory.html',
    json: 'data/json/sweet/brioche/savory.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/stollen': {
    file: 'data/pages/sweet/stollen.html',
    json: 'data/json/sweet/stollen.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/pretzels': {
    file: 'data/pages/sweet/pretzels.html',
    json: 'data/json/sweet/pretzels.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/beesting': {
    file: 'data/pages/sweet/beesting.html',
    json: 'data/json/sweet/beesting.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/hot-cross-buns': {
    file: 'data/pages/sweet/hot-cross-buns.html',
    json: 'data/json/sweet/hot-cross-buns.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/soft-butter-rolls': {
    file: 'data/pages/sweet/soft-butter-rolls.html',
    json: 'data/json/sweet/soft-butter-rolls.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/bagels': {
    file: 'data/pages/sweet/bagels.html',
    json: 'data/json/sweet/bagels.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/bialys': {
    file: 'data/pages/sweet/bialys.html',
    json: 'data/json/sweet/bialys.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'enriched': { file: 'data/pages/enriched/enriched.html' },
  'enriched/challah': {
    file: 'data/pages/enriched/challah.html',
    json: 'data/json/enriched/challah.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'enriched/berne-brot': {
    file: 'data/pages/enriched/berne-brot.html',
    json: 'data/json/enriched/berne-brot.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'enriched/pullman': {
    file: 'data/pages/enriched/pullman.html',
    json: 'data/json/enriched/pullman.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'enriched/toast': {
    file: 'data/pages/enriched/toast.html',
    json: 'data/json/enriched/toast.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'enriched/oatmeal': {
    file: 'data/pages/enriched/oatmeal.html',
    json: 'data/json/enriched/oatmeal.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'enriched/oatmeal-cin-raisins': {
    file: 'data/pages/enriched/oatmeal-cin-raisins.html',
    json: 'data/json/enriched/oatmeal-cin-raisins.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'enriched/buttermilk': {
    file: 'data/pages/enriched/buttermilk.html',
    json: 'data/json/enriched/buttermilk.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 50 },
          { name: 'Цільнозернове борошно', pct: 50 }
        ]
      });
    }
  },
  'flatbread': { file: 'data/pages/flatbread/flatbread.html' },
  'flatbread/tarte-flambee': {
    file: 'data/pages/flatbread/tarte-flambee.html',
    json: 'data/json/flatbread/tarte-flambee.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'flatbread/sesame-breadsticks': {
    file: 'data/pages/flatbread/sesame-breadsticks.html',
    json: 'data/json/flatbread/sesame-breadsticks.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'flatbread/grissini': {
    file: 'data/pages/flatbread/grissini.html',
    json: 'data/json/flatbread/grissini.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'flatbread/lavash': {
    file: 'data/pages/flatbread/lavash.html',
    json: 'data/json/flatbread/lavash.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'flatbread/socca': {
    file: 'data/pages/flatbread/socca.html',
    json: 'data/json/flatbread/socca.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Борошно нуту (chickpea)', pct: 100 }
        ]
      });
    }
  },
  'technical': { file: 'data/pages/technical/technical.html' },
  'technical/dark-yeasted': {
    file: 'data/pages/technical/dark-yeasted.html',
    json: 'data/json/technical/dark-yeasted.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Хлібне борошно', pct: 92 },
          { name: 'Какао-порошок', pct: 8 }
        ]
      });
    }
  },
  'technical/light-yeasted': {
    file: 'data/pages/technical/light-yeasted.html',
    json: 'data/json/technical/light-yeasted.json',
    init: function (data) {
      DoughCalc.initRecipePage(data);
    }
  },
  'technical/pate-morte': {
    file: 'data/pages/technical/pate-morte.html',
    json: 'data/json/technical/pate-morte.json',
    init: function (data) {
      DoughCalc.initRecipePage(data, {
        flourTypes: [
          { name: 'Житнє борошно (сіяне, біле)', pct: 100 }
        ]
      });
    }
  },
  'sweet/tart/brisee': {
    file: 'data/pages/sweet/brisee.html',
    json: 'data/json/sweet/brisee.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/tart/sablee': {
    file: 'data/pages/sweet/sablee.html',
    json: 'data/json/sweet/sablee.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },
  'sweet/tart/sucree': {
    file: 'data/pages/sweet/sucree.html',
    json: 'data/json/sweet/sucree.json',
    init: function (data) { DoughCalc.initRecipePage(data); }
  },

  'calculator': {
    file: 'data/pages/calculator/calculator.html',
    init: function () { DoughCalc.initCalculatorPage(); }
  },

  'settings': {
    file: 'data/pages/settings/settings.html',
    init: function () { DoughCalc.initSettingsPage(); }
  }
};

DoughCalc.navigate = function (route) {
  var contentArea = document.getElementById('content-area');
  var r = DoughCalc.routes[route];

  if (!r) {
    // Route not built yet (e.g. #sweet, #laminated, #calculator placeholders) — no-op for now.
    return;
  }

  var htmlPromise = fetch(DoughCalc.withCacheBust(DoughCalc.BASE + r.file)).then(function (res) {
    if (!res.ok) throw new Error('Failed to load ' + r.file);
    return res.text();
  });
  var jsonPromise = r.json
    ? fetch(DoughCalc.withCacheBust(DoughCalc.BASE + r.json)).then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; })
    : Promise.resolve(null);

  Promise.all([htmlPromise, jsonPromise])
    .then(function (results) {
      var html = results[0], data = results[1];
      contentArea.innerHTML = html;
      if (typeof r.init === 'function') r.init(data);
      if (data && data.yt) DoughCalc.renderYouTube(data.yt);
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
    : (['preferments', 'bread', 'italian', 'baguette', 'sweet'].indexOf(section) > -1) ? 'recipes'
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
