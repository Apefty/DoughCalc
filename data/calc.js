/* ==========================================================
   Dough Calculator — shared calculation logic
   Used by preferment pages (data/pages/preferments/*.html) and
   recipe pages (data/pages/bread/*.html, data/pages/pizza/*.html).
   ========================================================== */

window.DoughCalc = window.DoughCalc || {};

/* Where to fetch each preferment's data/json/pre/*.json (content —
   ratio, hydration, description, fermentation, used_in — lives only
   in those files now; this is just a path map, not data). */
DoughCalc.PREFERMENT_PATHS = {
  sourdough:       'data/json/pre/sourdough.json',
  levain:          'data/json/pre/levain.json',
  'levain-stiff':  'data/json/pre/levain-stiff.json',
  'levain-liquid': 'data/json/pre/levain-liquid.json',
  'milk-levain':   'data/json/pre/milk-levain.json',
  biga:            'data/json/pre/biga.json',
  poolish:         'data/json/pre/poolish.json',
  pf:              'data/json/pre/pf.json',
  opara:           'data/json/pre/opara.json',
  'lievito-madre': 'data/json/pre/lievito-madre.json',
  sponge:          'data/json/pre/sponge.json',
  'sponge-classic': 'data/json/pre/sponge-classic.json',
  'sponge-liquid':  'data/json/pre/sponge-liquid.json',
  'sponge-short':   'data/json/pre/sponge-short.json',
  desem:           'data/json/pre/desem.json',
  detmolder:       'data/json/pre/detmolder.json',
  'detmolder-anfrischsauer': 'data/json/pre/detmolder-anfrischsauer.json',
  'detmolder-grundsauer':    'data/json/pre/detmolder-grundsauer.json',
  'detmolder-vollsauer':     'data/json/pre/detmolder-vollsauer.json',
  zavarka:         'data/json/pre/zavarka.json',
  salzsauer:       'data/json/pre/salzsauer.json',
  'pie-de-masa':   'data/json/pre/pie-de-masa.json',
  'raisin-juice':  'data/json/pre/raisin-juice.json',
  'raisin-soak':   'data/json/pre/raisin-soak.json',
  'raisin-build1': 'data/json/pre/raisin-build1.json',
  'raisin-build2': 'data/json/pre/raisin-build2.json',
  soakers:         'data/json/pre/soakers.json',
  'soaker-general': 'data/json/pre/soaker-general.json',
  'soaker-flax':    'data/json/pre/soaker-flax.json',
  'soaker-barley':  'data/json/pre/soaker-barley.json'
};

/* UI labels for used_in / route sections (chrome, not recipe data —
   shared across every preferment page instead of copy-pasted).
   Resolved from the live language dict at call time (see
   DoughCalc.sectionLabel below) — this object is now only the
   Ukrainian fallback used if the dict hasn't loaded for some reason. */
DoughCalc.SECTION_LABELS = {
  preferments: 'Преферменти',
  bread: 'Хліб',
  pizza: 'Піца',
  baguette: 'Багети',
  sweet: 'Солодка випічка'
};
DoughCalc.SECTION_LABEL_KEYS = {
  preferments: 'PREFERMENTS',
  bread: 'BREAD',
  pizza: 'PIZZA_HUB',
  baguette: 'BAGUETTES',
  sweet: 'SWEET_BAKING'
};
DoughCalc.sectionLabel = function (key) {
  var dict = DoughCalc.getLangDictSync();
  var dictKey = DoughCalc.SECTION_LABEL_KEYS[key];
  return (dictKey && dict[dictKey]) || DoughCalc.SECTION_LABELS[key] || key;
};

DoughCalc._preferentCache = {};

/* Fetches (and caches) a preferment's JSON by id. cb(data|null). */
DoughCalc.fetchPreferment = function (id, cb) {
  if (id === 'none' || !DoughCalc.PREFERMENT_PATHS[id]) { cb(null); return; }
  if (DoughCalc._preferentCache[id]) { cb(DoughCalc._preferentCache[id]); return; }
  fetch(DoughCalc.withCacheBust(DoughCalc.BASE + DoughCalc.PREFERMENT_PATHS[id]))
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (data) DoughCalc._preferentCache[id] = data;
      cb(data);
    })
    .catch(function () { cb(null); });
};

/* Extracts { flour, water, third } out of a preferment JSON's
   "ratio" object, where the third component is keyed "yeast" or
   "starter" depending on "mode". */
DoughCalc._ratioOf = function (data) {
  var r = data.ratio || {};
  var third = data.mode === 'starter' ? r.starter : r.yeast;
  return { flour: r.flour, water: r.water, third: third || 0 };
};

function dcNum(id) {
  var el = document.getElementById(id);
  return el ? (parseFloat(el.value) || 0) : 0;
}

function dcSetHTML(id, html) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* ----------------------------------------------------------
   Preferments catalog (pref.html)

   Card markup only carries the route + icon; title and subtitle
   are filled in from each preferment's own JSON (via the shared
   fetchPreferment cache) so the catalog can't drift out of sync
   with the actual recipe data the way hand-typed text did before
   (e.g. sourdough's card once said "100% гідратації" while
   sourdough.json had hydration: 80).

   Required markup: .menu-card[data-pre] containing
   .menu-card-title and .menu-card-sub (both empty).
   ---------------------------------------------------------- */
DoughCalc.initPrefermentsCatalog = function () {
  document.querySelectorAll('.menu-card[data-pre]').forEach(function (card) {
    var id = card.getAttribute('data-pre');
    DoughCalc.fetchPreferment(id, function (data) {
      if (!data) return;
      var titleEl = card.querySelector('.menu-card-title');
      var subEl = card.querySelector('.menu-card-sub');
      if (titleEl) titleEl.textContent = (data.name && data.name.uk) || '';
      if (subEl) {
        var dict = DoughCalc.getLangDictSync();
        subEl.textContent = data.hydration != null
          ? data.hydration + '% ' + (dict.HYDRATION_PCT_SUFFIX || 'гідратації') + (data.fermentation && data.fermentation.duration_note_uk ? ', ' + data.fermentation.duration_note_uk : '')
          : (data.master ? (dict.MASTER_PLUS_BUILDS || 'Материнська культура + білди (Stiff/Liquid)') : (data.builds ? data.builds.length + (dict.BUILDS_COUNT_SUFFIX || ' варіанти') : ''));
      }
    });
  });
};

