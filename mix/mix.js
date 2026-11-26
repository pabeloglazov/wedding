(() => {
'use strict';
/* ================= Игра-микс · Beloglazov Event =================
   Вечер из раундов, каждый раунд — одна из наших игр. Один код на весь вечер, общий счёт.
   Ведущий: /mix/   Экран: ?view=screen&g=   Телефон: ?view=play&g=                  */
const P = new URLSearchParams(location.search);
const VIEW = P.get('view') || 'host';
const GID = (P.get('g') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);
const PF_API = 'https://script.google.com/macros/s/AKfycbwvLVfMge8_eCpteZrgj-MpxqO1W_TvQoMAz0jxqx42W8ySqwz2xmutpwKfVGUGZXcG3w/exec';
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function uid(n = 10) { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const r = crypto.getRandomValues(new Uint8Array(n)); for (const x of r) s += a[x % a.length]; return s; }
function plural(n, a, b, c) { n = Math.abs(n); const x = n % 10, y = n % 100; return x === 1 && y !== 11 ? a : x >= 2 && x <= 4 && (y < 10 || y >= 20) ? b : c; }
function ls(op, k, v) { try { if (op === 'get') return JSON.parse(localStorage.getItem(k) || 'null'); if (op === 'set') localStorage.setItem(k, JSON.stringify(v)); if (op === 'del') localStorage.removeItem(k); } catch (e) {} return null; }
function toast(t) { const el = $('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2400); }
function qr(el, text, size = 512) { if (!el || !window.QRCode) return; el.innerHTML = ''; try { new QRCode(el, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {} }
function modal(html, onReady, wide) { $('mbox').innerHTML = html; $('modal').classList.add('on'); $('modal').classList.toggle('wide', !!wide); if (onReady) onReady($('mbox')); }
function closeModal() { $('modal').classList.remove('on', 'wide'); }
document.addEventListener('click', e => { if (e.target && e.target.id === 'modal') closeModal(); if (e.target && e.target.closest && e.target.closest('[data-close]')) closeModal(); });
const nums = n => Number(n || 0).toLocaleString('ru-RU');
const fmtCode = c => c ? String(c).replace(/(\d{3})(\d{3})/, '$1 $2') : '';
const BASE = location.origin + location.pathname;
const SHORT = location.host.replace(/^www\./, '') + '/q';
const BRAND = sub => window.PB_BRAND ? PB_BRAND.lockup(sub) : '<b>Beloglazov Event</b>';
const IC = {
  x: '<path d="M6 6l12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', grip: '<path d="M5 7h14M5 12h14M5 17h14"/>', pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>', ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>', monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>', phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>',
  g_quiz: '<circle cx="12" cy="15" r="6"/><path d="m9 5 3-3 3 3-3 3z"/>', g_svoya: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  g_fact: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z"/>', g_bingo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  g_sm: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
const ico = (k, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ''}</svg>`;

/* наши игры — виды раундов */
const GM = {
  quiz: { n: 'Квиз о паре', em: '💍❓', c: '#c27078', d: 'Вопросы на экране, ответы с телефонов, команды и столы', ed: '../quiz/', app: '../quiz/', p: 'q', l: 'list' },
  svoya: { n: 'Своя игра', em: '🟪⚡', c: '#6d4dff', d: 'Табло «категории × стоимость», кнопка «Ответить!»', ed: '../svoya/', app: '../svoya/', p: 'sq', l: 'slist' },
  fact: { n: 'Интересный факт', em: '💡🙋', c: '#d9a441', d: 'Факт о госте на экране — зал угадывает, о ком он', ed: '../fact/', app: '../quiz/', p: 'fq', l: 'flist', appq: 'fact' },
  bingo: { n: 'Человеческое бинго', em: '🎯✅', c: '#6f9fc6', d: 'Карточки примет, знакомство в зале, «БИНГО!»', ed: '../bingo/', app: '../bingo/', p: 'bq', l: 'blist' },
  sm: { n: 'Секретная миссия', em: '🕶️💌', c: '#a7ae86', d: 'Тайные задания для гостей, welcome-зона', ed: '../host/', ext: 1 }
};
const gIco = (k, w = 18) => `<span class="gi2" style="background:${GM[k].c}66;color:#fff">${ico('g_' + k, w)}</span>`;
const appUrl = (k, q) => { const g = GM[k]; return (k === 'fact' ? '../fact/' : g.app) + '?' + q; };

/* ================= Firebase и аккаунт ================= */
const FB = { apiKey: 'AIzaSyADi9iG0ZtHg9zGBomUKpTpgaANStenR3Y', authDomain: 'beloglazov-games.firebaseapp.com', databaseURL: 'https://beloglazov-games-default-rtdb.firebaseio.com', projectId: 'beloglazov-games' };
const NET = { ok: false, uid: null, db: null, off: 0, connected: false, subs: [] };
const netReady = new Promise(res => {
  try {
    if (!window.firebase) return res(false);
    firebase.initializeApp(FB);
    let done = false; const to = setTimeout(() => { if (!done) { done = true; res(false); } }, 12000);
    firebase.auth().onAuthStateChanged(u => {
      if (!u || done) return; done = true; clearTimeout(to);
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
const ACC = { token: null, info: null, err: '' };
try { ACC.token = localStorage.getItem('pb_host_token'); } catch (e) {}
function pfApi(fn, args, n = 0) {
  return fetch(PF_API, { method: 'POST', credentials: 'omit', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn, args }) })
    .then(r => r.text()).then(t => { let j; try { j = JSON.parse(t); } catch (e) { if (n < 3) return new Promise(r => setTimeout(r, 1500 * (n + 1))).then(() => pfApi(fn, args, n + 1)); throw new Error('Сервер занят'); } if (!j.ok) throw new Error(String(j.error || '')); return j.data; });
}
const accLoad = () => ACC.token ? pfApi('pfQuizAccess', [ACC.token]).then(d => { ACC.info = d; return d; }, e => { ACC.err = e.message; return null; }) : Promise.resolve(null);
const wsKey = () => ACC.info && /^[0-9a-f]{64}$/.test(ACC.info.ws || '') ? ACC.info.ws : '';
const unlocked = () => !!(ACC.info && ACC.info.unlocked);
function goLogin() { try { localStorage.setItem('pb_next', 'mix'); } catch (e) {} location.href = '../host/'; }

/* ================= конфиг микса ================= */
const KEY_CFG = 'pbm_cfg_v1', KEY_LIVE = 'pbm_live_v1';
const normCfg = c => { c = c || {}; return { id: c.id || uid(10), title: String(c.title || 'Игра-микс'), rounds: (Array.isArray(c.rounds) ? c.rounds : []).filter(r => r && GM[r.k] && r.id).slice(0, 12).map(r => ({ k: r.k, id: String(r.id), t: String(r.t || ''), play: String(r.play || ''), adm: String(r.adm || '') })), updated: c.updated || Date.now() }; };
let CFG = normCfg(ls('get', KEY_CFG));
const LISTS = { quiz: null, fact: null, bingo: null, svoya: null, sm: null };
const STORE = {
  t: 0,
  save() { CFG.updated = Date.now(); ls('set', KEY_CFG, CFG); clearTimeout(this.t); this.t = setTimeout(() => this.push(), 700); },
  push() { const k = wsKey(); if (!k || !NET.ok) return; Promise.all([ref(`ws/${k}/mq/${CFG.id}`).set(CFG), ref(`ws/${k}/mlist/${CFG.id}`).set({ title: CFG.title, couple: '', n: CFG.rounds.length, updated: CFG.updated })]).catch(e => console.warn('mix save', e)); }
};
function loadLists() {
  const k = wsKey(); if (!k) return Promise.resolve();
  const ps = ['quiz', 'fact', 'bingo', 'svoya'].map(t => ref(`ws/${k}/${GM[t].l}`).once('value').then(x => { LISTS[t] = x.val() || {}; }, () => { LISTS[t] = {}; }));
  ps.push(pfApi('pfHostEvents', [ACC.token]).then(d => { const o = {}; ((d && d.events) || []).forEach(e => { o[e.id] = { title: (e.title && e.title !== 'Секретная миссия') ? e.title : (e.couple || 'Секретная миссия'), couple: e.couple || '', updated: e.created || 0, play: e.playUrl, adm: e.adminUrl, old: !!(e.exp && e.exp < Date.now()) }; }); LISTS.sm = o; }, () => { LISTS.sm = {}; }));
  return Promise.all(ps);
}
const titleOf = r => { const x = LISTS[r.k] && LISTS[r.k][r.id]; return (x && x.title) || r.t || GM[r.k].n; };

/* ================= редактор ================= */
function renderTop() {
  const a = $('acc'); if (!a) return;
  if (!ACC.token) a.innerHTML = '<span class="tag">Демо</span><button class="btn gold sm" id="bLogin">Войти</button>';
  else if (!ACC.info) a.innerHTML = `<button class="btn ghost sm" id="bLogin">Войти заново</button>`;
  else if (window.PBAcct) { a.innerHTML = PBAcct.html(ACC.info, '<a href="../host/">Мои игры</a>'); PBAcct.bind(a); }
  if ($('bLogin')) $('bLogin').onclick = goLogin;
}
function renderEditor() {
  const k = wsKey();
  $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND('Игра-микс · редактор')}</a><span class="sp"></span><div class="acc" id="acc"></div></div></div>` +
    `<div class="wrap"><div class="hero"><div class="k">Игра из раундов</div><h1>Игра-микс</h1><p>Соберите вечер из наших игр: каждый раунд — отдельная игра. Гости заходят по одному QR на весь вечер, проектор и телефоны сами переключаются между раундами, счёт команд — общий.</p></div>` +
    (!k ? `<div class="card"><h3>Нужен вход</h3><p class="muted" style="margin:0 0 14px">Раунды микса — это ваши игры из «Моих игр». Войдите, чтобы выбрать их или создать новые.</p><button class="btn gold" id="bLogin2">Войти</button></div>` :
      `<div class="card"><div class="fld"><label for="fT">Название вечера</label><input class="inp" id="fT" maxlength="60" value="${esc(CFG.title)}"></div></div>` +
      `<div class="card"><h3>Раунды</h3><div class="rl" id="rl">${CFG.rounds.length ? CFG.rounds.map((r, i) => `<div class="rr" data-i="${i}"><span class="grip">${ico('grip', 16)}</span><span class="num">${i + 1}</span>${gIco(r.k, 22)}<div class="tx"><b>${esc(titleOf(r))}</b><span>${GM[r.k].n}</span></div>` +
        `<a class="btn ghost sm" href="${r.k === 'sm' ? esc(r.adm || '../host/') : GM[r.k].ed + '?open=' + encodeURIComponent(r.id)}" target="_blank" rel="noopener">${ico('pencil', 14)}Изменить</a><button class="icb" data-del="${i}" title="Убрать раунд" aria-label="Убрать раунд">${ico('x', 16)}</button></div>`).join('') : '<div class="empty">Пока пусто — добавьте первый раунд</div>'}</div>` +
      `<button class="radd" id="rAdd">${ico('plus', 18)}Раунд</button></div>`) +
    `</div>` + (k ? `<div class="bar"><div class="in"><div class="t"><b>${esc(CFG.title)}</b><span>${CFG.rounds.length} ${plural(CFG.rounds.length, 'раунд', 'раунда', 'раундов')} · один QR на весь вечер</span></div><button class="btn gold" id="bGo"${CFG.rounds.length ? '' : ' disabled'}>${ico('play', 16)}Запустить вечер</button></div></div>` : '');
  renderTop();
  if ($('bLogin2')) $('bLogin2').onclick = goLogin;
  if (!k) return;
  $('fT').oninput = e => { CFG.title = e.target.value; STORE.save(); };
  $('rAdd').onclick = () => pickGame();
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (!sure(b)) return; CFG.rounds.splice(+b.dataset.del, 1); STORE.save(); renderEditor(); });
  sortable($('rl'), '.rr', '.grip', (f, t) => { CFG.rounds.splice(t, 0, CFG.rounds.splice(f, 1)[0]); STORE.save(); renderEditor(); });
  $('bGo').onclick = () => { if (CFG.rounds.length) startShow(); };
}
function sure(b) { if (b.classList.contains('sure')) return true; b._o = b.innerHTML; b.classList.add('sure'); b.innerHTML = 'Точно?'; setTimeout(() => { if (b.isConnected) { b.classList.remove('sure'); b.innerHTML = b._o; } }, 3000); return false; }
function sortable(box, itemSel, handleSel, onMove) {
  if (!box) return;
  box.addEventListener('pointerdown', e => {
    const h = e.target.closest(handleSel); if (!h) return; const item = h.closest(itemSel); if (!item || item.parentNode !== box) return; e.preventDefault();
    const r = item.getBoundingClientRect(), dy = e.clientY - r.top, from = [...box.children].indexOf(item);
    const ph = document.createElement('div'); ph.className = 'sort-ph'; ph.style.height = r.height + 'px'; box.insertBefore(ph, item);
    Object.assign(item.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', zIndex: 60, pointerEvents: 'none' }); item.classList.add('dragging'); document.body.classList.add('sorting');
    const move = ev => { item.style.top = (ev.clientY - dy) + 'px'; let best = null, bd = 1e9; [...box.children].filter(x => x !== item).forEach(x => { const b = x.getBoundingClientRect(), d = Math.abs(ev.clientY - (b.top + b.height / 2)); if (d < bd) { bd = d; best = x; } }); if (best && best !== ph) { const all = [...box.children]; if (all.indexOf(ph) < all.indexOf(best)) best.after(ph); else box.insertBefore(ph, best); } };
    const end = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', end); const to = [...box.children].filter(x => x !== item).indexOf(ph); ph.replaceWith(item); item.removeAttribute('style'); item.classList.remove('dragging'); document.body.classList.remove('sorting'); if (to !== from && to >= 0) onMove(from, to); };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', end);
  });
}
/* «+ Раунд»: сначала игра, потом конкретная игра из «Моих игр» */
function pickGame(after) {
  modal(`<div class="kh"><h3>Добавить раунд</h3><button class="icb" data-close aria-label="Закрыть">${ico('x', 18)}</button></div><p class="muted" style="margin:0 0 14px;font-size:14px">Выберите игру — она станет раундом вечера.</p><div class="ggrid">${Object.keys(GM).map(k => `<button class="gc" data-g="${k}"><span class="ga" style="background:linear-gradient(135deg,${GM[k].c}66,${GM[k].c}14);color:#fff">${ico('g_' + k, 40)}</span><b>${GM[k].n}</b><small>${GM[k].d}</small><span class="kb">Выбрать</span></button>`).join('')}</div>`, b => {
    b.querySelectorAll('[data-g]').forEach(x => x.onclick = () => pickSaved(x.dataset.g));
  }, true);
}
function pickSaved(k) {
  const g = GM[k], L = LISTS[k] || {}, ids = Object.keys(L).filter(id => !L[id].old).sort((a, b) => (L[b].updated || 0) - (L[a].updated || 0));
  modal(`<div class="kh"><h3>${g.n}</h3><button class="icb" data-close aria-label="Закрыть">${ico('x', 18)}</button></div><p class="muted" style="margin:0 0 12px;font-size:14px">Выберите игру из «Моих игр» или создайте новую.</p><div class="gl">` +
    ids.map(id => `<button class="gi" data-id="${esc(id)}"><span class="sp"><b>${esc(L[id].title || g.n)}</b><span>${L[id].couple ? esc(L[id].couple) + ' · ' : ''}${L[id].n != null ? L[id].n + ' вопр. · ' : ''}${L[id].updated ? new Date(L[id].updated).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : ''}</span></span>${ico('plus', 16)}</button>`).join('') +
    `<a class="gi gnew" href="${k === 'sm' ? '../host/' : g.ed + '?new=1'}" target="_blank" rel="noopener">${ico('plus', 16)}Создать новую — откроется в новой вкладке</a></div>` +
    `<div style="display:flex;justify-content:space-between;margin-top:14px"><button class="btn ghost sm" id="bBack">← Все игры</button><button class="btn ghost sm" id="bRef">${ico('refresh', 14)}Обновить список</button></div>`, b => {
    b.querySelectorAll('[data-id]').forEach(x => x.onclick = () => { const it = L[x.dataset.id]; CFG.rounds.push({ k, id: x.dataset.id, t: it.title || g.n, play: it.play || '', adm: it.adm || '' }); STORE.save(); closeModal(); renderEditor(); toast('Раунд добавлен'); });
    $('bBack').onclick = () => pickGame();
    $('bRef').onclick = () => { $('bRef').disabled = true; loadLists().then(() => pickSaved(k)); };
  }, true);
}

/* ================= вечер: пульт ведущего ================= */
let S = null, JOIN = {}, ONLINE = {}, offs = [], lastCore = '';
function startShow() {
  S = { id: uid(12), title: CFG.title, rounds: JSON.parse(JSON.stringify(CFG.rounds)).map(r => Object.assign(r, { t: titleOf(r) })), ri: -1, ph: 'lobby', rg: '', rk: '', code: '', tot: {}, res: {}, names: {}, done: [], ov: '' };
  ls('set', KEY_LIVE, S); renderLive(true); netStart();
}
function pub() { if (!S) return; ls('set', KEY_LIVE, S); renderLive(); push(); }
function coreOf() {
  const r = S.rounds[S.ri] || null, rank = Object.keys(S.names).map(id => ({ id, n: S.names[id], s: S.tot[id] || 0 })).sort((a, b) => b.s - a.s);
  return { id: S.id, ph: S.ph, title: S.title, code: S.code || '', ri: S.ri, n: S.rounds.length, rounds: S.rounds.map(x => ({ k: x.k, t: x.t })), rk: r ? r.k : '', rg: S.rg || '', play: r && r.k === 'sm' ? r.play : '', names: S.names, rank: rank.slice(0, 30), ov: S.ov || '' };
}
function push() { if (!S || !NET.ok || !S.net) return; const c = JSON.stringify(coreOf()); if (c === lastCore) return; lastCore = c; gref(S.id, 'core').set(JSON.parse(c)).catch(() => {}); gref(S.id, 'scr').set(JSON.parse(c)).catch(() => {}); }
async function netStart() {
  const ok = await netReady; if (!ok || !S) return; const gid = S.id;
  try {
    const m = (await gref(gid, 'meta').once('value')).val();
    if (!m || m.host !== NET.uid) await gref(gid, 'meta').set({ host: NET.uid, t: TS() });
    S.net = 1; offs.forEach(f => f()); offs = [];
    const jr = gref(gid, 'join'), orf = gref(gid, 'on');
    const onJ = x => { if (!S) return; const v = x.val() || {}; const nm = String(v.name || '').trim().slice(0, 24) || 'Команда'; if (S.names[x.key] !== nm) { S.names[x.key] = nm; pub(); } };
    jr.on('child_added', onJ); jr.on('child_changed', onJ); orf.on('value', x => { ONLINE = x.val() || {}; renderLive(); });
    offs.push(() => { jr.off(); orf.off(); });
    lastCore = ''; push();
    if (S.code) { const c = (await ref('codes/' + S.code).once('value')).val(); if (c && c.g === gid) return; }
    for (let i = 0; i < 8; i++) { const c = String(100000 + Math.floor(Math.random() * 900000)); try { const r = await ref('codes/' + c).transaction(cur => cur ? undefined : { g: gid, t: Date.now(), k: 'mix' }); if (r.committed) { S.code = c; ls('set', 'pbm_last', { gid, code: c }); pub(); break; } } catch (e) {} }
  } catch (e) { console.warn('mix net', e); }
}
function endShow() {
  offs.forEach(f => f()); offs = [];
  const last = ls('get', 'pbm_last'); ls('del', 'pbm_last');
  if (NET.ok && last && last.gid) { if (last.code) ref('codes/' + last.code).remove().catch(() => {}); gref(last.gid).remove().catch(() => {}); }
  S = null; ls('del', KEY_LIVE); built = false; renderEditor();
}
const A = {
  start(i) { if (!S.rounds[i]) return; S.ri = i; S.rg = ''; S.rk = S.rounds[i].k; S.ph = S.rk === 'sm' ? 'round' : 'starting'; built = false; pub(); },
  finishRound(then) {
    const r = S.rounds[S.ri], fr = $('rf'), ri = S.ri;
    const done = players => {
      const m = {}; (players || []).forEach(p => { if (!p || !p.id) return; m[p.id] = +p.score || 0; if (!S.names[p.id] && p.name) S.names[p.id] = p.name; });
      if (r && r.k !== 'sm') S.res[ri] = m;
      S.tot = {}; Object.values(S.res).forEach(x => Object.keys(x).forEach(id => { S.tot[id] = (S.tot[id] || 0) + x[id]; }));
      if (S.done.indexOf(ri) < 0) S.done.push(ri);
      S.rg = ''; built = false;
      if (then) then(); else { S.ph = 'between'; pub(); }
    };
    if (!r || r.k === 'sm' || !fr || !fr.contentWindow) return done(null);
    let got = false; const h = e => { if (e.origin !== location.origin || !e.data || e.data.pbmix !== 'res') return; got = true; window.removeEventListener('message', h); done(e.data.players); };
    window.addEventListener('message', h); fr.contentWindow.postMessage({ pbmix: 'req' }, location.origin);
    setTimeout(() => { if (!got) { window.removeEventListener('message', h); done(S.res[ri] ? Object.keys(S.res[ri]).map(id => ({ id, score: S.res[ri][id] })) : null); } }, 2500);
  },
  /* переключение на любой раунд: текущий закрываем (счёт сохраняется), выбранный запускаем */
  go(i) { if (i === S.ri && (S.ph === 'round' || S.ph === 'starting')) return; if (S.ph === 'round' || S.ph === 'starting') A.finishRound(() => A.start(i)); else A.start(i); },
  ov(k) { S.ov = S.ov === k ? '' : k; pub(); },
  /* рейтинг с учётом очков идущего раунда */
  liveScore() {
    if (S.ov === 'score') { S.ov = ''; pub(); return; }
    const fr = $('rf'), ri = S.ri, r = S.rounds[ri];
    const show = players => { if (players && r && r.k !== 'sm') { const m = {}; players.forEach(p => { if (!p || !p.id) return; m[p.id] = +p.score || 0; if (!S.names[p.id] && p.name) S.names[p.id] = p.name; }); S.res[ri] = m; S.tot = {}; Object.values(S.res).forEach(x => Object.keys(x).forEach(id => { S.tot[id] = (S.tot[id] || 0) + x[id]; })); } S.ov = 'score'; pub(); };
    if (!(S.ph === 'round' || S.ph === 'starting') || !fr || !fr.contentWindow) return show(null);
    let got = false; const h = e => { if (e.origin !== location.origin || !e.data || e.data.pbmix !== 'res') return; got = true; window.removeEventListener('message', h); show(e.data.players); };
    window.addEventListener('message', h); fr.contentWindow.postMessage({ pbmix: 'req' }, location.origin);
    setTimeout(() => { if (!got) { window.removeEventListener('message', h); show(null); } }, 2000);
  },
  scoresNow() { if (S.ph === 'round' || S.ph === 'starting') A.finishRound(() => { S.ph = 'between'; pub(); }); else { S.ph = 'between'; S.ov = ''; built = false; pub(); } },
  final() { const f = () => { S.ph = 'final'; S.rg = ''; S.ov = ''; built = false; pub(); }; if (S.ph === 'round' || S.ph === 'starting') A.finishRound(f); else f(); }
};
window.addEventListener('message', e => {
  if (VIEW !== 'host' || e.origin !== location.origin || !e.data || !S) return;
  if (e.data.pbmix === 'started' && (S.ph === 'starting' || S.ph === 'round') && e.data.gid) { if (S.rg !== e.data.gid) { S.rg = e.data.gid; S.ph = 'round'; pub(); } }
  if (e.data.pbmix === 'err') toast(e.data.msg || 'Ошибка раунда');
  if (e.data.pbmix === 'ov' && e.data.k === 'score') A.liveScore();
});
let built = false;
function renderLive(force) {
  if (!S || VIEW !== 'host') return;
  const r = S.rounds[S.ri];
  if (!built || force) {
    built = true;
    $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND('Игра-микс · ' + esc(S.title))}</a><span class="sp"></span><button class="btn ghost sm" id="bScr">${ico('monitor', 15)}Экран для проектора</button><button class="btn ghost sm" id="bPh">${ico('phone', 15)}Телефон</button><button class="btn ghost sm" id="bEnd">Завершить вечер</button></div></div>` +
      `<div class="live"><div><div class="pane"><h4>Вечер</h4><div id="ctl"></div></div><div class="pane" style="margin-top:14px"><h4>Общий счёт</h4><div class="tt" id="tt"></div><div class="codebox"><div><div class="k">Вход для команд</div><b id="cd"></b></div></div></div></div>` +
      `<div id="main">${(S.ph === 'starting' || S.ph === 'round') && r && r.k !== 'sm' ? `<iframe class="frame" id="rf" src="${appUrl(r.k, 'open=' + encodeURIComponent(r.id) + '&mix=1')}" allow="autoplay; fullscreen"></iframe>` :
        S.ph === 'round' && r && r.k === 'sm' ? `<div class="hold"><h2>Секретная миссия</h2><p>Гости играют по своим телефонам — экран показывает QR на игру. Панель ведущего — в отдельной вкладке.</p><a class="btn gold" href="${esc(r.adm || '../host/')}" target="_blank" rel="noopener">${ico('ext', 15)}Открыть панель миссии</a></div>` :
        S.ph === 'lobby' ? `<div class="hold"><h2>Команды подключаются</h2><p>Откройте экран для проектора — на нём QR-код на весь вечер. Когда все в сборе, нажмите на раунд слева — он сразу запустится.</p></div>` :
        S.ph === 'between' ? `<div class="hold"><h2>Раунд завершён</h2><p>На экране — общий счёт. Нажмите на любой раунд слева — он запустится, а счёт текущего сохранится.</p></div>` :
        `<div class="hold"><h2>Финал</h2><p>На экране — победители вечера по сумме всех раундов.</p></div>`}</div></div>`;
    $('bScr').onclick = () => { if (!S.code) { toast('Подключаемся…'); return; } window.open(`${BASE}?view=screen&g=${S.id}`, 'pbm_screen'); };
    $('bPh').onclick = () => window.open(`${BASE}?view=play&g=${S.id}`, '_blank');
    $('bEnd').onclick = () => { if (!sure($('bEnd'))) return; endShow(); };
  }
  const run = S.ph === 'round' || S.ph === 'starting';
  $('ctl').innerHTML = `<div class="rtabs">${S.rounds.map((x, i) => `<button class="rt${i === S.ri && run ? ' cur' : ''}${S.done.indexOf(i) >= 0 ? ' done' : ''}" data-go="${i}">${gIco(x.k)}<span class="tx"><b>Раунд ${i + 1}</b><small>${esc(x.t)}</small></span>${i === S.ri && run ? '<span class="st live">идёт</span>' : S.done.indexOf(i) >= 0 ? '<span class="st">✓</span>' : ''}</button>`).join('')}</div>` +
    `<div class="sctl"><div class="k" style="margin:12px 0 8px">Экран</div><div class="sg"><button data-ov="qr" class="${S.ov === 'qr' ? 'on' : ''}">QR-код</button><button data-ov="score" class="${S.ov === 'score' ? 'on' : ''}">Рейтинг</button><button id="bFinal" class="${S.ph === 'final' ? 'on' : ''}">Победители</button></div></div>`;
  $('ctl').querySelectorAll('[data-go]').forEach(b => b.onclick = () => A.go(+b.dataset.go));
  $('ctl').querySelectorAll('[data-ov]').forEach(b => b.onclick = () => b.dataset.ov === 'score' ? A.liveScore() : A.ov(b.dataset.ov));
  $('bFinal').onclick = A.final;
  const rank = Object.keys(S.names).map(id => ({ id, n: S.names[id], s: S.tot[id] || 0 })).sort((a, b) => b.s - a.s);
  $('tt').innerHTML = rank.length ? rank.map((p, i) => `<div><em class="muted" style="font-style:normal;width:18px">${i + 1}</em><span>${esc(p.n)}</span><b>${nums(p.s)}</b></div>`).join('') : '<p class="muted" style="margin:0;font-size:14px">Команды появятся, когда войдут по QR</p>';
  $('cd').textContent = S.code ? `${SHORT} · ${fmtCode(S.code)}` : 'подключаемся…';
}

/* ================= экран ================= */
function viewScreen() {
  document.body.classList.add('scrv');
  $('app').innerHTML = '<div class="sfull" id="sf"></div>';
  const sf = $('sf'); let C = null, cur = '';
  const ov = document.createElement('div'); ov.className = 'sndov'; ov.innerHTML = '<div>Нажмите, чтобы включить звук<small>и открыть на весь экран</small></div>';
  ov.onclick = () => { ov.remove(); const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d); };
  document.body.appendChild(ov);
  const mark = () => window.PB_BRAND ? `<div class="brandm">${PB_BRAND.mark(30)}<img src="${PB_BRAND.base}wordmark-white.png" alt="Beloglazov Event"></div>` : '';
  const draw = () => {
    if (!C) { sf.innerHTML = '<div class="mst"><div class="in"><h1>Ждём вечер…</h1></div></div>'; cur = ''; return; }
    drawOv();
    const k = C.ph === 'round' && C.rk !== 'sm' ? 'f:' + C.rg : C.ph === 'round' ? 'sm:' + C.ri : C.ph + ':' + JSON.stringify(C.rank) + C.code + JSON.stringify(C.names);
    if (k === cur) return; cur = k;
    if (C.ph === 'round' && C.rk !== 'sm' && C.rg) { sf.innerHTML = `<iframe src="${appUrl(C.rk, 'view=screen&g=' + C.rg + '&mix=1')}" allow="autoplay; fullscreen"></iframe>`; return; }
    const R = C.rounds || [], rank = C.rank || [], names = Object.values(C.names || {});
    let h = '';
    if (C.ph === 'round' && C.rk === 'sm') h = `<div class="mlob"><div><div class="kk">Раунд ${C.ri + 1} из ${C.n}</div><h1>Секретная миссия</h1><p style="font-size:1.4em;font-weight:700;opacity:.85">Откройте свою тайную миссию на телефоне — у вас она уже на экране. Нет? Сканируйте QR.</p></div><div class="joinc"><div class="qr" id="qrc"></div><small>миссия</small></div></div>`;
    else if (C.ph === 'lobby' || C.ph === 'starting') h = `<div class="mlob"><div><div class="kk">Сегодня в программе</div><h1>${esc(C.title)}</h1><div class="rs">${R.map((r, i) => `<div><i style="background:${GM[r.k].c}55">${ico('g_' + r.k, 16)}</i>${esc(r.t)}</div>`).join('')}</div><div class="teams">${names.map(n => `<span>${esc(n)}</span>`).join('')}</div></div><div class="joinc"><div class="qr" id="qrc"></div><div class="u">${esc(SHORT)}</div><small>код вечера</small><div class="cd">${C.code ? fmtCode(C.code) : '······'}</div></div></div>`;
    else if (C.ph === 'between') { const nx = R[C.ri + 1]; h = `<div class="kk">После раунда ${C.ri + 1} из ${C.n}</div><h1 style="font-size:3em">Общий счёт</h1><div class="msc">${rank.slice(0, 8).map((p, i) => `<div class="row${i === 0 && p.s > 0 ? ' t1' : ''}" style="animation-delay:${i * 80}ms"><span class="p">${i + 1}</span><span class="n">${esc(p.n)}</span><span class="s">${nums(p.s)}</span></div>`).join('') || '<p>Команд пока нет</p>'}</div>${nx ? `<div class="nxt">Дальше: ${esc(nx.t)} · ${GM[nx.k].n}</div>` : ''}`; }
    else if (C.ph === 'final') { const t = rank.slice(0, 3), o = [t[1], t[0], t[2]], hh = [62, 88, 44], pl = [2, 1, 3]; h = `<h1 style="text-align:center;font-size:3.4em">Победители вечера</h1><div class="pod">${o.map((p, i) => p ? `<div class="${pl[i] === 1 ? 'w' : ''}"><div class="nm">${esc(p.n)}</div><div class="sc">${nums(p.s)}</div><div class="bl" style="height:${hh[i]}%;animation-delay:${[.6, 1.2, 0][i]}s">${pl[i]}</div></div>` : '<div></div>').join('')}</div>`; }
    sf.innerHTML = `<div class="mst"><div class="in">${mark()}${h}</div></div>`;
    const q = $('qrc'); if (q) qr(q, C.ph === 'round' && C.rk === 'sm' ? C.play : `${BASE}?view=play&g=${C.id}`, 600);
  };
  const ovb = document.createElement('div'); ovb.className = 'movl'; document.body.appendChild(ovb); let ovk = '';
  function drawOv() {
    const k = C && C.ov ? C.ov + JSON.stringify(C.rank) + C.code : ''; if (k === ovk) return; ovk = k;
    ovb.classList.toggle('on', !!k); if (!k) { ovb.innerHTML = ''; return; }
    if (C.ov === 'qr') { ovb.innerHTML = `<div class="joinc big"><div class="qr" id="oqr"></div><div class="u">${esc(SHORT)}</div><small>код вечера</small><div class="cd">${fmtCode(C.code)}</div></div>`; qr($('oqr'), `${BASE}?view=play&g=${C.id}`, 600); }
    else ovb.innerHTML = `<div class="mst" style="position:absolute"><div class="in"><div class="kk">Раунд ${Math.max(1, C.ri + 1)} из ${C.n}</div><h1 style="font-size:3em">Общий счёт</h1><div class="msc">${(C.rank || []).slice(0, 8).map((p, i) => `<div class="row${i === 0 && p.s > 0 ? ' t1' : ''}"><span class="p">${i + 1}</span><span class="n">${esc(p.n)}</span><span class="s">${nums(p.s)}</span></div>`).join('')}</div></div></div>`;
  }
  draw();
  if (!GID) return;
  netReady.then(ok => { if (!ok) return; const on = gref(GID, 'on/' + NET.uid), pr = () => { if (NET.connected) { on.onDisconnect().remove(); on.set('scr').catch(() => {}); } }; NET.subs.push(pr); pr(); gref(GID, 'scr').on('value', x => { const had = C; C = x.val(); if (!C && had) { sf.innerHTML = '<div class="mst"><div class="in"><h1>Спасибо, что играли!</h1></div></div>'; cur = 'end'; return; } draw(); }); });
}

/* ================= телефон ================= */
function viewPlay() {
  document.body.classList.add('ph');
  const app = $('app');
  if (!GID) {
    app.innerHTML = `<div class="pv"><div class="mid"><h2>Введите код</h2><p>Код на экране</p><input class="pin" id="cIn" inputmode="numeric" maxlength="7" placeholder="000 000" style="font-size:28px;letter-spacing:.2em"><button class="pbtn" id="cGo">Войти</button><p id="cErr"></p></div></div>`;
    $('cGo').onclick = () => { const c = $('cIn').value.replace(/\D/g, ''); if (c.length !== 6) return; netReady.then(() => ref('codes/' + c).once('value').then(s => { const v = s.val(); if (!v) { $('cErr').textContent = 'Код не найден'; return; } location.replace(v.k === 'mix' ? BASE + '?view=play&g=' + v.g : '../q/?c=' + c); })); };
    return;
  }
  app.innerHTML = '<div class="pv"><div class="mid"><div class="spin"></div><p>Подключаемся…</p></div></div>';
  let C = null, J = null, me = null, cur = '', joining = false;
  const draw = () => {
    if (!C) return;
    const name = J && J.name;
    let k;
    if (!name) k = 'join';
    else if (C.ph === 'round' && C.rk === 'sm' && C.play) k = 'sm:' + C.play;
    else if (C.ph === 'round' && C.rg) k = 'f:' + C.rg;
    else k = C.ph + ':' + JSON.stringify(C.rank);
    if (k === cur) return; cur = k;
    if (!name) {
      app.innerHTML = `<div class="pv"><div class="mid"><div style="opacity:.9">${window.PB_BRAND ? PB_BRAND.mark(40) : ''}</div><h2>${esc(C.title)}</h2><p>Придумайте название команды — оно будет во всех раундах вечера</p><input class="pin" id="nIn" maxlength="24" placeholder="Название команды" value="${esc(ls('get', 'pbm_name') || '')}"><button class="pbtn" id="nGo">Войти в игру</button><p style="font-size:13px;opacity:.6">Приложение не нужно — всё работает в браузере</p></div></div>`;
      const go = () => { const v = $('nIn').value.trim(); if (!v || joining) return; joining = true; ls('set', 'pbm_name', v); gref(GID, 'join/' + me).set({ name: v.slice(0, 24), table: 0, t: TS() }).then(() => { joining = false; }, () => { joining = false; }); };
      $('nGo').onclick = go; $('nIn').onkeydown = e => { if (e.key === 'Enter') go(); };
      return;
    }
    if (k.slice(0, 3) === 'sm:') { app.innerHTML = `<div class="sfull"><iframe src="${esc(C.play)}"></iframe></div>`; return; }
    if (k.slice(0, 2) === 'f:') { app.innerHTML = `<div class="sfull"><iframe src="${appUrl(C.rk, 'view=play&g=' + C.rg + '&mix=1&nm=' + encodeURIComponent(name))}" allow="autoplay"></iframe></div>`; return; }
    const pos = (C.rank || []).findIndex(p => p.id === me), my = (C.rank || [])[pos];
    const sub = my ? `${pos + 1} место · ${nums(my.s)} ${plural(my.s, 'очко', 'очка', 'очков')}` : '';
    app.innerHTML = `<div class="pv"><div class="mid">${C.ph === 'final' ? `<div class="big">${pos >= 0 ? pos + 1 : '—'}</div><h2>${pos === 0 ? 'Вы победили!' : 'Вечер окончен'}</h2><p>${sub}</p>` : C.ph === 'between' ? `<h2>Раунд завершён</h2><p>${sub}</p><p>Смотрите на экран — скоро следующий раунд</p>` : `<h2>${esc(name)} в игре!</h2><p>Смотрите на экран — скоро начинаем</p>`}</div></div>`;
  };
  netReady.then(ok => {
    if (!ok) { app.innerHTML = '<div class="pv"><div class="mid"><h2>Нет связи</h2></div></div>'; return; }
    me = NET.uid;
    const on = gref(GID, 'on/' + me), pr = () => { if (NET.connected && J) { on.onDisconnect().remove(); on.set(true).catch(() => {}); } }; NET.subs.push(pr);
    gref(GID, 'meta').once('value').then(x => { if (!x.exists()) app.innerHTML = '<div class="pv"><div class="mid"><h2>Вечер не найден</h2><p>Попросите у ведущего новый QR-код</p></div></div>'; });
    gref(GID, 'core').on('value', x => { if (!x.val() && C) { C = null; cur = 'end'; app.innerHTML = '<div class="pv"><div class="mid"><h2>Вечер завершён</h2><p>Спасибо, что играли!</p></div></div>'; return; } C = x.val(); draw(); });
    gref(GID, 'join/' + me).on('value', x => { J = x.val(); if (J) pr(); cur = ''; draw(); });
  });
}

/* ================= запуск ================= */
function bootHost() {
  const live = ls('get', KEY_LIVE), FROM = P.get('from'), OPEN = P.get('open'), PICK = P.get('pick');
  if (FROM || OPEN || P.get('new')) try { history.replaceState(null, '', location.pathname); } catch (e) {}
  if (live && live.id && !FROM && !OPEN) { S = live; built = false; renderLive(true); netStart(); accLoad(); return; }
  if (P.get('new') || FROM) CFG = normCfg({});
  if (FROM) { const [k, id] = FROM.split(':'); if (GM[k] && id) CFG.rounds.push({ k, id, t: '' }); }
  renderEditor();
  accLoad().then(() => netReady).then(ok => {
    const k = wsKey(); renderEditor();
    if (!k || !ok) return;
    const go = () => loadLists().then(() => { renderEditor(); if (FROM) { if (PICK && GM[PICK]) pickSaved(PICK); else pickGame(); } });
    if (OPEN) ref(`ws/${k}/mq/${OPEN}`).once('value').then(x => { if (x.val()) CFG = normCfg(x.val()); ls('set', KEY_CFG, CFG); go(); }, go);
    else { if (FROM) STORE.save(); go(); }
  });
}
if (VIEW === 'screen') viewScreen();
else if (VIEW === 'play') viewPlay();
else bootHost();
window.__mix = { get s() { return S; }, get cfg() { return CFG; }, A };
})();
