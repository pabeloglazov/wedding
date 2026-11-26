(() => {
'use strict';
/* ================= Своя игра · Beloglazov Event =================
   Ведущий: ?               (редактор табло + пульт)
   Экран:   ?view=screen&g= (проектор)
   Телефон: ?view=play&g=   (кнопка «Ответить!»)                                  */
const P = new URLSearchParams(location.search);
const VIEW = P.get('view') || 'host';
const GID = (P.get('g') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);
const MIX = P.get('mix') === '1' && window.parent !== window, MIXNM = (P.get('nm') || '').trim().slice(0, 24);
if (MIX) { document.documentElement.classList.add('in-mix'); const st = document.createElement('style'); st.textContent = '.in-mix .top{display:none!important}.in-mix .live{padding-top:14px}.in-mix body{background:#131312}'; document.head.appendChild(st); }
const PF_API = 'https://script.google.com/macros/s/AKfycbwvLVfMge8_eCpteZrgj-MpxqO1W_TvQoMAz0jxqx42W8ySqwz2xmutpwKfVGUGZXcG3w/exec';
const DEMO_MAX = 3;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function uid(n = 10) { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const r = crypto.getRandomValues(new Uint8Array(n)); for (const x of r) s += a[x % a.length]; return s; }
function plural(n, a, b, c) { n = Math.abs(n); const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 10 || y >= 20) ? b : c; }
function ls(op, k, v) { try { if (op === 'get') return JSON.parse(localStorage.getItem(k) || 'null'); if (op === 'set') localStorage.setItem(k, JSON.stringify(v)); if (op === 'del') localStorage.removeItem(k); } catch (e) {} return null; }
function toast(t) { const el = $('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }
function qr(el, text, size = 512) { if (!el || !window.QRCode) return; el.innerHTML = ''; try { new QRCode(el, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {} }
function modal(html, onReady) { $('mbox').innerHTML = html; $('modal').classList.add('on'); if (onReady) onReady($('mbox')); }
function closeModal() { $('modal').classList.remove('on', 'wide'); }
document.addEventListener('click', e => { if (e.target && e.target.id === 'modal') closeModal(); if (e.target && e.target.closest && e.target.closest('[data-close]')) closeModal(); });
const nums = n => Number(n || 0).toLocaleString('ru-RU');
const fmtN = n => Math.abs(+n) < 10000 ? String(+n) : nums(n);
const fmtCode = c => c ? String(c).replace(/(\d{3})(\d{3})/, '$1 $2') : '';
const BASE = location.origin + location.pathname;
const SHORT = location.host.replace(/^www\./, '') + '/q';
const playLink = g => `${BASE}?view=play&g=${g.id}`;
const BRAND = sub => window.PB_BRAND ? PB_BRAND.lockup(sub) : '<b>Beloglazov Event</b>';
const MARK = n => window.PB_BRAND ? PB_BRAND.mark(n) : '';
const IC = {
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v7h-7"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>', next: '<path d="M5 4l10 8-10 8z"/><path d="M19 5v14"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>', phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  vol: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>', mute: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v7.5a7 7 0 0 1-7 7h-.6a6 6 0 0 1-4.9-2.6L3 14.5a1.6 1.6 0 0 1 2.5-2L8 15"/>',
  grip: '<path d="M5 7h14M5 12h14M5 17h14"/>', scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>', up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>', minus: '<path d="M5 12h14"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', restart: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>', end: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
};
const ico = (k, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ''}</svg>`;

/* ================= сеть: Firebase ================= */
const FB = { apiKey: 'AIzaSyADi9iG0ZtHg9zGBomUKpTpgaANStenR3Y', authDomain: 'beloglazov-games.firebaseapp.com', databaseURL: 'https://beloglazov-games-default-rtdb.firebaseio.com', projectId: 'beloglazov-games' };
const NET = { ok: false, uid: null, db: null, off: 0, connected: false, subs: [] };
const now = () => Date.now() + NET.off;
const netReady = new Promise(res => {
  try {
    if (!window.firebase) return res(false);
    firebase.initializeApp(FB);
    let done = false; const to = setTimeout(() => { if (!done) { done = true; res(false); } }, 12000);
    firebase.auth().onAuthStateChanged(u => {
      if (!u || done) return;
      done = true; clearTimeout(to);
      NET.uid = u.uid; NET.db = firebase.database(); NET.ok = true;
      NET.db.ref('.info/serverTimeOffset').on('value', x => { NET.off = x.val() || 0; });
      NET.db.ref('.info/connected').on('value', x => { NET.connected = !!x.val(); NET.subs.forEach(f => { try { f(); } catch (e) {} }); });
      res(true);
    });
    firebase.auth().signInAnonymously().catch(() => { if (!done) { done = true; clearTimeout(to); res(false); } });
  } catch (e) { res(false); }
});
const ref = p => NET.db.ref(p);
const gref = (gid, p) => ref('g/' + gid + (p ? '/' + p : ''));
const TS = () => firebase.database.ServerValue.TIMESTAMP;

/* ================= аккаунт и тарифы ================= */
const ACC = { token: null, info: null, err: '', loading: false };
try { ACC.token = localStorage.getItem('pb_host_token'); } catch (e) {}
function pfApi(fn, args, n = 0) {
  return fetch(PF_API, { method: 'POST', credentials: 'omit', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn, args }) })
    .then(r => r.text())
    .then(t => {
      let j; try { j = JSON.parse(t); } catch (e) { if (n < 3) return new Promise(r => setTimeout(r, 1500 * (n + 1))).then(() => pfApi(fn, args, n + 1)); throw new Error('Сервер занят, попробуйте ещё раз'); }
      if (!j.ok) throw new Error(String(j.error || '').replace(/^(Exception|Error):\s*/i, ''));
      return j.data;
    }, e => { if (n < 2) return new Promise(r => setTimeout(r, 1500)).then(() => pfApi(fn, args, n + 1)); throw e; });
}
function accLoad() {
  if (!ACC.token) return Promise.resolve(null);
  ACC.loading = true;
  return pfApi('pfQuizAccess', [ACC.token]).then(d => { ACC.info = d; ACC.err = ''; return d; })
    .catch(e => { ACC.err = e.message; if (/устарела/i.test(e.message)) { try { localStorage.removeItem('pb_host_token'); } catch (x) {} ACC.token = null; } return null; })
    .then(d => { ACC.loading = false; return d; });
}
const TIER = { demo: { n: 'Бесплатный', r: 0, max: DEMO_MAX }, basic: { n: 'Базовый', r: 1, max: 10 }, pro: { n: 'Продвинутый', r: 2, max: 100 }, biz: { n: 'Бизнес', r: 3, max: 100000 } };
const unlocked = () => !!(ACC.info && ACC.info.unlocked);
const myTier = () => unlocked() ? (TIER[ACC.info.tier] ? ACC.info.tier : 'pro') : 'demo';
const canColor = () => TIER[myTier()].r >= TIER.pro.r;
const teamCap = () => unlocked() ? (ACC.info.max || TIER[myTier()].max) : DEMO_MAX;
const wsKey = () => ACC.info && /^[0-9a-f]{64}$/.test(ACC.info.ws || '') ? ACC.info.ws : '';
function goLogin() { try { localStorage.setItem('pb_next', 'svoya'); } catch (e) {} location.href = '../host/'; }

/* ================= модель игры ================= */
const PAL = [['#6d4dff', 'Фиолетовый'], ['#2f6bff', 'Синий'], ['#e0457b', 'Малиновый'], ['#12a37f', 'Изумрудный'], ['#ff7a1a', 'Оранжевый'], ['#c99a12', 'Золотой']];
const DEF_ACC = PAL[0][0];
const KEY_CFG = 'pbs_cfg_v1', KEY_LIVE = 'pbs_live_v1' + (MIX ? '_mix' : ''), KEY_LAST = MIX ? 'pbs_last_mix' : 'pbs_last';
const blankM = () => ({ k: '', src: '', t0: 0, t1: 0, loop: 0 });
const blankQ = () => ({ q: '', a: '', qm: blankM(), am: blankM() });
const S5 = (arr) => arr.map(([q, a]) => Object.assign(blankQ(), { q, a }));
/* пример: музыкальная «Своя игра» — 2 раунда × 4 категории × 5 вопросов */
function YQ(q, a, id, t0, t1, a0, a1) { const u = 'https://youtu.be/' + id; return { q, a, qm: { k: 'audio', src: u, t0, t1 }, am: { k: 'audio', src: u, t0: a0, t1: a1 } }; }
function sampleCfg() {
  const S = 'Угадайте песню', Z = 'Откуда эта заставка?', Snd = 'Что это за звук?';
  return {
    id: uid(10), title: 'Музыкальная своя игра', acc: DEF_ACC, minus: true, mode: 'buzz', updated: Date.now(),
    rounds: [{
      n: 'Раунд 1 · Угадай мелодию', vals: [100, 200, 300, 400, 500], cats: [
        { n: 'Русские хиты', qs: [{ q: 'Угадайте песню', a: 'Иванушки International — «Тучи»', qm: { k: 'audio', src: 'https://youtu.be/X5Z9-4JV99c', t0: 18, t1: 33 }, am: { k: 'audio', src: 'https://youtu.be/X5Z9-4JV99c', t0: 49, t1: 75 } }, { q: 'Угадайте песню', a: 'Звери — «Районы-кварталы»', qm: { k: 'audio', src: 'https://youtu.be/is5iND3XNH0', t0: 46, t1: 61 }, am: { k: 'audio', src: 'https://youtu.be/is5iND3XNH0', t0: 62, t1: 88 } }, { q: 'Угадайте песню', a: 'Алла Пугачёва — «Миллион алых роз»', qm: { k: 'audio', src: 'https://youtu.be/At3Qo9n4_Uc', t0: 13, t1: 28 }, am: { k: 'audio', src: 'https://youtu.be/At3Qo9n4_Uc', t0: 61, t1: 86 } }, { q: 'Угадайте песню', a: 'Любэ — «Конь»', qm: { k: 'audio', src: 'https://youtu.be/LQDayLAfAHs', t0: 36, t1: 48 }, am: { k: 'audio', src: 'https://youtu.be/LQDayLAfAHs', t0: 48, t1: 73 } }, { q: 'Угадайте песню', a: 'Земляне — «Трава у дома»', qm: { k: 'audio', src: 'https://youtu.be/iPIiMvyO-SQ', t0: 0, t1: 15 }, am: { k: 'audio', src: 'https://youtu.be/iPIiMvyO-SQ', t0: 69, t1: 95 } }] },
        { n: 'Зарубежные хиты', qs: [{ q: 'Угадайте песню', a: 'Michael Jackson — Billie Jean', qm: { k: 'audio', src: 'https://youtu.be/Zi_XLOBDo_Y', t0: 0, t1: 15 }, am: { k: 'audio', src: 'https://youtu.be/Zi_XLOBDo_Y', t0: 85, t1: 110 } }, { q: 'Угадайте песню', a: 'Pharrell Williams — Happy', qm: { k: 'audio', src: 'https://youtu.be/ZbZSe6N_BXs', t0: 33, t1: 48 }, am: { k: 'audio', src: 'https://youtu.be/ZbZSe6N_BXs', t0: 31, t1: 57 } }, { q: 'Угадайте песню', a: 'Taylor Swift — Shake It Off', qm: { k: 'audio', src: 'https://youtu.be/nfWlot6h_JM', t0: 42, t1: 57 }, am: { k: 'audio', src: 'https://youtu.be/nfWlot6h_JM', t0: 47, t1: 73 } }, { q: 'Угадайте песню', a: 'Earth, Wind & Fire — September', qm: { k: 'audio', src: 'https://youtu.be/Gs069dndIYk', t0: 0, t1: 15 }, am: { k: 'audio', src: 'https://youtu.be/Gs069dndIYk', t0: 49, t1: 75 } }, { q: 'Угадайте песню', a: 'Mark Ronson ft. Bruno Mars — Uptown Funk', qm: { k: 'audio', src: 'https://youtu.be/OPf0YbXqDm0', t0: 0, t1: 15 }, am: { k: 'audio', src: 'https://youtu.be/OPf0YbXqDm0', t0: 64, t1: 90 } }] },
        { n: 'Песни из мультфильмов', qs: [
          YQ(S, 'Крокодил Гена — «Голубой вагон»', 'q1Y6bI-TyWU', 0, 15, 20, 50),
          YQ(S, 'Крокодил Гена — «Пусть бегут неуклюже»', 'EbAPd1491X8', 0, 15, 20, 50),
          YQ(S, 'Катерок — «Чунга-Чанга»', 'tSq9jJwi7rM', 0, 15, 20, 50),
          YQ(S, 'Крошка Енот — «Улыбка»', 'Qtv5worqJcQ', 0, 15, 20, 50),
          YQ(S, 'Бременские музыканты — «Ничего на свете лучше нету»', 'x2VGBNjxDgk', 0, 15, 20, 50)] },
        { n: 'Саундтреки фильмов', qs: [
          YQ('Из какого фильма эта музыка?', 'Гарри Поттер — «Hedwig’s Theme»', 'wtHra9tFISY', 0, 15, 15, 45),
          YQ('Из какого фильма эта музыка?', 'Пираты Карибского моря — «He’s a Pirate»', 'dFBBKfw59kA', 0, 15, 15, 45),
          YQ('Из какого фильма эта музыка?', 'Звёздные войны — «Main Theme»', '_D0ZQPqeJkk', 0, 15, 15, 45),
          YQ('Из какого фильма эта музыка?', 'Миссия невыполнима — «Main Theme»', 'JduAzxXBwuY', 0, 15, 15, 45),
          YQ('Из какого фильма эта песня?', 'Титаник — «My Heart Will Go On»', '9bFHsd3o1w0', 5, 20, 185, 215)] }
      ]
    }, {
      n: 'Раунд 2 · Мультики и заставки', vals: [200, 400, 600, 800, 1000], cats: [
        { n: 'Заставки мультиков', qs: [
          YQ('Какой это мультфильм?', 'Ну, погоди! — заставка', '3Jxh1IRc-AU', 0, 12, 0, 30),
          YQ('Какой это мультфильм?', 'Том и Джерри — заставка', '3cu0KOzunpI', 0, 12, 0, 27),
          YQ('Какой это мультфильм?', 'Смешарики — заставка', 'bMY2MZAOs50', 0, 10, 0, 21),
          YQ('Какой это мультфильм?', 'Барбоскины — заставка', '0VVGXjZPgXo', 0, 8, 0, 15),
          YQ('Какой это мультфильм?', 'Фиксики — «Кто такие фиксики»', '9MH5RgPdmRE', 0, 12, 0, 35)] },
        { n: 'Песни Disney', qs: [
          YQ(S, 'Холодное сердце — «Let It Go»', 'YVVTZgwYwVo', 0, 15, 60, 90),
          YQ(S, 'Король Лев — «Hakuna Matata»', 'kaOIxll4LCA', 0, 15, 30, 60),
          YQ(S, 'Русалочка — «Under the Sea»', 'GC_mV1IpjWA', 0, 15, 40, 70),
          YQ(S, 'Моана — «How Far I’ll Go»', 'cPAbx5kgCJo', 0, 15, 50, 80),
          YQ(S, 'Тайна Коко — «Remember Me»', 'E7VPdpEV1m0', 0, 15, 30, 60)] },
        { n: 'Заставки ТВ и сериалов', qs: [
          YQ(Z, 'Поле чудес — заставка', 'U251PjyCMHM', 0, 12, 0, 28),
          YQ(Z, 'Друзья — «I’ll Be There For You»', 'S8PNXgLhkT0', 0, 15, 20, 50),
          YQ(Z, 'Симпсоны — заставка', 'aPzS3QYb868', 0, 15, 15, 45),
          YQ(Z, 'Что? Где? Когда? — заставка', 'LRgPNjrCW3s', 0, 15, 15, 45),
          YQ(Z, 'Игра престолов — заставка', 's7L2PVdrb_8', 0, 15, 15, 45)] },
        { n: 'Звуки игр и гаджетов', qs: [
          YQ(Snd, 'Nokia — классический рингтон', 'pe1ZXh5_wk4', 0, 5, 0, 5),
          YQ(Snd, 'Windows XP — звук запуска', '7nQ2oiVqKHw', 0, 5, 0, 5),
          YQ(Snd, 'Super Mario Bros. — главная тема', 'uhscMsBhNhw', 0, 12, 12, 40),
          YQ(Snd, 'Тетрис — «Коробейники»', 'NmCCQxVBfyM', 0, 12, 12, 40),
          YQ(Snd, 'Pac-Man — музыка в начале игры', 'rnf0q1zOTXs', 0, 6, 0, 6)] }
      ]
    }]
  };
}
function normM(m) {
  m = Object.assign(blankM(), m || {}); m.k = ['audio', 'video', 'image'].indexOf(m.k) >= 0 ? m.k : ''; m.src = String(m.src || '').trim();
  m.t0 = Math.max(0, Math.round((+m.t0 || 0) * 10) / 10); m.t1 = Math.max(0, Math.round((+m.t1 || 0) * 10) / 10); m.loop = m.loop ? 1 : 0;
  if (m.src && !m.k) m.k = guessKind(m.src); return m;
}
function normQ(q) {
  q = q || {}; const o = { q: String(q.q || ''), a: String(q.a || ''), qm: normM(q.qm), am: normM(q.am) };
  if (!o.qm.src && q.yt) o.qm = normM({ k: q.k === 'video' ? 'video' : 'audio', src: q.yt, t0: q.t0, t1: q.t1 });
  else if (!o.qm.src && q.img) o.qm = normM({ k: 'image', src: q.img });
  return o;
}
const MAXC = 8;
const RT = { board: ['grid', 'Своя игра', 'Табло «категории × стоимость», кнопка «Ответить!» — кто первый'], quiz: ['list', 'Квиз', 'Вопросы по очереди с таймером: варианты ABCD, число, ответ текстом'] };
const QT = { abcd: 'ABCD', num: 'Число', open: 'Текстом' };
/* виды раундов (как в Квизли): движок «board» или «quiz» + настройки по умолчанию */
const KINDS = {
  board: { t: 'board', g: 0, n: 'Своя игра', d: 'Выберите категорию и стоимость, успейте первым нажать «Ответить!»' },
  abcd: { t: 'quiz', g: 0, qt: 'abcd', n: 'ABCD', d: 'Вопрос и четыре варианта — как в «Кто хочет стать миллионером?»' },
  open: { t: 'quiz', g: 0, qt: 'open', n: 'Классический квиз', d: 'Команды пишут ответ на телефоне за ограниченное время' },
  fast: { t: 'quiz', g: 1, qt: 'open', fast: 1, change: 0, n: 'Кто быстрее', d: 'Очки получает только самая быстрая команда с верным ответом' },
  num: { t: 'quiz', g: 1, qt: 'num', n: 'Числа', d: 'Ответ — всегда число. Очки у той команды, чей ответ ближе всех' },
  mix: { t: 'quiz', g: 2, qt: 'abcd', n: 'Микс', d: 'Вопросы разного формата в одном раунде: ABCD, числа, текст' }
};
const KGROUPS = ['Популярные', 'Без вариантов ответов', 'Остальное'];
const SOON = [['По порядку', 'Расставить четыре варианта в правильном порядке'], ['100 к 1', 'Несколько ответов разной стоимости'], ['Ставки', 'Ставите очки на тему вопроса'], ['Опрос', 'Узнайте мнение участников']];
const KART = {
  board: '<rect x="8" y="10" width="26" height="12" rx="3" class="a"/><rect x="8" y="26" width="26" height="12" rx="3" class="a"/><rect x="8" y="42" width="26" height="12" rx="3" class="a"/>' + [40, 62, 84].map(x => [10, 26, 42].map(y => `<rect x="${x}" y="${y}" width="18" height="12" rx="3"${x === 62 && y === 26 ? ' class="h"' : ''}/>`).join('')).join(''),
  abcd: '<rect x="10" y="12" width="40" height="16" rx="4" class="h"/><rect x="58" y="12" width="40" height="16" rx="4"/><rect x="10" y="34" width="40" height="16" rx="4"/><rect x="58" y="34" width="40" height="16" rx="4"/>',
  open: '<rect x="14" y="14" width="80" height="14" rx="4"/><rect x="14" y="34" width="56" height="14" rx="4" class="h"/><path d="M78 38l5 5 9-10" class="s"/>',
  fast: '<circle cx="54" cy="34" r="20" class="o"/><path d="M54 34V22M54 34l9 6" class="s"/><rect x="48" y="8" width="12" height="5" rx="2"/>',
  num: '<path d="M12 40h84" class="s"/>' + [12, 33, 54, 75, 96].map(x => `<path d="M${x} 35v10" class="s"/>`).join('') + '<circle cx="62" cy="40" r="7" class="h"/><rect x="50" y="14" width="24" height="12" rx="4" class="h"/>',
  mix: '<rect x="12" y="12" width="26" height="18" rx="4" class="h"/><circle cx="62" cy="21" r="9"/><path d="M80 30l8-18 8 18z"/><rect x="12" y="36" width="84" height="12" rx="4" class="a"/>'
};
const kindOf = r => KINDS[r.kind] && KINDS[r.kind].t === r.t ? r.kind : r.t === 'board' ? 'board' : 'mix';
const rLabel = r => KINDS[kindOf(r)].n;
const blankQQ = () => ({ type: 'abcd', q: '', opts: ['', '', '', ''], ok: 0, num: '', unit: '', acc: '', pts: 100, time: 0, qm: blankM(), am: blankM() });
function normQQ(q) {
  q = Object.assign(blankQQ(), q || {}); q.type = QT[q.type] ? q.type : 'abcd'; q.q = String(q.q || '');
  q.opts = (Array.isArray(q.opts) ? q.opts : []).slice(0, 6).map(x => String(x || '')); while (q.opts.length < 2) q.opts.push('');
  q.ok = Math.max(0, Math.min(q.opts.length - 1, +q.ok || 0)); q.num = q.num === '' || q.num == null || !isFinite(+q.num) ? '' : +q.num; q.unit = String(q.unit || '');
  q.acc = String(q.acc || ''); q.pts = Math.max(0, Math.round(+q.pts || 0)); q.time = Math.max(0, Math.round(+q.time || 0)); q.qm = normM(q.qm); q.am = normM(q.am); return q;
}
const accList = q => String(q.acc || '').split(/[;\n]/).map(x => x.trim()).filter(Boolean);
const validQQ = q => !!(q && (q.q.trim() || mOk(q.qm)) && (q.type === 'abcd' ? q.opts.filter(x => x.trim()).length >= 2 && (q.opts[q.ok] || '').trim() : q.type === 'num' ? q.num !== '' : accList(q).length));
function normQuiz(r, i) {
  return { t: 'quiz', kind: KINDS[r.kind] && KINDS[r.kind].t === 'quiz' ? r.kind : 'mix', n: String(r.n || 'Раунд ' + (i + 1)), time: Math.max(5, Math.min(600, Math.round(+r.time || 30))), fast: r.fast ? 1 : 0, change: r.change === 0 || r.change === false ? 0 : 1, qs: (Array.isArray(r.qs) ? r.qs : []).slice(0, 60).map(normQQ) };
}
function normRound(r, i) {
  r = r || {}; if (r.t === 'quiz') return normQuiz(r, i); let vals = (Array.isArray(r.vals) && r.vals.length ? r.vals : [100, 200, 300, 400, 500]).slice(0, MAXC).map((v, j) => Math.max(0, Math.round(+v || (j + 1) * 100 * (i + 1))));
  const cats = (Array.isArray(r.cats) && r.cats.length ? r.cats : [{ n: '', qs: [] }]).slice(0, 8).map(c => { const qs = (c && Array.isArray(c.qs) ? c.qs : []).slice(0, vals.length).map(normQ); while (qs.length < vals.length) qs.push(blankQ()); return { n: String((c && c.n) || ''), qs }; });
  return { t: 'board', kind: 'board', n: String(r.n || 'Раунд ' + (i + 1)), vals, cats };
}
function normCfg(c) {
  if (!c || !Array.isArray(c.rounds)) c = sampleCfg();
  c.id = c.id || uid(10); c.title = String(c.title || 'Своя игра'); c.acc = /^#[0-9a-f]{6}$/i.test(c.acc || '') ? c.acc : DEF_ACC;
  c.minus = c.minus !== false; c.mode = c.mode === 'voice' ? 'voice' : 'buzz';
  c.rounds = c.rounds.filter(r => r && r.t !== 'quiz').slice(0, 10).map(normRound); if (!c.rounds.length) c.rounds = [normRound(null, 0)];
  return c;
}
function ytId(s) {
  s = String(s || '').trim(); if (!s) return '';
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/); return m ? m[1] : '';
}
const ytStart = s => { const m = String(s || '').match(/[?&]t=(\d+)/); return m ? +m[1] : 0; };
const isUrl = s => /^https?:\/\/\S+$/i.test(String(s || '').trim());
function guessKind(src) {
  if (ytId(src)) return 'audio';
  const x = String(src).toLowerCase().split('?')[0];
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(x)) return 'image';
  if (/\.(mp4|webm|mov|m4v)$/.test(x)) return 'video';
  return 'audio';
}
const MK = { audio: ['music', 'аудио'], video: ['monitor', 'видео'], image: ['image', 'картинка'] };
const mOk = m => !!(m && m.k && m.src && (m.src.slice(0, 2) === 'f:' || isUrl(m.src) || ytId(m.src)));
const validQ = q => !!(q && (q.q.trim() || mOk(q.qm)));
const roundN = r => r.t === 'quiz' ? r.qs.filter(validQQ).length : r.cats.reduce((m, ct) => m + ct.qs.filter(validQ).length, 0);
const cellsOf = c => c.rounds.reduce((n, r) => n + roundN(r), 0);

let CFG = normCfg(ls('get', KEY_CFG));
function applyAcc(hex) { document.documentElement.style.setProperty('--acc', /^#[0-9a-f]{6}$/i.test(hex || '') ? hex : DEF_ACC); }

/* сохранение: локально + в «Мои игры» */
const STORE = {
  t: 0,
  save() { CFG.updated = Date.now(); ls('set', KEY_CFG, CFG); clearTimeout(this.t); this.t = setTimeout(() => this.push(), 900); },
  push() {
    const k = wsKey(); if (!k || !NET.ok) return;
    const c = CFG, st = $('syncSt');
    if (st) st.textContent = 'Сохраняем…';
    Promise.all([ref(`ws/${k}/sq/${c.id}`).set(c), ref(`ws/${k}/slist/${c.id}`).set({ title: c.title || 'Своя игра', couple: '', n: cellsOf(c), updated: c.updated })])
      .then(() => { if (st) st.textContent = 'Сохранено в «Моих играх»'; }, () => { if (st) st.textContent = ''; });
  }
};

/* ================= медиа: файлы (IndexedDB), ссылки, YouTube ================= */
const MEDIA = (() => {
  let dbp = null; const urls = {};
  const open = () => dbp || (dbp = new Promise(res => { try { const r = indexedDB.open('pbs_media', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }));
  const tx = (mode, fn) => open().then(db => db ? new Promise(res => { let rq; try { const t = db.transaction('f', mode); rq = fn(t.objectStore('f')); t.oncomplete = () => res(rq && rq.result); t.onerror = () => res(null); } catch (e) { res(null); } }) : null);
  return {
    put(blob) { const id = 'f:' + uid(14); return tx('readwrite', s => s.put(blob, id)).then(() => { urls[id] = URL.createObjectURL(blob); return id; }); },
    get(id) { return tx('readonly', s => s.get(id)); },
    url(id, gid) {
      if (urls[id]) return Promise.resolve(urls[id]);
      return this.get(id).then(b => {
        if (b) return (urls[id] = URL.createObjectURL(b));
        if (gid && NET.ok) return gref(gid, 'img/' + id.slice(2) + '/s').once('value').then(x => x.val() ? (urls[id] = x.val()) : '', () => '');
        return '';
      });
    }
  };
})();
const resolveSrc = (src, gid) => String(src || '').slice(0, 2) === 'f:' ? MEDIA.url(src, gid) : Promise.resolve(src);
const fmtT = t => { t = Math.max(0, +t || 0); const m = Math.floor(t / 60), s = Math.floor(t % 60); return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); };
const parseT = v => { v = String(v || '').trim(); if (!v) return 0; const p = v.split(':').map(Number); return p.length > 1 ? (p[0] || 0) * 60 + (p[1] || 0) : (+v || 0); };
function shrinkImg(file, max = 1600) {
  return new Promise(res => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); if (k >= 1 && file.size < 900000) { res(file); return; } const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); c.toBlob(b => res(b || file), 'image/jpeg', .86); }; im.onerror = () => res(file); im.src = u; });
}
/* показ медиа на экране (вопрос или ответ) */
function mountMedia(box, m, snd, gid) {
  if (!box) return;
  box.classList.toggle('aud', m.k === 'audio');
  const cover = m.k === 'audio' ? '<div class="cover"><div class="eq"><i></i><i></i><i></i><i></i><i></i></div><span>Слушаем</span></div>' : '';
  const id = ytId(m.src);
  if (id) {
    const t0 = Math.round(+m.t0 || ytStart(m.src) || 0), t1 = Math.round(+m.t1 || 0);
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&enablejsapi=1&mute=${snd ? 0 : 1}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&start=${t0}${t1 > t0 ? '&end=' + t1 : ''}${m.loop ? '&loop=1&playlist=' + encodeURIComponent(id) : ''}" allow="autoplay; encrypted-media" title="media"></iframe>` + cover;
    return;
  }
  box.innerHTML = cover;
  resolveSrc(m.src, gid).then(u => {
    if (!box.isConnected) return;
    if (!u) { box.innerHTML = '<div class="cover" style="letter-spacing:0;text-transform:none;font-size:1em;padding:2em;text-align:center">Файл есть только на устройстве, где его загрузили</div>'; return; }
    if (m.k === 'image') { box.innerHTML = `<div class="bgb" style="background-image:url('${u}')"></div><img src="${u}" alt="">`; return; }
    const el = document.createElement(m.k === 'video' ? 'video' : 'audio');
    el.src = u; el.playsInline = true; el.muted = !snd; el.preload = 'auto';
    if (m.loop && !(m.t1 > m.t0)) el.loop = true;
    el.addEventListener('loadedmetadata', () => { if (m.t0) el.currentTime = m.t0; el.play().catch(() => {}); });
    el.addEventListener('timeupdate', () => { if (m.t1 > m.t0 && el.currentTime >= m.t1) { if (m.loop) { el.currentTime = m.t0 || 0; el.play().catch(() => {}); } else el.pause(); } });
    box.insertBefore(el, box.firstChild);
  });
}
function ytCmd(f, func) { try { f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*'); } catch (e) {} }
function pauseMedia(box) { if (!box) return; box.querySelectorAll('iframe').forEach(f => ytCmd(f, 'pauseVideo')); box.querySelectorAll('audio,video').forEach(el => el.pause()); }
function playMedia(box) { if (!box) return; box.querySelectorAll('iframe').forEach(f => ytCmd(f, 'playVideo')); box.querySelectorAll('audio,video').forEach(el => el.play().catch(() => {})); }
/* звуки: кнопка на телефоне и сигнал на экране — синтез, без файлов */
const SFX = (() => {
  let ac = null; const ctx = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} return ac; };
  const tone = (f0, f1, dur, type, vol, delay = 0) => { const a = ctx(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02); };
  return {
    unlock: ctx,
    press() { tone(220, 880, .12, 'square', .18); tone(660, 1320, .16, 'triangle', .22, .1); tone(990, 1980, .22, 'sine', .18, .2); },
    buzz() { tone(140, 120, .5, 'sawtooth', .22); tone(280, 240, .5, 'square', .08); tone(880, 1760, .25, 'sine', .2, .05); }
  };
})();
function setMute(box, snd) {
  if (!box) return;
  box.querySelectorAll('iframe').forEach(f => { try { f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: snd ? 'unMute' : 'mute', args: [] }), '*'); if (snd) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*'); } catch (e) {} });
  box.querySelectorAll('audio,video').forEach(el => { el.muted = !snd; });
}

/* ================= живая игра (ведущий) ================= */
let G = null, ANS = {}, ONLINE = {}, hostOff = [], lastScr = '', lastCore = '';
const curR = g => g.rounds[g.ri] || g.rounds[0];
const keyOf = (g, ci, qi) => `${g.ri}-${ci}-${qi}`;
const isQuiz = g => curR(g).t === 'quiz';
const curQ = g => g && g.cur && !isQuiz(g) ? curR(g).cats[g.cur.ci].qs[g.cur.qi] : null;
const curQQ = g => g && isQuiz(g) && g.qi >= 0 ? curR(g).qs[g.qi] || null : null;
const curV = g => { if (!g) return 0; if (isQuiz(g)) { const q = curQQ(g); return q ? q.pts : 0; } return g.cur ? curR(g).vals[g.cur.qi] : 0; };
const validIdx = R => R.qs.map((q, i) => validQQ(q) ? i : -1).filter(i => i >= 0);
const normA = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function qqResults(g) {
  const R = curR(g), q = curQQ(g), out = {}; if (!q) return out;
  const list = Object.keys(g.players).filter(id => ANS[id] && ANS[id][g.bz]).map(id => ({ id, a: ANS[id][g.bz] }));
  if (q.type === 'abcd') list.forEach(x => { const o = +x.a.o; out[x.id] = { ok: o === q.ok, o, v: q.opts[o] || '', c: +x.a.c || 0 }; });
  else if (q.type === 'num') {
    let best = Infinity; list.forEach(x => { const v = +x.a.v; if (x.a.v !== '' && isFinite(v)) best = Math.min(best, Math.abs(v - q.num)); });
    list.forEach(x => { const v = +x.a.v, okv = x.a.v !== '' && isFinite(v); out[x.id] = { ok: okv && Math.abs(v - q.num) === best, v: okv ? fmtN(v) : '', c: +x.a.c || 0 }; });
  } else {
    const acc = accList(q).map(normA);
    list.forEach(x => { const a = normA(x.a.tx); out[x.id] = { ok: !!a && acc.some(v => a === v || (v.length >= 4 && (' ' + a + ' ').indexOf(' ' + v + ' ') >= 0)), v: String(x.a.tx || '').slice(0, 60), c: +x.a.c || 0 }; });
  }
  const oks = Object.keys(out).filter(id => out[id].ok);
  Object.keys(out).forEach(id => { out[id].gain = 0; });
  if (R.fast && q.type !== 'num') { oks.sort((a, b) => out[a].c - out[b].c); if (oks[0]) out[oks[0]].gain = q.pts; } else oks.forEach(id => { out[id].gain = q.pts; });
  return out;
}
const ranked = g => Object.values(g.players).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ru'));
function queue(g) {
  if (!g || g.ph !== 'q') return [];
  return Object.keys(g.players).filter(id => ANS[id] && ANS[id][g.bz]).map(id => ({ id, c: +ANS[id][g.bz].c || 0, t: +ANS[id][g.bz].t || 0 }))
    .sort((a, b) => a.c - b.c || a.t - b.t).map(x => x.id).filter(id => g.wr.indexOf(id) < 0);
}
const roundLeft = g => curR(g).cats.reduce((n, c, ci) => n + c.qs.filter((q, qi) => validQ(q) && !g.pl[keyOf(g, ci, qi)]).length, 0);
function newGame() {
  const c = JSON.parse(JSON.stringify(CFG));
  G = { id: uid(12), cfg: c.id, title: c.title, acc: canColor() ? c.acc : DEF_ACC, minus: c.minus, mode: c.mode, rounds: c.rounds, ri: 0, qi: -1, res: null, pl: {}, ph: 'lobby', cur: null, bz: 0, wr: [], by: null, gain: 0, players: {}, code: '', ov: '', mr: 0, qrz: 0, snd: true, demo: !unlocked(), cap: teamCap(), t: Date.now() };
  ANS = {}; ONLINE = {}; lastScr = ''; lastCore = '';
  publish();
  startNet();
}
function publish() {
  if (!G) return;
  ls('set', KEY_LIVE, G);
  if (VIEW === 'host') renderLive();
  netPush();
}
/* действия ведущего */
const A = {
  start() { if (G.ph === 'lobby') A.round(0); },
  pick(ci, qi) {
    if (!G || ['board', 'cell', 'ans'].indexOf(G.ph) < 0 && !(G.ph === 'lobby')) return;
    if (isQuiz(G)) return; const q = curR(G).cats[ci] && curR(G).cats[ci].qs[qi]; if (!validQ(q) || G.pl[keyOf(G, ci, qi)]) return;
    if (G.ph === 'ans' && G.cur) G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = G.pl[keyOf(G, G.cur.ci, G.cur.qi)] || { by: G.by || '' };
    G.cur = { ci, qi }; G.hp = 0; G.ph = 'cell'; G.wr = []; G.by = null; G.gain = 0; G.ov = ''; publish();
  },
  showQ() { if (G.ph !== 'cell') return; G.hp = 0; G.ph = 'q'; G.bz++; G.t0 = now(); publish(); },
  skip() { if (G.ph !== 'q') return; const id = queue(G)[0]; if (!id) return; G.wr.push(id); publish(); },
  judge(ok) {
    if (G.ph !== 'q') return; const qq = queue(G), id = qq[0]; if (!id) return; const v = curV(G), p = G.players[id];
    if (ok) { p.score += v; G.by = id; G.gain = v; G.ph = 'ans'; G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = { by: id }; }
    else { if (G.minus) p.score -= v; G.wr.push(id); G.hp = 0; }
    publish();
  },
  award(id, sign) {
    const p = G.players[id]; if (!p || (!G.cur && !curQQ(G))) return; const v = curV(G);
    if (isQuiz(G)) { p.score += sign * v; publish(); return; }
    if (sign > 0) { p.score += v; if (G.ph === 'q' || G.ph === 'cell') { G.by = id; G.gain = v; G.ph = 'ans'; G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = { by: id }; } }
    else { p.score -= v; if (G.ph === 'q' && G.wr.indexOf(id) < 0) G.wr.push(id); }
    publish();
  },
  reveal() { if (G.ph !== 'q' && G.ph !== 'cell') return; G.hp = 0; G.ph = 'ans'; G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = G.pl[keyOf(G, G.cur.ci, G.cur.qi)] || { by: '' }; publish(); },
  board() { if (G.cur) G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = G.pl[keyOf(G, G.cur.ci, G.cur.qi)] || { by: G.by || '' }; G.ph = 'board'; G.cur = null; G.ov = ''; publish(); },
  round(i) { if (!G.rounds[i]) return; if (G.cur && ['cell', 'q', 'ans'].indexOf(G.ph) >= 0) A.board(); G.ri = i; G.cur = null; G.ov = ''; G.qi = -1; G.res = null; G.ph = isQuiz(G) ? 'rintro' : 'board'; publish(); },
  qStart(i) {
    const R = curR(G), q = R.qs[i]; if (!isQuiz(G) || !validQQ(q)) return;
    G.qi = i; G.bz++; G.res = null; G.ov = ''; G.ph = 'qq'; G.t0 = now(); G.t1 = G.t0 + (q.time || R.time) * 1000; publish();
  },
  qReveal() {
    if (G.ph !== 'qq') return; const res = qqResults(G);
    Object.keys(res).forEach(id => { if (G.players[id]) G.players[id].score += res[id].gain; });
    G.res = res; G.ph = 'qr'; publish();
  },
  qNext() { const v = validIdx(curR(G)), k = v.indexOf(G.qi), nx = v[k + 1]; if (nx != null) A.qStart(nx); },
  accept(id) {
    const q = curQQ(G), p = G.players[id]; if (!q || !p || G.ph !== 'qr') return;
    const r = G.res[id] || (G.res[id] = { ok: false, v: '', gain: 0, c: 0 });
    if (r.gain > 0) { p.score -= r.gain; r.gain = 0; r.ok = false; } else { r.gain = q.pts; r.ok = true; p.score += q.pts; }
    publish();
  },
  scores() { if (MIX) { window.parent.postMessage({ pbmix: 'ov', k: 'score' }, location.origin); return; } G.ov = G.ov === 'scores' ? '' : 'scores'; publish(); },
  pause() { if (G.ph !== 'q' && G.ph !== 'ans') return; G.hp = G.hp ? 0 : 1; publish(); },
  rnext() { A.round(G.ri + 1); },
  final() { G.ph = 'final'; G.ov = ''; G.cur = null; publish(); },
  qr() { G.qrz = G.qrz ? 0 : 1; publish(); },
  qrbig() { G.qrb = G.qrb ? 0 : 1; publish(); },
  snd() { G.snd = !G.snd; publish(); },
  replay() { const q = curQ(G) || curQQ(G); if (q && (G.ph === 'qq' || G.ph === 'qr' || G.cur) && (G.ph === 'ans' || G.ph === 'qr' ? mOk(q.am) && q.am.k !== 'image' : mOk(q.qm) && q.qm.k !== 'image')) { G.mr = (G.mr || 0) + 1; G.hp = 0; publish(); toast('Играем ещё раз'); } },
  rename(id) {
    const p = G.players[id]; if (!p) return;
    modal(`<h3>Название команды</h3><input class="inp" id="rnI" maxlength="24" value="${esc(p.name)}"><div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end"><button class="btn ghost" data-close>Отмена</button><button class="btn gold" id="rnOk">Сохранить</button></div>`, b => {
      const i = b.querySelector('#rnI'); i.focus(); i.select();
      const ok = () => { const v = i.value.trim(); if (v) { p.name = v.slice(0, 24); publish(); } closeModal(); };
      b.querySelector('#rnOk').onclick = ok; i.onkeydown = e => { if (e.key === 'Enter') ok(); };
    });
  },
  setScore(id) {
    const p = G.players[id]; if (!p) return;
    modal(`<h3>Очки: ${esc(p.name)}</h3><input class="inp" id="scI" inputmode="numeric" value="${p.score}"><div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end"><button class="btn ghost" data-close>Отмена</button><button class="btn gold" id="scOk">Сохранить</button></div>`, b => {
      const i = b.querySelector('#scI'); i.focus(); i.select();
      const ok = () => { const v = Math.round(+i.value.replace(/\s/g, '')); if (isFinite(v)) { p.score = v; publish(); } closeModal(); };
      b.querySelector('#scOk').onclick = ok; i.onkeydown = e => { if (e.key === 'Enter') ok(); };
    });
  },
  addTeam() {
    modal(`<h3>Добавить команду</h3><p class="muted" style="margin:0 0 10px;font-size:14px">Для игры голосом или если у команды нет телефона.</p><input class="inp" id="atI" maxlength="24" placeholder="Название команды"><div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end"><button class="btn ghost" data-close>Отмена</button><button class="btn gold" id="atOk">Добавить</button></div>`, b => {
      const i = b.querySelector('#atI'); i.focus();
      const ok = () => { const v = i.value.trim(); if (!v) return; if (Object.keys(G.players).length >= G.cap) { toast('В демо — до ' + G.cap + ' команд'); return; } const id = 'm' + uid(8); G.players[id] = { id, name: v.slice(0, 24), score: 0, man: 1 }; publish(); closeModal(); };
      b.querySelector('#atOk').onclick = ok; i.onkeydown = e => { if (e.key === 'Enter') ok(); };
    });
  },
  kick(id) { delete G.players[id]; publish(); }
};
/* публичные данные: экран и телефоны */
function qqPub(g, phone) {
  const R = curR(g), q = curQQ(g); if (!q) return null;
  const v = validIdx(R), rev = g.ph === 'qr';
  const o = { i: v.indexOf(g.qi) + 1, n: v.length, type: q.type, q: q.q, pts: q.pts, unit: q.unit || '', t0: g.t0 || 0, t1: g.t1 || 0, fast: R.fast ? 1 : 0, change: R.change ? 1 : 0,
    opts: q.type === 'abcd' ? q.opts.map((t, j) => ({ t, j })).filter(x => x.t.trim()) : [],
    ok: rev && q.type === 'abcd' ? q.ok : -1, ans: rev ? (q.type === 'num' ? fmtN(q.num) + (q.unit ? ' ' + q.unit : '') : q.type === 'open' ? accList(q)[0] || '' : q.opts[q.ok] || '') : '' };
  if (!phone) {
    o.qm = mOk(q.qm) ? q.qm : null; o.am = rev && mOk(q.am) ? q.am : null;
    o.na = Object.keys(g.players).filter(id => ANS[id] && ANS[id][g.bz]).length; o.np = Object.keys(g.players).length;
    if (rev && g.res) {
      const cnt = {}; Object.values(g.res).forEach(r => { if (r.o != null) cnt[r.o] = (cnt[r.o] || 0) + 1; }); o.cnt = cnt;
      o.res = Object.keys(g.res).filter(id => g.players[id]).map(id => ({ n: g.players[id].name, ok: g.res[id].ok ? 1 : 0, gain: g.res[id].gain, v: g.res[id].v || '' })).sort((a, b) => b.gain - a.gain || b.ok - a.ok);
    }
  }
  return o;
}
function scrOf(g) {
  const R = curR(g), board = R.t !== 'quiz', q = curQ(g), qq = queue(g), nm = id => (g.players[id] || {}).name || '';
  return {
    id: g.id, ph: g.ph, title: g.title, acc: g.acc, code: g.code || '', rn: R.n, ri: g.ri, rc: g.rounds.length, rt: R.t, rlab: rLabel(R), rcount: roundN(R), demo: !!g.demo, qrz: g.qrz ? 1 : 0, qrb: g.qrb ? 1 : 0, snd: g.snd !== false,
    cats: board ? R.cats.map(c => c.n) : [], vals: board ? R.vals : [],
    grid: board ? R.cats.map((c, ci) => c.qs.map((x, qi) => !validQ(x) ? 2 : g.pl[keyOf(g, ci, qi)] ? 1 : 0)) : [],
    cur: g.cur && q ? { ci: g.cur.ci, qi: g.cur.qi, cat: R.cats[g.cur.ci].n, v: curV(g), q: q.q, mus: mOk(q.qm) && q.qm.k === 'audio' ? 1 : 0, qm: mOk(q.qm) ? q.qm : null, am: g.ph === 'ans' && mOk(q.am) ? q.am : null, a: g.ph === 'ans' ? q.a : '' } : null,
    qz: board ? null : qqPub(g),
    act: nm(qq[0]), hp: g.hp ? 1 : 0, qn: qq.slice(1, 4).map(nm), by: g.by ? nm(g.by) : '', gain: g.gain || 0, wr: g.wr.length, mode: g.mode,
    ov: g.ov || '', mr: g.mr || 0, players: ranked(g).map(p => ({ n: p.name, s: p.score }))
  };
}
function coreOf(g) {
  const qq = queue(g), R = curR(g), q = curQ(g), sc = {}, rk = {}, board = R.t !== 'quiz';
  ranked(g).forEach((p, i) => { sc[p.id] = p.score; rk[p.id] = i + 1; });
  const res = {}; if (g.ph === 'qr' && g.res) Object.keys(g.res).forEach(id => { res[id] = { ok: g.res[id].ok ? 1 : 0, gain: g.res[id].gain }; });
  return { id: g.id, ph: g.ph, title: g.title, acc: g.acc, code: g.code || '', mode: g.mode, bz: g.bz, rt: R.t, rlab: rLabel(R), cat: g.cur && board ? R.cats[g.cur.ci].n : '', v: curV(g), act: qq[0] || '', q: qq, wr: g.wr, by: g.by || '', a: g.ph === 'ans' && q ? q.a : '', sc, rk, n: Object.keys(g.players).length, full: Object.keys(g.players).length >= g.cap ? 1 : 0, rn: R.n, qz: board ? null : qqPub(g, true), res };
}
function netPush() {
  if (!G || !NET.ok || !G.netOn) return;
  const s = JSON.stringify(scrOf(G)), c = JSON.stringify(coreOf(G));
  if (s !== lastScr) { lastScr = s; gref(G.id, 'scr').set(JSON.parse(s)).catch(() => {}); }
  if (c !== lastCore) { lastCore = c; gref(G.id, 'core').set(JSON.parse(c)).catch(() => {}); }
}
async function allocCode(gid) {
  for (let i = 0; i < 8; i++) {
    const c = String(100000 + Math.floor(Math.random() * 900000));
    try { const r = await ref('codes/' + c).transaction(cur => cur ? undefined : { g: gid, t: Date.now(), k: 'svoya' }); if (r.committed) return c; } catch (e) {}
  }
  return '';
}
function attachNet() {
  hostOff.forEach(f => f()); hostOff = [];
  const gid = G.id, jr = gref(gid, 'join'), ar = gref(gid, 'ans'), orf = gref(gid, 'on');
  const onJ = x => {
    if (!G || G.id !== gid) return; const id = x.key, v = x.val() || {}; const nm = String(v.name || '').trim().slice(0, 24) || 'Команда';
    if (G.players[id]) { if (G.players[id].name !== nm && !G.players[id].ren) { G.players[id].name = nm; publish(); } return; }
    if (Object.keys(G.players).length >= G.cap) { publish(); return; }
    G.players[id] = { id, name: nm, score: 0 }; publish();
  };
  const onA = x => { ANS = x.val() || {}; if (G && (G.ph === 'q' || G.ph === 'qq')) publish(); };
  const onO = x => { const was = soundHere(); ONLINE = x.val() || {}; if (G && VIEW === 'host') { renderLive(); if (was !== soundHere()) renderLive(true); } };
  jr.on('child_added', onJ); jr.on('child_changed', onJ); ar.on('value', onA); orf.on('value', onO);
  hostOff.push(() => { jr.off(); ar.off(); orf.off(); });
}
async function startNet() {
  const ok = await netReady; if (!ok || !G) return;
  const gid = G.id;
  try {
    const m = (await gref(gid, 'meta').once('value')).val();
    if (!m || m.host !== NET.uid) await gref(gid, 'meta').set({ host: NET.uid, t: TS() });
    if (!G || G.id !== gid) return;
    G.netOn = true; attachNet(); lastScr = ''; lastCore = ''; netPush(); try { uploadMedia(gid); } catch (e) { console.warn('svoya media', e); }
    if (G.code) { const c = (await ref('codes/' + G.code).once('value')).val(); if (c && c.g === gid) { ls('set', KEY_LAST, { gid, code: G.code }); return; } }
    const code = await allocCode(gid);
    if (G && G.id === gid && code) { G.code = code; ls('set', KEY_LAST, { gid, code }); publish(); }
  } catch (e) { console.warn('svoya net', e); }
}
/* файлы с этого ноутбука — в игру, чтобы их видел экран на другом устройстве */
function uploadMedia(gid) {
  const ids = new Set(); G.rounds.forEach(r => (r.t === 'quiz' ? r.qs : [].concat(...(r.cats || []).map(c => c.qs))).forEach(q => [q.qm, q.am].forEach(m => { if (m && m.src && m.src.slice(0, 2) === 'f:') ids.add(m.src); })));
  [...ids].reduce((pr, id) => pr.then(() => MEDIA.get(id).then(b => {
    if (!b || b.size > 9e6 || !G || G.id !== gid) return;
    return new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(''); fr.readAsDataURL(b); })
      .then(d => d && gref(gid, 'img/' + id.slice(2)).set({ s: d }).catch(e => console.warn('svoya media', e)));
  })), Promise.resolve()).catch(() => {});
}
function endNet() {
  hostOff.forEach(f => f()); hostOff = [];
  const last = ls('get', KEY_LAST); ls('del', KEY_LAST);
  if (NET.ok && last && last.gid) { if (last.code) ref('codes/' + last.code).remove().catch(() => {}); gref(last.gid).remove().catch(() => {}); }
}
const netScr = () => Object.keys(ONLINE).some(k => ONLINE[k] === 'scr');
const onlineN = () => Object.keys(ONLINE).filter(k => ONLINE[k] !== 'scr').length;
const soundHere = () => !!(G && G.snd !== false && !netScr());

/* ================= отрисовка экрана (общая: проектор и превью у ведущего) ================= */
/* таймеры (экран, телефон, пульт): элементы с data-t1 */
function tickTimers() {
  document.querySelectorAll('[data-t1]').forEach(el => {
    const t1 = +el.dataset.t1, t0 = +el.dataset.t0 || t1 - 30000, left = Math.max(0, t1 - now()), sec = Math.ceil(left / 1000);
    const b = el.querySelector('b'); if (b) b.textContent = sec;
    const pr = el.querySelector('.pr'); if (pr) { const L = 2 * Math.PI * 19; pr.style.strokeDasharray = L; pr.style.strokeDashoffset = L * (1 - left / Math.max(1, t1 - t0)); }
    const bar = el.querySelector('i'); if (bar && el.classList.contains('tbar')) bar.style.width = (left / Math.max(1, t1 - t0) * 100) + '%';
    el.classList.toggle('low', sec <= 5);
  });
}
setInterval(tickTimers, 200);
function fitText(el, box, min = .45) {
  if (!el || !box) return; let k = 1; el.style.fontSize = '';
  const go = () => { let n = 0; while ((box.scrollHeight > box.clientHeight + 2 || box.scrollWidth > box.clientWidth + 2) && k > min && n++ < 40) { k -= .05; el.style.fontSize = k.toFixed(2) + 'em'; } };
  go(); requestAnimationFrame(go); if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
}
/* логотип сверху слева; вместо него — код игры; поверх всего — большой QR */
function stageChrome(root, S) {
  const cm = root.querySelector('.codem'), qo = root.querySelector('.qrov'), br = root.querySelector('.brandm'); if (!cm) return;
  const showCode = !!(S && S.qrz && S.code && S.ph !== 'lobby'), showQr = !!(S && S.qrb && S.ph !== 'lobby');
  cm.classList.toggle('on', showCode); br.classList.toggle('off', showCode);
  const ch = showCode ? `${esc(SHORT)} · код <b>${fmtCode(S.code)}</b>` : ''; if (cm._h !== ch) { cm._h = ch; cm.innerHTML = ch; }
  qo.classList.toggle('on', showQr);
  const qk = showQr ? S.id + S.code : ''; if (qo._k !== qk) { qo._k = qk; qo.innerHTML = showQr ? `<div class="joinc"><div class="qr"></div><div class="u">${esc(SHORT)}</div><small>код игры</small><div class="cd">${S.code ? fmtCode(S.code) : '······'}</div></div>` : ''; if (showQr) qr(qo.querySelector('.qr'), `${location.origin}${location.pathname}?view=play&g=${S.id}`, 600); }
}
function drawStage(root, S, snd) {
  if (!root) return;
  root.style.setProperty('--acc', S && S.acc ? S.acc : DEF_ACC);
  let inn = root.querySelector('.in'); if (!inn) { root.innerHTML = `<div class="in"></div><div class="codem"></div><div class="qrov"></div><div class="brandm">${window.PB_BRAND ? `${PB_BRAND.mark(30)}<img src="${PB_BRAND.base}wordmark-white.png" alt="Beloglazov Event">` : '<b>Beloglazov Event</b>'}</div>`; inn = root.querySelector('.in'); }
  if (!S) { root._k = ''; inn.innerHTML = '<div class="splash"><div class="cat" style="opacity:.6">Ждём игру…</div></div>'; return; }
  const ov = S.ov === 'scores' && S.ph !== 'final' && S.ph !== 'lobby';
  const k = [ov ? 'sc' : S.ph, S.ri, S.cur ? S.cur.ci + '.' + S.cur.qi : ''].join('|');
  stageChrome(root, S);
  root.classList.toggle('musq', !!(S && S.ph === 'q' && S.cur && S.cur.mus && S.ov !== 'scores'));
  const same = root._k === k; root._k = k;
  const mute = !!snd;
  if (ov) { inn.innerHTML = scoresHtml(S, 'Счёт'); return; }
  if (S.ph === 'lobby') {
    if (same) { const t = inn.querySelector('.teams'); if (t) t.innerHTML = teamsHtml(S); const cd = inn.querySelector('.joinc .cd'); if (cd) cd.textContent = S.code ? fmtCode(S.code) : '······'; return; }
    inn.innerHTML = `<div class="lob"><div><div class="kk">Подключайтесь по QR-коду</div><h1>${esc(S.title)}</h1><div class="teams">${teamsHtml(S)}</div></div>` +
      (MIX ? '' : `<div class="joinc"><div class="qr" id="sqr"></div><div class="u">${esc(SHORT.replace(/^https?:\/\//, ''))}</div><small>код игры</small><div class="cd">${S.code ? fmtCode(S.code) : '······'}</div></div>`) + `</div>`;
    if (!MIX) qr(inn.querySelector('#sqr'), `${location.origin}${location.pathname}?view=play&g=${S.id}`, 600);
    return;
  }
  if (S.ph === 'board') {
    const n = S.vals.length;
    const bd = `<div class="rnd"><b>${esc(S.rn)}</b></div>` +
      `<div class="board" style="grid-template-rows:repeat(${S.cats.length},minmax(0,1fr))">` + S.cats.map((c, ci) => `<div class="r" style="grid-template-columns:1.5fr repeat(${n},minmax(0,1fr))"><div class="c">${esc(c)}</div>` +
        S.vals.map((v, qi) => { const st = S.grid[ci] ? S.grid[ci][qi] : 2; return `<div class="v${st ? ' pl' : ''}">${st === 2 ? '' : esc(v)}</div>`; }).join('') + '</div>').join('') + '</div>';
    inn.innerHTML = bd; return;
  }
  if (S.ph === 'cell' && S.cur) { if (!same) inn.innerHTML = `<div class="splash"><div class="cat">${esc(S.cur.cat)}</div><div class="val">${esc(S.cur.v)}</div>${S.cur.mus ? `<div class="plb">${ico('play', 34)}</div>` : ''}</div>`; return; }
  if (S.ph === 'q' && S.cur && S.cur.mus) {
    const c = S.cur;
    if (!same) {
      inn.innerHTML = `<div class="spk"><i class="c1"></i><i class="c2"></i><i class="c3"></i><b class="r r1"></b><b class="r r2"></b><b class="r r3"></b></div><div class="splash mus"><div class="cat">${esc(c.cat)}</div><div class="val">${esc(c.v)}</div></div><div class="qm aud hid" id="qm"></div><div class="qfoot" id="qf"></div>`;
      const m = inn.querySelector('#qm'); mountMedia(m, c.qm, mute, S.id); m._mr = S.mr; m._snd = mute; m._pz = false;
    }
    const m = inn.querySelector('#qm'), sp = inn.querySelector('.splash');
    if (m && m._mr !== S.mr) { m._mr = S.mr; mountMedia(m, c.qm, mute, S.id); m._snd = mute; m._pz = false; }
    else if (m && m._snd !== mute) { m._snd = mute; setMute(m, mute); }
    const pz = !!S.act || !!S.hp;
    if (m && m._pz !== pz) { m._pz = pz; pz ? pauseMedia(m) : playMedia(m); if (S.act && pz && mute) SFX.buzz(); }
    if (sp) sp.classList.toggle('paused', pz); { const k2 = inn.querySelector('.spk'); if (k2) k2.classList.toggle('paused', pz); }
    const f = inn.querySelector('#qf');
    const fh = S.act ? `<span class="bzp"><i>${ico('bolt')}</i>${esc(S.act)}</span>${S.qn.length ? `<span class="bzq">дальше: ${S.qn.map(esc).join(', ')}</span>` : ''}` :
''; 
    if (f && f._h !== fh) { f._h = fh; f.innerHTML = fh; }
    return;
  }
  if (S.ph === 'q' && S.cur) {
    const c = S.cur, hasM = !!c.qm;
    if (!same) {
      inn.innerHTML = `<div class="qtop"><span class="chip2">${esc(c.cat)}</span><span class="vv">${esc(c.v)}</span><span class="sp"></span></div>` +
        `<div class="qmain${hasM ? ' hasm' : ''}${c.q.trim() ? '' : ' noq'}"><div class="qtx"><p>${esc(c.q)}</p></div>${hasM ? '<div class="qm" id="qm"></div>' : ''}</div><div class="qfoot" id="qf"></div>`;
      if (hasM) { const m = inn.querySelector('#qm'); mountMedia(m, c.qm, mute, S.id); m._mr = S.mr; m._snd = mute; }
      fitText(inn.querySelector('.qtx p'), inn.querySelector('.qtx'));
    } else if (hasM && c.qm.k !== 'image') {
      const m = inn.querySelector('#qm');
      if (m && m._mr !== S.mr) { m._mr = S.mr; mountMedia(m, c.qm, mute, S.id); m._snd = mute; }
      else if (m && m._snd !== mute) { m._snd = mute; setMute(m, mute); }
    }
    const f = inn.querySelector('#qf');
    const fh = S.act ? `<span class="bzp"><i>${ico('bolt')}</i>${esc(S.act)}</span>${S.qn.length ? `<span class="bzq">дальше: ${S.qn.map(esc).join(', ')}</span>` : ''}` :
      S.mode === 'voice' ? `<span class="hintb">${ico('hand')}Поднимайте руку — отвечает тот, кто первый</span>` : `<span class="hintb">${ico('phone')}${S.wr ? 'Кто ещё знает? Жмите «Ответить!»' : 'Знаете ответ? Жмите «Ответить!» на телефоне'}</span>`;
    if (f && f._h !== fh) { if (S.act && !f._act && mute) SFX.buzz(); f._act = !!S.act; f._h = fh; f.innerHTML = fh; }
    { const m = inn.querySelector('#qm'); if (m && c.qm && c.qm.k !== 'image') { const pz = !!S.act || !!S.hp; if (m._pz !== pz) { m._pz = pz; pz ? pauseMedia(m) : playMedia(m); } } }
    return;
  }
  if (S.ph === 'ans' && S.cur) {
    const c = S.cur, am = c.am, vis = am && am.k !== 'audio';
    if (!same) {
      inn.innerHTML = `<div class="qtop"><span class="chip2">${esc(c.cat)}</span><span class="vv">${esc(c.v)}</span></div><div class="ansv${vis ? ' wm' : ''}">${ansHtml(c.a)}` +
        (vis ? '<div class="qm amv" id="am"></div>' : '') + `<div id="gw"></div></div>${am && !vis ? '<div class="qm aud" id="am" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden"></div>' : ''}`;
      if (am) { const m = inn.querySelector('#am'); mountMedia(m, am, mute, S.id); m._mr = S.mr; m._snd = mute; }
      { const ae = inn.querySelector('.ansv .a'); if (ae) { ae.style.fontSize = ''; const fit = () => { let k = 1; ae.style.fontSize = ''; while (ae.scrollWidth > ae.clientWidth + 1 && k > .3) { k -= .04; ae.style.fontSize = (4.6 * k).toFixed(2) + 'em'; } }; fit(); requestAnimationFrame(fit); if (document.fonts) document.fonts.ready.then(fit); } }
    } else if (am) {
      const m = inn.querySelector('#am');
      if (m && m._mr !== S.mr && am.k !== 'image') { m._mr = S.mr; mountMedia(m, am, mute, S.id); m._snd = mute; } else if (m && m._snd !== mute) { m._snd = mute; setMute(m, mute); }
    }
    { const m = inn.querySelector('#am'); if (m && am && am.k !== 'image') { const pz = !!S.hp; if (!!m._pz !== pz) { m._pz = pz; pz ? pauseMedia(m) : playMedia(m); } } }
    const gw = inn.querySelector('#gw'), gh = S.by ? `<span class="gain">+${nums(S.gain)} · ${esc(S.by)}</span>` : `<span class="gain no sm">без очков</span>`;
    if (gw && gw._h !== gh) { gw._h = gh; gw.innerHTML = gh; }
    return;
  }
  if (S.ph === 'rintro') { if (!same) inn.innerHTML = `<div class="splash"><div class="rk">Раунд ${S.ri + 1} · ${esc(S.rlab)}</div><div class="cat big">${esc(S.rn)}</div><div class="rk2">${S.rcount} ${plural(S.rcount, 'вопрос', 'вопроса', 'вопросов')}</div></div>`; return; }
  if ((S.ph === 'qq' || S.ph === 'qr') && S.qz) {
    const z = S.qz, rev = S.ph === 'qr', hasM = !!z.qm, k2 = k + '|' + z.i + '|' + S.ph;
    const same2 = root._k2 === k2; root._k2 = k2;
    if (!same2) {
      const tiles = z.type === 'abcd' ? `<div class="qtiles n${z.opts.length}">${z.opts.map((o, x) => `<div class="qtile c${x % 4}${rev ? (o.j === z.ok ? ' ok' : ' no') : ''}"><span class="l">${'ABCDEF'[x]}</span><span class="t">${esc(o.t)}</span>${rev ? `<span class="n">${(z.cnt && z.cnt[o.j]) || 0}</span>` : ''}</div>`).join('')}</div>` : '';
      const rv = rev && z.type !== 'abcd' ? `<div class="qrv"><div class="lb">Правильный ответ</div><div class="a">${esc(z.ans)}</div></div>` : '';
      const win = rev ? `<div class="wins">${(z.res || []).filter(r => r.gain > 0).slice(0, 8).map(r => `<span class="gain">+${nums(r.gain)} · ${esc(r.n)}</span>`).join('') || '<span class="gain no">Никто не угадал</span>'}</div>` : '';
      const am = rev && z.am;
      inn.innerHTML = `<div class="qtop"><span class="chip2">${esc(S.rn)}</span><span class="chip2">Вопрос ${z.i} из ${z.n}</span><span class="vv">${nums(z.pts)}</span>${z.fast ? `<span class="chip2">${ico('bolt', 14)} кто быстрее</span>` : ''}<span class="sp"></span>${rev ? '' : `<span class="tring" data-t1="${z.t1}" data-t0="${z.t0}"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="pr" cx="22" cy="22" r="19"/></svg><b></b></span>`}</div>` +
        `<div class="qmain${hasM && !(rev && am) ? ' hasm' : ''}${rev && z.type !== 'abcd' ? ' rv' : ''}"><div class="qtx">${rev && z.type !== 'abcd' ? rv : `<p>${esc(z.q)}</p>`}</div>${am ? '<div class="qm" id="am"></div>' : hasM ? '<div class="qm" id="qm"></div>' : ''}</div>` +
        tiles + (rev ? win : `<div class="qfoot"><span class="hintb" id="qna">${ico(z.type === 'abcd' ? 'phone' : 'pencil')}${z.type === 'abcd' ? 'Выберите вариант на телефоне' : z.type === 'num' ? 'Введите число на телефоне' + (z.unit ? ' (' + esc(z.unit) + ')' : '') : 'Напишите ответ на телефоне'}</span></div>`);
      const mb = inn.querySelector('#am') || inn.querySelector('#qm'), mm = am ? z.am : z.qm;
      if (mb && mm) { mountMedia(mb, mm, mute, S.id); mb._mr = S.mr; mb._snd = mute; }
      const pp = inn.querySelector('.qtx p'); if (pp) fitText(pp, inn.querySelector('.qtx'));
      tickTimers();
    } else {
      const mb = inn.querySelector('#am') || inn.querySelector('#qm'), mm = rev && z.am ? z.am : z.qm;
      if (mb && mm && mm.k !== 'image' && mb._mr !== S.mr) { mb._mr = S.mr; mountMedia(mb, mm, mute, S.id); mb._snd = mute; } else if (mb && mb._snd !== mute) { mb._snd = mute; setMute(mb, mute); }
    }
    const na = inn.querySelector('#qna'); if (na && !rev) { const t = `Ответили ${z.na} из ${z.np}`; let e = inn.querySelector('#qnc'); if (!e) { e = document.createElement('span'); e.id = 'qnc'; e.className = 'bzq'; na.parentNode.appendChild(e); } e.textContent = t; }
    return;
  }
  if (S.ph === 'final') { if (!same) inn.innerHTML = finalHtml(S); return; }
  inn.innerHTML = '';
}
/* Firebase не хранит пустые массивы — восстанавливаем */
function fixS(S) { if (!S) return S; ['players', 'qn', 'cats', 'vals'].forEach(k => { if (!Array.isArray(S[k])) S[k] = S[k] ? Object.values(S[k]) : []; }); if (!Array.isArray(S.grid)) S.grid = S.grid ? Object.values(S.grid) : []; S.grid = S.grid.map(r => Array.isArray(r) ? r : r ? Object.values(r) : []); return S; }
/* «Исполнитель — «Песня»» → крупно песня, под ней исполнитель */
function ansHtml(a) {
  a = String(a || '—'); const m = a.split(/\s+[—–-]\s+/);
  if (m.length >= 2 && m[0].trim() && m.slice(1).join(' — ').trim()) { const t = m.slice(1).join(' — ').trim().replace(/^[«"“]|[»"”]$/g, ''); return `<div class="a">${esc(t)}</div><div class="who">${esc(m[0].trim())}</div>`; }
  return `<div class="a">${esc(a)}</div>`;
}
const teamsHtml = S => S.players.length ? S.players.map(p => `<span>${esc(p.n)}</span>`).join('') : '<span class="ph">Команды появятся здесь</span>';
function scoresHtml(S, t) {
  const l = S.players.slice(0, 10);
  return `<div class="scv"><h2>${esc(t)}</h2><div class="scl">${l.length ? l.map((p, i) => `<div class="scr${i === 0 && p.s > 0 ? ' top1' : ''}" style="animation-delay:${i * 70}ms"><span class="p">${i + 1}</span><span class="n">${esc(p.n)}</span><span class="s">${nums(p.s)}</span></div>`).join('') : '<div class="hintb">Команд пока нет</div>'}</div></div>`;
}
function finalHtml(S) {
  const t = S.players.slice(0, 3), o = [t[1], t[0], t[2]], h = [62, 88, 44], pl = [2, 1, 3];
  return `<div class="fin"><h1>Победители</h1><div class="pod">${o.map((p, i) => p ? `<div class="${pl[i] === 1 ? 'w' : ''}"><div class="nm">${esc(p.n)}</div><div class="sc">${nums(p.s)}</div><div class="bl" style="height:${h[i]}%;animation-delay:${[.6, 1.2, 0][i]}s">${pl[i]}</div></div>` : '<div></div>').join('')}</div></div>`;
}

/* ================= ведущий: редактор ================= */
let SEL = { r: 0, c: -1, q: -1 };
function renderTop() {
  const a = $('acc'); if (!a) return;
  if (!ACC.token) a.innerHTML = '<span class="tag">Демо</span><button class="btn gold sm" id="bLogin">Войти</button>';
  else if (!ACC.info) a.innerHTML = ACC.loading ? '<span class="tag">…</span>' : `<span class="tag">Демо</span><button class="btn ghost sm" id="bLogin" title="${esc(ACC.err)}">Войти заново</button>`;
  else if (window.PBAcct) { a.innerHTML = PBAcct.html(ACC.info, '<a href="../host/">Мои игры</a>'); PBAcct.bind(a); }
  else a.innerHTML = `<span class="tag">${esc(TIER[myTier()].n)}</span>`;
  if ($('bLogin')) $('bLogin').onclick = goLogin;
}
function renderEditor() {
  applyAcc(canColor() ? CFG.acc : DEF_ACC);
  if (!CFG.rounds[SEL.r]) SEL = { r: 0, c: -1, q: -1 };
  const R = CFG.rounds[SEL.r];
  const n = cellsOf(CFG), QZ = R.t === 'quiz', cats = QZ ? 0 : R.cats.length, N = QZ ? 0 : R.vals.length;
  const cols = `grid-template-columns:repeat(${N},minmax(0,1fr)) 52px`;
  $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND('Своя игра · редактор')}</a><span class="sp"></span><span class="muted" style="font-size:12px" id="syncSt"></span><div class="acc" id="acc"></div></div></div>` +
    `<div class="wrap wide"><div class="hero"><div class="k">Редактор</div><h1>Своя игра</h1><p>Табло «категории × стоимость» на проекторе. Ведущий открывает клетку, команды жмут «Ответить!» на телефонах — кто первый, тот отвечает. Верно — плюс очки, неверно — минус.</p><div class="hbtns"><button class="btn ghost sm" id="bSample">Открыть пример игры</button><button class="btn ghost sm" id="bBlank">Новая пустая игра</button></div></div>` +
    (!unlocked() ? `<div class="notice">${ico('lock')}<span><b>Демо:</b> всё работает, до ${DEMO_MAX} команд. Свой цвет оформления — на тарифе «Продвинутый».</span><span class="sp"></span>${ACC.token ? '' : '<button class="btn ghost sm" id="nLogin">Войти</button>'}</div>` : '') +
    `<div class="card"><div class="fld"><label for="fTitle">Название игры</label><input class="inp" id="fTitle" maxlength="60" value="${esc(CFG.title)}"></div></div>` +
    `<div class="card"><h3>${ico('grid', 16)}Табло</h3>` +
    `<div class="tabs" id="rTabs">${CFG.rounds.map((r, i) => `<div class="rtab${i === SEL.r ? ' on' : ''}"><button class="rn" data-r="${i}">${esc(r.n || 'Раунд ' + (i + 1))}</button>${CFG.rounds.length > 1 ? `<button class="rx" data-rdel="${i}" title="Удалить раунд" aria-label="Удалить раунд">${ico('x', 14)}</button>` : ''}</div>`).join('')}${CFG.rounds.length < 6 ? `<button class="tadd" data-r="add">${ico('plus', 14)}Раунд</button>` : ''}</div>` +
    `<div class="rhd"><div class="fld" style="flex:1;max-width:420px"><label for="fRn">Название раунда</label><input class="inp" id="fRn" maxlength="40" value="${esc(R.n)}"></div></div>` +
    (QZ ? quizEdHtml(R) : (
    `<div class="evl">Стоимость вопросов</div><div class="evals" style="${cols}">${R.vals.map((v, i) => `<div class="vh"><input class="inp" data-val="${i}" inputmode="numeric" value="${v}" aria-label="Стоимость ${i + 1}">${N > 1 ? `<button class="vx" data-vdel="${i}" title="Убрать столбец" aria-label="Убрать столбец">${ico('x', 12)}</button>` : ''}</div>`).join('')}<span></span></div>` +
    `<div class="ecats" id="eCats">${R.cats.map((c, ci) => `<div class="ecat" data-ci="${ci}"><div class="ech"><span class="grip cg" title="Перетащить категорию">${ico('grip', 16)}</span><label class="cbox"><small>Категория ${ci + 1}</small><input data-cn="${ci}" maxlength="40" placeholder="Название категории" value="${esc(c.n)}"></label>` +
      `<button class="icb del" data-cdel="${ci}" title="Удалить категорию"${cats < 2 ? ' disabled' : ''}>${ico('trash', 16)}</button></div>` +
      `<div class="eqs" style="${cols}">${c.qs.map((q, qi) => qCardHtml(R, q, ci, qi)).join('')}${N < MAXC ? `<button class="qadd" data-qadd="1" title="Добавить вопрос в каждую категорию" aria-label="Добавить вопрос">${ico('plus', 20)}</button>` : '<span></span>'}</div>` +
      (SEL.c === ci && c.qs[SEL.q] ? '<div id="qed"></div>' : '') + `</div>`).join('')}</div>` +
    `${cats < 8 ? `<button class="btn ghost sm" id="cAdd" style="margin-top:14px">${ico('plus', 14)}Категория</button>` : ''}`)) + `</div>` +
    `<div class="card"><h3>${ico('list', 16)}Правила</h3>` +
    `<div class="opt"><div class="tx"><b>Как команды отвечают</b><span>${CFG.mode === 'buzz' ? 'Кнопка «Ответить!» на телефоне — на экране видно, кто нажал первым' : 'Поднимают руку, ведущий сам начисляет очки нужной команде'}</span></div><div class="seg" id="mSeg"><button data-m="buzz" class="${CFG.mode === 'buzz' ? 'on' : ''}">${ico('phone', 15)}Кнопка на телефоне</button><button data-m="voice" class="${CFG.mode === 'voice' ? 'on' : ''}">${ico('hand', 15)}Голосом</button></div></div>` +
    `<div class="opt"><div class="tx"><b>Неправильный ответ</b><span>${CFG.minus ? 'Стоимость вопроса вычитается из счёта команды' : 'Очки не снимаются — просто ход переходит дальше'}</span></div><div class="seg" id="xSeg"><button data-x="1" class="${CFG.minus ? 'on' : ''}">${ico('minus', 15)}Минус за неправильный</button><button data-x="0" class="${CFG.minus ? '' : 'on'}">${ico('check', 15)}Без минусов</button></div></div>` +
    `<div class="opt${canColor() ? '' : ' locked'}"><div class="tx"><b>Цвет оформления${canColor() ? '' : ` <span class="lock">${ico('lock', 12)}Продвинутый</span>`}</b><span>Градиент табло, экрана и телефонов</span></div><div class="swatches" id="sw">${PAL.map(([c, nm]) => `<button style="background:${c}" data-acc="${c}" title="${nm}" class="${CFG.acc.toLowerCase() === c ? 'on' : ''}"></button>`).join('')}<label class="cpick" title="Свой цвет" style="background:${PAL.some(x => x[0] === CFG.acc.toLowerCase()) ? 'conic-gradient(#ff5f6d,#ffc371,#47e891,#3fa7ff,#a75cff,#ff5f6d)' : esc(CFG.acc)}"><input type="color" id="accC" value="${esc(CFG.acc)}"></label></div></div></div>` +
    `<div class="card"><h3>${ico('monitor', 16)}Так это выглядит на проекторе</h3><div class="stage stw" id="prev"></div></div>` +
    `</div><div class="bar"><div class="in"><div class="t"><b>${esc(CFG.title)}</b><span>${CFG.rounds.length} ${plural(CFG.rounds.length, 'раунд', 'раунда', 'раундов')} · ${n} ${plural(n, 'вопрос', 'вопроса', 'вопросов')} готово</span></div><button class="btn gold" id="bStart"${n ? '' : ' disabled'}>${ico('play', 16)}Запустить</button></div></div>`;
  renderTop();
  if ($('nLogin')) $('nLogin').onclick = goLogin;
  $('bSample').onclick = () => { if (!sureBtn($('bSample'))) return; CFG = normCfg(sampleCfg()); SEL = { r: 0, c: -1, q: -1 }; STORE.save(); renderEditor(); toast('Открыт пример — это новая игра, прежняя осталась в «Моих играх»'); };
  $('bBlank').onclick = () => { if (!sureBtn($('bBlank'))) return; CFG = normCfg({ title: 'Новая игра', rounds: [{ n: 'Раунд 1', vals: [100, 200, 300, 400, 500], cats: [0, 1, 2, 3, 4].map(() => ({ n: '', qs: [] })) }] }); SEL = { r: 0, c: -1, q: -1 }; STORE.save(); renderEditor(); };
  const prevS = () => QZ ? quizPrevS(R) : ({ id: 'x', ph: 'board', title: CFG.title, acc: canColor() ? CFG.acc : DEF_ACC, rn: R.n, ri: SEL.r, cats: R.cats.map(c => c.n || '—'), vals: R.vals, grid: R.cats.map(c => c.qs.map(q => validQ(q) ? 0 : 2)), players: [] });
  drawStage($('prev'), prevS(), false);
  const sv = () => STORE.save();
  $('fTitle').oninput = e => { CFG.title = e.target.value; sv(); };
  $('fRn').oninput = e => { R.n = e.target.value; sv(); const t = document.querySelector(`.rtab.on .rn`); if (t) t.textContent = R.n || 'Раунд ' + (SEL.r + 1); };
  $('fRn').onchange = () => drawStage($('prev'), prevS(), false);
  $('rTabs').onclick = e => {
    const x = e.target.closest('[data-rdel]');
    if (x) { const t = x.closest('.rtab'); if (!t.classList.contains('sure')) { document.querySelectorAll('.rtab.sure').forEach(z => { z.classList.remove('sure'); const xx = z.querySelector('.rx'); if (xx) xx.innerHTML = ico('x', 14); }); t.classList.add('sure'); x.innerHTML = 'Точно удалить?'; clearTimeout(t._t); t._t = setTimeout(() => { if (t.isConnected) { t.classList.remove('sure'); x.innerHTML = ico('x', 14); } }, 3000); return; } CFG.rounds.splice(+x.dataset.rdel, 1); SEL = { r: Math.min(SEL.r, CFG.rounds.length - 1), c: -1, q: -1 }; sv(); renderEditor(); toast('Раунд удалён'); return; }
    const b = e.target.closest('[data-r]'); if (!b) return;
    if (b.dataset.r === 'add' && !b._own) { addRoundPick(b); return; }
    if (b.dataset.r === 'add') { b._own = 0; const i = CFG.rounds.length, m = i + 1; CFG.rounds.push(normRound({ n: 'Раунд ' + m, vals: R.vals.map((v, j) => (j + 1) * 100 * m), cats: R.cats.map(() => ({ n: '', qs: [] })) }, i)); SEL = { r: i, c: -1, q: -1 }; sv(); renderEditor(); return; }
    SEL = { r: +b.dataset.r, c: -1, q: -1 };
    renderEditor();
  };
  document.querySelectorAll('[data-val]').forEach(i => { i.onchange = () => { R.vals[+i.dataset.val] = Math.max(0, Math.round(+i.value.replace(/\s/g, '') || 0)); sv(); renderEditor(); }; });
  document.querySelectorAll('[data-vdel]').forEach(b => { b.onclick = () => { if (!sureBtn(b)) return; const k = +b.dataset.vdel; R.vals.splice(k, 1); R.cats.forEach(c => c.qs.splice(k, 1)); SEL.c = -1; sv(); renderEditor(); }; });
  document.querySelectorAll('[data-qadd]').forEach(b => { b.onclick = () => { const last = R.vals[R.vals.length - 1] || 0, step = R.vals.length > 1 ? last - R.vals[R.vals.length - 2] : 100; R.vals.push(Math.max(0, last + (step > 0 ? step : 100))); R.cats.forEach(c => c.qs.push(blankQ())); const ci = +b.closest('.ecat').dataset.ci; SEL = { r: SEL.r, c: ci, q: R.vals.length - 1 }; sv(); renderEditor(); focusQ(); }; });
  document.querySelectorAll('[data-cn]').forEach(i => { i.oninput = () => { R.cats[+i.dataset.cn].n = i.value; sv(); const h = document.querySelector('.qed .hd .chip.a'); if (h && SEL.c === +i.dataset.cn) h.textContent = i.value || 'Категория ' + (SEL.c + 1); }; i.onchange = () => drawStage($('prev'), prevS(), false); });
  document.querySelectorAll('.qc2[data-c]').forEach(b => { b.onclick = () => { if (b._dragged) { b._dragged = false; return; } const c = +b.dataset.c, q = +b.dataset.q; SEL = SEL.c === c && SEL.q === q ? { r: SEL.r, c: -1, q: -1 } : { r: SEL.r, c, q }; renderEditor(); if (SEL.c >= 0) focusQ(); }; });
  document.querySelectorAll('[data-cdel]').forEach(b => { b.onclick = () => { if (R.cats.length < 2 || !sureBtn(b)) return; R.cats.splice(+b.dataset.cdel, 1); SEL.c = -1; sv(); renderEditor(); toast('Категория удалена'); }; });
  if ($('cAdd')) $('cAdd').onclick = () => { R.cats.push({ n: '', qs: R.vals.map(blankQ) }); sv(); renderEditor(); const ins = document.querySelectorAll('[data-cn]'); ins[ins.length - 1].focus(); };
  sortable($('eCats'), '.ecat', '.cg', (from, to) => { R.cats.splice(to, 0, R.cats.splice(from, 1)[0]); SEL.c = -1; sv(); renderEditor(); });
  document.querySelectorAll('.eqs').forEach(box => sortable(box, '.qc2', '.qc2', (from, to) => { const c = R.cats[+box.closest('.ecat').dataset.ci]; c.qs.splice(to, 0, c.qs.splice(from, 1)[0]); SEL.c = -1; sv(); renderEditor(); }, true));
  $('mSeg').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; CFG.mode = b.dataset.m; sv(); renderEditor(); };
  $('xSeg').onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; CFG.minus = b.dataset.x === '1'; sv(); renderEditor(); };
  if (canColor()) {
    $('sw').onclick = e => { const b = e.target.closest('[data-acc]'); if (!b) return; CFG.acc = b.dataset.acc; sv(); renderEditor(); };
    $('accC').oninput = e => { CFG.acc = e.target.value; applyAcc(CFG.acc); $('prev').style.setProperty('--acc', CFG.acc); e.target.parentNode.style.background = CFG.acc; };
    $('accC').onchange = () => { sv(); renderEditor(); };
  }
  $('bStart').onclick = () => { if (!cellsOf(CFG)) return; newGame(); window.scrollTo(0, 0); };
  if (QZ) bindQuizEd(R); else if ($('qed')) renderQEd(R);
}
function addRoundModal() {
  const card = k => `<button class="kc" data-nt="${k}"><span class="ka"><svg viewBox="0 0 108 64">${KART[k]}</svg></span><b>${KINDS[k].n}</b><small>${KINDS[k].d}</small><span class="kb">Добавить</span></button>`;
  modal(`<div class="kmod"><div class="kh"><h3>Добавить раунд</h3><button class="icb" data-close aria-label="Закрыть">${ico('x', 18)}</button></div>` +
    KGROUPS.map((g, gi) => `<div class="kg">${g}</div><div class="kgrid">${Object.keys(KINDS).filter(k => KINDS[k].g === gi).map(card).join('')}${gi === 2 ? SOON.map(([n, d]) => `<div class="kc soon"><span class="ka"><span class="sn">скоро</span></span><b>${n}</b><small>${d}</small></div>`).join('') : ''}</div>`).join('') + '</div>', b => {
    $('modal').classList.add('wide');
    b.querySelectorAll('[data-nt]').forEach(x => x.onclick = () => {
      const k = x.dataset.nt, K = KINDS[k], i = CFG.rounds.length, m = i + 1, last = CFG.rounds.filter(r => r.t === 'board').pop();
      let r;
      if (K.t === 'board') r = normRound({ n: 'Раунд ' + m + ' · ' + K.n, vals: (last ? last.vals : [100, 200, 300, 400, 500]).map((v, j) => (j + 1) * 100 * Math.max(1, CFG.rounds.filter(z => z.t === 'board').length + 1)), cats: (last ? last.cats : [0, 1, 2, 3, 4]).map(() => ({ n: '', qs: [] })) }, i);
      else r = normRound({ t: 'quiz', kind: k, n: 'Раунд ' + m + ' · ' + K.n, time: k === 'fast' ? 20 : 30, fast: K.fast || 0, change: K.change === 0 ? 0 : 1, qs: [Object.assign(blankQQ(), { type: K.qt })] }, i);
      CFG.rounds.push(r); SEL = { r: i, c: -1, q: -1, k: 0 }; STORE.save(); closeModal(); renderEditor(); toast('Раунд «' + K.n + '» добавлен');
    });
  });
}
/* ---------- редактор раунда «Квиз» ---------- */
function quizPrevS(R) {
  const v = validIdx(R), q = R.qs[SEL.k != null && R.qs[SEL.k] ? SEL.k : v[0] != null ? v[0] : 0];
  if (!q) return { id: 'x', ph: 'rintro', rn: R.n, ri: SEL.r, rlab: 'Квиз', rcount: 0, acc: canColor() ? CFG.acc : DEF_ACC, players: [] };
  return { id: 'x', ph: 'qq', rn: R.n, ri: SEL.r, rt: 'quiz', acc: canColor() ? CFG.acc : DEF_ACC, players: [], mr: 0, qz: { i: Math.max(1, v.indexOf(R.qs.indexOf(q)) + 1), n: Math.max(1, v.length), type: q.type, q: q.q || 'Текст вопроса', pts: q.pts, unit: q.unit, t0: 0, t1: 0, fast: R.fast, opts: q.type === 'abcd' ? q.opts.map((t, j) => ({ t: t || '…', j })).filter((x, j) => q.opts[j].trim() || j < 2) : [], qm: mOk(q.qm) && q.qm.k === 'image' ? q.qm : null, na: 0, np: 0 } };
}
function qqCardHtml(R, q, i) {
  const ok = validQQ(q), open = SEL.k === i, ic = [q.qm, q.am].filter(mOk).map(m => MK[m.k][0]);
  return `<div class="qq${open ? ' open' : ''}${ok ? '' : ' bad'}" data-i="${i}"><div class="qqh" data-qopen="${i}"><span class="grip qg" title="Перетащить вопрос">${ico('grip', 16)}</span><span class="qn">${i + 1}</span><span class="chip">${QT[q.type]}</span>` +
    `<span class="qtt">${esc(q.q.trim() || 'Новый вопрос')}</span>${[...new Set(ic)].map(k => `<span class="qic">${ico(k, 14)}</span>`).join('')}${ok ? '' : '<span class="chip warn">не заполнен</span>'}<span class="pts">${nums(q.pts)}</span>` +
    `<button class="icb del" data-qqdel="${i}" title="Удалить вопрос" aria-label="Удалить вопрос">${ico('trash', 16)}</button></div>${open ? '<div class="qqb" id="qqEd"></div>' : ''}</div>`;
}
function quizEdHtml(R) {
  const tm = [15, 30, 60];
  return `<div class="qset"><div class="opt"><div class="tx"><b>Время на ответ</b><span>Для всего раунда; у вопроса можно задать своё</span></div><div class="seg" id="qTime">${tm.map(t => `<button data-tm="${t}" class="${R.time === t ? 'on' : ''}">${t} сек</button>`).join('')}<label class="segin${tm.indexOf(R.time) < 0 ? ' on' : ''}"><input id="qTimeC" inputmode="numeric" value="${tm.indexOf(R.time) < 0 ? R.time : ''}" placeholder="своё"><span>сек</span></label></div></div>` +
    `<div class="opt"><div class="tx"><b>Режим</b><span>${R.fast ? 'Очки получает только самая быстрая команда с верным ответом' : 'Очки получают все команды, ответившие верно'}</span></div><div class="seg" id="qFast"><button data-f="0" class="${R.fast ? '' : 'on'}">${ico('users', 15)}Обычный</button><button data-f="1" class="${R.fast ? 'on' : ''}">${ico('bolt', 15)}Кто быстрее</button></div></div>` +
    `<div class="opt"><div class="tx"><b>Менять ответ</b><span>${R.change ? 'Команда может передумать до конца таймера' : 'Первый ответ окончательный — ответ откроется, как только ответят все'}</span></div><div class="seg" id="qChg"><button data-g="1" class="${R.change ? 'on' : ''}">Можно</button><button data-g="0" class="${R.change ? '' : 'on'}">Нельзя</button></div></div></div>` +
    `<div class="qlist" id="qList">${R.qs.map((q, i) => qqCardHtml(R, q, i)).join('')}</div>` +
    `<button class="btn ghost sm" id="qqAdd" style="margin-top:12px">${ico('plus', 14)}Вопрос</button>`;
}
function bindQuizEd(R) {
  const sv = () => STORE.save(), re = () => renderEditor();
  $('qTime').onclick = e => { const b = e.target.closest('[data-tm]'); if (!b) return; R.time = +b.dataset.tm; sv(); re(); };
  $('qTimeC').onchange = e => { const v = Math.round(+e.target.value); if (v >= 5) { R.time = Math.min(600, v); sv(); re(); } };
  $('qFast').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; R.fast = +b.dataset.f; sv(); re(); };
  $('qChg').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; R.change = +b.dataset.g; sv(); re(); };
  $('qqAdd').onclick = () => { const last = R.qs[R.qs.length - 1]; const q = blankQQ(); const K = KINDS[kindOf(R)]; if (last) { q.type = last.type; q.pts = last.pts; } else if (K.qt) q.type = K.qt; R.qs.push(q); SEL.k = R.qs.length - 1; sv(); re(); const el = $('qqEd'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); const t = $('kQ'); t && t.focus({ preventScroll: true }); } };
  document.querySelectorAll('[data-qopen]').forEach(h => h.onclick = e => { if (e.target.closest('.grip,[data-qqdel]')) return; const el = h.closest('.qq'); if (el._dragged) return; const i = +h.dataset.qopen; SEL.k = SEL.k === i ? -1 : i; re(); if (SEL.k >= 0) { const t = $('kQ'); t && t.focus({ preventScroll: true }); } });
  document.querySelectorAll('[data-qqdel]').forEach(b => b.onclick = e => { e.stopPropagation(); if (!sureBtn(b)) return; R.qs.splice(+b.dataset.qqdel, 1); SEL.k = -1; sv(); re(); toast('Вопрос удалён'); });
  sortable($('qList'), '.qq', '.qg', (from, to) => { R.qs.splice(to, 0, R.qs.splice(from, 1)[0]); SEL.k = -1; sv(); re(); });
  if (SEL.k >= 0 && R.qs[SEL.k] && $('qqEd')) renderQQEd(R, R.qs[SEL.k], SEL.k);
}
function renderQQEd(R, q, idx) {
  const el = $('qqEd'), L = 'ABCDEF';
  const ansHtml = q.type === 'abcd' ? `<div class="opts2">${q.opts.map((o, j) => `<div class="op${q.ok === j ? ' ok' : ''}"><label class="okr" title="Правильный вариант"><input type="radio" name="okr" value="${j}"${q.ok === j ? ' checked' : ''}><span>${ico('check', 14)}</span></label><span class="ol c${j % 4}">${L[j]}</span><input class="inp" data-op="${j}" maxlength="80" placeholder="Вариант ${L[j]}" value="${esc(o)}">${q.opts.length > 2 ? `<button class="icb" data-opdel="${j}" title="Убрать вариант" aria-label="Убрать вариант">${ico('x', 15)}</button>` : ''}</div>`).join('')}${q.opts.length < 6 ? `<button class="madd" id="opAdd">${ico('plus', 15)}Вариант</button>` : ''}<div class="hint">Отметьте галочкой правильный вариант</div></div>`
    : q.type === 'num' ? `<div class="row r2"><label class="tbox"><small>Правильное число</small><input id="kNum" inputmode="decimal" value="${q.num === '' ? '' : q.num}" placeholder="Например, 1961"></label><label class="tbox"><small>Единица · по желанию</small><input id="kUnit" maxlength="20" value="${esc(q.unit)}" placeholder="год, км, раз…"></label></div><div class="hint">Очки получает команда, чей ответ ближе всех</div>`
    : `<label class="tbox"><small>Правильные ответы</small><textarea id="kAcc" rows="2" maxlength="300" placeholder="Юпитер; Jupiter">${esc(q.acc)}</textarea></label><div class="hint">Несколько вариантов — через точку с запятой. Регистр, «ё» и знаки препинания не важны. На пульте можно засчитать ответ вручную.</div>`;
  el.innerHTML = `<div class="qqtop"><div class="seg" id="kType">${Object.keys(QT).map(t => `<button data-ty="${t}" class="${q.type === t ? 'on' : ''}">${t === 'abcd' ? ico('grid', 14) : t === 'num' ? '#' : ico('pencil', 14)}${QT[t]}</button>`).join('')}</div><span class="sp"></span>` +
    `<label class="mini"><span>Очки</span><input id="kPts" inputmode="numeric" value="${q.pts}"></label><label class="mini"><span>Время</span><input id="kTime" inputmode="numeric" value="${q.time || ''}" placeholder="${R.time}"><em>сек</em></label></div>` +
    `<div class="qcols"><div class="qside"><label class="tbox"><small>Вопрос</small><textarea id="kQ" rows="3" maxlength="300" placeholder="Текст вопроса">${esc(q.q)}</textarea></label><div class="mp" id="kQm"></div></div>` +
    `<div class="qside"><div class="lbl2">Ответ</div>${ansHtml}<div class="lbl2">Медиа к ответу <span class="hint">· покажем или включим вместе с ответом</span></div><div class="mp" id="kAm"></div></div></div>` +
    `<div class="qft"><button class="btn ghost sm" id="kClr">${ico('trash', 14)}Очистить</button><span class="sp"></span><button class="btn ghost sm" id="kClose">Свернуть</button></div>`;
  const head = () => { const c = document.querySelector(`.qq[data-i="${idx}"]`); if (!c) return; const t = c.querySelector('.qtt'); if (t) t.textContent = q.q.trim() || 'Новый вопрос'; const p = c.querySelector('.pts'); if (p) p.textContent = nums(q.pts); c.classList.toggle('bad', !validQQ(q)); const w = c.querySelector('.chip.warn'); if (validQQ(q) && w) w.remove(); };
  const sv = () => { STORE.save(); head(); }, re = () => { STORE.save(); renderEditor(); };
  $('kType').onclick = e => { const b = e.target.closest('[data-ty]'); if (!b) return; q.type = b.dataset.ty; re(); };
  $('kPts').onchange = e => { q.pts = Math.max(0, Math.round(+e.target.value.replace(/\s/g, '') || 0)); sv(); };
  $('kTime').onchange = e => { const v = Math.round(+e.target.value); q.time = v >= 5 ? Math.min(600, v) : 0; e.target.value = q.time || ''; sv(); };
  $('kQ').oninput = e => { q.q = e.target.value; sv(); };
  el.querySelectorAll('[data-op]').forEach(i => i.oninput = () => { q.opts[+i.dataset.op] = i.value; sv(); });
  el.querySelectorAll('input[name="okr"]').forEach(r => r.onchange = () => { q.ok = +r.value; el.querySelectorAll('.op').forEach((o, j) => o.classList.toggle('ok', j === q.ok)); sv(); });
  el.querySelectorAll('[data-opdel]').forEach(b => b.onclick = () => { const j = +b.dataset.opdel; q.opts.splice(j, 1); if (q.ok >= q.opts.length) q.ok = 0; else if (q.ok > j) q.ok--; re(); });
  if ($('opAdd')) $('opAdd').onclick = () => { q.opts.push(''); re(); const ins = el.querySelectorAll('[data-op]'); ins[ins.length - 1].focus(); };
  if ($('kNum')) $('kNum').oninput = e => { const v = e.target.value.replace(/\s/g, '').replace(',', '.'); q.num = v === '' || !isFinite(+v) ? '' : +v; sv(); };
  if ($('kUnit')) $('kUnit').oninput = e => { q.unit = e.target.value; sv(); };
  if ($('kAcc')) $('kAcc').oninput = e => { q.acc = e.target.value; sv(); };
  mediaPanel($('kQm'), q, 'qm', sv); mediaPanel($('kAm'), q, 'am', sv);
  $('kClose').onclick = () => { SEL.k = -1; renderEditor(); };
  $('kClr').onclick = () => { if (!sureBtn($('kClr'))) return; R.qs[idx] = Object.assign(blankQQ(), { type: q.type, pts: q.pts }); re(); };
}
const OTHER = [['quiz', 'Квиз о паре', '💍❓', '#c27078'], ['fact', 'Интересный факт', '💡🙋', '#d9a441'], ['bingo', 'Человеческое бинго', '🎯✅', '#6f9fc6'], ['sm', 'Секретная миссия', '🕶️💌', '#a7ae86']];
function addRoundPick(btn) {
  modal(`<div class="kmod"><div class="kh"><h3>Добавить раунд</h3><button class="icb" data-close aria-label="Закрыть">${ico('x', 18)}</button></div><div class="kgrid">` +
    `<button class="kc" data-own="1"><span class="ka"><svg viewBox="0 0 108 64">${KART.board}</svg></span><b>Своя игра</b><small>Ещё одно табло в этой игре</small><span class="kb">Добавить</span></button>` +
    OTHER.map(([k, n, em, c]) => `<button class="kc" data-mix="${k}"><span class="ka" style="background:linear-gradient(135deg,${c}aa,${c}22);font-size:38px;letter-spacing:4px">${em}</span><b>${n}</b><small>Соберём игру-микс: эта игра + ${n}</small><span class="kb">Добавить</span></button>`).join('') + '</div></div>', b => {
    $('modal').classList.add('wide');
    b.querySelector('[data-own]').onclick = () => { closeModal(); btn._own = 1; btn.click(); };
    b.querySelectorAll('[data-mix]').forEach(x => x.onclick = () => {
      if (!wsKey()) { toast('Войдите, чтобы собрать игру-микс'); setTimeout(goLogin, 1200); return; }
      STORE.push(); setTimeout(() => { location.href = '../mix/?from=svoya:' + encodeURIComponent(CFG.id) + '&pick=' + x.dataset.mix; }, 700);
    });
  });
}
function focusQ() { const el = $('qed'); if (!el) return; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); const t = $('qQ'); if (t) t.focus({ preventScroll: true }); }
function qCardHtml(R, q, ci, qi) {
  const ok = validQ(q), ic = [q.qm, q.am].filter(mOk).map(m => MK[m.k][0]);
  return `<button class="qc2${ok ? '' : ' emp'}${SEL.c === ci && SEL.q === qi ? ' sel' : ''}" data-c="${ci}" data-q="${qi}"><span class="qv">${esc(R.vals[qi])}</span>` +
    `<span class="qx">${ok ? esc(q.q.trim() || (q.a ? q.a : 'Вопрос без текста')) : 'Добавить вопрос'}</span>${ic.length ? `<span class="qi">${[...new Set(ic)].map(k => ico(k, 13)).join('')}</span>` : ''}</button>`;
}
/* подтверждение «Точно?» прямо на кнопке */
function sureBtn(b) {
  if (b.classList.contains('sure')) { b.classList.remove('sure'); return true; }
  document.querySelectorAll('.sure').forEach(x => { if (x !== b && x._o != null) { x.classList.remove('sure'); x.innerHTML = x._o; } });
  b._o = b.innerHTML; b.classList.add('sure'); b.innerHTML = 'Точно?';
  clearTimeout(b._t); b._t = setTimeout(() => { if (b.isConnected) { b.classList.remove('sure'); b.innerHTML = b._o; } }, 3000);
  return false;
}
function confirm2(el, txt) { if (el.classList.contains('sure')) { el.classList.remove('sure'); return true; } el._o = el.innerHTML; el.classList.add('sure'); el.textContent = txt; clearTimeout(el._t); el._t = setTimeout(() => { if (el.isConnected) { el.classList.remove('sure'); el.innerHTML = el._o; } }, 3000); return false; }
/* плавное перетаскивание: за ручку сразу, за карточку — после сдвига мышью или удержания пальцем */
function sortable(box, itemSel, handleSel, onMove, soft) {
  if (!box || box._sortable) return; box._sortable = true;
  box.addEventListener('pointerdown', e => {
    const h = e.target.closest(handleSel); if (!h || !box.contains(h) || (e.button && e.button !== 0)) return;
    const item = h.closest(itemSel); if (!item || item.parentNode !== box) return;
    if (!soft) e.preventDefault();
    const sx = e.clientX, sy = e.clientY, touch = e.pointerType === 'touch';
    let started = false, holdT = 0, ph = null, raf = 0, px = sx, py = sy, dx = 0, dy = 0, from = -1;
    const items = () => [...box.children].filter(el => el.matches(itemSel));
    const begin = () => {
      started = true; from = items().indexOf(item);
      const r = item.getBoundingClientRect(); dy = py - r.top; dx = px - r.left;
      ph = document.createElement('div'); ph.className = 'sort-ph'; ph.style.height = r.height + 'px'; ph.style.minWidth = '0';
      box.insertBefore(ph, item);
      Object.assign(item.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', zIndex: 60, pointerEvents: 'none', margin: 0 });
      item.classList.add('dragging'); document.body.classList.add('sorting');
      if (navigator.vibrate && touch) navigator.vibrate(15);
      try { h.setPointerCapture(e.pointerId); } catch (err) {}
      place();
    };
    const place = () => {
      item.style.top = (py - dy) + 'px'; item.style.left = (px - dx) + 'px';
      let best = null, bd = 1e9;
      [...box.children].filter(el => el === ph || (el !== item && el.matches(itemSel))).forEach(el => { const b = el.getBoundingClientRect(), d = Math.hypot(px - (b.left + b.width / 2), py - (b.top + b.height / 2)); if (d < bd) { bd = d; best = el; } });
      if (best && best !== ph) { const all = [...box.children]; if (all.indexOf(ph) < all.indexOf(best)) best.after(ph); else box.insertBefore(ph, best); }
    };
    const edge = () => { const z = 70; if (py < z) window.scrollBy(0, -14); else if (py > innerHeight - z) window.scrollBy(0, 14); else { raf = 0; return; } place(); raf = requestAnimationFrame(edge); };
    const move = ev => {
      px = ev.clientX; py = ev.clientY;
      if (!started) { const d = Math.hypot(px - sx, py - sy); if (touch) { if (d > 8) cleanup(); return; } if (d > 6) begin(); else return; }
      ev.preventDefault(); place(); if (!raf) raf = requestAnimationFrame(edge);
    };
    const cleanup = () => { clearTimeout(holdT); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', end); document.removeEventListener('pointercancel', end); if (raf) cancelAnimationFrame(raf); };
    const end = () => {
      cleanup(); if (!started) return;
      const to = [...box.children].filter(el => el === ph || (el !== item && el.matches(itemSel))).indexOf(ph);
      ph.replaceWith(item); item.removeAttribute('style'); item.classList.remove('dragging'); document.body.classList.remove('sorting');
      item._dragged = true; setTimeout(() => { item._dragged = false; }, 50);
      if (to >= 0 && to !== from) onMove(from, to);
    };
    if (touch && soft) holdT = setTimeout(begin, 320); else if (!soft) begin();
    document.addEventListener('pointermove', move, { passive: false }); document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  });
}
/* ---------- карточка вопроса: вопрос | ответ, у каждого своё медиа ---------- */
const WAVE = {};
function renderQEd(R) {
  const c = R.cats[SEL.c], q = c.qs[SEL.q], el = $('qed'); if (!el) return;
  const side = (k, lbl, ph) => `<div class="qside"><label class="tbox"><small>${lbl}</small><textarea id="q${k}" rows="3" maxlength="${k === 'Q' ? 300 : 160}" placeholder="${ph}">${esc(k === 'Q' ? q.q : q.a)}</textarea></label><div class="mp" id="mp${k}"></div></div>`;
  el.innerHTML = `<div class="qed"><div class="hd"><span class="chip a">${esc(c.n || 'Категория ' + (SEL.c + 1))}</span><span class="chip">${esc(R.vals[SEL.q])}</span><span class="sp"></span><button class="icb" id="qClose" title="Закрыть" aria-label="Закрыть">${ico('x', 18)}</button></div>` +
    `<div class="qcols">${side('Q', 'Вопрос', 'Текст вопроса — его увидят на экране')}${side('A', 'Ответ', 'Правильный ответ — на экране после ответа команды')}</div>` +
    `<div class="qft"><button class="btn ghost sm" id="qClr">${ico('trash', 14)}Очистить</button><span class="sp"></span><button class="btn ghost sm" id="qCl2">Закрыть</button></div></div>`;
  const sv = () => { STORE.save(); const b = document.querySelector(`.qc2[data-c="${SEL.c}"][data-q="${SEL.q}"]`); if (b) b.outerHTML = qCardHtml(R, q, SEL.c, SEL.q); bindCardsAgain(R); };
  $('qQ').oninput = e => { q.q = e.target.value; sv(); };
  $('qA').oninput = e => { q.a = e.target.value; sv(); };
  mediaPanel($('mpQ'), q, 'qm', sv);
  mediaPanel($('mpA'), q, 'am', sv);
  const close = () => { SEL.c = -1; renderEditor(); };
  $('qClose').onclick = close; $('qCl2').onclick = close;
  $('qClr').onclick = () => { if (!sureBtn($('qClr'))) return; c.qs[SEL.q] = blankQ(); STORE.save(); renderEditor(); focusQ(); };
}
function bindCardsAgain(R) {
  document.querySelectorAll('.qc2[data-c]').forEach(b => { if (b._bound) return; b._bound = 1; b.onclick = () => { if (b._dragged) { b._dragged = false; return; } const c = +b.dataset.c, q = +b.dataset.q; SEL = SEL.c === c && SEL.q === q ? { r: SEL.r, c: -1, q: -1 } : { r: SEL.r, c, q }; renderEditor(); if (SEL.c >= 0) focusQ(); }; });
}
function mediaPanel(box, q, key, sv) {
  const m = q[key];
  const stopPrev = () => { if (box._a) { box._a.pause(); box._a = null; } cancelAnimationFrame(box._raf); };
  const draw = () => {
    stopPrev();
    const has = mOk(m), yt = ytId(m.src), isF = m.src.slice(0, 2) === 'f:';
    if (!m.k && !m.src) {
      box.innerHTML = `<button class="madd" id="${key}Add">${ico('plus', 16)}Аудио, видео или картинка</button>`;
      box.querySelector('.madd').onclick = () => { m.k = 'audio'; draw(); };
      return;
    }
    const kinds = [['audio', 'Аудио'], ['video', 'Видео'], ['image', 'Картинка']];
    box.innerHTML = `<div class="mbox"><div class="mk"><div class="rad">${kinds.map(([k, l]) => `<label><input type="radio" name="${key}k" value="${k}"${m.k === k ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div><span class="sp"></span><button class="icb" data-mx title="Убрать медиа" aria-label="Убрать медиа">${ico('trash', 16)}</button></div>` +
      `<input class="inp msrc" placeholder="${m.k === 'image' ? 'Ссылка на картинку' : 'Ссылка: YouTube, mp3 или mp4'}" value="${isF ? '' : esc(m.src)}">` +
      `<div class="drop" tabindex="0">${ico('upload', 16)}<span>${isF ? 'Файл загружен · перетащите другой, чтобы заменить' : 'Перетащите файл или нажмите, чтобы выбрать'}</span><input type="file" accept="${m.k === 'image' ? 'image/*' : m.k === 'video' ? 'video/*' : 'audio/*,video/mp4'}" hidden></div>` +
      (has ? (m.k === 'image' ? `<div class="mimg"><img alt=""></div>` :
        `${yt ? `<div class="ytp" id="${key}Yt"><span>${ico('play', 14)}YouTube: волну не показываем, но можно задать время</span></div>` : '<div class="wave"><canvas></canvas><i class="ph"></i><div class="wmsg"></div></div>'}` +
        `<div class="mctl"><button class="rb" data-pl title="Прослушать" aria-label="Прослушать">${ico('play', 15)}</button><button class="rb" data-cut title="Закончить здесь" aria-label="Закончить здесь"${yt ? ' disabled' : ''}>${ico('scissors', 15)}</button>` +
        `<span class="tl2">Играть с</span><span class="tin"><input data-t="t0" value="${fmtT(m.t0)}" inputmode="numeric"><span class="ud"><button data-ud="t0:1" aria-label="Позже">${ico('up', 11)}</button><button data-ud="t0:-1" aria-label="Раньше">${ico('down', 11)}</button></span></span>` +
        `<span class="tl2">до</span><span class="tin"><input data-t="t1" value="${m.t1 ? fmtT(m.t1) : ''}" placeholder="конца" inputmode="numeric"><span class="ud"><button data-ud="t1:1" aria-label="Позже">${ico('up', 11)}</button><button data-ud="t1:-1" aria-label="Раньше">${ico('down', 11)}</button></span></span>` +
        `<label class="chk"><input type="checkbox" data-loop${m.loop ? ' checked' : ''}><span>Зациклить</span></label></div>`) : '') + `</div>`;
    box.querySelectorAll(`input[name="${key}k"]`).forEach(r => r.onchange = () => { m.k = r.value; sv(); draw(); });
    box.querySelector('[data-mx]').onclick = () => { q[key] = blankM(); sv(); mediaPanel(box, q, key, sv); };
    const src = box.querySelector('.msrc'); src.onchange = () => { m.src = src.value.trim(); if (m.src) { const g = guessKind(m.src); if (!ytId(m.src)) m.k = g; const st = ytStart(m.src); if (st && !m.t0) m.t0 = st; } sv(); draw(); };
    const dr = box.querySelector('.drop'), fi = dr.querySelector('input');
    const take = f => { if (!f) return; const k = /^image\//.test(f.type) ? 'image' : /^video\//.test(f.type) && m.k !== 'audio' ? 'video' : /^(audio|video)\//.test(f.type) ? (m.k === 'video' ? 'video' : 'audio') : ''; if (!k) { toast('Нужен аудио-, видеофайл или картинка'); return; } if (f.size > 40e6) { toast('Файл больше 40 МБ'); return; } dr.classList.add('busy'); (k === 'image' ? shrinkImg(f) : Promise.resolve(f)).then(b => MEDIA.put(b)).then(id => { m.src = id; m.k = k; m.t0 = 0; m.t1 = 0; sv(); draw(); toast('Файл загружен'); }); };
    dr.onclick = () => fi.click(); dr.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); } };
    fi.onchange = () => take(fi.files && fi.files[0]);
    dr.ondragover = e => { e.preventDefault(); dr.classList.add('on'); }; dr.ondragleave = () => dr.classList.remove('on');
    dr.ondrop = e => { e.preventDefault(); dr.classList.remove('on'); take(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); };
    if (!has) return;
    if (m.k === 'image') { resolveSrc(m.src).then(u => { const im = box.querySelector('.mimg img'); if (im && u) im.src = u; }); return; }
    const setT = (k, v) => { v = Math.max(0, Math.round(v * 10) / 10); if (k === 't1' && v && v <= m.t0) v = 0; m[k] = v; sv(); const i = box.querySelector(`[data-t="${k}"]`); if (i) i.value = k === 't1' && !v ? '' : fmtT(v); paintSel(); };
    box.querySelectorAll('[data-t]').forEach(i => i.onchange = () => setT(i.dataset.t, parseT(i.value)));
    box.querySelectorAll('[data-ud]').forEach(b => b.onclick = () => { const [k, d] = b.dataset.ud.split(':'); setT(k, (m[k] || (k === 't1' ? m.t0 : 0)) + +d); });
    box.querySelector('[data-loop]').onchange = e => { m.loop = e.target.checked ? 1 : 0; sv(); };
    const wv = box.querySelector('.wave'), cv = wv && wv.querySelector('canvas'), phl = wv && wv.querySelector('.ph');
    let dur = 0, peaks = null;
    const paintSel = () => {
      if (!cv || !peaks) return; const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, dpr = W / cv.clientWidth;
      ctx.clearRect(0, 0, W, H);
      const a = m.t0 / dur, b = m.t1 > m.t0 ? m.t1 / dur : 1, acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || DEF_ACC;
      const bw = Math.max(1, Math.floor(2 * dpr)), gap = Math.max(1, Math.floor(dpr)), nb = Math.floor(W / (bw + gap)), mid = (H - 18 * dpr) / 2;
      for (let i = 0; i < nb; i++) { const p = peaks[Math.floor(i / nb * peaks.length)] || 0, x = i * (bw + gap), f = x / W, h = Math.max(1, p * mid * .95); ctx.fillStyle = f >= a && f <= b ? acc : 'rgba(255,255,255,.28)'; ctx.fillRect(x, mid - h, bw, h * 2); }
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = `${10 * dpr}px Manrope,sans-serif`;
      const st = dur > 120 ? 30 : dur > 40 ? 10 : 5;
      for (let t = 0; t <= dur; t += st) { const x = t / dur * W; ctx.fillRect(x, H - 16 * dpr, Math.max(1, dpr), 6 * dpr); ctx.fillText(t < 60 ? String(t) : fmtT(t), x + 3 * dpr, H - 4 * dpr); }
    };
    if (wv) {
      const msg = wv.querySelector('.wmsg'); msg.textContent = 'Строим волну…';
      const key2 = m.src;
      const load = WAVE[key2] ? Promise.resolve(WAVE[key2]) : resolveSrc(m.src).then(u => fetch(u)).then(r => r.arrayBuffer()).then(ab => new (window.AudioContext || window.webkitAudioContext)().decodeAudioData(ab)).then(buf => {
        const d = buf.getChannelData(0), n = 900, step = Math.floor(d.length / n) || 1, pk = []; let mx = 0;
        for (let i = 0; i < n; i++) { let v = 0; for (let j = i * step; j < (i + 1) * step && j < d.length; j += 8) v = Math.max(v, Math.abs(d[j])); pk.push(v); mx = Math.max(mx, v); }
        return (WAVE[key2] = { peaks: pk.map(v => mx ? v / mx : 0), dur: buf.duration });
      });
      load.then(w => { if (!cv.isConnected) return; peaks = w.peaks; dur = w.dur; msg.textContent = ''; const dpr = devicePixelRatio || 1; cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; paintSel(); },
        () => { msg.textContent = 'Волну для этой ссылки не построить — время можно задать вручную'; });
      cv.onclick = e => { if (!dur) return; const r = cv.getBoundingClientRect(); setT('t0', (e.clientX - r.left) / r.width * dur); };
    }
    const pl = box.querySelector('[data-pl]');
    pl.onclick = () => {
      if (box._a || box._yt) { stopPrev(); if (box._yt) { box._yt.remove(); box._yt = null; } pl.innerHTML = ico('play', 15); if (phl) phl.style.display = 'none'; return; }
      const yt = ytId(m.src);
      if (yt) { const f = document.createElement('iframe'); f.className = 'ytprev'; f.allow = 'autoplay; encrypted-media'; f.src = `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&start=${Math.round(m.t0)}${m.t1 > m.t0 ? '&end=' + Math.round(m.t1) : ''}&rel=0&modestbranding=1`; box.querySelector('.ytp').appendChild(f); box._yt = f; pl.innerHTML = ico('pause', 15); return; }
      resolveSrc(m.src).then(u => {
        if (!u) return; const a = new Audio(u); box._a = a; pl.innerHTML = ico('pause', 15);
        a.addEventListener('loadedmetadata', () => { a.currentTime = m.t0 || 0; a.play().catch(() => {}); });
        const tick = () => { if (box._a !== a) return; if (m.t1 > m.t0 && a.currentTime >= m.t1) { if (m.loop) a.currentTime = m.t0; else { stopPrev(); pl.innerHTML = ico('play', 15); if (phl) phl.style.display = 'none'; return; } } if (phl && dur) { phl.style.display = 'block'; phl.style.left = (a.currentTime / dur * 100) + '%'; } box._raf = requestAnimationFrame(tick); };
        a.addEventListener('ended', () => { if (m.loop) { a.currentTime = m.t0 || 0; a.play(); } else { stopPrev(); pl.innerHTML = ico('play', 15); } });
        tick();
      });
    };
    box.querySelector('[data-cut]').onclick = () => { if (box._a) setT('t1', box._a.currentTime); else toast('Включите прослушивание и нажмите ✂ там, где закончить'); };
  };
  draw();
}

