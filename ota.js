/* build 1.0.0 — 2026-08-13 */
/*
  OTA-оновлення через @capgo/capacitor-updater (ручний режим, autoUpdate:false).
  Джерело оновлень — GitHub Releases цього репозиторію (Apefty/DoughCalc).

  Очікується, що кожен реліз:
    - має тег виду vX.Y.Z (наприклад v1.3.0)
    - містить прикріплений файл з іменем bundle.zip — архів усього вмісту
      цієї папки (те, що вказано як webDir у capacitor.config.json)

  Нічого не робить у звичайному вебі/PWA — лише всередині нативного
  Android-застосунку (Capacitor.isNativePlatform()). Наразі DoughCalc
  ще не має нативної обгортки, тому цей файл поки безпечно "не спрацьовує"
  (той самий підхід, що й у French-Sauces до появи Android-обгортки) —
  готовий до підключення, коли з'явиться нативний Android-проєкт.

  window.OTA.checkForUpdate(opts):
    opts.force     — обійти 6-годинний ліміт перевірок
    opts.onStatus  — function(status, extra), status один з:
                     'checking' | 'up_to_date' | 'downloading' |
                     'updated' | 'error'
    opts.onReady   — function(version), викликається перед reload()
*/
(function () {
  var GH_REPO = 'Apefty/DoughCalc';
  var CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // не частіше ніж раз на 6 год
  var LAST_CHECK_KEY = 'doughcalc-ota-last-check';

  function isNative() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }

  function getUpdater() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater;
  }

  function shouldCheck() {
    try {
      var last = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
      return (Date.now() - last) > CHECK_INTERVAL_MS;
    } catch (e) { return true; }
  }

  function markChecked() {
    try { localStorage.setItem(LAST_CHECK_KEY, String(Date.now())); } catch (e) {}
  }

  function isNewer(remote, current) {
    var r = String(remote).split('.').map(Number);
    var c = String(current).split('.').map(Number);
    for (var i = 0; i < Math.max(r.length, c.length); i++) {
      var rv = r[i] || 0, cv = c[i] || 0;
      if (rv > cv) return true;
      if (rv < cv) return false;
    }
    return false;
  }

  function findAsset(release, name) {
    var assets = release.assets || [];
    for (var i = 0; i < assets.length; i++) {
      if (assets[i].name === name) return assets[i];
    }
    return null;
  }

  async function fetchLatestRelease() {
    var res = await fetch('https://api.github.com/repos/' + GH_REPO + '/releases/latest', {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error('GitHub API responded ' + res.status);
    return res.json();
  }

  function emit(opts, status, extra) {
    if (opts && typeof opts.onStatus === 'function') {
      try { opts.onStatus(status, extra); } catch (e) {}
    }
  }

  async function checkForUpdate(opts) {
    opts = opts || {};
    if (!isNative()) return;

    var Updater = getUpdater();
    if (!Updater) { console.warn('[OTA] CapacitorUpdater plugin not found'); return; }

    if (!opts.force && !shouldCheck()) return;

    emit(opts, 'checking');

    try {
      var release = await fetchLatestRelease();
      markChecked();

      var remoteVersion = (release.tag_name || '').replace(/^v/, '');
      if (!remoteVersion) { emit(opts, 'error', { message: 'no tag_name' }); return; }

      var current = await Updater.current();
      var currentVersion = (current && current.bundle && current.bundle.version) || '0.0.0';

      if (!isNewer(remoteVersion, currentVersion)) {
        console.log('[OTA] up to date (' + currentVersion + ')');
        emit(opts, 'up_to_date', { version: currentVersion });
        return;
      }

      var asset = findAsset(release, 'bundle.zip');
      if (!asset) { emit(opts, 'error', { message: 'no bundle.zip asset' }); return; }

      console.log('[OTA] downloading update ' + remoteVersion + ' ...');
      emit(opts, 'downloading', { version: remoteVersion });

      var bundle = await Updater.download({
        url: asset.browser_download_url,
        version: remoteVersion
      });

      await Updater.set({ id: bundle.id });
      console.log('[OTA] update ' + remoteVersion + ' set, reloading...');
      emit(opts, 'updated', { version: remoteVersion });

      if (typeof opts.onReady === 'function') opts.onReady(remoteVersion);

      await Updater.reload();
    } catch (err) {
      console.warn('[OTA] update check failed:', err);
      emit(opts, 'error', { message: err && err.message });
    }
  }

  // Підтверджуємо, що поточний бандл завантажився і працює коректно —
  // без цього виклику плагін відкотить застосунок до попередньої версії
  // при наступному запуску (захист від "битих" оновлень).
  function notifyReady() {
    var Updater = getUpdater();
    if (Updater && Updater.notifyAppReady) {
      Updater.notifyAppReady().catch(function (e) {
        console.warn('[OTA] notifyAppReady failed', e);
      });
    }
  }

  window.OTA = { checkForUpdate: checkForUpdate, isNative: isNative };

  document.addEventListener('DOMContentLoaded', function () {
    notifyReady();
    checkForUpdate();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
})();
