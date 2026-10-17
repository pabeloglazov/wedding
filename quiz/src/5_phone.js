
/* ================= телефон гостя ================= */
let PHMSG = '';
function phoneKey(g, cl) {
  if (!g) return 'none:' + PHMSG + (cl && cl.codeEntry ? ':code' : '');
  const me = g.players[cl.pid];
  if (cl.kicked) return 'kicked'; if (cl.full) return 'full';
  if (cl.role) return 'cpl:' + g.id + g.phase + g.qi + ':' + JSON.stringify((g.ok || {}).cpl || '');
  if (!me) return 'join:' + g.id + (g.phase === 'final' ? 'f' : '') + (cl.joining ? 'j' : '');
  if (g.phase === 'question') return 'q:' + g.id + g.qi + (g.qs[g.qi].img && IMG.get(g.qs[g.qi].img) ? 'i' : '') + (isPicQ(g.qs[g.qi]) ? g.qs[g.qi].opts.map(o => IMG.get(o.img) ? 1 : 0).join('') : '');
  if (g.phase === 'reveal') return 'r:' + g.id + g.qi + ':' + (me.last || '') + me.gain + ':' + me.score + ':' + (g._rank || '');
  if (g.phase === 'intro') return 'i:' + g.id + g.ii;
  return g.phase + ':' + g.id + me.score + (g._rank || '') + (g.res || '') + me.table;
}
function renderPhone(box, g, cl) {
  if (!box) return;
  const key = phoneKey(g, cl);
  if (key !== box.dataset.k || !box.firstChild) { box.dataset.k = key; buildPhone(box, g, cl); }
  updPhone(box, g, cl);
}
function head(g, me) { return `<div class="me"><span>${esc(me.name)}${me.table ? ' · стол ' + me.table : ''}</span><span><b>${nums(me.score)}</b> очков</span></div>`; }
function buildPhone(box, g, cl) {
  let h = '';
  const wait = (big, t, s) => `<div class="pv"><div class="wait">${big}<h2>${t}</h2>${s ? `<p class="sub">${s}</p>` : ''}</div></div>`;
  if (!g) {
    if (cl && cl.codeEntry) h = `<div class="pv"><div class="wait" style="justify-content:flex-start;padding-top:10vh"><div class="pbrand">${MARK(48)}</div><div class="kk">${GNAME}</div><h2>Введите код игры</h2><p class="sub">Он написан на экране рядом с QR-кодом</p>` +
      `<input class="pin code" id="pCode" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="000 000"><button class="pbtn acc" id="pGo">Войти</button><p class="note w" id="pErr"></p></div></div>`;
    else h = `<div class="pv"><div class="wait">${PHMSG ? '<div class="big" style="font-size:44px">' + (/Спасибо/.test(PHMSG) ? '🎉' : /удалил/.test(PHMSG) ? '👋' : '⚠️') + '</div>' : '<div class="spin"></div>'}<div class="kk">${GNAME}</div><p class="sub" style="margin:0">${PHMSG || 'Подключаемся к игре…'}</p></div></div>`;
  } else if (cl.kicked) h = wait('<div class="big" style="font-size:44px">👋</div>', 'Вы вне игры', 'Ведущий убрал этого участника из игры');
  else if (cl.full) h = wait('<div class="big" style="font-size:44px">⏳</div>', 'Мест нет', cl.demo ? 'Игра в демо-режиме: до ' + DEMO_MAX + ' телефонов. Ведущему нужен полный доступ, чтобы впустить всех.' : 'В игре уже максимум гостей по тарифу ведущего. Подойдите к ведущему — он сможет расширить игру.');
  else if (cl.role) h = buildCouple(g, cl);
  else {
    const me = g.players[cl.pid], teams = g.s.play === 'teams', tables = g.s.play === 'tables';
    if (!me) {
      if (g.phase === 'final') h = wait('<div class="kk">' + esc(g.couple) + '</div>', 'Игра завершена', 'Спасибо, что были с нами!');
      else h = `<div class="pv"><div class="pbrand">${MARK(40)}</div><div class="kk">${esc(g.couple)}</div><h2>${esc(g.title)}</h2><p class="sub">${teams ? 'Придумайте название команды' : 'Как вас зовут?'}</p>` +
        `<input class="pin" id="pName" maxlength="24" autocomplete="off" placeholder="${teams ? 'Название команды' : 'Ваше имя'}" value="${esc(cl.lastName || '')}">` +
        (tables ? `<div class="lblc">Ваш стол</div><div class="tbls" id="pTbl">${Array.from({ length: g.s.tables || 10 }, (_, i) => `<button data-t="${i + 1}" class="${cl.table === i + 1 ? 'on' : ''}">${i + 1}</button>`).join('')}</div>` : '') +
        `<button class="pbtn acc" id="pJoin"${cl.joining ? ' disabled' : ''}>${cl.joining ? 'Входим…' : 'Войти в игру'}</button><p class="note">Приложение не нужно — всё работает в браузере</p><p class="note w" id="pErr"></p></div>`;
    } else if (g.phase === 'lobby') h = `<div class="pv">${head(g, me)}<div class="wait"><div class="big">✓</div><h2>${teams ? 'Команда в игре' : 'Вы в игре'}</h2><p class="sub">Смотрите на экран — скоро первый вопрос</p></div></div>`;
    else if (g.phase === 'intro') {
      const i = g._intro || (() => { const E = entities(g), e = E[g.ii]; return e ? { pid: e.pid, table: e.table, name: e.name } : {}; })();
      const mine = (i.pid && i.pid === cl.pid) || (i.table && i.table === me.table);
      h = `<div class="pv">${head(g, me)}<div class="wait">${mine ? '<div class="big" style="font-size:56px">🎉</div><h2>Сейчас представляют вас!</h2><p class="sub">Помашите залу 👋</p>' : `<div class="big" style="font-size:48px">🎤</div><h2>Знакомимся</h2><p class="sub">На экране: ${esc(i.name || '')}</p>`}</div></div>`;
    } else if (g.phase === 'question') {
      const q = g.qs[g.qi], pic = isPicQ(q), ppic = q.img && !pic ? picHtml(q.img, 'pimg' + (q.blur ? ' bl' : '')) : '';
      const top = `<div class="pv${ppic ? ' wimg' : ''}">${head(g, me)}<div class="kk" style="text-align:left">${q.fact ? 'Факт' : 'Вопрос'} ${g.qi + 1} из ${g.qs.length}${q.fact ? ' · кто это?' : mult(g, g.qi) > 1 ? ' · ×2 очки' : ''}</div><div class="pq">${esc(q.text)}</div>` +
        (q.type === 'couple' ? '<div class="hintc">💍 Угадайте, что ответила пара</div>' : '') + (q.mk || mdOk(q.qm) ? `<div class="hintc">${(q.mk || q.qm.k) === 'audio' ? '🎧 Слушайте — звук на большом экране' : '🎬 Смотрите видео на большом экране'}</div>` : '') + ppic + '<div class="tm"><i id="ptm" style="width:100%"></i></div>';
      if (q.type === 'number') h = top + `<div class="numin"><input class="pin" id="pNum" inputmode="decimal" autocomplete="off" placeholder="Ваш ответ">${q.unit ? `<div class="unit">${esc(q.unit)}</div>` : ''}<button class="pbtn acc" id="pNumGo">Ответить</button></div><p class="note" id="pNote"></p></div>`;
      else h = top + `<div class="ans${pic ? ' pic' : ''}" id="pAns">` + q.opts.map((o, i) => !optFilled(o) ? '' :
        `<button class="${CL[i]}" data-o="${i}">${pic ? `<span class="im" style="${bgUrl(o.img)}">${IMG.get(o.img) ? '' : `<em>${esc(initial(o.t))}</em>`}</span><span class="rw"><span class="l">${L[i]}</span><span>${esc(o.t)}</span></span>` : `<span class="l">${L[i]}</span><span>${esc(o.t)}</span>`}</button>`).join('') + '</div><p class="note" id="pNote"></p></div>';
    } else if (g.phase === 'reveal') {
      const q = g.qs[g.qi], st = me.last || 'none', mine = cl.picked[g.qi] != null || (g.ans[g.qi] && g.ans[g.qi][cl.pid]);
      const okS = g._ok ? g._ok : okSet(g, g.qi), txt = i => q.opts[i] ? (q.opts[i].t || 'вариант ' + L[i]) : '';
      let sub = '';
      if (q.type === 'number') sub = `Правильный ответ: <b>${esc(g._num != null ? numTxt(g._num, g._num2) : numTxt(q.num, hasRng(q) ? q.num2 : null))}</b>${q.unit ? ' ' + esc(q.unit) : ''}${me.lv != null ? `<small>Ваш ответ: ${esc(nums(me.lv))}</small>` : ''}`;
      else if (st !== 'ok') sub = okS.length ? `Правильный ответ: ${okS.map(i => L[i] + ' — ' + esc(txt(i))).join(', ')}` : '';
      let title = st === 'ok' ? 'Верно!' : st === 'bad' ? 'Мимо' : st === 'nocpl' ? 'Пара не ответила' : 'Не успели';
      if (st === 'ok' && q.type === 'number') title = me.gain >= 1000 ? 'В точку!' : 'Близко!';
      if (st === 'none' && mine) { title = 'Ответ опоздал'; sub = 'Он пришёл уже после окончания таймера — проверьте интернет'; }
      if (st === 'wait') h = `<div class="pv">${head(g, me)}<div class="wait"><div class="spin"></div><p class="sub">Подсчитываем очки…</p></div></div>`;
      else h = `<div class="pv">${head(g, me)}<div class="res ${st === 'ok' ? 'ok' : st === 'bad' ? 'bad' : 'none'}"><b>${title}</b>` +
        (st === 'ok' ? `<div class="g">+${nums(me.gain)}</div>${me.streak >= 3 ? `<div>🔥 серия ${me.streak} подряд</div>` : ''}` : '') + (sub ? `<small>${sub}</small>` : '') + '</div>' +
        `<div class="rank">Ваше место<br><b>${g._rank || rankOf(g, cl.pid)}</b> из ${g._np || Object.keys(g.players).length}</div>${me.table && g._trank ? `<div class="rank">Ваш стол ${me.table}: <b>${g._trank}</b> место из ${g._tn}</div>` : ''}</div>`;
    } else if (g.phase === 'board') {
      const rk = g._rank || rankOf(g, cl.pid);
      h = `<div class="pv">${head(g, me)}<div class="wait"><div class="big">${rk}</div><h2>место</h2><p class="sub">${nums(me.score)} очков · смотрите на экран</p>${me.table && g._trank ? `<p class="sub">Стол ${me.table} — ${g._trank} место</p>` : ''}</div></div>`;
    } else if (g.phase === 'final') {
      const rk = g._rank || rankOf(g, cl.pid);
      h = `<div class="pv">${head(g, me)}<div class="wait"><div class="big">${rk <= 3 ? ['🥇', '🥈', '🥉'][rk - 1] : rk}</div><h2>${rk <= 3 ? 'Вы в тройке лидеров!' : rk + '-е место'}</h2><p class="sub">${nums(me.score)} очков · верных ответов: ${me.ok || 0}</p>${g.res ? `<a class="alink" href="${esc(resLink(g.res))}" target="_blank">Итоги вечера →</a>` : ''}</div></div>`;
    }
  }
  box.innerHTML = h;
  wirePhone(box, g, cl);
}
function rankOf(g, pid) { return ranked(g).map(p => p.id).indexOf(pid) + 1; }
function buildCouple(g, cl) {
  const [gn, bn] = coupleNames(g.couple), nm = cl.role === 'groom' ? gn : bn;
  const pill = `<div style="text-align:center"><span class="role">💍 ${cl.role === 'groom' ? 'Жених' : 'Невеста'} · ${esc(nm)}</span></div>`;
  if (cl.bad) return `<div class="pv">${pill}<div class="wait"><div class="big" style="font-size:44px">⚠️</div><h2>Ссылка устарела</h2><p class="sub">Попросите ведущего показать QR-код для пары ещё раз</p></div></div>`;
  const q = g.qs[g.qi];
  if (g.phase === 'question' && q && q.type === 'couple') return `<div class="pv">${pill}<div class="kk" style="text-align:left">Вопрос ${g.qi + 1} из ${g.qs.length}</div><div class="pq">${esc(q.text)}</div><div class="hintc">Ответьте честно — гости угадывают ваш ответ</div><div class="tm"><i id="ptm" style="width:100%"></i></div>` +
    `<div class="ans" id="pAns">${q.opts.map((o, i) => !optFilled(o) ? '' : `<button class="${CL[i]}" data-o="${i}"><span class="l">${L[i]}</span><span>${esc(o.t || 'вариант ' + L[i])}</span></button>`).join('')}</div><p class="note" id="pNote"></p></div>`;
  if (g.phase === 'reveal' && q && q.type === 'couple') {
    const c = (g.ok && g.ok.cpl) || {}, t = i => i >= 0 && q.opts[i] ? (q.opts[i].t || L[i]) : '—';
    const same = c.groom >= 0 && c.groom === c.bride;
    return `<div class="pv">${pill}<div class="wait"><div class="big" style="font-size:52px">${same ? '💞' : c.groom >= 0 && c.bride >= 0 ? '😅' : '💍'}</div><h2>${same ? 'Вы ответили одинаково!' : c.groom >= 0 && c.bride >= 0 ? 'Мнения разошлись' : 'Ответ засчитан'}</h2><p class="sub">${esc(gn)}: ${esc(t(c.groom))}<br>${esc(bn)}: ${esc(t(c.bride))}</p></div></div>`;
  }
  const sub = g.phase === 'final' ? 'Спасибо! Игра окончена.' + (g.res ? `<a class="alink" href="${esc(resLink(g.res))}" target="_blank">Итоги вечера →</a>` : '') :
    g.phase === 'question' ? 'Сейчас вопрос для гостей: «' + esc(q.text) + '»' : 'Когда будет вопрос «Угадай ответ пары», варианты появятся здесь';
  return `<div class="pv">${pill}<div class="wait"><div class="big" style="font-size:48px">💍</div><h2>${g.phase === 'final' ? 'Готово' : 'Вы подключены'}</h2><p class="sub">${sub}</p></div></div>`;
}
function wirePhone(box, g, cl) {
  const j = box.querySelector('#pJoin');
  if (j) {
    const inp = box.querySelector('#pName');
    [...box.querySelectorAll('#pTbl button')].forEach(b => b.onclick = () => { cl.table = +b.dataset.t; const er = box.querySelector('#pErr'); if (er) er.textContent = ''; [...box.querySelectorAll('#pTbl button')].forEach(x => x.classList.toggle('on', x === b)); });
    const go = () => {
      const v = inp.value.trim();
      if (!v) return inp.focus();
      if (g.s.play === 'tables' && !cl.table) { box.querySelector('#pErr').textContent = 'Выберите свой стол'; return; }
      cl.lastName = v; cl.join(v, cl.table);
    };
    j.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
  }
  const cg = box.querySelector('#pGo');
  if (cg) { const inp = box.querySelector('#pCode'); const go = () => cl.enterCode(inp.value.replace(/\D/g, ''), box.querySelector('#pErr')); cg.onclick = go; inp.oninput = () => { const d = inp.value.replace(/\D/g, '').slice(0, 6); inp.value = d.length > 3 ? d.slice(0, 3) + ' ' + d.slice(3) : d; if (d.length === 6) go(); }; }
  const pz = box.querySelector('.pimg');
  if (pz && !pz.classList.contains('bl')) pz.onclick = () => { const z = document.createElement('div'); z.className = 'zoom'; z.innerHTML = `<img src="${pz.querySelector('img').src}" alt="">`; z.onclick = () => z.remove(); document.body.appendChild(z); };
  [...box.querySelectorAll('#pAns button')].forEach(b => b.onclick = () => {
    const cur = cl.cur(); if (!cur || cur.phase !== 'question' || now() > cur.t1 + 300) return;
    const mine = cl.picked[cur.qi];
    if (mine != null && !cur.s.change && !cl.role) return;
    if (mine === +b.dataset.o) return;
    cl.answer(cur.qi, { o: +b.dataset.o });
    updPhone(box, cur, cl);
  });
  const ng = box.querySelector('#pNumGo');
  if (ng) {
    const inp = box.querySelector('#pNum');
    const go = () => {
      const cur = cl.cur(); if (!cur || cur.phase !== 'question') return;
      const v = +String(inp.value).replace(/\s/g, '').replace(',', '.');
      if (inp.value.trim() === '' || !isFinite(v)) { inp.focus(); return; }
      if (cl.picked[cur.qi] != null && !cur.s.change) return;
      cl.answer(cur.qi, { v }); inp.blur(); updPhone(box, cur, cl);
    };
    ng.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
  }
}
function updPhone(box, g, cl) {
  if (!box) return;
  const pv = box.querySelector('.pv');
  if (pv && cl && cl.net) {
    let nb = pv.querySelector('.netbar');
    if (!NET.connected && Date.now() - NET.since > 3000) { if (!nb) { nb = document.createElement('div'); nb.className = 'netbar'; nb.textContent = 'Нет связи — переподключаемся…'; pv.insertBefore(nb, pv.firstChild); } }
    else if (nb) nb.remove();
  }
  if (!g || g.phase !== 'question') return;
  const t = box.querySelector('#ptm');
  if (t) { const dur = g.t1 - g.t0, rem = Math.max(0, g.t1 - now()); t.style.width = (now() < g.t0 ? 100 : rem / dur * 100) + '%'; }
  const pk = cl.picked[g.qi], note = box.querySelector('#pNote');
  const ans = box.querySelector('#pAns');
  if (ans) { ans.classList.toggle('picked', pk != null); [...ans.children].forEach(b => b.classList.toggle('sel', +b.dataset.o === pk)); }
  const ni = box.querySelector('#pNum'), ng = box.querySelector('#pNumGo');
  if (ni && pk != null) { if (!g.s.change) { ni.disabled = true; if (ng) ng.disabled = true; } if (document.activeElement !== ni && ni.value === '') ni.value = pk; }
  if (note) {
    let s = '';
    if (pk != null) s = cl.pending[g.qi] ? 'Отправляем ответ…' : (cl.role ? 'Ответ записан · гости пока не видят его' : g.s.change ? 'Ответ принят · можно поменять до конца таймера' : 'Ответ принят · ждём остальных');
    if (pk == null && now() > g.t1) s = 'Время вышло';
    if (cl.net && !NET.connected && Date.now() - NET.since > 3000 && pk != null) s = 'Нет связи — ответ отправится, как только появится интернет';
    note.textContent = s; note.classList.toggle('w', cl.net && !NET.connected);
  }
}
