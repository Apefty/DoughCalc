// ==========================================================
// Dough Calculator — page-data helpers (YouTube embeds, etc.)
// Reads the recipe/preferment JSON for the current route and
// renders any optional media it declares (e.g. "yt": "...").
// ==========================================================

window.DoughCalc = window.DoughCalc || {};

// Accepts a bare 11-char video ID, or a full YouTube URL in any
// common format (watch?v=, youtu.be/, shorts/, embed/).
DoughCalc.extractYouTubeId = function (input) {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  var patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = input.match(patterns[i]);
    if (m) return m[1];
  }
  return null;
};

// Appends a "Відео" card with a responsive 16:9 YouTube embed to
// the current fragment's <main>. Removes any leftover embed from
// a previous page first. Safe no-op if ytValue doesn't resolve.
DoughCalc.renderYouTube = function (ytValue) {
  var existing = document.getElementById('yt-section');
  if (existing) existing.remove();

  var id = DoughCalc.extractYouTubeId(ytValue);
  if (!id) return;

  var main = document.querySelector('#content-area main');
  if (!main) return;

  var section = document.createElement('section');
  section.className = 'card';
  section.id = 'yt-section';
  section.innerHTML =
    '<div class="card-title-row"><span class="card-title">Відео</span></div>' +
    '<div class="yt-wrap">' +
      '<iframe class="yt-frame" ' +
      'src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0" ' +
      'title="YouTube video" frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
      'allowfullscreen></iframe>' +
    '</div>';

  main.appendChild(section);
};

// Note: the page JSON itself is now fetched once by cat.js's
// navigate() (in parallel with the HTML fragment) and passed to
// both the route's init() and here as DoughCalc.renderYouTube(data.yt) —
// see cat.js. This file no longer needs its own fetch for it.
