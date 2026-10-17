
/* ================= ведущий: редактор ================= */
const ICON = {
  up: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7M6.5 7l.8 12.2c.1.9.8 1.8 1.8 1.8h5.8c1 0 1.7-.9 1.8-1.8L17.5 7"/></svg>',
  grip: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
  cam: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'
};
function tip(text) { return `<span class="tip" tabindex="0" role="button" aria-label="Подсказка"><i>i</i><span class="tipb">${text}</span></span>`; }
const QTIP = {
  choice: 'Нажмите на букву, чтобы отметить правильный ответ — правильных может быть несколько.',
  photo: 'Фото на экране, гости выбирают ответ. Можно размыть фото — оно проясняется по таймеру, — и добавить фото-ответ, который откроется вместе с правильным вариантом.',
  couple: 'Правильный ответ даст пара прямо во время игры — со своих телефонов или через ваш пульт.',
  number: 'Гости вводят число. Точный ответ — 1200 очков, чем ближе — тем больше.'
};
function qTip(q) { return tip(QTIP[q.type] + '<br><br>Порядок вопросов и вариантов меняйте, перетаскивая за ≡.<br>Фото к вопросу можно вставить Ctrl+V или перетащить на карточку.<br>×2 — двойные очки за вопрос.'); }
function placeTip(t) {
  const b = t.querySelector('.tipb'), r = t.getBoundingClientRect(), vw = document.documentElement.clientWidth, w = Math.min(280, vw - 24);
  b.style.width = w + 'px'; b.style.left = Math.max(12, Math.min(r.left - 6, vw - w - 12)) + 'px'; b.style.top = (r.bottom + 8) + 'px';
  requestAnimationFrame(() => { const h = b.offsetHeight; if (h && r.bottom + 8 + h > innerHeight - 8 && r.top - 8 - h > 8) b.style.top = (r.top - 8 - h) + 'px'; });
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('.tip');
  document.querySelectorAll('.tip.on').forEach(x => { if (x !== t) x.classList.remove('on'); });
  if (t) { t.classList.toggle('on'); placeTip(t); }
});
document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('.tip'); if (t) placeTip(t); });
window.addEventListener('scroll', () => document.querySelectorAll('.tip.on').forEach(x => x.classList.remove('on')), { passive: true });
function accTag() {
  if (!ACC.token) return '<span class="tag">Демо</span><button class="btn gold sm" id="bLogin">Войти</button>';
  if (ACC.loading && !ACC.info) return '<span class="tag">…</span>';
  if (!ACC.info) return `<span class="tag">Демо</span><button class="btn ghost sm" id="bLogin" title="${esc(ACC.err)}">Войти заново</button>`;
  const i = ACC.info;
  const tn = TIER[i.tier] ? TIER[i.tier].n : '';
  const t = i.pro ? `<span class="tag pro">${tn || 'Подписка'}</span>` : i.unlocked ? `<span class="tag pro">${tn ? tn + ' · ' : ''}до ${new Date(i.eventUntil).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>` : '<span class="tag">Демо</span>';
  if (window.PBAcct) return PBAcct.html(i, `<button id="bMine">${GAME === 'fact' ? 'Мои игры «Интересный факт»' : 'Мои квизы'}</button>`);
  return `<span class="em">${esc(i.email)}</span>${t}<button class="btn ghost sm" id="bMine">Мои квизы</button>`;
}
function renderTop() { const a = $('acc'); if (!a) return; a.innerHTML = accTag(); if ($('bLogin')) $('bLogin').onclick = goLogin; if ($('bMine')) $('bMine').onclick = () => { const m = a.querySelector('.pba .am'); if (m) m.hidden = true; openMine(); }; if (window.PBAcct) PBAcct.bind(a); }
function demoNote() {
  if (unlocked()) return '';
  return `<div class="notice"><span>🎈</span><span><b>Демо-режим:</b> всё работает, но в игру войдут максимум ${DEMO_MAX} телефонов гостей. Полный доступ — любой тариф: подписка или одно мероприятие.</span><span class="sp"></span>${ACC.info ? '' : '<button class="btn ghost sm" id="bLogin2">Войти</button>'}<a class="btn gold sm" href="../#pricing">Тарифы</a></div>`;
}
let edBuilt = false;
function renderEditor() {
  edBuilt = true; liveBuilt = false;
  applyAccent(CFG.accent);
  const s = CFG.s;
  $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND(GAME === 'fact' ? 'Интересный факт · редактор' : 'Квиз · редактор')}</a><span class="sp"></span><span class="muted" style="font-size:12px" id="syncSt"></span><div class="acc" id="acc"></div></div></div>` +
    (GAME === 'fact' ? `<div class="ed"><div class="k">Новая игра</div><h1>Интересный факт</h1><p class="lead">Пара присылает имена гостей и интересные факты о них. Вы показываете факты на большом экране: зал угадывает, о ком речь, — и открываются фото и имя. Можно просто показывать, а можно устроить голосование с телефонов.</p>` : `<div class="ed"><div class="k">Новая игра</div><h1>Соберите квиз за 5 минут</h1><p class="lead">Впишите вопросы, отметьте правильные ответы тапом по букве — и запускайте. Гости входят по QR-коду или коду игры.</p>`) + `<div id="demoN">${demoNote()}</div>` +
    `<div class="panel"><div class="row2"><div class="fld"><label>Название игры</label><input class="inp" id="fTitle" maxlength="60"></div><div class="fld"><label id="lCouple">Имена пары</label><input class="inp" id="fCouple" maxlength="60" placeholder="Максим и Алина"></div></div></div>` +
    (GAME === 'fact' ? `<div class="panel"><h3>Как показываем</h3><div class="modes" id="shows"></div><div id="showTune"></div></div>` : '') +
    (GAME === 'fact' ? '' : `<div class="panel"><h3>Формат</h3><div class="modes" id="modes"></div><div class="lbl">Как играем</div><div class="modes" id="plays"></div><div id="tblRow"></div>` +
    `<details class="tune"><summary><span>⚙️</span><span>Тонкая настройка<small>время, очки, звук, боты для проверки</small></span><span class="chev">▾</span></summary><div class="tgrid">` +
    `<div class="rng"><span>Время на вопрос</span><input type="range" id="sTime" min="10" max="90" step="5"><b id="sTimeV"></b></div>` +
    `<div class="rng"><span>Лидеры каждые</span><input type="range" id="sEvery" min="1" max="10"><b id="sEveryV"></b></div>` +
    `<label class="sw">Очки за скорость<input type="checkbox" id="sSpeed"></label><label class="sw">Можно менять ответ<input type="checkbox" id="sChange"></label>` +
    `<label class="sw">Последний вопрос ×2<input type="checkbox" id="sX2"></label><label class="sw">Звуки на экране<input type="checkbox" id="sSound"></label>` +
    `<label class="sw">Гости-боты для проверки<input type="checkbox" id="sBots"></label></div></details></div>`) +
    `<div class="panel"><h3>Оформление</h3><div class="lbl" style="margin-top:0">Основной цвет</div><div class="swatches" id="sws"></div>` +
    `<div class="lbl">Фото пары на заставку ${tip('Появится на экране, пока гости заходят.')}<span id="phLk"></span></div><div class="photoSlot"><div class="ph" id="cPh" role="button" tabindex="0" title="Загрузить фото"></div><div><button class="btn ghost sm" id="cPhB">Загрузить фото</button> <button class="btn ghost sm" id="cPhD" style="display:none">Убрать</button></div><input type="file" accept="image/*" hidden id="cPhF"></div>` +
    `<div class="lbl">Wi‑Fi для гостей (по желанию) ${tip('На экране появится QR-код для подключения к Wi‑Fi — выручает, если в зале слабая связь.')}</div><div class="row2"><input class="inp" id="wS" placeholder="Название сети" maxlength="40"><input class="inp" id="wP" placeholder="Пароль" maxlength="60"></div></div>` +
    `<div class="panel" id="formP"></div>` +
    (GAME === 'fact' ? `<div class="qhead"><h2>Факты о гостях</h2><span class="muted" id="qCount"></span></div><div class="hint tipline" style="margin:-4px 0 12px">Имя гостя и факт о нём. Фото — по желанию: появится на экране, когда откроется ответ.</div><div id="qList"></div><div class="addrow one"><button class="btn ghost" id="addFact">+ Факт о госте</button></div></div>` :
    `<div class="qhead"><h2>Вопросы</h2><span class="muted" id="qCount"></span><span class="sp"></span><button class="btn ghost sm" id="bImport">Вставить списком</button></div><div id="qList"></div>` +
    `<div class="addrow"><button class="btn ghost" data-add="choice">+ Вопрос</button><button class="btn ghost" data-add="photo">+ Фото-вопрос</button><button class="btn ghost" data-add="couple">+ Угадай ответ пары${lockTag('couple')}</button><button class="btn ghost" data-add="number">+ Ответ числом</button></div></div>`) +
    `<div class="bar"><div class="in"><div style="min-width:0;flex:1"><div style="font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="bSum"></div><div class="muted" style="font-size:12px" id="bSub"></div></div><button class="btn gold" id="bStart">Запустить ▶</button></div></div>`;
  renderTop(); paintSync();
  if ($('bLogin2')) $('bLogin2').onclick = goLogin;
  $('fTitle').value = CFG.title; $('fCouple').value = CFG.couple; paintWed();
  $('fTitle').oninput = e => { CFG.title = e.target.value; STORE.save(); sum(); };
  $('fCouple').oninput = e => { CFG.couple = e.target.value; STORE.save(); };
  if (GAME === 'fact') paintShows(); else { paintModes(); paintTune(); } paintDesign(); paintForm(); paintQs(); sum();
  document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => b.dataset.add === 'couple' && !can('couple') ? upsell('couple') : addQ(b.dataset.add));
  if ($('bImport')) $('bImport').onclick = openImport;
  if ($('addFact')) $('addFact').onclick = () => { CFG.facts.push(normFact({})); CFG.sampleF = 0; STORE.save(); paintFacts(); sum(); const c = $('qList').lastElementChild; if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.querySelector('.fname').focus({ preventScroll: true }); } };
  $('bStart').onclick = start;
}
function addQ(type) {
  const [g, b] = coupleNames(CFG.couple);
  const q = normQ({ type, opts: type === 'couple' ? [O(g), O(b)] : type === 'number' ? [] : [O(), O(), O(), O()], ok: type === 'choice' || type === 'photo' ? [0] : [], text: type === 'photo' ? 'Кто на фото?' : '' });
  CFG.qs.push(q); STORE.save(); paintQs(); sum();
  const ts = document.querySelectorAll('.qcard textarea'), t = ts[ts.length - 1];
  if (t) { t.focus(); t.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}
/* Не свадьба (паб-квиз, корпоратив, вечеринка) — без «пары»: поле становится подзаголовком, тип «Угадай ответ пары» скрыт */
function paintWed() {
  const wed = CFG.mode === 'wedding' || CFG.qs.some(q => q.type === 'couple');
  document.body.classList.toggle('nowed', !wed);
  if (!document.getElementById('nowedCss')) { const s = document.createElement('style'); s.id = 'nowedCss'; s.textContent = 'body.nowed [data-add=couple],body.nowed .qcard .seg [data-t=couple]{display:none!important}'; document.head.appendChild(s); }
  const l = $('lCouple'), f = $('fCouple'); if (l) l.textContent = wed ? 'Имена пары' : 'Подзаголовок'; if (f) f.placeholder = wed ? 'Максим и Алина' : 'Например: TEENS PARTY';
}
function paintModes() {
  $('modes').innerHTML = Object.keys(MODES).map(k => { const m = MODES[k]; return `<button class="mode${CFG.mode === k ? ' on' : ''}" data-m="${k}"><i>${m.ic}</i><b>${m.t}</b><span>${m.d}</span></button>`; }).join('');
  $('plays').innerHTML = Object.keys(PLAYS).map(k => { const m = PLAYS[k]; return `<button class="mode${CFG.s.play === k ? ' on' : ''}${FEAT[k] && !can(k) ? ' locked' : ''}" data-p="${k}"><i>${m.ic}</i><b>${m.t}${FEAT[k] ? lockTag(k) : ''}</b><span>${m.d}</span></button>`; }).join('');
  $('tblRow').innerHTML = CFG.s.play === 'tables' ? `<div class="rng" style="margin-top:12px"><span>Сколько столов в зале</span><input type="range" id="sTbl" min="2" max="40"><b id="sTblV"></b></div>` : CFG.s.play === 'teams' ? `<div class="hint tipline">Как работают команды ${tip('Команды сами придумывают название при входе. Перед игрой их можно представить залу по очереди.')}</div>` : '';
  if ($('sTbl')) { $('sTbl').value = CFG.s.tables; $('sTblV').textContent = CFG.s.tables; $('sTbl').oninput = e => { CFG.s.tables = +e.target.value; $('sTblV').textContent = CFG.s.tables; STORE.save(); }; }
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { CFG.mode = b.dataset.m; Object.assign(CFG.s, MODES[CFG.mode].s); STORE.save(); paintModes(); paintWed(); paintTune(); sum(); });
  document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (FEAT[b.dataset.p] && !can(b.dataset.p)) return upsell(b.dataset.p); CFG.s.play = b.dataset.p; STORE.save(); paintModes(); sum(); });
}
function paintShows() {
  $('shows').innerHTML = Object.keys(SHOWS).map(k => { const m = SHOWS[k]; return `<button class="mode${CFG.s.show === k ? ' on' : ''}" data-sh="${k}"><i>${m.ic}</i><b>${m.t}</b><span>${m.d}</span></button>`; }).join('');
  const st = CFG.s.show === 'stage';
  $('showTune').innerHTML = `<div class="hint tipline">${st ? 'Телефоны гостям не нужны: вы ведёте показ с ноутбука или с телефона-пульта, зал угадывает вслух.' : 'Гости входят по QR-коду и выбирают на телефонах, о ком факт. Таблица лидеров — только в финале.'}</div>` +
    (st ? '' : `<div class="rng" style="margin-top:12px"><span>Время на ответ</span><input type="range" id="sTime" min="10" max="60" step="5"><b id="sTimeV"></b></div>`) +
    `<label class="sw" style="margin-top:10px">Звуки на экране<input type="checkbox" id="sSound"></label>`;
  if ($('sTime')) { $('sTime').value = CFG.s.time; $('sTimeV').textContent = CFG.s.time + ' с'; $('sTime').oninput = e => { CFG.s.time = +e.target.value; $('sTimeV').textContent = CFG.s.time + ' с'; STORE.save(); sum(); }; }
  $('sSound').checked = CFG.s.sound !== false; $('sSound').onchange = e => { CFG.s.sound = e.target.checked; STORE.save(); };
  document.querySelectorAll('[data-sh]').forEach(b => b.onclick = () => { CFG.s.show = b.dataset.sh; STORE.save(); paintShows(); sum(); });
}
function paintTune() {
  const s = CFG.s;
  $('sTime').value = s.time; $('sTimeV').textContent = s.time + ' с';
  $('sEvery').value = s.every; $('sEveryV').textContent = s.every;
  $('sSpeed').checked = s.speed; $('sChange').checked = s.change; $('sX2').checked = s.lastX2; $('sSound').checked = s.sound; $('sBots').checked = CFG.bots;
  $('sTime').oninput = e => { s.time = +e.target.value; $('sTimeV').textContent = s.time + ' с'; STORE.save(); sum(); };
  $('sEvery').oninput = e => { s.every = +e.target.value; $('sEveryV').textContent = s.every; STORE.save(); };
  [['sSpeed', 'speed'], ['sChange', 'change'], ['sX2', 'lastX2'], ['sSound', 'sound']].forEach(([id, k]) => $(id).onchange = e => { s[k] = e.target.checked; STORE.save(); });
  $('sBots').onchange = e => { CFG.bots = e.target.checked; STORE.save(); sum(); };
}
function paintDesign() {
  const cur = validColor(CFG.accent);
  $('sws').innerHTML = ACCENTS.map(c => `<button data-c="${c}" style="background:${c}" class="${c === cur ? 'on' : ''}" title="${c}"></button>`).join('') + `<label>Свой<input type="color" id="cCust" value="${cur}"></label>` + (can('color') ? '' : lockTag('color'));
  const set = c => { if (validColor(c) !== ACCENTS[0] && !can('color')) { upsell('color'); $('cCust').value = cur; return; } CFG.accent = validColor(c); applyAccent(CFG.accent); STORE.save(); document.querySelectorAll('#sws [data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === CFG.accent)); };
  document.querySelectorAll('#sws [data-c]').forEach(b => b.onclick = () => { set(b.dataset.c); $('cCust').value = b.dataset.c; });
  $('cCust').oninput = e => set(e.target.value);
  const ph = () => { const d = IMG.get(CFG.photo); $('cPh').style.backgroundImage = d ? `url(${d})` : ''; $('cPh').textContent = d ? '' : '💍'; $('cPhD').style.display = d ? '' : 'none'; };
  ph(); if ($('phLk')) $('phLk').innerHTML = lockTag('photo');
  $('cPhB').onclick = () => can('photo') ? $('cPhF').click() : upsell('photo');
  $('cPh').onclick = () => { if (!can('photo')) return upsell('photo'); const d = IMG.get(CFG.photo); if (!d) return $('cPhF').click(); cropImage(d, { aspect: 1, round: true, max: 1000, target: 220000, replace: true }).then(r => { if (r === 'replace') $('cPhF').click(); else if (r) { CFG.photo = IMG.put(r); STORE.upImg(CFG.photo); STORE.save(); ph(); } }); };
  $('cPhD').onclick = () => { CFG.photo = ''; STORE.save(); ph(); };
  $('cPhF').onchange = e => { const f = e.target.files && e.target.files[0]; if (!f) return; loadCrop(f, { aspect: 1, round: true, max: 1000, target: 220000 }).then(d => { if (!d) return; CFG.photo = IMG.put(d); STORE.upImg(CFG.photo); STORE.save(); ph(); }, () => toast('Не получилось открыть фото')); e.target.value = ''; };
  $('wS').value = CFG.wifi.ssid || ''; $('wP').value = CFG.wifi.pass || '';
  $('wS').oninput = e => { CFG.wifi.ssid = e.target.value; STORE.save(); };
  $('wP').oninput = e => { CFG.wifi.pass = e.target.value; STORE.save(); };
}
let formSub = null;
function paintForm() {
  if (GAME === 'fact') return paintFactForm();
  const p = $('formP'); if (!p) return;
  if (formSub) { formSub(); formSub = null; }
  let h = '<h3>Анкета для пары</h3><div class="sub">Отправьте паре ссылку — они ответят на вопросы о себе, а квиз соберётся из их ответов.</div>';
  if (!NET.ok) { p.innerHTML = h + '<div class="hint">Нужен интернет — подключаемся…</div>'; return; }
  if (!CFG.form) { p.innerHTML = h + '<button class="btn gold sm" id="fNew">Создать анкету</button>' + lockTag('form'); $('fNew').onclick = () => can('form') ? createForm() : upsell('form'); return; }
  p.innerHTML = h + `<div class="linkrow"><code>${esc(formLink(CFG.form))}</code><button class="btn ghost sm" id="fCopy">Копировать</button><button class="btn ghost sm" id="fQr">QR</button></div><div class="hint" id="fSt">Проверяем ответы…</div><div class="links" style="margin-top:10px"><button class="btn gold sm" id="fImp" disabled>Добавить вопросы из анкеты</button><button class="btn ghost sm" id="fDel">Новая анкета</button></div>`;
  $('fCopy').onclick = () => copy(formLink(CFG.form));
  $('fQr').onclick = () => modal(`<h3>Анкета для пары</h3><p class="muted">Пусть пара отсканирует код или откроет ссылку.</p><div class="qrbox" id="mq"></div><button class="btn ghost" data-close style="width:100%">Закрыть</button>`, b => qr(b.querySelector('#mq'), formLink(CFG.form), 400));
  $('fDel').onclick = () => { if (confirmTwice($('fDel'), 'Точно новую?')) { CFG.form = ''; STORE.save(); paintForm(); } };
  const r = ref('forms/' + CFG.form), h2 = r.on('value', s => {
    const f = s.val(), st = $('fSt'), imp = $('fImp'); if (!st) return;
    if (!f) { st.textContent = 'Анкета не найдена'; return; }
    const qs = formToQsPreview(f);
    st.innerHTML = f.done ? `✓ Пара заполнила анкету · готово вопросов: <b>${qs}</b>` : qs ? `Пара заполняет анкету… готово вопросов: <b>${qs}</b>` : 'Пара ещё не открывала анкету';
    imp.disabled = !qs;
    imp.onclick = () => { const add = formToQs(f); CFG.qs = CFG.qs.filter(q => (q.text || '').trim() || q.img).concat(add); STORE.save(); paintQs(); sum(); toast('Добавлено вопросов: ' + add.length); $('qList').lastElementChild && $('qList').children[Math.max(0, CFG.qs.length - add.length)].scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  });
  formSub = () => r.off('value', h2);
}
function formToQsPreview(f) { const a = f.ans || {}, img = f.img || {}; return FORM.filter(it => { const v = a[it.id]; if (it.type === 'photo') return !!img[it.id]; if (it.type === 'who') return !!v; if (it.type === 'number') return v !== undefined && v !== '' && isFinite(+v); return v && (v.r || '').trim(); }).length + ownList(a).filter(ownOk).length; }

/* ================= «Интересный факт»: редактор фактов и анкета для пары ================= */
const TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7M6.5 7l.8 12.2c.1.9.8 1.8 1.8 1.8h5.8c1 0 1.7-.9 1.8-1.8L17.5 7"/></svg>';
function factCard(f, i) {
  const d = f.img && IMG.get(f.img);
  return `<div class="fcard" data-i="${i}"><div class="fav${d ? ' has' : ''}" data-fph title="${d ? 'Заменить фото' : 'Добавить фото (по желанию)'}" style="${d ? `background-image:url(${d})` : ''}">${d ? '' : ICON.cam}</div>` +
    `<div class="fmain"><div class="frow"><span class="fnum">${i + 1}</span><input class="inp fname" maxlength="40" placeholder="Имя гостя" value="${esc(f.name)}">` +
    (d ? `<button class="fx" data-fdelph title="Убрать фото">Без фото</button>` : '') + `<button class="fdel" data-fdel title="Удалить факт" aria-label="Удалить факт">${TRASH}</button></div>` +
    `<textarea class="inp ftext" rows="2" maxlength="220" placeholder="Интересный факт — например, «прыгал с парашютом на 30-летие»">${esc(f.fact)}</textarea></div><input type="file" accept="image/*" hidden></div>`;
}
function paintFacts() {
  const box = $('qList'); if (!box) return;
  box.innerHTML = CFG.facts.map(factCard).join('');
  box.querySelectorAll('.fcard').forEach(c => {
    const i = +c.dataset.i, f = CFG.facts[i], inp = c.querySelector('input[type=file]');
    c.querySelector('.fname').oninput = e => { f.name = e.target.value; CFG.sampleF = 0; STORE.save(); sum(); };
    c.querySelector('.ftext').oninput = e => { f.fact = e.target.value; CFG.sampleF = 0; STORE.save(); sum(); };
    c.querySelector('[data-fdel]').onclick = () => { CFG.facts.splice(i, 1); STORE.save(); paintFacts(); sum(); };
    const dp = c.querySelector('[data-fdelph]'); if (dp) dp.onclick = () => { f.img = ''; STORE.save(); paintFacts(); };
    c.querySelector('[data-fph]').onclick = () => { const d = f.img && IMG.get(f.img); if (!d) { inp.value = ''; inp.click(); return; } cropImage(d, Object.assign({ replace: true }, AVCROP)).then(r => { if (r === 'replace') { inp.value = ''; inp.click(); } else if (r) { f.img = IMG.put(r); STORE.upImg(f.img); STORE.save(); paintFacts(); } }); };
    inp.onchange = () => { const file = inp.files && inp.files[0]; if (!file) return; loadCrop(file, AVCROP).then(d => { if (!d) return; f.img = IMG.put(d); STORE.upImg(f.img); STORE.save(); paintFacts(); }, () => toast('Не получилось открыть фото')); };
  });
  sum();
}
const factItems = a => (Array.isArray(a && a.items) ? a.items : Object.values((a && a.items) || {})).filter(Boolean);
function paintFactForm() {
  const p = $('formP'); if (!p) return;
  if (formSub) { formSub(); formSub = null; }
  let h = '<h3>Анкета для пары</h3><div class="sub">Отправьте паре ссылку — они впишут гостей и интересные факты о них, при желании добавят фото. Факты появятся здесь одной кнопкой.</div>';
  if (!NET.ok) { p.innerHTML = h + '<div class="hint">Нужен интернет — подключаемся…</div>'; return; }
  if (!CFG.form) { p.innerHTML = h + '<button class="btn gold sm" id="fNew">Создать анкету</button>'; $('fNew').onclick = createForm; return; }
  p.innerHTML = h + `<div class="linkrow"><code>${esc(formLink(CFG.form))}</code><button class="btn ghost sm" id="fCopy">Копировать</button><button class="btn ghost sm" id="fQr">QR</button></div><div class="hint" id="fSt">Проверяем ответы…</div><div class="links" style="margin-top:10px"><button class="btn gold sm" id="fImp" disabled>Добавить факты из анкеты</button><button class="btn ghost sm" id="fDel">Новая анкета</button></div>`;
  $('fCopy').onclick = () => copy(formLink(CFG.form));
  $('fQr').onclick = () => modal(`<h3>Анкета для пары</h3><p class="muted">Пусть пара отсканирует код или откроет ссылку.</p><div class="qrbox" id="mq"></div><button class="btn ghost" data-close style="width:100%">Закрыть</button>`, b => qr(b.querySelector('#mq'), formLink(CFG.form), 400));
  $('fDel').onclick = () => { if (confirmTwice($('fDel'), 'Точно новую?')) { CFG.form = ''; STORE.save(); paintForm(); } };
  const r = ref('forms/' + CFG.form), h2 = r.on('value', s => {
    const f = s.val(), st = $('fSt'), imp = $('fImp'); if (!st) return;
    if (!f) { st.textContent = 'Анкета не найдена'; return; }
    const items = factItems(f.ans).filter(x => (x.name || '').trim() && (x.fact || '').trim()), n = items.length;
    st.innerHTML = f.done ? `✓ Пара заполнила анкету · фактов: <b>${n}</b>` : n ? `Пара заполняет анкету… фактов: <b>${n}</b>` : 'Пара ещё не открывала анкету';
    imp.disabled = !n;
    imp.onclick = () => {
      if (CFG.sampleF) { CFG.facts = []; CFG.sampleF = 0; }
      let add = 0;
      items.forEach(x => {
        const ph = f.img && f.img[x.id], cur = CFG.facts.find(y => y.id === x.id);
        const img = ph ? IMG.put(ph) : '';
        if (img) STORE.upImg(img);
        if (cur) { cur.name = x.name.trim(); cur.fact = x.fact.trim(); if (img) cur.img = img; }
        else { CFG.facts.push(normFact({ id: x.id, name: x.name.trim(), fact: x.fact.trim(), img })); add++; }
      });
      STORE.save(); paintFacts(); sum(); toast(add ? 'Добавлено фактов: ' + add : 'Факты обновлены');
    };
  });
  formSub = () => r.off('value', h2);
}
function createForm() {
  const fid = uid(16);
  ref('forms/' + fid).set({ host: NET.uid, couple: CFG.couple || '', accent: CFG.accent, t: TS() }).then(() => { CFG.form = fid; STORE.save(); paintForm(); }, () => toast('Не получилось — проверьте интернет'));
}
function confirmTwice(btn, label) { if (btn.dataset.sure) return true; const old = btn.textContent; btn.dataset.sure = 1; btn.textContent = label; setTimeout(() => { if (btn) { delete btn.dataset.sure; btn.textContent = old; } }, 3000); return false; }
function cardHtml(q, i) {
  const issue = qIssue(q), n = CFG.qs.length;
  let body = `<textarea class="inp" rows="2" placeholder="${q.type === 'couple' ? 'Например: «Кто первым написал сообщение?»' : 'Текст вопроса'}" data-f="text">${esc(q.text)}</textarea><div class="qimg">${imgSlot(q)}</div><input type="file" accept="image/*" class="qfile" hidden>`;
  if (q.type === 'number') body += `<div class="nmode"><button data-nm="0" class="${q.rng ? '' : 'on'}">Точное число</button><button data-nm="1" class="${q.rng ? 'on' : ''}">Диапазон</button></div>` + (q.rng ?
    `<div class="numrow rng"><span class="nl">от</span><input class="inp" data-f="num" inputmode="decimal" placeholder="10" value="${esc(q.num == null ? '' : q.num)}"><span class="nl">до</span><input class="inp" data-f="num2" inputmode="decimal" placeholder="15" value="${esc(q.num2 == null ? '' : q.num2)}"><input class="inp" data-f="unit" placeholder="ед." maxlength="16" value="${esc(q.unit || '')}"></div><div class="hint tipline">Любой ответ внутри диапазона — полные 1000 очков. Чем дальше за его границами — тем меньше.</div>` :
    `<div class="numrow"><input class="inp" data-f="num" inputmode="decimal" placeholder="Правильное число" value="${esc(q.num == null ? '' : q.num)}"><input class="inp" data-f="unit" placeholder="ед., напр. мес." maxlength="16" value="${esc(q.unit || '')}"></div>`);
  else {
    body += '<div class="opts">' + q.opts.map((o, j) => `<div class="opt${isCh(q) && q.ok.indexOf(j) >= 0 ? ' ok' : ''}" data-j="${j}"><span class="grip og" title="Перетащить">${ICON.grip}</span><button class="ch ${CL[j]}" data-ok="${j}" title="${isCh(q) ? 'Отметить правильным' : ''}">${L[j]}</button>` +
      `<input data-o="${j}" maxlength="80" placeholder="Вариант ${L[j]}" value="${esc(o.t)}">` +
      (q.opts.length > 2 ? `<button class="ic" data-del="${j}" title="Удалить вариант">${ICON.trash}</button>` : '') + '</div>').join('') + '</div>' +
      (q.opts.length < 4 ? '<button class="btn ghost sm" data-addopt style="margin-top:8px">+ Вариант</button>' : '');
  }
  if (q.type === 'photo') body += `<div class="pqx"><div class="lbl">Фото-ответ <span class="muted">· по желанию</span> ${tip('Откроется на экране вместе с правильным ответом — например, то же фото целиком или фото героя сейчас.')}</div><div class="qimg aimg">${aimgSlot(q)}</div><input type="file" accept="image/*" class="afile" hidden>` +
    `<label class="sw">Размыть фото — проясняется по таймеру<input type="checkbox" data-blur${q.blur ? ' checked' : ''}></label></div>`;
  if (q.type !== 'photo') body += mdOk(q.qm) || mdOk(q.am) || q._mo ? `<div class="mdx"><div class="lbl">Видео или аудио ${tip('Ссылка YouTube работает везде. Файл (до 80 МБ) хранится на этом устройстве — показывайте экран с этого же ноутбука. Фрагмент: с какой и по какую секунду играть.')}</div><div class="mdg">${mdSlot(q, 'qm', 'В вопросе')}${mdSlot(q, 'am', 'В ответе')}</div></div>` : '<button class="btn ghost sm mdadd" data-mdopen>🎬 Видео или аудио</button>';
  if (issue) body += `<div class="hint w">⚠ ${esc(issue)}</div>`;
  return `<div class="qcard${issue ? ' warn' : ''}" data-i="${i}"><div class="qtop"><span class="grip qg" title="Перетащить вопрос">${ICON.grip}</span><span class="qnum">${i + 1}</span><div class="seg">${Object.keys(TYPES).map(t => `<button data-t="${t}" class="${q.type === t ? 'on' : ''}">${TYPES[t]}${t === 'couple' && !can('couple') ? '<em class="lk sm">' + ICON_LOCK + '</em>' : ''}</button>`).join('')}</div><button class="x2b${q.x2 ? ' on' : ''}" data-x2 title="Двойные очки">×2</button>` +
    `<div class="qtools">${qTip(q)}<button class="ic" data-a="dup" title="Копия">⧉</button><button class="ic" data-a="del" title="Удалить вопрос">${ICON.trash}</button></div></div>${body}</div>`;
}
/* перетаскивание за ручку — мышью и пальцем */
function sortable(box, itemSel, handleSel, onMove) {
  if (box._sortable) return; box._sortable = true;
  box.addEventListener('pointerdown', e => {
    const h = e.target.closest(handleSel); if (!h || !box.contains(h) || (e.button && e.button !== 0)) return;
    const item = h.closest(itemSel); if (!item || item.parentNode !== box) return;
    e.preventDefault();
    const kids = () => [...box.children].filter(el => el !== item && (el.matches(itemSel) || el === ph));
    const from = [...box.children].filter(el => el.matches(itemSel)).indexOf(item);
    const r = item.getBoundingClientRect(), dy = e.clientY - r.top, dx = e.clientX - r.left;
    const ph = document.createElement('div'); ph.className = 'sort-ph ph-' + (item.className.split(' ')[0] || ''); ph.style.height = r.height + 'px';
    box.insertBefore(ph, item);
    Object.assign(item.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', zIndex: 60, pointerEvents: 'none', margin: 0, animation: 'none' });
    item.classList.add('dragging'); document.body.classList.add('sorting');
    try { h.setPointerCapture(e.pointerId); } catch (err) {}
    let py = e.clientY, px = e.clientX, raf = 0;
    const place = () => {
      item.style.top = (py - dy) + 'px'; item.style.left = (px - dx) + 'px';
      let best = null, bd = 1e9;
      kids().forEach(el => { const b = el.getBoundingClientRect(), d = Math.hypot(px - (b.left + b.width / 2), py - (b.top + b.height / 2)); if (d < bd) { bd = d; best = el; } });
      if (best && best !== ph) { const all = [...box.children]; if (all.indexOf(ph) < all.indexOf(best)) best.after(ph); else box.insertBefore(ph, best); }
    };
    const edge = () => { const z = 70; if (py < z) window.scrollBy(0, -14); else if (py > innerHeight - z) window.scrollBy(0, 14); else { raf = 0; return; } place(); raf = requestAnimationFrame(edge); };
    const move = ev => { py = ev.clientY; px = ev.clientX; place(); if (!raf) raf = requestAnimationFrame(edge); };
    const end = () => {
      h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', end); h.removeEventListener('pointercancel', end);
      if (raf) cancelAnimationFrame(raf);
      const to = [...box.children].filter(el => el === ph || (el !== item && el.matches(itemSel))).indexOf(ph);
      ph.replaceWith(item); item.removeAttribute('style'); item.classList.remove('dragging'); document.body.classList.remove('sorting');
      if (to >= 0 && to !== from) onMove(from, to);
    };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
  });
}
function paintQs() { if (GAME === 'fact') return paintFacts(); sortable($('qList'), '.qcard', '.qg', (from, to) => { CFG.qs.splice(to, 0, CFG.qs.splice(from, 1)[0]); STORE.save(); paintQs(); }); $('qList').innerHTML = CFG.qs.map(cardHtml).join(''); document.querySelectorAll('.qcard').forEach(bindCard); $('qCount').textContent = CFG.qs.length + ' ' + plural(CFG.qs.length, 'вопрос', 'вопроса', 'вопросов'); }
function repaintCard(i, focusSel) {
  const old = document.querySelector(`.qcard[data-i="${i}"]`); if (!old) return paintQs();
  const tmp = document.createElement('div'); tmp.innerHTML = cardHtml(CFG.qs[i], i); const nc = tmp.firstChild; nc.style.animation = 'none';
  old.replaceWith(nc); bindCard(nc);
  if (focusSel) { const f = nc.querySelector(focusSel); if (f) { f.focus(); const v = f.value; if (f.setSelectionRange) try { f.setSelectionRange(v.length, v.length); } catch (e) {} } }
}
function refreshWarn(c, q) { const issue = qIssue(q); c.classList.toggle('warn', !!issue); let w = c.querySelector('.hint.w'); if (!issue) { if (w) w.remove(); return; } if (!w) { w = document.createElement('div'); w.className = 'hint w'; c.appendChild(w); } w.textContent = '⚠ ' + issue; }
function bindCard(c) {
  const i = +c.dataset.i, q = CFG.qs[i];
  c.querySelectorAll('[data-f]').forEach(inp => inp.oninput = () => { const f = inp.dataset.f; q[f] = f === 'num' || f === 'num2' ? inp.value.replace(',', '.').replace(/\s/g, '') : inp.value; STORE.save(); refreshWarn(c, q); });
  c.querySelectorAll('[data-o]').forEach(inp => inp.oninput = () => { q.opts[+inp.dataset.o].t = inp.value; STORE.save(); refreshWarn(c, q); });
  c.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => {
    if (!isCh(q)) return;
    const j = +b.dataset.ok, k = q.ok.indexOf(j);
    if (k >= 0) { if (q.ok.length > 1) q.ok.splice(k, 1); else { toast('Хотя бы один ответ должен быть правильным'); return; } } else q.ok.push(j);
    q.ok.sort(); STORE.save();
    c.querySelectorAll('.opt').forEach(o => o.classList.toggle('ok', q.ok.indexOf(+o.dataset.j) >= 0)); refreshWarn(c, q);
  });
  const ob = c.querySelector('.opts');
  if (ob) sortable(ob, '.opt', '.og', (from, to) => {
    const idx = q.opts.map((_, k) => k); idx.splice(to, 0, idx.splice(from, 1)[0]);
    q.opts = idx.map(k => q.opts[k]); q.ok = q.ok.map(x => idx.indexOf(x)).sort();
    STORE.save(); repaintCard(i);
  });
  c.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const j = +b.dataset.del; if (q.opts.length <= 2) return;
    q.opts.splice(j, 1); q.ok = q.ok.filter(x => x !== j).map(x => x > j ? x - 1 : x);
    if (isCh(q) && !q.ok.length) q.ok = [0];
    STORE.save(); repaintCard(i);
  });
  const ao = c.querySelector('[data-addopt]'); if (ao) ao.onclick = () => { if (q.opts.length >= 4) return; q.opts.push(O()); STORE.save(); repaintCard(i, `[data-o="${q.opts.length - 1}"]`); };
  c.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
    const t = b.dataset.t; if (t === q.type) return; if (t === 'couple' && !can('couple')) return upsell('couple');
    q.type = t; if (t === 'photo' && !(q.text || '').trim()) q.text = 'Кто на фото?';
    if (t === 'number') { q.ok = []; }
    else { if (q.opts.length < 2) q.opts = [O(), O()]; if (t === 'couple') { q.ok = []; if (!q.opts.some(optFilled)) { const [g, bn] = coupleNames(CFG.couple); q.opts = [O(g), O(bn)]; } } else if (!q.ok.length) q.ok = [0]; }
    STORE.save(); repaintCard(i);
  });
  const mdb = c.querySelector('[data-mdopen]'); if (mdb) mdb.onclick = () => { q._mo = 1; repaintCard(i); };
  c.querySelectorAll('[data-mk]').forEach(b => b.onclick = () => { const [key, v] = b.dataset.mk.split('|'); q[key] = v ? Object.assign({}, q[key] || {}, { k: v }) : null; if (!v && !mdOk(q.qm) && !mdOk(q.am) && !(q.qm && q.qm.k) && !(q.am && q.am.k)) q._mo = 1; STORE.save(); repaintCard(i); });
  c.querySelectorAll('[data-myt]').forEach(inp => inp.oninput = () => { const key = inp.dataset.myt, id = ytId(inp.value); if (id) { Object.assign(q[key], { yt: id, fid: '', name: '', t0: ytT(inp.value), t1: 0 }); STORE.save(); repaintCard(i); } else if (inp.value.trim().length > 12) inp.classList.add('bad'); else inp.classList.remove('bad'); });
  const takeMd = (key, file, el) => {
    if (!file) return; const k = q[key].k;
    if (!new RegExp('^' + k + '/').test(file.type || '')) return toast(k === 'audio' ? 'Нужен аудиофайл: MP3, M4A, WAV' : 'Нужен видеофайл: MP4, MOV, WEBM');
    if (file.size > 80 * 1048576) return toast('Файл больше 80 МБ — обрежьте его или дайте ссылку YouTube');
    if (el) el.textContent = 'Сохраняем…';
    MEDIA.put(file).then(fid => { Object.assign(q[key], { fid, name: file.name, yt: '', t0: 0, t1: 0 }); STORE.save(); repaintCard(i); }, () => { toast('Не получилось сохранить файл в браузере'); repaintCard(i); });
  };
  c.querySelectorAll('[data-mfile]').forEach(inp => inp.onchange = () => takeMd(inp.dataset.mfile, inp.files && inp.files[0], inp.parentNode));
  c.querySelectorAll('[data-mdrop]').forEach(d => {
    d.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); d.classList.add('on'); });
    d.addEventListener('dragleave', () => d.classList.remove('on'));
    d.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); d.classList.remove('on'); takeMd(d.dataset.mdrop, e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0], d); });
  });
  c.querySelectorAll('[data-mclr]').forEach(b => b.onclick = () => { const key = b.dataset.mclr; q[key] = { k: q[key].k }; STORE.save(); repaintCard(i); });
  c.querySelectorAll('[data-mt]').forEach(inp => inp.onchange = () => { const [key, f] = inp.dataset.mt.split('|'); q[key][f] = parseT(inp.value); inp.value = q[key][f] ? mmss(q[key][f]) : ''; STORE.save(); });
  c.querySelectorAll('[data-nm]').forEach(b => b.onclick = () => { q.rng = b.dataset.nm === '1'; STORE.save(); repaintCard(i); });
  c.querySelector('[data-x2]').onclick = e => { q.x2 = !q.x2; e.currentTarget.classList.toggle('on', q.x2); STORE.save(); };
  c.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'del') { if (!confirmTwice(b, '?')) return; if (CFG.qs.length > 1) CFG.qs.splice(i, 1); else CFG.qs[0] = normQ({ opts: [O(), O(), O(), O()] }); }
    else if (a === 'dup') CFG.qs.splice(i + 1, 0, Object.assign(JSON.parse(JSON.stringify(q)), { id: uid() }));
    STORE.save(); paintQs(); sum();
  });
  // фото вопроса
  const box = c.querySelector('.qimg'), inp = c.querySelector('.qfile');
  const take = file => {
    if (!file) return;
    box.innerHTML = '<div class="busy">Обрабатываем фото…</div>';
    loadCrop(file, QCROP).then(d => { if (!d) { repaintCard(i); return; } q.img = IMG.put(d); STORE.upImg(q.img); STORE.save(); repaintCard(i); }, () => { box.innerHTML = imgSlot(q) + '<div class="err">Не удалось открыть файл — нужна картинка JPG или PNG</div>'; wireImg(); });
  };
  const wireImg = () => box.querySelectorAll('[data-im]').forEach(b => b.onclick = e => { e.preventDefault(); if (b.dataset.im === 'del') { q.img = ''; STORE.save(); repaintCard(i); } else if (b.dataset.im === 'crop') { cropImage(IMG.get(q.img), QCROP).then(d => { if (d) { q.img = IMG.put(d); STORE.upImg(q.img); STORE.save(); repaintCard(i); } }); } else { inp.value = ''; inp.click(); } });
  wireImg();
  inp.onchange = () => take(inp.files && inp.files[0]);
  const ainp = c.querySelector('.afile');
  if (ainp) {
    c.querySelectorAll('[data-am]').forEach(b => b.onclick = e => { e.preventDefault(); const a = b.dataset.am; if (a === 'del') { q.aimg = ''; STORE.save(); repaintCard(i); } else if (a === 'crop') { cropImage(IMG.get(q.aimg), QCROP).then(d => { if (d) { q.aimg = IMG.put(d); STORE.upImg(q.aimg); STORE.save(); repaintCard(i); } }); } else { ainp.value = ''; ainp.click(); } });
    ainp.onchange = () => { const f = ainp.files && ainp.files[0]; if (!f) return; loadCrop(f, QCROP).then(d => { if (d) { q.aimg = IMG.put(d); STORE.upImg(q.aimg); STORE.save(); repaintCard(i); } }, () => toast('Не получилось открыть фото')); };
    const bl = c.querySelector('[data-blur]'); if (bl) bl.onchange = () => { q.blur = bl.checked; STORE.save(); };
  }
  c.addEventListener('paste', e => { const it = [...((e.clipboardData || {}).items || [])].find(x => x.kind === 'file' && /^image\//.test(x.type)); if (it) { e.preventDefault(); take(it.getAsFile()); } });
  c.addEventListener('dragover', e => { if (e.dataTransfer && [...(e.dataTransfer.types || [])].indexOf('Files') >= 0) { e.preventDefault(); c.classList.add('drag'); } });
  c.addEventListener('dragleave', e => { if (!c.contains(e.relatedTarget)) c.classList.remove('drag'); });
  c.addEventListener('drop', e => { c.classList.remove('drag'); const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) { e.preventDefault(); take(f); } });
}
const QCROP = { free: true, max: 1600, target: 380000 }, AVCROP = { aspect: 1, round: true, max: 700, target: 120000 };
function mdSlot(q, key, label) {
  const m = q[key] || {}, k = m.k || '';
  let h = `<div class="mds"><div class="mdh"><span>${label}</span><span class="mseg">${[['', 'Нет'], ['video', 'Видео'], ['audio', 'Аудио']].map(([v, t]) => `<button data-mk="${key}|${v}" class="${k === v ? 'on' : ''}">${t}</button>`).join('')}</span></div>`;
  if (k) {
    if (m.yt || m.fid) h += `<div class="mdc">${m.yt ? `<span class="th" style="background-image:url(https://i.ytimg.com/vi/${encodeURIComponent(m.yt)}/mqdefault.jpg)">${k === 'audio' ? '🎧' : ''}</span>` : `<span class="th">${k === 'audio' ? '🎧' : '🎬'}</span>`}<span class="mi"><b>${m.yt ? 'YouTube' : esc(m.name || 'Файл')}</b><small>${m.yt ? 'играет по ссылке' : 'файл на этом устройстве'}</small></span><button class="ic" data-mclr="${key}" title="Убрать">${ICON.trash}</button></div>` +
      `<div class="mdt"><span>Фрагмент с</span><input class="inp" data-mt="${key}|t0" inputmode="numeric" placeholder="0:00" value="${m.t0 ? mmss(m.t0) : ''}"><span>по</span><input class="inp" data-mt="${key}|t1" inputmode="numeric" placeholder="конец" value="${m.t1 ? mmss(m.t1) : ''}"></div>`;
    else h += `<input class="inp" data-myt="${key}" placeholder="Ссылка YouTube" inputmode="url"><label class="mdrop" data-mdrop="${key}">или перетащите ${k === 'audio' ? 'аудио' : 'видео'}-файл<small>до 80 МБ</small><input type="file" accept="${k}/*" hidden data-mfile="${key}"></label>`;
  }
  return h + '</div>';
}
function aimgSlot(q) {
  if (q.aimg && IMG.get(q.aimg)) return `<div class="has">${picHtml(q.aimg, 'has-in')}<div class="acts"><button data-am="crop">Кадрировать</button><button data-am="rep">Заменить</button><button data-am="del">Убрать</button></div></div>`;
  return `<button class="add" data-am="add">${ICON.cam} Добавить фото-ответ</button>`;
}
function imgSlot(q) {
  if (q.img && IMG.get(q.img)) return `<div class="has">${picHtml(q.img, 'has-in')}<div class="acts"><button data-im="crop">Кадрировать</button><button data-im="rep">Заменить</button><button data-im="del">Убрать</button></div></div>`;
  return `<button class="add${q.type === 'photo' ? ' need' : ''}" data-im="add">${ICON.cam} ${q.type === 'photo' ? 'Добавить фото для вопроса' : 'Добавить фото к вопросу'}</button>`;
}
function sum() {
  if (GAME === 'fact') {
    const n = CFG.facts.length, ok = CFG.facts.filter(factOk).length, mins = Math.max(1, Math.round(ok * (CFG.s.show === 'stage' ? 50 : CFG.s.time + 25) / 60));
    $('bSum').textContent = (CFG.title || GNAME) + ' · ' + (SHOWS[CFG.s.show] || SHOWS.stage).t.toLowerCase();
    $('bSub').textContent = `${ok} из ${n} ${plural(n, 'факта', 'фактов', 'фактов')} готово · около ${mins} мин` + (CFG.bots ? ' · с ботами' : '');
    if ($('qCount')) $('qCount').textContent = n + ' ' + plural(n, 'факт', 'факта', 'фактов');
    return;
  }
  const n = CFG.qs.length, ok = CFG.qs.filter(validQ).length, mins = Math.max(1, Math.round(CFG.qs.reduce((s, q) => s + (q.type === 'number' ? Math.max(CFG.s.time, 30) : CFG.s.time) + 12, 0) / 60));
  $('bSum').textContent = (CFG.title || 'Квиз') + ' · ' + MODES[CFG.mode].t + ' · ' + PLAYS[CFG.s.play].t.toLowerCase();
  $('bSub').textContent = `${ok} из ${n} ${plural(n, 'вопроса', 'вопросов', 'вопросов')} готово · около ${mins} мин` + (CFG.bots ? ' · с ботами' : '');
  if ($('qCount')) $('qCount').textContent = n + ' ' + plural(n, 'вопрос', 'вопроса', 'вопросов');
}
function openImport() {
  modal(`<h3>Вставить вопросы списком</h3><p class="muted" style="margin:0;font-size:14px">Каждый вопрос — отдельный блок через пустую строку. Правильные варианты отметьте «+», остальные «-». Можно 2–4 варианта.</p><pre>Где познакомились Максим и Алина?\n+ В церкви\n- В кафе\n- На работе</pre><textarea class="inp" id="impText" rows="9" placeholder="Вставьте вопросы сюда"></textarea><div style="display:flex;gap:8px;margin-top:12px"><button class="btn ghost" data-close style="flex:1">Отмена</button><button class="btn gold" id="impGo" style="flex:1">Добавить</button></div>`, b => {
    b.querySelector('#impText').focus();
    b.querySelector('#impGo').onclick = () => {
      let added = 0;
      b.querySelector('#impText').value.split(/\n\s*\n/).forEach(blk => {
        const lines = blk.split('\n').map(x => x.trim()).filter(Boolean); if (lines.length < 3) return;
        const opts = [], ok = [];
        lines.slice(1, 5).forEach((l, k) => { if (/^\+/.test(l)) ok.push(k); opts.push(O(l.replace(/^[+\-–•*]\s*/, ''))); });
        CFG.qs.push(normQ({ type: 'choice', text: lines[0].replace(/^\d+[.)]\s*/, ''), opts, ok: ok.length ? ok : [0] })); added++;
      });
      if (added) { CFG.qs = CFG.qs.filter(q => (q.text || '').trim() || q.img || CFG.qs.length === 1); STORE.save(); paintQs(); sum(); toast('Добавлено вопросов: ' + added); }
      closeModal();
    };
  });
}
function openMine() {
  modal('<h3>Мои квизы</h3><p class="muted" style="margin:0">Квизы хранятся в вашем аккаунте — открывайте их с любого устройства.</p><div class="qlist" id="mql"><div class="muted">Загружаем…</div></div><div style="display:flex;gap:8px"><button class="btn gold" id="mNew" style="flex:1">+ Новый квиз</button><button class="btn ghost" data-close style="flex:1">Закрыть</button></div>', b => {
    b.querySelector('#mNew').onclick = () => { STORE.save(); CFG = normCfg(defaultCfg(true)); CFG.couple = ''; STORE.save(); closeModal(); renderEditor(); window.scrollTo(0, 0); };
    STORE.list().then(list => {
      const el = b.querySelector('#mql'); if (!el) return;
      if (!list.length) { el.innerHTML = '<div class="muted">Пока пусто</div>'; return; }
      el.innerHTML = list.map(x => `<button data-q="${esc(x.id)}" class="${x.id === CFG.id ? 'on' : ''}"><b>${esc(x.title || 'Квиз')}</b><span>${esc(x.couple || '')} · ${x.n || 0} ${plural(x.n || 0, 'вопрос', 'вопроса', 'вопросов')}</span><span class="ic" data-rm="${esc(x.id)}" title="Удалить">${ICON.trash}</span></button>`).join('');
      el.querySelectorAll('[data-q]').forEach(btn => btn.onclick = e => {
        const rm = e.target.closest('[data-rm]');
        if (rm) { e.stopPropagation(); if (rm.dataset.sure) { STORE.remove(rm.dataset.rm).then(() => btn.remove()); } else { rm.dataset.sure = 1; rm.innerHTML = 'Удалить?'; rm.style.width = 'auto'; rm.style.padding = '0 8px'; } return; }
        if (btn.dataset.q === CFG.id) { closeModal(); return; }
        btn.querySelector('span').textContent = 'Открываем…';
        STORE.open(btn.dataset.q).then(c => { CFG = c; ls('set', KEY_CFG, CFG); closeModal(); renderEditor(); window.scrollTo(0, 0); }, () => toast('Не получилось открыть'));
      });
    });
  });
}
function start() {
  const ok = GAME === 'fact' ? factsToQs(CFG.facts, CFG.s.show) : CFG.qs.filter(validQ);
  if (!ok.length) { alertBar(GAME === 'fact' ? 'Добавьте хотя бы два факта о разных гостях' : 'Добавьте хотя бы один готовый вопрос'); return; }
  const used = [];
  if (FEAT[CFG.s.play] && !can(CFG.s.play)) used.push(CFG.s.play);
  if (ok.some(q => q.type === 'couple') && !can('couple')) used.push('couple');
  if (validColor(CFG.accent) !== ACCENTS[0] && !can('color')) used.push('color');
  if (CFG.photo && !can('photo')) used.push('photo');
  if (used.length) {
    const need = used.map(f => FEAT[f][0]).sort((a, b) => TIER[b].r - TIER[a].r)[0];
    modal(upsellHtml('В квизе есть функции тарифа «' + TIER[need].n + '»', used.map(f => '• ' + FEAT[f][1]).join('<br>') + '<br><br>Перейдите на тариф выше или отключите их — и можно запускать.'));
    return;
  }
  const b = $('bStart'); b.disabled = true; b.textContent = 'Запускаем…';
  SND.unlock();
  netReady.then(() => { newGame(); window.scrollTo(0, 0); });
}
function alertBar(t) { const b = $('bSub'); if (b) { b.textContent = t; b.style.color = 'var(--bad)'; setTimeout(() => { b.style.color = ''; sum(); }, 2600); } }

