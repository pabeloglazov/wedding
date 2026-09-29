/* Beloglazov Event — «Примеры»: кликабельные карточки открывают живую анимированную демонстрацию.
   Один модуль на все игры. Использование:
   PBExamples({
     selector: '[data-ex]',                       // кнопки/карточки, data-ex="номер сцены"
     scenes: [function (stage, api) { ... }],     // сцены: рисуют в stage, таймеры — через api.later / api.every
     caption: function (i) { return { h: '...', p: '...' }; },
     ratio: '16/9'                                 // пропорции сцены (по умолчанию 16/9)
   });
   api.later(fn, ms), api.every(fn, ms) — таймеры, которые сами очищаются при смене сцены или закрытии;
   api.alive() — сцена ещё открыта. Возвращает { open(i), close(), refresh() }. */
(function () {
  var CSS = '.pbx{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(8,8,8,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}' +
    '.pbx.on{display:flex;animation:pbxIn .2s ease both}@keyframes pbxIn{from{opacity:0}}' +
    '.pbx .pbxbox{position:relative;background:var(--card,#1c1c1b);border:1px solid var(--line,rgba(255,255,255,.1));border-radius:24px;width:100%;max-width:920px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.5)}' +
    '.pbx .pbxx{position:absolute;top:12px;right:12px;z-index:3;width:36px;height:36px;border-radius:50%;border:0;background:rgba(0,0,0,.45);color:#fff;font-size:20px;line-height:1;cursor:pointer}' +
    '.pbx .pbxst{container-type:inline-size;position:relative;overflow:hidden;background:#0d0d0c}' +
    '.pbx .pbxcap{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:18px 22px}' +
    '.pbx .pbxcap h3{font-family:var(--hf,system-ui);font-stretch:125%;letter-spacing:-.01em;text-transform:uppercase;font-size:24px;margin:0;color:var(--ink,#fff);font-weight:600;line-height:1.1}' +
    '.pbx .pbxcap p{margin:4px 0 0;color:var(--muted,#a3a3a3);font-size:14px}' +
    '.pbx .pbxnav{display:flex;align-items:center;gap:8px;flex:none}' +
    '.pbx .pbxnav button{width:40px;height:40px;border-radius:50%;border:1px solid var(--line,rgba(255,255,255,.1));background:none;color:var(--ink,#fff);font-size:20px;cursor:pointer}' +
    '.pbx .pbxnav button:hover{background:rgba(255,255,255,.08)}' +
    '.pbx .pbxdots{display:flex;gap:6px}.pbx .pbxdots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2)}.pbx .pbxdots i.on{background:var(--gold,#f2efe9)}' +
    '@media (max-width:560px){.pbx .pbxcap{flex-direction:column;align-items:stretch;padding:14px 18px}.pbx .pbxnav{justify-content:space-between}.pbx .pbxbox{max-height:calc(100dvh - 32px);overflow:auto}}';
  var injected = false;
  window.PBExamples = function (o) {
    if (!injected) { var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); injected = true; }
    var m = document.createElement('div'); m.className = 'pbx';
    m.innerHTML = '<div class="pbxbox" role="dialog" aria-modal="true"><button class="pbxx" aria-label="close">×</button><div class="pbxst"></div>' +
      '<div class="pbxcap"><div><h3></h3><p></p></div><div class="pbxnav"><button class="pbxp" aria-label="prev">‹</button><span class="pbxdots"></span><button class="pbxn" aria-label="next">›</button></div></div></div>';
    document.body.appendChild(m);
    var st = m.querySelector('.pbxst'), cur = 0, T = [], n = o.scenes.length;
    st.style.aspectRatio = o.ratio || '16/9';
    var api = {
      later: function (fn, ms) { T.push(setTimeout(fn, ms)); },
      every: function (fn, ms) { T.push(setInterval(fn, ms)); },
      alive: function () { return m.classList.contains('on'); }
    };
    function stop() { T.forEach(function (x) { clearTimeout(x); clearInterval(x); }); T = []; }
    function go(i) {
      stop(); cur = (i + n) % n; st.innerHTML = '';
      var c = o.caption(cur) || {};
      m.querySelector('h3').textContent = c.h || ''; m.querySelector('.pbxcap p').textContent = c.p || '';
      m.querySelector('.pbxdots').innerHTML = o.scenes.map(function (x, k) { return '<i' + (k === cur ? ' class="on"' : '') + '></i>'; }).join('');
      o.scenes[cur](st, api);
    }
    function open(i) { m.classList.add('on'); document.documentElement.style.overflow = 'hidden'; go(i || 0); }
    function close() { stop(); m.classList.remove('on'); st.innerHTML = ''; document.documentElement.style.overflow = ''; }
    m.querySelector('.pbxx').onclick = close;
    m.querySelector('.pbxp').onclick = function () { go(cur - 1); };
    m.querySelector('.pbxn').onclick = function () { go(cur + 1); };
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    document.addEventListener('keydown', function (e) {
      if (!api.alive()) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'ArrowLeft') go(cur - 1);
    });
    [].forEach.call(document.querySelectorAll(o.selector || '[data-ex]'), function (b) { b.addEventListener('click', function () { open(+b.dataset.ex || 0); }); });
    return { open: open, close: close, refresh: function () { if (api.alive()) go(cur); } };
  };
})();
