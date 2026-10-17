
/* ================= звук на экране ================= */
function soundOverlay(onOk) {
  const d = document.createElement('div'); d.className = 'sndov';
  d.innerHTML = '<div>🔊 Нажмите, чтобы включить звук<small>и открыть экран на весь экран</small></div>';
  d.onclick = () => { SND.unlock(); d.remove(); const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); if (onOk) onOk(); };
  document.body.appendChild(d);
}
function screenShell() {
  document.body.classList.add('solo-screen', 'no-cursor'); { let it = 0; const wake = () => { document.body.classList.remove('idle'); clearTimeout(it); it = setTimeout(() => document.body.classList.add('idle'), 3000); }; ['mousemove', 'mousedown', 'keydown'].forEach(ev => document.addEventListener(ev, wake, { passive: true })); wake(); } document.title = 'Экран · ' + GNAME;
  $('app').innerHTML = '<div class="stage full" id="stg"></div><button class="btn ghost sm fsbtn" id="fs">⛶ На весь экран</button>';
  $('fs').onclick = () => { SND.unlock(); const d = document.documentElement; (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d); };
  soundOverlay();
  return $('stg');
}

/* ---------- экран на этом же устройстве (без интернета) ---------- */
function viewScreenLocal() {
  const box = screenShell();
  let LIVE = ls('get', KEY_LIVE);
  const draw = () => { if (LIVE) applyAccent(LIVE.accent); renderScreen(box, LIVE, true); };
  onMsg(m => { if (m.type === 'state') { LIVE = m.g; draw(); } if (m.type === 'reset') { LIVE = null; draw(); } });
  setInterval(() => { send({ type: 'scr-alive' }); if (LIVE) updScreen(box, LIVE, true); }, 250);
  IMG.ready.then(draw);
  send({ type: 'hello' });
}

/* ---------- экран на другом устройстве ---------- */
function viewScreenNet() {
  const box = screenShell();
  let LIVE = null, gone = false;
  renderScreen(box, null);
  netReady.then(ok => {
    if (!ok) { box.innerHTML = '<div class="sv center"><h1>Нет связи</h1><p class="muted" style="font-size:1.3em">Проверьте интернет и обновите страницу</p></div>'; return; }
    gref(GID, 'meta').once('value').then(x => { if (!x.exists()) { gone = true; box.innerHTML = '<div class="sv center"><h1>Игра не найдена</h1><p class="muted" style="font-size:1.3em">Откройте экран заново с пульта ведущего</p></div>'; } });
    const redraw = () => { box._st = {}; renderScreen(box, LIVE, true); };
    gref(GID, 'scr').on('value', x => {
      LIVE = fixScr(x.val());
      if (!LIVE) { if (!gone) { box._st = {}; box.innerHTML = '<div class="sv center"><div class="kk">' + GNAME + '</div><h1>Игра завершена</h1></div>'; } return; }
      applyAccent(LIVE.accent);
      const ids = new Set(); if (LIVE.photo) ids.add(LIVE.photo); LIVE.qs.forEach(q => { if (q.img) ids.add(q.img); if (q.hp) ids.add(q.hp); if (q.aimg) ids.add(q.aimg); q.opts.forEach(o => { if (o.img) ids.add(o.img); }); });
      ids.forEach(id => IMG.fetchNet('g/' + GID + '/img/' + id + '/s', id, redraw));
      renderScreen(box, LIVE, true);
    });
    setInterval(() => { if (LIVE) updScreen(box, LIVE, true); }, 250);
  });
}