/* ----------------------------------------------------------
   Preferment page calculator
   (biga.html, poolish.html, pf.html, levain.html, opara.html,
    lievito-madre.html, sponge.html, sourdough.html)

   Takes the full preferment JSON (fetched by cat.js's router) and
   renders everything from it: hero pills + description, the
   flour/water/third breakdown, fermentation duration/temperature,
   and the "used in" tags. Nothing content-related is hardcoded in
   the page markup anymore — only ids for this function to fill.

   Required markup ids: #hero-pills, #hero-desc, #mode-toggle
   .segmented-item[data-mode], #input-weight, #input-label,
   #third-label, #third-icon, #out-flour, #out-water, #out-third,
   #out-total, #ferment-duration, #ferment-temp, #used-in-tags
   ---------------------------------------------------------- */
DoughCalc.initPrefermentPage = function (data) {
  if (!data) return;
  var dict = DoughCalc.getLangDictSync();
  var ratio = DoughCalc._ratioOf(data);
  var isStarter = data.mode === 'starter';
  var thirdName = isStarter ? (dict.SOURDOUGH || 'Закваска') : (dict.YEAST || 'Дріжджі');
  var formula = data.yeast_formula; // e.g. poolish: { constant, time_range_hours, default_hours }
  /* Some builds have no fermentation agent at all — scalds, soakers,
     raisin-juice stages, Detmolder's Grundsauer/Vollsauer (which use
     the entire previous stage rather than a % starter). Distinguish
     "genuinely no third ingredient" from "0% of one" by checking the
     JSON directly rather than the resolved ratio.third (which
     defaults to 0 either way). */
  var hasThird = !!(data.ratio && (data.ratio.yeast != null || data.ratio.starter != null)) || !!formula;

  var thirdPillText = formula
    ? (dict.YEAST_BY_FERMENTATION_TIME || 'дріжджі за часом ферментації')
    : (ratio.third + '% ' + (isStarter ? (dict.THIRD_STARTER_GENITIVE || 'закваски') : (dict.THIRD_YEAST_GENITIVE || 'дріжджів')));
  dcSetHTML('hero-pills',
    '<span class="pill pill-accent">' + data.hydration + '% ' + (dict.HYDRATION_PCT_SUFFIX || 'гідратації') + '</span>' +
    (hasThird ? '<span class="pill">' + thirdPillText + '</span>' : ''));
  dcSetHTML('hero-desc', (data.description && data.description.uk) || '');

  var thirdRowEl = document.getElementById('third-row');
  if (thirdRowEl) thirdRowEl.style.display = hasThird ? 'flex' : 'none';

  var thirdLabelEl = document.getElementById('third-label');
  if (thirdLabelEl) {
    var icon = document.getElementById('third-icon');
    if (icon) icon.src = 'img/icons/' + (isStarter ? 'starter' : 'yeast') + '.png';
    thirdLabelEl.lastChild.textContent = thirdName;
  }

  /* Optional: some builds use milk instead of water (e.g. sponge-liquid).
     water-label/water-icon ids are optional too, so pages that don't
     have them (every preferment except the liquid sponge build) are
     unaffected. */
  var waterLabelEl = document.getElementById('water-label');
  if (waterLabelEl && data.liquid_ingredient) {
    var waterIcon = document.getElementById('water-icon');
    if (waterIcon && data.liquid_ingredient.icon) waterIcon.src = 'img/icons/' + data.liquid_ingredient.icon + '.png';
    waterLabelEl.lastChild.textContent = (data.liquid_ingredient.uk) || waterLabelEl.lastChild.textContent;
  }

  /* Optional: the first ingredient isn't always flour (e.g. raisins
     for a raisin-juice soak). flour-label/flour-icon ids are optional
     — only raisin-soak uses them. */
  var flourLabelEl = document.getElementById('flour-label');
  if (flourLabelEl && data.first_ingredient) {
    var flourIcon = document.getElementById('flour-icon');
    if (flourIcon && data.first_ingredient.icon) flourIcon.src = 'img/icons/' + data.first_ingredient.icon + '.png';
    flourLabelEl.lastChild.textContent = (data.first_ingredient.uk) || flourLabelEl.lastChild.textContent;
  }
  var inputLabelEl = document.getElementById('input-label');
  if (inputLabelEl && data.first_ingredient) {
    inputLabelEl.textContent = (dict.WEIGHT_PREFIX || 'Вага: ') + data.first_ingredient.uk;
  }

  if (data.fermentation) {
    dcSetHTML('ferment-duration', data.fermentation.duration_note_uk || '');
    dcSetHTML('ferment-temp', data.fermentation.temperature_note_uk || '');
  }

  var tagsEl = document.getElementById('used-in-tags');
  if (tagsEl && data.used_in) {
    tagsEl.innerHTML = data.used_in.map(function (key) {
      var label = DoughCalc.sectionLabel(key);
      return '<a href="#' + key + '" class="tag" data-route="' + key + '">' + label + '</a>';
    }).join('');
  }

  var input = document.getElementById('input-weight');
  var label = document.getElementById('input-label');
  var buttons = document.querySelectorAll('#mode-toggle .segmented-item');
  var mode = 'flour';

  /* Water × 40 ÷ fermentation hours (metric): needs a time slider
     instead of a fixed baker's percentage. Range and default come
     from the JSON, not hardcoded here — see poolish.json's
     yeast_formula. */
  var timeInput = null, timeDisplay = null;
  if (formula) {
    var range = formula.time_range_hours || [1, 18];
    var hrEl = document.querySelector('main.recipe-page .hr');
    if (hrEl) {
      hrEl.insertAdjacentHTML('beforebegin',
        '<div class="field-row">' +
          '<label for="input-ferment-time" class="field-label">' + (dict.FERMENT_TIME || 'Час ферментації') + '</label>' +
          '<div class="value-box value-box-accent"><span id="ferment-time-display">' + formula.default_hours + '</span><span class="value-unit">' + (dict.UNIT_H || 'год') + '</span></div>' +
        '</div>' +
        '<input type="range" id="input-ferment-time" min="' + range[0] + '" max="' + range[1] + '" step="1" value="' + formula.default_hours + '" style="width:100%;margin:0 0 16px;">'
      );
      timeInput = document.getElementById('input-ferment-time');
      timeDisplay = document.getElementById('ferment-time-display');
      timeInput.addEventListener('input', render);
    }
  }

  function render() {
    var v = parseFloat(input.value) || 0;
    var flour;
    var thirdRatio = formula ? 0 : ratio.third; // formula ignores baker's % for the third component
    var saltRatio = ratio.salt || 0; // optional — only Pâte fermentée uses this so far
    if (mode === 'flour') {
      flour = v;
    } else {
      var unitTotal = ratio.flour + ratio.water + thirdRatio + saltRatio;
      flour = v * (ratio.flour / unitTotal);
    }
    var water = flour * (ratio.water / ratio.flour);
    var third;
    if (formula) {
      var hours = timeInput ? (parseFloat(timeInput.value) || formula.default_hours) : formula.default_hours;
      if (timeDisplay) timeDisplay.textContent = hours;
      third = water * formula.constant / hours;
    } else {
      third = flour * (ratio.third / ratio.flour);
    }
    var salt = saltRatio ? flour * (saltRatio / ratio.flour) : 0;

    dcSetHTML('out-flour', Math.round(flour) + ' <span class="unit">' + (dict.UNIT_G || 'г') + '</span>');
    dcSetHTML('out-water', Math.round(water) + ' <span class="unit">' + (dict.UNIT_ML || 'мл') + '</span>');
    dcSetHTML('out-third', (Math.round(third * 10) / 10) + ' <span class="unit">' + (dict.UNIT_G || 'г') + '</span>');
    if (saltRatio) dcSetHTML('out-salt', (Math.round(salt * 10) / 10) + ' <span class="unit">' + (dict.UNIT_G || 'г') + '</span>');
    var totalEl = document.getElementById('out-total');
    if (totalEl) totalEl.textContent = Math.round(flour + water + third + salt) + ' ' + (dict.UNIT_G || 'г');
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      mode = btn.getAttribute('data-mode');
      label.textContent = mode === 'flour'
        ? (data.first_ingredient ? (dict.WEIGHT_PREFIX || 'Вага: ') + data.first_ingredient.uk : (dict.FLOUR_WEIGHT || 'Вага борошна'))
        : (dict.PREFERMENT_WEIGHT || 'Вага преферменту');
      render();
    });
  });

  if (input) input.addEventListener('input', render);
  render();
};

