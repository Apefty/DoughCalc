/* ==========================================================
   Dough Calculator — shared calculation logic
   Used by preferment pages (data/pages/preferments/*.html) and
   recipe pages (data/pages/bread/*.html, data/pages/pizza/*.html).
   ========================================================== */

window.DoughCalc = window.DoughCalc || {};

/* Fixed preferment ratios (flour : water : third), where
   "third" is either yeast (mode: "yeast") or mature starter
   (mode: "starter"). Kept in one place instead of copy-pasted
   into every recipe page. */
DoughCalc.PREFERMENTS = {
  none:          { mode: null },
  sourdough:     { mode: 'starter', flour: 100, water: 100, third: 100 },
  levain:        { mode: 'starter', flour: 100, water: 100, third: 20 },
  biga:          { mode: 'yeast',   flour: 100, water: 50,  third: 2 },
  poolish:       { mode: 'yeast',   flour: 100, water: 100, third: 0.5 },
  pf:            { mode: 'yeast',   flour: 100, water: 60,  third: 1 },
  opara:         { mode: 'yeast',   flour: 100, water: 100, third: 0.5 },
  'lievito-madre': { mode: 'starter', flour: 100, water: 50, third: 100 },
  sponge:        { mode: 'yeast',   flour: 100, water: 60,  third: 2 }
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
   Preferment page calculator
   (biga.html, poolish.html, pf.html, levain.html, opara.html,
    lievito-madre.html, sponge.html, sourdough.html)

   Required markup ids: #mode-toggle .segmented-item[data-mode],
   #input-weight, #input-label, #out-flour, #out-water,
   #out-third, #out-total
   ---------------------------------------------------------- */
DoughCalc.initPrefermentPage = function (ratio) {
  var input = document.getElementById('input-weight');
  var label = document.getElementById('input-label');
  var buttons = document.querySelectorAll('#mode-toggle .segmented-item');
  var mode = 'flour';

  function render() {
    var v = parseFloat(input.value) || 0;
    var flour;
    if (mode === 'flour') {
      flour = v;
    } else {
      var unitTotal = ratio.flour + ratio.water + ratio.third;
      flour = v * (ratio.flour / unitTotal);
    }
    var water = flour * (ratio.water / ratio.flour);
    var third = flour * (ratio.third / ratio.flour);

    dcSetHTML('out-flour', Math.round(flour) + ' <span class="unit">г</span>');
    dcSetHTML('out-water', Math.round(water) + ' <span class="unit">г</span>');
    dcSetHTML('out-third', (Math.round(third * 10) / 10) + ' <span class="unit">г</span>');
    var totalEl = document.getElementById('out-total');
    if (totalEl) totalEl.textContent = Math.round(flour + water + third) + ' г';
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      mode = btn.getAttribute('data-mode');
      label.textContent = mode === 'flour' ? 'Вага муки' : 'Вага преферменту';
      render();
    });
  });

  input.addEventListener('input', render);
  render();
};

/* ----------------------------------------------------------
   Recipe page calculator
   (data/pages/bread/*.html, data/pages/pizza/*.html)

   options.onFlourChange(mainFlour) — optional callback fired
   every render with the main-mix flour weight (total flour
   minus whatever went into the preferment). Used by
   DoughCalc.initFlourTypes() to split that flour into 00/semola/etc.
   ---------------------------------------------------------- */
DoughCalc.initRecipePage = function (options) {
  options = options || {};
  var onFlourChange = options.onFlourChange;

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

  selectPreferment.addEventListener('change', function () {
    var isNone = selectPreferment.value === 'none';
    rowPrePercent.style.display = isNone ? 'none' : 'flex';
    preHr.style.display = isNone ? 'none' : 'block';
    preBreakdown.style.display = isNone ? 'none' : 'block';
    var pre = DoughCalc.PREFERMENTS[selectPreferment.value];
    var thirdLabel = pre && pre.mode === 'starter' ? 'Закваска' : 'Дріжджі';
    var labelEl = document.querySelector('#pre-breakdown .row-list-item:nth-child(3) .row-list-label');
    if (labelEl) labelEl.lastChild.textContent = thirdLabel;
    render();
  });

  ['input-total', 'input-flour', 'input-portions', 'input-portion-weight',
   'input-pre-percent', 'pct-hydration', 'pct-salt', 'pct-yeast', 'pct-oil',
   'pct-milk', 'pct-sugar', 'pct-egg', 'pct-butter', 'pct-candy'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', render);
  });
