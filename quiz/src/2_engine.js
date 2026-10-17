
/* ================= конфиг квиза ================= */
const KEY_CFG = GAME === 'fact' ? 'pbf_cfg_v1' : 'pbq_cfg_v2', KEY_LIVE = GAME === 'fact' ? 'pbf_live_v1' : 'pbq_live_v2';
const WSQ = GAME === 'fact' ? 'fq' : 'q', WSL = GAME === 'fact' ? 'flist' : 'list';
const optFilled = o => !!(o && (o.t || '').trim());
function normQ(q) {
  q = Object.assign({ id: uid(), type: 'choice', text: '', img: '', opts: [], ok: [], x2: false }, q || {});
  if (!TYPES[q.type]) q.type = 'choice';
  q.opts = (q.opts || []).slice(0, 4).map(o => typeof o === 'string' ? O(o) : Object.assign(O(o && o.t), o && o.img ? { img: o.img } : {}));
  delete q.oimg;
  if (typeof q.ok === 'number') q.ok = [q.ok];
  q.ok = (q.ok || []).filter(i => i >= 0 && i < q.opts.length);
  if (q.type !== 'number') {
    while (q.opts.length > 2 && !optFilled(q.opts[q.opts.length - 1]) && q.ok.indexOf(q.opts.length - 1) < 0) q.opts.pop();
    while (q.opts.length < 2) q.opts.push(O());
  }
  if (isCh(q) && !q.ok.length) q.ok = [0];
  if (!isCh(q)) q.ok = [];
  if (q.type !== 'photo') { delete q.aimg; delete q.blur; }
  return q;
}
function defaultCfg(blank) {
  const couple = 'Максим и Алина';
  return { id: uid(10), title: GAME === 'fact' ? 'Интересный факт' : blank ? 'Новый квиз' : 'Квиз о паре', couple, mode: 'wedding', facts: GAME === 'fact' && !blank ? sampleFacts() : [], sampleF: GAME === 'fact' && !blank ? 1 : 0,
    s: Object.assign({}, MODES.wedding.s, { play: 'solo', tables: 10, lastX2: true, sound: true }, GAME === 'fact' ? { show: 'stage' } : {}), bots: false,
    accent: '#f2efe9', photo: '', wifi: { ssid: '', pass: '' }, form: '',
    qs: blank ? [normQ({ opts: [O(), O(), O(), O()] })] : sampleQs(couple), updated: Date.now() };
}
function normCfg(c) {
  if (!c || typeof c !== 'object') return defaultCfg();
  const s = c.s || {};
  c.s = Object.assign({}, MODES.wedding.s, { play: 'solo', tables: 10, lastX2: true, sound: true }, s);
  if (!s.play && s.teams) c.s.play = 'teams';
  delete c.s.teams;
  if (!PLAYS[c.s.play]) c.s.play = 'solo';
  c.s.tables = clamp(+c.s.tables || 10, 2, 40);
  c.qs = (c.qs || []).map(normQ);
  if (!c.qs.length) c.qs = [normQ({ opts: [O(), O(), O(), O()] })];
  if (!c.brand2) { if (!c.accent || c.accent === '#e2cd92') c.accent = '#f2efe9'; c.brand2 = 1; }
  c.accent = validColor(c.accent); c.wifi = c.wifi || { ssid: '', pass: '' };
  c.id = c.id || uid(10); c.title = c.title || GNAME; c.couple = c.couple || '';
  c.facts = (c.facts || []).map(normFact);
  if (GAME === 'fact') { if (!SHOWS[c.s.show]) c.s.show = 'stage'; c.s.play = 'solo'; }
  if (!MODES[c.mode]) c.mode = 'wedding';
  c.bots = !!c.bots;
  return c;
}
let CFG = normCfg(ls('get', KEY_CFG) || (GAME === 'quiz' && ls('get', 'pbq_cfg_v1') ? Object.assign(ls('get', 'pbq_cfg_v1'), { bots: false }) : null));
/* «Интересный факт»: из фактов о гостях собираем вопросы «Кто это?» */
function factsToQs(facts, show) {
  const ok = (facts || []).filter(factOk), names = [...new Set(ok.map(f => f.name.trim()))], n = show === 'v4' ? 4 : 2, ph = {};
  ok.forEach(f => { const k = f.name.trim(); if (f.img && !ph[k]) ph[k] = f.img; });
  if (names.length < 2) return [];
  return ok.map(f => {
    const hero = f.name.trim(), others = names.filter(n => n !== hero);
    for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
    const all = [hero].concat(others.slice(0, n - 1));
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    return normQ({ type: 'choice', text: f.fact.trim(), opts: all.map(t => ({ t, img: t === hero ? (f.img || ph[t] || '') : (ph[t] || '') })), ok: [all.indexOf(hero)], fact: 1, hp: f.img || ph[hero] || '' });
  });
}
function validQ(q) {
  if (!((q.text || '').trim() || q.img)) return false;
  if (q.type === 'number') return q.num !== '' && q.num != null && isFinite(+q.num) && (!q.rng || (hasRng(q) && +q.num2 >= +q.num));
  const f = q.opts.filter(optFilled).length;
  if (f < 2) return false;
  if (q.type === 'photo' && !q.img) return false;
  if (isCh(q)) return q.ok.some(i => optFilled(q.opts[i]));
  return true;
}
function qIssue(q) {
  if (!((q.text || '').trim() || q.img)) return 'Добавьте текст вопроса или фото';
  if (q.type === 'photo' && !q.img) return 'Добавьте фото — это фото-вопрос';
  if (q.type === 'number') return q.num === '' || q.num == null || !isFinite(+q.num) ? (q.rng ? 'Укажите диапазон: от и до' : 'Укажите правильное число') : q.rng && !hasRng(q) ? 'Укажите, до какого числа засчитывать' : q.rng && +q.num2 < +q.num ? '«До» должно быть больше, чем «от»' : '';
  if (q.opts.filter(optFilled).length < 2) return 'Нужно минимум два варианта ответа';
  if (isCh(q) && !q.ok.some(i => optFilled(q.opts[i]))) return 'Отметьте правильный ответ — нажмите на букву';
  return '';
}

