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
