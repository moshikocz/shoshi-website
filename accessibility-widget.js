(function () {
  'use strict';

  /* ── State ── */
  var state = { fontSize: 100, contrast: false, links: false };
  try {
    var saved = JSON.parse(localStorage.getItem('a11y'));
    if (saved) state = saved;
  } catch (_) {}

  /* ── Apply state immediately (before paint) ── */
  function applyState() {
    document.documentElement.style.fontSize = state.fontSize + '%';
    document.documentElement.classList.toggle('a11y-contrast', state.contrast);
    document.documentElement.classList.toggle('a11y-links',    state.links);
  }
  applyState();

  function save() {
    try { localStorage.setItem('a11y', JSON.stringify(state)); } catch (_) {}
  }

  /* ── Inject CSS ── */
  var style = document.createElement('style');
  style.textContent = [
    /* High-contrast mode */
    '.a11y-contrast { filter: grayscale(1) contrast(1.8) !important; }',

    /* Underline all links */
    '.a11y-links a { text-decoration: underline !important; text-underline-offset: 3px !important; }',

    /* Widget container */
    '#a11y-widget { position:fixed; bottom:24px; left:24px; z-index:99999; font-family:Arial,sans-serif; direction:rtl; }',

    /* Trigger button */
    '#a11y-trigger {',
    '  width:48px; height:48px; border-radius:50%; border:none; cursor:pointer;',
    '  background:#3b6cc7; color:#fff; font-size:22px; line-height:1;',
    '  display:flex; align-items:center; justify-content:center;',
    '  box-shadow:0 3px 12px rgba(0,0,0,0.35);',
    '  transition:transform 0.18s, box-shadow 0.18s;',
    '}',
    '#a11y-trigger:hover { transform:scale(1.08); box-shadow:0 5px 18px rgba(0,0,0,0.45); }',
    '#a11y-trigger:focus-visible { outline:3px solid #fff; outline-offset:2px; }',

    /* Panel */
    '#a11y-panel {',
    '  position:absolute; bottom:58px; left:0;',
    '  background:#3b2210; border:1px solid rgba(200,165,90,0.4); border-radius:10px;',
    '  padding:14px 16px; width:220px;',
    '  box-shadow:0 8px 28px rgba(0,0,0,0.45);',
    '  opacity:0; transform:translateY(8px) scale(0.97); pointer-events:none;',
    '  transition:opacity 0.2s, transform 0.2s;',
    '}',
    '#a11y-panel.open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }',

    /* Panel title */
    '#a11y-panel-title {',
    '  color:rgba(255,255,255,0.55); font-size:11px; letter-spacing:0.14em;',
    '  text-transform:uppercase; margin-bottom:12px; text-align:center;',
    '}',

    /* Rows */
    '.a11y-row {',
    '  display:flex; align-items:center; justify-content:space-between;',
    '  margin-bottom:10px;',
    '}',
    '.a11y-row:last-of-type { margin-bottom:0; }',
    '.a11y-label {',
    '  color:rgba(255,255,255,0.85); font-size:13px; font-weight:600;',
    '}',

    /* Control buttons */
    '.a11y-btn {',
    '  background:rgba(200,165,90,0.12); border:1px solid rgba(200,165,90,0.4);',
    '  color:#dfc07e; border-radius:6px; cursor:pointer; font-size:13px; font-weight:700;',
    '  padding:5px 10px; transition:background 0.15s, border-color 0.15s;',
    '  line-height:1;',
    '}',
    '.a11y-btn:hover { background:rgba(200,165,90,0.28); border-color:rgba(200,165,90,0.8); }',
    '.a11y-btn:focus-visible { outline:2px solid #dfc07e; outline-offset:2px; }',
    '.a11y-btn.active { background:rgba(200,165,90,0.35); border-color:#dfc07e; color:#fff; }',

    /* Size buttons group */
    '.a11y-size-group { display:flex; gap:6px; }',

    /* Divider */
    '.a11y-divider { border:none; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0; }',

    /* Reset */
    '#a11y-reset {',
    '  width:100%; background:none; border:1px solid rgba(255,255,255,0.18);',
    '  color:rgba(255,255,255,0.5); border-radius:6px; cursor:pointer;',
    '  font-size:12px; padding:5px; transition:border-color 0.15s, color 0.15s;',
    '}',
    '#a11y-reset:hover { border-color:rgba(255,255,255,0.55); color:rgba(255,255,255,0.85); }',
    '#a11y-reset:focus-visible { outline:2px solid #dfc07e; outline-offset:2px; }',
  ].join('\n');
  document.head.appendChild(style);

  /* ── Inject HTML ── */
  var widget = document.createElement('div');
  widget.id = 'a11y-widget';
  widget.innerHTML = [
    '<button id="a11y-trigger" aria-label="תפריט נגישות" aria-expanded="false" aria-controls="a11y-panel">',
    '  <span aria-hidden="true">♿</span>',
    '</button>',
    '<div id="a11y-panel" role="dialog" aria-label="אפשרויות נגישות">',
    '  <div id="a11y-panel-title">נגישות</div>',

    '  <div class="a11y-row">',
    '    <span class="a11y-label">גודל טקסט</span>',
    '    <div class="a11y-size-group">',
    '      <button class="a11y-btn" id="a11y-dec" aria-label="הקטני טקסט">A−</button>',
    '      <button class="a11y-btn" id="a11y-inc" aria-label="הגדילי טקסט">A+</button>',
    '    </div>',
    '  </div>',

    '  <div class="a11y-row">',
    '    <span class="a11y-label">ניגודיות גבוהה</span>',
    '    <button class="a11y-btn" id="a11y-contrast-btn" aria-pressed="false" aria-label="הפעלי ניגודיות גבוהה">כבוי</button>',
    '  </div>',

    '  <div class="a11y-row">',
    '    <span class="a11y-label">הדגשת קישורים</span>',
    '    <button class="a11y-btn" id="a11y-links-btn" aria-pressed="false" aria-label="הדגישי קישורים">כבוי</button>',
    '  </div>',

    '  <hr class="a11y-divider">',
    '  <button id="a11y-reset">↺ איפוס הגדרות</button>',
    '</div>',
  ].join('');

  document.body.appendChild(widget);

  /* ── Elements ── */
  var trigger     = document.getElementById('a11y-trigger');
  var panel       = document.getElementById('a11y-panel');
  var incBtn      = document.getElementById('a11y-inc');
  var decBtn      = document.getElementById('a11y-dec');
  var contrastBtn = document.getElementById('a11y-contrast-btn');
  var linksBtn    = document.getElementById('a11y-links-btn');
  var resetBtn    = document.getElementById('a11y-reset');

  /* ── Sync buttons to state ── */
  function syncUI() {
    contrastBtn.textContent = state.contrast ? 'פעיל' : 'כבוי';
    contrastBtn.setAttribute('aria-pressed', state.contrast ? 'true' : 'false');
    contrastBtn.classList.toggle('active', state.contrast);

    linksBtn.textContent = state.links ? 'פעיל' : 'כבוי';
    linksBtn.setAttribute('aria-pressed', state.links ? 'true' : 'false');
    linksBtn.classList.toggle('active', state.links);

    decBtn.disabled = state.fontSize <= 80;
    incBtn.disabled = state.fontSize >= 150;
  }
  syncUI();

  /* ── Toggle panel ── */
  trigger.addEventListener('click', function () {
    var isOpen = panel.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) contrastBtn.focus();
  });

  /* Close on outside click */
  document.addEventListener('click', function (e) {
    if (!widget.contains(e.target)) {
      panel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });

  /* ── Font size ── */
  incBtn.addEventListener('click', function () {
    if (state.fontSize < 150) { state.fontSize += 10; applyState(); save(); syncUI(); }
  });
  decBtn.addEventListener('click', function () {
    if (state.fontSize > 80)  { state.fontSize -= 10; applyState(); save(); syncUI(); }
  });

  /* ── High contrast ── */
  contrastBtn.addEventListener('click', function () {
    state.contrast = !state.contrast;
    applyState(); save(); syncUI();
  });

  /* ── Underline links ── */
  linksBtn.addEventListener('click', function () {
    state.links = !state.links;
    applyState(); save(); syncUI();
  });

  /* ── Reset ── */
  resetBtn.addEventListener('click', function () {
    state = { fontSize: 100, contrast: false, links: false };
    applyState(); save(); syncUI();
  });

})();