/* ---------- телефон гостя и телефоны пары ---------- */
function viewPlayLocal() {
  document.body.classList.add('solo-play', 'no-cursor');
  $('app').innerHTML = '<div id="ph"></div>';
  const box = $('ph');
  let LIVE = ls('get', KEY_LIVE);
  let pid = null; try { pid = sessionStorage.getItem('pbq_pid'); if (!pid) { pid = 'p' + uid(); sessionStorage.setItem('pbq_pid', pid); } } catch (e) { pid = 'p' + uid(); }
  const cl = { pid, role: '', picked: {}, pending: {}, net: false, table: 0, cur: () => LIVE,
    join: (name, table) => send({ type: 'join', pid, name, table }), answer(qi, a) { this.picked[qi] = a.o != null ? a.o : a.v; send({ type: 'answer', pid, qi, a }); } };
  const draw = () => { if (LIVE) applyAccent(LIVE.accent); renderPhone(box, LIVE, cl); };
  PHMSG = 'Чтобы войти в игру, отсканируйте QR-код на экране';
  onMsg(m => { if (m.type === 'state') { LIVE = m.g; draw(); } if (m.type === 'reset') { LIVE = null; draw(); } });
  setInterval(() => { if (LIVE) updPhone(box, LIVE, cl); }, 250);
  IMG.ready.then(draw); send({ type: 'hello' });
}
function viewPlayNet() {
  document.body.classList.add('solo-play', 'no-cursor'); document.title = GNAME;
  $('app').innerHTML = '<div id="ph"></div>';
  const box = $('ph'), roleP = P.get('role'), rkey = (P.get('k') || '').replace(/[^a-z0-9]/gi, '');
  const cl = { pid: '', role: roleP === 'groom' || roleP === 'bride' ? roleP : '', picked: {}, pending: {}, net: true, table: 0, joining: false };
  let C = null, Q = null, SC = null, J = null, MYA = null, gone = false;
  const draw = () => renderPhone(box, cl.cur ? cl.cur() : null, cl);
  PHMSG = ''; renderPhone(box, null, cl);
  netReady.then(ok => {
    if (!ok) { PHMSG = 'Не получилось подключиться. Проверьте интернет и обновите страницу.'; draw(); return; }
    const me = cl.pid = NET.uid;
    NET.subs.push(() => { box.dataset.k = ''; draw(); });
    if (!GID) {
      cl.codeEntry = true; cl.cur = () => null;
      cl.enterCode = (code, err) => {
        if (code.length !== 6) { if (err) err.textContent = 'Код состоит из 6 цифр'; return; }
        ref('codes/' + code).once('value').then(s => { const v = s.val(); if (!v || !v.g) { if (err) err.textContent = 'Игра с таким кодом не найдена'; return; } location.replace(v.k === 'bingo' ? '../bingo/?view=play&g=' + v.g : BASE + '?view=play&g=' + v.g); })
          .catch(() => { if (err) err.textContent = 'Нет связи, попробуйте ещё раз'; });
      };
      draw(); const pc = (P.get('c') || '').replace(/\D/g, ''); if (pc.length === 6) cl.enterCode(pc, null); else setTimeout(() => { const i = $('pCode'); if (i) i.focus(); }, 300);
      return;
    }
    gref(GID, 'meta').once('value').then(x => { if (!x.exists()) { gone = true; PHMSG = 'Игра не найдена или уже завершена.<br>Отсканируйте QR-код на экране ещё раз или введите код игры.'; box.dataset.k = ''; draw(); } });
    if (cl.role) {
      ref('rem/' + GID + '/' + me).set({ k: rkey, role: cl.role }).catch(() => { cl.bad = true; box.dataset.k = ''; draw(); });
      cl.answer = function (qi, a) { this.picked[qi] = a.o; this.pending[qi] = true; ref('rc/' + GID).push({ a: 'cpl', qi, o: a.o, u: me, t: TS() }).then(() => { this.pending[qi] = false; updPhone(box, cl.cur(), cl); }, () => { cl.bad = true; box.dataset.k = ''; draw(); }); };
    } else {
      const on = gref(GID, 'on/' + me);
      const presence = () => { if (NET.connected && J) { on.onDisconnect().remove(); on.set(true); } };
      NET.subs.push(presence);
      cl.join = (name, table) => { cl.joining = true; draw(); gref(GID, 'join/' + me).set({ name, table: table || 0, t: TS() }).then(() => { cl.joining = false; presence(); }, () => { cl.joining = false; box.dataset.k = ''; draw(); }); };
      cl.answer = function (qi, a) {
        this.picked[qi] = a.o != null ? a.o : a.v; this.pending[qi] = true;
        gref(GID, 'ans/' + me + '/' + qi).set(Object.assign({}, a, { t: TS(), c: now() })).then(() => { this.pending[qi] = false; const g = cl.cur(); if (g) updPhone(box, g, cl); }, () => { this.pending[qi] = false; });
      };
      cl._presence = presence;
    }
    cl.cur = () => {
      if (!C || !Q || gone) return null;
      const qs = Q.map((q, i) => { q = q || {}; return { type: q.type || 'choice', text: q.text || '', img: q.img || '', opts: (q.opts || []).map(o => ({ t: (o && o.t) || '', img: (o && o.img) || '' })), unit: q.unit || '', x2: !!q.x2, blur: !!q.blur, mk: q.mk || '',
        ok: i === C.qi && C.ok && C.ok.set ? C.ok.set : [], num: i === C.qi && C.ok && C.ok.num != null ? C.ok.num : null }; });
      const g = { id: C.id, phase: C.phase, qi: C.qi, ii: C.ii, t0: C.t0, t1: C.t1, s: C.s || {}, title: C.title, couple: C.couple, final: C.final, res: C.res, players: {}, ans: {}, cpl: {}, qs, ok: C.ok, _intro: C.intro };
      const cur = SC && SC.qi === C.qi;
      g._np = C.n || (SC && SC.n) || 0; g._rank = SC && SC.rank; g._trank = SC && SC.trank; g._tn = SC && SC.tn;
      g._ok = C.ok && C.ok.set ? C.ok.set : []; g._num = C.ok && C.ok.num != null ? C.ok.num : null; g._num2 = C.ok && C.ok.num2 != null ? C.ok.num2 : null;
      if (J) g.players[me] = { name: J.name, table: J.table || 0, score: SC ? SC.score || 0 : 0, gain: cur ? SC.gain : 0, last: C.phase === 'reveal' ? (cur ? SC.last : 'wait') : (SC ? SC.last : 'none'), streak: SC ? SC.streak : 0, ok: SC ? SC.ok : 0, lv: cur ? SC.lv : null, times: [] };
      if (MYA && C.qi >= 0 && MYA[C.qi] != null) { g.ans[C.qi] = {}; g.ans[C.qi][me] = MYA[C.qi]; }
      return g;
    };
    const imgs = () => { if (!Q) return; Q.forEach(q => { if (!q) return; [q.img].concat((q.opts || []).map(o => o && o.img)).forEach(id => { if (id) IMG.fetchNet('g/' + GID + '/img/' + id + '/p', id, () => { box.dataset.k = ''; draw(); }); }); }); };
    const on = (path, f) => gref(GID, path).on('value', x => { f(x.val()); draw(); });
    on('core', v => { C = v; if (v) applyAccent(v.accent); if (!v && Q) { gone = true; PHMSG = 'Игра завершена. Спасибо, что играли!'; } });
    on('q', v => { Q = v; imgs(); });
    if (!cl.role) {
      on('sc/' + me, v => { SC = v; cl.kicked = !!(v && v.kicked); cl.full = !!(v && v.full); if (cl.kicked) { gref(GID, 'on/' + me).remove(); } });
      on('join/' + me, v => { J = v; if (v) { cl.table = v.table || 0; if (cl._presence) cl._presence(); } });
      on('ans/' + me, v => { MYA = v; if (v) Object.keys(v).forEach(k => { const x = v[k]; if (x && cl.picked[k] == null) cl.picked[k] = x.o != null ? x.o : x.v; }); });
    }
    setInterval(() => { const g = cl.cur(); if (g) updPhone(box, g, cl); }, 250);
  });
}