/* ----------------------------------------------------------
   Levain page (levain.html) — Master/Stiff/Liquid tabs.

   Master is culture-maintenance info only (no calculator — a
   master levain isn't mixed into dough directly, see levain.json's
   master.description). Stiff and Liquid are full preferments with
   their own JSON (levain-stiff.json / levain-liquid.json) and reuse
   the exact same calculator markup/behavior as initPrefermentPage —
   switching tabs just re-fetches and re-renders it.

   Required markup ids: #levain-tabs .segmented-item[data-tab],
   #levain-master-panel, #master-desc, #levain-calc-panel (plus
   everything initPrefermentPage needs, nested inside that panel)
   ---------------------------------------------------------- */
DoughCalc.initLevainPage = function (masterData) {
  if (!masterData) return;
  dcSetHTML('master-desc', (masterData.master && masterData.master.description && masterData.master.description.uk) || '');

  var sr = masterData.master && masterData.master.starter_recipe;
  if (sr) {
    var listEl = document.getElementById('starter-recipe-list');
    if (listEl && sr.ingredients) {
      listEl.innerHTML = sr.ingredients.map(function (ing) {
        return '<div class="row-list-item"><div class="row-list-label">' + ing.name_uk + '</div>' +
          '<span class="row-list-value">' + ing.amount_g + ' <span class="unit">г</span></span></div>';
      }).join('');
    }
    dcSetHTML('starter-recipe-yield', sr.yield_g + ' г');
    dcSetHTML('starter-recipe-ferment', sr.fermentation_note_uk || '');
  }

  var tabs = document.querySelectorAll('#levain-tabs .segmented-item');
  var masterPanel = document.getElementById('levain-master-panel');
  var calcPanel = document.getElementById('levain-calc-panel');
  var calcPanelTemplate = calcPanel.innerHTML; // pristine markup, reused on every tab switch
  var loadedBuild = null;

  function showTab(tab) {
    tabs.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tab') === tab); });

    if (tab === 'master') {
      masterPanel.style.display = 'block';
      calcPanel.style.display = 'none';
      return;
    }

    masterPanel.style.display = 'none';
    calcPanel.style.display = 'block';
    var id = tab === 'stiff' ? 'levain-stiff' : 'levain-liquid';
    if (loadedBuild === id) return;
    loadedBuild = id;
    calcPanel.innerHTML = calcPanelTemplate; // reset so initPrefermentPage attaches fresh listeners
    DoughCalc.fetchPreferment(id, function (data) {
      DoughCalc.initPrefermentPage(data);
    });
  }

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () { showTab(btn.getAttribute('data-tab')); });
  });

  showTab('master');
};

/* ----------------------------------------------------------
   Sponge page (two independent builds, no shared master —
   unlike Levain, Класичний/Рідкий don't come from one starter
   culture, so both tabs go straight to a calc panel). shellData
   is sponge.json: { id, name, builds: [...] }.
   ---------------------------------------------------------- */
DoughCalc.initSpongePage = function (shellData) {
  if (!shellData) return;

  var tabs = document.querySelectorAll('#sponge-tabs .segmented-item');
  var calcPanel = document.getElementById('sponge-calc-panel');
  var calcPanelTemplate = calcPanel.innerHTML; // pristine markup, reused on every tab switch
  var loadedBuild = null;

  function showTab(tab) {
    tabs.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tab') === tab); });
    var id = tab === 'liquid' ? 'sponge-liquid' : 'sponge-classic';
    if (loadedBuild === id) return;
    loadedBuild = id;
    calcPanel.innerHTML = calcPanelTemplate; // reset so initPrefermentPage attaches fresh listeners
    DoughCalc.fetchPreferment(id, function (data) {
      DoughCalc.initPrefermentPage(data);
    });
  }

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () { showTab(btn.getAttribute('data-tab')); });
  });

  showTab('classic');
};

/* ----------------------------------------------------------
   Generic multi-tab preferment page (2+ independent/sequential
   builds sharing one calc panel, no master). Used by Detmolder
   (3 stages), Raisin Juice (soak + 2 builds), Soakers (grain
   types) — same tab-switch pattern as initSpongePage, but data-
   driven instead of one bespoke function per preferment.
   tabToId maps each data-tab value to a PREFERMENT_PATHS key.
   ---------------------------------------------------------- */