/* ---------- хранение: браузер + аккаунт ---------- */
const STORE = {
  timer: null, synced: 'local',
  save() {
    CFG.updated = Date.now();
    ls('set', KEY_CFG, CFG);
    const k = wsKey();
    if (!k || !NET.ok || CFG.isDemo) return;
    clearTimeout(this.timer); this.synced = 'saving'; paintSync();
    this.timer = setTimeout(() => {
      const c = JSON.parse(JSON.stringify(CFG));
      Promise.all([ref(`ws/${k}/${WSQ}/${c.id}`).set(c), ref(`ws/${k}/${WSL}/${c.id}`).set({ title: c.title || GNAME, couple: c.couple || '', n: GAME === 'fact' ? c.facts.length : c.qs.length, updated: c.updated })])
        .then(() => { this.synced = 'ok'; paintSync(); }, () => { this.synced = 'err'; paintSync(); });
    }, 1000);
  },
  upImg(id) {
    const k = wsKey(); if (!k || !NET.ok || !id) return;
    const d = IMG.get(id); if (!d) return;
    const done = ls('get', 'pbq_up_' + k.slice(0, 8)) || {};
    if (done[id]) return;
    ref(`ws/${k}/img/${id}`).set(d).then(() => { done[id] = 1; ls('set', 'pbq_up_' + k.slice(0, 8), done); });
  },
  imgsOf(c) { const s = new Set(); if (c.photo) s.add(c.photo); (c.facts || []).forEach(f => { if (f.img) s.add(f.img); }); c.qs.forEach(q => { if (q.img) s.add(q.img); if (q.aimg) s.add(q.aimg); (q.opts || []).forEach(o => { if (o.img) s.add(o.img); }); }); return [...s]; },
  pushAll() { this.save(); this.imgsOf(CFG).forEach(id => this.upImg(id)); },
  list() { const k = wsKey(); if (!k || !NET.ok) return Promise.resolve([]); return ref(`ws/${k}/${WSL}`).once('value').then(s => { const v = s.val() || {}; return Object.keys(v).map(id => Object.assign({ id }, v[id])).sort((a, b) => (b.updated || 0) - (a.updated || 0)); }); },
  open(id) {
    const k = wsKey();
    return ref(`ws/${k}/${WSQ}/${id}`).once('value').then(s => {
      const c = normCfg(s.val()); c.id = id;
      const miss = this.imgsOf(c).filter(i => !IMG.get(i));
      return Promise.all(miss.map(i => ref(`ws/${k}/img/${i}`).once('value').then(x => { if (x.val()) IMG.put(x.val(), i); }))).then(() => c);
    });
  },
  remove(id) { const k = wsKey(); if (!k) return Promise.resolve(); return Promise.all([ref(`ws/${k}/${WSQ}/${id}`).remove(), ref(`ws/${k}/${WSL}/${id}`).remove()]); }
};
function paintSync() { const el = $('syncSt'); if (!el) return; el.textContent = { local: '', saving: 'Сохраняем…', ok: '✓ Сохранено в аккаунте', err: 'Не сохранилось — проверьте интернет' }[STORE.synced] || ''; }

