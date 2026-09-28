/* Beloglazov Event — общий фирменный слой: логотип и курсор как на pabeloglazov.com */
(function () {
  var D = 'M0,50a50,50 0 1,0 100,0a50,50 0 1,0 -100,0Z M9.76,50a40.24,35.68 0 1,0 80.48,0a40.24,35.68 0 1,0 -80.48,0Z M14.25,50a35.75,31.27 0 1,0 71.5,0a35.75,31.27 0 1,0 -71.5,0Z M40.48,50a9.52,9.52 0 1,0 19.04,0a9.52,9.52 0 1,0 -19.04,0Z';
  var base = (document.currentScript && document.currentScript.src || '').replace(/brand\.js.*$/, '');
  window.PB_BRAND = {
    mark: function (size) { return '<svg class="pb-mark" viewBox="0 0 100 100" width="' + (size || 28) + '" height="' + (size || 28) + '" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="' + D + '"/></svg>'; },
    lockup: function (sub) { return '<span class="pb-lock">' + this.mark(30) + '<img class="pb-word" src="' + base + 'wordmark-white.png" alt="Beloglazov Event">' + (sub ? '<small class="pb-sub">' + sub + '</small>' : '') + '</span>'; },
    base: base
  };
  function cursor() {
    if (!window.matchMedia || !matchMedia('(pointer:fine)').matches || document.body.classList.contains('no-cursor')) return;
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-dot-outline';
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.documentElement.classList.add('has-cursor');
    var ex = innerWidth / 2, ey = innerHeight / 2, x = ex, y = ey, vis = false, big = false, delay = 8;
    function show(v) { vis = v; dot.style.opacity = ring.style.opacity = v ? 1 : 0; }
    function scale(b) { big = b; dot.style.transform = 'translate(-50%,-50%) scale(' + (b ? .75 : 1) + ')'; ring.style.transform = 'translate(-50%,-50%) scale(' + (b ? 1.5 : 1) + ')'; }
    document.addEventListener('mousemove', function (e) { if (!vis) show(true); ex = e.clientX; ey = e.clientY; dot.style.top = ey + 'px'; dot.style.left = ex + 'px'; });
    document.addEventListener('mouseleave', function () { show(false); });
    document.addEventListener('mouseenter', function () { show(true); });
    document.addEventListener('mousedown', function () { scale(true); });
    document.addEventListener('mouseup', function () { scale(false); });
    document.addEventListener('mouseover', function (e) { var t = e.target && e.target.closest && e.target.closest('a,button,label,summary,select,[role=button],input[type=checkbox],input[type=range],input[type=color],.mode,.opt .ch,.swatches button,.qlist button'); if (!!t !== big) scale(!!t); });
    (function loop() { x += (ex - x) / delay; y += (ey - y) / delay; ring.style.top = y + 'px'; ring.style.left = x + 'px'; requestAnimationFrame(loop); })();
    show(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cursor); else cursor();
})();
