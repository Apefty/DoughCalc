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

// Source templates live as <name>.hbs.html — this file is the one you
// hand-edit with {{lang.KEY}} placeholders and it is NEVER written to
// by this script. Build output goes to sibling compiled files:
//   <name>.html       — default-locale (uk) compiled render, fetched
//                        directly by cat.js for the default language
//   <name>.<code>.html — compiled render for every other locale
function findTemplates(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findTemplates(full, cb);
    else if (e.name.endsWith('.hbs.html')) cb(full);
  });
}

function prerender() {
  const locales = fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.js')).map(f => path.basename(f, '.js'));

  // Refresh the .json mirrors (kept for any tooling/inspection that wants
  // plain JSON dictionaries; not required by the runtime SPA itself).
  locales.forEach(code => writeJSON(code, loadLocale(code)));

  const templates = [];
  findTemplates(PAGES_DIR, file => templates.push(file));

  templates.forEach(templateFile => {
    const tplSrc = fs.readFileSync(templateFile, 'utf8');
    const tpl = Handlebars.compile(tplSrc);
    const dir = path.dirname(templateFile);
    const base = path.basename(templateFile, '.hbs.html');

    locales.forEach(code => {
      const defaultLang = loadLocale(DEFAULT_LOCALE);
      const loc = loadLocale(code);
      const merged = Object.assign({}, defaultLang, loc);
      const ctx = { lang: merged, __locale: code };
      const html = tpl(ctx);

      const outName = (code === DEFAULT_LOCALE) ? `${base}.html` : `${base}.${code}.html`;
      const outPath = path.join(dir, outName);
      fs.writeFileSync(outPath, html, 'utf8');
      console.log('Wrote', path.relative(ROOT, outPath));
    });
  });

  console.log(`Prerender complete. ${templates.length} template(s) compiled for ${locales.length} locale(s).`);
}

prerender();