/* ================= ведущий: пульт ================= */
let liveBuilt = false, tab = 'ctl', sureKick = '', scrAlive = 0;
const me = { pid: 'me', role: '', picked: {}, pending: {}, net: false, table: 0, cur: () => G,
  join: (name, table) => join('me', name, false, table), answer(qi, a) { this.picked[qi] = a.o != null ? a.o : a.v; answer('me', qi, a); } };
const soundHere = () => !!(G && G.s.sound !== false && Date.now() - scrAlive > 4000);
function renderLive() {
  if (!liveBuilt) {
    liveBuilt = true; edBuilt = false;
    applyAccent(G.accent);
    $('app').innerHTML = `<div class="top"><div class="in"><a class="brand" href="../">${BRAND('<span id="lTitle"></span>')}</a><span class="sp"></span>` +
      `<button class="btn ghost sm dsk" id="bOpenScr">🖥 Экран</button><button class="btn ghost sm dsk" id="bRemote">📱 Пульт на телефоне</button><button class="btn ghost sm" id="bEdit">✎ Редактор</button></div></div>` +
      `<div class="tabs" id="tabs"><button data-t="ctl">Пульт</button><button data-t="scr">Экран</button><button data-t="ph">Я — гость</button></div>` +
      `<div class="live"><div class="ctl" data-p="ctl"><button class="btn gold next" id="bNext"></button><div class="kbd dsk-only">Пробел или → — дальше · R — повторить звук</div><button class="btn ghost" id="bIntro" style="display:none"></button>` +
      `<div class="stat"><div><b id="sP">0</b><span id="sPl">гостей</span></div><div><b id="sO">–</b><span>на связи</span></div><div><b id="sA">–</b><span>ответили</span></div></div>` +
      `<div class="netline" id="netl"></div><div id="demoL"></div><div class="cur" id="cur"></div><div class="plist" id="plist"></div>` +
      `<div class="links"><button class="btn ghost sm" id="bReplay">🔁 Проиграть ещё раз</button><button class="btn ghost sm" id="bSkip">⏭ Закончить таймер</button><button class="btn ghost sm" id="bCpl">💍 Телефоны пары</button><button class="btn ghost sm" id="bRemote2">📱 Пульт</button><button class="btn ghost sm" id="bSnd"></button><button class="btn ghost sm" id="bRestart">↺ Заново</button></div></div>` +
      `<div class="pane" data-p="scr"><h4>Экран для проектора <button class="btn ghost sm" id="bScrMenu">Открыть ↗</button></h4><div class="stage" id="stg"></div></div>` +
      `<div class="pane ph" data-p="ph"><h4>Телефон гостя · играйте сами <button class="btn ghost sm" id="bOpenPh2">↗</button></h4><div class="phwrap"><div class="phone"><div class="scr" id="ph"></div></div></div></div></div>` +
      `<div class="mnext"><button class="btn gold next" id="bNextM" style="display:block"></button></div>`;
    const openLocal = () => { SND.unlock(); window.open(BASE + '?view=screen', 'pbq_screen', 'width=1280,height=760'); };
    $('bOpenScr').onclick = screenMenu; $('bScrMenu').onclick = screenMenu;
    $('bOpenPh2').onclick = () => window.open(playLink(G), '_blank');
    $('bRemote').onclick = remoteMenu; $('bRemote2').onclick = remoteMenu; $('bCpl').onclick = coupleMenu;
    $('bEdit').onclick = () => { if (G.phase !== 'final' && G.phase !== 'lobby' && !confirmTwice($('bEdit'), 'Завершить игру?')) return; clearBots(); endNet(); G = null; liveBuilt = false; ls('del', KEY_LIVE); send({ type: 'reset' }); renderEditor(); window.scrollTo(0, 0); };
    $('bNext').onclick = next; $('bNextM').onclick = next;
    $('bIntro').onclick = startIntro;
    $('bSkip').onclick = skipTimer;
    $('bReplay').onclick = replayMedia;
    $('bRestart').onclick = () => { if (!confirmTwice($('bRestart'), 'Точно заново?')) return; clearBots(); newGame(); };
    $('bSnd').onclick = () => { G.s.sound = !(G.s.sound !== false); if (G.s.sound) SND.unlock(); render(); };
    document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; paintTabs(); });
    paintTabs();
    window._openLocal = openLocal;
  }
  $('lTitle').textContent = G.title;
  const nl = nextLabel(G);
  [$('bNext'), $('bNextM')].forEach(b => { b.innerHTML = esc(nl[0]) + (nl[1] ? `<small>${esc(nl[1])}</small>` : ''); b.disabled = G.phase === 'final' || (G.phase === 'lobby' && !isStage(G) && !Object.keys(G.players).length); });
  const stg = isStage(G);
  document.querySelectorAll('.live .stat, #plist, #tabs [data-t="ph"], .live>[data-p="ph"]').forEach(x => { x.style.display = stg ? 'none' : ''; });
  if (stg && tab === 'ph') { tab = 'ctl'; paintTabs(); }
  const canIntro = G.phase === 'lobby' && entities(G).length > 0;
  $('bIntro').style.display = canIntro ? '' : 'none';
  $('bIntro').textContent = '🎤 Представить ' + (G.s.play === 'teams' ? 'команды' : 'столы') + ' по очереди';
  $('bSkip').style.display = G.phase === 'question' && !isStage(G) ? '' : 'none';
  $('bReplay').style.display = hasMedia() ? '' : 'none';
  $('bCpl').style.display = G.net && G.qs.some(q => q.type === 'couple') ? '' : 'none';
  $('bRemote2').style.display = G.net ? '' : 'none'; $('bRemote').style.display = G.net ? '' : 'none';
  $('bSnd').textContent = G.s.sound !== false ? (soundHere() ? '🔊 Звук тут' : '🔊 Звук на экране') : '🔇 Звук выкл.';
  const n = Object.keys(G.players).length, A = G.qi >= 0 ? (G.ans[G.qi] || {}) : {}, a = Object.keys(A).length;
  $('sP').textContent = n; $('sPl').textContent = G.s.play === 'teams' ? plural(n, 'команда', 'команды', 'команд') : plural(n, 'гость', 'гостя', 'гостей');
  $('sA').textContent = G.phase === 'question' || G.phase === 'reveal' ? a + '/' + n : '–';
  $('demoL').innerHTML = G.demo ? `<div class="demo">Демо: до ${DEMO_MAX} телефонов гостей${G.demoEnd ? ', осталось ' + Math.max(1, Math.ceil((G.demoEnd - Date.now()) / 60000)) + ' мин' : ''}. <a href="../#pricing" target="_blank">Полный доступ</a></div>` : G.capHit || netCount() >= (G.cap || 0) ? `<div class="demo">Достигнут лимит тарифа — ${G.cap} телефонов. Новые гости не войдут. <a href="#" id="capUp">Нужно больше?</a></div>` : '';
  if ($('capUp')) $('capUp').onclick = e => { e.preventDefault(); upsellCap(); };
  const q = G.qi >= 0 ? G.qs[G.qi] : null, c = (q && G.cpl[G.qi]) || {};
  let cur = '';
  if (stg && G.phase === 'lobby') cur = `<div class="k">Заставка на экране</div><div class="q">${G.qs.length} ${plural(G.qs.length, 'факт', 'факта', 'фактов')} о гостях</div><div class="muted" style="font-size:13px">Телефоны гостям не нужны. Нажмите «Начать показ» — на экране появится первый факт, зал угадывает вслух.</div>`;
  else if (stg && G.phase === 'final') cur = `<div class="k">Финал</div><div class="q">На экране все герои вечера. Спасибо!</div>`;
  else if (G.phase === 'lobby') cur = `<div class="k">Лобби</div><div class="q">Гости сканируют QR или вводят код ${G.code ? '<b style="color:var(--gold)">' + fmtCode(G.code) + '</b>' : ''} на ${esc(SHORT)}</div><div class="muted" style="font-size:13px">${G.qs.length} ${plural(G.qs.length, 'вопрос', 'вопроса', 'вопросов')} готово. ${canIntro ? 'Можно представить участников перед стартом.' : 'Нажмите «Начать игру», когда все войдут.'}</div>`;
  else if (G.phase === 'intro') { const E = entities(G); cur = `<div class="k">Знакомство · ${G.ii + 1} из ${E.length}</div><div class="q">${esc((E[G.ii] || {}).name || '')}</div>`; }
  else if (G.phase === 'final') cur = `<div class="k">Финал</div><div class="q">Победители на экране. Спасибо за игру!</div>` + '<div class="links" style="margin-top:6px">' + (!can('keepsake') ? '<button class="btn ghost sm" id="bResL">💌 Итоги для пары ' + lockTag('keepsake') + '</button>' : G.res ? '<button class="btn gold sm" id="bRes">💌 Итоги для пары</button>' : G.net ? '<span class="muted" style="font-size:13px">Готовим итоги для пары…</span>' : '') +
      '<button class="btn ghost sm" id="bXls">⬇ Excel ' + lockTag('excel') + '</button></div>';
  else if (q) {
    const okT = q.type === 'number' ? `✓ ${numTxt(q.num, hasRng(q) ? q.num2 : null)} ${esc(q.unit || '')}` : q.type === 'couple' ? '💍 ответ даст пара' : '✓ ' + q.ok.map(i => L[i] + ' — ' + esc(q.opts[i].t || 'фото')).join(', ');
    if (q.fact) cur = `<div class="k">Факт ${G.qi + 1} из ${G.qs.length}</div><div class="q">${esc(q.text)}</div><div class="a">✓ ${esc((q.opts[q.ok[0]] || {}).t || '')}</div>`;
    else cur = `<div class="k">Вопрос ${G.qi + 1} из ${G.qs.length}${G.phase === 'board' ? ' · таблица' : ''}${mult(G, G.qi) > 1 ? ' · ×2' : ''}</div><div class="q">${esc(q.text)}</div><div class="a">${okT}</div>`;
    if (q.type === 'couple' && (G.phase === 'question' || G.phase === 'reveal')) {
      const [gn, bn] = coupleNames(G.couple), t = i => i != null ? L[i] : '—';
      cur += `<div class="muted" style="font-size:12px;margin-top:8px">${esc(gn)}: ${t(c.groom)} · ${esc(bn)}: ${t(c.bride)}${!hasCoupleDevices() ? ' · телефоны пары не подключены — отметьте ответ пары:' : ' · или отметьте сами:'}</div><div class="cpl">${q.opts.map((o, i) => optFilled(o) ? `<button data-cpl="${i}" class="${c.host === i ? 'on' : ''}">${L[i]} · ${esc(o.t || 'фото')}</button>` : '').join('')}</div>`;
    }
  }
  $('cur').innerHTML = cur;
  $('cur').querySelectorAll('[data-cpl]').forEach(b => b.onclick = () => coupleAnswer('host', G.qi, +b.dataset.cpl));
  if ($('bRes')) $('bRes').onclick = resultsMenu;
  if ($('bResL')) $('bResL').onclick = () => upsell('keepsake');
  if ($('bXls')) $('bXls').onclick = () => can('excel') ? exportXls() : upsell('excel');
  $('plist').innerHTML = ranked().map((p, i) => `<div class="p"><span class="muted" style="width:20px">${i + 1}</span><span class="dot ${A[p.id] && G.phase === 'question' ? 'on' : p.net && G.net && !ONLINE[p.id] ? 'off' : ''}"></span><b>${esc(p.name)}${p.id === 'me' ? ' (вы)' : ''}${p.table ? ` <small>стол ${p.table}</small>` : ''}</b><span>${nums(p.score)}</span><button class="kick${sureKick === p.id ? ' sure' : ''}" data-kick="${esc(p.id)}" title="Убрать из игры">${sureKick === p.id ? 'Убрать?' : '✕'}</button></div>`).join('') || '<div class="p muted">Пока никого</div>';
  $('plist').querySelectorAll('[data-kick]').forEach(b => b.onclick = () => { const id = b.dataset.kick; if (sureKick === id) { sureKick = ''; kick(id); } else { sureKick = id; setTimeout(() => { if (sureKick === id) { sureKick = ''; render(); } }, 3000); render(); } });
  renderNetLine();
  renderScreen($('stg'), G, soundHere());
  renderPhone($('ph'), G, me);
}
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
  if (G) { const b = $('stg'); if (b) b._st = {}; renderScreen($('stg'), G, false); }
}
function linkBox(url, id) { return `<div class="qrbox" id="${id}"></div><div class="linkrow"><code>${esc(url)}</code><button class="btn ghost sm" data-copy="${esc(url)}">Копировать</button></div>`; }
function wireCopy(b) { b.querySelectorAll('[data-copy]').forEach(x => x.onclick = () => copy(x.dataset.copy)); }
function screenMenu() {
  if (!G.net) { window._openLocal(); return; }
  modal(`<h3>Экран для проектора</h3><p class="muted" style="margin:0 0 12px">Если проектор подключён к этому ноутбуку — откройте экран здесь: он работает даже без интернета.</p><button class="btn gold" id="mLocal" style="width:100%">🖥 Открыть на этом ноутбуке</button>` +
    `<div class="lbl">Проектор на другом ноутбуке</div><p class="muted" style="margin:0;font-size:14px">Откройте ссылку на нём — экран будет показывать игру через интернет.</p>${linkBox(screenNetLink(G), 'mq')}<button class="btn ghost" data-close style="width:100%">Закрыть</button>`,
    b => { qr(b.querySelector('#mq'), screenNetLink(G), 400); wireCopy(b); b.querySelector('#mLocal').onclick = () => { closeModal(); window._openLocal(); }; });
}
function remoteMenu() {
  if (!G.net) return toast('Пульт на телефоне работает через интернет');
  modal(`<h3>Пульт на телефоне</h3><p class="muted" style="margin:0">Отсканируйте своим телефоном — и ведите игру из зала: «Дальше», ответы, таймер, участники. Этот ноутбук оставьте открытым — на нём идёт игра.</p>${linkBox(remoteLink(G, 'remote'), 'mq')}<p class="muted" style="font-size:12px">Не показывайте этот код гостям — с ним можно управлять игрой.</p><button class="btn ghost" data-close style="width:100%">Закрыть</button>`,
    b => { qr(b.querySelector('#mq'), remoteLink(G, 'remote'), 400); wireCopy(b); });
}
function coupleMenu() {
  const [gn, bn] = coupleNames(G.couple), roles = coupleRoles();
  modal(`<h3>Телефоны пары</h3><p class="muted" style="margin:0">В вопросах «Угадай ответ пары» жених и невеста тайно отвечают со своих телефонов, а гости угадывают. Покажите каждому свой код.</p>` +
    `<div class="row2" style="margin-top:12px"><div style="text-align:center"><b>${esc(gn)}</b> ${roles.indexOf('groom') >= 0 ? '<span class="tag pro">подключён</span>' : ''}<div class="qrbox" id="mq1"></div></div><div style="text-align:center"><b>${esc(bn)}</b> ${roles.indexOf('bride') >= 0 ? '<span class="tag pro">подключена</span>' : ''}<div class="qrbox" id="mq2"></div></div></div>` +
    `<p class="muted" style="font-size:12px">Нет телефонов пары? Отмечайте их ответ на пульте во время вопроса.</p><button class="btn ghost" data-close style="width:100%">Закрыть</button>`,
    b => { qr(b.querySelector('#mq1'), remoteLink(G, 'groom'), 400); qr(b.querySelector('#mq2'), remoteLink(G, 'bride'), 400); });
}
function resultsMenu() {
  const u = resLink(G.res);
  modal(`<h3>Итоги для пары</h3><p class="muted" style="margin:0">Красивая страница с победителями, номинациями и тем, как гости знают пару. Отправьте молодым — её можно сохранить в PDF.</p>${linkBox(u, 'mq')}<div style="display:flex;gap:8px"><a class="btn gold" href="${esc(u)}" target="_blank" style="flex:1">Открыть</a><button class="btn ghost" data-close style="flex:1">Закрыть</button></div>`,
    b => { qr(b.querySelector('#mq'), u, 400); wireCopy(b); });
}
function render() { if (G) renderLive(); else if (!edBuilt) renderEditor(); }

