
/* ================= канал между вкладками одного устройства ================= */
let ch = null; const handlers = [];
try { ch = new BroadcastChannel('pbquiz2'); ch.onmessage = e => handlers.forEach(h => h(e.data)); } catch (e) {}
const send = m => { if (ch) try { ch.postMessage(m); } catch (e) {} };
const onMsg = h => handlers.push(h);

/* ================= сеть: ведущий ================= */
let hostOff = [], lastCore = '', lastPk = '', scrTimer = null, rvTimer = null, hbTimer = null;
let REM = {}, ONLINE = {};
const doneCmd = {};
const coupleRoles = () => [...new Set(Object.values(REM).map(r => r.role).filter(r => r === 'groom' || r === 'bride'))];
const hasCoupleDevices = () => coupleRoles().length > 0;
function pubQs(g) { return g.qs.map((q, i) => ({ type: q.type, text: q.text || '', img: q.img || '', blur: q.blur ? 1 : 0, mk: mdOk(q.qm) ? q.qm.k : '', opts: (q.opts || []).map(o => ({ t: o.t || '', img: o.img || '' })), unit: q.unit || '', x2: mult(g, i) > 1 })); }
async function allocCode(gid) {
  for (let i = 0; i < 8; i++) {
    const c = String(100000 + Math.floor(Math.random() * 900000));
    try { const r = await ref('codes/' + c).transaction(cur => cur ? undefined : { g: gid, t: Date.now() }); if (r.committed) return c; } catch (e) {}
  }
  return '';
}
async function startNet() {
  const gid = G.id;
  ls('set', 'pbq_last', { gid, code: '' });
  lastCore = ''; lastPk = '';
  try {
    await gref(gid, 'meta').set({ host: NET.uid, t: TS() });
    if (!G || G.id !== gid) return;
    attachNet();
    ref('rkeys/' + gid + '/' + G.rkey).set(true);
    gref(gid, 'q').set(pubQs(G));
    netPush(true);
    uploadImgs(gid);
    const code = await allocCode(gid);
    if (G && G.id === gid && code) { G.code = code; ls('set', 'pbq_last', { gid, code }); publish(); }
  } catch (e) { console.warn('quiz net', e); }
}
function pickTime(a) { const t = +a.t, c = +a.c; return (isFinite(c) && c <= t + 50 && t - c <= 2500) ? c : t; }
function attachNet() {
  const gid = G.id;
  const jr = gref(gid, 'join'), ar = gref(gid, 'ans'), orf = gref(gid, 'on'), rr = ref('rem/' + gid), cr = ref('rc/' + gid);
  const onJ = x => { const v = x.val(); if (v && G && G.id === gid) join(x.key, v.name, true, v.table); };
  const onA = x => { const v = x.val(); if (!v || !G || G.id !== gid || G.phase !== 'question') return; const a = v[G.qi]; if (a) answer(x.key, G.qi, a, pickTime(a)); };
  const onO = x => { ONLINE = x.val() || {}; renderNetLine(); scheduleRv(); };
  const onR = x => { REM = x.val() || {}; scheduleRv(); if (G) render(); };
  const onC = x => onCmd(x.key, x.val());
  jr.on('child_added', onJ); jr.on('child_changed', onJ);
  ar.on('child_added', onA); ar.on('child_changed', onA);
  orf.on('value', onO); rr.on('value', onR); cr.on('child_added', onC);
  clearInterval(hbTimer);
  hbTimer = setInterval(() => { if (!G || G.id !== gid) return; const t = performance.now(); gref(gid, 'hb').set(TS()).then(() => { NET.rtt = Math.round(performance.now() - t); renderNetLine(); }).catch(() => {}); }, 5000);
  hostOff.push(() => { jr.off(); ar.off(); orf.off(); rr.off(); cr.off(); clearInterval(hbTimer); });
}
function onCmd(k, c) {
  if (!c || doneCmd[k] || !G) return; doneCmd[k] = 1;
  if (Math.abs(now() - (+c.t || 0)) > 20000) return;
  const r = REM[c.u]; if (!r) return;
  if (c.a === 'cpl') { if (r.role === 'groom' || r.role === 'bride') coupleAnswer(r.role, +c.qi, +c.o); return; }
  if (r.role !== 'remote') return;
  if (c.a === 'next') next();
  else if (c.a === 'skip') skipTimer();
  else if (c.a === 'replay') replayMedia();
  else if (c.a === 'kick') kick(String(c.p || ''));
  else if (c.a === 'cplset') coupleAnswer('host', G.qi, +c.o);
  else if (c.a === 'intro') startIntro();
}
function skipTimer() { if (G && G.phase === 'question') { G.t1 = now(); reveal(); } }
function endNet() {
  hostOff.forEach(f => f()); hostOff = [];
  clearTimeout(scrTimer); scrTimer = null; clearTimeout(rvTimer); rvTimer = null;
  REM = {}; ONLINE = {};
  const last = ls('get', 'pbq_last'); ls('del', 'pbq_last');
  if (NET.ok && last && last.gid) {
    const gid = last.gid;
    ['rkeys/', 'rv/', 'rc/', 'rem/'].forEach(p => ref(p + gid).remove().catch(() => {}));
    if (last.code) ref('codes/' + last.code).remove().catch(() => {});
    gref(gid).remove().catch(() => {});
  }
}
function uploadImgs(gid) {
  const ids = [];
  const add = id => { if (id && id.slice(0, 2) !== 'u:' && ids.indexOf(id) < 0 && IMG.get(id)) ids.push(id); };
  add(G.photo); G.qs.forEach(q => { add(q.img); add(q.hp); add(q.aimg); (q.opts || []).forEach(o => add(o.img)); });
  ids.reduce((pr, id) => pr.then(() => { const d = IMG.get(id); return IMG.shrink(d, 900, .72).then(ph => { if (!G || G.id !== gid) return; return gref(gid, 'img/' + id).set({ p: ph || d, s: d }); }); }), Promise.resolve()).catch(e => console.warn('quiz img', e));
}
function coreOf(g) {
  const rev = g.phase === 'reveal' || g.phase === 'board' || g.phase === 'final', q = g.qs[g.qi];
  const E = g.phase === 'intro' ? entities(g) : [], e = E[g.ii];
  const c = (g.cpl && g.cpl[g.qi]) || {};
  return { id: g.id, phase: g.phase, qi: g.qi, ii: g.ii, t0: g.t0, t1: g.t1, nq: g.qs.length, title: g.title || '', couple: g.couple || '', accent: g.accent || '', final: !!g.final, code: g.code || '', res: g.res || '', demo: !!g.demo,
    s: { change: !!g.s.change, play: g.s.play, speed: !!g.s.speed, tables: g.s.tables || 10, show: g.s.show || '' },
    ok: rev && q ? (q.type === 'number' ? (hasRng(q) ? { num: +q.num, num2: +q.num2 } : { num: +q.num }) : { set: okSet(g, g.qi), cpl: q.type === 'couple' ? { groom: c.groom == null ? -1 : c.groom, bride: c.bride == null ? -1 : c.bride, host: c.host == null ? -1 : c.host } : null }) : null,
    n: g.phase === 'lobby' ? 0 : Object.keys(g.players).length,
    intro: e ? { i: g.ii, of: E.length, pid: e.pid || '', table: e.table || 0, name: e.name } : null };
}
function scrOf(g) {
  const rev = g.phase === 'reveal' || g.phase === 'board' || g.phase === 'final';
  const v = JSON.parse(JSON.stringify(g));
  delete v.snap; delete v.rkey; delete v.banned;
  v.qs = v.qs.map((q, i) => { const o = { type: q.type, text: q.text || '', img: q.img || '', opts: (q.opts || []).map(x => ({ t: x.t || '', img: x.img || '' })), unit: q.unit || '', ok: [], num: null, x2: !!q.x2, fact: q.fact ? 1 : 0, hp: q.hp || '', aimg: q.aimg || '', blur: q.blur ? 1 : 0, qm: mdOk(q.qm) ? q.qm : null, am: mdOk(q.am) ? q.am : null }; if (rev && i === g.qi) { o.ok = q.ok || []; o.num = q.num == null || q.num === '' ? null : +q.num; if (hasRng(q)) { o.rng = 1; o.num2 = +q.num2; } } return o; });
  const a = {}; if (g.qi >= 0) a['q' + g.qi] = g.ans[g.qi] || {}; v.ans = a;
  const c = g.cpl[g.qi] || {};
  v.cpl = {}; if (g.qi >= 0) v.cpl['q' + g.qi] = rev ? c : { groom: c.groom != null ? 9 : null, bride: c.bride != null ? 9 : null };
  v.croles = coupleRoles();
  Object.keys(v.players).forEach(k => { delete v.players[k].skill; });
  return v;
}
function fixScr(v) {
  if (!v) return null;
  v.players = v.players || {}; v.prevRank = v.prevRank || {}; v.s = v.s || {}; v.croles = v.croles || [];
  Object.keys(v.players).forEach(k => { const p = v.players[k]; p.times = p.times || []; p.score = p.score || 0; });
  const a = {}; if (v.ans && v.ans['q' + v.qi]) a[v.qi] = v.ans['q' + v.qi]; v.ans = a;
  const c = {}; if (v.cpl && v.cpl['q' + v.qi]) c[v.qi] = v.cpl['q' + v.qi]; v.cpl = c;
  v.qs = (v.qs || []).map(q => { q = q || {}; return { type: q.type || 'choice', text: q.text || '', img: q.img || '', opts: (q.opts || []).map(o => ({ t: (o && o.t) || '', img: (o && o.img) || '' })), unit: q.unit || '', ok: q.ok || [], num: q.num, rng: q.rng ? 1 : 0, num2: q.num2 == null ? null : q.num2, x2: !!q.x2, fact: q.fact ? 1 : 0, hp: q.hp || '', aimg: q.aimg || '', blur: q.blur ? 1 : 0, qm: q.qm || null, am: q.am || null }; });
  return v;
}
function netPush(force) {
  if (!G || !G.net || !NET.ok) return;
  const gid = G.id, rev = G.phase === 'reveal' || G.phase === 'board' || G.phase === 'final';
  const core = coreOf(G), ck = JSON.stringify(core), pk = G.phase + ':' + G.qi + ':' + G.ii, changed = pk !== lastPk;
  if (ck !== lastCore) { lastCore = ck; gref(gid, 'core').set(core); }
  if (changed || force) { lastPk = pk; if (rev) pushScores(); }
  if (force || changed) { clearTimeout(scrTimer); scrTimer = null; gref(gid, 'scr').set(scrOf(G)); }
  else if (!scrTimer) scrTimer = setTimeout(() => { scrTimer = null; if (G && G.id === gid) gref(gid, 'scr').set(scrOf(G)); }, 300);
  if (G.phase === 'reveal' && G.qs[G.qi].type === 'couple') pushScores();
  scheduleRv(force || changed);
}
function pushScores() {
  const upd = {}, r = ranked(), tr = G.s.play === 'tables' ? tableRank(G) : [];
  r.forEach((p, i) => {
    if (!p.net) return;
    const t = tr.findIndex(x => x.table === p.table);
    upd[p.id] = { qi: G.qi, score: p.score, gain: p.gain || 0, last: p.last || 'none', streak: p.streak || 0, ok: p.ok || 0, rank: i + 1, n: r.length, lv: p.lv == null ? null : p.lv, table: p.table || 0, trank: t + 1, tn: tr.length };
  });
  if (Object.keys(upd).length) gref(G.id, 'sc').update(upd);
}
function rvOf() {
  const q = G.qs[G.qi], A = (G.ans[G.qi] || {}), E = entities(G);
  return { phase: G.phase, qi: G.qi, nq: G.qs.length, next: nextLabel(G), title: G.title || '', code: G.code || '', demo: !!G.demo, rtt: NET.rtt, res: G.res || '',
    q: q ? { text: q.text || '', type: q.type, opts: q.opts.map(o => o.t || ''), ok: q.ok || [], num: q.num == null ? null : q.num, unit: q.unit || '' } : null,
    cpl: (G.cpl[G.qi]) || {}, roles: coupleRoles(), answered: Object.keys(A).length, n: Object.keys(G.players).length,
    online: Object.keys(ONLINE).length, canIntro: G.phase === 'lobby' && E.length > 0, play: G.s.play,
    intro: G.phase === 'intro' && E[G.ii] ? { i: G.ii, of: E.length, name: E[G.ii].name } : null,
    players: ranked().slice(0, 100).map(p => ({ id: p.id, name: p.name, score: p.score, a: !!A[p.id], on: !p.net || !!ONLINE[p.id], bot: !!p.bot, t: p.table || 0 })) };
}
function scheduleRv(now_) {
  if (!G || !G.net || !NET.ok || !Object.values(REM).some(r => r.role === 'remote')) return;
  if (now_) { clearTimeout(rvTimer); rvTimer = null; ref('rv/' + G.id).set(rvOf()); return; }
  if (!rvTimer) rvTimer = setTimeout(() => { rvTimer = null; if (G) ref('rv/' + G.id).set(rvOf()); }, 450);
}
function saveResults() {
  if (!G || !G.net || !NET.ok || G.res || !can('keepsake')) return;
  const rid = uid(14), g = G;
  const qs = g.qs.map((q, i) => {
    const A = g.ans[i] || {}, ids = Object.keys(A), tot = ids.length;
    if (i > g.qi) return null;
    if (q.type === 'number') {
      const arr = ids.map(id => ({ name: (g.players[id] || {}).name || 'Гость', v: A[id].v })).sort((a, b) => numErr(q, a.v) - numErr(q, b.v));
      const avg = tot ? Math.round(ids.reduce((s, id) => s + A[id].v, 0) / tot * 10) / 10 : null;
      return { type: 'number', text: q.text || 'Вопрос с фото', num: +q.num, num2: hasRng(q) ? +q.num2 : null, unit: q.unit || '', tot, best: arr[0] || null, avg };
    }
    const cnt = q.opts.map(() => 0); ids.forEach(id => { if (A[id].o < cnt.length) cnt[A[id].o]++; });
    const c = g.cpl[i] || {};
    return { type: q.type, text: q.text || 'Вопрос с фото', opts: q.opts.map(o => o.t || 'фото'), cnt, tot, ok: okSet(g, i), cpl: q.type === 'couple' ? { groom: c.groom == null ? -1 : c.groom, bride: c.bride == null ? -1 : c.bride } : null };
  }).filter(Boolean);
  const data = { v: 1, host: NET.uid, t: TS(), title: g.title || '', couple: g.couple || '', accent: g.accent || '', n: Object.keys(g.players).length, play: g.s.play,
    winners: ranked(g).slice(0, 3).map(p => ({ name: p.name, score: p.score })), tables: g.s.play === 'tables' ? tableRank(g).slice(0, 3).map(t => ({ name: t.name, score: t.score, n: t.n })) : [],
    noms: nominations(g), qs, photo: '' };
  const done = () => ref('res/' + rid).set(data).then(() => { if (G && G.id === g.id) { G.res = rid; publish(); } }).catch(e => console.warn('res', e));
  if (g.photo && IMG.get(g.photo)) IMG.shrink(IMG.get(g.photo), 360, .8).then(p => { data.photo = p || ''; done(); }); else done();
}
const resLink = rid => BASE + '?view=result&r=' + rid;
const playLink = g => g && g.net ? BASE + '?view=play&g=' + g.id : BASE + '?view=play&local=1';
const screenNetLink = g => BASE + '?view=screen&g=' + g.id;
const remoteLink = (g, role) => BASE + '?view=' + (role === 'remote' ? 'remote' : 'play') + '&g=' + g.id + '&k=' + g.rkey + (role === 'remote' ? '' : '&role=' + role);