/* ================= движок игры (у ведущего) ================= */
let G = null, botTimers = [];
const isLastQ = (g, i) => i === g.qs.length - 1;
const mult = (g, i) => (g.qs[i].x2 || (g.s.lastX2 && isLastQ(g, i) && g.qs.length > 2)) ? 2 : 1;
const qTime = (g, q) => (q.time || (q.type === 'number' ? Math.max(g.s.time, 30) : g.s.time)) * 1000;
function newGame() {
  const qs = (GAME === 'fact' ? factsToQs(CFG.facts, CFG.s.show) : CFG.qs).filter(validQ).map(q => JSON.parse(JSON.stringify(q)));
  endNet();
  G = { id: uid(12), net: NET.ok, ts: Date.now(), code: '', rkey: uid(20), title: CFG.title, couple: CFG.couple, accent: CFG.accent, photo: CFG.photo || '',
    wifi: CFG.wifi && CFG.wifi.ssid ? { ssid: CFG.wifi.ssid, pass: CFG.wifi.pass || '' } : null, mode: CFG.mode, s: Object.assign({}, CFG.s), qs,
    phase: 'lobby', qi: -1, ii: 0, t0: 0, t1: 0, players: {}, ans: {}, cpl: {}, prevRank: {}, banned: {}, final: false, ver: 0,
    demo: !unlocked(), cap: guestCap(), res: '', bots: !!CFG.bots && CFG.s.play !== 'teams' && !(GAME === 'fact' && CFG.s.show === 'stage') };
  if (GAME === 'fact') { G.s.every = 999; G.s.lastX2 = false; }
  if (G.demo) { let de = ls('get', 'pbq_demo_end'); if (!de || de < Date.now()) de = Date.now() + DEMO_MIN * 60000; ls('set', 'pbq_demo_end', de); G.demoEnd = de; }
  if (G.net) startNet();
  publish();
  if (G.bots) addBots();
}
function publish() { G.ver++; ls('set', KEY_LIVE, G); send({ type: 'state', g: G }); netPush(); render(); }
function clearBots() { botTimers.forEach(clearTimeout); botTimers = []; }
function addBots() {
  BOTS.forEach((n, i) => botTimers.push(setTimeout(() => {
    if (!G || G.phase !== 'lobby') return;
    const id = 'bot' + i;
    if (!G.players[id]) { G.players[id] = newPlayer(n, false, G.s.play === 'tables' ? 1 + (i % Math.min(4, G.s.tables)) : 0); G.players[id].bot = true; G.players[id].skill = .45 + Math.random() * .4; publish(); }
  }, 500 + i * 420 + Math.random() * 300)));
}
function newPlayer(name, net, table) { return { name, score: 0, streak: 0, best: 0, bot: false, net: !!net, gain: 0, ok: 0, times: [], table: table || 0, jt: Date.now() }; }
const netCount = () => Object.values(G.players).filter(p => p.net).length;
function cleanName(n) { return String(n || '').replace(/\s+/g, ' ').trim().slice(0, 24); }
function join(pid, name, net, table) {
  if (!G || G.banned[pid]) return;
  name = cleanName(name) || 'Гость';
  table = G.s.play === 'tables' ? clamp(+table || 0, 0, G.s.tables) : 0;
  const p = G.players[pid];
  if (p) { if (p.name === name && p.table === table) return; p.name = name; p.table = table; }
  else {
    if (net && netCount() >= (G.cap || DEMO_MAX)) { if (NET.ok) gref(G.id, 'sc/' + pid).set({ full: true, demo: !!G.demo }); if (!G.capHit) { G.capHit = 1; publish(); } return; }
    G.players[pid] = newPlayer(name, net, table);
  }
  publish();
}
function kick(pid) {
  if (!G || !G.players[pid]) return;
  delete G.players[pid]; G.banned[pid] = 1;
  Object.keys(G.ans).forEach(k => { if (G.ans[k]) delete G.ans[k][pid]; });
  if (G.net && NET.ok && !/^bot|^me$/.test(pid)) gref(G.id, 'sc/' + pid).set({ kicked: true });
  publish();
}
function answer(pid, qi, a, ts) {
  if (!G || G.phase !== 'question' || qi !== G.qi || !G.players[pid]) return;
  const q = G.qs[qi];
  let rec;
  if (q.type === 'number') { const v = +String(a.v).replace(',', '.'); if (!isFinite(v)) return; rec = { v }; }
  else { const o = +a.o; if (!(o >= 0 && o < q.opts.length) || !optFilled(q.opts[o])) return; rec = { o }; }
  const A = G.ans[qi] || (G.ans[qi] = {});
  if (A[pid] && !G.s.change) return;
  if (A[pid] && A[pid].o === rec.o && A[pid].v === rec.v) return;
  const at = ts || now();
  if (at > G.t1 + 150) return;
  rec.t = Math.max(0, at - G.t0);
  A[pid] = rec;
  publish(); maybeAutoReveal();
}
function coupleAnswer(role, qi, o) {
  if (!G || G.qi !== qi || (G.phase !== 'question' && role !== 'host')) return;
  const q = G.qs[qi]; if (q.type !== 'couple' || !(o >= 0 && o < q.opts.length)) return;
  const c = G.cpl[qi] || (G.cpl[qi] = {});
  if (c[role] === o) return;
  c[role] = o;
  if (G.phase === 'reveal' && role === 'host') { rescoreCouple(); return; }
  publish(); maybeAutoReveal();
}
function startQuestion(i) {
  clearBots();
  G.phase = 'question'; G.qi = i;
  const q = G.qs[i], dur = qTime(G, q);
  G.t0 = now() + 1500; G.t1 = G.t0 + dur;
  if (isStage(G)) { G.t0 = now(); G.t1 = G.t0 + 864e5; }
  G.ans[i] = {};
  Object.keys(G.players).forEach(id => { const p = G.players[id]; p.gain = 0; });
  if (G.bots) {
    const filled = q.opts.map((o, k) => optFilled(o) ? k : -1).filter(k => k >= 0);
    Object.keys(G.players).forEach(id => {
      const p = G.players[id]; if (!p.bot) return;
      const right = Math.random() < p.skill;
      const at = 1500 + 1000 + Math.random() * dur * (right ? .55 : .8);
      let a;
      if (q.type === 'number') a = { v: Math.round((hasRng(q) ? (+q.num + +q.num2) / 2 : +q.num) * (1 + (Math.random() - .5) * (right ? .3 : 1.2))) };
      else if (q.type === 'couple') a = { o: filled[Math.floor(Math.random() * filled.length)] };
      else { const wrong = filled.filter(k => q.ok.indexOf(k) < 0); a = { o: right || !wrong.length ? q.ok[Math.floor(Math.random() * q.ok.length)] : wrong[Math.floor(Math.random() * wrong.length)] }; }
      botTimers.push(setTimeout(() => { if (G && G.phase === 'question' && G.qi === i) answer(id, i, a); }, at));
    });
    if (q.type === 'couple' && !hasCoupleDevices()) {
      botTimers.push(setTimeout(() => { if (G && G.qi === i) coupleAnswer('groom', i, filled[Math.floor(Math.random() * filled.length)]); }, 3000 + Math.random() * 3000));
      botTimers.push(setTimeout(() => { if (G && G.qi === i) coupleAnswer('bride', i, filled[Math.floor(Math.random() * filled.length)]); }, 3500 + Math.random() * 3000));
    }
  }
  publish();
}
function okSet(g, i) {
  const q = g.qs[i];
  if (isCh(q)) return q.ok.slice();
  if (q.type === 'couple') { const c = g.cpl[i] || {}; const a = [c.groom, c.bride].filter(x => x != null); if (!a.length && c.host != null) a.push(c.host); return [...new Set(a)]; }
  return [];
}
function scoreQuestion() {
  const i = G.qi, q = G.qs[i], A = G.ans[i] || {}, dur = G.t1 - G.t0, m = mult(G, i);
  if (q.type === 'number') {
    const lo = +q.num, hi = hasRng(q) ? +q.num2 : lo, tol = Math.max(Math.abs((lo + hi) / 2) * .5, hi - lo, 1);
    let best = Infinity; Object.values(A).forEach(x => { best = Math.min(best, numErr(q, x.v)); });
    Object.keys(G.players).forEach(id => {
      const p = G.players[id], x = A[id]; p.gain = 0; p.lv = x ? x.v : null;
      if (!x) { p.last = 'none'; p.streak = 0; return; }
      const err = numErr(q, x.v);
      let g = Math.round(1000 * Math.max(0, 1 - err / tol));
      if (err === best && g > 0) g += 200;
      g = Math.round(g * m);
      p.last = g > 0 ? 'ok' : 'bad';
      if (err <= tol * .2) { p.streak++; p.best = Math.max(p.best, p.streak); p.ok++; } else p.streak = 0;
      p.gain = g; p.score += g;
    });
    return;
  }
  const ok = okSet(G, i);
  Object.keys(G.players).forEach(id => {
    const p = G.players[id], x = A[id]; p.gain = 0; p.lv = x ? x.o : null;
    p.last = x ? (ok.indexOf(x.o) >= 0 ? 'ok' : 'bad') : 'none';
    if (q.type === 'couple' && !ok.length) p.last = x ? 'nocpl' : 'none';
    if (p.last === 'ok') {
      let g = G.s.speed ? 500 + Math.round(500 * Math.max(0, 1 - x.t / dur)) : 1000;
      p.streak++; if (p.streak >= 3) g += 100 * Math.min(p.streak - 2, 3);
      g = Math.round(g * m);
      p.best = Math.max(p.best, p.streak); p.ok++; p.times.push(x.t);
      p.gain = g; p.score += g;
    } else if (p.last !== 'nocpl') p.streak = 0;
  });
}
function reveal() {
  if (G.phase !== 'question') return;
  clearBots();
  G.prevRank = rankMap();
  G.snap = JSON.parse(JSON.stringify(G.players));
  scoreQuestion();
  G.phase = 'reveal';
  publish();
}
function rescoreCouple() {
  if (!G.snap) return;
  const snap = JSON.parse(JSON.stringify(G.snap));
  Object.keys(G.players).forEach(id => { if (snap[id]) Object.assign(G.players[id], snap[id]); });
  scoreQuestion(); publish();
}
function entities(g) {
  if (g.s.play === 'teams') return Object.keys(g.players).map(id => ({ id, name: g.players[id].name, jt: g.players[id].jt || 0 })).sort((a, b) => a.jt - b.jt).map(e => ({ pid: e.id, name: e.name, members: [] }));
  if (g.s.play === 'tables') { const t = {}; Object.keys(g.players).forEach(id => { const p = g.players[id]; if (!p.table) return; (t[p.table] = t[p.table] || []).push(p.name); }); return Object.keys(t).map(Number).sort((a, b) => a - b).map(n => ({ table: n, name: 'Стол ' + n, members: t[n] })); }
  return [];
}
function next() {
  if (!G) return;
  if (G.phase === 'lobby') { if (Object.keys(G.players).length || isStage(G)) startQuestion(0); return; }
  if (G.phase === 'intro') { if (G.ii < entities(G).length - 1) { G.ii++; publish(); } else startQuestion(0); return; }
  if (G.phase === 'question') { reveal(); return; }
  if (G.phase === 'reveal') {
    if (isLastQ(G, G.qi) && isStage(G)) { G.phase = 'final'; G.final = true; G.fts = now(); publish(); return; }
    if (isLastQ(G, G.qi)) { G.phase = 'board'; G.final = true; publish(); return; }
    if ((G.qi + 1) % G.s.every === 0) { G.phase = 'board'; publish(); return; }
    startQuestion(G.qi + 1); return;
  }
  if (G.phase === 'board') { if (G.final) { G.phase = 'final'; G.fts = now(); publish(); saveResults(); } else startQuestion(G.qi + 1); }
}
function startIntro() { if (!G || G.phase !== 'lobby' || !entities(G).length) return; G.phase = 'intro'; G.ii = 0; publish(); }
function maybeAutoReveal() {
  if (!G || G.phase !== 'question') return;
  const q = G.qs[G.qi], n = Object.keys(G.players).length, a = Object.keys(G.ans[G.qi] || {}).length;
  let cplWait = false;
  if (q.type === 'couple') { const c = G.cpl[G.qi] || {}, roles = coupleRoles(); cplWait = roles.length ? roles.some(r => c[r] == null) : (c.groom == null && c.bride == null && c.host == null && G.bots); }
  if (now() >= G.t1 + (G.net ? 2000 : 0) || (n > 0 && a >= n && !G.s.change && !cplWait)) reveal();
}
function rankMap(g) { const m = {}; ranked(g).forEach((p, i) => { m[p.id] = i + 1; }); return m; }
function ranked(g) { g = g || G; return Object.keys(g.players).map(id => Object.assign({ id }, g.players[id])).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)); }
function tableRank(g) {
  const t = {};
  Object.keys(g.players).forEach(id => { const p = g.players[id]; if (!p.table) return; const x = t[p.table] = t[p.table] || { table: p.table, name: 'Стол ' + p.table, sum: 0, n: 0 }; x.sum += p.score; x.n++; });
  return Object.values(t).map(x => Object.assign(x, { score: Math.round(x.sum / x.n) })).sort((a, b) => b.score - a.score || a.table - b.table);
}
function nextLabel(g) { const r = nextLabel0(g); return g && g.qs && g.qs[0] && g.qs[0].fact ? r.map(x => x.replace(/вопрос/g, 'факт')) : r; }
function nextLabel0(g) {
  if (!g) return ['Запустить', ''];
  const n = Object.keys(g.players).length, grp = g.s.play === 'teams' ? plural(n, 'команда', 'команды', 'команд') : plural(n, 'гость', 'гостя', 'гостей');
  if (isStage(g)) switch (g.phase) {
    case 'lobby': return ['Начать показ', g.qs.length + ' ' + plural(g.qs.length, 'факт', 'факта', 'фактов')];
    case 'question': return ['Показать, кто это', 'факт ' + (g.qi + 1) + ' из ' + g.qs.length];
    case 'reveal': return isLastQ(g, g.qi) ? ['Финал — все герои', 'последний факт'] : ['Следующий факт', (g.qi + 2) + ' из ' + g.qs.length];
    case 'final': return ['Показ окончен', ''];
  }
  switch (g.phase) {
    case 'lobby': return [n ? 'Начать игру' : 'Ждём гостей…', n + ' ' + grp + ' в игре'];
    case 'intro': { const E = entities(g); return g.ii < E.length - 1 ? ['Следующая ' + (g.s.play === 'teams' ? 'команда' : 'стол'), (g.ii + 2) + ' из ' + E.length] : ['Начать игру', 'все представлены']; }
    case 'question': return ['Показать ответ', 'сейчас идёт таймер'];
    case 'reveal': return isLastQ(g, g.qi) ? ['Итоговая таблица', 'последний вопрос'] : ((g.qi + 1) % g.s.every === 0 ? ['Таблица лидеров', 'после ' + (g.qi + 1) + '-го вопроса'] : ['Следующий вопрос', (g.qi + 2) + ' из ' + g.qs.length]);
    case 'board': return g.final ? ['Победители', 'финал · 3, 2, 1'] : ['Следующий вопрос', (g.qi + 2) + ' из ' + g.qs.length];
    case 'final': return ['Игра окончена', ''];
  }
  return ['Далее', ''];
}
function nominations(g) {
  const ps = ranked(g), out = [];
  const fast = ps.filter(p => p.times && p.times.length).map(p => [p, p.times.reduce((s, t) => s + t, 0) / p.times.length]).sort((a, b) => a[1] - b[1])[0];
  if (fast) out.push(['⚡', 'Самый быстрый', fast[0].name]);
  const st = ps.slice().sort((a, b) => b.best - a.best)[0];
  if (st && st.best >= 2) out.push(['🔥', 'Серия ' + st.best + ' подряд', st.name]);
  const sn = ps.slice().sort((a, b) => b.ok - a.ok)[0];
  if (sn && sn.ok) out.push(['🎯', 'Больше всего верных · ' + sn.ok, sn.name]);
  if (g.s.play === 'tables' && ps[0]) out.unshift(['👑', 'Лучший игрок', ps[0].name]);
  return out.slice(0, 4);
}
/* распределение ответов текущего вопроса */
function dist(g) {
  const q = g.qs[g.qi], A = (g.ans && g.ans[g.qi]) || {}, cnt = [0, 0, 0, 0]; let tot = 0;
  Object.keys(A).forEach(k => { const x = A[k]; if (x && x.o != null && x.o < 4) cnt[x.o]++; tot++; });
  return { cnt, tot, q };
}
/* Готовые шаблоны: ?tpl=teens — квиз «Агент 3:16» для TEENS PARTY */
function tplCfg(name) {
  if (name === 'feed') return tplFeed();
  if (name !== 'teens') return null;
  const C = (text, opts, ok, extra) => {
    const right = opts[ok], o = opts.slice();
    for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    return normQ(Object.assign({ type: 'choice', text, opts: o.map(O), ok: [o.indexOf(right)] }, extra || {}));
  };
  const A = (yt, t0, t1) => ({ qm: { k: 'audio', yt, t0, t1 } });
  const V = (yt, t0, t1) => ({ am: { k: 'video', yt, t0, t1 } });
  const qs = [
    // Раунд 1 · Досье агента
    C('🕶 Досье агента. Агент 007 — это…', ['Джеймс Бонд', 'Итан Хант', 'Джейсон Борн', 'Шерлок Холмс'], 0),
    C('🕶 Что такое «легенда» у разведчика?', ['Вымышленная биография', 'Секретный пароль', 'Тайник для записок', 'Позывной по рации'], 0),
    C('🕶 Шифр, где каждая буква сдвигается на одно и то же число позиций, называется…', ['Шифр Цезаря', 'Азбука Морзе', 'Энигма', 'QR-код'], 0),
    C('🕶 Как выглядит сигнал SOS азбукой Морзе?', ['· · · — — — · · ·', '— — — · · · — — —', '· — · — · —', '· · · · · · · · ·'], 0),
    normQ({ type: 'number', text: '🕶 В каком году вышел первый фильм «Миссия невыполнима» с Томом Крузом?', opts: [], ok: [], num: 1996, unit: 'год' }),
    // Раунд 2 · Тренды, мемы, эмодзи
    C('😎 Угадай фильм по эмодзи: 🦁 👑', ['Король Лев', 'Мадагаскар', 'Книга джунглей', 'Зверополис'], 0),
    C('😎 Угадай фильм по эмодзи: 🏠 🎈 👴', ['Вверх', 'Один дома', 'Душа', 'Тачки'], 0),
    C('😎 Угадай фильм по эмодзи: 🧙‍♂️ ⚡ 👓', ['Гарри Поттер', 'Властелин колец', 'Хроники Нарнии', 'Мерлин'], 0),
    C('😎 Угадай фильм по эмодзи: 🚢 🧊 💔', ['Титаник', 'Пираты Карибского моря', 'Моана', 'Холодное сердце'], 0),
    C('😎 Что значит «GOAT», когда так говорят о спортсмене?', ['Лучший всех времён', 'Упрямый как козёл', 'Новичок', 'Запасной игрок'], 0),
    C('😎 Слово «rizz» — это…', ['Обаяние, умение понравиться', 'Опоздание', 'Ошибка в игре', 'Новый танец'], 0),
    C('😎 Какое выражение Оксфордский словарь выбрал словом 2024 года?', ['Brain rot', 'Rizz', 'Slay', 'Skibidi'], 0),
    C('😎 Какой эмодзи в мире используют чаще всего?', ['😂', '❤️', '👍', '🔥'], 0),
    // Раунд 3 · Угадай мелодию
    C('🎧 Угадай мелодию: из какого фильма эта тема?', ['Миссия невыполнима', 'Джеймс Бонд', 'Розовая пантера', 'Шерлок Холмс'], 0, A('XAYhNHhxN0A', 0, 20)),
    C('🎧 Из какой игры эта музыка?', ['Minecraft', 'Roblox', 'Fortnite', 'Among Us'], 0, A('_3ngiSxVCBs', 0, 40)),
    C('🎧 Узнаёшь? Это мелодия из игры…', ['Тетрис', 'Super Mario', 'Pac-Man', 'Angry Birds'], 0, A('NmCCQxVBfyM', 0, 15)),
    C('🎧 Кто поёт эту песню?', ['HUNTR/X', 'Saja Boys', 'BLACKPINK', 'BTS'], 0, Object.assign(A('yebNIHKAC4A', 0, 25), V('yebNIHKAC4A', 25, 40))),
    C('🎧 Из какого мультфильма эта песня?', ['K-pop: Охотники на демонов', 'Энканто', 'Холодное сердце', 'Элементарно'], 0, A('983bBbJx0Mk', 0, 25)),
    C('🎧 О ком «мы не говорим» в этой песне?', ['О Бруно', 'О Мирабель', 'О Камило', 'О Луизе'], 0, Object.assign(A('bvWRMAU6V-c', 0, 25), V('bvWRMAU6V-c', 25, 40))),
    C('🎧 Кто исполняет эту песню?', ['Imagine Dragons', 'Coldplay', 'OneRepublic', 'Twenty One Pilots'], 0, A('7wtfhZwyrcc', 0, 25)),
    C('🎧 Как называется эта песня?', ['Way Maker', 'Goodness of God', 'Oceans', 'Build My Life'], 0, A('iJCV_2H9xD0', 0, 25)),
    C('🎧 Финал! Кто поёт эту песню в мультфильме?', ['Эльза', 'Анна', 'Моана', 'Рапунцель'], 0, A('L0MK7qz13bU', 0, 25))
  ];
  return { id: uid(10), title: 'Квиз агента 3:16', couple: 'TEENS PARTY', mode: 'corp',
    s: Object.assign({}, MODES.corp.s, { play: 'solo', tables: 10, lastX2: true, sound: true, every: 4 }), bots: false,
    accent: '#ff5a1f', photo: '', wifi: { ssid: '', pass: '' }, form: '', facts: [], qs, updated: Date.now() };
}

