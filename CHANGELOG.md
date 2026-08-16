# Changelog — DoughCalc

Усі помітні зміни проєкту фіксуються тут у хронологічному порядку.

## [2026-08-11] — Fix: guard addEventListener calls
- Fix: prevent console errors when page-specific DOM elements are missing
Summary: Guarded event listener attachments and conditional DOM access in the recipe/preferment calculator to avoid "Cannot read properties of null (reading 'addEventListener')" errors on pages that don't include certain controls.
Files changed: data/calc.js
Cause: code attempted to attach listeners or manipulate nodes (preferment select, input sliders, flour-type add button, etc.) on pages where those elements are not present.
Impact: eliminates runtime console errors on many recipe/technical pages and leaves existing interactive behavior unchanged on pages that include the elements.
Verification: load several affected pages (e.g., technical/, sweet/, laminated/, enriched/, flatbread/*), reload, and confirm the console no longer shows the previous null-addEventListener errors and that interactive controls still function where present.

- Summary: Guarded event listener attachments and conditional DOM access in data/calc.js to prevent "Cannot read properties of null (reading 'addEventListener')" runtime errors on pages that don't include certain interactive controls (preferment selects, sliders, flour-type add button).
- Files changed: data/calc.js
Restored preferment-related variables (currentPreData, rowPrePercent, preHr, preBreakdown, preTimeInput, etc.) to the outer scope so render() can access them.
Kept the safety guards: only attach event listeners and build the preferment <select> when selectPreferment exists.
Ensured applyRecipeDefaults() still runs (it populates the percentage inputs / sliders).
Kept previous guards (input/add-flour-type listener) intact.

Added an initial call to render() at the end of DoughCalc.initRecipePage so outputs (main-flour, main-water, out-total-dough, etc.) are computed once when the page is loaded, even if a preferment <select> isn't present.
The call was inserted immediately after the nested render() function, before the end of the initRecipePage function:
File: data\calc.js
Inserted: render(); (with a short comment)
Previously the code only invoked render() from the preferment-select code path (or via input events). Pages that don't include the preferment select (many recipe pages) never ran the initial render, so the outputs stayed at 0 until a user changed an input. The new unconditional initial render populates outputs using the inputs already present in the page markup (e.g., input-total value="1000").


## [2026-08-01] — Старт проєкту
- Ініціалізація репозиторію, README з умовами використання
- Перше завантаження базової структури (icons folder, перші файли)

## [2026-08-02] — Дизайн, структура, перші розділи
- Дизайн та стилі (`style.css`), новий набір іконок
- Додано `pf.html` (Pâte fermentée)
- Додано `cat.js` (логіка каталогів секцій)
- Обмежено ширину header/bottom-nav до 600px по центру
- Додано сторінки Roman та Sicilian pizza
- Додано сторінку Baguette
- Багети виділено в окрему top-level категорію, окремо від Піци
- Виправлено коментарі в `cat.js` (передчасне закриття `*/`)
- Виправлено відносні шляхи для GitHub Pages subpath: `BASE` тепер обчислюється з `location.pathname`, шляхи до картинок у CSS — відносні, а не root-absolute
- Додано підтримку YouTube-embed: `app.js` читає опційне поле `yt` з JSON кожного маршруту та рендерить responsive embed
- Додано каталог Солодкої випічки + сторінку Brioche; розширено `calc.js` опційними відсотками цукру/яєць/масла для збагаченого тіста
- Вирівняно ширину header/menu/recipe-page/bottom-nav під 650px wrapper (прибрано конфліктні обмеження в 600px)
- Відновлено `#body-wrapper` в `index.html`, спрощено `#content-area`
- Виправлено шляхи `url()` в CSS: `../img/...` замість root-absolute, бо `style.css` лежить у `css/`

## [2026-08-03] — Header fixes та відновлення втрачених правок
- Header: заголовок/меню вирівняно вліво, іконка налаштувань закріплена справа через `margin-left:auto`
- **Відомий інцидент:** локальний merge користувача випадково відкотив поля sugar/egg/butter у `calc.js` та маршрути sweet/brioche у `cat.js` — відновлено окремим комітом
- Кілька локальних `upd`-комітів та merge гілки `main`

---

## Поточний стан (станом на 2026-08-04)

**Готово:**
- Хліб: bread1/2, pan, rustic, rye, sourdough-bread, wheat, wholegrain, additions
- Піца: neapolitan, pizza1/2, roman, sicilian
- Багети: baguette.html
- Преферменти: biga, levain, lievito-madre, opara, pf, poolish, sponge, sourdough (+ каталог pref.html)
- Солодка випічка: brioche.html (+ каталог sweet.html)
- Калькулятор: calculator.html (standalone quick-calc)

**Ще не побудовано (лише `.gitkeep`):**
- Шарувате тісто (laminated)
- Збагачене тісто (enriched) — окрім brioche, який вже в sweet
- Пласке тісто (flatbread)
- Декоративне тісто (technical)
- У Солодкій випічці: Паска, Панетоне, Тарти

**Відомий проблемний паттерн:** локальні `upd`-коміти користувача іноді відкочують нещодавні пуші, якщо локальна робоча копія відстає — рекомендовано робити `git pull` перед локальними правками.

## [2026-08-06] Fixes

**data/calc.js**

Made slider fill calculations robust by validating min, max, and value and clamping --percent to 0-100%, preventing invisible slider tracks when invalid values were present.
Added recipe default application so baker_percentages_default values now populate both numeric inputs and range sliders on recipe pages.
Ensured default_preferment and default_preferment_percent are applied at init and the preferment section is shown/hidden correctly when a recipe ships with a preselected preferment.
Added support for options.flourTypes in DoughCalc.initRecipePage() and auto-initialized the flour-type widget when #flour-types-list exists.
Updated render path so flour-type widget receives the current main flour weight every time the calculation updates.
Added safety around preferment scaling and clamped mainFlour / mainWater to zero, preventing negative displayed main-water values when preferment water exceeded the main dough hydration.
data/cat.js

Updated recipe route init callbacks to pass fetched JSON data into DoughCalc.initRecipePage().
Simplified pizza route initialization for neapolitan and roman to use the new options.flourTypes mechanism instead of separately creating a flour widget.

**css/style.css**

Added a more resilient slider track fallback so invalid or non-finite --percent values no longer hide the slider track.
HTML fixes

Fixed egg slider CSS class mismatches for rng-egg across affected recipe pages so the egg slider now uses the correct .pct-slider-eggs styling.
Verified the sweet/panettone flour-type “Add type” button now works, adding a new flour type row as expected.

Created the laminated route support.

**Changes made in data/cat.js:**

Added 'laminated' route pointing to data/pages/laminated/laminated.html
Added 'laminated/croissant' route with data/pages/laminated/croissant.html and data/json/laminated/croissant.json
Added 'laminated/feuillete' route with data/pages/laminated/feuillete.html and data/json/laminated/feuillete.json
Added the missing sweet/tart route and the child routes for the tart pages:

sweet/tart → data/pages/sweet/tart.html
sweet/tart/brisee → data/pages/sweet/brisee.html
sweet/tart/sablee → data/pages/sweet/sablee.html
sweet/tart/sucree → data/pages/sweet/sucree.html


**Result:**

- Sliders now render correctly with valid fill styling.
- Recipe page inputs now load defaults from JSON.
- sweet/brioche no longer shows negative main-water values in the UI.
- sweet/panettone flour-type widget now responds to the add button.
- #laminated now loads the laminated menu page and #laminated/croissant loads its recipe page correctly.
- #sweet/tart now opens and #sweet/tart/brisee loads correctly.
## [2026-08-16] — Localization migration, preview server and tooling

Summary:
- Added an Express + Handlebars preview server and i18n middleware to support server-side rendering of language keys and a t() helper for interpolation/plurals.
- Added an automated PowerShell script to batch-replace literal strings with {{lang.KEY}} placeholders using a CSV mapping (with dry-run and backups).
- Converted one example page (data/pages/preferments/biga.html) to use language keys and added corresponding translations in data/lang/en.js and data/lang/ua.js.

Files added:
- server/system.js                         — preview server (express + express-handlebars), registers i18n helpers and /set-lang route
- server/i18n.js                           — locale loader, middleware, Handlebars helper registration, plural/interpolation support
- package.json                             — minimal manifest and npm start script
- scripts/convert-i18n.ps1                 — PowerShell mapping replacement script (creates .bak backups)
- scripts/mappings.csv                      — example mappings CSV

Files modified:
- data/pages/preferments/biga.html        — replaced hard-coded labels with {{lang.KEY}} placeholders for preview
- data/lang/en.js                          — added English strings for new keys
- data/lang/ua.js                          — added Ukrainian strings for new keys (and ITEM_COUNT plural test)
- data/app.js                              — settings/drawer: language selectors now call /set-lang?lang=XX to notify server and reload
- README.md                                — added preview server and conversion instructions

Files removed:
- server/app.js                             — removed (renamed to server/system.js)

Other files created/updated:
- .gitignore                                — Node + local-ignore entries

Notes:
- The preview server runs on a Node process and renders the Handlebars templates on the server. Use http://localhost:3000/preferments/biga (add ?lang=ua) to preview.
- The scripts/convert-i18n.ps1 script performs literal replacements; run with -WhatIf first and inspect .bak files before committing.

Technical detail about static hosts (GitHub Pages / Netlify):
- GitHub Pages and Netlify (static site mode) do NOT run a persistent Node/Express process to render Handlebars templates at request time. If you deploy this repository to a static-only host, the raw Handlebars templates ({{lang.KEY}}) will be served unchanged.

Recommended options to publish with Handlebars rendering working:
1) Deploy to a Node-capable host (recommended for server-side rendering):
   - Render, Railway, Heroku, VPS: run npm install && npm start, the server will handle dynamic rendering and /set-lang cookie behavior.