DoughCalc.initTabbedPreferentPage = function (panelId, tabsContainerId, tabToId, defaultTab) {
  var tabs = document.querySelectorAll('#' + tabsContainerId + ' .segmented-item');
  var calcPanel = document.getElementById(panelId);
  if (!calcPanel) return;
  var calcPanelTemplate = calcPanel.innerHTML;
  var loadedBuild = null;

  function showTab(tab) {
    tabs.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-tab') === tab); });
    var id = tabToId[tab] || tab;
    if (loadedBuild === id) return;
    loadedBuild = id;
    calcPanel.innerHTML = calcPanelTemplate; // reset so initPrefermentPage attaches fresh listeners
    DoughCalc.fetchPreferment(id, function (data) {
      DoughCalc.initPrefermentPage(data);
    });
  }

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () { showTab(btn.getAttribute('data-tab')); });
  });

  showTab(defaultTab);
};

/* ----------------------------------------------------------
   Recipe page calculator
   (data/pages/bread/*.html, data/pages/pizza/*.html)

   options.onFlourChange(mainFlour) — optional callback fired
   every render with the main-mix flour weight (total flour
   minus whatever went into the preferment). Used by
   DoughCalc.initFlourTypes() to split that flour into 00/semola/etc.
   ---------------------------------------------------------- */
DoughCalc.initRecipePage = function (recipeData, options) {
  if (recipeData && typeof recipeData === 'object' && !options && !recipeData.baker_percentages_default && !recipeData.compatible_preferments) {
    options = recipeData;
    recipeData = null;
  }
  options = options || {};
  var onFlourChange = options.onFlourChange;
  var dict = DoughCalc.getLangDictSync();

  /* hero-desc is optional markup — only recipe pages that include a
     <p id="hero-desc"> get the description filled in; pages without
     it (not yet migrated) are unaffected. */
  if (recipeData && recipeData.description && recipeData.description.uk) {
    dcSetHTML('hero-desc', recipeData.description.uk);
  }

  var entryButtons = document.querySelectorAll('#entry-toggle .segmented-item');
  var entryMode = 'total';
  var rowTotal = document.getElementById('row-total');
  var rowFlour = document.getElementById('row-flour');
  var rowPortions = document.getElementById('row-portions');
  var rowPortionWeight = document.getElementById('row-portion-weight');

  entryButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      entryButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      entryMode = btn.getAttribute('data-entry');
      rowTotal.style.display = entryMode === 'total' ? 'flex' : 'none';
      rowFlour.style.display = entryMode === 'flour' ? 'flex' : 'none';
      rowPortions.style.display = entryMode === 'portions' ? 'flex' : 'none';
      rowPortionWeight.style.display = entryMode === 'portions' ? 'flex' : 'none';
      render();
    });
  });

  var selectPreferment = document.getElementById('select-preferment');
  var rowPrePercent = document.getElementById('row-pre-percent');
  var preHr = document.getElementById('pre-hr');
  var preBreakdown = document.getElementById('pre-breakdown');
  var currentPreData = null; // fetched data/json/pre/<id>.json for the selected preferment
  var flourTypesWidget = null;
  var preTimeRow = null, preTimeInput = null, preTimeDisplay = null;

  if (document.getElementById('flour-types-list')) {
    flourTypesWidget = DoughCalc.initFlourTypes(options.flourTypes);
  }

  /* Some preferments (poolish) size their yeast from a fermentation
     time rather than a fixed baker's %: yeast = water × constant ÷
     hours (see data/json/pre/poolish.json's yeast_formula). When the
     selected preferment declares one, show a time slider here too —
     range/default come from that JSON, not hardcoded. */
  function ensurePreTimeRow(formula) {
    if (!preTimeRow) {
      rowPrePercent.insertAdjacentHTML('afterend',
        '<div class="field-row" id="row-pre-ferment-time" style="display:none;">' +
          '<label for="input-pre-ferment-time" class="field-label">' + (dict.FERMENT_TIME_PREFERMENT || 'Час ферментації преферменту') + '</label>' +
          '<div class="value-box value-box-accent"><span id="pre-ferment-time-display"></span><span class="value-unit">' + (dict.UNIT_H || 'год') + '</span></div>' +
        '</div>' +
        '<input type="range" id="input-pre-ferment-time" style="width:100%;margin:0 0 16px;display:none;">'
      );
      preTimeRow = document.getElementById('row-pre-ferment-time');
      preTimeInput = document.getElementById('input-pre-ferment-time');
      preTimeDisplay = document.getElementById('pre-ferment-time-display');
      preTimeInput.addEventListener('input', render);
    }
    if (formula) {
      var range = formula.time_range_hours || [1, 18];
      preTimeInput.min = range[0];
      preTimeInput.max = range[1];
      preTimeInput.step = 1;
      preTimeInput.value = formula.default_hours;
      preTimeDisplay.textContent = formula.default_hours;
      preTimeRow.style.display = 'flex';
      preTimeInput.style.display = 'block';
    } else {
      preTimeRow.style.display = 'none';
      preTimeInput.style.display = 'none';
    }
  }

  function loadSelectedPreferment() {
    var key = selectPreferment.value;
    if (key === 'none') { currentPreData = null; ensurePreTimeRow(null); render(); return; }
    DoughCalc.fetchPreferment(key, function (data) {
      currentPreData = data;
      var thirdLabel = data && data.mode === 'starter' ? (dict.SOURDOUGH || 'Закваска') : (dict.YEAST || 'Дріжджі');
      var labelEl = document.querySelector('#pre-breakdown .row-list-item:nth-child(3) .row-list-label');
      if (labelEl) labelEl.lastChild.textContent = thirdLabel;
      ensurePreTimeRow(data && data.yeast_formula);
      render();
    });
  }

  /* Builds <select id="select-preferment"> from the recipe's own
     compatible_preferments (data/json/.../*.json) instead of a
     hand-typed <option> list per page — each recipe only offers
     preferments that actually make sense for it, and the option
     labels come from each preferment's own name.uk (via the shared
     fetchPreferment cache) so they can't drift out of sync with the
     preferment pages the way copy-pasted labels could. cb() runs
     once the select is fully populated. */
  function buildPreferentOptions(cb) {
    /* fixed_preferment: true (e.g. Багети recipe cards) means the
       preferment (or lack of one) is a defining part of that specific
       recipe, not a user choice — the dropdown shows just that one
       option and is disabled, instead of the usual "Без преферменту"
       + full compatible_preferments list. */
    var fixed = !!(recipeData && recipeData.fixed_preferment);
    var ids = (recipeData && recipeData.compatible_preferments) || [];

    selectPreferment.innerHTML = (fixed && ids.length)
      ? ''
      : '<option value="none">' + (dict.NO_PREFERMENT || 'Без преферменту') + '</option>';

    if (!ids.length) {
      selectPreferment.disabled = fixed;
      cb();
      return;
    }

    var opts = new Array(ids.length);
    var remaining = ids.length;
    ids.forEach(function (id, i) {
      DoughCalc.fetchPreferment(id, function (data) {
        opts[i] = { id: id, name: (data && data.name && data.name.uk) || id };
        if (--remaining === 0) {
          opts.forEach(function (o) {
            var el = document.createElement('option');
            el.value = o.id;
            el.textContent = o.name;
            selectPreferment.appendChild(el);
          });
          selectPreferment.disabled = fixed;
          cb();
        }
      });
    });
  }

  function applyRecipeDefaults() {
    if (!recipeData) return;

    var pctMap = [
      { key: 'hydration', pctId: 'pct-hydration', rngId: 'rng-hydration' },
      { key: 'salt', pctId: 'pct-salt', rngId: 'rng-salt' },
      { key: 'yeast', pctId: 'pct-yeast', rngId: 'rng-yeast' },
      { key: 'oil', pctId: 'pct-oil', rngId: 'rng-oil' },
      { key: 'milk', pctId: 'pct-milk', rngId: 'rng-milk' },
      { key: 'sugar', pctId: 'pct-sugar', rngId: 'rng-sugar' },
      { key: 'egg', pctId: 'pct-egg', rngId: 'rng-egg' },
      { key: 'butter', pctId: 'pct-butter', rngId: 'rng-butter' },
      { key: 'candy', pctId: 'pct-candy', rngId: 'rng-candy' }
    ];

    var defaults = recipeData.baker_percentages_default || {};
    pctMap.forEach(function (map) {
      var cfg = defaults[map.key];
      if (!cfg) return;

      var pctInput = document.getElementById(map.pctId);
      var rangeInput = document.getElementById(map.rngId);
      if (pctInput) {
        if (cfg.min != null) pctInput.min = cfg.min;
        if (cfg.max != null) pctInput.max = cfg.max;
        if (cfg.step != null) pctInput.step = cfg.step;
        if (cfg.value != null) pctInput.value = cfg.value;
      }
      if (rangeInput) {
        if (cfg.min != null) rangeInput.min = cfg.min;
        if (cfg.max != null) rangeInput.max = cfg.max;
        if (cfg.step != null) rangeInput.step = cfg.step;
        if (cfg.value != null) rangeInput.value = cfg.value;
        updateSlider(rangeInput);
      }
    });

    if (recipeData.default_preferment_percent != null) {
      var prePercentInput = document.getElementById('input-pre-percent');
      if (prePercentInput) {
        prePercentInput.value = recipeData.default_preferment_percent;
      }
    }
  }

  if (selectPreferment) {
    selectPreferment.addEventListener('change', function () {
      var isNone = selectPreferment.value === 'none';
      if (rowPrePercent) rowPrePercent.style.display = isNone ? 'none' : 'flex';
      if (preHr) preHr.style.display = isNone ? 'none' : 'block';
      if (preBreakdown) preBreakdown.style.display = isNone ? 'none' : 'block';
      loadSelectedPreferment();
    });

    buildPreferentOptions(function () {
      if (recipeData && recipeData.default_preferment) {
        selectPreferment.value = recipeData.default_preferment;
        var isNone = selectPreferment.value === 'none';
        if (rowPrePercent) rowPrePercent.style.display = isNone ? 'none' : 'flex';
        if (preHr) preHr.style.display = isNone ? 'none' : 'block';
        if (preBreakdown) preBreakdown.style.display = isNone ? 'none' : 'block';
      }
      if (selectPreferment.value !== 'none') {
        loadSelectedPreferment(); // fetches JSON, then calls render() itself
      } else {
        render();
      }
    });
  }

  // applyRecipeDefaults is called regardless of whether a preferment select exists
  applyRecipeDefaults();

  ['input-total', 'input-flour', 'input-portions', 'input-portion-weight',
   'input-pre-percent', 'pct-hydration', 'pct-salt', 'pct-yeast', 'pct-oil',
   'pct-milk', 'pct-sugar', 'pct-egg', 'pct-butter', 'pct-candy'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', render);
  });