/* ================= ведущий: пульт ================= */
let liveBuilt = false;
function renderLive(force) {
  if (!G) return;
  applyAcc(G.acc);
  if (!liveBuilt || force) {
    liveBuilt = true;
    $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND(G.title && G.title !== 'Своя игра' ? 'Своя игра · ' + esc(G.title) : 'Своя игра · пульт')}</a><span class="sp"></span><button class="btn ghost sm" id="bScr">${ico('monitor', 15)}Экран для проектора</button><button class="btn ghost sm" id="bEnd">Завершить</button></div></div>` +
      `<div class="live"><div><button class="btn gold nextb" id="bNext"></button><div class="pane" id="ctl"></div></div>` +
      `<div><div class="stage stw" id="stg"></div><div class="pane" style="margin-top:14px"><h4>Команды <span class="sp"></span><span id="onl" class="muted" style="letter-spacing:0;text-transform:none;font-size:12px"></span><button class="btn ghost sm" id="bAdd">${ico('plus', 13)}Команда</button></h4><div class="tl" id="tl"></div>` +
      `<div class="codebox"><div><div class="k">Вход для команд</div><b id="cd"></b></div><span style="flex:1"></span><button class="btn ghost sm" id="bPh">${ico('phone', 14)}Открыть телефон</button></div></div></div></div>`;
    $('bScr').onclick = () => { if (!G.code && !G.netOn) { toast('Подключаемся к сети…'); return; } window.open(`${BASE}?view=screen&g=${G.id}`, 'pbs_screen'); };
    $('bPh').onclick = () => window.open(playLink(G), '_blank');
    $('bAdd').onclick = A.addTeam;
    $('bEnd').onclick = () => { if (!confirm2($('bEnd'), 'Точно завершить?')) return; endNet(); G = null; liveBuilt = false; ls('del', KEY_LIVE); renderEditor(); };
    $('bNext').onclick = () => nextAct()[1] && nextAct()[1]();
  }
  const [lbl, fn, sub] = nextAct();
  const nb = $('bNext'); nb.innerHTML = esc(lbl) + (sub ? `<small style="display:block;font-size:12px;font-weight:700;opacity:.7;margin-top:2px">${esc(sub)}</small>` : ''); nb.disabled = !fn; nb.style.display = isQuiz(G) || (fn && (G.ph === 'lobby' || G.ph === 'board')) ? 'block' : 'none';
  $('ctl').innerHTML = ctlHtml(); bindCtl();
  $('tl').innerHTML = teamsHostHtml(); bindTeams();
  $('cd').textContent = G.code ? `${SHORT} · ${fmtCode(G.code)}` : 'подключаемся…';
  const on = onlineN(); $('onl').textContent = G.netOn ? `на связи: ${on}` : '';
  drawStage($('stg'), scrOf(G), soundHere());
}
function nextAct() {
  if (!G) return ['', null];
  if (G.ph === 'lobby') return [`Начать игру → ${G.rounds[0].n}`, A.start, Object.keys(G.players).length ? `${Object.keys(G.players).length} ${plural(Object.keys(G.players).length, 'команда', 'команды', 'команд')} в игре` : 'команды подключаются по QR-коду на экране'];
  if (G.ph === 'board') { const l = roundLeft(G); return l ? ['Выберите вопрос на табло', null, `осталось ${l} ${plural(l, 'вопрос', 'вопроса', 'вопросов')} в раунде`] : G.rounds[G.ri + 1] ? [`Следующий раунд: ${G.rounds[G.ri + 1].n}`, () => A.round(G.ri + 1)] : ['Показать победителей', A.final]; }
  if (G.ph === 'cell') { const q = curQ(G); return mOk(q.qm) && q.qm.k === 'audio' ? ['▶ Включить музыку', A.showQ, 'команды жмут «Ответить!» — кто первый, тот отвечает'] : ['Показать вопрос', A.showQ, 'Пробел']; }
  if (G.ph === 'q') return ['Показать ответ', A.reveal, 'если никто не ответил верно'];
  if (G.ph === 'ans') return ['Вернуться к табло', A.board];
  const nextR = () => G.rounds[G.ri + 1] ? [`Следующий раунд: ${G.rounds[G.ri + 1].n}`, () => A.round(G.ri + 1)] : ['Показать победителей', A.final];
  if (G.ph === 'rintro') { const v = validIdx(curR(G)); return v.length ? ['Первый вопрос', () => A.qStart(v[0])] : nextR(); }
  if (G.ph === 'qq') { const n = Object.keys(G.players).length, a = Object.keys(G.players).filter(id => ANS[id] && ANS[id][G.bz]).length; return ['Показать ответ', A.qReveal, `ответили ${a} из ${n} · откроется сам, когда кончится время`]; }
  if (G.ph === 'qr') { const v = validIdx(curR(G)), k = v.indexOf(G.qi); return v[k + 1] != null ? ['Следующий вопрос', A.qNext, `вопрос ${k + 2} из ${v.length}`] : nextR(); }
  if (G.ph === 'final') return ['Игра окончена', null];
  return ['', null];
}
function ctlHtml() {
  if (isQuiz(G)) return ctlQuizHtml();
  const R = curR(G), q = curQ(G), v = curV(G), qq = queue(G), act = qq[0];
  let h = '';
  if (G.cur && q && (G.ph === 'cell' || G.ph === 'q' || G.ph === 'ans')) {
    h += `<div class="qc"><div class="meta"><span class="chip a">${esc(R.cats[G.cur.ci].n)}</span><span class="chip">${esc(v)}</span>${mOk(q.qm) ? `<span class="chip">${ico(MK[q.qm.k][0], 12)}${MK[q.qm.k][1]}</span>` : ''}${mOk(q.am) ? `<span class="chip">ответ: ${MK[q.am.k][1]}</span>` : ''}</div><p class="qt">${esc(q.q || '(вопрос без текста)')}</p><div class="an"><small>Ответ</small>${esc(q.a || '—')}</div>`;
    if (G.ph === 'q') {
      if (G.mode === 'buzz') h += `<div class="buzz${act ? ' on' : ''}">${act ? `<div class="who"><b>${esc(G.players[act].name)}</b><button class="btn ok sm" data-j="1">${ico('check', 15)}Верно +${nums(v)}</button><button class="btn bad sm" data-j="0">${ico('x', 15)}Неверно${G.minus ? ' −' + nums(v) : ''}</button><button class="btn sm" data-j="2" title="Убрать без очков">Скрыть</button></div>${qq.length > 1 ? `<div class="ql">Следом нажали: ${qq.slice(1).map(id => esc(G.players[id].name)).join(', ')}</div>` : ''}` : `<span class="muted">${G.wr.length ? 'Ждём, нажмёт ли кто-то ещё…' : 'Ждём, кто первый нажмёт «Ответить!»'}</span>`}</div>`;
      else h += `<div class="buzz"><span class="muted">Кто ответил? Начислите очки кнопками «+» / «−» у команд справа.</span></div>`;
    }
    if (G.ph === 'ans') h += `<div class="buzz">${G.by ? `<b>+${nums(G.gain)} · ${esc((G.players[G.by] || {}).name || '')}</b>` : '<span class="muted">Никто не ответил верно</span>'}</div>`;
  }
  if (G.ph === 'board' || G.ph === 'ans' || G.ph === 'lobby' || G.ph === 'cell') {
    const n = R.vals.length;
    h += `<h4 style="margin-top:${h ? 6 : 0}px">${ico('grid', 14)}${esc(R.n)}<span class="sp"></span>${G.rounds.length > 1 ? `<span class="seg" id="rSeg" style="padding:3px">${G.rounds.map((r, i) => `<button data-ri="${i}" class="${i === G.ri ? 'on' : ''}" style="padding:5px 10px;font-size:12px">${i + 1}</button>`).join('')}</span>` : ''}</h4>` +
      `<div class="mb">${R.cats.map((c, ci) => `<div class="r" style="grid-template-columns:1.4fr repeat(${n},minmax(0,1fr))"><span class="cn">${esc(c.n || '—')}</span>${c.qs.map((x, qi) => !validQ(x) ? '<span></span>' : `<button data-pk="${ci}.${qi}" class="${G.pl[keyOf(G, ci, qi)] ? 'pl' : ''}${G.cur && G.cur.ci === ci && G.cur.qi === qi ? ' cur' : ''}">${esc(R.vals[qi])}</button>`).join('')}</div>`).join('')}</div>`;
  }
  const hasM = !!(q && (G.ph === 'ans' ? mOk(q.am) && q.am.k !== 'image' : mOk(q.qm) && q.qm.k !== 'image'));
  const qMed = !!(q && mOk(q.qm) && q.qm.k !== 'image'), vid = qMed && q.qm.k === 'video';
  let pb;
  if (G.ph === 'cell' && q) pb = qMed ? `<button data-c="showQ" class="acc">${ico('play', 18)}${vid ? 'Включить видео' : 'Включить музыку'}</button>` : `<button data-c="showQ" class="acc">${ico('play', 18)}Показать вопрос</button>`;
  else if ((G.ph === 'q' || G.ph === 'ans') && hasM) pb = `<button data-c="pause" class="acc">${ico(G.hp ? 'play' : 'pause', 18)}${G.hp ? 'Продолжить' : 'Пауза'}</button>`;
  else pb = `<button class="acc" disabled>${ico('play', 18)}Включить музыку</button>`;
  h += `<div class="ctlr">${pb}` +
    `<button data-c="board"${G.ph === 'board' || G.ph === 'lobby' ? ' disabled' : ''}>${ico('grid', 18)}К табло</button>` +
    `<button data-c="qrbig" class="${G.qrb ? 'on' : ''}">${ico('qr', 18)}QR-код</button>` +
    `<button data-c="scores" class="${G.ov === 'scores' ? 'on' : ''}"${!MIX && (G.ph === 'lobby' || G.ph === 'final') ? ' disabled' : ''}>${ico('list', 18)}Рейтинг</button>` +
    (G.ph === 'q' ? `<button data-c="reveal">${ico('check', 18)}Показать ответ</button>` : '') +
    `<button data-c="replay"${hasM && (G.ph === 'q' || G.ph === 'ans') ? '' : ' disabled'}>${ico('replay', 18)}Ещё раз</button>` +
    `<button data-c="snd" class="${G.snd ? '' : 'on'}">${ico(G.snd ? 'vol' : 'mute', 18)}${G.snd ? 'Звук вкл.' : 'Звук выкл.'}</button>` +
    `<button data-c="qr" class="${G.qrz ? 'on' : ''}">${ico('pencil', 18)}Код на табло</button>` +
    `<button data-c="final"${G.ph === 'final' ? ' disabled' : ''}>${ico('trophy', 18)}Победители</button></div>`;
  return h;
}
function ctlQuizHtml() {
  const R = curR(G), q = curQQ(G), v = validIdx(R);
  let h = '';
  if (q && (G.ph === 'qq' || G.ph === 'qr')) {
    const ans = q.type === 'num' ? fmtN(q.num) + (q.unit ? ' ' + q.unit : '') : q.type === 'open' ? accList(q).join(' / ') : q.opts[q.ok];
    h += `<div class="qc"><div class="meta"><span class="chip a">${esc(R.n)}</span><span class="chip">Вопрос ${v.indexOf(G.qi) + 1} из ${v.length}</span><span class="chip">${QT[q.type]}</span><span class="chip">${nums(q.pts)}</span>${R.fast ? `<span class="chip">${ico('bolt', 12)}кто быстрее</span>` : ''}${G.ph === 'qq' ? `<span class="chip tnum" data-t1="${G.t1}" data-t0="${G.t0}"><b></b>&nbsp;сек</span>` : ''}</div><p class="qt">${esc(q.q || '(вопрос без текста)')}</p><div class="an"><small>Ответ</small>${esc(ans || '—')}</div>`;
    const ids = Object.keys(G.players);
    h += `<div class="tl" style="margin-bottom:12px">${ids.length ? ranked(G).map(p => {
      const a = ANS[p.id] && ANS[p.id][G.bz], r = G.ph === 'qr' && G.res ? G.res[p.id] : null;
      const txt = a ? (q.type === 'abcd' ? ('ABCDEF'[q.opts.map((t, j) => ({ t, j })).filter(x => x.t.trim()).findIndex(x => x.j === +a.o)] || '?') + ' · ' + (q.opts[+a.o] || '') : q.type === 'num' ? fmtN(+a.v) : String(a.tx || '')) : '';
      return `<div class="tm"><span class="dot${a ? ' on' : ''}"></span><span class="n">${esc(p.name)}</span><span class="muted" style="font-size:13px;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a ? esc(txt) : G.ph === 'qq' ? 'думает…' : 'без ответа'}</span>` +
        (r || G.ph === 'qr' ? `<button class="pm ${r && r.gain > 0 ? 'p' : 'm'}" data-acc="${p.id}" title="Засчитать / снять">${r && r.gain > 0 ? '✓ +' + nums(r.gain) : '✗ засчитать'}</button>` : '') + '</div>';
    }).join('') : '<div class="muted" style="font-size:14px">Команд пока нет</div>'}</div></div>`;
  }
  if (G.ph === 'rintro' || G.ph === 'qr' || G.ph === 'lobby') {
    h += `<h4 style="margin-top:${h ? 6 : 0}px">${ico('list', 14)}${esc(R.n)} · вопросы${G.rounds.length > 1 ? `<span class="sp"></span><span class="seg" id="rSeg" style="padding:3px">${G.rounds.map((r, i) => `<button data-ri="${i}" class="${i === G.ri ? 'on' : ''}" style="padding:5px 10px;font-size:12px" title="${esc(r.n)}">${i + 1}</button>`).join('')}</span>` : ''}</h4>` +
      `<div class="qnums">${v.map((i, k) => `<button data-qs="${i}" class="${i === G.qi ? 'cur' : ''}${i < G.qi ? ' pl' : ''}">${k + 1}</button>`).join('')}</div>`;
  }
  const q2 = q, hasM = !!(q2 && (G.ph === 'qr' ? mOk(q2.am) && q2.am.k !== 'image' : mOk(q2.qm) && q2.qm.k !== 'image'));
  h += `<div class="ctlr"><button data-c="scores" class="${G.ov === 'scores' ? 'on' : ''}"${G.ph === 'lobby' || G.ph === 'final' ? ' disabled' : ''}>${ico('list', 18)}Счёт на экран</button>` +
    `<button data-c="replay"${hasM ? '' : ' disabled'}>${ico('replay', 18)}Ещё раз</button>` +
    `<button data-c="snd" class="${G.snd ? '' : 'on'}">${ico(G.snd ? 'vol' : 'mute', 18)}${G.snd ? 'Звук вкл.' : 'Звук выкл.'}</button>` +
    `<button data-c="qr" class="${G.qrz ? 'on' : ''}">${ico('pencil', 18)}Код на экране</button><button data-c="qrbig" class="${G.qrb ? 'on' : ''}">${ico('qr', 18)}QR на экран</button>` +
    `<button data-c="final"${G.ph === 'final' ? ' disabled' : ''}>${ico('trophy', 18)}Победители</button>` +
    `<button data-c="rnext"${G.rounds[G.ri + 1] ? '' : ' disabled'}>${ico('next', 18)}След. раунд</button></div>`;
  return h;
}
function bindCtl() {
  const c = $('ctl');
  c.querySelectorAll('[data-j]').forEach(b => b.onclick = () => b.dataset.j === '2' ? A.skip() : A.judge(b.dataset.j === '1'));
  c.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { const [ci, qi] = b.dataset.pk.split('.').map(Number); A.pick(ci, qi); });
  c.querySelectorAll('[data-ri]').forEach(b => b.onclick = () => A.round(+b.dataset.ri));
  c.querySelectorAll('[data-qs]').forEach(b => b.onclick = () => A.qStart(+b.dataset.qs));
  c.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => A.accept(b.dataset.acc));
  c.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const k = b.dataset.c; A[k](); });
}
function teamsHostHtml() {
  const l = ranked(G), v = curV(G), canPm = (!!G.cur && G.ph !== 'board') || G.ph === 'qq' || G.ph === 'qr';
  if (!l.length) return '<div class="muted" style="font-size:14px">Пока никого. Команды заходят по QR-коду на экране или по коду игры.</div>';
  return l.map(p => `<div class="tm"><span class="dot${p.man || ONLINE[p.id] ? ' on' : ''}"></span><span class="n">${esc(p.name)}</span><button class="ed" data-rn="${p.id}" title="Переименовать">${ico('pencil', 14)}</button>` +
    (canPm ? `<button class="pm p" data-aw="${p.id}" data-s="1">+${nums(v)}</button><button class="pm m" data-aw="${p.id}" data-s="-1">−${nums(v)}</button>` : '') +
    `<span class="s" data-sc="${p.id}" style="cursor:pointer" title="Изменить очки">${nums(p.score)}</span><button class="ed" data-kick="${p.id}" title="Убрать">${ico('x', 14)}</button></div>`).join('') +
    (Object.keys(G.players).length >= G.cap && G.demo ? `<div class="hint" style="margin-top:6px">Демо: максимум ${G.cap} команды. Войдите с тарифом, чтобы больше.</div>` : '');
}
function bindTeams() {
  const t = $('tl');
  t.querySelectorAll('[data-aw]').forEach(b => b.onclick = () => A.award(b.dataset.aw, +b.dataset.s));
  t.querySelectorAll('[data-rn]').forEach(b => b.onclick = () => { A.rename(b.dataset.rn); if (G.players[b.dataset.rn]) G.players[b.dataset.rn].ren = 1; });
  t.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => A.setScore(b.dataset.sc));
  t.querySelectorAll('[data-kick]').forEach(b => b.onclick = () => { if (!confirm2(b, '?')) return; A.kick(b.dataset.kick); });
}
if (VIEW === 'host') setInterval(() => {
  if (!G || G.ph !== 'qq') return;
  const ids = Object.keys(G.players), all = ids.length && ids.every(id => G.players[id].man || (ANS[id] && ANS[id][G.bz]));
  if (now() >= G.t1 + 400 || (all && !curR(G).change && ids.some(id => !G.players[id].man))) A.qReveal();
}, 300);
document.addEventListener('keydown', e => {
  if (VIEW !== 'host' || !G || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '') || $('modal').classList.contains('on')) return;
  if (e.key === ' ' || e.key === 'ArrowRight') { const f = nextAct()[1]; if (f) { e.preventDefault(); f(); } }
  else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') A.replay();
  else if (e.key === 'q' || e.key === 'Q' || e.key === 'й' || e.key === 'Й') A.qrbig();
  else if (G.ph === 'q' && (e.key === '+' || e.key === '=')) A.judge(true);
  else if (G.ph === 'q' && (e.key === '-' || e.key === '_')) A.judge(false);
});

/* ================= экран (проектор) ================= */
function viewScreen() {
  document.body.classList.add('scrv');
  $('app').innerHTML = '<div class="sw2"><div class="stage" id="stg"></div></div>';
  const box = $('stg'); let S = null, unlocked = false;
  const ov = document.createElement('div'); ov.className = 'sndov'; ov.innerHTML = '<div>Нажмите, чтобы включить звук<small>и открыть на весь экран</small></div>';
  ov.onclick = () => { unlocked = true; SFX.unlock(); ov.remove(); const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d); box._k = ''; drawStage(box, S, !!(S && S.snd)); };
  if (MIX) { unlocked = true; SFX.unlock(); } else document.body.appendChild(ov);
  const bg = () => { document.body.style.background = S && S.acc ? `color-mix(in srgb, ${S.acc} 14%, #06050f)` : '#06050f'; };
  drawStage(box, null);
  if (!GID) { box.querySelector('.in').innerHTML = '<div class="splash"><div class="cat">Откройте экран из пульта ведущего</div></div>'; return; }
  netReady.then(ok => {
    if (!ok) { box.querySelector('.in').innerHTML = '<div class="splash"><div class="cat">Нет связи — проверьте интернет</div></div>'; return; }
    const on = gref(GID, 'on/' + NET.uid), pr = () => { if (NET.connected) { on.onDisconnect().remove(); on.set('scr').catch(() => {}); } }; NET.subs.push(pr); pr();
    gref(GID, 'scr').on('value', x => { const had = S; S = fixS(x.val()); if (!S && had) { box.querySelector('.in').innerHTML = '<div class="splash"><div class="cat big">Игра завершена</div><div class="rk2">Спасибо, что играли!</div></div>'; box._k = 'end'; return; } bg(); drawStage(box, S, unlocked && !!(S && S.snd)); });
  });
}

/* ================= телефон команды ================= */
function viewPlay() {
  document.body.classList.add('ph');
  const app = $('app');
  if (!GID) {
    app.innerHTML = `<div class="pv"><div class="mid"><div style="opacity:.9">${MARK(40)}</div><h2>Своя игра</h2><p>Введите код игры с экрана</p><input class="pin" id="cIn" inputmode="numeric" maxlength="7" placeholder="000 000" style="font-size:28px;letter-spacing:.2em"><button class="pbtn" id="cGo">Войти</button><p class="note" id="cErr"></p></div></div>`;
    const go = () => { const c = $('cIn').value.replace(/\D/g, ''); if (c.length !== 6) { $('cErr').textContent = 'Код — 6 цифр'; return; } netReady.then(ok => { if (!ok) { $('cErr').textContent = 'Нет связи'; return; } ref('codes/' + c).once('value').then(s => { const v = s.val(); if (!v || !v.g) { $('cErr').textContent = 'Игра с таким кодом не найдена'; return; } location.replace(v.k === 'svoya' ? BASE + '?view=play&g=' + v.g : v.k === 'mix' ? '../mix/?view=play&g=' + v.g : '../quiz/?view=play&g=' + v.g); }); }); };
    $('cGo').onclick = go; $('cIn').onkeydown = e => { if (e.key === 'Enter') go(); };
    return;
  }
  app.innerHTML = '<div class="pv"><div class="mid"><div class="spin"></div><p>Подключаемся к игре…</p></div></div>';
  let C = null, J = null, MY = null, me = null, joining = false, pressing = false, lastBz = -1, lastAct = '';
  const draw = () => {
    applyAcc(C && C.acc);
    if (!C) return;
    const name = (J && J.name) || '', inGame = C.sc && C.sc[me] != null, sc = inGame ? C.sc[me] : 0;
    const hd = `<div class="hd"><span>${esc(name || C.title)}</span><span class="sp"></span>${inGame ? `<span class="sc">${nums(sc)}</span>` : ''}</div>`;
    let h = '';
    if (!J) {
      if (C.full) h = `<div class="mid"><h2>Мест нет</h2><p>В этой игре уже максимум команд</p></div>`;
      else h = `<div class="mid"><div style="opacity:.9">${MARK(40)}</div><h2>${esc(C.title)}</h2><p>Придумайте название команды</p><input class="pin" id="nIn" maxlength="24" placeholder="Название команды" value="${esc(ls('get', 'pbs_name') || '')}"><button class="pbtn" id="nGo"${joining ? ' disabled' : ''}>${joining ? 'Входим…' : 'Войти в игру'}</button><p class="note">Приложение не нужно — всё работает в браузере</p></div>`;
    } else if (!inGame) h = C.full ? `<div class="mid"><h2>Мест нет</h2><p>В этой игре уже максимум команд</p></div>` : `<div class="mid"><div class="spin"></div><p>Ведущий добавляет команду…</p></div>`;
    else if (C.ph === 'lobby') h = `<div class="mid"><h2>Команда в игре!</h2><p>Смотрите на экран — скоро начинаем</p></div>`;
    else if (C.ph === 'board') h = `<div class="mid"><p class="k" style="color:#fff;opacity:.7">${esc(C.rn)}</p><h2>Ведущий выбирает вопрос</h2><p>${C.rk && C.rk[me] ? `Вы на ${C.rk[me]} месте из ${C.n}` : ''}</p></div>`;
    else if (C.ph === 'cell') h = `<div class="mid"><div class="cv"><span class="c">${esc(C.cat)}</span><span class="v">${nums(C.v)}</span></div><p>Приготовьтесь!</p></div>`;
    else if (C.ph === 'q') {
      const wr = (C.wr || []).indexOf(me) >= 0, pos = (C.q || []).indexOf(me), pressed = !!(MY && MY[C.bz]) || pressing;
      let body;
      if (C.mode === 'voice') body = `<div class="pst wt"><b>Отвечайте вслух</b><span>Поднимите руку — ведущий даст слово</span></div>`;
      else if (wr) body = `<div class="pst no"><b>Неверно</b><span>Ждите следующий вопрос</span></div>`;
      else if (C.act === me) body = `<div class="pst go"><b>Отвечайте!</b><span>Вы нажали первыми</span></div>`;
      else if (pressed) body = `<div class="pst wt"><b>${pos > 0 ? pos + 1 + '-е место' : 'Нажали!'}</b><span>${pos > 0 ? 'Если первые ошибутся — ваша очередь' : 'Ждём…'}</span></div>`;
      else body = `<button class="bzb" id="bz">Ответить!</button>`;
      h = `<div class="mid"><div class="cv"><span class="c">${esc(C.cat)}</span><span class="v">${nums(C.v)}</span></div>${body}</div>`;
    } else if (C.ph === 'rintro') h = `<div class="mid"><p class="k" style="color:#fff;opacity:.7">${esc(C.rlab)}</p><h2>${esc(C.rn)}</h2><p>Смотрите на экран — сейчас начнём</p></div>`;
    else if (C.ph === 'qq' && C.qz) {
      const z = C.qz, mine = MY && MY[C.bz], over = now() > z.t1, lock = mine && !z.change;
      let body = '';
      if (z.type === 'abcd') body = `<div class="pans">${z.opts.map((o, x) => `<button class="c${x % 4}${mine && +mine.o === o.j ? ' on' : ''}${mine && +mine.o !== o.j ? ' dim' : ''}" data-o="${o.j}"${over || lock ? ' disabled' : ''}><span class="l">${'ABCDEF'[x]}</span><span>${esc(o.t)}</span></button>`).join('')}</div>`;
      else if (z.type === 'num') body = `<div class="pin2"><input class="pin" id="aIn" inputmode="decimal" autocomplete="off" placeholder="Число${z.unit ? ', ' + esc(z.unit) : ''}" value="${mine && mine.v != null ? esc(mine.v) : ''}"${over || lock ? ' disabled' : ''}><button class="pbtn" id="aGo"${over || lock ? ' disabled' : ''}>${mine ? 'Изменить ответ' : 'Ответить'}</button></div>`;
      else body = `<div class="pin2"><input class="pin" id="aIn" maxlength="60" autocomplete="off" placeholder="Ваш ответ" value="${mine && mine.tx != null ? esc(mine.tx) : ''}"${over || lock ? ' disabled' : ''}><button class="pbtn" id="aGo"${over || lock ? ' disabled' : ''}>${mine ? 'Изменить ответ' : 'Ответить'}</button></div>`;
      h = `<div class="pq"><div class="pqh"><span>Вопрос ${z.i} из ${z.n}</span><span class="sp"></span><span>${nums(z.pts)}</span></div><div class="tbar" data-t1="${z.t1}" data-t0="${z.t0}"><i></i></div><p class="pqt">${esc(z.q)}</p>${body}<p class="note">${over ? 'Время вышло' : mine ? (z.change ? 'Ответ принят · можно изменить до конца времени' : 'Ответ принят') : z.fast ? 'Кто быстрее — очки получает первый верный ответ' : ''}</p></div>`;
    } else if (C.ph === 'qr' && C.qz) {
      const r = C.res && C.res[me], z = C.qz;
      h = `<div class="mid">${r && r.gain > 0 ? `<div class="pst go"><b>+${nums(r.gain)}</b><span>Верно!</span></div>` : r && r.ok ? `<div class="pst wt"><b>Верно</b><span>но кто-то ответил быстрее</span></div>` : r ? `<div class="pst no"><b>Мимо</b><span>в этот раз не угадали</span></div>` : `<div class="pst wt"><b>Без ответа</b><span>не успели ответить</span></div>`}<p>Правильный ответ</p><h2>${esc(z.ans)}</h2></div>`;
    } else if (C.ph === 'ans') h = `<div class="mid">${C.by === me ? `<div class="pst go"><b>+${nums(C.v)}</b><span>Верно!</span></div>` : ''}<p>Правильный ответ</p><h2>${esc(C.a || '—')}</h2></div>`;
    else if (C.ph === 'final') h = `<div class="mid"><h2>${C.rk && C.rk[me] === 1 ? 'Вы победили!' : 'Игра окончена'}</h2><p>${C.rk && C.rk[me] ? `${C.rk[me]} место · ${nums(sc)} ${plural(sc, 'очко', 'очка', 'очков')}` : ''}</p></div>`;
    const k = h; if (app._h === k) return; app._h = k;
    app.innerHTML = `<div class="pv">${hd}${h}</div>`;
    const ng = $('nGo'); if (ng) { const i = $('nIn'); const go = () => { const v = i.value.trim(); if (!v) { i.focus(); return; } joining = true; ls('set', 'pbs_name', v); draw(); gref(GID, 'join/' + me).set({ name: v.slice(0, 24), table: 0, t: TS() }).then(() => { joining = false; presence(); }, () => { joining = false; app._h = ''; draw(); }); }; ng.onclick = go; i.onkeydown = e => { if (e.key === 'Enter') go(); }; }
    const send = a => { if (navigator.vibrate) navigator.vibrate(20); MY = Object.assign({}, MY || {}, { [C.bz]: a }); app._h = ''; draw(); gref(GID, 'ans/' + me + '/' + C.bz).set(Object.assign({}, a, { t: TS(), c: now() })).catch(() => {}); };
    app.querySelectorAll('.pans [data-o]').forEach(b => b.onclick = () => send({ o: +b.dataset.o }));
    const ag = $('aGo'); if (ag) { const i = $('aIn'); const go = () => { const v = i.value.trim(); if (!v) { i.focus(); return; } if (C.qz.type === 'num') { const n = +v.replace(/\s/g, '').replace(',', '.'); if (!isFinite(n)) { toast('Нужно число'); return; } send({ v: n }); } else send({ o: 0, tx: v.slice(0, 60) }); }; ag.onclick = go; i.onkeydown = e => { if (e.key === 'Enter') go(); }; }
    const bz = $('bz'); if (bz) bz.onclick = () => { if (pressing) return; pressing = true; SFX.press(); if (navigator.vibrate) navigator.vibrate(30); app._h = ''; draw(); gref(GID, 'ans/' + me + '/' + C.bz).set({ o: 0, t: TS(), c: now() }).then(() => { pressing = false; }, () => { pressing = false; app._h = ''; draw(); }); };
  };
  let presence = () => {}, wasOver = false;
  setInterval(() => { if (!C || C.ph !== 'qq' || !C.qz) { wasOver = false; return; } const o = now() > C.qz.t1; if (o !== wasOver) { wasOver = o; app._h = ''; draw(); } }, 400);
  netReady.then(ok => {
    if (!ok) { app.innerHTML = '<div class="pv"><div class="mid"><h2>Нет связи</h2><p>Проверьте интернет и обновите страницу</p></div></div>'; return; }
    me = NET.uid;
    const on = gref(GID, 'on/' + me); presence = () => { if (NET.connected && J) { on.onDisconnect().remove(); on.set(true).catch(() => {}); } }; NET.subs.push(presence);
    gref(GID, 'meta').once('value').then(x => { if (!x.exists()) app.innerHTML = '<div class="pv"><div class="mid"><h2>Игра не найдена</h2><p>Попросите у ведущего новый QR-код</p></div></div>'; });
    gref(GID, 'core').on('value', x => { if (!x.val() && C) { C = null; app._h = ''; app.innerHTML = '<div class="pv"><div class="mid"><h2>Игра завершена</h2><p>Спасибо, что играли!</p></div></div>'; return; } C = x.val(); if (C && C.bz !== lastBz) { lastBz = C.bz; pressing = false; } if (C && C.act === me && lastAct !== me && navigator.vibrate) navigator.vibrate([60, 40, 60]); lastAct = C ? C.act : ''; draw(); });
    gref(GID, 'join/' + me).on('value', x => { J = x.val(); if (J) presence(); else if (MIXNM && !joining && !draw._aj) { draw._aj = 1; joining = true; gref(GID, 'join/' + me).set({ name: MIXNM, table: 0, t: TS() }).then(() => { joining = false; presence(); }, () => { joining = false; }); } app._h = ''; draw(); });
    gref(GID, 'ans/' + me).on('value', x => { MY = x.val(); app._h = ''; draw(); });
  });
}

/* ================= запуск ================= */
function bootHost() {
  if (MIX) {
    ls('del', KEY_LIVE); const OPEN = P.get('open');
    let posted = '';
    setInterval(() => { if (G && G.code && posted !== G.id + G.code) { posted = G.id + G.code; window.parent.postMessage({ pbmix: 'started', k: 'svoya', gid: G.id, code: G.code }, location.origin); } }, 500);
    window.addEventListener('message', e => { if (e.origin !== location.origin || !e.data || e.data.pbmix !== 'req' || !G) return; window.parent.postMessage({ pbmix: 'res', k: 'svoya', gid: G.id, players: Object.keys(G.players).map(id => ({ id, name: G.players[id].name, score: G.players[id].score || 0 })) }, location.origin); });
    $('app').innerHTML = '<div class="wrap"><p class="muted">Загружаем раунд…</p></div>';
    accLoad().then(() => netReady).then(ok => {
      const k = wsKey();
      if (!ok || !k || !OPEN) { window.parent.postMessage({ pbmix: 'err', msg: 'Не получилось открыть игру' }, location.origin); return; }
      ref(`ws/${k}/sq/${OPEN}`).once('value').then(x => { if (!x.val()) throw 0; CFG = normCfg(x.val()); newGame(); }).catch(() => window.parent.postMessage({ pbmix: 'err', msg: 'Не получилось открыть игру' }, location.origin));
    });
    return;
  }
  const live = ls('get', KEY_LIVE);
  const OPEN = P.get('open'), DEMO = !!P.get('demo'); if (OPEN || P.get('new') || DEMO) try { history.replaceState(null, '', location.pathname); } catch (e) {}
  if (DEMO) { CFG = normCfg(sampleCfg()); newGame(); ['Индейки', 'Пироги'].forEach(n => { const id = 'm' + uid(8); G.players[id] = { id, name: n, score: 0, man: 1 }; }); publish(); accLoad().then(() => { if (G) renderLive(); }); renderTop(); return; }
  if (P.get('new')) { CFG = normCfg(sampleCfg()); ls('set', KEY_CFG, CFG); }
  if (live && live.id && !OPEN && !P.get('new')) { G = live; G.netOn = false; renderLive(true); startNet(); }
  else renderEditor();
  accLoad().then(() => {
    if (G) { renderLive(); return; }
    renderEditor();
    const k = wsKey();
    netReady.then(ok => {
      if (!ok || !k) return;
      if (OPEN) ref(`ws/${k}/sq/${OPEN}`).once('value').then(s => { if (s.val()) { CFG = normCfg(s.val()); ls('set', KEY_CFG, CFG); SEL = { r: 0, c: -1, q: -1 }; renderEditor(); } }, () => {});
      else STORE.push();
    });
  });
  renderTop();
}
if (VIEW === 'screen') viewScreen();
else if (VIEW === 'play') viewPlay();
else bootHost();
window.__svoya = { get g() { return G; }, A, get cfg() { return CFG; } };
})();
