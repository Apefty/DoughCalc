// Compilation now happens client-side, in the browser (Handlebars is
// vendored at js/vendor/handlebars.min.js and compiles each
// data/pages/**/*.hbs.html template on the fly, using whichever
// language dictionary is active — see DoughCalc.fetchPageHtml in
// data/cat.js). There is no HTML build step anymore: a translated
// page is exactly one file, the .hbs.html source, forever.
//
// The one thing that still needs to be regenerated is the JSON
// mirror of each data/lang/<code>.js dictionary: the .js files are
// CommonJS modules (used by the optional local-preview server,
// server/i18n.js), but the browser can't require() those directly —
// it fetches plain JSON instead. Run this after editing any
// data/lang/*.js file.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LANG_DIR = path.join(ROOT, 'data', 'lang');

function loadLocale(code) {
  return require(path.join(LANG_DIR, `${code}.js`));
}

function writeJSON(code, obj) {
  const out = path.join(LANG_DIR, `${code}.json`);
  fs.writeFileSync(out, JSON.stringify(obj, null, 2), 'utf8');
  console.log('Wrote', path.relative(ROOT, out));
}

const locales = fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.js')).map(f => path.basename(f, '.js'));
locales.forEach(code => writeJSON(code, loadLocale(code)));
console.log(`Synced ${locales.length} language file(s): ${locales.join(', ')}`);