//slider
function updateSlider(range) {
    var min = parseFloat(range.min);
    var max = parseFloat(range.max);
    var value = parseFloat(range.value);
    var percent = 0;

    if (isFinite(min) && isFinite(max) && max !== min && isFinite(value)) {
      percent = ((value - min) / (max - min)) * 100;
      if (!isFinite(percent)) percent = 0;
      percent = Math.min(Math.max(percent, 0), 100);
    }

    range.style.setProperty('--percent', percent + '%');
}
function syncPair(numId, rangeId) {
    var n = document.getElementById(numId);
    var r = document.getElementById(rangeId);
    if (!n || !r) return;

    updateSlider(r);

    r.addEventListener('input', function () {
    n.value = r.value;
    updateSlider(r);
    render();
    });

    n.addEventListener('input', function () {
    r.value = n.value;
    updateSlider(r);
    render();
});
}

/* old version of syncPair function

 function syncPair(numId, rangeId) {
    var n = document.getElementById(numId);
    var r = document.getElementById(rangeId);
    if (!n || !r) return;
    n.addEventListener('input', function () { r.value = n.value; render(); });
    r.addEventListener('input', function () { n.value = r.value; render(); });
  } */

  syncPair('pct-hydration', 'rng-hydration');
  syncPair('pct-salt', 'rng-salt');
  syncPair('pct-yeast', 'rng-yeast');
  syncPair('pct-oil', 'rng-oil');
  syncPair('pct-milk', 'rng-milk');
  syncPair('pct-sugar', 'rng-sugar');
  syncPair('pct-egg', 'rng-egg');
  syncPair('pct-butter', 'rng-butter');
  syncPair('pct-candy', 'rng-candy');

  function render() {
    var H = dcNum('pct-hydration'), S = dcNum('pct-salt'), Y = dcNum('pct-yeast'), O = dcNum('pct-oil');
    var MK = dcNum('pct-milk');
    var SU = dcNum('pct-sugar'), EG = dcNum('pct-egg'), BU = dcNum('pct-butter'), CA = dcNum('pct-candy');
    var factor = 1 + H / 100 + S / 100 + Y / 100 + O / 100 + MK / 100 + SU / 100 + EG / 100 + BU / 100 + CA / 100;

    var flour;
    if (entryMode === 'flour') {
      flour = dcNum('input-flour');
    } else if (entryMode === 'portions') {
      var totalDough = dcNum('input-portions') * dcNum('input-portion-weight');
      flour = totalDough / factor;
    } else {
      flour = dcNum('input-total') / factor;
    }

    var water = flour * H / 100;
    var salt = flour * S / 100;
    var yeast = flour * Y / 100;
    var oil = flour * O / 100;
    var milk = flour * MK / 100;
    var sugar = flour * SU / 100;
    var egg = flour * EG / 100;
    var butter = flour * BU / 100;
    var candy = flour * CA / 100;

    var preFlour = 0, preWater = 0, preThird = 0;

    if (currentPreData) {
      var pre = DoughCalc._ratioOf(currentPreData);
      var pPercent = dcNum('input-pre-percent');
      preFlour = flour * pPercent / 100;
      if (pre.flour > 0) {
        var scale = preFlour / pre.flour;
        preWater = pre.water * scale;
        if (currentPreData.yeast_formula) {
          var preHours = preTimeInput ? (parseFloat(preTimeInput.value) || currentPreData.yeast_formula.default_hours) : currentPreData.yeast_formula.default_hours;
          if (preTimeDisplay) preTimeDisplay.textContent = preHours;
          preThird = preWater * currentPreData.yeast_formula.constant / preHours;
        } else {
          preThird = pre.third * scale;
        }
      } else {
        preWater = 0;
        preThird = 0;
      }

      dcSetHTML('pre-flour', Math.round(preFlour) + ' <span class="unit">г</span>');
      dcSetHTML('pre-water', Math.round(preWater) + ' <span class="unit">мл</span>');
      dcSetHTML('pre-third', (Math.round(preThird * 10) / 10) + ' <span class="unit">г</span>');
    }

    var mainFlour = Math.max(flour - preFlour, 0);
    var mainWater = Math.max(water - preWater, 0);

    dcSetHTML('main-flour', Math.round(mainFlour) + ' <span class="unit">г</span>');
    dcSetHTML('main-water', Math.round(mainWater) + ' <span class="unit">мл</span>');
    dcSetHTML('main-salt', (Math.round(salt * 10) / 10) + ' <span class="unit">г</span>');
    dcSetHTML('main-yeast', (Math.round(yeast * 10) / 10) + ' <span class="unit">г</span>');
    dcSetHTML('main-oil', (Math.round(oil * 10) / 10) + ' <span class="unit">г</span>');
    dcSetHTML('main-milk', (Math.round(milk * 10) / 10) + ' <span class="unit">г</span>');
    dcSetHTML('main-sugar', (Math.round(sugar * 10) / 10) + ' <span class="unit">г</span>');
    dcSetHTML('main-egg', (Math.round(egg * 10) / 10) + ' <span class="unit">г</span>');
    dcSetHTML('main-butter', (Math.round(butter * 10) / 10) + ' <span class="unit">г</span>');
    dcSetHTML('main-candy', (Math.round(candy * 10) / 10) + ' <span class="unit">г</span>');

    var totalEl = document.getElementById('out-total-dough');
    if (totalEl) totalEl.textContent = Math.round(flour + water + salt + yeast + oil + milk + sugar + egg + butter + candy) + ' г';

    if (typeof onFlourChange === 'function') onFlourChange(mainFlour);
    if (flourTypesWidget && typeof flourTypesWidget.setMainFlour === 'function') {
      flourTypesWidget.setMainFlour(mainFlour);
    }
  }
  // Initial render to populate fields on page load
  render();
};

