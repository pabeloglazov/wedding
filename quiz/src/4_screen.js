
/* ================= экран проектора ================= */
const ringSvg = '<div class="ring" id="ring"><svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="15.5"/><circle class="fg" cx="18" cy="18" r="15.5" stroke-dasharray="97.4" stroke-dashoffset="0"/></svg><b id="ringT"></b></div>';
function scrKey(g) {
  if (!g) return 'none';
  if (g.phase === 'question' || g.phase === 'reveal') return g.id + ':q:' + g.qi;
  if (g.phase === 'intro') return g.id + ':i:' + g.ii;
  if (g.phase === 'board') return g.id + ':b:' + g.qi + (g.final ? 'f' : '');
  return g.id + ':' + g.phase;
}
function isPicQ(q) { return !!(q && q.fact && q.opts.some(o => o.img && IMG.get(o.img))); }
function faceHtml(id, name, cls) { const d = IMG.get(id); return `<span class="${cls || 'face'}${d ? '' : ' none'}" style="${d ? `background-image:url(${d})` : ''}">${d ? '' : esc(initial(name))}</span>`; }
function factTiles(q) {
  return `<div class="tiles ft n${q.opts.filter(optFilled).length}" id="tiles">` + q.opts.map((o, i) => !optFilled(o) ? '' :
    `<div class="tile ${CL[i]}" data-i="${i}"><div class="fill" data-f="${i}"></div>${faceHtml(o.img, o.t)}<span class="t">${esc(o.t)}</span><span class="cnt" data-c="${i}"></span></div>`).join('') + '</div>';
}
function heroCard() { return `<div class="hero" id="hero"><div class="hcard"><div class="hback"><span>?</span><em>Кто это?</em></div><div class="hfront"><div class="hph" id="hph"></div><div class="hnm"><small>Это</small><b id="hnm"></b></div></div></div></div>`; }
function renderScreen(box, g, snd) {
  if (!box) return;
  const key = scrKey(g), st = box._st || (box._st = {});
  if (key !== st.key || !box.firstChild) {
    const prevPhase = st.phase;
    st.key = key; st.phase = g && g.phase; st.tick = -1; st.up = false; st.rev = false; st.nPlayers = g ? Object.keys(g.players).length : 0; st.code = '';
    buildScreen(box, g);
    if (g && (g.phase === 'question' || g.phase === 'reveal')) { const q = g.qs[g.qi], mw = box.querySelector('#mdw'); if (mw) { const ans = g.phase === 'reveal' && mdOk(q.am); if (ans || mdOk(q.qm)) { mw.dataset.s = ans ? 'a' : 'q'; mountMedia(mw, ans ? q.am : q.qm, !!snd); } } }
    if (snd && g) {
      if (g.phase === 'question') setTimeout(() => SND.play('start'), Math.max(0, g.t0 - now() - 400));
      else if (g.phase === 'reveal') { st.rev = true; SND.play('reveal'); }
      else if (g.phase === 'board') SND.play('board');
      else if (g.phase === 'intro') SND.play('intro');
      else if (g.phase === 'final') finalSounds();
    }
    if (g && g.phase === 'reveal') st.rev = true;
  }
  updScreen(box, g, snd);
}
function finalSounds() { setTimeout(() => SND.play('place'), 1200); setTimeout(() => SND.play('place'), 3000); setTimeout(() => SND.play('roll', 1.8), 3400); setTimeout(() => SND.play('fanfare'), 5200); }
function tilesHtml(q, pic) {
  return `<div class="tiles${pic ? ' pic' : ''}" id="tiles">` + q.opts.map((o, i) => {
    if (!optFilled(o)) return '';
    const txt = `<span class="t">${esc(o.t)}</span><span class="cnt" data-c="${i}"></span>`;
    return `<div class="tile ${CL[i]}" data-i="${i}"><div class="fill" data-f="${i}"></div>` +
      (pic ? `<div class="im" style="${bgUrl(o.img)}"></div><div class="row"><span class="l">${L[i]}</span>${txt}</div>` : `<span class="l">${L[i]}</span>${txt}`) + '</div>';
  }).join('') + '</div>';
}
function buildScreen(box, g) {
  let h = '';
  if (!g) h = '<div class="sv center"><div class="kk">' + GNAME + '</div><h1>Экран проектора</h1><p class="muted" style="font-size:1.3em">Запустите игру на пульте ведущего</p></div>';
  else if (g.phase === 'lobby' && isStage(g)) {
    const hs = [...new Set(g.qs.map(q => q.hp).filter(Boolean))].slice(0, 7);
    h = `<div class="glow"></div><div class="sv center stlob">${g.photo && IMG.get(g.photo) ? `<div class="cph" style="${bgUrl(g.photo)}"></div>` : ''}<div class="kk">${esc(g.title)}</div>${g.couple ? `<h1 class="cpl">${esc(g.couple)}</h1>` : ''}` +
      `<div class="stn"><b>${g.qs.length}</b><span>${plural(g.qs.length, 'удивительный факт', 'удивительных факта', 'удивительных фактов')} о гостях</span></div>` +
      `<div class="stq">${g.qs.slice(0, 7).map((q, i) => `<i style="animation-delay:${i * 120}ms">?</i>`).join('')}</div><p class="stp">Угадайте, о ком каждый</p></div>`;
  } else if (g.phase === 'lobby') {
    h = `<div class="glow"></div><div class="sv"><div class="lob"><div class="left"><div class="ttl">${g.photo && IMG.get(g.photo) ? `<div class="cph" style="${bgUrl(g.photo)}"></div>` : ''}<div>${g.couple ? `<div class="kk">${esc(g.title)}</div><h1 class="cpl">${esc(g.couple)}</h1>` : `<h1>${esc(g.title)}</h1>`}</div></div>` +
      `<div class="kk lcount">${g.s.play === 'teams' ? 'Команды' : 'В игре'} · <b style="color:var(--ink)" id="lcnt">0</b></div><div class="chips" id="chips"></div></div>` +
      `<div class="right"><div class="join"><div class="qr" id="lqr"></div><div class="jurl">${esc(SHORT.replace(/^https?:\/\//, ''))}</div><div class="jcode" id="lcode" ${g.code ? '' : 'style="visibility:hidden"'}><span>код</span><b>${fmtCode(g.code)}</b></div></div>${g.wifi ? `<div class="wifi"><div class="wq" id="wq"></div><div>Wi‑Fi<b>${esc(g.wifi.ssid)}</b>${g.wifi.pass ? 'пароль: ' + esc(g.wifi.pass) : ''}</div></div>` : ''}</div></div></div>`;
  } else if (g.phase === 'intro') {
    const E = entities(g), e = E[g.ii] || { name: '', members: [] };
    const lab = g.s.play === 'teams' ? 'Команда' : 'Стол';
    h = `<div class="glow"></div><div class="intro burst"></div><div class="sv"><div class="intro"><div class="n">${lab} ${g.ii + 1} из ${E.length}</div><div class="nm">${esc(e.name)}</div>` +
      (e.members && e.members.length ? `<div class="mem">${e.members.slice(0, 16).map(m => `<span>${esc(m)}</span>`).join('')}</div>` : '') +
      `<div class="dots">${E.map((x, i) => `<i class="${i <= g.ii ? 'on' : ''}"></i>`).join('')}</div></div></div>`;
  } else if (g.phase === 'question' || g.phase === 'reveal') {
    const q = g.qs[g.qi], pic = isPicQ(q), hasMd = !q.fact && q.type !== 'photo' && (mdOk(q.qm) || mdOk(q.am)), img = !pic && !hasMd && q.img ? picHtml(q.img, 'qpic') : '';
    const [gn, bn] = coupleNames(g.couple);
    const badge = (mult(g, g.qi) > 1 ? '<span class="x2">×2 очки</span>' : '') + (q.type === 'photo' ? '<span class="ctype">📷 Фото-вопрос</span>' : q.type === 'couple' ? '<span class="ctype">💍 Угадайте ответ пары</span>' : q.type === 'number' ? '<span class="ctype">🔢 Ответ — число</span>' : '');
    const stg = isStage(g);
    const head = `<div class="qtop2"><span class="n">${q.fact ? 'Факт' : 'Вопрос'} ${g.qi + 1} из ${g.qs.length}</span>${q.fact ? '<span class="ctype">💡 Кто это?</span>' : badge}${stg ? '' : ringSvg}</div>`;
    const cst = q.type === 'couple' ? `<div class="cst" id="cst"><span data-r="groom">${esc(gn)} …</span><span data-r="bride">${esc(bn)} …</span></div><div class="cres" id="cres" style="display:none"></div>` : '';
    let body;
    if (q.fact && stg) body = `<div class="qbody fq stg"><div class="qleft"><div class="qtext">${esc(q.text)}</div></div>${heroCard()}</div>`;
    else if (q.fact) body = `<div class="qbody fq"><div class="qleft"><div class="qtext">${esc(q.text)}</div>${factTiles(q)}</div>${heroCard()}</div>`;
    else if (q.type === 'photo') { const dur = Math.max(1000, g.t1 - g.t0); body = `<div class="qbody pq"><div class="qleft"><div class="qtext">${esc(q.text)}</div>${tilesHtml(q, false)}</div><div class="pqw${q.blur ? ' bl' : ''}${g.phase === 'reveal' ? ' rv' : ''}" style="--dur:${dur}ms;--del:${g.phase === 'question' ? (g.t0 - now()) : 0}ms">${picHtml(q.img, 'qpic qa')}${q.aimg ? picHtml(q.aimg, 'qpic qb') : ''}${q.aimg ? '<span class="atag">Ответ</span>' : ''}</div></div>`; }
    else if (q.type === 'number') body = `<div class="qtext" style="flex:none">${esc(q.text)}</div>${img ? `<div class="qbody" style="grid-template-columns:1fr 1fr"><div class="numq" id="numq"></div>${img}</div>` : '<div class="numq" id="numq"></div>'}`;
    else if (img) body = `<div class="qbody"><div class="qleft"><div class="qtext">${esc(q.text)}</div>${cst}${tilesHtml(q, false)}</div>${img}</div>`;
    else body = `<div class="qtext"${pic ? ' style="flex:none;font-size:2.8em"' : ''}>${esc(q.text)}</div>${cst}${tilesHtml(q, pic)}`;
    if (hasMd) body = `<div class="qbody md"><div class="qleft">${body}</div><div class="mdw${mdOk(q.qm) || g.phase === 'reveal' ? '' : ' wait'}" id="mdw">${mdOk(q.qm) || g.phase === 'reveal' ? '' : '<div class="mph">🎬<span>Видео-ответ покажем вместе с правильным ответом</span></div>'}</div></div>`;
    h = `<div class="sv${img || q.fact || q.type === 'photo' || hasMd ? ' wimg' : ''}${stg ? ' stgv' : ''}">${head}${body}<div class="foot"><span id="ansCnt"></span><span id="footR"></span></div></div>`;
  } else if (g.phase === 'board') {
    const fin = g.final;
    const row = (p, i, delay) => { const was = g.prevRank[p.id], d = was ? was - (i + 1) : 0; return `<div class="brow" style="animation-delay:${delay}ms"><span class="pl">${i + 1}</span><span class="nm"><span>${esc(p.name)}</span>${p.table ? `<small>стол ${p.table}</small>` : ''}${!fin && d > 0 ? `<i class="up">▲${d}</i>` : !fin && d < 0 ? `<i class="dn">▼${-d}</i>` : ''}</span><span class="sc">${p.gain && !fin ? `<span class="gain">+${nums(p.gain)}</span>` : ''}${nums(p.score)}</span></div>`; };
    const title = `<div class="kk">${esc(g.couple)}</div><h1 style="font-size:3.2em">${fin ? 'Итоговая таблица' : 'Таблица лидеров'}</h1>`;
    if (g.s.play === 'tables') {
      const r = ranked(g).slice(0, 5), t = tableRank(g).slice(0, 5), n1 = r.length, n2 = t.length;
      h = `<div class="sv">${title}<div class="board2"><div class="col"><h5>Игроки</h5>${r.map((p, i) => row(p, i, fin ? (n1 - 1 - i) * 300 : i * 80)).join('')}</div>` +
        `<div class="col"><h5>Столы · средний балл</h5>${t.map((x, i) => `<div class="brow" style="animation-delay:${fin ? (n2 - 1 - i) * 300 + 400 : i * 80 + 200}ms"><span class="pl">${i + 1}</span><span class="nm"><span>${esc(x.name)}</span><small>${x.n} ${plural(x.n, 'гость', 'гостя', 'гостей')}</small></span><span class="sc">${nums(x.score)}</span></div>`).join('')}</div></div></div>`;
    } else {
      const r = ranked(g).slice(0, 8), n = r.length;
      h = `<div class="sv">${title}<div class="board">${r.map((p, i) => row(p, i, fin ? (n - 1 - i) * 350 : i * 90)).join('')}</div></div>`;
    }
  } else if (g.phase === 'final' && isStage(g)) {
    const seen = {}, hs = g.qs.map(q => { const nm = q.opts[q.ok[0]] ? q.opts[q.ok[0]].t : ''; return { nm, hp: q.hp }; }).filter(x => x.nm && !seen[x.nm] && (seen[x.nm] = 1));
    h = `<div class="glow"></div><div class="sv center"><div class="kk">${esc(g.couple || g.title)}</div><h1 style="font-size:3.2em;margin:0 0 .6em">Вот они — наши герои</h1><div class="heroes n${Math.min(hs.length, 12)}">` +
      hs.slice(0, 12).map((x, i) => `<div style="animation-delay:${300 + i * 160}ms">${faceHtml(x.hp, x.nm, 'hf')}<b>${esc(x.nm)}</b></div>`).join('') + `</div><p class="stp">Спасибо, что вы с нами!</p></div>`;
  } else if (g.phase === 'final') {
    const tables = g.s.play === 'tables' && tableRank(g).length > 1;
    const list = tables ? tableRank(g).map(t => ({ name: t.name, score: t.score, sub: 'средний балл' })) : ranked(g).map(p => ({ name: p.name, score: p.score, sub: 'очков' }));
    const top = list.slice(0, 3), order = [top[1], top[0], top[2]], hs = [62, 86, 44], pl = [2, 1, 3];
    h = `<div class="glow"></div><div class="sv"><div class="kk" style="text-align:center">${esc(g.couple)}</div><h1 style="text-align:center;font-size:3.2em;margin-bottom:0">${tables ? 'Лучшие столы' : g.qs[0] && g.qs[0].fact ? 'Лучше всех знают гостей' : 'Победители'}</h1><div class="pod">` +
      order.map((p, i) => p ? `<div data-h="${hs[i]}" data-p="${pl[i]}"><div class="nm">${esc(p.name)}</div><div class="ps">${nums(p.score)} ${p.sub}</div><div class="b">${pl[i]}</div></div>` : '<div></div>').join('') +
      `</div><div class="noms">${nominations(g).map(x => `<div><i>${x[0]}</i><span>${esc(x[1])}</span><b>${esc(x[2])}</b></div>`).join('')}</div></div>`;
  }
  if (g && (g.phase === 'lobby' || g.phase === 'final' || g.phase === 'intro')) h += BRAND();
  box.innerHTML = h;
  if (g && g.phase === 'lobby') {
    const jn = box.querySelector('.join');
    if (jn) jn.onclick = e => {
      e.stopPropagation(); if (box.querySelector('.qrzoom')) return;
      const lc = box.querySelector('#lcode b'), z = document.createElement('div');
      z.className = 'qrzoom';
      z.innerHTML = `<div class="qz"><div class="qr" id="zqr"></div><div class="jurl">${esc(SHORT.replace(/^https?:\/\//, ''))}</div><div class="jcode"><span>код</span><b>${lc ? lc.textContent : ''}</b></div></div>`;
      box.querySelector('.sv').appendChild(z); qr(z.querySelector('#zqr'), playLink(g), 720);
      const close = () => { z.classList.add('out'); setTimeout(() => z.remove(), 220); document.removeEventListener('keydown', esc1); };
      const esc1 = ev => { if (ev.key === 'Escape') close(); };
      z.onclick = close; document.addEventListener('keydown', esc1);
    };
  }
  if (g && g.phase === 'lobby' && box.querySelector('#lqr')) { qr(box.querySelector('#lqr'), playLink(g)); if (g.wifi) qr(box.querySelector('#wq'), `WIFI:T:${g.wifi.pass ? 'WPA' : 'nopass'};S:${g.wifi.ssid.replace(/([\\;,:"])/g, '\\$1')};P:${(g.wifi.pass || '').replace(/([\\;,:"])/g, '\\$1')};;`, 256); }
  if (g && g.phase === 'final') {
    const cols = [...box.querySelectorAll('.pod>div[data-h]')];
    const at = { 3: 1200, 2: 3000, 1: 5200 };
    cols.forEach(d => setTimeout(() => { d.classList.add('in'); const b = d.querySelector('.b'); if (b) b.style.height = (d.dataset.h / 24) + 'em'; }, at[d.dataset.p] || 1200));
    [...box.querySelectorAll('.noms div')].forEach((d, k) => setTimeout(() => d.classList.add('in'), 6600 + k * 350));
  }
}
function updScreen(box, g, snd) {
  if (!g || !box) return;
  const st = box._st || {};
  if (g.phase === 'question' || g.phase === 'reveal') {
    const mw = box.querySelector('#mdw'), r = String(g.mr || 0), q = g.qs[g.qi];
    if (mw && q) { if (st.mr === undefined || st.mrq !== g.qi) { st.mr = r; st.mrq = g.qi; } else if (st.mr !== r) { st.mr = r; const m = g.phase === 'reveal' && mdOk(q.am) ? q.am : mdOk(q.qm) ? q.qm : q.am; if (mdOk(m)) mountMedia(mw, m, !!snd); } }
  }
  if (g.phase === 'lobby') {
    const chips = box.querySelector('#chips'), ps = ranked(g).sort((a, b) => (a.jt || 0) - (b.jt || 0));
    if (chips) {
      const have = new Set([...chips.children].map(c => c.dataset.id));
      ps.forEach(p => { if (!have.has(p.id)) { const s = document.createElement('span'); s.dataset.id = p.id; s.innerHTML = esc(p.name) + (p.table ? `<small>стол ${p.table}</small>` : ''); chips.appendChild(s); } });
      [...chips.children].forEach(c => { if (!g.players[c.dataset.id]) c.remove(); });
      const cnt = box.querySelector('#lcnt'); if (cnt) cnt.textContent = ps.length;
      if (snd && ps.length > (st.nPlayers || 0)) SND.play('join');
      st.nPlayers = ps.length;
    }
    const lc = box.querySelector('#lcode');
    if (lc && g.code && st.code !== g.code) { st.code = g.code; lc.style.visibility = ''; lc.querySelector('b').textContent = fmtCode(g.code); }
    return;
  }
  if (g.phase !== 'question' && g.phase !== 'reveal') return;
  const q = g.qs[g.qi], rev = g.phase === 'reveal';
  const fg = box.querySelector('.ring .fg'), tt = box.querySelector('#ringT'), ring = box.querySelector('#ring');
  if (!rev) {
    const rem = Math.max(0, g.t1 - now()), dur = g.t1 - g.t0, pre = g.t0 - now();
    if (fg) { const f = pre > 0 ? 1 : rem / dur; fg.setAttribute('stroke-dashoffset', String(97.4 * (1 - f))); fg.style.stroke = f < .25 ? 'var(--bad)' : ''; }
    if (tt) tt.textContent = pre > 0 ? '' : Math.ceil(rem / 1000);
    const sec = Math.ceil(rem / 1000);
    if (snd && pre <= 0 && sec <= 5 && sec >= 1 && sec !== st.tick) { st.tick = sec; SND.play('tick'); }
    if (snd && pre <= 0 && rem <= 0 && !st.up) { st.up = true; SND.play('up'); }
  } else if (ring) ring.style.visibility = 'hidden';
  if (rev && !st.rev) { st.rev = true; if (snd) SND.play('reveal'); }
  const n = Object.keys(g.players).length, A = (g.ans && g.ans[g.qi]) || {}, a = Object.keys(A).length;
  const ac = box.querySelector('#ansCnt'); if (ac) ac.textContent = isStage(g) ? '' : `Ответили ${a} из ${n}`;
  const fr = box.querySelector('#footR');
  const mw = box.querySelector('#mdw'); if (mw && rev && mdOk(q.am) && mw.dataset.s !== 'a') { mw.dataset.s = 'a'; mountMedia(mw, q.am, !!snd); }
  if (q.type === 'number') {
    const nq = box.querySelector('#numq');
    if (nq && nq.dataset.st !== (rev ? 'r' : 'q')) {
      nq.dataset.st = rev ? 'r' : 'q';
      if (!rev) nq.innerHTML = `<div class="ph">Введите ответ на телефоне</div>${q.unit ? `<div class="unit">${esc(q.unit)}</div>` : ''}`;
      else {
        const arr = Object.keys(A).map(id => ({ name: (g.players[id] || {}).name || 'Гость', v: A[id].v, gain: (g.players[id] || {}).gain || 0 })).sort((x, y) => numErr(q, x.v) - numErr(q, y.v)).slice(0, 3);
        nq.innerHTML = `<div class="ph">${hasRng(q) ? 'Засчитываем от и до' : 'Правильный ответ'}</div><div class="big${hasRng(q) ? ' rg' : ''}">${esc(numTxt(q.num, hasRng(q) ? q.num2 : null))}</div>${q.unit ? `<div class="unit">${esc(q.unit)}</div>` : ''}` +
          (arr.length ? `<div class="close3">${arr.map((x, i) => `<div><small>${i === 0 ? 'Ближе всех' : (i + 1) + '-е место'}</small><b>${esc(x.name)}</b>${esc(nums(x.v))} · <em>+${nums(x.gain)}</em></div>`).join('')}</div>` : '');
      }
    }
    if (fr) fr.textContent = rev ? '' : 'Чем ближе — тем больше очков';
    return;
  }
  const D = dist(g), okS = rev ? okSet(g, g.qi) : [];
  const pw = box.querySelector('.pqw'); if (pw && rev && !pw.classList.contains('rv')) pw.classList.add('rv');
  const tiles = box.querySelector('#tiles');
  if (tiles) {
    tiles.classList.toggle('rev', rev);
    [...tiles.querySelectorAll('.tile')].forEach(t => {
      const i = +t.dataset.i, c = D.cnt[i] || 0, pct = D.tot ? Math.round(c / D.tot * 100) : 0;
      t.classList.toggle('ok', rev && okS.indexOf(i) >= 0);
      const f = t.querySelector('.fill'); if (f) f.style.width = pct + '%';
      const cn = t.querySelector('.cnt'); if (cn) { cn.textContent = c ? `${c} · ${pct}%` : '0'; cn.style.opacity = c || rev ? 1 : .55; }
    });
  }
  if (q.fact) {
    const hero = box.querySelector('#hero');
    if (hero && rev && !hero.dataset.done) {
      hero.dataset.done = 1;
      const nm = q.opts[okS[0]] ? q.opts[okS[0]].t : '', d = q.hp && IMG.get(q.hp);
      box.querySelector('#hnm').textContent = nm;
      const ph = box.querySelector('#hph'); if (d) ph.style.backgroundImage = `url(${d})`; else { ph.classList.add('none'); ph.textContent = (nm || '?').trim().charAt(0).toUpperCase(); }
      setTimeout(() => hero.classList.add('on'), 900);
    }
  }
  if (q.type === 'couple') {
    const c = (g.cpl && g.cpl[g.qi]) || {}, cst = box.querySelector('#cst'), cres = box.querySelector('#cres'), [gn, bn] = coupleNames(g.couple);
    if (!rev && cst) { const roles = g.croles || coupleRoles(); cst.style.display = roles.length || c.groom != null || c.bride != null ? '' : 'none'; [...cst.children].forEach(s => { const on = c[s.dataset.r] != null; s.classList.toggle('on', on); s.textContent = (s.dataset.r === 'groom' ? gn : bn) + (on ? ' ✓ ответил' + (s.dataset.r === 'bride' ? 'а' : '') : ' думает…'); }); }
    if (rev && cres) {
      if (cst) cst.style.display = 'none';
      const t = i => i != null && q.opts[i] ? (q.opts[i].t || L[i]) : '—';
      const both = c.groom != null && c.bride != null;
      cres.style.display = '';
      cres.innerHTML = c.groom == null && c.bride == null ? (c.host != null ? `Ответ пары: <b>${esc(t(c.host))}</b>` : 'Пара не ответила — очков нет') :
        `${esc(gn)}: <b>${esc(t(c.groom))}</b> · ${esc(bn)}: <b>${esc(t(c.bride))}</b>${both ? (c.groom === c.bride ? '<span class="m">Совпало!</span>' : '<span class="m diff">Мнения разошлись!</span>') : ''}`;
    }
  }
  if (fr && isStage(g)) fr.textContent = rev ? '' : 'Угадайте вслух — кто это?';
  else if (fr && q.fact) { if (!rev) fr.textContent = 'Выберите на телефоне, о ком этот факт'; else { let ok = 0; Object.keys(A).forEach(k => { if (okS.indexOf(A[k].o) >= 0) ok++; }); fr.textContent = `Угадали ${ok} из ${a}`; } }
  else if (fr) {
    if (!rev) fr.textContent = q.type === 'couple' ? 'Засчитываем ответ пары' : (g.s.speed ? 'Чем быстрее — тем больше очков' : (g.s.change ? 'Можно менять ответ до конца таймера' : ''));
    else { let ok = 0, fast = null; Object.keys(A).forEach(k => { if (okS.indexOf(A[k].o) >= 0) { ok++; if (!fast || A[k].t < fast.t) fast = { t: A[k].t, id: k }; } }); fr.textContent = `Правильно ответили: ${ok}` + (fast && g.players[fast.id] ? ` · быстрее всех ${g.players[fast.id].name} (${(fast.t / 1000).toFixed(1)} с)` : ''); }
  }
}
