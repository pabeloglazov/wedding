
/* ================= анкета для пары ================= */
const FORM = [
  { id: 'met', type: 'choice', q: 'Где вы познакомились?' },
  { id: 'date1', type: 'choice', q: 'Где было ваше первое свидание?' },
  { id: 'propose', type: 'choice', q: 'Где было сделано предложение?' },
  { id: 'gfood', type: 'choice', q: 'Любимое блюдо жениха?' },
  { id: 'bfood', type: 'choice', q: 'Любимое блюдо невесты?' },
  { id: 'dream', type: 'choice', q: 'Куда вы мечтаете поехать вместе?' },
  { id: 'first', type: 'who', q: 'Кто первым написал?' },
  { id: 'love', type: 'who', q: 'Кто первым сказал «люблю»?' },
  { id: 'late', type: 'who', q: 'Кто чаще опаздывает?' },
  { id: 'cook', type: 'who', q: 'Кто лучше готовит?' },
  { id: 'sorry', type: 'who', q: 'Кто первым мирится после ссоры?' },
  { id: 'money', type: 'who', q: 'Кто главный по финансам?' },
  { id: 'months', type: 'number', q: 'Сколько месяцев вы встречались до помолвки?', unit: 'мес.' },
  { id: 'gage', type: 'number', q: 'Сколько лет было жениху, когда вы познакомились?', unit: 'лет' },
  { id: 'babyg', type: 'photo', q: 'Детское фото жениха' },
  { id: 'babyb', type: 'photo', q: 'Детское фото невесты' }
];
const formLink = f => BASE + '?view=form&f=' + f;
function shuffleOpts(right, wrong) {
  const all = [right].concat(wrong.filter(w => w && w.trim())).slice(0, 4);
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  while (all.length < 2) all.push('');
  return { opts: all.map(t => O(t)), ok: [all.indexOf(right)] };
}
function ownList(a) { const l = Array.isArray(a.own) ? a.own.filter(Boolean) : Object.values(a.own || {}); ['own1', 'own2'].forEach(k => { if (a[k]) l.push(a[k]); }); return l; }
const ownOk = v => v && (v.q || '').trim() && (v.r || '').trim();
function formToQs(f) {
  const a = f.ans || {}, img = f.img || {}, gn = (a.gname || '').trim() || coupleNames(CFG.couple)[0], bn = (a.bname || '').trim() || coupleNames(CFG.couple)[1];
  const out = [];
  FORM.forEach(it => {
    const v = a[it.id];
    if (it.type === 'choice' && v && (v.r || '').trim()) { const s = shuffleOpts(v.r.trim(), v.w || []); out.push(normQ({ type: 'choice', text: it.q.replace('жениха', gn).replace('невесты', bn).replace('Где вы', 'Где ' + gn + ' и ' + bn).replace('Куда вы', 'Куда ' + gn + ' и ' + bn).replace('ваше ', 'их '), opts: s.opts, ok: s.ok })); }
    if (it.type === 'who' && v) { const opts = [gn, bn].concat(v === 'both' ? ['Оба'] : []); out.push(normQ({ type: 'choice', text: it.q, opts: opts.map(t => O(t)), ok: [v === 'g' ? 0 : v === 'b' ? 1 : 2] })); }
    if (it.type === 'number' && v !== undefined && v !== '' && isFinite(+v)) out.push(normQ({ type: 'number', text: it.q.replace('вы встречались', 'пара встречалась').replace('жениху', gn), num: +v, unit: it.unit || '' }));
    if (it.type === 'photo' && img[it.id]) { const id = IMG.put(img[it.id]); STORE.upImg(id); out.push(normQ({ type: 'choice', text: 'Кто на детском фото?', img: id, opts: [O(gn), O(bn)], ok: [it.id === 'babyg' ? 0 : 1] })); }
  });
  ownList(a).forEach(v => { if (ownOk(v)) { const s = shuffleOpts(v.r.trim(), v.w || []); out.push(normQ({ type: 'choice', text: v.q.trim(), opts: s.opts, ok: s.ok })); } });
  return out;
}
function viewFactForm() {
  document.body.classList.add('cream'); document.title = 'Интересные факты о гостях';
  const fid = (P.get('f') || '').replace(/[^a-z0-9]/gi, ''), app = $('app');
  app.innerHTML = '<div class="lt"><div class="k">Анкета для пары</div><h1>Загружаем…</h1></div>';
  netReady.then(ok => {
    if (!ok || !fid) { app.innerHTML = '<div class="lt"><h1>Не получилось открыть анкету</h1><p>Проверьте интернет и обновите страницу.</p></div>'; return; }
    const fr = ref('forms/' + fid);
    fr.once('value').then(s => {
      const f = s.val();
      if (!f) { app.innerHTML = '<div class="lt"><h1>Анкета не найдена</h1><p>Попросите ведущего прислать ссылку ещё раз.</p></div>'; return; }
      applyAccent(f.accent);
      const A = f.ans || {}, IM = f.img || {};
      A.items = (Array.isArray(A.items) ? A.items : Object.values(A.items || {})).filter(Boolean);
      if (!A.items.length) A.items = [{ id: uid(), name: '', fact: '' }, { id: uid(), name: '', fact: '' }, { id: uid(), name: '', fact: '' }];
      let t = null;
      const save = () => { clearTimeout(t); $('saved').textContent = 'Сохраняем…'; t = setTimeout(() => fr.child('ans').set(A).then(() => { $('saved').textContent = '✓ Сохранено'; }, () => { $('saved').textContent = 'Нет связи — попробуйте ещё раз'; }), 700); };
      const card = (x, n) => `<div class="card own fc" data-n="${n}"><div class="q oq"><span>Гость ${n + 1}</span><button class="odel" data-del title="Убрать" aria-label="Убрать">${'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7M6.5 7l.8 12.2c.1.9.8 1.8 1.8 1.8h5.8c1 0 1.7-.9 1.8-1.8L17.5 7"/></svg>'}</button></div>` +
        `<div class="fcrow"><div class="fph${IM[x.id] ? ' has' : ''}" data-ph style="${IM[x.id] ? `background-image:url(${IM[x.id]})` : ''}">${IM[x.id] ? '' : '📷'}</div><div class="fcin"><input class="in2" data-k="name" maxlength="40" placeholder="Имя гостя — как его знают в зале" value="${esc(x.name || '')}">` +
        `<textarea class="in2" data-k="fact" rows="2" maxlength="220" placeholder="Интересный факт о нём">${esc(x.fact || '')}</textarea></div></div><div class="small">Фото — по желанию: гости увидят его, когда откроется ответ.</div><input type="file" accept="image/*" hidden></div>`;
      app.innerHTML = `<div class="lt"><div class="pbrand">${BRAND()}</div><div class="k">Анкета для пары · ${esc(f.couple || '')}</div><h1>Интересные факты о гостях</h1>` +
        `<p>Впишите гостей и что-нибудь удивительное о каждом: «прыгал с парашютом», «знает жениха с первого класса». На празднике факт появится на экране, а гости будут угадывать, о ком он. Всё сохраняется автоматически.</p>` +
        `<div id="fcBox"></div><button class="addown" id="addF">+ Ещё гость</button><div class="saved" id="saved"></div><button class="pbtn" id="done">Готово — отправить ведущему</button><p class="small" style="text-align:center;margin-top:10px">Факты увидит только ведущий. Гости узнают их во время игры 😉</p></div>`;
      const paint = () => {
        $('fcBox').innerHTML = A.items.map(card).join('');
        $('fcBox').querySelectorAll('.fc').forEach(c => {
          const n = +c.dataset.n, x = A.items[n], inp = c.querySelector('input[type=file]'), ph = c.querySelector('[data-ph]');
          c.querySelectorAll('[data-k]').forEach(i => i.oninput = () => { x[i.dataset.k] = i.value; save(); });
          c.querySelector('[data-del]').onclick = () => { A.items.splice(n, 1); if (IM[x.id]) { fr.child('img/' + x.id).remove(); delete IM[x.id]; } paint(); save(); };
          ph.onclick = () => { if (!IM[x.id]) { inp.value = ''; inp.click(); return; } cropImage(IM[x.id], { aspect: 1, round: true, max: 700, target: 120000, replace: true }).then(r => { if (r === 'replace') { inp.value = ''; inp.click(); } else if (r) setPh(r); }); };
          const setPh = data => { ph.textContent = '…'; return fr.child('img/' + x.id).set(data).then(() => { IM[x.id] = data; ph.textContent = ''; ph.classList.add('has'); ph.style.backgroundImage = `url(${data})`; }, () => { ph.textContent = IM[x.id] ? '' : '📷'; toast('Нет связи — попробуйте ещё раз'); }); };
          inp.onchange = () => { const file = inp.files && inp.files[0]; if (!file) return; loadCrop(file, { aspect: 1, round: true, max: 700, target: 120000 }).then(data => data ? setPh(data) : null).catch(() => { ph.textContent = '📷'; toast('Не получилось — попробуйте другое фото'); }); };
        });
      };
      paint();
      $('addF').onclick = () => { A.items.push({ id: uid(), name: '', fact: '' }); paint(); const c = $('fcBox').lastElementChild; c.scrollIntoView({ block: 'center', behavior: 'smooth' }); c.querySelector('input').focus({ preventScroll: true }); };
      $('done').onclick = () => { fr.child('ans').set(A).then(() => fr.child('done').set(TS())).then(() => { app.innerHTML = `<div class="lt" style="text-align:center;padding-top:14vh"><div style="font-size:64px">💌</div><h1>Спасибо!</h1><p>Факты у ведущего. Увидимся на празднике — гостей ждут сюрпризы.</p><p><a href="" style="color:var(--gdark);font-weight:800">Изменить</a></p></div>`; }, () => toast('Нет связи — попробуйте ещё раз')); };
    });
  });
}
function viewForm() {
  if (GAME === 'fact') return viewFactForm();
  document.body.classList.add('cream'); document.title = 'Анкета для пары';
  const fid = (P.get('f') || '').replace(/[^a-z0-9]/gi, '');
  const app = $('app');
  app.innerHTML = '<div class="lt"><div class="k">Анкета для пары</div><h1>Загружаем…</h1></div>';
  netReady.then(ok => {
    if (!ok || !fid) { app.innerHTML = '<div class="lt"><h1>Не получилось открыть анкету</h1><p>Проверьте интернет и обновите страницу.</p></div>'; return; }
    const fr = ref('forms/' + fid);
    fr.once('value').then(s => {
      const f = s.val();
      if (!f) { app.innerHTML = '<div class="lt"><h1>Анкета не найдена</h1><p>Попросите ведущего прислать ссылку ещё раз.</p></div>'; return; }
      applyAccent(f.accent);
      const A = f.ans || {}, IM = f.img || {};
      const [g0, b0] = coupleNames(f.couple);
      if (!A.gname) A.gname = g0; if (!A.bname) A.bname = b0;
      let t = null;
      const save = () => { clearTimeout(t); $('saved').textContent = 'Сохраняем…'; t = setTimeout(() => fr.child('ans').set(A).then(() => { $('saved').textContent = '✓ Сохранено'; }, () => { $('saved').textContent = 'Нет связи — попробуйте ещё раз'; }), 700); };
      const who = (id, v) => `<div class="who" data-who="${id}">${[['g', A.gname || 'Жених'], ['b', A.bname || 'Невеста'], ['both', 'Оба']].map(([k, n]) => `<button data-v="${k}" class="${v === k ? 'on' : ''}">${esc(n)}</button>`).join('')}</div>`;
      let h = `<div class="lt"><div class="pbrand">${BRAND()}</div><div class="k">Анкета для пары · ${esc(f.couple || '')}</div><h1>Расскажите о себе</h1><p>Из ваших ответов ведущий соберёт квиз для гостей. Отвечайте на то, что хочется, — остальное можно пропустить. Всё сохраняется автоматически.</p>` +
        `<div class="card"><div class="q">Как вас зовут?</div><div class="grid2"><input class="in2" data-name="gname" placeholder="Имя жениха" value="${esc(A.gname)}"><input class="in2" data-name="bname" placeholder="Имя невесты" value="${esc(A.bname)}"></div></div>`;
      FORM.forEach(it => {
        const v = A[it.id];
        if (it.type === 'choice') {
          const x = v || {}, w = x.w || [];
          h += `<div class="card"><div class="q">${esc(it.q)}</div>` +
            `<input class="in2" data-f="${it.id}" data-k="r" placeholder="Правильный ответ" value="${esc(x.r || '')}"><div class="small">Можно придумать неправильные варианты — гостям будет веселее:</div>` +
            `<div class="grid2" style="margin-top:8px">${[0, 1, 2].map(i => `<input class="in2" data-f="${it.id}" data-k="w${i}" placeholder="Неправильный ${i + 1}" value="${esc(w[i] || '')}">`).join('')}</div></div>`;
        } else if (it.type === 'who') h += `<div class="card"><div class="q">${esc(it.q)}</div>${who(it.id, v)}</div>`;
        else if (it.type === 'number') h += `<div class="card"><div class="q">${esc(it.q)}</div><input class="in2" data-f="${it.id}" data-k="n" inputmode="decimal" placeholder="Число${it.unit ? ', ' + it.unit : ''}" value="${esc(v == null ? '' : v)}"></div>`;
        else if (it.type === 'photo') h += `<div class="card"><div class="q">${esc(it.q)}</div><div class="ph2" data-ph="${it.id}" style="${IM[it.id] ? `background-image:url(${IM[it.id]})` : ''}">${IM[it.id] ? '' : '📷 Загрузить фото'}</div><input type="file" accept="image/*" hidden data-file="${it.id}"><div class="small">Станет вопросом «Кто на детском фото?»</div></div>`;
      });
      A.own = ownList(A); delete A.own1; delete A.own2;
      const ownCard = (x, n) => `<div class="card own" data-own="${n}"><div class="q oq"><span>Свой вопрос</span><button class="odel" data-odel="${n}" title="Убрать вопрос" aria-label="Убрать вопрос"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7M6.5 7l.8 12.2c.1.9.8 1.8 1.8 1.8h5.8c1 0 1.7-.9 1.8-1.8L17.5 7"/></svg></button></div>` +
        `<input class="in2" data-ok2="q" placeholder="Ваш вопрос" value="${esc(x.q || '')}" style="margin-bottom:8px"><input class="in2" data-ok2="r" placeholder="Правильный ответ" value="${esc(x.r || '')}">` +
        `<div class="grid2" style="margin-top:8px">${[0, 1, 2].map(i => `<input class="in2" data-ok2="w${i}" placeholder="Неправильный ${i + 1}" value="${esc((x.w || [])[i] || '')}">`).join('')}</div></div>`;
      h += `<div id="ownBox">${A.own.map(ownCard).join('')}</div><button class="addown" id="addOwn">+ Свой вопрос</button>`;
      h += `<div class="saved" id="saved"></div><button class="pbtn" id="done">Готово — отправить ведущему</button><p class="small" style="text-align:center;margin-top:10px">Ответы увидит только ведущий. Гости узнают их во время игры 😉</p></div>`;
      app.innerHTML = h;
      app.querySelectorAll('[data-name]').forEach(i => i.oninput = () => { A[i.dataset.name] = i.value.trim(); save(); });
      app.querySelectorAll('[data-f]').forEach(i => i.oninput = () => {
        const id = i.dataset.f, k = i.dataset.k;
        if (k === 'n') { A[id] = i.value.replace(',', '.').trim(); }
        else { const x = A[id] = A[id] || {}; if (k[0] === 'w') { x.w = x.w || []; x.w[+k[1]] = i.value; } else x[k] = i.value; }
        save();
      });
      const bindOwn = () => {
        app.querySelectorAll('.own').forEach(c => {
          const n = +c.dataset.own;
          c.querySelectorAll('[data-ok2]').forEach(i => i.oninput = () => { const x = A.own[n] = A.own[n] || {}, k = i.dataset.ok2; if (k[0] === 'w') { x.w = x.w || []; x.w[+k[1]] = i.value; } else x[k] = i.value; save(); });
          c.querySelector('[data-odel]').onclick = () => { A.own.splice(n, 1); paintOwn(); save(); };
        });
      };
      const paintOwn = () => { $('ownBox').innerHTML = A.own.map(ownCard).join(''); bindOwn(); };
      $('addOwn').onclick = () => { A.own.push({ q: '', r: '', w: [] }); paintOwn(); const c = $('ownBox').lastElementChild; c.scrollIntoView({ block: 'center', behavior: 'smooth' }); c.querySelector('input').focus({ preventScroll: true }); };
      bindOwn();
      app.querySelectorAll('[data-who]').forEach(d => d.querySelectorAll('button').forEach(b => b.onclick = () => { A[d.dataset.who] = b.dataset.v; d.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); save(); }));
      app.querySelectorAll('[data-ph]').forEach(d => {
        const inp = app.querySelector(`[data-file="${d.dataset.ph}"]`);
        d.onclick = () => inp.click();
        inp.onchange = () => { const file = inp.files && inp.files[0]; inp.value = ''; if (!file) return; loadCrop(file, { free: true, max: 900, target: 160000 }).then(data => { if (!data) return; d.textContent = 'Загружаем…'; return fr.child('img/' + d.dataset.ph).set(data).then(() => { d.textContent = ''; d.style.backgroundImage = `url(${data})`; }); }).catch(() => { d.textContent = 'Не получилось — попробуйте другое фото'; }); };
      });
      $('done').onclick = () => { fr.child('ans').set(A).then(() => fr.child('done').set(TS())).then(() => { app.innerHTML = `<div class="lt" style="text-align:center;padding-top:14vh"><div style="font-size:64px">💌</div><h1>Спасибо!</h1><p>Ответы у ведущего. Увидимся на празднике — гостей ждёт квиз о вас.</p><p><a href="" style="color:var(--gdark);font-weight:800">Изменить ответы</a></p></div>`; }, () => toast('Нет связи — попробуйте ещё раз')); };
    });
  });
}