/* ---------- пульт ведущего на телефоне ---------- */
function viewRemote() {
  document.title = 'Пульт · ' + GNAME;
  const rkey = (P.get('k') || '').replace(/[^a-z0-9]/gi, '');
  $('app').innerHTML = '<div class="rm" id="rm"><div class="cur"><div class="k">Пульт ведущего</div><div class="q">Подключаемся…</div></div></div>';
  let RV = null, sure = '';
  netReady.then(ok => {
    if (!ok) { $('rm').innerHTML = '<div class="cur"><div class="q">Нет связи. Проверьте интернет и обновите страницу.</div></div>'; return; }
    const me = NET.uid;
    const cmd = (a, extra) => { if (navigator.vibrate) navigator.vibrate(15); return ref('rc/' + GID).push(Object.assign({ a, u: me, t: TS() }, extra || {})); };
    ref('rem/' + GID + '/' + me).set({ k: rkey, role: 'remote' }).then(() => {
      ref('rv/' + GID).on('value', x => { RV = x.val(); draw(); }, () => { $('rm').innerHTML = '<div class="cur"><div class="q">Нет доступа к игре. Отсканируйте QR «Пульт» на ноутбуке ещё раз.</div></div>'; });
    }, () => { $('rm').innerHTML = '<div class="cur"><div class="q">Ссылка на пульт устарела. Отсканируйте QR «Пульт» на ноутбуке ещё раз.</div></div>'; });
    function draw() {
      const v = RV;
      if (!v) { $('rm').innerHTML = '<div class="cur"><div class="k">Пульт ведущего</div><div class="q">Ждём ноутбук ведущего… Держите пульт открытым на ноутбуке.</div></div>'; return; }
      const q = v.q, ph = { lobby: 'Лобби', intro: 'Знакомство', question: 'Идёт вопрос', reveal: 'Ответ', board: 'Таблица', final: 'Финал' }[v.phase] || '';
      const okTxt = q ? (q.type === 'number' ? `✓ ${numTxt(q.num, q.rng ? q.num2 : null)} ${q.unit || ''}` : q.type === 'couple' ? '💍 правильный ответ даст пара' : '✓ ' + (q.ok || []).map(i => L[i] + ' — ' + (q.opts[i] || '')).join(', ')) : '';
      const c = v.cpl || {};
      let h = `<div class="hd"><b>${esc(v.title)}</b>${v.code ? `<span class="tag">${fmtCode(v.code)}</span>` : ''}</div>` +
        `<div class="netline"><i class="${!NET.connected ? 'off' : v.rtt > 600 ? 'slow' : ''}"></i>${NET.connected ? 'На связи' : 'Нет связи'} · онлайн ${v.online} из ${v.n}${v.rtt ? ' · ноутбук ' + v.rtt + ' мс' : ''}</div>`;
      h += `<div class="cur"><div class="k">${ph}${v.qi >= 0 && v.phase !== 'lobby' ? ` · вопрос ${v.qi + 1} из ${v.nq}` : ''}</div>`;
      if (v.phase === 'intro' && v.intro) h += `<div class="q">${esc(v.intro.name)}</div><div class="muted" style="font-size:13px">${v.intro.i + 1} из ${v.intro.of}</div>`;
      else if (q && v.phase !== 'lobby' && v.phase !== 'final') h += `<div class="q">${esc(q.text)}</div><div class="a">${esc(okTxt)}</div>` + (v.phase === 'question' || v.phase === 'reveal' ? `<div class="muted" style="font-size:13px;margin-top:6px">Ответили ${v.answered} из ${v.n}</div>` : '');
      else if (v.phase === 'lobby') h += `<div class="q">Гости заходят: ${v.n}</div>`;
      else if (v.phase === 'final') h += `<div class="q">Победители на экране 🎉</div>${v.res ? `<a class="btn ghost sm" style="margin-top:8px" href="${esc(resLink(v.res))}" target="_blank">Итоги для пары</a>` : ''}`;
      if (q && q.type === 'couple' && (v.phase === 'question' || v.phase === 'reveal')) {
        h += `<div class="muted" style="font-size:12px;margin-top:8px">Жених: ${c.groom != null ? L[c.groom] : '—'} · Невеста: ${c.bride != null ? L[c.bride] : '—'}${!v.roles.length ? ' · телефоны пары не подключены — отметьте ответ сами:' : ''}</div><div class="cpl">${q.opts.map((o, i) => o ? `<button data-cpl="${i}" class="${c.host === i ? 'on' : ''}">${L[i]} · ${esc(o)}</button>` : '').join('')}</div>`;
      }
      h += '</div>';
      if (v.demo) h += `<div class="demo">Демо-режим: до ${DEMO_MAX} телефонов гостей</div>`;
      const acts = [];
      if (v.canIntro) acts.push(`<button class="btn ghost sm" data-a="intro">🎤 Представить ${v.play === 'teams' ? 'команды' : 'столы'}</button>`);
      if (v.phase === 'question' || v.phase === 'reveal') acts.push('<button class="btn ghost sm" data-a="replay">🔁 Звук/видео ещё раз</button>');
      if (v.phase === 'question') acts.push('<button class="btn ghost sm" data-a="skip">⏭ Закончить таймер</button>');
      if (acts.length) h += `<div class="links">${acts.join('')}</div>`;
      h += `<div class="plist">${v.players.length ? v.players.map((p, i) => `<div class="p"><span class="muted" style="width:20px">${i + 1}</span><span class="dot ${p.a && v.phase === 'question' ? 'on' : !p.on ? 'off' : ''}"></span><b>${esc(p.name)}${p.t ? ` <small>стол ${p.t}</small>` : ''}</b><span>${nums(p.score)}</span><button class="kick${sure === p.id ? ' sure' : ''}" data-k="${esc(p.id)}">${sure === p.id ? 'Убрать?' : '✕'}</button></div>`).join('') : '<div class="p muted">Пока никого</div>'}</div>`;
      const nl = v.next || ['Далее', ''];
      h += `<div class="nextfix"><button class="btn gold" id="rNext"${v.phase === 'final' ? ' disabled' : ''}>${esc(nl[0])}${nl[1] ? `<small>${esc(nl[1])}</small>` : ''}</button></div>`;
      $('rm').innerHTML = h;
      $('rNext').onclick = () => cmd('next');
      [...document.querySelectorAll('[data-a]')].forEach(b => b.onclick = () => cmd(b.dataset.a));
      [...document.querySelectorAll('[data-cpl]')].forEach(b => b.onclick = () => cmd('cplset', { o: +b.dataset.cpl }));
      [...document.querySelectorAll('[data-k]')].forEach(b => b.onclick = () => { if (sure === b.dataset.k) { cmd('kick', { p: b.dataset.k }); sure = ''; } else { sure = b.dataset.k; setTimeout(() => { if (sure === b.dataset.k) { sure = ''; draw(); } }, 3000); } draw(); });
    }
    NET.subs.push(() => draw());
  });
}
