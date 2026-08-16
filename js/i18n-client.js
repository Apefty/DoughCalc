(function () {
  // client-side i18n: replace {{lang.KEY}} and data-i18n attributes
  function getQueryParam(name) {
    const m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
  }
  function getPrefLangFromLocalStorage() {
    try {
      const p = localStorage.getItem('doughcalc-prefs');
      if (!p) return null;
      const obj = JSON.parse(p);
      return obj && obj.lang ? obj.lang : null;
    } catch (e) { return null; }
  }

  function determineLocale() {
    return getQueryParam('lang') || getCookie('lang') || getPrefLangFromLocalStorage() || 'en';
  }

  function applyTranslations(dict) {
    // data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var txt = dict[key] !== undefined ? dict[key] : key;
      el.textContent = txt;
    });
    // data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      var txt = dict[key] !== undefined ? dict[key] : key;
      el.setAttribute('placeholder', txt);
    });

    // replace inline Handlebars-like placeholders: {{lang.KEY}}
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    var re = /\{\{\s*lang\.([A-Z0-9_]+)\s*\}\}/g;
    var toReplace = [];
    while (node = walker.nextNode()) {
      if (re.test(node.nodeValue)) {
        toReplace.push(node);
      }
      re.lastIndex = 0;
    }
    toReplace.forEach(function (textNode) {
      var v = textNode.nodeValue;
      var newV = v.replace(/\{\{\s*lang\.([A-Z0-9_]+)\s*\}\}/g, function (_, key) {
        return dict[key] !== undefined ? dict[key] : '{{lang.' + key + '}}';
      });
      if (newV !== v) textNode.nodeValue = newV;
    });
  }

  function loadLocaleJson(locale) {
    var url = '/data/lang/' + locale + '.json';
    return fetch(url, { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) throw new Error('Locale not found');
      return res.json();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var locale = determineLocale();
    loadLocaleJson(locale).then(function (dict) {
      applyTranslations(dict);
    }).catch(function () {
      // fallback to en
      loadLocaleJson('en').then(function (dict) { applyTranslations(dict); }).catch(function () {});
    });
  });
})();