2) Pre-render templates at build time (Static Site Generation):
   - Create a build step that loads your locale files and compiles Handlebars templates into static HTML per locale. Commit the generated HTML to the branch used by GitHub Pages/Netlify. This works well if sites are mostly static.

3) Use serverless functions or On-Demand Builders (advanced):
   - Netlify Functions, Vercel Serverless Functions or Netlify On-Demand Builders can run Node code per request to render templates. This requires wiring endpoints and routing and may incur higher complexity/latency.

4) Client-side i18n fallback:
   - Keep templates static and use a small client-side script that loads the appropriate data/lang/*.js and replaces data-i18n or placeholders in DOM. This avoids server changes but pushes translation to client and requires additional JS.

If you want, I can:
- Initialize a local git commit including all changes (I will not push to any remote unless you ask),
- Or prepare a build step to pre-render templates for static hosts,
- Or create a small client-side fallback script to make Live Server show translated text.


## [2026-08-16] — Localization: build-time pre-render replaces server/client-substitution approach

Rewired the previous commit's i18n work so it works with zero server dependency, on any target (GitHub Pages, Netlify, and the native Android/Windows wrapper alike) — the prior approach assumed a persistent Node process (Handlebars SSR) or a runtime DOM-substitution script, neither of which fits this app's fetch-based SPA routing.

Changes:
- `scripts/prerender.js` — rewritten. Compiles any `data/pages/**/*.html` that contains `{{lang.KEY}}` placeholders into a locale-suffixed sibling file (e.g. `biga.en.html`) for every non-default locale, and overwrites the original bare filename with the default-locale (`uk`) render. Pages with no placeholders are left untouched — no build step needed for them yet.
- `data/cat.js` — `navigate()` now calls `DoughCalc.fetchLocalizedHtml()`, which fetches `<slug>.<lang>.html` when the active language isn't the default, falling back to the plain `<slug>.html` if no translated variant exists yet (404). This is a static-file fetch, same on every host.
- `data/app.js` — language-select handlers no longer call a `/set-lang` server route (doesn't exist on static hosts). They save the pref and call `DoughCalc.navigate()` to re-fetch the current route in the new language immediately.
- `data/lang/ua.js` → renamed `uk.js` (and `ua.json` → `uk.json`) — the UI's language `<select>` already used `uk` as the option value (correct ISO 639-1 code for Ukrainian; `ua` is the *country* code). Locale files now match.
- `index.html`, `data/pages/settings/settings.html` — added the missing `<option value="en">English</option>` to both language selects (previously Ukrainian-only, no way to actually pick English).
- Removed: `js/i18n-client.js` (client-side runtime substitution, superseded by build-time pre-render), `data/pages/preferments/biga_backup.html` (stray copy left over from the manual conversion).
- `package.json` — added the `handlebars` dependency that `scripts/prerender.js` requires directly (was missing; only `express-handlebars` was listed).

`server/system.js` + `server/i18n.js` (Express + Handlebars preview server) are kept as-is, purely as an optional local dev-preview convenience — not part of the production pipeline. Run `npm run build` (`node scripts/prerender.js`) before committing any newly-translated page so the static variants are up to date; no server needs to run at deploy time or runtime.

Only `preferments/biga` has translations so far (proof of concept from the prior commit) — the rest of the ~100+ recipe pages fall back to Ukrainian until translated.

## [2026-08-16] — Checklist pass: pizza / pretzels / stollen / tarte flambée

Continuing the alphabetical screenshot-vs-catalog check through `./temp`.

- `italian/pizza/biga.json` — verified already correct (hyd68/salt1.8/yeast1.3/oil5, PFF20% biga), no changes.
- `sweet/pretzels.json` — FIXED: was built from a summary table lacking hydration/salt/yeast columns (Cat.6 estimate). Full source gives hyd54% (was 55%), salt2% (was 1.8%), yeast2% (was 1.5%), butter5% (confirmed), no sugar in this recipe — the "sugar" field is now relabeled to "Солодовий порошок" (diastatic malt powder, 0.2%) instead of the guessed 2% sugar.
- `sweet/pretzels-spelt.json` (NEW, "Spelt Pretzels with Levain") — firm levain PFF15%, 50/50 whole-spelt/white-spelt, hyd58%/salt2%/yeast2%/butter5%, malt-powder 0.2% (sugar-relabel, same convention as base pretzels card). Distinct dough from the base Pretzels recipe, not a variant of the same card.
- `sweet/stollen.json` — FIXED: was built from a summary table (Cat.6, only Butter/Egg/Sugar/PFF% given, rest estimated). Full source is a 16-ingredient enriched holiday bread — far more components than the 9 available fields, so several are grouped by category (mirroring the source's own final-dough table, which already lumps the soaked fruits into one line): preferment added (Short Sponge, PFF50%, was `compatible_preferments:[]`); hydration field relabeled "Молоко" 50% (the dough's only liquid, no water); egg field = whole eggs + yolks combined 12.8%; oil field relabeled "Сухофрукти й цукати" (currants+golden raisins+candied peel) 72.2%; milk field relabeled "Ром, ваніль, цедра" 12.9%; candy field = roasted almonds 27.8% (was 50%, wrongly lumped with dried fruit); sugar 10% (was 15%); salt 1% (was 1.8%); butter 50% (was 45%). Marzipan filling stays unmodeled (no %, it's a rolled-in filling).
- `bread/tarte-flambee.json` + `data/pages/bread/tarte-flambee.html` — found to be an inert orphan pair (identical to the wired-in `flatbread/tarte-flambee.json`, not referenced by any route in `cat.js`), matching the known stale-branch-merge orphan pattern from earlier sessions. Left in place, not deleted, consistent with how the other orphans were handled.

**Still to check next:** `bagels*`, `levain.jpg` (mother-culture, likely out of scope per earlier precedent), `temp/proportions-reference.txt` (unreviewed reference doc, not a recipe).
