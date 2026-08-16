const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'data', 'pages');
const LANG_DIR = path.join(ROOT, 'data', 'lang');
const DEFAULT_LOCALE = 'uk'; // matches <option value="uk"> already in the UI (ISO 639-1 for Ukrainian)

function loadLocale(code) {
  const file = path.join(LANG_DIR, `${code}.js`);
  if (fs.existsSync(file)) return require(file);
  return {};
}

function writeJSON(code, obj) {
  const out = path.join(LANG_DIR, `${code}.json`);
  fs.writeFileSync(out, JSON.stringify(obj, null, 2), 'utf8');
  console.log('Wrote', out);
}

function choosePluralForm(value, locale, n) {
  if (typeof value !== 'string' || !value.includes('||')) return value;
  const parts = value.split('||');
  try {
    const pr = new Intl.PluralRules(locale || DEFAULT_LOCALE);
    const category = pr.select(Number(n));
    let idx;
    if (category === 'one') idx = 0;
    else if (category === 'few') idx = 1;
    else if (category === 'many') idx = 2;
    else idx = parts.length - 1;
    if (idx >= parts.length) idx = parts.length - 1;
    return parts[idx];
  } catch (e) {
    const idx = Number(n) === 1 ? 0 : Math.min(1, parts.length - 1);
    return parts[idx];
  }
}

Handlebars.registerHelper('t', function (key, options) {
  const params = (options && options.hash) ? options.hash : {};
  const root = (options && options.data && options.data.root) ? options.data.root : {};
  const lang = root.lang || {};
  const raw = lang[key];
  if (raw === undefined) return key;
  let chosen = raw;
  if (params && params.n !== undefined) chosen = choosePluralForm(raw, root.__locale || DEFAULT_LOCALE, params.n);
  if (params) {
    Object.keys(params).forEach(k => {
      chosen = chosen.split(`{${k}}`).join(params[k]);
    });
  }
  return new Handlebars.SafeString(chosen);
});

function walkDir(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, cb);
    else cb(full);
  });
}

// Only pages actually authored with {{lang.KEY}} placeholders need
// per-locale output. Untouched pages keep their raw literal Ukrainian
// text and are fetched as-is by cat.js (no build step needed for them).
function hasLangPlaceholders(src) {
  return /\{\{\s*lang\.[A-Z0-9_]+\s*\}\}/.test(src);
}

function prerender() {
  const locales = fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.js')).map(f => path.basename(f, '.js'));

  // Refresh the .json mirrors (kept for any tooling/inspection that wants
  // plain JSON dictionaries; not required by the runtime SPA anymore).
  locales.forEach(code => writeJSON(code, loadLocale(code)));

  const pages = [];
  walkDir(PAGES_DIR, file => { if (file.endsWith('.html')) pages.push(file); });

  let converted = 0;
  pages.forEach(file => {
    const tplSrc = fs.readFileSync(file, 'utf8');
    if (!hasLangPlaceholders(tplSrc)) return; // leave untouched pages alone
    converted++;
    const tpl = Handlebars.compile(tplSrc);
    const dir = path.dirname(file);
    const base = path.basename(file, '.html');

    locales.forEach(code => {
      const en = loadLocale(DEFAULT_LOCALE);
      const loc = loadLocale(code);
      const merged = Object.assign({}, en, loc);
      const ctx = { lang: merged, __locale: code };
      const html = tpl(ctx);

      if (code === DEFAULT_LOCALE) {
        // The default locale overwrites the original bare filename —
        // cat.js fetches that directly for the default locale, never a
        // suffixed variant, so writing biga.uk.html too would just be
        // a dead duplicate.
        fs.writeFileSync(file, html, 'utf8');
        console.log('Wrote (default)', path.relative(ROOT, file));
      } else {
        // Locale-suffixed variant, e.g. biga.en.html — fetched by cat.js
        // when the active language differs from the default.
        const outPath = path.join(dir, `${base}.${code}.html`);
        fs.writeFileSync(outPath, html, 'utf8');
        console.log('Wrote', path.relative(ROOT, outPath));
      }
    });
  });

  console.log(`Prerender complete. ${converted} page(s) had {{lang.*}} placeholders and were compiled for ${locales.length} locale(s).`);
}

prerender();
