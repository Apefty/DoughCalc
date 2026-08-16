const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'data', 'pages');
const LANG_DIR = path.join(ROOT, 'data', 'lang');
const BUILD_DIR = path.join(ROOT, 'build');

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
    const pr = new Intl.PluralRules(locale || 'en');
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

// Register t helper
Handlebars.registerHelper('t', function (key, options) {
  const params = (options && options.hash) ? options.hash : {};
  const root = (options && options.data && options.data.root) ? options.data.root : {};
  const lang = root.lang || {};
  const raw = lang[key];
  if (raw === undefined) return key;
  let chosen = raw;
  if (params && params.n !== undefined) chosen = choosePluralForm(raw, root.__locale || 'en', params.n);
  // simple interpolation
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

function relPath(file) {
  return path.relative(PAGES_DIR, file).replace(/\\/g, '/');
}

function ensureDir(file) {
  const d = path.dirname(file);
  fs.mkdirSync(d, { recursive: true });
}

function prerender() {
  const locales = fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.js')).map(f => path.basename(f, '.js'));
  // write JSON versions
  locales.forEach(code => {
    const obj = loadLocale(code);
    writeJSON(code, obj);
  });

  // collect pages
  const pages = [];
  walkDir(PAGES_DIR, file => {
    if (file.endsWith('.html')) pages.push(file);
  });

  pages.forEach(file => {
    const tplSrc = fs.readFileSync(file, 'utf8');
    const tpl = Handlebars.compile(tplSrc);
    const rel = relPath(file);
    locales.forEach(code => {
      const en = loadLocale('en');
      const loc = loadLocale(code);
      const merged = Object.assign({}, en, loc);
      const ctx = { lang: merged, __locale: code };
      const html = tpl(ctx);
      const outPath = path.join(BUILD_DIR, code, rel);
      ensureDir(outPath);
      fs.writeFileSync(outPath, html, 'utf8');
      console.log('Wrote', outPath);
      // also write top-level build copy for default language (en)
      if (code === 'en') {
        const outDefault = path.join(BUILD_DIR, rel);
        ensureDir(outDefault);
        fs.writeFileSync(outDefault, html, 'utf8');
        console.log('Wrote default', outDefault);
      }
    });
  });
}

prerender();
console.log('Prerender complete.');
