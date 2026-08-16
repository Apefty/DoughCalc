const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const i18n = require('./i18n');

const app = express();
const PORT = process.env.PORT || 3000;

// Views: use data/pages as views root
const viewsPath = path.join(__dirname, '..', 'data', 'pages');

// Create Handlebars instance, using .html as extension so existing .html files render
const hbs = exphbs.create({
  extname: '.html',
  // layouts/partials directories are optional; left here for completeness
  layoutsDir: path.join(viewsPath, 'layouts'),
  partialsDir: path.join(viewsPath, 'partials'),
  // Render views without requiring a default layout file
  defaultLayout: false
});

// Register helpers
i18n.registerHandlebarsHelpers(hbs);

app.engine('.html', hbs.engine);
app.set('view engine', '.html');
app.set('views', viewsPath);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(i18n.middleware('en'));

// Convenience route to set language via cookie and return to referrer
app.get('/set-lang', (req, res) => {
  const code = (req.query.lang || req.query.locale || 'en').toString();
  res.cookie('lang', code, { maxAge: 1000 * 60 * 60 * 24 * 30 }); // 30 days
  const back = req.get('Referer') || '/';
  res.redirect(back);
});

// simple route to render any page under data/pages by path
// e.g., /preferments/biga -> renders data/pages/preferments/biga.html
app.get(['/', '/:section/:page', '/:section/:sub/:page'], (req, res) => {
  // build view name from params
  const parts = [];
  if (req.params.section) parts.push(req.params.section);
  if (req.params.sub) parts.push(req.params.sub);
  if (req.params.page) parts.push(req.params.page);

  let viewName = parts.join('/');
  if (!viewName) {
    // default to preferments/biga if exists
    viewName = 'preferments/biga';
  }

  // pass the current locale code to template root for helpers
  res.locals.__locale = req.query.lang || (req.cookies && req.cookies.lang) || 'en';

  res.render(viewName, {} , (err, html) => {
    if (err) {
      // helpful error message during development
      return res.status(500).send('<pre>' + (err.stack || err.message || err) + '</pre>');
    }
    res.send(html);
  });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT} (system.js)`));
}

module.exports = app;