/* ----------------------------------------------------------
   Calculator page (data/pages/calculator/calculator.html) —
   a "category" dropdown filters which Baker's-Percentage fields
   and which preferments are relevant, instead of showing all 9
   fields + all 7 preferments at once for every dough type.

   CALC_CATEGORIES maps each dropdown option to:
   - default:  fields shown immediately for that category
   - optional: fields NOT shown by default, but addable one at a
     time via the "Додати інгредієнт" picker (same idea as the
     flour-types "+" button) — click adds it, a small "×" on the
     field removes it again
   - labels:   per-category text override for a field's label
     (e.g. "Молоко"→"Сухе молоко" for Декоративне), reusing the
     established generic-field-relabel convention from recipe
     pages, just applied at the category level here
   - preferments: compatible preferment ids for the select

   Base field set (used when a category doesn't list default+
   optional explicitly): all 9 fields, all shown, no picker —
   this keeps categories the user hasn't asked to narrow yet
   (italian-pizza/ciabatta/focaccia, sweet, laminated, enriched)
   behaving exactly as before.
   ---------------------------------------------------------- */
var CALC_ALL_FIELDS = ['hydration', 'salt', 'yeast', 'oil', 'milk', 'sugar', 'egg', 'butter', 'candy'];

var CALC_CATEGORIES = [
  { id: 'bread',
    default: ['hydration', 'salt', 'yeast'],
    optional: ['oil', 'milk', 'egg', 'sugar', 'butter', 'candy'],
    preferments: ['sourdough', 'levain-stiff', 'levain-liquid', 'biga', 'poolish', 'pf', 'opara'] },
  { id: 'italian-pizza', default: ['hydration', 'salt', 'yeast', 'oil'], optional: [],
    preferments: ['biga', 'levain-stiff', 'levain-liquid', 'pf', 'poolish', 'sourdough'] },
  { id: 'italian-ciabatta', default: ['hydration', 'salt', 'yeast', 'oil', 'candy'], optional: [],
    preferments: ['biga', 'levain-liquid', 'poolish'] },
  { id: 'italian-focaccia', default: ['hydration', 'salt', 'yeast', 'oil', 'milk', 'sugar', 'egg', 'candy'], optional: [],
    preferments: ['levain-liquid', 'pf', 'poolish'] },
  { id: 'italian-pasta',
    default: ['hydration', 'salt', 'egg', 'milk'], optional: [],
    preferments: [] },
  { id: 'italian-batters',
    default: ['salt', 'egg', 'milk'],
    optional: ['sugar', 'butter', 'oil'],
    preferments: [] },
  { id: 'baguette',
    default: ['hydration', 'salt', 'yeast', 'butter'],
    optional: ['oil', 'milk', 'candy'],
    preferments: ['levain-stiff', 'levain-liquid', 'pf', 'poolish', 'sourdough'] },
  { id: 'sweet', default: ['hydration', 'salt', 'yeast', 'oil', 'milk', 'sugar', 'egg', 'butter', 'candy'], optional: [],
    preferments: ['biga', 'lievito-madre', 'milk-levain', 'pf', 'poolish', 'sponge-liquid', 'sponge-short'] },
  { id: 'laminated', default: ['hydration', 'salt', 'yeast', 'oil', 'milk', 'sugar', 'egg', 'butter', 'candy'], optional: [],
    preferments: ['biga', 'pf', 'poolish'] },
  { id: 'flatbread',
    default: ['hydration', 'salt', 'yeast'],
    optional: ['oil', 'milk', 'sugar', 'butter'],
    preferments: [] },
  { id: 'enriched', default: ['hydration', 'salt', 'yeast', 'oil', 'milk', 'sugar', 'egg', 'butter', 'candy'], optional: [],
    preferments: ['pf'] },
  { id: 'technical',
    default: ['hydration', 'salt', 'yeast', 'sugar', 'milk', 'butter'],
    optional: ['candy'],
    labelsFn: technicalCategoryLabels,
    preferments: [] }
];