/* ================= запуск ================= */
function demoOver() {
  clearBots(); endNet(); G = null; liveBuilt = false; ls('del', KEY_LIVE); send({ type: 'reset' }); renderEditor(); window.scrollTo(0, 0);
  modal(upsellHtml('Демо-игра закончилась', 'Демо работает ' + DEMO_MIN + ' минут. Выберите тариф — или запустите новую демо-игру.'));
}
/* Повтор видео/аудио текущего вопроса на экране: кнопка, клавиша R или пульт */
function hasMedia() { if (!G || (G.phase !== 'question' && G.phase !== 'reveal')) return false; const q = G.qs[G.qi]; return !!q && (mdOk(q.qm) || mdOk(q.am)); }
function replayMedia() { if (!hasMedia()) return; G.mr = (G.mr || 0) + 1; publish(); toast('🔁 Играем ещё раз'); }
function bootHost() {
  document.addEventListener('keydown', e => {
    if (!G || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '') || $('modal').classList.contains('on')) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') { e.preventDefault(); replayMedia(); }
  });
  document.addEventListener('pointerdown', () => { if (G && G.s.sound !== false) SND.unlock(); });
  onMsg(m => {
    if (m.type === 'scr-alive') { const was = soundHere(); scrAlive = Date.now(); if (was !== soundHere() && G) render(); return; }
    if (!G) return;
    if (m.type === 'join') join(m.pid, m.name, false, m.table);
    else if (m.type === 'answer') answer(m.pid, m.qi, m.a);
    else if (m.type === 'hello') send({ type: 'state', g: G });
  });
  const saved = ls('get', KEY_LIVE);
  if (saved && saved.net && saved.phase !== 'final' && Date.now() - (saved.ts || 0) < 6 * 3600e3) { G = saved; ['players', 'ans', 'cpl', 'prevRank', 'banned'].forEach(k => { G[k] = G[k] || {}; }); }
  else { ls('del', KEY_LIVE); send({ type: 'reset' }); }
  const KEY_BAK = GAME === 'fact' ? 'pbf_cfg_bak' : 'pbq_cfg_bak';
  // ?demo=1 — сразу запускаем готовый демо-квиз (черновик ведущего сохраняем в резерв)
  const DEMO_GO = !!P.get('demo') && !G, OPEN = !G && P.get('open'), NEWG = !!P.get('new') && !G;
  if (P.get('demo') || P.get('open') || P.get('new') || P.get('tpl')) try { history.replaceState(null, '', location.pathname); } catch (e) {}
  if (NEWG) { CFG = normCfg(defaultCfg(true)); CFG.couple = ''; CFG.title = GNAME; ls('set', KEY_CFG, CFG); }
  const TPL = !G && GAME === 'quiz' && P.get('tpl') ? tplCfg(P.get('tpl')) : null;
  if (TPL) { const cur = ls('get', KEY_CFG); if (cur && cur.isDemo) ls('del', KEY_BAK); CFG = normCfg(TPL); ls('set', KEY_CFG, CFG); }
  if (DEMO_GO) {
    const cur = ls('get', KEY_CFG); if (cur && !cur.isDemo) ls('set', KEY_BAK, cur);
    CFG = normCfg(defaultCfg()); CFG.couple = 'Аня и Макс'; CFG.title = GAME === 'fact' ? 'Демо: интересный факт' : 'Демо-квиз'; if (GAME !== 'fact') CFG.qs = sampleQs(CFG.couple).filter(q => q.type !== 'couple').map(normQ); CFG.isDemo = 1; ls('set', KEY_CFG, CFG);
  }
  // обычный вход после демо — возвращаем черновик ведущего
  else if (!G && CFG.isDemo) { const b = ls('get', KEY_BAK); if (b) { CFG = normCfg(b); ls('set', KEY_CFG, CFG); ls('del', KEY_BAK); } }
  setInterval(() => {
    if (!G) return;
    if (G.demo && G.demoEnd && Date.now() > G.demoEnd) { demoOver(); return; }
    maybeAutoReveal();
    updScreen($('stg'), G, soundHere()); updPhone($('ph'), G, me);
    if (!soundHere() && Date.now() - scrAlive > 4000 && scrAlive) { scrAlive = 0; render(); }
  }, 250);
  window.__quiz = { get g() { return G; }, next, cfg: () => CFG, net: NET, acc: ACC, kick, startIntro, coupleAnswer };
  IMG.ready.then(() => {
    render();
    netReady.then(ok => {
      if (G && G.net && ok) { attachNet(); lastCore = ''; lastPk = ''; netPush(true); }
      if (!G && edBuilt) paintForm();
      if (DEMO_GO && !G) { newGame(); window.scrollTo(0, 0); }
      accLoad().then(() => {
        if (G) { if (unlocked() && (G.demo || G.cap !== guestCap())) { G.demo = false; G.cap = guestCap(); G.capHit = 0; publish(); } return; }
        renderTop(); if (edBuilt) { if (GAME === 'fact') paintShows(); else paintModes(); paintDesign(); paintForm(); paintQs(); const ac = document.querySelector('[data-add=couple]'); if (ac) ac.innerHTML = '+ Угадай ответ пары' + lockTag('couple'); } const dn = $('demoN'); if (dn) { dn.innerHTML = demoNote(); if ($('bLogin2')) $('bLogin2').onclick = goLogin; }
        if (wsKey() && ok && OPEN && OPEN !== CFG.id) { STORE.open(OPEN).then(c => { CFG = c; ls('set', KEY_CFG, CFG); renderEditor(); window.scrollTo(0, 0); STORE.synced = 'ok'; paintSync(); }, () => toast('Не получилось открыть игру')); }
        else if (wsKey() && ok) {
          const pushed = ls('get', 'pbq_pushed') || {};
          if (!pushed[CFG.id]) { STORE.pushAll(); pushed[CFG.id] = 1; ls('set', 'pbq_pushed', pushed); } else { STORE.synced = 'ok'; paintSync(); }
        }
      });
    });
  });
}
function boot() {
  applyAccent(CFG.accent);
  if (VIEW === 'screen') return GID ? viewScreenNet() : viewScreenLocal();
  if (VIEW === 'play') return P.get('local') ? viewPlayLocal() : viewPlayNet();
  if (VIEW === 'remote') return viewRemote();
  if (VIEW === 'form') return viewForm();
  if (VIEW === 'result') return viewResult();
  bootHost();
}
boot();
})();

