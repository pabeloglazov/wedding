/* Человеческое бинго · Beloglazov Event
   Ведущий собирает список примет → каждый гость получает свою перемешанную карточку →
   гости ходят по залу, находят людей и отмечают клетки → линия = БИНГО, вся карточка = главный приз.
   Сеть — та же Firebase RTDB и те же пути, что у квиза (g/<gid>/meta|core|scr|q|sc|hb|join|ans|on, codes/<код>).
   Без интернета — BroadcastChannel между вкладками одного устройства. */
(() => {
'use strict';
/* ================= общее ================= */
const P = new URLSearchParams(location.search);
const VIEW = P.get('view') || 'host';
const GID = (P.get('g') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);
const PF_API = 'https://script.google.com/macros/s/AKfycbwvLVfMge8_eCpteZrgj-MpxqO1W_TvQoMAz0jxqx42W8ySqwz2xmutpwKfVGUGZXcG3w/exec';
const DEMO_MAX = 3, DEMO_MIN = 60;
const GNAME = 'Человеческое бинго';
const KEY_CFG = 'pbb_cfg_v1', KEY_LIVE = 'pbb_live_v1', KEY_DEMO = 'pbb_demo_end', KEY_LAST = 'pbb_last';
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function uid(n = 8) { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const r = crypto.getRandomValues(new Uint8Array(n)); for (const x of r) s += a[x % a.length]; return s; }
function plural(n, a, b, c) { const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 10 || y >= 20) ? b : c; }
function ls(op, k, v) { try { if (op === 'get') return JSON.parse(localStorage.getItem(k) || 'null'); if (op === 'set') localStorage.setItem(k, JSON.stringify(v)); if (op === 'del') localStorage.removeItem(k); } catch (e) {} return null; }
function toast(t) { const el = $('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2400); }
function copy(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Ссылка скопирована'), () => window.prompt('Скопируйте ссылку', t)); }
function qr(el, text, size = 512) { if (!el || !window.QRCode) return; el.innerHTML = ''; try { new QRCode(el, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {} }
function modal(html, onReady) { $('mbox').innerHTML = html; $('modal').classList.add('on'); if (onReady) onReady($('mbox')); }
function closeModal() { $('modal').classList.remove('on'); }
document.addEventListener('click', e => { if (e.target && e.target.id === 'modal') closeModal(); if (e.target && e.target.closest && e.target.closest('[data-close]')) closeModal(); });
const BASE = location.origin + location.pathname;
const SHORT = (location.host + location.pathname.replace(/[^/]*$/, '') + 'play').replace(/^www\./, '');
const fmtCode = c => c ? String(c).replace(/(\d{3})(\d{3})/, '$1 $2') : '';
const BRAND = sub => window.PB_BRAND ? PB_BRAND.lockup(sub) : '<b>Beloglazov Event</b>';
const MARK = n => window.PB_BRAND ? PB_BRAND.mark(n) : '';
const initial = n => (String(n || '?').trim().charAt(0) || '?').toUpperCase();
const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
function cleanName(n) { return String(n || '').replace(/\s+/g, ' ').trim().slice(0, 24); }
const COLS = ['#e07a5f', '#3d9a8b', '#d9a441', '#7b6fd6', '#5b8def', '#c7659b', '#6aa84f', '#d98c6c'];
function hash(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const colOf = n => COLS[hash(norm(n)) % COLS.length];
const av = (n, cls) => `<i class="av${cls ? ' ' + cls : ''}" style="background:${colOf(n)}">${esc(initial(n))}</i>`;
const mmss = ms => { ms = Math.max(0, ms); const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return m + ':' + String(s).padStart(2, '0'); };
const clean = o => JSON.parse(JSON.stringify(o));

/* ---------- карточки: одинаково считаются у ведущего и у гостя ---------- */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function cardOf(gid, pid, n, size) {
  const a = Array.from({ length: n }, (_, i) => i), r = rng(hash(gid + ':' + pid));
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a.slice(0, size * size);
}
const LINES = {};
function linesOf(size) {
  if (LINES[size]) return LINES[size];
  const L = [], d1 = [], d2 = [];
  for (let r = 0; r < size; r++) { const row = [], col = []; for (let c = 0; c < size; c++) { row.push(r * size + c); col.push(c * size + r); } L.push(row, col); d1.push(r * size + r); d2.push(r * size + size - 1 - r); }
  L.push(d1, d2);
  return (LINES[size] = L);
}
const doneLines = (marked, size) => linesOf(size).filter(l => l.every(c => marked.has(c)));
function lineCells(marked, size) { const s = new Set(); doneLines(marked, size).forEach(l => l.forEach(c => s.add(c))); return s; }

/* ---------- библиотека примет ---------- */
const LIB = ['был(а) в 3+ странах', 'играет на музыкальном инструменте', 'родился(ась) не в этом городе', 'знает жениха больше 10 лет', 'знает невесту со школы',
  'умеет готовить плов', 'бегал(а) марафон', 'есть собака', 'говорит на 3 языках', 'пел(а) в хоре', 'прыгал(а) с парашютом', 'левша', 'был(а) на Байкале',
  'работает врачом', 'носит очки', 'танцевал(а) на выпускном вальс', 'водит мотоцикл', 'есть кошка', 'родился(ась) летом', 'видел(а) северное сияние',
  'умеет жонглировать', 'ночевал(а) в палатке в этом году', 'выступал(а) на сцене', 'работает учителем', 'ездил(а) автостопом', 'катается на сноуборде',
  'вяжет или вышивает', 'сажал(а) дерево', 'знает наизусть стихотворение', 'был(а) на свадьбе в другой стране', 'встречал(а) рассвет в горах', 'есть брат или сестра-близнец'];
const BOTS = ['Оля', 'Дима', 'Катя', 'Игорь', 'Маша', 'Саша', 'Вера', 'Паша'];

/* ---------- звук (синтез, без файлов) ---------- */
const SND = (() => {
  let ctx = null;
  function unlock() { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) {} }
  function tone(f, d, type = 'sine', v = .2, when = 0, slide = 0) {
    const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + .05);
  }
  function noise(d, v = .2, when = 0, hp = 800) {
    const t = ctx.currentTime + when, len = Math.max(1, Math.floor(ctx.sampleRate * d)), buf = ctx.createBuffer(1, len, ctx.sampleRate), a = buf.getChannelData(0);
    for (let i = 0; i < len; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = v; s.connect(f).connect(g).connect(ctx.destination); s.start(t);
  }
  const FX = {
    join() { tone(880, .12, 'sine', .12); tone(1320, .14, 'sine', .08, .06); },
    start() { noise(.35, .1, 0, 1500); tone(392, .18, 'triangle', .14, .05); tone(587, .28, 'triangle', .14, .18); },
    find() { tone(660, .09, 'triangle', .1); tone(990, .16, 'triangle', .08, .07); },
    fanfare() { const n = [523, 659, 784, 1047, 784, 1047], d = [.15, .15, .15, .35, .15, .7]; let t = 0; n.forEach((f, i) => { tone(f, d[i] + .1, 'sawtooth', .06, t); tone(f / 2, d[i] + .1, 'triangle', .08, t); t += d[i]; }); noise(1.4, .05, t - .7, 3000); },
    final() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .6, 'triangle', .12, i * .12)); noise(1.2, .05, .5, 3000); }
  };
  return { unlock, play(n) { if (!ctx || ctx.state !== 'running') return; try { FX[n](); } catch (e) {} } };
})();

/* ================= сеть: Firebase (как у квиза) ================= */
const FB = { apiKey: 'AIzaSyADi9iG0ZtHg9zGBomUKpTpgaANStenR3Y', authDomain: 'beloglazov-games.firebaseapp.com', databaseURL: 'https://beloglazov-games-default-rtdb.firebaseio.com', projectId: 'beloglazov-games' };
const NET = { ok: false, uid: null, db: null, off: 0, connected: false, rtt: 0, subs: [], since: Date.now() };
const now = () => Date.now() + NET.off;
const netReady = new Promise(res => {
  try {
    if (!window.firebase || P.get('offline')) return res(false);
    firebase.initializeApp(FB);
    let done = false; const to = setTimeout(() => { if (!done) { done = true; res(false); } }, 12000);
    firebase.auth().onAuthStateChanged(u => {
      if (!u || done) return;
      done = true; clearTimeout(to);
      NET.uid = u.uid; NET.db = firebase.database(); NET.ok = true;
      NET.db.ref('.info/serverTimeOffset').on('value', x => { NET.off = x.val() || 0; });
      NET.db.ref('.info/connected').on('value', x => { NET.connected = !!x.val(); NET.since = Date.now(); NET.subs.forEach(f => { try { f(); } catch (e) {} }); });
      res(true);
    });
    firebase.auth().signInAnonymously().catch(() => { if (!done) { done = true; clearTimeout(to); res(false); } });
  } catch (e) { res(false); }
});
const ref = p => NET.db.ref(p);
const gref = (gid, p) => ref('g/' + gid + (p ? '/' + p : ''));
const TS = () => firebase.database.ServerValue.TIMESTAMP;

/* ================= аккаунт платформы (как у квиза) ================= */
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
const unlocked = () => !!(ACC.info && ACC.info.unlocked);
const TIER = { demo: { n: 'Бесплатный', max: DEMO_MAX }, basic: { n: 'Базовый', max: 10 }, pro: { n: 'Продвинутый', max: 100 }, biz: { n: 'Бизнес', max: 100000 } };
const myTier = () => unlocked() ? (TIER[ACC.info.tier] ? ACC.info.tier : 'pro') : 'demo';
const guestCap = () => unlocked() ? (ACC.info.max || TIER[myTier()].max) : DEMO_MAX;
function goLogin() { try { localStorage.setItem('pb_next', 'bingo'); } catch (e) {} location.href = '../host/'; }
const ICON_LOCK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const TRASH = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7M6.5 7l.8 12.2c.1.9.8 1.8 1.8 1.8h5.8c1 0 1.7-.9 1.8-1.8L17.5 7"/></svg>';
function upsellHtml(title, text) {
  return `<div class="ups"><div class="upi">${ICON_LOCK}</div><h3>${title}</h3><p class="muted">${text}</p><p class="muted small">Настройки игры сохранятся — после смены тарифа просто обновите страницу.</p>` +
    `<div class="links"><a class="btn gold" href="../#pricing" target="_blank" rel="noopener">Выбрать тариф</a><button class="btn ghost" data-close>Не сейчас</button></div></div>`;
}

/* ================= канал между вкладками одного устройства ================= */
let ch = null; const handlers = [];
try { ch = new BroadcastChannel('pbbingo1'); ch.onmessage = e => handlers.forEach(h => h(e.data)); } catch (e) {}
const send = m => { if (ch) try { ch.postMessage(m); } catch (e) {} };
const onMsg = h => handlers.push(h);

/* ================= настройки ведущего ================= */
function defaultCfg() {
  return { id: uid(10), title: 'Человеческое бинго', couple: '', traits: LIB.slice(0, 20).map(t => ({ id: uid(6), t })), size: 4, reuse: 1,
    prizeLine: 'Бутылка шампанского', prizeFull: 'Главный приз от пары', bots: false, sound: true };
}
function normCfg(c) {
  const d = defaultCfg(); if (!c || typeof c !== 'object') return d;
  const str = (v, dv, n) => String(v == null ? dv : v).slice(0, n);
  return { id: c.id || d.id, title: str(c.title, d.title, 60), couple: str(c.couple, '', 60),
    traits: Array.isArray(c.traits) ? c.traits.filter(x => x && typeof x.t === 'string').map(x => ({ id: x.id || uid(6), t: x.t.slice(0, 80) })) : d.traits,
    size: c.size === 3 ? 3 : 4, reuse: c.reuse === 2 ? 2 : 1, prizeLine: str(c.prizeLine, d.prizeLine, 80), prizeFull: str(c.prizeFull, d.prizeFull, 80),
    bots: !!c.bots, sound: c.sound !== false, isDemo: !!c.isDemo };
}
let CFG = normCfg(ls('get', KEY_CFG));
const saveCfg = () => ls('set', KEY_CFG, CFG);
function goodTraits(c) { const seen = new Set(), out = []; c.traits.forEach(x => { const t = x.t.replace(/\s+/g, ' ').trim(); if (t && !seen.has(norm(t))) { seen.add(norm(t)); out.push(t); } }); return out; }

/* ================= движок игры (у ведущего) ================= */
let G = null, botTimers = [];
function newGame() {
  const tr = goodTraits(CFG);
  endNet(); clearBots();
  G = { id: uid(12), net: NET.ok, ts: Date.now(), code: '', title: CFG.title, couple: CFG.couple, size: CFG.size, reuse: CFG.reuse, prizeLine: CFG.prizeLine, prizeFull: CFG.prizeFull,
    traits: tr, phase: 'lobby', t0: 0, t1: 0, players: {}, finds: {}, feed: [], ev: [], firstLine: '', firstFull: '', banned: {}, ver: 0,
    demo: !unlocked(), cap: guestCap(), bots: !!CFG.bots, sound: CFG.sound !== false };
  if (G.demo) { let de = ls('get', KEY_DEMO); if (!de || de < Date.now()) de = Date.now() + DEMO_MIN * 60000; ls('set', KEY_DEMO, de); G.demoEnd = de; }
  if (G.net) startNet();
  publish();
  if (G.bots) addBots();
}
function publish() { G.ver++; ls('set', KEY_LIVE, G); send({ type: 'state', g: G }); netPush(); render(); }
const netCount = () => Object.values(G.players).filter(p => p.net).length;
function join(pid, name, net) {
  if (!G || G.banned[pid]) return;
  name = cleanName(name) || 'Гость';
  const p = G.players[pid];
  if (p) { if (p.name === name) return; p.name = name; }
  else {
    if (net && netCount() >= (G.cap || DEMO_MAX)) { if (NET.ok) gref(G.id, 'sc/' + pid).set({ nospace: true, demo: !!G.demo }); if (!G.capHit) { G.capHit = 1; publish(); } return; }
    G.players[pid] = { name, net: !!net, jt: Date.now(), nf: 0, ln: 0, lt: 0, ft: 0 };
  }
  publish();
}
function kick(pid) {
  if (!G || !G.players[pid]) return;
  delete G.players[pid]; delete G.finds[pid]; G.banned[pid] = 1;
  if (G.net && NET.ok && !/^bot|^me$/.test(pid)) gref(G.id, 'sc/' + pid).set({ kicked: true });
  publish();
}
const personKey = v => v.p ? 'p:' + v.p : 'n:' + norm(v.n);
function resolvePerson(pid, v) {
  let p = String((v && v.p) || ''), n = cleanName(v && v.n);
  if (p && G.players[p]) n = G.players[p].name;
  else { p = ''; if (!n) return null; const m = Object.keys(G.players).find(k => norm(G.players[k].name) === norm(n)); if (m) p = m; }
  if (p === pid) return null;
  return { p, n };
}
function feedPush(it) { it.id = uid(6); it.t = now(); G.feed.push(it); if (G.feed.length > 40) G.feed.splice(0, G.feed.length - 40); }
/* отметить клетку (v = {p, n}) или снять отметку (v = null). Возвращает true, если что-то изменилось */
function setCell(pid, cell, v, t) {
  if (!G || G.phase !== 'play' || !G.players[pid]) return false;
  const N = G.size * G.size; cell = +cell; if (!(cell >= 0 && cell < N)) return false;
  const F = G.finds[pid] || (G.finds[pid] = {});
  if (!v) { if (!F[cell]) return false; delete F[cell]; recalc(pid); return true; }
  const r = resolvePerson(pid, v); if (!r) return false;
  const k = personKey(r), cur = F[cell];
  if (cur && personKey(cur) === k) return false;
  if (Object.keys(F).filter(c => +c !== cell && personKey(F[c]) === k).length >= G.reuse) return false;
  F[cell] = { p: r.p, n: r.n, t: t || now() };
  const card = cardOf(G.id, pid, G.traits.length, G.size);
  feedPush({ k: 'find', a: G.players[pid].name, b: r.n, tr: G.traits[card[cell]] || '' });
  recalc(pid);
  return true;
}
function recalc(pid) {
  const F = G.finds[pid] || {}, m = new Set(Object.keys(F).map(Number)), p = G.players[pid];
  p.nf = m.size; p.ln = doneLines(m, G.size).length;
  if (p.ln > 0 && !p.lt) { p.lt = now(); const first = !G.firstLine; if (first) G.firstLine = pid; evPush('line', pid, first); }
  if (m.size === G.size * G.size && !p.ft) { p.ft = now(); const first = !G.firstFull; if (first) G.firstFull = pid; evPush('full', pid, first); }
}
function evPush(k, pid, first) {
  const name = G.players[pid].name;
  G.ev.push({ id: uid(6), k, name, first: !!first, t: now() }); if (G.ev.length > 8) G.ev.shift();
  feedPush({ k, a: name, first: !!first });
}
/* синхронизация всех клеток гостя из ans/<pid> (сеть) */
function syncFinds(pid, map) {
  if (!G || G.phase !== 'play' || !G.players[pid] || !map) return false;
  const F = G.finds[pid] || {}, N = G.size * G.size, list = [];
  Object.keys(map).forEach(k => { const v = map[k]; if (v && +k >= 0 && +k < N) list.push([+k, v]); });
  let ch = false;
  for (let c = 0; c < N; c++) if (F[c] && !list.some(x => x[0] === c && +x[1].o >= 0)) ch = setCell(pid, c, null) || ch;
  list.sort((a, b) => (+a[1].t || 0) - (+b[1].t || 0)).forEach(([c, v]) => {
    if (+v.o < 0) ch = setCell(pid, c, null) || ch;
    else ch = setCell(pid, c, { p: v.p, n: v.n }, +v.t || 0) || ch;
  });
  return ch;
}
function next() {
  if (!G) return;
  if (G.phase === 'lobby') { if (!Object.keys(G.players).length) return; G.phase = 'play'; G.t0 = now(); feedPush({ k: 'start' }); if (G.bots) botPlay(); }
  else if (G.phase === 'play') { G.phase = 'final'; G.t1 = now(); clearBots(); }
  else return;
  publish();
}
function ranked(g) {
  g = g || G;
  return Object.keys(g.players).map(id => Object.assign({ id }, g.players[id])).sort((a, b) =>
    (a.ft ? 0 : 1) - (b.ft ? 0 : 1) || (a.ft && b.ft ? a.ft - b.ft : 0) || b.ln - a.ln || b.nf - a.nf || (a.lt || 9e15) - (b.lt || 9e15) || a.name.localeCompare(b.name));
}
function nominations(g) {
  const P = g.players, nm = id => (P[id] || {}).name || '';
  const soc = Object.keys(P).map(id => ({ id, nf: P[id].nf || 0 })).sort((a, b) => b.nf - a.nf)[0];
  const cnt = {}, names = {};
  Object.keys(g.finds).forEach(pid => Object.values(g.finds[pid] || {}).forEach(v => { const k = personKey(v); cnt[k] = (cnt[k] || 0) + 1; names[k] = v.n; }));
  const star = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
  return { line: g.firstLine ? nm(g.firstLine) : '', full: g.firstFull ? nm(g.firstFull) : '',
    social: soc && soc.nf ? { n: nm(soc.id), c: soc.nf } : null, star: star ? { n: names[star], c: cnt[star] } : null };
}

/* ---------- боты для проверки и демо ---------- */
function clearBots() { botTimers.forEach(clearTimeout); botTimers = []; }
function addBots() {
  BOTS.slice(0, 6).forEach((n, i) => botTimers.push(setTimeout(() => {
    if (!G || G.phase !== 'lobby') return;
    const id = 'bot' + i; if (!G.players[id] && !G.banned[id]) { G.players[id] = { name: n, net: false, bot: true, jt: Date.now(), nf: 0, ln: 0, lt: 0, ft: 0 }; publish(); }
  }, 600 + i * 450)));
}
function botPlay() {
  Object.keys(G.players).filter(id => G.players[id].bot).forEach((id, i) => {
    const tick = () => {
      if (!G || G.phase !== 'play' || !G.players[id]) return;
      const F = G.finds[id] || {}, N = G.size * G.size, empty = []; for (let c = 0; c < N; c++) if (!F[c]) empty.push(c);
      if (empty.length) {
        const others = Object.keys(G.players).filter(x => x !== id && !Object.values(F).some(v => v.p === x));
        const cell = empty[Math.floor(Math.random() * empty.length)];
        const who = others.length && Math.random() < .75 ? { p: others[Math.floor(Math.random() * others.length)] } : { n: ['Тётя Люба', 'Дядя Коля', 'Артём', 'Лиза', 'Никита', 'Настя', 'Рома', 'Юля', 'Света', 'Женя', 'Максим', 'Алина'][Math.floor(Math.random() * 12)] };
        if (setCell(id, cell, who)) publish();
      }
      botTimers.push(setTimeout(tick, 3500 + Math.random() * 6000));
    };
    botTimers.push(setTimeout(tick, 1500 + i * 900 + Math.random() * 2500));
  });
}

/* ================= сеть: ведущий ================= */
let hostOff = [], lastCore = '', lastScr = '', scrTimer = null, hbTimer = null, ONLINE = {}, lastSc = {};
async function allocCode(gid) {
  for (let i = 0; i < 8; i++) {
    const c = String(100000 + Math.floor(Math.random() * 900000));
    try { const r = await ref('codes/' + c).transaction(cur => cur ? undefined : { g: gid, t: Date.now(), k: 'bingo' }); if (r.committed) return c; } catch (e) {}
  }
  return '';
}
async function startNet() {
  const gid = G.id;
  ls('set', KEY_LAST, { gid, code: '' });
  lastCore = ''; lastScr = ''; lastSc = {};
  try {
    await gref(gid, 'meta').set({ host: NET.uid, t: TS() });
    if (!G || G.id !== gid) return;
    attachNet();
    gref(gid, 'q').set(G.traits.map(t => ({ t })));
    netPush(true);
    const code = await allocCode(gid);
    if (G && G.id === gid && code) { G.code = code; ls('set', KEY_LAST, { gid, code }); publish(); }
  } catch (e) { console.warn('bingo net', e); }
}
function attachNet() {
  const gid = G.id;
  const jr = gref(gid, 'join'), ar = gref(gid, 'ans'), orf = gref(gid, 'on');
  const onJ = x => { const v = x.val(); if (v && G && G.id === gid) join(x.key, v.name, true); };
  const onA = x => { const v = x.val(); if (!v || !G || G.id !== gid) return; if (syncFinds(x.key, v)) publish(); };
  const onO = x => { ONLINE = x.val() || {}; renderNetLine(); if (G && liveBuilt) renderLive(); };
  jr.on('child_added', onJ); jr.on('child_changed', onJ);
  ar.on('child_added', onA); ar.on('child_changed', onA);
  orf.on('value', onO);
  clearInterval(hbTimer);
  hbTimer = setInterval(() => { if (!G || G.id !== gid) return; const t = performance.now(); gref(gid, 'hb').set(TS()).then(() => { NET.rtt = Math.round(performance.now() - t); renderNetLine(); }).catch(() => {}); }, 5000);
  hostOff.push(() => { jr.off(); ar.off(); orf.off(); clearInterval(hbTimer); });
}
/* ответы, пришедшие в лобби, применяем при старте */
function resyncAll() {
  if (!G || !G.net || !NET.ok) return;
  const gid = G.id;
  gref(gid, 'ans').once('value').then(x => { const v = x.val() || {}; let chg = false; Object.keys(v).forEach(pid => { chg = syncFinds(pid, v[pid]) || chg; }); if (chg && G && G.id === gid) publish(); }).catch(() => {});
}
function endNet() {
  hostOff.forEach(f => f()); hostOff = [];
  clearTimeout(scrTimer); scrTimer = null; ONLINE = {};
  const last = ls('get', KEY_LAST); ls('del', KEY_LAST);
  if (NET.ok && last && last.gid) {
    if (last.code) ref('codes/' + last.code).remove().catch(() => {});
    gref(last.gid).remove().catch(() => {});
  }
}
function coreOf(g) {
  const pl = {}; Object.keys(g.players).forEach(id => { pl[id] = g.players[id].name; });
  return { k: 'bingo', id: g.id, phase: g.phase, title: g.title || '', couple: g.couple || '', size: g.size, reuse: g.reuse, pL: g.prizeLine || '', pF: g.prizeFull || '',
    code: g.code || '', demo: !!g.demo, t0: g.t0 || 0, n: Object.keys(g.players).length, pl };
}
function scOf(g, pid) {
  const p = g.players[pid], F = g.finds[pid] || {}, f = {};
  Object.keys(F).forEach(c => { f[c] = { p: F[c].p || '', n: F[c].n }; });
  return { nf: p.nf || 0, ln: p.ln || 0, lt: p.lt ? 1 : 0, ft: p.ft ? 1 : 0, fl: g.firstLine === pid ? 1 : 0, ff: g.firstFull === pid ? 1 : 0, rank: ranked(g).findIndex(x => x.id === pid) + 1, f };
}
function pushSc() {
  const upd = {};
  Object.keys(G.players).forEach(pid => { if (!G.players[pid].net) return; const s = scOf(G, pid), k = JSON.stringify(s); if (lastSc[pid] !== k) { lastSc[pid] = k; upd[pid] = s; } });
  if (Object.keys(upd).length) gref(G.id, 'sc').update(clean(upd));
}
function netPush(force) {
  if (!G || !G.net || !NET.ok) return;
  const gid = G.id, core = coreOf(G), ck = JSON.stringify(core);
  if (ck !== lastCore) { lastCore = ck; gref(gid, 'core').set(clean(core)); }
  const sk = JSON.stringify(scrOf(G));
  if (sk !== lastScr) {
    lastScr = sk;
    if (force) { clearTimeout(scrTimer); scrTimer = null; gref(gid, 'scr').set(clean(scrOf(G))); }
    else if (!scrTimer) scrTimer = setTimeout(() => { scrTimer = null; if (G && G.id === gid) gref(gid, 'scr').set(clean(scrOf(G))); }, 250);
  }
  pushSc();
}
const playLink = g => g && g.net ? BASE + '?view=play&g=' + g.id : BASE + '?view=play&local=1';
const screenNetLink = g => BASE + '?view=screen&g=' + g.id;

/* ================= состояние экрана ================= */
function scrOf(g) {
  const r = ranked(g), N = g.size * g.size;
  const bits = id => { const F = g.finds[id] || {}; let s = ''; for (let c = 0; c < N; c++) s += F[c] ? '1' : '0'; return s; };
  const lines = Object.values(g.players).filter(p => p.lt).length;
  return { id: g.id, title: g.title || '', couple: g.couple || '', code: g.code || '', phase: g.phase, demo: !!g.demo, size: g.size, net: !!g.net,
    n: r.length, nf: r.reduce((s, p) => s + (p.nf || 0), 0), nl: lines, nfull: Object.values(g.players).filter(p => p.ft).length,
    pL: g.prizeLine || '', pF: g.prizeFull || '', t0: g.t0 || 0, t1: g.t1 || 0,
    top: r.slice(0, 5).map(p => ({ n: p.name, f: p.nf || 0, l: p.ln || 0, full: p.ft ? 1 : 0, b: bits(p.id) })),
    names: r.slice().sort((a, b) => a.jt - b.jt).slice(-60).map(p => p.name),
    feed: g.feed.slice(-12), ev: g.ev.slice(-4), fin: g.phase === 'final' ? nominations(g) : null };
}
function fixScr(v) {
  if (!v) return null;
  v.top = (v.top || []).map(p => Object.assign({ n: '', f: 0, l: 0, full: 0, b: '' }, p)); v.names = v.names || []; v.feed = v.feed || []; v.ev = v.ev || [];
  return v;
}

/* ================= экран (проектор) ================= */
const ruGuests = n => plural(n, 'гость', 'гостя', 'гостей');
function feedHtml(it) {
  if (it.k === 'find') return `<div class="fi" data-id="${esc(it.id)}"><div class="fw">${av(it.a)}<b>${esc(it.a)}</b><span class="ar">нашёл(ла)</span>${av(it.b)}<b>${esc(it.b)}</b></div><div class="ft">${esc(it.tr)}</div></div>`;
  if (it.k === 'line' || it.k === 'full') return `<div class="fi hot" data-id="${esc(it.id)}"><div class="fw"><span class="em">${it.k === 'full' ? '🏆' : '🎉'}</span>${av(it.a)}<b>${esc(it.a)}</b><span class="ar">${it.k === 'full' ? 'закрыл(а) всю карточку' : 'собрал(а) линию'}${it.first ? ' первым(ой)!' : ''}</span></div></div>`;
  if (it.k === 'start') return `<div class="fi" data-id="${esc(it.id)}"><div class="fw"><span class="em">🔔</span><b>Игра началась — ищите людей!</b></div></div>`;
  return '';
}
function miniCard(bits, size) { return `<span class="mc s${size}">${bits.split('').map(b => `<i class="${b === '1' ? 'on' : ''}"></i>`).join('')}</span>`; }
function renderScreen(box, S, snd) {
  if (!box) return;
  const key = !S ? 'none' : S.phase + ':' + (S.phase === 'lobby' ? S.code : '');
  if (box._key !== key || !box.firstChild) { box._key = key; buildScreen(box, S, snd); }
  updScreen(box, S, snd);
}
function buildScreen(box, S, snd) {
  if (!S) { box.innerHTML = `<div class="sv center"><div class="kk">${GNAME}</div><h1>Ждём ведущего</h1><p class="muted" style="font-size:1.3em">Игра появится здесь, когда ведущий её запустит</p></div>${MARK ? '<div class="pb-lock scrb">' + MARK(34) + '</div>' : ''}`; return; }
  let h = '<div class="glow"></div>';
  if (S.phase === 'lobby') {
    h += `<div class="sv"><div class="lob"><div class="left"><div class="kk">${GNAME}</div><h1 class="cpl">${esc(S.couple || S.title)}</h1>` +
      `<p class="lsub">На вашей карточке — ${S.size * S.size} примет. Найдите среди гостей людей, которые им подходят. Соберите линию — и приз ваш.</p>` +
      `<div class="rules"><span><i>1</i>Сканируйте QR</span><span><i>2</i>Ищите людей</span><span><i>3</i>Линия — БИНГО!</span></div>` +
      `<div class="lcount"><b id="sN">0</b><span><span id="sNl">гостей</span> в игре</span></div><div class="chips" id="sChips"></div></div>` +
      `<div class="right"><div class="join"><div class="qr" id="sQr"></div><div class="jurl">${esc(SHORT)}</div><div class="jcode" id="sCode"></div></div></div></div></div>`;
  } else if (S.phase === 'play') {
    h += `<div class="sv bp"><div class="bhead"><div class="bt"><div class="kk">${esc(S.couple || GNAME)} · <span id="sT">0:00</span></div><h1>Ищите людей!</h1></div>` +
      `<div class="bstats"><div><b id="sN">0</b><span id="sNl">гостей</span></div><div><b id="sF">0</b><span id="sFl">находок</span></div><div><b id="sL">0</b><span id="sLl">линий</span></div></div>` +
      `<div class="mini"><div class="qr" id="sQr"></div><div><small>войти</small><b id="sCode2"></b></div></div></div>` +
      `<div class="bbody"><div class="bcol"><h5>Лидеры</h5><div class="blead" id="sLead"></div></div><div class="bcol"><h5><i class="ldot"></i>Лента находок</h5><div class="bfeed" id="sFeed"></div></div></div>` +
      `<div class="bprize"><span>🎉 Первая линия — <b>${esc(S.pL || 'приз')}</b></span><span>🏆 Вся карточка — <b>${esc(S.pF || 'главный приз')}</b></span></div></div>`;
  } else {
    const f = S.fin || {};
    const card = (ic, lb, nm, sub, i) => `<div class="nm4" style="animation-delay:${.4 + i * .55}s"><i>${ic}</i><span>${lb}</span><b>${esc(nm || '—')}</b><small>${esc(sub || '')}</small></div>`;
    h += `<div class="sv bf"><div class="kk" style="text-align:center">${esc(S.couple || GNAME)}</div><h1 style="text-align:center">Итоги бинго</h1>` +
      `<div class="noms4">${card('🎉', 'Первая линия', f.line, f.line ? S.pL : 'никто не успел', 0)}${card('🏆', 'Вся карточка', f.full, f.full ? S.pF : 'никто не закрыл', 1)}` +
      `${card('🤝', 'Самый общительный', f.social && f.social.n, f.social ? f.social.c + ' ' + plural(f.social.c, 'находка', 'находки', 'находок') : '', 2)}${card('⭐', 'Звезда вечера', f.star && f.star.n, f.star ? 'нашли ' + f.star.c + ' ' + plural(f.star.c, 'раз', 'раза', 'раз') : '', 3)}</div>` +
      `<div class="fsum" style="animation-delay:2.6s">${S.n} ${ruGuests(S.n)} · ${S.nf} ${plural(S.nf, 'находка', 'находки', 'находок')} · ${S.nl} ${plural(S.nl, 'линия', 'линии', 'линий')}${S.t1 && S.t0 ? ' · ' + mmss(S.t1 - S.t0) : ''}</div></div>`;
    if (snd) SND.play('final');
  }
  h += `<div class="pb-lock scrb">${MARK(34)}</div><div class="bcel" id="sCel"></div>`;
  box.innerHTML = h;
  box._chips = 0; box._feed = ''; box._ev = null; box._q = '';
}
function updScreen(box, S, snd) {
  if (!box || !S || !box.firstChild) return;
  const set = (id, v) => { const el = box.querySelector('#' + id); if (el && el.textContent !== String(v)) el.textContent = v; };
  if (box.querySelector('#sQr') && box._q !== S.code + S.net + S.id) {
    box._q = S.code + S.net + S.id;
    qr(box.querySelector('#sQr'), S.net ? BASE + '?view=play&g=' + S.id : BASE + '?view=play&local=1', 400);
    const c = box.querySelector('#sCode'); if (c) c.innerHTML = S.code ? `<span>код</span><b>${fmtCode(S.code)}</b>` : S.net ? '<span>код…</span>' : '<span>без интернета</span>';
    set('sCode2', S.code ? fmtCode(S.code) : S.net ? '…' : 'по QR');
  }
  set('sN', S.n); set('sNl', ruGuests(S.n)); set('sF', S.nf); set('sFl', plural(S.nf, 'находка', 'находки', 'находок')); set('sL', S.nl); set('sLl', plural(S.nl, 'линия', 'линии', 'линий'));
  if (S.phase === 'play' && S.t0) set('sT', mmss(now() - S.t0));
  const chips = box.querySelector('#sChips');
  if (chips && box._chips !== S.names.length) {
    if (S.names.length > box._chips && box._chips && snd) SND.play('join');
    box._chips = S.names.length; chips.innerHTML = S.names.map(n => `<span>${av(n)}${esc(n)}</span>`).join('');
  }
  const lead = box.querySelector('#sLead');
  if (lead) {
    const k = JSON.stringify(S.top);
    if (lead._k !== k) { lead._k = k; lead.innerHTML = S.top.length ? S.top.map((p, i) => `<div class="lr${p.full ? ' full' : p.l ? ' ln' : ''}"><span class="pl">${i + 1}</span>${av(p.n)}<b>${esc(p.n)}</b>${miniCard(p.b, S.size)}<span class="sc">${p.full ? '🏆' : p.l ? '🎉 ' + p.l : ''}<em>${p.f}/${S.size * S.size}</em></span></div>`).join('') : '<div class="empty">Пока никто ничего не нашёл</div>'; }
  }
  const feed = box.querySelector('#sFeed');
  if (feed) {
    const ids = S.feed.map(x => x.id).join(',');
    if (box._feed !== ids) {
      const had = new Set(box._feed ? box._feed.split(',') : []), first = !box._feed;
      feed.innerHTML = S.feed.slice().reverse().map(feedHtml).join('') || '<div class="empty">Здесь появятся находки гостей</div>';
      if (!first) [...feed.querySelectorAll('.fi')].forEach(el => { if (!had.has(el.dataset.id)) el.classList.add('new'); });
      if (!first && snd && S.feed.some(x => !had.has(x.id) && x.k === 'find')) SND.play('find');
      box._feed = ids;
    }
  }
  // праздник: линия / вся карточка
  const cel = box.querySelector('#sCel');
  if (cel) {
    if (box._ev == null) box._ev = S.ev.length ? S.ev[S.ev.length - 1].id : '';
    const idx = S.ev.findIndex(e => e.id === box._ev), fresh = S.ev.slice(idx + 1);
    if (fresh.length && !cel._busy) {
      const e = fresh[0]; box._ev = e.id; cel._busy = true;
      const full = e.k === 'full';
      cel.innerHTML = `<div class="conf">${confetti(46)}</div><div class="bin"><div class="bw">${full ? 'Вся карточка!' : 'БИНГО!'}</div>${av(e.name, 'xl')}<div class="bn">${esc(e.name)}</div>` +
        `<div class="bs">${full ? (e.first ? 'первым(ой) закрывает всю карточку' : 'закрывает всю карточку') : (e.first ? 'первая линия в зале' : 'собирает линию')}</div>${e.first ? `<div class="bpz">${full ? '🏆' : '🎁'} ${esc(full ? S.pF : S.pL)}</div>` : ''}</div>`;
      cel.classList.add('on'); if (snd) SND.play('fanfare');
      setTimeout(() => { cel.classList.remove('on'); setTimeout(() => { cel._busy = false; cel.innerHTML = ''; }, 500); }, e.first ? 6500 : 4200);
    }
  }
}
function confetti(n) { let h = ''; for (let i = 0; i < n; i++) h += `<i style="left:${Math.random() * 100}%;background:${COLS[i % COLS.length]};animation-delay:${(Math.random() * .9).toFixed(2)}s;animation-duration:${(2.2 + Math.random() * 1.6).toFixed(2)}s;transform:rotate(${Math.floor(Math.random() * 360)}deg)"></i>`; return h; }

function soundOverlay() {
  const d = document.createElement('div'); d.className = 'sndov';
  d.innerHTML = '<div>🔊 Нажмите, чтобы включить звук<small>и открыть экран на весь экран</small></div>';
  d.onclick = () => { SND.unlock(); d.remove(); const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); };
  document.body.appendChild(d);
}
function screenShell() {
  document.body.classList.add('solo-screen'); document.title = 'Экран · ' + GNAME;
  { let it = 0; const wake = () => { document.body.classList.remove('idle'); clearTimeout(it); it = setTimeout(() => document.body.classList.add('idle'), 3000); }; ['mousemove', 'mousedown', 'keydown'].forEach(ev => document.addEventListener(ev, wake, { passive: true })); wake(); }
  $('app').innerHTML = '<div class="stage full" id="stg"></div><button class="btn ghost sm fsbtn" id="fs">⛶ На весь экран</button>';
  $('fs').onclick = () => { SND.unlock(); const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d); };
  soundOverlay();
  return $('stg');
}
function viewScreenLocal() {
  const box = screenShell();
  let LIVE = ls('get', KEY_LIVE);
  const draw = () => renderScreen(box, LIVE ? scrOf(LIVE) : null, true);
  onMsg(m => { if (m.type === 'state') { LIVE = m.g; draw(); } if (m.type === 'reset') { LIVE = null; draw(); } });
  setInterval(() => { send({ type: 'scr-alive' }); if (LIVE) updScreen(box, scrOf(LIVE), true); }, 500);
  draw(); send({ type: 'hello' });
}
function viewScreenNet() {
  const box = screenShell();
  let LIVE = null, gone = false;
  renderScreen(box, null);
  netReady.then(ok => {
    if (!ok) { box.innerHTML = '<div class="sv center"><h1>Нет связи</h1><p class="muted" style="font-size:1.3em">Проверьте интернет и обновите страницу</p></div>'; return; }
    gref(GID, 'meta').once('value').then(x => { if (!x.exists()) { gone = true; box._key = ''; box.innerHTML = '<div class="sv center"><h1>Игра не найдена</h1><p class="muted" style="font-size:1.3em">Откройте экран заново с пульта ведущего</p></div>'; } });
    gref(GID, 'scr').on('value', x => {
      LIVE = fixScr(x.val());
      if (!LIVE) { if (!gone) { box._key = ''; box.innerHTML = `<div class="sv center"><div class="kk">${GNAME}</div><h1>Игра завершена</h1></div>`; } return; }
      renderScreen(box, LIVE, true);
    });
    setInterval(() => { if (LIVE) updScreen(box, LIVE, true); }, 500);
  });
}

/* ================= телефон гостя ================= */
let PHMSG = '';
/* S — всё, что нужно телефону: {id, phase, title, couple, size, reuse, pL, pF, traits, card, pl:[{id,name}], me:{name}|null, f:{cell:{p,n}}, ln, lt, ft, fl, ff, rank, n, demo} */
function psLocal(g, pid) {
  if (!g) return null;
  const me = g.players[pid], F = g.finds[pid] || {}, f = {};
  Object.keys(F).forEach(c => { f[c] = { p: F[c].p, n: F[c].n }; });
  return { id: g.id, phase: g.phase, title: g.title, couple: g.couple, size: g.size, reuse: g.reuse, pL: g.prizeLine, pF: g.prizeFull, traits: g.traits,
    card: cardOf(g.id, pid, g.traits.length, g.size), pl: Object.keys(g.players).map(id => ({ id, name: g.players[id].name })),
    me: me ? { name: me.name } : null, f, ln: me ? me.ln : 0, lt: !!(me && me.lt), ft: !!(me && me.ft), fl: g.firstLine === pid, ff: g.firstFull === pid,
    rank: me ? ranked(g).findIndex(x => x.id === pid) + 1 : 0, n: Object.keys(g.players).length, demo: !!g.demo };
}
function phoneKey(S, cl) {
  if (cl.kicked) return 'kicked'; if (cl.nospace) return 'nospace';
  if (!S) return 'none:' + PHMSG + (cl.codeEntry ? ':code' : '');
  if (!S.me) return 'join:' + S.id + S.phase + (cl.joining ? 'j' : '');
  return 'in:' + S.id + ':' + S.phase + ':' + S.size;
}
function renderPhone(box, S, cl) {
  if (!box) return;
  const key = phoneKey(S, cl);
  if (key !== box.dataset.k || !box.firstChild) { box.dataset.k = key; buildPhone(box, S, cl); }
  updPhone(box, S, cl);
}
function buildPhone(box, S, cl) {
  const wait = (big, t, s) => `<div class="pv"><div class="wait">${big}<h2>${t}</h2>${s ? `<p class="sub">${s}</p>` : ''}</div></div>`;
  let h = '';
  if (cl.kicked) h = wait('<div class="big" style="font-size:44px">👋</div>', 'Вы вне игры', 'Ведущий убрал этого участника из игры');
  else if (cl.nospace) h = wait('<div class="big" style="font-size:44px">⏳</div>', 'Мест нет', cl.demo ? 'Игра в демо-режиме: до ' + DEMO_MAX + ' телефонов. Ведущему нужен полный доступ, чтобы впустить всех.' : 'В игре уже максимум гостей по тарифу ведущего. Подойдите к ведущему — он сможет расширить игру.');
  else if (!S) {
    if (cl.codeEntry) h = `<div class="pv"><div class="wait" style="justify-content:flex-start;padding-top:10vh"><div class="pbrand">${MARK(48)}</div><div class="kk">${GNAME}</div><h2>Введите код игры</h2><p class="sub">Он написан на экране рядом с QR-кодом</p>` +
      `<input class="pin code" id="pCode" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="000 000"><button class="pbtn acc" id="pGo">Войти</button><p class="note w" id="pErr"></p></div></div>`;
    else h = `<div class="pv"><div class="wait">${PHMSG ? '<div class="big" style="font-size:44px">' + (/Спасибо/.test(PHMSG) ? '🎉' : '⚠️') + '</div>' : '<div class="spin"></div>'}<div class="kk">${GNAME}</div><p class="sub" style="margin:0">${PHMSG || 'Подключаемся к игре…'}</p></div></div>`;
  } else if (!S.me) {
    if (S.phase === 'final') h = wait('<div class="kk">' + esc(S.couple) + '</div>', 'Игра завершена', 'Спасибо, что были с нами!');
    else h = `<div class="pv"><div class="pbrand">${MARK(40)}</div><div class="kk">${esc(S.couple || GNAME)}</div><h2>${esc(S.title)}</h2><p class="sub">Как вас зовут? Имя увидят другие гости — по нему вас и будут отмечать.</p>` +
      `<input class="pin" id="pName" maxlength="24" autocomplete="off" placeholder="Имя и фамилия" value="${esc(cl.lastName || '')}">` +
      `<button class="pbtn acc" id="pJoin"${cl.joining ? ' disabled' : ''}>${cl.joining ? 'Входим…' : 'Получить карточку'}</button><p class="note">Приложение не нужно — всё работает в браузере</p><p class="note w" id="pErr"></p></div>`;
  } else {
    h = `<div class="pv bph"><div class="me"><span class="mn">${av(S.me.name)}${esc(S.me.name)}</span><span id="pSt"></span></div>` +
      `<div class="phd" id="pHd"></div><div class="grid g${S.size}" id="pGrid"></div><div class="pfoot" id="pFoot"></div></div>`;
  }
  box.innerHTML = h;
  wirePhone(box, S, cl);
}
function wirePhone(box, S, cl) {
  const j = box.querySelector('#pJoin');
  if (j) {
    const inp = box.querySelector('#pName');
    const go = () => { const v = cleanName(inp.value); if (!v) return inp.focus(); cl.lastName = v; cl.join(v); };
    j.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
  }
  const cg = box.querySelector('#pGo');
  if (cg) { const inp = box.querySelector('#pCode'); const go = () => cl.enterCode(inp.value.replace(/\D/g, ''), box.querySelector('#pErr')); cg.onclick = go; inp.oninput = () => { const d = inp.value.replace(/\D/g, '').slice(0, 6); inp.value = d.length > 3 ? d.slice(0, 3) + ' ' + d.slice(3) : d; if (d.length === 6) go(); }; }
  const grid = box.querySelector('#pGrid');
  if (grid) grid.onclick = e => { const b = e.target.closest('.cell'); if (!b) return; const S2 = cl.cur(); if (!S2 || S2.phase !== 'play') { toast(S2 && S2.phase === 'lobby' ? 'Игра ещё не началась — ждём ведущего' : 'Игра завершена'); return; } openSheet(box, cl, +b.dataset.c); };
}
/* отметки гостя = подтверждённые ведущим + ещё не подтверждённые свои */
function myFinds(S, cl) { const f = Object.assign({}, S.f || {}); Object.keys(cl.pend).forEach(c => { if (cl.pend[c] === null) delete f[c]; else f[c] = cl.pend[c]; }); return f; }
function updPhone(box, S, cl) {
  if (!box || !S || !S.me) return;
  const pv = box.querySelector('.pv'); if (!pv) return;
  if (cl.net) {
    let nb = pv.querySelector('.netbar');
    if (!NET.connected && Date.now() - NET.since > 3000) { if (!nb) { nb = document.createElement('div'); nb.className = 'netbar'; nb.textContent = 'Нет связи — переподключаемся…'; pv.insertBefore(nb, pv.firstChild); } }
    else if (nb) nb.remove();
  }
  const f = myFinds(S, cl), N = S.size * S.size, marked = new Set(Object.keys(f).map(Number)), lc = lineCells(marked, S.size);
  const k = JSON.stringify([S.phase, f, S.ln, S.lt, S.ft, S.rank, S.n, Object.keys(cl.pend).length]);
  if (box._pk !== k) {
    const prev = box._pf || {};
    box._pk = k; box._pf = f;
    const st = box.querySelector('#pSt'); if (st) st.innerHTML = `<b>${marked.size}</b>/${N}${S.ln ? ` · 🎉 <b>${S.ln}</b>` : ''}`;
    const hd = box.querySelector('#pHd');
    if (hd) hd.innerHTML = S.phase === 'lobby' ? '<div class="kk">Ваша карточка</div><div class="hint2">Игра скоро начнётся. Пока прочитайте приметы — и присмотритесь к гостям 👀</div>'
      : S.phase === 'play' ? `<div class="kk">${esc(S.couple || GNAME)}</div><div class="hint2">Нашли человека по примете? Нажмите на клетку и выберите его имя.</div>`
      : `<div class="kk">Игра окончена</div><div class="hint2">${S.fl || S.ff ? '🎁 Вы выиграли приз — подойдите к ведущему!' : 'Спасибо за игру! Итоги — на большом экране.'}</div>`;
    const grid = box.querySelector('#pGrid');
    if (grid) {
      grid.classList.toggle('lock', S.phase !== 'play');
      grid.innerHTML = S.card.slice(0, N).map((ti, c) => {
        const v = f[c], cls = ['cell', v ? 'on' : '', lc.has(c) ? 'ln' : '', v && (!prev[c] || prev[c].n !== v.n) && box._pbuilt ? 'pop' : '', cl.pend[c] !== undefined ? 'pend' : ''].filter(Boolean).join(' ');
        return `<button class="${cls}" data-c="${c}"><span class="tr">${esc(S.traits[ti] || '')}</span>${v ? `<span class="who">${av(v.n)}<b>${esc(v.n)}</b></span>` : ''}</button>`;
      }).join('');
      box._pbuilt = true;
    }
    const ft = box.querySelector('#pFoot');
    if (ft) ft.innerHTML = `<div class="pz"><span>🎉 Линия</span><b>${esc(S.pL || 'приз')}</b></div><div class="pz"><span>🏆 Вся карточка</span><b>${esc(S.pF || 'главный приз')}</b></div>` +
      (S.phase !== 'lobby' && S.rank ? `<div class="rk">Ваше место: <b>${S.rank}</b> из ${S.n}</div>` : `<div class="rk">В игре: <b>${S.n}</b> ${ruGuests(S.n)}</div>`);
    if (cl.sheet != null) sheetList(box, cl);
  }
  // праздник на телефоне
  if (!cl.seenInit) { cl.seenInit = true; cl.seenLine = S.lt; cl.seenFull = S.ft; }
  if (S.ft && !cl.seenFull) { cl.seenFull = cl.seenLine = true; celebrate(box, 'full', S); }
  else if (S.lt && !cl.seenLine) { cl.seenLine = true; celebrate(box, 'line', S); }
}
function celebrate(box, kind, S) {
  const pv = box.querySelector('.pv'); if (!pv) return;
  closeSheet(box);
  const full = kind === 'full', first = full ? S.ff : S.fl;
  const d = document.createElement('div'); d.className = 'pcel';
  d.innerHTML = `<div class="conf">${confetti(30)}</div><div class="pin2"><div class="bw">${full ? 'Вся карточка!' : 'БИНГО!'}</div><p>${full ? 'Вы нашли людей на все клетки' : 'Линия собрана!'}</p>` +
    (first ? `<div class="bpz">${full ? '🏆' : '🎁'} ${esc(full ? S.pF : S.pL)}</div><p class="sm">Вы первые! Покажите этот экран ведущему</p>` : `<p class="sm">${full ? 'Покажите экран ведущему' : 'Продолжайте — впереди вся карточка'}</p>`) +
    `<button class="pbtn acc">Продолжить</button></div>`;
  d.querySelector('button').onclick = () => d.remove();
  pv.appendChild(d);
  if (navigator.vibrate) try { navigator.vibrate([80, 60, 160]); } catch (e) {}
}
function closeSheet(box) { const s = box.querySelector('.sheet'); if (s) s.remove(); }
function openSheet(box, cl, cell) {
  const S = cl.cur(); if (!S) return;
  closeSheet(box); cl.sheet = cell; cl.q = '';
  const pv = box.querySelector('.pv'), f = myFinds(S, cl), cur = f[cell];
  const d = document.createElement('div'); d.className = 'sheet';
  d.innerHTML = `<div class="shb"><div class="shh"><div class="kk">Кто это?</div><div class="sht">${esc(S.traits[S.card[cell]] || '')}</div></div>` +
    (cur ? `<div class="shcur">${av(cur.n)}<b>${esc(cur.n)}</b><button class="btn danger sm" id="shDel">Убрать</button></div><div class="lblc">или заменить на</div>` : '') +
    `<input class="pin" id="shQ" autocomplete="off" placeholder="Найти по имени или вписать"><div class="shl" id="shL"></div><button class="pbtn gh" id="shX">Отмена</button></div>`;
  pv.appendChild(d);
  const close = () => { cl.sheet = null; d.remove(); };
  d.onclick = e => { if (e.target === d) close(); };
  d.querySelector('#shX').onclick = close;
  if (cur) d.querySelector('#shDel').onclick = () => { cl.mark(cell, null); close(); };
  const q = d.querySelector('#shQ'); q.oninput = () => { cl.q = q.value; sheetList(box, cl); };
  q.onkeydown = e => { if (e.key === 'Enter') { const b = d.querySelector('#shL button:not([disabled])'); if (b) b.click(); } };
  sheetList(box, cl);
}
function sheetList(box, cl) {
  const d = box.querySelector('.sheet'), S = cl.cur(); if (!d || !S) return;
  const cell = cl.sheet, f = myFinds(S, cl), q = norm(cl.q || '');
  const uses = k => Object.keys(f).filter(c => +c !== cell && personKey(f[c]) === k).length;
  const list = S.pl.filter(p => p.id !== cl.pid).filter(p => !q || norm(p.name).indexOf(q) >= 0).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  let h = list.map(p => { const used = uses('p:' + p.id) >= S.reuse, on = f[cell] && f[cell].p === p.id; return `<button data-p="${esc(p.id)}"${used || on ? ' disabled' : ''}>${av(p.name)}<b>${esc(p.name)}</b>${on ? '<small>уже здесь</small>' : used ? '<small>уже на карточке</small>' : ''}</button>`; }).join('');
  const typed = cleanName(cl.q || '');
  if (typed && !S.pl.some(p => norm(p.name) === norm(typed))) h += `<button data-n="${esc(typed)}" class="typed"${uses('n:' + norm(typed)) >= S.reuse ? ' disabled' : ''}><i class="av pl">+</i><b>Вписать «${esc(typed)}»</b><small>нет в игре</small></button>`;
  if (!h) h = `<div class="shempty">${S.pl.length > 1 ? 'Никого не нашли — впишите имя полностью' : 'Пока в игре только вы. Впишите имя человека — оно появится на карточке.'}</div>`;
  const L = d.querySelector('#shL'); L.innerHTML = h;
  L.querySelectorAll('button').forEach(b => b.onclick = () => {
    const pid = b.dataset.p, v = pid ? { p: pid, n: (S.pl.find(x => x.id === pid) || {}).name || '' } : { p: '', n: b.dataset.n };
    cl.mark(cell, v); cl.sheet = null; d.remove();
  });
  const hint = d.querySelector('.shhint'); if (!hint) { const x = document.createElement('div'); x.className = 'shhint'; x.textContent = S.reuse > 1 ? 'Одного человека можно отметить максимум на ' + S.reuse + ' клетках' : 'Один человек — только на одной клетке'; L.after(x); }
}

function viewPlayLocal() {
  document.body.classList.add('solo-play'); document.title = GNAME;
  $('app').innerHTML = '<div id="ph"></div>';
  const box = $('ph');
  let LIVE = ls('get', KEY_LIVE);
  let pid = null; try { pid = sessionStorage.getItem('pbb_pid'); if (!pid) { pid = 'p' + uid(); sessionStorage.setItem('pbb_pid', pid); } } catch (e) { pid = 'p' + uid(); }
  const cl = { pid, net: false, pend: {}, cur: () => psLocal(LIVE, pid),
    join: name => send({ type: 'join', pid, name }),
    mark(cell, v) { send({ type: 'find', pid, cell, v }); } };
  const draw = () => renderPhone(box, cl.cur(), cl);
  PHMSG = 'Откройте игру у ведущего на этом устройстве — или отсканируйте QR-код на экране';
  onMsg(m => { if (m.type === 'state') { LIVE = m.g; if (LIVE.banned && LIVE.banned[pid]) cl.kicked = true; draw(); } if (m.type === 'reset') { LIVE = null; draw(); } });
  draw(); send({ type: 'hello' });
}
function viewPlayNet() {
  document.body.classList.add('solo-play'); document.title = GNAME;
  $('app').innerHTML = '<div id="ph"></div>';
  const box = $('ph'), cl = { pid: '', net: true, pend: {}, joining: false, cur: () => null };
  let C = null, Q = null, SC = null, J = null, gone = false;
  const draw = () => renderPhone(box, cl.cur(), cl);
  PHMSG = ''; draw();
  netReady.then(ok => {
    if (!ok) { PHMSG = 'Не получилось подключиться. Проверьте интернет и обновите страницу.'; box.dataset.k = ''; draw(); return; }
    const me = cl.pid = NET.uid;
    NET.subs.push(() => draw());
    const enterCode = (code, err) => {
      if (code.length !== 6) { if (err) err.textContent = 'Код состоит из 6 цифр'; return; }
      ref('codes/' + code).once('value').then(s => { const v = s.val(); if (!v || !v.g) { if (err) err.textContent = 'Игра с таким кодом не найдена'; return; } location.replace(v.k === 'bingo' ? BASE + '?view=play&g=' + v.g : '../quiz/?view=play&g=' + v.g); })
        .catch(() => { if (err) err.textContent = 'Нет связи, попробуйте ещё раз'; });
    };
    if (!GID) {
      const c = (P.get('c') || '').replace(/\D/g, '');
      if (c.length === 6) { enterCode(c, null); setTimeout(() => { cl.codeEntry = true; cl.enterCode = enterCode; box.dataset.k = ''; draw(); }, 4000); return; }
      cl.codeEntry = true; cl.enterCode = enterCode; box.dataset.k = ''; draw();
      setTimeout(() => { const i = $('pCode'); if (i) i.focus(); }, 300);
      return;
    }
    gref(GID, 'meta').once('value').then(x => { if (!x.exists()) { gone = true; PHMSG = 'Игра не найдена или уже завершена.<br>Отсканируйте QR-код на экране ещё раз или введите код игры.'; box.dataset.k = ''; draw(); } });
    const on = gref(GID, 'on/' + me);
    const presence = () => { if (NET.connected && J) { on.onDisconnect().remove(); on.set(true); } };
    NET.subs.push(presence);
    cl.join = name => { cl.joining = true; box.dataset.k = ''; draw(); gref(GID, 'join/' + me).set({ name, t: TS() }).then(() => { cl.joining = false; presence(); }, () => { cl.joining = false; box.dataset.k = ''; draw(); }); };
    cl.mark = (cell, v) => {
      cl.pend[cell] = v ? { p: v.p || '', n: v.n } : null; box._pk = ''; draw();
      const data = v ? { o: cell, p: v.p || '', n: cleanName(v.n), t: TS(), c: now() } : { o: -1, t: TS(), c: now() };
      gref(GID, 'ans/' + me + '/' + cell).set(data).then(() => { setTimeout(() => { delete cl.pend[cell]; box._pk = ''; draw(); }, 1500); }, () => { delete cl.pend[cell]; box._pk = ''; toast('Не отправилось — проверьте интернет'); draw(); });
    };
    cl.cur = () => {
      if (!C || !Q || gone || C.id !== GID) return null;
      const traits = (Array.isArray(Q) ? Q : Object.values(Q)).map(x => (x && x.t) || '');
      const pl = Object.keys(C.pl || {}).map(id => ({ id, name: C.pl[id] }));
      const sc = SC || {}, f = {};
      Object.keys(sc.f || {}).forEach(c => { const v = sc.f[c]; if (v) f[c] = { p: v.p || '', n: v.n || '' }; });
      return { id: C.id, phase: C.phase, title: C.title, couple: C.couple, size: C.size === 3 ? 3 : 4, reuse: C.reuse || 1, pL: C.pL, pF: C.pF, traits,
        card: cardOf(C.id, me, traits.length, C.size === 3 ? 3 : 4), pl, me: J ? { name: J.name } : null, f,
        ln: sc.ln || 0, lt: !!sc.lt, ft: !!sc.ft, fl: !!sc.fl, ff: !!sc.ff, rank: sc.rank || 0, n: C.n || pl.length, demo: !!C.demo };
    };
    const sub = (path, f) => gref(GID, path).on('value', x => { f(x.val()); draw(); });
    sub('core', v => { C = v; if (!v && Q) { gone = true; PHMSG = 'Игра завершена. Спасибо, что играли!'; } });
    sub('q', v => { Q = v; });
    sub('sc/' + me, v => { SC = v; cl.kicked = !!(v && v.kicked); cl.nospace = !!(v && v.nospace); cl.demo = !!(v && v.demo); if (cl.kicked) on.remove(); });
    sub('join/' + me, v => { J = v; if (v) presence(); });
    setInterval(() => { const S = cl.cur(); if (S) updPhone(box, S, cl); }, 1000);
  });
}

/* ================= ведущий: редактор ================= */
function accTag() {
  if (!ACC.token) return '<span class="tag">Демо</span><button class="btn gold sm" id="bLogin">Войти</button>';
  if (ACC.loading && !ACC.info) return '<span class="tag">…</span>';
  if (!ACC.info) return `<span class="tag">Демо</span><button class="btn ghost sm" id="bLogin" title="${esc(ACC.err)}">Войти заново</button>`;
  const i = ACC.info, tn = TIER[i.tier] ? TIER[i.tier].n : '';
  const t = i.pro ? `<span class="tag pro">${tn || 'Подписка'}</span>` : i.unlocked ? `<span class="tag pro">${tn ? tn + ' · ' : ''}до ${new Date(i.eventUntil).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>` : '<span class="tag">Демо</span>';
  return `<span class="em">${esc(i.email)}</span>${t}`;
}
function renderTop() { const a = $('acc'); if (!a) return; a.innerHTML = accTag(); if ($('bLogin')) $('bLogin').onclick = goLogin; }
function demoNote() {
  if (unlocked()) return '';
  return `<div class="notice"><span>🎈</span><span><b>Демо-режим:</b> всё работает, но в игру войдут максимум ${DEMO_MAX} телефонов гостей, а игра длится до ${DEMO_MIN} минут. Полный доступ — любой тариф.</span>${ACC.info ? '' : '<button class="btn ghost sm" id="bLogin2">Войти</button>'}<a class="btn gold sm" href="../#pricing">Тарифы</a></div>`;
}
let edBuilt = false;
function renderEditor() {
  edBuilt = true; liveBuilt = false;
  $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND('Человеческое бинго · редактор')}</a><span class="sp"></span><div class="acc" id="acc"></div></div></div>` +
    `<div class="ed"><div class="k">Новая игра</div><h1>Человеческое бинго</h1><p class="lead">Составьте список примет — у каждого гостя будет своя перемешанная карточка. Гости знакомятся, находят людей и отмечают клетки. Первая линия и вся карточка — с призами.</p>` +
    `<div id="demoN">${demoNote()}</div>` +
    `<div class="panel"><div class="row2"><div class="fld"><label>Название игры</label><input class="inp" id="fTitle" maxlength="60"></div><div class="fld"><label>Имена пары</label><input class="inp" id="fCouple" maxlength="60" placeholder="Максим и Алина"></div></div></div>` +
    `<div class="panel"><h3>Карточка</h3><div class="tgrid" style="margin-top:0"><div><div class="lbl" style="margin-top:0">Размер карточки</div><div class="seg big" id="sSize"><button data-v="3">3 × 3 · 9 клеток</button><button data-v="4">4 × 4 · 16 клеток</button></div></div>` +
    `<div><div class="lbl" style="margin-top:0">Один человек — на скольких клетках</div><div class="seg big" id="sReuse"><button data-v="1">На одной</button><button data-v="2">До двух</button></div></div></div>` +
    `<div class="tgrid"><label class="sw">Звуки на экране<input type="checkbox" id="sSound"></label><label class="sw">Гости-боты для проверки<input type="checkbox" id="sBots"></label></div></div>` +
    `<div class="panel"><h3>Призы</h3><div class="row2"><div class="fld"><label>🎉 За первую линию</label><input class="inp" id="fPL" maxlength="80" placeholder="Бутылка шампанского"></div><div class="fld"><label>🏆 За всю карточку</label><input class="inp" id="fPF" maxlength="80" placeholder="Главный приз от пары"></div></div><div class="hint">Линия — ряд, столбец или диагональ. Призы появятся на экране и на телефонах.</div></div>` +
    `<div class="qhead"><h2>Приметы</h2><span class="tag" id="tCount"></span><span class="sp"></span><button class="btn ghost sm" id="bLib">📚 Библиотека</button><button class="btn ghost sm" id="bReset">↺ Стандартные</button></div>` +
    `<p class="muted" style="margin:-4px 0 12px;font-size:14px">Короткие и проверяемые в разговоре: «был на Байкале», «левша». Чем больше примет, тем разнообразнее карточки.</p>` +
    `<div id="tList"></div><button class="btn ghost addone" id="bAdd">+ Своя примета</button></div>` +
    `<div class="bar"><div class="in"><div style="flex:1;min-width:0"><b id="bSum" style="color:var(--ink)"></b><div class="muted" style="font-size:12px" id="bSub"></div></div><button class="btn gold" id="bStart">Запустить игру ▶</button></div></div>`;
  renderTop();
  const bl = $('bLogin2'); if (bl) bl.onclick = goLogin;
  const bind = (id, k) => { const el = $(id); el.value = CFG[k]; el.oninput = () => { CFG[k] = el.value; saveCfg(); sum(); }; };
  bind('fTitle', 'title'); bind('fCouple', 'couple'); bind('fPL', 'prizeLine'); bind('fPF', 'prizeFull');
  const seg = (id, k) => { const el = $(id); const paint = () => el.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.v === CFG[k])); el.onclick = e => { const b = e.target.closest('button'); if (!b) return; CFG[k] = +b.dataset.v; saveCfg(); paint(); sum(); }; paint(); };
  seg('sSize', 'size'); seg('sReuse', 'reuse');
  $('sSound').checked = CFG.sound; $('sSound').onchange = () => { CFG.sound = $('sSound').checked; saveCfg(); };
  $('sBots').checked = CFG.bots; $('sBots').onchange = () => { CFG.bots = $('sBots').checked; saveCfg(); };
  $('bAdd').onclick = () => { CFG.traits.push({ id: uid(6), t: '' }); saveCfg(); paintTraits(); const ins = $('tList').querySelectorAll('input'); if (ins.length) ins[ins.length - 1].focus(); };
  $('bLib').onclick = openLib;
  $('bReset').onclick = () => { if (!confirmTwice($('bReset'), 'Заменить список?')) return; CFG.traits = LIB.slice(0, 20).map(t => ({ id: uid(6), t })); saveCfg(); paintTraits(); };
  $('bStart').onclick = start;
  paintTraits();
}
function confirmTwice(btn, label) { if (btn.dataset.sure) return true; const old = btn.textContent; btn.dataset.sure = 1; btn.textContent = label; setTimeout(() => { if (btn) { delete btn.dataset.sure; btn.textContent = old; } }, 3000); return false; }
function paintTraits() {
  const L = $('tList'); if (!L) return;
  L.innerHTML = CFG.traits.map((x, i) => `<div class="trow" data-i="${i}"><span class="tn">${i + 1}</span><input class="inp" maxlength="80" value="${esc(x.t)}" placeholder="Например: был на Байкале"><button class="ic" title="Удалить" aria-label="Удалить">${TRASH}</button></div>`).join('');
  L.querySelectorAll('.trow').forEach(r => {
    const i = +r.dataset.i, inp = r.querySelector('input');
    inp.oninput = () => { CFG.traits[i].t = inp.value; saveCfg(); sum(); };
    inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); CFG.traits.splice(i + 1, 0, { id: uid(6), t: '' }); saveCfg(); paintTraits(); L.querySelectorAll('input')[i + 1].focus(); } };
    r.querySelector('.ic').onclick = () => { CFG.traits.splice(i, 1); saveCfg(); paintTraits(); };
  });
  sum();
}
function sum() {
  const n = goodTraits(CFG).length, need = CFG.size * CFG.size;
  const tc = $('tCount'); if (tc) tc.textContent = n + ' ' + plural(n, 'примета', 'приметы', 'примет');
  const s = $('bSum'), b = $('bSub'); if (!s) return;
  s.textContent = `Карточка ${CFG.size}×${CFG.size} · ${n} ${plural(n, 'примета', 'приметы', 'примет')}`;
  b.style.color = ''; b.textContent = n < need ? `Нужно минимум ${need} ${plural(need, 'примета', 'приметы', 'примет')} — добавьте ещё ${need - n}` : n === need ? 'Карточки у всех одинаковые по составу, но перемешаны' : 'У каждого гостя будет своя карточка';
}
function openLib() {
  const have = () => new Set(CFG.traits.map(x => norm(x.t)));
  const paint = b => { const H = have(); b.querySelector('#libL').innerHTML = LIB.map((t, i) => `<button data-i="${i}" class="${H.has(norm(t)) ? 'on' : ''}">${H.has(norm(t)) ? '✓ ' : '+ '}${esc(t)}</button>`).join(''); };
  modal(`<h3>Библиотека примет</h3><p class="muted" style="margin:0 0 12px">Нажмите, чтобы добавить или убрать. Потом текст можно поправить в списке.</p><div class="libl" id="libL"></div><div class="links" style="margin-top:14px"><button class="btn ghost sm" id="libAll">Добавить все</button><span class="sp" style="flex:1"></span><button class="btn gold" data-close>Готово</button></div>`, b => {
    paint(b);
    b.querySelector('#libL').onclick = e => { const x = e.target.closest('button'); if (!x) return; const t = LIB[+x.dataset.i], k = norm(t), i = CFG.traits.findIndex(y => norm(y.t) === k); if (i >= 0) CFG.traits.splice(i, 1); else CFG.traits.push({ id: uid(6), t }); CFG.traits = CFG.traits.filter(y => y.t.trim()); saveCfg(); paint(b); paintTraits(); };
    b.querySelector('#libAll').onclick = () => { const H = have(); LIB.forEach(t => { if (!H.has(norm(t))) CFG.traits.push({ id: uid(6), t }); }); CFG.traits = CFG.traits.filter(y => y.t.trim()); saveCfg(); paint(b); paintTraits(); };
  });
}
function start() {
  const n = goodTraits(CFG).length, need = CFG.size * CFG.size;
  if (n < need) { const b = $('bSub'); b.textContent = `Для карточки ${CFG.size}×${CFG.size} нужно минимум ${need} примет`; b.style.color = 'var(--bad)'; setTimeout(sum, 2600); return; }
  const b = $('bStart'); b.disabled = true; b.textContent = 'Запускаем…';
  SND.unlock();
  netReady.then(() => { newGame(); window.scrollTo(0, 0); });
}

/* ================= ведущий: пульт ================= */
let liveBuilt = false, tab = 'ctl', sureKick = '', scrAlive = 0;
const me = { pid: 'me', net: false, pend: {}, cur: () => psLocal(G, 'me'), join: name => join('me', name, false), mark(cell, v) { if (setCell('me', cell, v)) publish(); else if (v) toast('Этого человека уже нельзя отметить'); } };
const soundHere = () => !!(G && G.sound !== false && Date.now() - scrAlive > 4000);
function renderLive() {
  if (!liveBuilt) {
    liveBuilt = true; edBuilt = false;
    $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND('<span id="lTitle"></span>')}</a><span class="sp"></span>` +
      `<button class="btn ghost sm dsk" id="bOpenScr">🖥 Экран</button><button class="btn ghost sm dsk" id="bGuests">📱 Ссылка для гостей</button><button class="btn ghost sm" id="bEdit">✎ Редактор</button></div></div>` +
      `<div class="tabs" id="tabs"><button data-t="ctl">Пульт</button><button data-t="scr">Экран</button><button data-t="ph">Я — гость</button></div>` +
      `<div class="live"><div class="ctl" data-p="ctl"><button class="btn gold next" id="bNext"></button><div class="kbd dsk-only">Пробел или → — дальше</div>` +
      `<div class="stat"><div><b id="sP">0</b><span id="sPl">гостей</span></div><div><b id="sO">–</b><span>на связи</span></div><div><b id="sA">0</b><span id="sAl">находок</span></div></div>` +
      `<div class="netline" id="netl"></div><div id="demoL"></div><div class="cur" id="cur"></div><div class="plist" id="plist"></div>` +
      `<div class="links"><button class="btn ghost sm" id="bGuests2">📱 Гости</button><button class="btn ghost sm" id="bSnd"></button><button class="btn ghost sm" id="bRestart">↺ Заново</button></div></div>` +
      `<div class="pane" data-p="scr"><h4>Экран для проектора <button class="btn ghost sm" id="bScrMenu">Открыть ↗</button></h4><div class="stage" id="stg"></div></div>` +
      `<div class="pane ph" data-p="ph"><h4>Телефон гостя · играйте сами <button class="btn ghost sm" id="bOpenPh2">↗</button></h4><div class="phwrap"><div class="phone"><div class="scr" id="ph"></div></div></div></div></div>` +
      `<div class="mnext"><button class="btn gold next" id="bNextM" style="display:block"></button></div>`;
    $('bOpenScr').onclick = screenMenu; $('bScrMenu').onclick = screenMenu;
    $('bGuests').onclick = guestsMenu; $('bGuests2').onclick = guestsMenu;
    $('bOpenPh2').onclick = () => window.open(playLink(G), '_blank');
    $('bEdit').onclick = () => { if (G.phase === 'play' && !confirmTwice($('bEdit'), 'Завершить игру?')) return; clearBots(); endNet(); G = null; liveBuilt = false; ls('del', KEY_LIVE); send({ type: 'reset' }); renderEditor(); window.scrollTo(0, 0); };
    $('bNext').onclick = hostNext; $('bNextM').onclick = hostNext;
    $('bRestart').onclick = () => { if (!confirmTwice($('bRestart'), 'Точно заново?')) return; newGame(); };
    $('bSnd').onclick = () => { G.sound = !(G.sound !== false); if (G.sound) SND.unlock(); render(); };
    document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; paintTabs(); });
    paintTabs();
  }
  $('lTitle').textContent = G.title;
  const nl = G.phase === 'lobby' ? ['Начать игру', 'гости получат карточки'] : G.phase === 'play' ? ['Завершить и показать итоги', 'номинации на экране'] : ['Игра завершена', ''];
  [$('bNext'), $('bNextM')].forEach(b => { b.innerHTML = esc(nl[0]) + (nl[1] ? `<small>${esc(nl[1])}</small>` : ''); b.disabled = G.phase === 'final' || (G.phase === 'lobby' && !Object.keys(G.players).length); });
  $('bSnd').textContent = G.sound !== false ? (soundHere() ? '🔊 Звук тут' : '🔊 Звук на экране') : '🔇 Звук выкл.';
  const r = ranked(), n = r.length, nf = r.reduce((s, p) => s + (p.nf || 0), 0);
  $('sP').textContent = n; $('sPl').textContent = ruGuests(n); $('sA').textContent = nf; $('sAl').textContent = plural(nf, 'находка', 'находки', 'находок');
  $('demoL').innerHTML = G.demo ? `<div class="demo">Демо: до ${DEMO_MAX} телефонов гостей${G.demoEnd ? ', осталось ' + Math.max(1, Math.ceil((G.demoEnd - Date.now()) / 60000)) + ' мин' : ''}. <a href="../#pricing" target="_blank">Полный доступ</a></div>` : G.capHit || netCount() >= (G.cap || 0) ? `<div class="demo">Достигнут лимит тарифа — ${G.cap} телефонов. Новые гости не войдут. <a href="../#pricing" target="_blank">Нужно больше?</a></div>` : '';
  const N = G.size * G.size, nom = nominations(G), pn = id => G.players[id] ? G.players[id].name : '';
  let cur = '';
  if (G.phase === 'lobby') cur = `<div class="k">Лобби</div><div class="q">Гости сканируют QR или вводят код ${G.code ? '<b style="color:var(--gold)">' + fmtCode(G.code) + '</b>' : ''} на ${esc(SHORT)}</div><div class="muted" style="font-size:13px">Карточка ${G.size}×${G.size} из ${G.traits.length} примет. Гости уже видят свои карточки — нажмите «Начать игру», когда все войдут.</div>`;
  else if (G.phase === 'play') cur = `<div class="k">Идёт игра · ${mmss(now() - G.t0)}</div><div class="q">${G.firstLine ? '🎉 Первая линия — ' + esc(pn(G.firstLine)) : 'Ждём первую линию…'}</div><div class="a">${G.firstFull ? '🏆 Вся карточка — ' + esc(pn(G.firstFull)) : 'Всю карточку пока никто не закрыл'}</div><div class="muted" style="font-size:12px;margin-top:6px">Призы: линия — ${esc(G.prizeLine || '—')} · карточка — ${esc(G.prizeFull || '—')}</div>`;
  else cur = `<div class="k">Итоги</div><div class="q">Номинации на экране. Спасибо за игру!</div><div class="muted" style="font-size:13px;line-height:1.7">🎉 Линия: <b>${esc(nom.line || '—')}</b><br>🏆 Карточка: <b>${esc(nom.full || '—')}</b><br>🤝 Общительный: <b>${esc(nom.social ? nom.social.n : '—')}</b><br>⭐ Звезда вечера: <b>${esc(nom.star ? nom.star.n : '—')}</b></div>`;
  $('cur').innerHTML = cur;
  $('plist').innerHTML = r.map((p, i) => `<div class="p"><span class="muted" style="width:20px">${i + 1}</span><span class="dot ${p.net && G.net && !ONLINE[p.id] ? 'off' : 'on'}"></span><b>${esc(p.name)}${p.id === 'me' ? ' (вы)' : ''}${p.bot ? ' <small>бот</small>' : ''}</b><span class="pf">${p.ft ? '🏆 ' : p.lt ? '🎉 ' : ''}${p.nf || 0}/${N}</span><button class="kick${sureKick === p.id ? ' sure' : ''}" data-kick="${esc(p.id)}" title="Убрать из игры">${sureKick === p.id ? 'Убрать?' : '✕'}</button></div>`).join('') || '<div class="p muted">Пока никого</div>';
  $('plist').querySelectorAll('[data-kick]').forEach(b => b.onclick = () => { const id = b.dataset.kick; if (sureKick === id) { sureKick = ''; kick(id); } else { sureKick = id; setTimeout(() => { if (sureKick === id) { sureKick = ''; render(); } }, 3000); render(); } });
  renderNetLine();
  renderScreen($('stg'), scrOf(G), soundHere());
  renderPhone($('ph'), me.cur(), me);
}
function hostNext() { const was = G && G.phase; next(); if (was === 'lobby' && G.phase === 'play') { resyncAll(); if (soundHere()) SND.play('start'); } }
function renderNetLine() {
  const el = $('netl'); if (!el || !G) return;
  if (!G.net) { el.innerHTML = '<i class="off"></i>Без интернета: гости войдут только с этого устройства'; $('sO').textContent = '–'; return; }
  const on = Object.keys(ONLINE).length, cls = !NET.connected ? 'off' : NET.rtt > 600 ? 'slow' : '';
  el.innerHTML = `<i class="${cls}"></i>${NET.connected ? 'На связи' : 'Нет связи — переподключаемся'}${NET.rtt ? ' · ' + NET.rtt + ' мс' : ''}${G.code ? `<span class="codeb">Код ${fmtCode(G.code)}</span>` : ''}`;
  $('sO').textContent = on;
}
function paintTabs() {
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  document.querySelectorAll('.live>[data-p]').forEach(p => p.classList.toggle('on', p.dataset.p === tab));
  if (G) { const b = $('stg'); if (b) b._key = ''; renderScreen($('stg'), scrOf(G), false); }
}
function linkBox(url, id) { return `<div class="qrbox" id="${id}"></div><div class="linkrow"><code>${esc(url)}</code><button class="btn ghost sm" data-copy="${esc(url)}">Копировать</button></div>`; }
function wireCopy(b) { b.querySelectorAll('[data-copy]').forEach(x => x.onclick = () => copy(x.dataset.copy)); }
const openLocal = () => { SND.unlock(); window.open(BASE + '?view=screen', 'pbb_screen', 'width=1280,height=760'); };
function screenMenu() {
  if (!G.net) { openLocal(); return; }
  modal(`<h3>Экран для проектора</h3><p class="muted" style="margin:0 0 12px">Если проектор подключён к этому ноутбуку — откройте экран здесь: он работает даже без интернета.</p><button class="btn gold" id="mLocal" style="width:100%">🖥 Открыть на этом ноутбуке</button>` +
    `<div class="lbl">Проектор на другом ноутбуке</div><p class="muted" style="margin:0;font-size:14px">Откройте ссылку на нём — экран будет показывать игру через интернет.</p>${linkBox(screenNetLink(G), 'mq')}<button class="btn ghost" data-close style="width:100%">Закрыть</button>`,
    b => { qr(b.querySelector('#mq'), screenNetLink(G), 400); wireCopy(b); b.querySelector('#mLocal').onclick = () => { closeModal(); openLocal(); }; });
}
function guestsMenu() {
  const u = playLink(G);
  modal(`<h3>Ссылка для гостей</h3><p class="muted" style="margin:0">${G.net ? `QR и код ${G.code ? '<b style="color:var(--ink)">' + fmtCode(G.code) + '</b> ' : ''}есть на большом экране. Эту ссылку можно отправить в чат гостей.` : 'Без интернета гости могут войти только с этого устройства — в новой вкладке.'}</p>${linkBox(u, 'mq')}<button class="btn ghost" data-close style="width:100%">Закрыть</button>`,
    b => { qr(b.querySelector('#mq'), u, 400); wireCopy(b); });
}
function render() { if (G) renderLive(); else if (!edBuilt) renderEditor(); }
function demoOver() {
  clearBots(); endNet(); G = null; liveBuilt = false; ls('del', KEY_LIVE); send({ type: 'reset' }); renderEditor(); window.scrollTo(0, 0);
  modal(upsellHtml('Демо-игра закончилась', 'Демо работает ' + DEMO_MIN + ' минут. Выберите тариф — или запустите новую демо-игру позже.'));
}
function bootHost() {
  document.addEventListener('keydown', e => {
    if (!G || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '') || $('modal').classList.contains('on')) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); hostNext(); }
  });
  document.addEventListener('pointerdown', () => { if (G && G.sound !== false) SND.unlock(); });
  onMsg(m => {
    if (m.type === 'scr-alive') { const was = soundHere(); scrAlive = Date.now(); if (was !== soundHere() && G) render(); return; }
    if (!G) return;
    if (m.type === 'join') join(m.pid, m.name, false);
    else if (m.type === 'find') { if (setCell(m.pid, m.cell, m.v)) publish(); else send({ type: 'state', g: G }); }
    else if (m.type === 'hello') send({ type: 'state', g: G });
  });
  const saved = ls('get', KEY_LIVE);
  if (saved && saved.phase !== 'final' && Date.now() - (saved.ts || 0) < 6 * 3600e3 && Array.isArray(saved.traits)) { G = saved; ['players', 'finds', 'banned'].forEach(k => { G[k] = G[k] || {}; }); G.feed = G.feed || []; G.ev = G.ev || []; }
  else { ls('del', KEY_LIVE); send({ type: 'reset' }); }
  const DEMO_GO = !!P.get('demo') && !G;
  if (P.get('demo')) try { history.replaceState(null, '', location.pathname); } catch (e) {}
  if (DEMO_GO) {
    const c = ls('get', KEY_CFG); if (c && !c.isDemo) ls('set', 'pbb_cfg_bak', c);
    CFG = normCfg(defaultCfg()); CFG.couple = 'Аня и Макс'; CFG.title = 'Демо: человеческое бинго'; CFG.bots = true; CFG.isDemo = 1; saveCfg();
  }
  else if (!G && CFG.isDemo) { const b = ls('get', 'pbb_cfg_bak'); if (b) { CFG = normCfg(b); saveCfg(); ls('del', 'pbb_cfg_bak'); } }
  setInterval(() => {
    if (!G) return;
    if (G.demo && G.demoEnd && Date.now() > G.demoEnd) { demoOver(); return; }
    updScreen($('stg'), scrOf(G), soundHere());
    if (G.phase === 'play' && liveBuilt) { const k = $('cur') && $('cur').querySelector('.k'); if (k) k.textContent = 'Идёт игра · ' + mmss(now() - G.t0); }
    if (!soundHere() && Date.now() - scrAlive > 4000 && scrAlive) { scrAlive = 0; render(); }
  }, 1000);
  window.__bingo = { get g() { return G; }, next: hostNext, cfg: () => CFG, net: NET, acc: ACC, kick, setCell: (p, c, v) => { const r = setCell(p, c, v); if (r) publish(); return r; }, join, publish };
  render();
  netReady.then(ok => {
    if (G && G.net && ok) { attachNet(); lastCore = ''; lastScr = ''; lastSc = {}; netPush(true); }
    if (G && G.net && !ok) toast('Нет интернета — гости с других телефонов не смогут войти');
    if (DEMO_GO && !G) { newGame(); window.scrollTo(0, 0); }
    accLoad().then(() => {
      if (G) { if (unlocked() && (G.demo || G.cap !== guestCap())) { G.demo = false; G.cap = guestCap(); G.capHit = 0; publish(); } return; }
      renderTop(); const dn = $('demoN'); if (dn) { dn.innerHTML = demoNote(); if ($('bLogin2')) $('bLogin2').onclick = goLogin; }
    });
  });
}
function boot() {
  if (VIEW === 'screen') return GID ? viewScreenNet() : viewScreenLocal();
  if (VIEW === 'play') return P.get('local') ? viewPlayLocal() : viewPlayNet();
  bootHost();
}
boot();
})();