var CALC_FIELD_LABELS_UA = {
  hydration: 'Гідратація', salt: 'Сіль', yeast: 'Дріжджі (в основний заміс)',
  oil: 'Олія', milk: 'Молоко', sugar: 'Цукор', egg: 'Яйця',
  butter: 'Масло вершкове', candy: 'Добавки'
};
/* Dict keys corresponding to each generic field — resolved at call
   time (not module-load time, when the dict may not be loaded yet). */
var CALC_FIELD_LABEL_KEYS = {
  hydration: 'HYDRATION', salt: 'SALT', yeast: 'YEAST_MAIN',
  oil: 'OIL', milk: 'MILK', sugar: 'SUGAR', egg: 'EGGS',
  butter: 'BUTTER', candy: 'ADDITIONS'
};
function calcFieldLabel(field) {
  var dict = DoughCalc.getLangDictSync();
  var key = CALC_FIELD_LABEL_KEYS[field];
  return (key && dict[key]) || CALC_FIELD_LABELS_UA[field] || field;
}
/* technical category's milk/candy relabel (Сухе молоко / Цукровий
   сироп) — a function for the same load-order reason as above. */
function technicalCategoryLabels() {
  var dict = DoughCalc.getLangDictSync();
  return {
    milk: dict.DRY_MILK || 'Сухе молоко',
    candy: dict.SUGAR_SYRUP || 'Цукровий сироп'
  };
}