/* ================= итоги для пары ================= */
function viewResult() {
  document.body.classList.add('cream'); document.title = 'Итоги квиза';
  const rid = (P.get('r') || '').replace(/[^a-z0-9]/gi, ''), app = $('app');
  app.innerHTML = '<div class="lt"><h1>Загружаем итоги…</h1></div>';
  netReady.then(ok => {
    if (!ok || !rid) { app.innerHTML = '<div class="lt"><h1>Не получилось открыть итоги</h1><p>Проверьте интернет и обновите страницу.</p></div>'; return; }
    ref('res/' + rid).once('value').then(s => {
      const r = s.val();
      if (!r) { app.innerHTML = '<div class="lt"><h1>Итоги не найдены</h1></div>'; return; }
      applyAccent(r.accent);
      document.title = 'Итоги квиза · ' + (r.couple || '');
      const w = r.winners || [], pod = [w[1], w[0], w[2]], medal = ['🥈', '🥇', '🥉'], cls = ['', 'p1', ''];
      const date = r.t ? new Date(r.t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      let h = `<div class="lt rs"><div class="pbrand">${BRAND()}</div><div class="hero">${r.photo ? `<div class="cp" style="background-image:url(${r.photo})"></div>` : ''}<div><div class="k">${esc(r.title || 'Квиз о паре')} · ${esc(date)}</div><h1>${esc(r.couple || 'Итоги квиза')}</h1><p style="margin:0">Играли ${r.n} ${plural(r.n, r.play === 'teams' ? 'команда' : 'гость', r.play === 'teams' ? 'команды' : 'гостя', r.play === 'teams' ? 'команд' : 'гостей')}</p></div></div>`;
      h += `<h2>Лучше всех знают пару</h2><div class="pod2">${pod.map((p, i) => p ? `<div class="${cls[i]}"><i>${medal[i]}</i><b>${esc(p.name)}</b><small>${nums(p.score)} очков</small></div>` : '<span></span>').join('')}</div>`;
      if (r.tables && r.tables.length) h += `<h2>Лучшие столы</h2>${r.tables.map((t, i) => `<div class="card qq"><b>${['🥇', '🥈', '🥉'][i]} ${esc(t.name)}</b><span class="small">${nums(t.score)} в среднем · ${t.n} ${plural(t.n, 'гость', 'гостя', 'гостей')}</span></div>`).join('')}`;
      if (r.noms && r.noms.length) h += `<h2>Номинации</h2><div class="noms2">${r.noms.map(x => `<div><i>${x[0]}</i><small>${esc(x[1])}</small><b>${esc(x[2])}</b></div>`).join('')}</div>`;
      h += '<h2>Как гости знают вас</h2>';
      (r.qs || []).forEach(q => {
        if (q.type === 'number') {
          h += `<div class="card"><div class="q">${esc(q.text)}</div><div class="qq"><span>Правильно: <b>${numTxt(q.num, q.num2)} ${esc(q.unit || '')}</b></span><span class="small">в среднем гости ответили ${q.avg == null ? '—' : nums(q.avg)}</span></div>${q.best ? `<div class="small" style="margin-top:6px">Ближе всех — ${esc(q.best.name)} (${nums(q.best.v)})</div>` : ''}</div>`;
          return;
        }
        const tot = q.tot || 0, okc = (q.ok || []).reduce((s, i) => s + ((q.cnt || [])[i] || 0), 0), pct = tot ? Math.round(okc / tot * 100) : 0;
        const okt = (q.ok || []).map(i => (q.opts || [])[i]).filter(Boolean).join(', ');
        let wrongTop = null; (q.cnt || []).forEach((c, i) => { if ((q.ok || []).indexOf(i) < 0 && c && (!wrongTop || c > wrongTop.c)) wrongTop = { c, t: q.opts[i] }; });
        let extra = '';
        if (q.type === 'couple' && q.cpl) { const t = i => i >= 0 ? (q.opts[i] || '—') : '—'; const [gn, bn] = coupleNames(r.couple); extra = `<div class="small">Ответ пары: ${esc(gn)} — ${esc(t(q.cpl.groom))}, ${esc(bn)} — ${esc(t(q.cpl.bride))}${q.cpl.groom >= 0 && q.cpl.groom === q.cpl.bride ? ' 💞' : ''}</div>`; }
        h += `<div class="card"><div class="qq"><b>${esc(q.text)}</b><span class="small">${pct}% угадали</span></div><div class="bar2"><i style="width:${pct}%"></i></div><div class="small">Ответ: ${esc(okt || '—')}${wrongTop && tot ? ` · чаще ошибались: «${esc(wrongTop.t)}» (${Math.round(wrongTop.c / tot * 100)}%)` : ''}</div>${extra}</div>`;
      });
      h += `<div class="acts"><button id="rsPdf">Сохранить PDF</button><button class="gh" id="rsShare">Поделиться</button></div><div class="foot2">Beloglazov Event · ведущий Павел Белоглазов · pabeloglazov.com</div></div>`;
      app.innerHTML = h;
      $('rsPdf').onclick = () => window.print();
      $('rsShare').onclick = () => { const u = location.href; if (navigator.share) navigator.share({ title: document.title, url: u }).catch(() => {}); else copy(u); };
    }, () => { app.innerHTML = '<div class="lt"><h1>Не получилось открыть итоги</h1></div>'; });
  });
}