/* Выгрузка результатов в Excel (CSV с BOM) — тариф «Продвинутый» и выше */
function exportXls() {
  if (!G) return;
  const rows = [['Место', 'Участник', G.s.play === 'tables' ? 'Стол' : '', 'Очки']];
  ranked().forEach((p, i) => rows.push([i + 1, p.name, G.s.play === 'tables' ? (p.table || '') : '', p.score]));
  rows.push([]); rows.push(['Вопрос', 'Правильный ответ', 'Ответили', 'Верно']);
  G.qs.forEach((q, i) => {
    if (i > G.qi) return;
    const A = G.ans[i] || {}, ids = Object.keys(A), ok = okSet(G, i);
    const good = q.type === 'number' ? ids.filter(id => numErr(q, +A[id].v) === 0).length : ids.filter(id => ok.indexOf(A[id].o) >= 0).length;
    rows.push([q.text || 'Вопрос ' + (i + 1), q.type === 'number' ? numTxt(q.num, hasRng(q) ? q.num2 : null) + ' ' + (q.unit || '') : ok.map(k => (q.opts[k] || {}).t || '').join(', '), ids.length, good]);
  });
  const csv = '\ufeff' + rows.map(r => r.map(v => { v = v == null ? '' : String(v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = ((G.couple || G.title || 'квиз') + ' — итоги.csv').replace(/[\\/:*?"<>|]/g, ''); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