//slider
function updateSlider(range) {
    const p = ((range.value - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty('--percent', p + '%');
}
function syncPair(numId, rangeId) {
    var n = document.getElementById(numId);
    var r = document.getElementById(rangeId);
    if (!n || !r) return;

    updateSlider(r);   // <-- додати

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

    var preKey = selectPreferment.value;
    var pre = DoughCalc.PREFERMENTS[preKey];
    var preFlour = 0, preWater = 0, preThird = 0;

    if (pre && pre.mode) {
      var pPercent = dcNum('input-pre-percent');
      preFlour = flour * pPercent / 100;
      var scale = preFlour / pre.flour;
      preWater = pre.water * scale;
      preThird = pre.third * scale;

      dcSetHTML('pre-flour', Math.round(preFlour) + ' <span class="unit">г</span>');
      dcSetHTML('pre-water', Math.round(preWater) + ' <span class="unit">г</span>');
      dcSetHTML('pre-third', (Math.round(preThird * 10) / 10) + ' <span class="unit">г</span>');
    }

    var mainFlour = flour - preFlour;
    var mainWater = water - preWater;

    dcSetHTML('main-flour', Math.round(mainFlour) + ' <span class="unit">г</span>');
    dcSetHTML('main-water', Math.round(mainWater) + ' <span class="unit">г</span>');
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
  }

  render();
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
  var flourTypes = initialTypes || [{ name: 'Борошно 00', pct: 100 }];
  var flourTypesList = document.getElementById('flour-types-list');
  var flourSumEl = document.getElementById('flour-sum');
  var addFlourTypeBtn = document.getElementById('add-flour-type');
  var currentMainFlour = 0;

  function renderList() {
    flourTypesList.innerHTML = '';
    flourTypes.forEach(function (ft, idx) {
      var row = document.createElement('div');
      row.className = 'flour-type-row';

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'flour-type-name';
      nameInput.placeholder = 'Назва типу';
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
      pctInput.addEventListener('input', function () {
        flourTypes[idx].pct = parseFloat(pctInput.value) || 0;
        updateSum();
        updateWeights();
      });
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
      removeBtn.setAttribute('aria-label', 'Видалити');
      removeBtn.innerHTML = '<span class="iconify" data-icon="tabler:x"></span>';
      removeBtn.addEventListener('click', function () {
        if (flourTypes.length <= 1) return;
        flourTypes.splice(idx, 1);
        renderList();
        updateSum();
        updateWeights();
      });
      if (flourTypes.length <= 1) removeBtn.style.visibility = 'hidden';

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
    var sum = flourTypes.reduce(function (a, ft) { return a + ft.pct; }, 0) || 1;
    var weightEls = flourTypesList.querySelectorAll('.flour-type-weight');
    flourTypes.forEach(function (ft, idx) {
      var w = currentMainFlour * (ft.pct / sum);
      weightEls[idx].textContent = Math.round(w) + ' г';
    });
  }

  addFlourTypeBtn.addEventListener('click', function () {
    flourTypes.push({ name: '', pct: 0 });
    renderList();
    updateSum();
    updateWeights();
    var nameInputs = flourTypesList.querySelectorAll('.flour-type-name');
    var lastInput = nameInputs[nameInputs.length - 1];
    if (lastInput) lastInput.focus();
  });

  renderList();
  updateSum();

  return {
    setMainFlour: function (weight) {
      currentMainFlour = weight;
      updateWeights();
    }
  };
};