DoughCalc.initCalculatorPage = function () {
  // Reuses the normal recipe-page wiring (entry modes, preferment
  // fetch/breakdown, render math, flour-types widget) with no
  // recipe data — a null recipeData means applyRecipeDefaults()
  // is a no-op and the field values stay at whatever's in the HTML.
  DoughCalc.initRecipePage(null, {});

  var catSelect = document.getElementById('calc-category');
  var selectPreferment = document.getElementById('select-preferment');
  var addSelect = document.getElementById('add-ingredient-select');
  var addBtn = document.getElementById('add-ingredient-btn');
  var rowAddIngredient = document.getElementById('row-add-ingredient');
  if (!catSelect) return;

  var dict = DoughCalc.getLangDictSync();

  function fieldGroup(field) {
    return document.querySelector('.pct-field-group[data-field="' + field + '"]');
  }
  function outRow(field) {
    return document.querySelector('[data-field-out="' + field + '"]');
  }

  function setFieldLabel(field, text) {
    var group = fieldGroup(field);
    if (group) {
      var span = group.querySelector('.field-label span');
      if (span) span.textContent = text;
    }
    var row = outRow(field);
    if (row) {
      var label = row.querySelector('.row-list-label');
      if (label) label.lastChild.textContent = text;
    }
  }

  function zeroField(field) {
    var group = fieldGroup(field);
    if (!group) return;
    var pctInput = group.querySelector('input[type="number"]');
    if (pctInput && parseFloat(pctInput.value) !== 0) {
      pctInput.value = 0;
      pctInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function showField(field, show) {
    var group = fieldGroup(field);
    if (group) group.style.display = show ? '' : 'none';
    var row = outRow(field);
    if (row) row.style.display = show ? '' : 'none';
    var removeBtn = group && group.querySelector('.field-remove-btn');
    if (removeBtn) removeBtn.style.display = 'none';
    if (!show) zeroField(field);
  }

  function rebuildPreferments(ids) {
    if (!selectPreferment) return;
    selectPreferment.innerHTML = '<option value="none">' + (dict.NO_PREFERMENT || 'Без преферменту') + '</option>';
    selectPreferment.disabled = !ids.length;
    if (!ids.length) {
      selectPreferment.value = 'none';
      selectPreferment.dispatchEvent(new Event('change'));
      return;
    }
    var opts = new Array(ids.length);
    var remaining = ids.length;
    ids.forEach(function (id, i) {
      DoughCalc.fetchPreferment(id, function (data) {
        opts[i] = { id: id, name: (data && data.name && data.name.uk) || id };
        if (--remaining === 0) {
          opts.forEach(function (o) {
            var el = document.createElement('option');
            el.value = o.id;
            el.textContent = o.name;
            selectPreferment.appendChild(el);
          });
          selectPreferment.value = 'none';
          selectPreferment.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  var currentCat = null;
  var addedOptional = []; // optional fields the user has manually added for the current category

  function refreshAddSelect() {
    if (!addSelect || !currentCat) return;
    var remaining = currentCat.optional.filter(function (f) { return addedOptional.indexOf(f) === -1; });
    addSelect.innerHTML = remaining.map(function (f) {
      var catLabels = currentCat.labelsFn ? currentCat.labelsFn() : currentCat.labels;
      return '<option value="' + f + '">' + ((catLabels && catLabels[f]) || calcFieldLabel(f)) + '</option>';
    }).join('');
    rowAddIngredient.style.display = remaining.length ? 'flex' : 'none';
  }

  function addOptionalField(field) {
    if (!currentCat || currentCat.optional.indexOf(field) === -1) return;
    if (addedOptional.indexOf(field) > -1) return;
    addedOptional.push(field);
    showField(field, true);
    var group = fieldGroup(field);
    var removeBtn = group && group.querySelector('.field-remove-btn');
    if (removeBtn) {
      removeBtn.style.display = '';
      removeBtn.onclick = function () {
        addedOptional = addedOptional.filter(function (f) { return f !== field; });
        showField(field, false);
        refreshAddSelect();
      };
    }
    refreshAddSelect();
  }

  if (addBtn) {
    addBtn.addEventListener('click', function () {
      if (addSelect && addSelect.value) addOptionalField(addSelect.value);
    });
  }

  function applyCategory(catId) {
    var cat = null;
    for (var i = 0; i < CALC_CATEGORIES.length; i++) {
      if (CALC_CATEGORIES[i].id === catId) { cat = CALC_CATEGORIES[i]; break; }
    }
    if (!cat) cat = CALC_CATEGORIES[0];
    currentCat = cat;
    addedOptional = [];

    CALC_ALL_FIELDS.forEach(function (field) {
      var catLabels = cat.labelsFn ? cat.labelsFn() : cat.labels;
      setFieldLabel(field, (catLabels && catLabels[field]) || calcFieldLabel(field));
      var used = cat.default.indexOf(field) > -1 || cat.optional.indexOf(field) > -1;
      if (!used) { showField(field, false); return; }
      showField(field, cat.default.indexOf(field) > -1);
    });

    refreshAddSelect();
    rebuildPreferments(cat.preferments);
  }

  catSelect.addEventListener('change', function () {
    applyCategory(catSelect.value);
  });

  applyCategory(catSelect.value);
};

/* ----------------------------------------------------------
   Optional flour-type mix widget (e.g. 00 + Semola for pizza)
   Required markup ids: #flour-types-list, #flour-sum,
   #add-flour-type

   Returns { setMainFlour(weight) } — call this from
   options.onFlourChange in initRecipePage() to feed it the
   current main-mix flour weight.
   ---------------------------------------------------------- */
DoughCalc.initFlourTypes = function (initialTypes) {
  var dict = DoughCalc.getLangDictSync();
  var flourTypes = initialTypes || [{ name: dict.FLOUR || 'Борошно', pct: 100 }];
  var flourTypesList = document.getElementById('flour-types-list');
  var flourSumEl = document.getElementById('flour-sum');
  var addFlourTypeBtn = document.getElementById('add-flour-type');
  var currentMainFlour = 0;

  /* flourTypes[0] is the "base" flour and is never edited directly —
     its % is always whatever's left after the other (added) types,
     so the total is guaranteed to be exactly 100% instead of
     requiring the user to manually rebalance every type by hand. */
  function recomputeBase() {
    var sumOthers = 0;
    for (var i = 1; i < flourTypes.length; i++) sumOthers += (flourTypes[i].pct || 0);
    flourTypes[0].pct = Math.round(Math.max(0, 100 - sumOthers) * 10) / 10;
    return sumOthers;
  }

  function renderList() {
    flourTypesList.innerHTML = '';
    flourTypes.forEach(function (ft, idx) {
      var row = document.createElement('div');
      row.className = 'flour-type-row';

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'flour-type-name';
      nameInput.placeholder = dict.FLOUR_TYPE_NAME_PLACEHOLDER || 'Назва типу';
      nameInput.value = ft.name;
      nameInput.addEventListener('input', function () {
        flourTypes[idx].name = nameInput.value;
      });

      var pctBox = document.createElement('div');
      pctBox.className = 'flour-type-pct-box';
      var pctInput = document.createElement('input');
      pctInput.type = 'number';
      pctInput.min = '0';
      pctInput.max = '100';
      pctInput.step = '1';
      pctInput.value = ft.pct;
      if (idx === 0) {
        pctInput.readOnly = true;
        pctInput.tabIndex = -1;
        pctInput.title = dict.FLOUR_TYPE_AUTO_TOOLTIP || 'Автоматично: залишок від інших типів борошна';
        pctBox.classList.add('flour-type-pct-box-locked');
      } else {
        pctInput.addEventListener('input', function () {
          flourTypes[idx].pct = parseFloat(pctInput.value) || 0;
          recomputeBase();
          var baseInput = flourTypesList.querySelector('.flour-type-row:first-child .flour-type-pct-box input');
          if (baseInput) baseInput.value = flourTypes[0].pct;
          updateSum();
          updateWeights();
        });
      }
      var pctUnit = document.createElement('span');
      pctUnit.className = 'value-unit';
      pctUnit.textContent = '%';
      pctBox.appendChild(pctInput);
      pctBox.appendChild(pctUnit);

      var weightSpan = document.createElement('span');
      weightSpan.className = 'flour-type-weight';
      weightSpan.textContent = '0 г';

      var removeBtn = document.createElement('button');
      removeBtn.className = 'flour-type-remove';
      removeBtn.setAttribute('aria-label', dict.REMOVE || 'Видалити');
      removeBtn.innerHTML = '<span class="iconify" data-icon="tabler:x"></span>';
      removeBtn.addEventListener('click', function () {
        if (idx === 0) return; // base flour can't be removed
        flourTypes.splice(idx, 1);
        recomputeBase();
        renderList();
        updateSum();
        updateWeights();
      });
      if (idx === 0) removeBtn.style.visibility = 'hidden';

      row.appendChild(nameInput);
      row.appendChild(pctBox);
      row.appendChild(weightSpan);
      row.appendChild(removeBtn);
      flourTypesList.appendChild(row);
    });
  }

  function updateSum() {
    var sum = flourTypes.reduce(function (a, ft) { return a + ft.pct; }, 0);
    flourSumEl.textContent = (Math.round(sum * 10) / 10) + '%';
    flourSumEl.classList.toggle('flour-sum-warning', Math.abs(sum - 100) > 0.5);
  }

  function updateWeights() {
    var weightEls = flourTypesList.querySelectorAll('.flour-type-weight');
    flourTypes.forEach(function (ft, idx) {
      var w = currentMainFlour * (ft.pct / 100);
      weightEls[idx].textContent = Math.round(w) + ' г';
    });
  }

  if (addFlourTypeBtn) addFlourTypeBtn.addEventListener('click', function () {
    flourTypes.push({ name: '', pct: 0 });
    recomputeBase();
    renderList();
    updateSum();
    updateWeights();
    var nameInputs = flourTypesList.querySelectorAll('.flour-type-name');
    var lastInput = nameInputs[nameInputs.length - 1];
    if (lastInput) lastInput.focus();
  });

  recomputeBase();
  renderList();
  updateSum();

  return {
    setMainFlour: function (weight) {
      currentMainFlour = weight;
      updateWeights();
    }
  };
};
