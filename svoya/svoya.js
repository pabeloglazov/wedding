(() => {
'use strict';
/* ================= Своя игра · Beloglazov Event =================
   Ведущий: ?               (редактор табло + пульт)
   Экран:   ?view=screen&g= (проектор)
   Телефон: ?view=play&g=   (кнопка «Ответить!»)                                  */
const P = new URLSearchParams(location.search);
const VIEW = P.get('view') || 'host';
const GID = (P.get('g') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);
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
function closeModal() { $('modal').classList.remove('on'); }
document.addEventListener('click', e => { if (e.target && e.target.id === 'modal') closeModal(); if (e.target && e.target.closest && e.target.closest('[data-close]')) closeModal(); });
const nums = n => Number(n || 0).toLocaleString('ru-RU');
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
const KEY_CFG = 'pbs_cfg_v1', KEY_LIVE = 'pbs_live_v1', KEY_LAST = 'pbs_last';
const blankM = () => ({ k: '', src: '', t0: 0, t1: 0, loop: 0 });
const blankQ = () => ({ q: '', a: '', qm: blankM(), am: blankM() });
const S5 = (arr) => arr.map(([q, a]) => Object.assign(blankQ(), { q, a }));
function sampleCfg() {
  return {
    id: uid(10), title: 'Своя игра', acc: DEF_ACC, minus: true, mode: 'buzz', updated: Date.now(),
    rounds: [{
      n: 'Раунд 1', vals: [100, 200, 300, 400, 500], cats: [
        { n: 'Кино', qs: S5([['Как зовут мальчика-волшебника со шрамом в виде молнии?', 'Гарри Поттер'], ['Какой фильм 1997 года о гибели огромного лайнера получил 11 «Оскаров»?', '«Титаник»'], ['Как зовут зелёного огра из мультфильма DreamWorks?', 'Шрек'], ['Кто сыграл капитана Джека Воробья в «Пиратах Карибского моря»?', 'Джонни Депп'], ['Закончите фразу Терминатора: «I’ll be…»', '…back']]) },
        { n: 'Музыка', qs: S5([['Сколько струн у классической гитары?', '6'], ['Какая группа записала «Bohemian Rhapsody»?', 'Queen'], ['Кто написал музыку к балету «Лебединое озеро»?', 'Пётр Чайковский'], ['Из какого города группа The Beatles?', 'Ливерпуль'], ['Сколько клавиш у стандартного фортепиано?', '88']]) },
        { n: 'География', qs: S5([['На каком материке находится Египет?', 'Африка'], ['Какой город — столица Австралии?', 'Канберра'], ['Какое озеро — самое глубокое в мире?', 'Байкал'], ['В какой стране находится город Марракеш?', 'Марокко'], ['Как называется самая высокая гора Африки?', 'Килиманджаро']]) },
        { n: 'Еда и напитки', qs: S5([['Из какого фрукта делают гуакамоле?', 'Авокадо'], ['Какая страна — родина пиццы?', 'Италия'], ['Как называется японский суп на основе соевой пасты?', 'Мисо-суп'], ['Из какого растения делают текилу?', 'Голубая агава'], ['Какой сыр кладут в классический греческий салат?', 'Фета']]) },
        { n: 'Наука', qs: S5([['Какая планета ближе всего к Солнцу?', 'Меркурий'], ['Какая химическая формула у воды?', 'H₂O'], ['Сколько костей в скелете взрослого человека?', '206'], ['Кто создал теорию относительности?', 'Альберт Эйнштейн'], ['Какой газ составляет большую часть воздуха на Земле?', 'Азот']]) }
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
function normRound(r, i) {
  r = r || {}; let vals = (Array.isArray(r.vals) && r.vals.length ? r.vals : [100, 200, 300, 400, 500]).slice(0, MAXC).map((v, j) => Math.max(0, Math.round(+v || (j + 1) * 100 * (i + 1))));
  const cats = (Array.isArray(r.cats) && r.cats.length ? r.cats : [{ n: '', qs: [] }]).slice(0, 8).map(c => { const qs = (c && Array.isArray(c.qs) ? c.qs : []).slice(0, vals.length).map(normQ); while (qs.length < vals.length) qs.push(blankQ()); return { n: String((c && c.n) || ''), qs }; });
  return { n: String(r.n || 'Раунд ' + (i + 1)), vals, cats };
}
function normCfg(c) {
  if (!c || !Array.isArray(c.rounds)) c = sampleCfg();
  c.id = c.id || uid(10); c.title = String(c.title || 'Своя игра'); c.acc = /^#[0-9a-f]{6}$/i.test(c.acc || '') ? c.acc : DEF_ACC;
  c.minus = c.minus !== false; c.mode = c.mode === 'voice' ? 'voice' : 'buzz';
  c.rounds = c.rounds.slice(0, 6).map(normRound); if (!c.rounds.length) c.rounds = [normRound(null, 0)];
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
const cellsOf = c => c.rounds.reduce((n, r) => n + r.cats.reduce((m, ct) => m + ct.qs.filter(validQ).length, 0), 0);

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
function setMute(box, snd) {
  if (!box) return;
  box.querySelectorAll('iframe').forEach(f => { try { f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: snd ? 'unMute' : 'mute', args: [] }), '*'); if (snd) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*'); } catch (e) {} });
  box.querySelectorAll('audio,video').forEach(el => { el.muted = !snd; });
}

/* ================= живая игра (ведущий) ================= */
let G = null, ANS = {}, ONLINE = {}, hostOff = [], lastScr = '', lastCore = '';
const curR = g => g.rounds[g.ri] || g.rounds[0];
const keyOf = (g, ci, qi) => `${g.ri}-${ci}-${qi}`;
const curQ = g => g && g.cur ? curR(g).cats[g.cur.ci].qs[g.cur.qi] : null;
const curV = g => g && g.cur ? curR(g).vals[g.cur.qi] : 0;
const ranked = g => Object.values(g.players).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ru'));
function queue(g) {
  if (!g || g.ph !== 'q') return [];
  return Object.keys(g.players).filter(id => ANS[id] && ANS[id][g.bz]).map(id => ({ id, c: +ANS[id][g.bz].c || 0, t: +ANS[id][g.bz].t || 0 }))
    .sort((a, b) => a.c - b.c || a.t - b.t).map(x => x.id).filter(id => g.wr.indexOf(id) < 0);
}
const roundLeft = g => curR(g).cats.reduce((n, c, ci) => n + c.qs.filter((q, qi) => validQ(q) && !g.pl[keyOf(g, ci, qi)]).length, 0);
function newGame() {
  const c = JSON.parse(JSON.stringify(CFG));
  G = { id: uid(12), cfg: c.id, title: c.title, acc: canColor() ? c.acc : DEF_ACC, minus: c.minus, mode: c.mode, rounds: c.rounds, ri: 0, pl: {}, ph: 'lobby', cur: null, bz: 0, wr: [], by: null, gain: 0, players: {}, code: '', ov: '', mr: 0, qrz: 0, snd: true, demo: !unlocked(), cap: teamCap(), t: Date.now() };
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
  start() { if (G.ph === 'lobby') { G.ph = 'board'; publish(); } },
  pick(ci, qi) {
    if (!G || ['board', 'cell', 'ans'].indexOf(G.ph) < 0 && !(G.ph === 'lobby')) return;
    const q = curR(G).cats[ci] && curR(G).cats[ci].qs[qi]; if (!validQ(q) || G.pl[keyOf(G, ci, qi)]) return;
    if (G.ph === 'ans' && G.cur) G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = G.pl[keyOf(G, G.cur.ci, G.cur.qi)] || { by: G.by || '' };
    G.cur = { ci, qi }; G.ph = 'cell'; G.wr = []; G.by = null; G.gain = 0; G.ov = ''; publish();
  },
  showQ() { if (G.ph !== 'cell') return; G.ph = 'q'; G.bz++; G.t0 = now(); publish(); },
  judge(ok) {
    if (G.ph !== 'q') return; const qq = queue(G), id = qq[0]; if (!id) return; const v = curV(G), p = G.players[id];
    if (ok) { p.score += v; G.by = id; G.gain = v; G.ph = 'ans'; G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = { by: id }; }
    else { if (G.minus) p.score -= v; G.wr.push(id); }
    publish();
  },
  award(id, sign) {
    const p = G.players[id]; if (!p || !G.cur) return; const v = curV(G);
    if (sign > 0) { p.score += v; if (G.ph === 'q' || G.ph === 'cell') { G.by = id; G.gain = v; G.ph = 'ans'; G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = { by: id }; } }
    else { p.score -= v; if (G.ph === 'q' && G.wr.indexOf(id) < 0) G.wr.push(id); }
    publish();
  },
  reveal() { if (G.ph !== 'q' && G.ph !== 'cell') return; G.ph = 'ans'; G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = G.pl[keyOf(G, G.cur.ci, G.cur.qi)] || { by: '' }; publish(); },
  board() { if (G.cur) G.pl[keyOf(G, G.cur.ci, G.cur.qi)] = G.pl[keyOf(G, G.cur.ci, G.cur.qi)] || { by: G.by || '' }; G.ph = 'board'; G.cur = null; G.ov = ''; publish(); },
  round(i) { if (!G.rounds[i]) return; if (G.cur && G.ph !== 'board') A.board(); G.ri = i; G.ph = 'board'; G.cur = null; G.ov = ''; publish(); toast(curR(G).n); },
  scores() { G.ov = G.ov === 'scores' ? '' : 'scores'; publish(); },
  final() { G.ph = 'final'; G.ov = ''; G.cur = null; publish(); },
  qr() { G.qrz = G.qrz ? 0 : 1; publish(); },
  snd() { G.snd = !G.snd; publish(); },
  replay() { const q = curQ(G); if (G.cur && q && (G.ph === 'ans' ? mOk(q.am) && q.am.k !== 'image' : mOk(q.qm) && q.qm.k !== 'image')) { G.mr = (G.mr || 0) + 1; publish(); toast('Играем ещё раз'); } },
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
function scrOf(g) {
  const R = curR(g), q = curQ(g), qq = queue(g), nm = id => (g.players[id] || {}).name || '';
  return {
    id: g.id, ph: g.ph, title: g.title, acc: g.acc, code: g.code || '', rn: R.n, ri: g.ri, rc: g.rounds.length, demo: !!g.demo, qrz: g.qrz ? 1 : 0, snd: g.snd !== false,
    cats: R.cats.map(c => c.n), vals: R.vals,
    grid: R.cats.map((c, ci) => c.qs.map((x, qi) => !validQ(x) ? 2 : g.pl[keyOf(g, ci, qi)] ? 1 : 0)),
    cur: g.cur && q ? { ci: g.cur.ci, qi: g.cur.qi, cat: R.cats[g.cur.ci].n, v: curV(g), q: q.q, qm: mOk(q.qm) ? q.qm : null, am: g.ph === 'ans' && mOk(q.am) ? q.am : null, a: g.ph === 'ans' ? q.a : '' } : null,
    act: nm(qq[0]), qn: qq.slice(1, 4).map(nm), by: g.by ? nm(g.by) : '', gain: g.gain || 0, wr: g.wr.length, mode: g.mode,
    ov: g.ov || '', mr: g.mr || 0, players: ranked(g).map(p => ({ n: p.name, s: p.score }))
  };
}
function coreOf(g) {
  const qq = queue(g), R = curR(g), q = curQ(g), sc = {}, rk = {};
  ranked(g).forEach((p, i) => { sc[p.id] = p.score; rk[p.id] = i + 1; });
  return { id: g.id, ph: g.ph, title: g.title, acc: g.acc, code: g.code || '', mode: g.mode, bz: g.bz, cat: g.cur ? R.cats[g.cur.ci].n : '', v: curV(g), act: qq[0] || '', q: qq, wr: g.wr, by: g.by || '', a: g.ph === 'ans' && q ? q.a : '', sc, rk, n: Object.keys(g.players).length, full: Object.keys(g.players).length >= g.cap ? 1 : 0, rn: R.n };
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
  const onA = x => { ANS = x.val() || {}; if (G && G.ph === 'q') publish(); };
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
    G.netOn = true; attachNet(); lastScr = ''; lastCore = ''; netPush(); uploadMedia(gid);
    if (G.code) { const c = (await ref('codes/' + G.code).once('value')).val(); if (c && c.g === gid) { ls('set', KEY_LAST, { gid, code: G.code }); return; } }
    const code = await allocCode(gid);
    if (G && G.id === gid && code) { G.code = code; ls('set', KEY_LAST, { gid, code }); publish(); }
  } catch (e) { console.warn('svoya net', e); }
}
/* файлы с этого ноутбука — в игру, чтобы их видел экран на другом устройстве */
function uploadMedia(gid) {
  const ids = new Set(); G.rounds.forEach(r => r.cats.forEach(c => c.qs.forEach(q => [q.qm, q.am].forEach(m => { if (m && m.src && m.src.slice(0, 2) === 'f:') ids.add(m.src); }))));
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
function fitText(el, box, min = .45) {
  if (!el || !box) return; let k = 1; el.style.fontSize = '';
  const go = () => { let n = 0; while ((box.scrollHeight > box.clientHeight + 2 || box.scrollWidth > box.clientWidth + 2) && k > min && n++ < 40) { k -= .05; el.style.fontSize = k.toFixed(2) + 'em'; } };
  go(); requestAnimationFrame(go); if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
}
function drawStage(root, S, snd) {
  if (!root) return;
  root.style.setProperty('--acc', S && S.acc ? S.acc : DEF_ACC);
  let inn = root.querySelector('.in'); if (!inn) { root.innerHTML = `<div class="in"></div><div class="brandm">${MARK(20)}<span>Beloglazov Event</span></div>`; inn = root.querySelector('.in'); }
  if (!S) { root._k = ''; inn.innerHTML = '<div class="splash"><div class="cat" style="opacity:.6">Ждём игру…</div></div>'; return; }
  const ov = S.ov === 'scores' && S.ph !== 'final' && S.ph !== 'lobby';
  const k = [ov ? 'sc' : S.ph, S.ri, S.cur ? S.cur.ci + '.' + S.cur.qi : '', S.qrz].join('|');
  const same = root._k === k; root._k = k;
  const mute = !!snd;
  if (ov) { inn.innerHTML = scoresHtml(S, 'Счёт'); return; }
  if (S.ph === 'lobby') {
    if (same) { const t = inn.querySelector('.teams'); if (t) t.innerHTML = teamsHtml(S); return; }
    inn.innerHTML = `<div class="lob"><div><div class="kk">Подключайтесь по QR-коду</div><h1>${esc(S.title)}</h1><div class="teams">${teamsHtml(S)}</div></div>` +
      `<div class="joinc"><div class="qr" id="sqr"></div><div class="u">${esc(SHORT.replace(/^https?:\/\//, ''))}</div><small>код игры</small><div class="cd">${S.code ? fmtCode(S.code) : '······'}</div></div></div>`;
    qr(inn.querySelector('#sqr'), `${location.origin}${location.pathname}?view=play&g=${S.id}`, 600);
    return;
  }
  if (S.ph === 'board') {
    const n = S.vals.length;
    const bd = `<div class="rnd"><b>${esc(S.rn)}</b><span class="sp"></span>${S.qrz && S.code ? `<span class="cd">${esc(SHORT)} · код ${fmtCode(S.code)}</span>` : ''}</div>` +
      `<div class="board" style="grid-template-rows:repeat(${S.cats.length},minmax(0,1fr))">` + S.cats.map((c, ci) => `<div class="r" style="grid-template-columns:1.5fr repeat(${n},minmax(0,1fr))"><div class="c">${esc(c)}</div>` +
        S.vals.map((v, qi) => { const st = S.grid[ci] ? S.grid[ci][qi] : 2; return `<div class="v${st ? ' pl' : ''}">${st === 2 ? '' : esc(v)}</div>`; }).join('') + '</div>').join('') + '</div>';
    inn.innerHTML = bd; return;
  }
  if (S.ph === 'cell' && S.cur) { if (!same) inn.innerHTML = `<div class="splash"><div class="cat">${esc(S.cur.cat)}</div><div class="val">${esc(S.cur.v)}</div></div>`; return; }
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
    if (f && f._h !== fh) { f._h = fh; f.innerHTML = fh; }
    return;
  }
  if (S.ph === 'ans' && S.cur) {
    const c = S.cur, am = c.am, vis = am && am.k !== 'audio';
    if (!same) {
      inn.innerHTML = `<div class="qtop"><span class="chip2">${esc(c.cat)}</span><span class="vv">${esc(c.v)}</span></div><div class="ansv${vis ? ' wm' : ''}"><div class="q">${esc(c.q)}</div><div class="lb">Правильный ответ</div><div class="a">${esc(c.a || '—')}</div>` +
        (vis ? '<div class="qm amv" id="am"></div>' : '') + `<div id="gw"></div></div>${am && !vis ? '<div class="qm aud" id="am" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden"></div>' : ''}`;
      if (am) { const m = inn.querySelector('#am'); mountMedia(m, am, mute, S.id); m._mr = S.mr; m._snd = mute; }
      fitText(inn.querySelector('.ansv .a'), inn.querySelector('.ansv'), .4);
    } else if (am) {
      const m = inn.querySelector('#am');
      if (m && m._mr !== S.mr && am.k !== 'image') { m._mr = S.mr; mountMedia(m, am, mute, S.id); m._snd = mute; } else if (m && m._snd !== mute) { m._snd = mute; setMute(m, mute); }
    }
    const gw = inn.querySelector('#gw'), gh = S.by ? `<span class="gain">+${nums(S.gain)} · ${esc(S.by)}</span>` : `<span class="gain no">Никто не ответил</span>`;
    if (gw && gw._h !== gh) { gw._h = gh; gw.innerHTML = gh; }
    return;
  }
  if (S.ph === 'final') { if (!same) inn.innerHTML = finalHtml(S); return; }
  inn.innerHTML = '';
}
/* Firebase не хранит пустые массивы — восстанавливаем */
function fixS(S) { if (!S) return S; ['players', 'qn', 'cats', 'vals'].forEach(k => { if (!Array.isArray(S[k])) S[k] = S[k] ? Object.values(S[k]) : []; }); if (!Array.isArray(S.grid)) S.grid = S.grid ? Object.values(S.grid) : []; S.grid = S.grid.map(r => Array.isArray(r) ? r : r ? Object.values(r) : []); return S; }
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
  const n = cellsOf(CFG), cats = R.cats.length, N = R.vals.length;
  const cols = `grid-template-columns:repeat(${N},minmax(0,1fr)) 52px`;
  $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND('Своя игра · редактор')}</a><span class="sp"></span><span class="muted" style="font-size:12px" id="syncSt"></span><div class="acc" id="acc"></div></div></div>` +
    `<div class="wrap wide"><div class="hero"><div class="k">Новая игра</div><h1>Своя игра</h1><p>Табло «категории × стоимость» на проекторе. Ведущий открывает клетку, команды жмут «Ответить!» на телефонах — кто первый, тот отвечает.</p></div>` +
    (!unlocked() ? `<div class="notice">${ico('lock')}<span><b>Демо:</b> всё работает, до ${DEMO_MAX} команд. Свой цвет оформления — на тарифе «Продвинутый».</span><span class="sp"></span>${ACC.token ? '' : '<button class="btn ghost sm" id="nLogin">Войти</button>'}</div>` : '') +
    `<div class="card"><div class="fld"><label for="fTitle">Название игры</label><input class="inp" id="fTitle" maxlength="60" value="${esc(CFG.title)}"></div></div>` +
    `<div class="card"><h3>${ico('grid', 16)}Табло</h3>` +
    `<div class="tabs" id="rTabs">${CFG.rounds.map((r, i) => `<div class="rtab${i === SEL.r ? ' on' : ''}"><button class="rn" data-r="${i}">${esc(r.n || 'Раунд ' + (i + 1))}</button>${CFG.rounds.length > 1 ? `<button class="rx" data-rdel="${i}" title="Удалить раунд" aria-label="Удалить раунд">${ico('x', 14)}</button>` : ''}</div>`).join('')}${CFG.rounds.length < 6 ? `<button class="tadd" data-r="add">${ico('plus', 14)}Раунд</button>` : ''}</div>` +
    `<div class="fld" style="max-width:420px;margin-bottom:18px"><label for="fRn">Название раунда</label><input class="inp" id="fRn" maxlength="40" value="${esc(R.n)}"></div>` +
    `<div class="evl">Стоимость вопросов</div><div class="evals" style="${cols}">${R.vals.map((v, i) => `<div class="vh"><input class="inp" data-val="${i}" inputmode="numeric" value="${v}" aria-label="Стоимость ${i + 1}">${N > 1 ? `<button class="vx" data-vdel="${i}" title="Убрать столбец" aria-label="Убрать столбец">${ico('x', 12)}</button>` : ''}</div>`).join('')}<span></span></div>` +
    `<div class="ecats" id="eCats">${R.cats.map((c, ci) => `<div class="ecat" data-ci="${ci}"><div class="ech"><span class="grip cg" title="Перетащить категорию">${ico('grip', 16)}</span><label class="cbox"><small>Категория ${ci + 1}</small><input data-cn="${ci}" maxlength="40" placeholder="Название категории" value="${esc(c.n)}"></label>` +
      `<button class="icb del" data-cdel="${ci}" title="Удалить категорию"${cats < 2 ? ' disabled' : ''}>${ico('trash', 16)}</button></div>` +
      `<div class="eqs" style="${cols}">${c.qs.map((q, qi) => qCardHtml(R, q, ci, qi)).join('')}${N < MAXC ? `<button class="qadd" data-qadd="1" title="Добавить вопрос в каждую категорию" aria-label="Добавить вопрос">${ico('plus', 20)}</button>` : '<span></span>'}</div>` +
      (SEL.c === ci && c.qs[SEL.q] ? '<div id="qed"></div>' : '') + `</div>`).join('')}</div>` +
    `${cats < 8 ? `<button class="btn ghost sm" id="cAdd" style="margin-top:14px">${ico('plus', 14)}Категория</button>` : ''}</div>` +
    `<div class="card"><h3>${ico('list', 16)}Правила</h3>` +
    `<div class="opt"><div class="tx"><b>Как команды отвечают</b><span>${CFG.mode === 'buzz' ? 'Кнопка «Ответить!» на телефоне — на экране видно, кто нажал первым' : 'Поднимают руку, ведущий сам начисляет очки нужной команде'}</span></div><div class="seg" id="mSeg"><button data-m="buzz" class="${CFG.mode === 'buzz' ? 'on' : ''}">${ico('phone', 15)}Кнопка на телефоне</button><button data-m="voice" class="${CFG.mode === 'voice' ? 'on' : ''}">${ico('hand', 15)}Голосом</button></div></div>` +
    `<div class="opt"><div class="tx"><b>Неправильный ответ</b><span>${CFG.minus ? 'Стоимость вопроса вычитается из счёта команды' : 'Очки не снимаются — просто ход переходит дальше'}</span></div><div class="seg" id="xSeg"><button data-x="1" class="${CFG.minus ? 'on' : ''}">${ico('minus', 15)}Минус за неправильный</button><button data-x="0" class="${CFG.minus ? '' : 'on'}">${ico('check', 15)}Без минусов</button></div></div>` +
    `<div class="opt${canColor() ? '' : ' locked'}"><div class="tx"><b>Цвет оформления</b><span>Градиент табло, экрана и телефонов${canColor() ? '' : ' · на тарифе «Продвинутый»'}</span></div>${canColor() ? '' : `<span class="lock">${ico('lock', 12)}Продвинутый</span>`}<div class="swatches" id="sw">${PAL.map(([c, nm]) => `<button style="background:${c}" data-acc="${c}" title="${nm}" class="${CFG.acc.toLowerCase() === c ? 'on' : ''}"></button>`).join('')}<label class="cpick" title="Свой цвет" style="background:${PAL.some(x => x[0] === CFG.acc.toLowerCase()) ? 'conic-gradient(#ff5f6d,#ffc371,#47e891,#3fa7ff,#a75cff,#ff5f6d)' : esc(CFG.acc)}"><input type="color" id="accC" value="${esc(CFG.acc)}"></label></div></div></div>` +
    `<div class="card"><h3>${ico('monitor', 16)}Так это выглядит на проекторе</h3><div class="stage stw" id="prev"></div></div>` +
    `</div><div class="bar"><div class="in"><div class="t"><b>${esc(CFG.title)}</b><span>${CFG.rounds.length} ${plural(CFG.rounds.length, 'раунд', 'раунда', 'раундов')} · ${n} ${plural(n, 'вопрос', 'вопроса', 'вопросов')} готово</span></div><button class="btn gold" id="bStart"${n ? '' : ' disabled'}>${ico('play', 16)}Запустить</button></div></div>`;
  renderTop();
  if ($('nLogin')) $('nLogin').onclick = goLogin;
  const prevS = () => ({ id: 'x', ph: 'board', title: CFG.title, acc: canColor() ? CFG.acc : DEF_ACC, rn: R.n, ri: SEL.r, cats: R.cats.map(c => c.n || '—'), vals: R.vals, grid: R.cats.map(c => c.qs.map(q => validQ(q) ? 0 : 2)), players: [] });
  drawStage($('prev'), prevS(), false);
  const sv = () => STORE.save();
  $('fTitle').oninput = e => { CFG.title = e.target.value; sv(); };
  $('fRn').oninput = e => { R.n = e.target.value; sv(); const t = document.querySelector(`.rtab.on .rn`); if (t) t.textContent = R.n || 'Раунд ' + (SEL.r + 1); };
  $('fRn').onchange = () => drawStage($('prev'), prevS(), false);
  $('rTabs').onclick = e => {
    const x = e.target.closest('[data-rdel]');
    if (x) { const t = x.closest('.rtab'); if (!t.classList.contains('sure')) { document.querySelectorAll('.rtab.sure').forEach(z => z.classList.remove('sure')); t.classList.add('sure'); x.innerHTML = 'Удалить?'; clearTimeout(t._t); t._t = setTimeout(() => { if (t.isConnected) { t.classList.remove('sure'); x.innerHTML = ico('x', 14); } }, 3000); return; } CFG.rounds.splice(+x.dataset.rdel, 1); SEL = { r: Math.min(SEL.r, CFG.rounds.length - 1), c: -1, q: -1 }; sv(); renderEditor(); toast('Раунд удалён'); return; }
    const b = e.target.closest('[data-r]'); if (!b) return;
    if (b.dataset.r === 'add') { const i = CFG.rounds.length, m = i + 1; CFG.rounds.push(normRound({ n: 'Раунд ' + m, vals: R.vals.map((v, j) => (j + 1) * 100 * m), cats: R.cats.map(() => ({ n: '', qs: [] })) }, i)); SEL = { r: i, c: -1, q: -1 }; sv(); }
    else SEL = { r: +b.dataset.r, c: -1, q: -1 };
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
  if ($('qed')) renderQEd(R);
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
  const side = (k, lbl, ph) => `<div class="qside"><label class="tbox"><small>${lbl}</small><textarea id="q${k}" rows="${k === 'Q' ? 3 : 2}" maxlength="${k === 'Q' ? 300 : 160}" placeholder="${ph}">${esc(k === 'Q' ? q.q : q.a)}</textarea></label><div class="mp" id="mp${k}"></div></div>`;
  el.innerHTML = `<div class="qed"><div class="hd"><span class="chip a">${esc(c.n || 'Категория ' + (SEL.c + 1))}</span><span class="chip">${esc(R.vals[SEL.q])}</span><span class="sp"></span><button class="icb" id="qClose" title="Закрыть" aria-label="Закрыть">${ico('x', 18)}</button></div>` +
    `<div class="qcols">${side('Q', 'Вопрос', 'Текст вопроса — его увидят на экране')}${side('A', 'Ответ', 'Правильный ответ — на экране после ответа команды')}</div>` +
    `<div class="qft"><button class="btn ghost sm" id="qClr">${ico('trash', 14)}Очистить</button><span class="sp"></span><button class="btn ghost sm" id="qCl2">Закрыть</button><button class="btn gold sm" id="qNext">Следующий вопрос →</button></div></div>`;
  const sv = () => { STORE.save(); const b = document.querySelector(`.qc2[data-c="${SEL.c}"][data-q="${SEL.q}"]`); if (b) b.outerHTML = qCardHtml(R, q, SEL.c, SEL.q); bindCardsAgain(R); };
  $('qQ').oninput = e => { q.q = e.target.value; sv(); };
  $('qA').oninput = e => { q.a = e.target.value; sv(); };
  mediaPanel($('mpQ'), q, 'qm', sv);
  mediaPanel($('mpA'), q, 'am', sv);
  const close = () => { SEL.c = -1; renderEditor(); };
  $('qClose').onclick = close; $('qCl2').onclick = close;
  $('qClr').onclick = () => { if (!sureBtn($('qClr'))) return; c.qs[SEL.q] = blankQ(); STORE.save(); renderEditor(); focusQ(); };
  $('qNext').onclick = () => { let { c: ci, q: qi } = SEL; qi++; if (qi >= R.vals.length) { qi = 0; ci++; } if (ci >= R.cats.length) SEL.c = -1; else SEL = { r: SEL.r, c: ci, q: qi }; renderEditor(); focusQ(); };
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
  const nb = $('bNext'); nb.innerHTML = esc(lbl) + (sub ? `<small style="display:block;font-size:12px;font-weight:700;opacity:.7;margin-top:2px">${esc(sub)}</small>` : ''); nb.disabled = !fn; nb.style.display = 'block';
  $('ctl').innerHTML = ctlHtml(); bindCtl();
  $('tl').innerHTML = teamsHostHtml(); bindTeams();
  $('cd').textContent = G.code ? `${SHORT} · ${fmtCode(G.code)}` : 'подключаемся…';
  const on = onlineN(); $('onl').textContent = G.netOn ? `на связи: ${on}` : '';
  drawStage($('stg'), scrOf(G), soundHere());
}
function nextAct() {
  if (!G) return ['', null];
  if (G.ph === 'lobby') return ['Начать игру → табло', A.start, Object.keys(G.players).length ? `${Object.keys(G.players).length} ${plural(Object.keys(G.players).length, 'команда', 'команды', 'команд')} в игре` : 'команды подключаются по QR-коду на экране'];
  if (G.ph === 'board') { const l = roundLeft(G); return l ? ['Выберите вопрос на табло', null, `осталось ${l} ${plural(l, 'вопрос', 'вопроса', 'вопросов')} в раунде`] : G.rounds[G.ri + 1] ? [`Следующий раунд: ${G.rounds[G.ri + 1].n}`, () => A.round(G.ri + 1)] : ['Показать победителей', A.final]; }
  if (G.ph === 'cell') return ['Показать вопрос', A.showQ, 'Пробел'];
  if (G.ph === 'q') return ['Показать ответ', A.reveal, 'если никто не ответил верно'];
  if (G.ph === 'ans') return ['Вернуться к табло', A.board];
  if (G.ph === 'final') return ['Игра окончена', null];
  return ['', null];
}
function ctlHtml() {
  const R = curR(G), q = curQ(G), v = curV(G), qq = queue(G), act = qq[0];
  let h = '';
  if (G.cur && q && (G.ph === 'cell' || G.ph === 'q' || G.ph === 'ans')) {
    h += `<div class="qc"><div class="meta"><span class="chip a">${esc(R.cats[G.cur.ci].n)}</span><span class="chip">${esc(v)}</span>${mOk(q.qm) ? `<span class="chip">${ico(MK[q.qm.k][0], 12)}${MK[q.qm.k][1]}</span>` : ''}${mOk(q.am) ? `<span class="chip">ответ: ${MK[q.am.k][1]}</span>` : ''}</div><p class="qt">${esc(q.q || '(вопрос без текста)')}</p><div class="an"><small>Ответ</small>${esc(q.a || '—')}</div>`;
    if (G.ph === 'q') {
      if (G.mode === 'buzz') h += `<div class="buzz${act ? ' on' : ''}">${act ? `<div class="who"><b>${esc(G.players[act].name)}</b><button class="btn ok sm" data-j="1">${ico('check', 15)}Верно +${nums(v)}</button><button class="btn bad sm" data-j="0">${ico('x', 15)}Неверно${G.minus ? ' −' + nums(v) : ''}</button></div>${qq.length > 1 ? `<div class="ql">Следом нажали: ${qq.slice(1).map(id => esc(G.players[id].name)).join(', ')}</div>` : ''}` : `<span class="muted">${G.wr.length ? 'Ждём, нажмёт ли кто-то ещё…' : 'Ждём, кто первый нажмёт «Ответить!»'}</span>`}</div>`;
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
  h += `<div class="ctlr"><button data-c="scores" class="${G.ov === 'scores' ? 'on' : ''}"${G.ph === 'lobby' || G.ph === 'final' ? ' disabled' : ''}>${ico('list', 18)}Счёт на экран</button>` +
    `<button data-c="replay"${hasM && (G.ph === 'q' || G.ph === 'ans') ? '' : ' disabled'}>${ico('replay', 18)}Ещё раз</button>` +
    `<button data-c="snd" class="${G.snd ? '' : 'on'}">${ico(G.snd ? 'vol' : 'mute', 18)}${G.snd ? 'Звук вкл.' : 'Звук выкл.'}</button>` +
    `<button data-c="qr" class="${G.qrz ? 'on' : ''}">${ico('qr', 18)}Код на табло</button>` +
    `<button data-c="final"${G.ph === 'final' ? ' disabled' : ''}>${ico('trophy', 18)}Победители</button>` +
    `<button data-c="board"${G.ph === 'board' || G.ph === 'lobby' ? ' disabled' : ''}>${ico('grid', 18)}К табло</button></div>`;
  return h;
}
function bindCtl() {
  const c = $('ctl');
  c.querySelectorAll('[data-j]').forEach(b => b.onclick = () => A.judge(b.dataset.j === '1'));
  c.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { const [ci, qi] = b.dataset.pk.split('.').map(Number); A.pick(ci, qi); });
  c.querySelectorAll('[data-ri]').forEach(b => b.onclick = () => A.round(+b.dataset.ri));
  c.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const k = b.dataset.c; if (k === 'final' && !confirm2(b, 'Точно? Нажмите ещё раз')) return; A[k](); });
}
function teamsHostHtml() {
  const l = ranked(G), v = curV(G), canPm = !!G.cur && G.ph !== 'board';
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
document.addEventListener('keydown', e => {
  if (VIEW !== 'host' || !G || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '') || $('modal').classList.contains('on')) return;
  if (e.key === ' ' || e.key === 'ArrowRight') { const f = nextAct()[1]; if (f) { e.preventDefault(); f(); } }
  else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') A.replay();
  else if (G.ph === 'q' && (e.key === '+' || e.key === '=')) A.judge(true);
  else if (G.ph === 'q' && (e.key === '-' || e.key === '_')) A.judge(false);
});

/* ================= экран (проектор) ================= */
function viewScreen() {
  document.body.classList.add('scrv');
  $('app').innerHTML = '<div class="sw2"><div class="stage" id="stg"></div></div>';
  const box = $('stg'); let S = null, unlocked = false;
  const ov = document.createElement('div'); ov.className = 'sndov'; ov.innerHTML = '<div>Нажмите, чтобы включить звук<small>и открыть на весь экран</small></div>';
  ov.onclick = () => { unlocked = true; ov.remove(); const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d); box._k = ''; drawStage(box, S, !!(S && S.snd)); };
  document.body.appendChild(ov);
  const bg = () => { document.body.style.background = S && S.acc ? `color-mix(in srgb, ${S.acc} 14%, #06050f)` : '#06050f'; };
  drawStage(box, null);
  if (!GID) { box.querySelector('.in').innerHTML = '<div class="splash"><div class="cat">Откройте экран из пульта ведущего</div></div>'; return; }
  netReady.then(ok => {
    if (!ok) { box.querySelector('.in').innerHTML = '<div class="splash"><div class="cat">Нет связи — проверьте интернет</div></div>'; return; }
    const on = gref(GID, 'on/' + NET.uid), pr = () => { if (NET.connected) { on.onDisconnect().remove(); on.set('scr').catch(() => {}); } }; NET.subs.push(pr); pr();
    gref(GID, 'scr').on('value', x => { S = fixS(x.val()); bg(); drawStage(box, S, unlocked && !!(S && S.snd)); });
  });
}

/* ================= телефон команды ================= */
function viewPlay() {
  document.body.classList.add('ph');
  const app = $('app');
  if (!GID) {
    app.innerHTML = `<div class="pv"><div class="mid"><div style="opacity:.9">${MARK(40)}</div><h2>Своя игра</h2><p>Введите код игры с экрана</p><input class="pin" id="cIn" inputmode="numeric" maxlength="7" placeholder="000 000" style="font-size:28px;letter-spacing:.2em"><button class="pbtn" id="cGo">Войти</button><p class="note" id="cErr"></p></div></div>`;
    const go = () => { const c = $('cIn').value.replace(/\D/g, ''); if (c.length !== 6) { $('cErr').textContent = 'Код — 6 цифр'; return; } netReady.then(ok => { if (!ok) { $('cErr').textContent = 'Нет связи'; return; } ref('codes/' + c).once('value').then(s => { const v = s.val(); if (!v || !v.g) { $('cErr').textContent = 'Игра с таким кодом не найдена'; return; } location.replace(v.k === 'svoya' ? BASE + '?view=play&g=' + v.g : '../quiz/?view=play&g=' + v.g); }); }); };
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
    } else if (C.ph === 'ans') h = `<div class="mid">${C.by === me ? `<div class="pst go"><b>+${nums(C.v)}</b><span>Верно!</span></div>` : ''}<p>Правильный ответ</p><h2>${esc(C.a || '—')}</h2></div>`;
    else if (C.ph === 'final') h = `<div class="mid"><h2>${C.rk && C.rk[me] === 1 ? 'Вы победили!' : 'Игра окончена'}</h2><p>${C.rk && C.rk[me] ? `${C.rk[me]} место · ${nums(sc)} ${plural(sc, 'очко', 'очка', 'очков')}` : ''}</p></div>`;
    const k = h; if (app._h === k) return; app._h = k;
    app.innerHTML = `<div class="pv">${hd}${h}</div>`;
    const ng = $('nGo'); if (ng) { const i = $('nIn'); const go = () => { const v = i.value.trim(); if (!v) { i.focus(); return; } joining = true; ls('set', 'pbs_name', v); draw(); gref(GID, 'join/' + me).set({ name: v.slice(0, 24), table: 0, t: TS() }).then(() => { joining = false; presence(); }, () => { joining = false; app._h = ''; draw(); }); }; ng.onclick = go; i.onkeydown = e => { if (e.key === 'Enter') go(); }; }
    const bz = $('bz'); if (bz) bz.onclick = () => { if (pressing) return; pressing = true; if (navigator.vibrate) navigator.vibrate(30); app._h = ''; draw(); gref(GID, 'ans/' + me + '/' + C.bz).set({ o: 0, t: TS(), c: now() }).then(() => { pressing = false; }, () => { pressing = false; app._h = ''; draw(); }); };
  };
  let presence = () => {};
  netReady.then(ok => {
    if (!ok) { app.innerHTML = '<div class="pv"><div class="mid"><h2>Нет связи</h2><p>Проверьте интернет и обновите страницу</p></div></div>'; return; }
    me = NET.uid;
    const on = gref(GID, 'on/' + me); presence = () => { if (NET.connected && J) { on.onDisconnect().remove(); on.set(true).catch(() => {}); } }; NET.subs.push(presence);
    gref(GID, 'meta').once('value').then(x => { if (!x.exists()) app.innerHTML = '<div class="pv"><div class="mid"><h2>Игра не найдена</h2><p>Попросите у ведущего новый QR-код</p></div></div>'; });
    gref(GID, 'core').on('value', x => { C = x.val(); if (C && C.bz !== lastBz) { lastBz = C.bz; pressing = false; } if (C && C.act === me && lastAct !== me && navigator.vibrate) navigator.vibrate([60, 40, 60]); lastAct = C ? C.act : ''; draw(); });
    gref(GID, 'join/' + me).on('value', x => { J = x.val(); if (J) presence(); app._h = ''; draw(); });
    gref(GID, 'ans/' + me).on('value', x => { MY = x.val(); app._h = ''; draw(); });
  });
}

/* ================= запуск ================= */
function bootHost() {
  const live = ls('get', KEY_LIVE);
  const OPEN = P.get('open'); if (OPEN || P.get('new')) try { history.replaceState(null, '', location.pathname); } catch (e) {}
  if (P.get('new')) { CFG = sampleCfg(); ls('set', KEY_CFG, CFG); }
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