/* ?tpl=feed — квиз «Залипли?» про TikTok, Instagram и нас */
function tplFeed() {
  const C = (text, opts, ok, extra) => {
    const right = opts[ok], o = opts.slice();
    for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    return normQ(Object.assign({ type: 'choice', text, opts: o.map(O), ok: [o.indexOf(right)] }, extra || {}));
  };
  const A = (yt, t0, t1) => ({ qm: { k: 'audio', yt, t0, t1 } });
  const qs = [
    // Раунд 1 · Хиты Америки
    C('🇺🇸 Угадай мелодию: как называется эта песня?', ['Die With a Smile', 'APT.', 'Espresso', 'Flowers'], 0, A('kPa7bsKwL-c', 44, 66)),
    C('🇺🇸 Кто поёт эту песню вместе с Бруно Марсом?', ['ROSÉ', 'Lady Gaga', 'Dua Lipa', 'Ariana Grande'], 0, A('8Ebqe2Dbzls', 4, 26)),
    C('🇺🇸 Угадай мелодию: как называется эта песня?', ['Beautiful Things', 'Lose Control', 'Stick Season', 'Birds of a Feather'], 0, A('Oa_RSwwpPaA', 70, 92)),
    C('🇺🇸 Кто исполняет эту песню?', ['Billie Eilish', 'Olivia Rodrigo', 'Taylor Swift', 'Sabrina Carpenter'], 0, A('V9PVRfjEBTI', 39, 61)),
    C('🇺🇸 Из какого мультфильма эта песня?', ['Кей-поп-охотницы на демонов', 'Энканто', 'Моана 2', 'Головоломка 2'], 0, A('yebNIHKAC4A', 58, 80)),
    // Раунд 2 · Русские хиты из TikTok
    C('🇷🇺 Угадай мелодию: как называется эта песня?', ['Мокрые кроссы', 'Витаминка', 'Тает лёд', 'Малиновый закат'], 0, A('48Heq9b3UNU', 57, 79)),
    C('🇷🇺 Угадай мелодию: как называется эта песня?', ['Медуза', 'Девочка с каре', 'Пыяла', 'Хали-гали'], 0, A('kacHLh3fPpg', 43, 65)),
    C('🇷🇺 Кто исполняет эту песню?', ['RASA', 'MATRANG', 'Мукка', 'Грибы'], 0, A('zaw8qQP_WoY', 12, 34)),
    C('🇷🇺 Угадай мелодию: как называется эта песня?', ['Цвет настроения синий', 'Седая ночь', 'Хали-гали', 'Малиновый закат'], 0, A('i1OQf2FEyKs', 0, 22)),
    C('🇷🇺 Кто исполняет эту песню?', ['SLAVA MARLOW', 'MORGENSHTERN', 'Тима Белорусских', 'Макс Корж'], 0, A('Sh6XaC1lJ4E', 28, 50)),
    // Раунд 3 · Христианские песни
    C('🙏 Угадай мелодию: как называется эта песня?', ['Goodness of God', 'Build My Life', 'What a Beautiful Name', '10,000 Reasons'], 0, A('9sE5kEnitqE', 47, 69)),
    C('🙏 Угадай мелодию: как называется эта песня?', ['Way Maker', 'Graves Into Gardens', 'Firm Foundation', 'Reckless Love'], 0, A('iJCV_2H9xD0', 93, 115)),
    C('🙏 Кто исполняет эту песню?', ['Brandon Lake', 'Chris Tomlin', 'Phil Wickham', 'Elevation Worship'], 0, A('dQdfs5S6jyA', 53, 75)),
    C('🙏 Угадай мелодию: как называется эта песня?', ['Oceans (Where Feet May Fail)', 'Living Hope', 'King of Kings', 'Great Are You Lord'], 0, A('dy9nwe9_xzw', 218, 240)),
    C('🙏 Кто исполняет эту песню?', ['Chris Tomlin', 'Hillsong UNITED', 'Leeland', 'CeCe Winans'], 0, A('IkHgxKemCRk', 39, 61)),
    // Раунд 4 · Мемы и тренды
    C('😎 FYP в TikTok — это…', ['For You Page — лента рекомендаций', 'Follow Your Profile', 'Find Your Photo', 'Fast Video Post'], 0),
    C('😎 Как называют мем про собаку в свитере, которой «вообще всё равно»?', ['Chill guy', 'Sigma', 'Doge', 'NPC'], 0),
    C('😎 Как зовут карликового бегемотика из тайского зоопарка — звезду 2024 года?', ['Му Денг', 'Песто', 'Фиона', 'Гриммас'], 0),
    C('😎 Italian brainrot: как зовут акулу в кроссовках?', ['Tralalero Tralala', 'Bombardiro Crocodilo', 'Tung Tung Tung Sahur', 'Ballerina Cappuccina'], 0),
    C('😎 Какое число школьники в 2025 году выкрикивали с жестом «весы» руками?', ['67', '42', '69', '52'], 0),
    // Раунд 5 · TikTok и Instagram
    C('📱 В каком году появился Instagram?', ['2010', '2012', '2014', '2008'], 0),
    C('📱 Кто купил Instagram в 2012 году и за сколько?', ['Facebook — за 1 млрд долларов', 'Google — за 5 млрд', 'Apple — за 500 млн', 'Twitter — за 2 млрд'], 0),
    C('📱 С каким приложением TikTok объединился в 2018 году?', ['Musical.ly', 'Vine', 'Snapchat', 'Dubsmash'], 0),
    C('📱 Как называется китайская версия TikTok?', ['Douyin', 'WeChat', 'Kuaishou', 'Weibo'], 0),
    // Раунд 6 · Библия
    C('📖 «Не сообразуйтесь с веком сим, но преобразуйтесь обновлением ума вашего» — из какой книги?', ['Послание к Римлянам', 'Притчи', 'Евангелие от Иоанна', 'Псалтирь'], 0),
    C('📖 «Светильник для тела есть …» — закончи слова Иисуса', ['Око', 'Сердце', 'Слово', 'Вера'], 0),
    C('📖 Кто увидел с крыши то, чего не стоило видеть, — и согрешил?', ['Давид', 'Самсон', 'Соломон', 'Саул'], 0),
    C('📖 Кто залез на смоковницу, чтобы увидеть Иисуса?', ['Закхей', 'Никодим', 'Варфоломей', 'Лазарь'], 0),
    C('📖 Сколько камней взял Давид, выходя против Голиафа?', ['5', '1', '3', '7'], 0),
    C('📖 Финал! Какой стих в Библии самый короткий?', ['«Иисус прослезился»', '«Бог есть любовь»', '«Всегда радуйтесь»', '«Непрестанно молитесь»'], 0)
  ];
  return { id: uid(10), title: 'Залипли?', couple: 'TikTok, Instagram и мы', mode: 'corp',
    s: Object.assign({}, MODES.corp.s, { play: 'solo', tables: 10, lastX2: true, sound: true, every: 5 }), bots: false,
    accent: '#fe2c55', photo: '', wifi: { ssid: '', pass: '' }, form: '', facts: [], qs, updated: Date.now() };
}
