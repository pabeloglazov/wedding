/* Beloglazov Event — свёрнутое меню аккаунта в шапке игр (тариф, срок, аватар → имя, почта, Мои игры, Тарифы, Выйти).
   PBAcct.html(info) → строка разметки; PBAcct.bind(root) — вешает открытие/закрытие. info — ответ pfQuizAccess. */
(function () {
  var CSS = '.pba{position:relative}' +
    '.pba .me{display:flex;align-items:center;gap:10px;border:0;background:none;border-radius:99px;padding:3px 3px 3px 10px;color:inherit;font:inherit;cursor:pointer}' +
    '.pba .me:hover{background:rgba(255,255,255,.06)}' +
    '.pba .mt{display:flex;flex-direction:column;align-items:flex-end;line-height:1.2}' +
    '.pba .pl{font-size:13px;font-weight:700;white-space:nowrap;color:#f2efe9}' +
    '.pba .lf{font-size:12px;font-weight:700;color:#9d9b96;white-space:nowrap}.pba .lf.w{color:#e5b45c}' +
    '.pba .av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e07a5f;color:#fff;font-weight:800;font-size:15px;flex:none;text-transform:uppercase}' +
    '.pba .am{position:absolute;right:0;top:calc(100% + 8px);z-index:60;width:260px;background:#232322;border:1px solid rgba(242,239,233,.18);border-radius:16px;padding:8px;box-shadow:0 18px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;text-align:left}' +
    '.pba .am[hidden]{display:none}' +
    '.pba .who{padding:8px 10px 10px;border-bottom:1px solid rgba(242,239,233,.09);margin-bottom:6px;display:flex;flex-direction:column;gap:2px;min-width:0}' +
    '.pba .who b{font-size:15px;color:#f2efe9}.pba .who span{font-size:13px;color:#9d9b96;overflow-wrap:anywhere}' +
    '.pba .ap{display:none;padding:0 10px 8px;flex-direction:column;font-size:13px;font-weight:700;color:#f2efe9}' +
    '.pba .am a,.pba .am button{border:0;background:none;text-align:left;border-radius:9px;padding:9px 10px;font:inherit;font-size:14.5px;font-weight:700;color:#f2efe9;text-decoration:none;cursor:pointer}' +
    '.pba .am a:hover,.pba .am button:hover{background:#1b1b1a}' +
    '.pba .am .out{color:#9d9b96;font-weight:600}' +
    '@media (max-width:640px){.pba .mt{display:none}.pba .me{padding:3px}.pba .ap{display:flex}}';
  var st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function plan(i) {
    if (i.pro) return { n: 'Тариф «' + (i.tierName || 'Подписка') + '»', s: 'Подписка', w: false };
    if (i.eventUntil && i.eventUntil > Date.now()) {
      var ms = i.eventUntil - Date.now(), d = Math.ceil(ms / 864e5), a = d % 10, b = d % 100;
      var dd = ms < 864e5 ? 'меньше дня' : d + ' ' + (a === 1 && b !== 11 ? 'день' : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 'дня' : 'дней');
      return { n: 'Тариф «' + (i.tierName || 'Мероприятие') + '»', s: 'Осталось ' + dd, w: d <= 3 };
    }
    return { n: 'Без тарифа', s: 'демо-режим', w: true };
  }
  window.PBAcct = {
    html: function (i, extra) {
      var p = plan(i), name = i.name || String(i.email || '').split('@')[0];
      return '<div class="pba"><button class="me" data-pba aria-haspopup="menu"><span class="mt"><span class="pl">' + esc(p.n) + '</span><span class="lf' + (p.w ? ' w' : '') + '">' + esc(p.s) + '</span></span><span class="av">' + esc((name || '?').trim().charAt(0)) + '</span></button>' +
        '<div class="am" hidden role="menu"><div class="who"><b>' + esc(name) + '</b><span>' + esc(i.email) + '</span></div><div class="ap"><span>' + esc(p.n) + '</span><span class="lf' + (p.w ? ' w' : '') + '">' + esc(p.s) + '</span></div>' +
        (extra || '') + '<a href="../host/">Мои игры</a><a href="../#pricing">' + (p.w ? 'Продлить тариф' : 'Тарифы') + '</a><button class="out" data-pba-out>Выйти</button></div></div>';
    },
    bind: function (root) {
      var b = root.querySelector('[data-pba]'), m = root.querySelector('.pba .am'); if (!b || !m) return;
      b.onclick = function (e) { e.stopPropagation(); m.hidden = !m.hidden; };
      var o = root.querySelector('[data-pba-out]'); if (o) o.onclick = function () { try { localStorage.removeItem('pb_host_token'); } catch (e) {} location.reload(); };
      if (!window.__pbaDoc) { window.__pbaDoc = 1; document.addEventListener('click', function (e) { if (!e.target.closest('.pba')) [].forEach.call(document.querySelectorAll('.pba .am'), function (x) { x.hidden = true; }); }); }
    }
  };
})();
