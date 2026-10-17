/* Cookie consent banner (Google Analytics only).
 *
 * The inline snippet in <head> (partials/head-meta.html and the two standalone landing pages)
 * sets analytics_storage to 'denied' by default and defines window.loadGoogleAnalytics(), which
 * loads gtag.js only after consent (it runs at once for a stored 'granted'). This file only shows
 * the banner, stores the choice and calls loadGoogleAnalytics() when the visitor accepts.
 * Choice is kept in localStorage under STORAGE_KEY ('granted' | 'denied').
 * window.openCookieSettings() re-opens the banner (linked from privacy.html).
 */
(function () {
  var STORAGE_KEY = 'cc_analytics';
  var bar = null;

  function read() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked: choice lasts for this page only */ }
  }
  // Basic Consent Mode: GA is loaded only after acceptance. Revoking stops it for this page view too.
  function apply(value) {
    if (value === 'granted') {
      if (typeof window.loadGoogleAnalytics === 'function') window.loadGoogleAnalytics();
    } else if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }

  // Remove Google Analytics cookies (_ga, _ga_XXXX) from this host and its parent domains.
  function clearAnalyticsCookies() {
    var names = document.cookie.split(';').map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (n) { return n === '_ga' || n.indexOf('_ga_') === 0 || n === '_gid' || n === '_gat'; });
    var host = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < host.length - 1; i++) domains.push('; domain=.' + host.slice(i).join('.'));
    names.forEach(function (n) {
      domains.forEach(function (d) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }

  function injectStyles() {
    var css =
      '.cc-bar{position:fixed;inset-inline:16px;bottom:16px;z-index:100000;max-width:720px;margin-inline:auto;' +
      'background:#fbf5e9;color:#2d2410;border:1px solid #ece0c8;border-radius:14px;padding:18px 20px;' +
      'display:flex;flex-wrap:wrap;gap:14px 20px;align-items:center;font-family:"Assistant",Arial,sans-serif;direction:rtl;' +
      'box-shadow:0 10px 30px rgba(74,88,36,.18),0 2px 8px rgba(45,36,16,.12);' +
      'transform:translateY(20px);opacity:0;transition:transform .35s cubic-bezier(.22,1.2,.36,1),opacity .35s}' +
      '.cc-bar.is-visible{transform:translateY(0);opacity:1}' +
      '.cc-text{flex:1 1 320px;font-size:.98rem;line-height:1.6;color:#5a4e34;margin:0}' +
      '.cc-text strong{display:block;color:#4a5824;font-size:1.05rem;margin-bottom:2px}' +
      '.cc-text a{color:#8f4a2c;text-decoration:underline}' +
      '.cc-actions{display:flex;gap:10px;flex:0 0 auto}' +
      '.cc-btn{font:inherit;font-weight:700;font-size:1rem;min-height:44px;padding:0 22px;border-radius:999px;cursor:pointer;' +
      'border:2px solid #4a5824;background:transparent;color:#4a5824;transition:transform .2s,background .2s}' +
      '.cc-btn.primary{background:#4a5824;color:#fff}' +
      '.cc-btn:hover{transform:translateY(-2px)}.cc-btn:active{transform:translateY(0)}' +
      '.cc-btn:focus-visible,.cc-text a:focus-visible{outline:3px solid #dfc07e;outline-offset:3px}' +
      '@media(max-width:560px){.cc-actions{width:100%}.cc-btn{flex:1}}' +
      '@media(prefers-reduced-motion:reduce){.cc-bar{transition:none}}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function build() {
    if (bar) return bar;
    injectStyles();
    bar = document.createElement('div');
    bar.className = 'cc-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'העדפות עוגיות');
    bar.innerHTML =
      '<p class="cc-text"><strong>אשמח לדעת מה מעניין אותך</strong>' +
      'האתר משתמש בעוגיות של Google Analytics כדי להבין אילו עמודים מבוקרים. ' +
      'הן נשמרות רק אם תאשרי, והאתר פועל כרגיל גם בלי. ' +
      '<a href="privacy.html#cookies">למדיניות הפרטיות</a></p>' +
      '<div class="cc-actions">' +
      '<button class="cc-btn" type="button" data-cc="denied">לא, תודה</button>' +
      '<button class="cc-btn primary" type="button" data-cc="granted">אישור</button>' +
      '</div>';
    bar.addEventListener('click', function (e) {
      var value = e.target && e.target.getAttribute && e.target.getAttribute('data-cc');
      if (!value) return;
      write(value);
      apply(value);
      if (value === 'denied') clearAnalyticsCookies();
      hide();
    });
    document.body.appendChild(bar);
    return bar;
  }

  function show(focus) {
    var el = build();
    el.style.display = '';
    requestAnimationFrame(function () { el.classList.add('is-visible'); });
    if (focus) {
      var first = el.querySelector('.cc-btn');
      if (first) first.focus();
    }
  }
  function hide() {
    if (!bar) return;
    bar.classList.remove('is-visible');
    var el = bar;
    setTimeout(function () { el.style.display = 'none'; }, 350);
  }

  window.openCookieSettings = function () { show(true); };

  function init() {
    if (read() === null) show(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
