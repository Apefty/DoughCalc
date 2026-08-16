const path = require('path');
const fs = require('fs');

// Load locale files from ../data/lang
const LANG_DIR = path.join(__dirname, '..', 'data', 'lang');

function loadLocale(code) {
  const file = path.join(LANG_DIR, `${code}.js`);
  if (fs.existsSync(file)) {
    // require cache will be used; this is fine for dev. For production consider a loader that doesn't cache.
    // Use delete require.cache[...] if you want to reload on each request during development
    return require(file);
  }
  return {};
}

// Basic interpolation: replace {key} with params[key]
function interpolate(str, params) {
  if (!params) return str;
  return Object.keys(params).reduce((s, k) => s.split(`{${k}}`).join(params[k]), str);
}

// Plural selection using Intl.PluralRules and a simple "||"-separated value format
// Example translation values:
// en: "{n} item||{n} items"  (two forms)
// ua: "{n} предмет||{n} предмети||{n} предметів" (three forms)
function choosePluralForm(value, locale, n) {
  if (typeof value !== 'string') return value;
  if (!value.includes('||')) return value; // no plural forms

  const parts = value.split('||');
  try {
    const pr = new Intl.PluralRules(locale || 'en');
    const category = pr.select(Number(n)); // 'one','few','many','other', etc.
    // Map categories to indices. We'll try to support typical languages simply.
    // Preferred mapping:
    // - one -> index 0
    // - few -> index 1
    // - many -> index 2
    // - other -> last index
    let idx;
    if (category === 'one') idx = 0;
    else if (category === 'few') idx = 1;
    else if (category === 'many') idx = 2;
    else idx = parts.length - 1;

    // clamp
    if (idx >= parts.length) idx = parts.length - 1;
    return parts[idx];
  } catch (e) {
    // fallback: english style
    const idx = Number(n) === 1 ? 0 : Math.min(1, parts.length - 1);
    return parts[idx];
  }
}

// Create middleware to expose res.locals.lang and res.locals.t
function middleware(defaultLocale = 'en') {
  // preload English as fallback
  const en = loadLocale('en');

  return function (req, res, next) {
    // determine locale: query param ?lang=ua or cookie 'lang' or default
    const requested = (req.query.lang || (req.cookies && req.cookies.lang) || defaultLocale).toString();
    const localeDict = loadLocale(requested) || {};

    // shallow merge: fallback to English for missing keys
    const merged = Object.assign({}, en, localeDict);
    res.locals.lang = merged;

    // t helper for templates and runtime usage
    res.locals.t = function (key, params) {
      // allow calling t('KEY', {n: 2}) or t('KEY')
      const raw = merged[key];
      if (raw === undefined) return key;

      // if params contains n and raw has plural forms, choose accordingly
      let chosen = raw;
      if (params && params.n !== undefined) {
        chosen = choosePluralForm(raw, requested, params.n);
      }

      return interpolate(chosen, params);
    };

    next();
  };
}

// Helper to be registered with Handlebars instance. It accepts (key, options) where options.hash are params
function registerHandlebarsHelpers(hbs, defaultLocale = 'en') {
  // t helper: {{t "KEY" n=items}}
  hbs.handlebars.registerHelper('t', function (key, options) {
    const params = options && options.hash ? options.hash : {};
    // options.data.root should contain lang if used via express-handlebars
    const root = options && options.data && options.data.root ? options.data.root : {};
    const localeDict = root.lang || {};
    const en = loadLocale('en');
    const merged = Object.assign({}, en, localeDict);
    const raw = merged[key];
    if (raw === undefined) return key;
    let chosen = raw;
    if (params && params.n !== undefined) chosen = choosePluralForm(raw, root.__locale || defaultLocale, params.n);
    // Return plain string so Handlebars escapes it by default. If you need raw HTML in
    // translations, pass raw=true as a hash param and explicitly mark it trusted.
    if (params && params.raw) {
      return new hbs.handlebars.SafeString(interpolate(chosen, params));
    }
    return interpolate(chosen, params);
  });
}

module.exports = {
  middleware,
  registerHandlebarsHelpers,
  loadLocale,
  interpolate,
  choosePluralForm
};
