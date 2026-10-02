(() => {
'use strict';
/* ================= общее ================= */
const P = new URLSearchParams(location.search);
const VIEW = P.get('view') || 'host';
const GID = (P.get('g') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);
const PF_API = 'https://script.google.com/macros/s/AKfycbwvLVfMge8_eCpteZrgj-MpxqO1W_TvQoMAz0jxqx42W8ySqwz2xmutpwKfVGUGZXcG3w/exec';
const DEMO_MAX = 3, DEMO_MIN = 60;
const GAME = window.PB_GAME === 'fact' ? 'fact' : 'quiz';
const GNAME = GAME === 'fact' ? 'Интересный факт' : 'Квиз о паре';
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
let onModalClose = null;
function closeModal() { $('modal').classList.remove('on'); const f = onModalClose; onModalClose = null; if (f) f(); }
document.addEventListener('click', e => { if (e.target && e.target.id === 'modal') closeModal(); if (e.target && e.target.closest && e.target.closest('[data-close]')) closeModal(); });
const L = ['A', 'B', 'C', 'D'], CL = ['ca', 'cb', 'cc', 'cd'];
const BASE = location.origin + location.pathname;
const SHORT = location.host.replace(/^www\./, '') + '/q';
const fmtCode = c => c ? String(c).replace(/(\d{3})(\d{3})/, '$1 $2') : '';
const nums = n => Number(n).toLocaleString('ru-RU');

const MODES = {
  wedding: { ic: '💍', t: 'Свадьба', d: 'Быстрые вопросы, очки за скорость', s: { time: 20, speed: true, every: 3, change: false } },
  pub: { ic: '🍻', t: 'Паб-квиз', d: 'Больше времени, ответ можно поменять', s: { time: 45, speed: false, every: 5, change: true } },
  corp: { ic: '🏢', t: 'Корпоратив', d: 'Лидеры каждые 2 вопроса', s: { time: 30, speed: true, every: 2, change: false } }
};
const PLAYS = {
  solo: { ic: '🙋', t: 'Каждый сам за себя', d: 'Гости играют со своих телефонов' },
  teams: { ic: '👥', t: 'Команды', d: 'Один телефон на команду, название придумывают сами' },
  tables: { ic: '🍽', t: 'Столы', d: 'Играет каждый, очки идут и в зачёт стола' }
};
const ACCENTS = ['#f2efe9', '#e2cd92', '#e8a0a8', '#9cc5a1', '#9db8e8', '#c7a4e8', '#e8b07a', '#d98c6c'];
const BRAND = sub => window.PB_BRAND ? PB_BRAND.lockup(sub) : '<b>Beloglazov Event</b>';
const MARK = n => window.PB_BRAND ? PB_BRAND.mark(n) : '';
const BOTS = ['Аня', 'Максим К.', 'Оля', 'Дима', 'Лиза', 'Артём', 'Катя', 'Игорь', 'Маша', 'Саша', 'Вера', 'Паша'];
const TYPES = { choice: 'Обычный', photo: 'Фото-вопрос', couple: 'Угадай ответ пары', number: 'Число' };
const isCh = q => !!q && (q.type === 'choice' || q.type === 'photo');

function coupleNames(s) { const p = String(s || '').split(/\s+(?:и|&|and|\+)\s+/i).map(x => x.trim()).filter(Boolean); return [p[0] || 'Жених', p[1] || 'Невеста']; }
const O = t => ({ t: t || '' });
const EMOFACE = i => { const e = [["👩", "#e07a5f"], ["👨", "#3d9a8b"], ["👩‍🦰", "#d9a441"], ["🧔", "#7b6fd6"], ["👱‍♀️", "#c27078"], ["👨‍🦱", "#6f9fc6"], ["👩‍🦱", "#a7ae86"], ["👱‍♂️", "#b98a6e"]][i]; return (function (e, c) { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="' + c + '"/><stop offset="1" stop-color="#161615"/></radialGradient></defs><rect width="100" height="100" fill="url(#g)"/><text x="50" y="54" font-size="60" text-anchor="middle" dominant-baseline="middle">' + e + '</text></svg>').replace(/\(/g, '%28').replace(/\)/g, '%29'); })(e[0], e[1]); };
function sampleFacts() {
  return [['Оля', 'Прыгала с парашютом на своё 30-летие'], ['Дима', 'Целое лето работал аниматором в Турции'], ['Катя', 'Знает жениха с первого класса — сидели за одной партой'],
    ['Игорь', 'Выиграл конкурс по поеданию пельменей'], ['Маша', 'Побывала на концертах в 12 странах'], ['Саша', 'Сам построил баню на даче'],
    ['Вера', 'Играет на арфе'], ['Паша', 'Однажды проспал собственный выпускной']].map(([name, fact], i) => ({ id: uid(), name, fact, img: 'u:' + EMOFACE(i) }));
}
const normFact = f => ({ id: (f && f.id) || uid(), name: String((f && f.name) || ''), fact: String((f && f.fact) || ''), img: (f && f.img) || '' });
const factOk = f => f && f.name.trim() && f.fact.trim();
const SHOWS = { stage: { ic: '🎤', t: 'Стендап', d: 'Ведущий показывает факт, зал угадывает вслух — и открываются фото и имя. Без телефонов.' }, v2: { ic: '✌️', t: 'Угадай из двух', d: 'Гости выбирают на телефонах одного из двух гостей. Лидеры — в конце.' }, v4: { ic: '🖐', t: 'Угадай из четырёх', d: 'Четыре лица на выбор — сложнее и азартнее. Лидеры — в конце.' } };
const isStage = g => !!(g && g.s && g.s.show === 'stage');
const initial = n => (String(n || '?').trim().charAt(0) || '?').toUpperCase();
function sampleQs(couple) {
  const [g, b] = coupleNames(couple);
  return [
    { type: 'choice', text: `Где познакомились ${g} и ${b}?`, opts: ['В церкви', 'В кафе', 'На работе', 'В университете'].map(t => O(t)), ok: [0] },
    { type: 'couple', text: 'Кто первым написал сообщение?', opts: [g, b].map(t => O(t)), ok: [] },
    { type: 'number', text: 'Сколько месяцев пара встречалась до помолвки?', opts: [], ok: [], num: 18, unit: 'мес.' },
    { type: 'choice', text: 'Куда было их первое свидание?', opts: ['В кино', 'В парк', 'На каток', 'В ресторан'].map(t => O(t)), ok: [2] },
    { type: 'couple', text: 'Кто в паре лучше готовит?', opts: [g, b, 'Одинаково'].map(t => O(t)), ok: [] },
    { type: 'choice', text: `Какое любимое блюдо ${g}а?`.replace('аа?', 'а?'), opts: ['Плов', 'Пицца', 'Борщ', 'Суши'].map(t => O(t)), ok: [0] },
    { type: 'choice', text: `Где ${g} сделал предложение?`, opts: ['На берегу океана', 'Дома за ужином', 'В горах', 'На крыше'].map(t => O(t)), ok: [2] },
    { type: 'choice', text: 'Какие слова чаще всего говорят друг другу?', opts: ['«Ты поел?»', '«Я скучаю»', '«Где мои ключи?»', 'Все три'].map(t => O(t)), ok: [1, 3] }
  ].map(q => Object.assign({ id: uid(), img: '', x2: false }, q));
}

/* ---------- цвет ---------- */
function rgb(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function hex(r, g, b) { return '#' + [r, g, b].map(x => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function lum(h) { return rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0); }
function validColor(c) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c.toLowerCase() : '#f2efe9'; }
function applyAccent(c) {
  c = validColor(c);
  const [r, g, b] = rgb(c), s = document.documentElement.style;
  s.setProperty('--gold', c); s.setProperty('--gold2', mix(c, '#131312', .12));
  s.setProperty('--g1', mix(c, '#ffffff', .2)); s.setProperty('--g2', mix(c, '#000000', .22));
  s.setProperty('--gdark', c); s.setProperty('--gink', lum(c) > .3 ? '#131312' : '#ffffff'); s.setProperty('--gsoft', `rgba(${r},${g},${b},.15)`);
}

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
    tick() { tone(1050, .05, 'square', .045); },
    up() { tone(240, .45, 'sawtooth', .1, 0, 120); },
    reveal() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .5, 'triangle', .12, i * .07)); },
    board() { noise(.5, .08, 0, 600); tone(330, .3, 'sine', .1, .1, 660); },
    intro() { noise(.14, .25, 0, 200); tone(98, .35, 'sine', .35); [784, 988, 1175].forEach((f, i) => tone(f, .7, 'triangle', .08, .15 + i * .05)); },
    place() { noise(.12, .2, 0, 250); tone(110, .3, 'sine', .3); tone(660, .4, 'triangle', .1, .05); },
    roll(d = 1.2) { for (let t = 0; t < d; t += .055) noise(.05, .04 + .1 * (t / d), t, 300); },
    fanfare() { const n = [523, 659, 784, 1047, 784, 1047], d = [.15, .15, .15, .35, .15, .7]; let t = 0; n.forEach((f, i) => { tone(f, d[i] + .1, 'sawtooth', .06, t); tone(f / 2, d[i] + .1, 'triangle', .08, t); t += d[i]; }); noise(1.4, .05, t - .7, 3000); }
  };
  return {
    unlock, get ready() { return !!ctx && ctx.state === 'running'; },
    play(n, ...a) { if (!ctx || ctx.state !== 'running') return; try { FX[n](...a); } catch (e) {} }
  };
})();

/* ---------- фото: IndexedDB + память ---------- */
const IMG = (() => {
  const cache = {}; let db = null;
  const open = new Promise(res => {
    try { const r = indexedDB.open('pbquiz', 1); r.onupgradeneeded = () => r.result.createObjectStore('img'); r.onsuccess = () => { db = r.result; res(); }; r.onerror = () => res(); setTimeout(res, 3000); }
    catch (e) { res(); }
  });
  const store = mode => db.transaction('img', mode).objectStore('img');
  const ready = open.then(() => new Promise(res => {
    // перенос фото из старой версии (localStorage)
    try { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k && k.indexOf('pbq_img_') === 0) { cache[k.slice(8)] = localStorage.getItem(k); } } } catch (e) {}
    if (!db) return res();
    try { const rq = store('readonly').openCursor(); rq.onsuccess = () => { const c = rq.result; if (c) { cache[c.key] = c.value; c.continue(); } else res(); }; rq.onerror = () => res(); } catch (e) { res(); }
  })).then(() => { try { Object.keys(cache).forEach(k => { if (localStorage.getItem('pbq_img_' + k)) { put(cache[k], k); localStorage.removeItem('pbq_img_' + k); } }); } catch (e) {} });
  function put(data, id) { id = id || 'i' + uid(10); cache[id] = data; open.then(() => { if (db) try { store('readwrite').put(data, id); } catch (e) {} }); return id; }
  function get(id) { return !id ? '' : id.slice(0, 2) === 'u:' ? id.slice(2) : (cache[id] || ''); }
  function mem(id, data) { cache[id] = data; }
  function del(id) { delete cache[id]; open.then(() => { if (db) try { store('readwrite').delete(id); } catch (e) {} }); }
  const pend = {};
  function fetchNet(path, id, cb) {
    if (!id || id.slice(0, 2) === 'u:' || cache[id] || pend[id] || !NET.ok) return;
    pend[id] = 1;
    const r = NET.db.ref(path);
    const h = s => { const v = s.val(); if (!v) return; r.off('value', h); cache[id] = v; delete pend[id]; if (cb) cb(id); };
    r.on('value', h);
  }
  function load(file, max = 1600, target = 380000) {
    return new Promise((res, rej) => {
      if (!file || !/^image\//.test(file.type || 'image/')) return rej(new Error('type'));
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(url);
        let q = .82, out = '';
        for (let k = 0; k < 6; k++) {
          const sc = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * sc)), h = Math.max(1, Math.round(im.naturalHeight * sc));
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h);
          out = c.toDataURL('image/jpeg', q);
          if (out.length < target) break;
          max = Math.round(max * .8); q = Math.max(.6, q - .06);
        }
        res(out);
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
      im.src = url;
    });
  }
  function shrink(data, max, q) {
    return new Promise(res => {
      const im = new Image();
      im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k)); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q)); };
      im.onerror = () => res('');
      im.src = data;
    });
  }
  return { ready, put, get, mem, del, fetchNet, load, shrink, keys: () => Object.keys(cache) };
})();
/* ---------- кадрирование фото ----------
   cropImage(src, { aspect: 1 | null, round, free, max, target, replace }) → Promise<dataURL | '' (отмена) | 'replace'> */
const CROP_AR = [['Свободно', 0], ['1:1', 1], ['4:3', 4 / 3], ['16:9', 16 / 9], ['3:4', 3 / 4]];
function cropImage(src, o) {
  o = o || {};
  return new Promise(res => {
    const im = new Image();
    im.onload = () => {
      const W = im.naturalWidth, H = im.naturalHeight;
      let asp = o.aspect || 0, r = null, done = false;
      const fit = () => { if (asp) { let w = W, h = w / asp; if (h > H) { h = H; w = h * asp; } w *= .9; h *= .9; r = { x: (W - w) / 2, y: (H - h) / 2, w, h }; } else r = { x: W * .05, y: H * .05, w: W * .9, h: H * .9 }; };
      fit();
      const fin = v => { if (done) return; done = true; onModalClose = null; closeModal(); res(v); };
      modal(`<h3>Кадрирование</h3><p class="muted" style="margin:0 0 12px;font-size:14px">Перетащите рамку и потяните за уголки${o.round ? ' — на экране фото будет в круге' : ''}.</p>` +
        `<div class="crp"><div class="cst" id="cSt"><img id="cIm" src="${src}" alt="" draggable="false"><div class="cbox${o.round ? ' round' : ''}" id="cBx"><span class="g"></span><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div></div></div>` +
        (o.free ? `<div class="car" id="cAr">${CROP_AR.map(([t, v]) => `<button data-ar="${v}" class="${v === asp ? 'on' : ''}">${t}</button>`).join('')}</div>` : '') +
        `<div class="cbt"><button class="btn ghost" id="cNo">Отмена</button>${o.replace ? '<button class="btn ghost" id="cRep">Другое фото</button>' : ''}<button class="btn gold" id="cOk">Готово</button></div>`, b => {
        onModalClose = () => { if (!done) { done = true; res(''); } };
        const img = b.querySelector('#cIm'), bx = b.querySelector('#cBx');
        const sc = () => img.clientWidth / W;
        const draw = () => { const k = sc(); bx.style.left = r.x * k + 'px'; bx.style.top = r.y * k + 'px'; bx.style.width = r.w * k + 'px'; bx.style.height = r.h * k + 'px'; };
        if (img.complete) draw(); else img.onload = draw;
        const ro = window.ResizeObserver ? new ResizeObserver(draw) : null; if (ro) ro.observe(img);
        let drag = null;
        bx.addEventListener('pointerdown', e => {
          e.preventDefault(); bx.setPointerCapture(e.pointerId);
          const h = e.target.dataset && e.target.dataset.h;
          drag = { h, x0: e.clientX, y0: e.clientY, r0: Object.assign({}, r) };
        });
        bx.addEventListener('pointermove', e => {
          if (!drag) return;
          const k = sc(), dx = (e.clientX - drag.x0) / k, dy = (e.clientY - drag.y0) / k, s0 = drag.r0, min = 48 / k;
          if (!drag.h) { r.x = clamp(s0.x + dx, 0, W - s0.w); r.y = clamp(s0.y + dy, 0, H - s0.h); }
          else {
            const sx = /e/.test(drag.h) ? 1 : -1, sy = /s/.test(drag.h) ? 1 : -1;
            const ax = sx > 0 ? s0.x : s0.x + s0.w, ay = sy > 0 ? s0.y : s0.y + s0.h;
            const px = (sx > 0 ? s0.x + s0.w : s0.x) + dx, py = (sy > 0 ? s0.y + s0.h : s0.y) + dy;
            const mw = sx > 0 ? W - ax : ax, mh = sy > 0 ? H - ay : ay;
            let w = Math.max(min, (px - ax) * sx), hh = Math.max(min, (py - ay) * sy);
            if (asp) { w = Math.min(Math.max(w, hh * asp), mw, mh * asp); hh = w / asp; } else { w = Math.min(w, mw); hh = Math.min(hh, mh); }
            r = { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - hh, w, h: hh };
          }
          draw();
        });
        const end = () => { drag = null; };
        bx.addEventListener('pointerup', end); bx.addEventListener('pointercancel', end);
        if (o.free) b.querySelectorAll('[data-ar]').forEach(x => x.onclick = () => { asp = +x.dataset.ar; fit(); draw(); b.querySelectorAll('[data-ar]').forEach(y => y.classList.toggle('on', y === x)); });
        b.querySelector('#cNo').onclick = () => fin('');
        if (o.replace) b.querySelector('#cRep').onclick = () => fin('replace');
        b.querySelector('#cOk').onclick = () => {
          try {
            const max = o.max || 1600, k = Math.min(1, max / Math.max(r.w, r.h)), cw = Math.max(1, Math.round(r.w * k)), ch = Math.max(1, Math.round(r.h * k));
            const c = document.createElement('canvas'); c.width = cw; c.height = ch;
            const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch); x.drawImage(im, r.x, r.y, r.w, r.h, 0, 0, cw, ch);
            let q = .85, out = c.toDataURL('image/jpeg', q);
            while (o.target && out.length > o.target && q > .5) { q -= .07; out = c.toDataURL('image/jpeg', q); }
            fin(out);
          } catch (err) { toast('Не получилось обрезать это фото'); fin(''); }
        };
      });
    };
    im.onerror = () => res('');
    im.src = src;
  });
}
/* загрузить файл и сразу предложить кадрирование */
function loadCrop(file, o) { return IMG.load(file, 2400, 2400000).then(d => cropImage(d, o)); }
function picHtml(id, cls) { const d = IMG.get(id); if (!d) return ''; return `<div class="${cls}"><div class="bgb" style="background-image:url(${d})"></div><img src="${d}" alt=""></div>`; }
function bgUrl(id) { const d = IMG.get(id); return d ? `background-image:url(${d})` : ''; }

/* ================= сеть: Firebase ================= */
const FB = { apiKey: 'AIzaSyADi9iG0ZtHg9zGBomUKpTpgaANStenR3Y', authDomain: 'beloglazov-games.firebaseapp.com', databaseURL: 'https://beloglazov-games-default-rtdb.firebaseio.com', projectId: 'beloglazov-games' };
const NET = { ok: false, uid: null, db: null, off: 0, connected: false, rtt: 0, subs: [], since: Date.now() };
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
      NET.db.ref('.info/connected').on('value', x => { NET.connected = !!x.val(); NET.since = Date.now(); NET.subs.forEach(f => { try { f(); } catch (e) {} }); });
      res(true);
    });
    firebase.auth().signInAnonymously().catch(() => { if (!done) { done = true; clearTimeout(to); res(false); } });
  } catch (e) { res(false); }
});
const ref = p => NET.db.ref(p);
const gref = (gid, p) => ref('g/' + gid + (p ? '/' + p : ''));
const TS = () => firebase.database.ServerValue.TIMESTAMP;

/* ================= аккаунт платформы ================= */
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
/* ===== тарифы: что где доступно ===== */
const TIER = { demo: { n: 'Бесплатный', r: 0, max: DEMO_MAX }, basic: { n: 'Базовый', r: 1, max: 10 }, pro: { n: 'Продвинутый', r: 2, max: 100 }, biz: { n: 'Бизнес', r: 3, max: 100000 } };
const capTxt = n => n >= 10000 ? 'без ограничений' : 'до ' + n;
const FEAT = {
  teams: ['basic', 'Игра командами'], tables: ['basic', 'Игра по столам'], couple: ['basic', 'Вопросы «Угадай ответ пары»'],
  color: ['pro', 'Свой основной цвет'], photo: ['pro', 'Фото пары на заставке'], form: ['pro', 'Анкета для пары'],
  keepsake: ['pro', 'Итоги на память для пары'], excel: ['pro', 'Выгрузка результатов в Excel']
};
const myTier = () => unlocked() ? (TIER[ACC.info.tier] ? ACC.info.tier : 'pro') : 'demo';
const can = f => (GAME === 'fact' && f === 'form') || TIER[myTier()].r >= TIER[FEAT[f][0]].r;
const guestCap = () => unlocked() ? (ACC.info.max || TIER[myTier()].max) : DEMO_MAX;
const nextTier = () => { const t = myTier(); return t === 'demo' ? 'basic' : t === 'basic' ? 'pro' : t === 'pro' ? 'biz' : ''; };
function upsellHtml(title, text) {
  return `<div class="ups"><div class="upi">${ICON_LOCK}</div><h3>${title}</h3><p class="muted">${text}</p><p class="muted small">Настройки квиза сохранятся — после смены тарифа просто обновите страницу.</p>` +
    `<div class="links"><a class="btn gold" href="../#pricing" target="_blank" rel="noopener">Выбрать тариф</a><button class="btn ghost" data-close>Не сейчас</button></div></div>`;
}
function upsell(f) {
  const need = FEAT[f][0], t = myTier();
  modal(upsellHtml(FEAT[f][1] + ' — в тарифе «' + TIER[need].n + '»', (t !== 'demo' ? 'Сейчас у вас тариф «' + TIER[t].n + '». ' : '') + 'Перейдите на «' + TIER[need].n + '» — и эта функция откроется сразу.'));
}
function upsellCap() {
  const t = myTier(), nt = nextTier();
  modal(upsellHtml('Нужно больше гостей?', 'В тарифе «' + TIER[t].n + '» в игру входят до ' + guestCap() + ' телефонов.' + (nt ? ' В тарифе «' + TIER[nt].n + '» — ' + capTxt(TIER[nt].max) + '.' : '')));
}
const ICON_LOCK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const lockTag = f => can(f) ? '' : `<em class="lk" title="Тариф «${TIER[FEAT[f][0]].n}»">${ICON_LOCK}${TIER[FEAT[f][0]].n}</em>`;
const wsKey = () => ACC.info && /^[0-9a-f]{64}$/.test(ACC.info.ws || '') ? ACC.info.ws : '';
function goLogin() { try { localStorage.setItem('pb_next', GAME); } catch (e) {} location.href = '../host/'; }

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
  if (q.type === 'number') return q.num !== '' && q.num != null && isFinite(+q.num);
  const f = q.opts.filter(optFilled).length;
  if (f < 2) return false;
  if (q.type === 'photo' && !q.img) return false;
  if (isCh(q)) return q.ok.some(i => optFilled(q.opts[i]));
  return true;
}
function qIssue(q) {
  if (!((q.text || '').trim() || q.img)) return 'Добавьте текст вопроса или фото';
  if (q.type === 'photo' && !q.img) return 'Добавьте фото — это фото-вопрос';
  if (q.type === 'number') return q.num === '' || q.num == null || !isFinite(+q.num) ? 'Укажите правильное число' : '';
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
      if (q.type === 'number') a = { v: Math.round(+q.num * (1 + (Math.random() - .5) * (right ? .3 : 1.2))) };
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
    const c = +q.num, tol = Math.max(Math.abs(c) * .5, 1);
    let best = Infinity; Object.values(A).forEach(x => { best = Math.min(best, Math.abs(x.v - c)); });
    Object.keys(G.players).forEach(id => {
      const p = G.players[id], x = A[id]; p.gain = 0; p.lv = x ? x.v : null;
      if (!x) { p.last = 'none'; p.streak = 0; return; }
      const err = Math.abs(x.v - c);
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
function pubQs(g) { return g.qs.map((q, i) => ({ type: q.type, text: q.text || '', img: q.img || '', blur: q.blur ? 1 : 0, opts: (q.opts || []).map(o => ({ t: o.t || '', img: o.img || '' })), unit: q.unit || '', x2: mult(g, i) > 1 })); }
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
    ok: rev && q ? (q.type === 'number' ? { num: +q.num } : { set: okSet(g, g.qi), cpl: q.type === 'couple' ? { groom: c.groom == null ? -1 : c.groom, bride: c.bride == null ? -1 : c.bride, host: c.host == null ? -1 : c.host } : null }) : null,
    n: g.phase === 'lobby' ? 0 : Object.keys(g.players).length,
    intro: e ? { i: g.ii, of: E.length, pid: e.pid || '', table: e.table || 0, name: e.name } : null };
}
function scrOf(g) {
  const rev = g.phase === 'reveal' || g.phase === 'board' || g.phase === 'final';
  const v = JSON.parse(JSON.stringify(g));
  delete v.snap; delete v.rkey; delete v.banned;
  v.qs = v.qs.map((q, i) => { const o = { type: q.type, text: q.text || '', img: q.img || '', opts: (q.opts || []).map(x => ({ t: x.t || '', img: x.img || '' })), unit: q.unit || '', ok: [], num: null, x2: !!q.x2, fact: q.fact ? 1 : 0, hp: q.hp || '', aimg: q.aimg || '', blur: q.blur ? 1 : 0 }; if (rev && i === g.qi) { o.ok = q.ok || []; o.num = q.num == null || q.num === '' ? null : +q.num; } return o; });
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
  v.qs = (v.qs || []).map(q => { q = q || {}; return { type: q.type || 'choice', text: q.text || '', img: q.img || '', opts: (q.opts || []).map(o => ({ t: (o && o.t) || '', img: (o && o.img) || '' })), unit: q.unit || '', ok: q.ok || [], num: q.num, x2: !!q.x2, fact: q.fact ? 1 : 0, hp: q.hp || '', aimg: q.aimg || '', blur: q.blur ? 1 : 0 }; });
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
      const arr = ids.map(id => ({ name: (g.players[id] || {}).name || 'Гость', v: A[id].v })).sort((a, b) => Math.abs(a.v - q.num) - Math.abs(b.v - q.num));
      const avg = tot ? Math.round(ids.reduce((s, id) => s + A[id].v, 0) / tot * 10) / 10 : null;
      return { type: 'number', text: q.text || 'Вопрос с фото', num: +q.num, unit: q.unit || '', tot, best: arr[0] || null, avg };
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
    const q = g.qs[g.qi], pic = isPicQ(q), img = !pic && q.img ? picHtml(q.img, 'qpic') : '';
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
    h = `<div class="sv${img || q.fact || q.type === 'photo' ? ' wimg' : ''}${stg ? ' stgv' : ''}">${head}${body}<div class="foot"><span id="ansCnt"></span><span id="footR"></span></div></div>`;
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
  if (q.type === 'number') {
    const nq = box.querySelector('#numq');
    if (nq && nq.dataset.st !== (rev ? 'r' : 'q')) {
      nq.dataset.st = rev ? 'r' : 'q';
      if (!rev) nq.innerHTML = `<div class="ph">Введите ответ на телефоне</div>${q.unit ? `<div class="unit">${esc(q.unit)}</div>` : ''}`;
      else {
        const c = +q.num, arr = Object.keys(A).map(id => ({ name: (g.players[id] || {}).name || 'Гость', v: A[id].v, gain: (g.players[id] || {}).gain || 0 })).sort((x, y) => Math.abs(x.v - c) - Math.abs(y.v - c)).slice(0, 3);
        nq.innerHTML = `<div class="ph">Правильный ответ</div><div class="big">${esc(nums(c))}</div>${q.unit ? `<div class="unit">${esc(q.unit)}</div>` : ''}` +
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
        (q.type === 'couple' ? '<div class="hintc">💍 Угадайте, что ответила пара</div>' : '') + ppic + '<div class="tm"><i id="ptm" style="width:100%"></i></div>';
      if (q.type === 'number') h = top + `<div class="numin"><input class="pin" id="pNum" inputmode="decimal" autocomplete="off" placeholder="Ваш ответ">${q.unit ? `<div class="unit">${esc(q.unit)}</div>` : ''}<button class="pbtn acc" id="pNumGo">Ответить</button></div><p class="note" id="pNote"></p></div>`;
      else h = top + `<div class="ans${pic ? ' pic' : ''}" id="pAns">` + q.opts.map((o, i) => !optFilled(o) ? '' :
        `<button class="${CL[i]}" data-o="${i}">${pic ? `<span class="im" style="${bgUrl(o.img)}">${IMG.get(o.img) ? '' : `<em>${esc(initial(o.t))}</em>`}</span><span class="rw"><span class="l">${L[i]}</span><span>${esc(o.t)}</span></span>` : `<span class="l">${L[i]}</span><span>${esc(o.t)}</span>`}</button>`).join('') + '</div><p class="note" id="pNote"></p></div>';
    } else if (g.phase === 'reveal') {
      const q = g.qs[g.qi], st = me.last || 'none', mine = cl.picked[g.qi] != null || (g.ans[g.qi] && g.ans[g.qi][cl.pid]);
      const okS = g._ok ? g._ok : okSet(g, g.qi), txt = i => q.opts[i] ? (q.opts[i].t || 'вариант ' + L[i]) : '';
      let sub = '';
      if (q.type === 'number') sub = `Правильный ответ: <b>${esc(nums(g._num != null ? g._num : q.num))}</b>${q.unit ? ' ' + esc(q.unit) : ''}${me.lv != null ? `<small>Ваш ответ: ${esc(nums(me.lv))}</small>` : ''}`;
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

/* ================= звук на экране ================= */
function soundOverlay(onOk) {
  const d = document.createElement('div'); d.className = 'sndov';
  d.innerHTML = '<div>🔊 Нажмите, чтобы включить звук<small>и открыть экран на весь экран</small></div>';
  d.onclick = () => { SND.unlock(); d.remove(); const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); if (onOk) onOk(); };
  document.body.appendChild(d);
}
function screenShell() {
  document.body.classList.add('solo-screen', 'no-cursor'); { let it = 0; const wake = () => { document.body.classList.remove('idle'); clearTimeout(it); it = setTimeout(() => document.body.classList.add('idle'), 3000); }; ['mousemove', 'mousedown', 'keydown'].forEach(ev => document.addEventListener(ev, wake, { passive: true })); wake(); } document.title = 'Экран · Квиз о паре';
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
      draw(); setTimeout(() => { const i = $('pCode'); if (i) i.focus(); }, 300);
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
      const qs = Q.map((q, i) => { q = q || {}; return { type: q.type || 'choice', text: q.text || '', img: q.img || '', opts: (q.opts || []).map(o => ({ t: (o && o.t) || '', img: (o && o.img) || '' })), unit: q.unit || '', x2: !!q.x2, blur: !!q.blur,
        ok: i === C.qi && C.ok && C.ok.set ? C.ok.set : [], num: i === C.qi && C.ok && C.ok.num != null ? C.ok.num : null }; });
      const g = { id: C.id, phase: C.phase, qi: C.qi, ii: C.ii, t0: C.t0, t1: C.t1, s: C.s || {}, title: C.title, couple: C.couple, final: C.final, res: C.res, players: {}, ans: {}, cpl: {}, qs, ok: C.ok, _intro: C.intro };
      const cur = SC && SC.qi === C.qi;
      g._np = C.n || (SC && SC.n) || 0; g._rank = SC && SC.rank; g._trank = SC && SC.trank; g._tn = SC && SC.tn;
      g._ok = C.ok && C.ok.set ? C.ok.set : []; g._num = C.ok && C.ok.num != null ? C.ok.num : null;
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
      const okTxt = q ? (q.type === 'number' ? `✓ ${nums(q.num)} ${q.unit || ''}` : q.type === 'couple' ? '💍 правильный ответ даст пара' : '✓ ' + (q.ok || []).map(i => L[i] + ' — ' + (q.opts[i] || '')).join(', ')) : '';
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
          h += `<div class="card"><div class="q">${esc(q.text)}</div><div class="qq"><span>Правильно: <b>${nums(q.num)} ${esc(q.unit || '')}</b></span><span class="small">в среднем гости ответили ${q.avg == null ? '—' : nums(q.avg)}</span></div>${q.best ? `<div class="small" style="margin-top:6px">Ближе всех — ${esc(q.best.name)} (${nums(q.best.v)})</div>` : ''}</div>`;
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
  return `<span class="em">${esc(i.email)}</span>${t}<button class="btn ghost sm" id="bMine">Мои квизы</button>`;
}
function renderTop() { const a = $('acc'); if (!a) return; a.innerHTML = accTag(); if ($('bLogin')) $('bLogin').onclick = goLogin; if ($('bMine')) $('bMine').onclick = openMine; }
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
    `<div class="panel"><div class="row2"><div class="fld"><label>Название игры</label><input class="inp" id="fTitle" maxlength="60"></div><div class="fld"><label>Имена пары</label><input class="inp" id="fCouple" maxlength="60" placeholder="Максим и Алина"></div></div></div>` +
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
  $('fTitle').value = CFG.title; $('fCouple').value = CFG.couple;
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
function paintModes() {
  $('modes').innerHTML = Object.keys(MODES).map(k => { const m = MODES[k]; return `<button class="mode${CFG.mode === k ? ' on' : ''}" data-m="${k}"><i>${m.ic}</i><b>${m.t}</b><span>${m.d}</span></button>`; }).join('');
  $('plays').innerHTML = Object.keys(PLAYS).map(k => { const m = PLAYS[k]; return `<button class="mode${CFG.s.play === k ? ' on' : ''}${FEAT[k] && !can(k) ? ' locked' : ''}" data-p="${k}"><i>${m.ic}</i><b>${m.t}${FEAT[k] ? lockTag(k) : ''}</b><span>${m.d}</span></button>`; }).join('');
  $('tblRow').innerHTML = CFG.s.play === 'tables' ? `<div class="rng" style="margin-top:12px"><span>Сколько столов в зале</span><input type="range" id="sTbl" min="2" max="40"><b id="sTblV"></b></div>` : CFG.s.play === 'teams' ? `<div class="hint tipline">Как работают команды ${tip('Команды сами придумывают название при входе. Перед игрой их можно представить залу по очереди.')}</div>` : '';
  if ($('sTbl')) { $('sTbl').value = CFG.s.tables; $('sTblV').textContent = CFG.s.tables; $('sTbl').oninput = e => { CFG.s.tables = +e.target.value; $('sTblV').textContent = CFG.s.tables; STORE.save(); }; }
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { CFG.mode = b.dataset.m; Object.assign(CFG.s, MODES[CFG.mode].s); STORE.save(); paintModes(); paintTune(); sum(); });
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
  if (q.type === 'number') body += `<div class="numrow"><input class="inp" data-f="num" inputmode="decimal" placeholder="Правильное число" value="${esc(q.num == null ? '' : q.num)}"><input class="inp" data-f="unit" placeholder="ед., напр. мес." maxlength="16" value="${esc(q.unit || '')}"></div>`;
  else {
    body += '<div class="opts">' + q.opts.map((o, j) => `<div class="opt${isCh(q) && q.ok.indexOf(j) >= 0 ? ' ok' : ''}" data-j="${j}"><span class="grip og" title="Перетащить">${ICON.grip}</span><button class="ch ${CL[j]}" data-ok="${j}" title="${isCh(q) ? 'Отметить правильным' : ''}">${L[j]}</button>` +
      `<input data-o="${j}" maxlength="80" placeholder="Вариант ${L[j]}" value="${esc(o.t)}">` +
      (q.opts.length > 2 ? `<button class="ic" data-del="${j}" title="Удалить вариант">${ICON.trash}</button>` : '') + '</div>').join('') + '</div>' +
      (q.opts.length < 4 ? '<button class="btn ghost sm" data-addopt style="margin-top:8px">+ Вариант</button>' : '');
  }
  if (q.type === 'photo') body += `<div class="pqx"><div class="lbl">Фото-ответ <span class="muted">· по желанию</span> ${tip('Откроется на экране вместе с правильным ответом — например, то же фото целиком или фото героя сейчас.')}</div><div class="qimg aimg">${aimgSlot(q)}</div><input type="file" accept="image/*" class="afile" hidden>` +
    `<label class="sw">Размыть фото — проясняется по таймеру<input type="checkbox" data-blur${q.blur ? ' checked' : ''}></label></div>`;
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
  c.querySelectorAll('[data-f]').forEach(inp => inp.oninput = () => { const f = inp.dataset.f; q[f] = f === 'num' ? inp.value.replace(',', '.').replace(/\s/g, '') : inp.value; STORE.save(); refreshWarn(c, q); });
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
      `<div class="live"><div class="ctl" data-p="ctl"><button class="btn gold next" id="bNext"></button><div class="kbd dsk-only">Пробел или → — дальше</div><button class="btn ghost" id="bIntro" style="display:none"></button>` +
      `<div class="stat"><div><b id="sP">0</b><span id="sPl">гостей</span></div><div><b id="sO">–</b><span>на связи</span></div><div><b id="sA">–</b><span>ответили</span></div></div>` +
      `<div class="netline" id="netl"></div><div id="demoL"></div><div class="cur" id="cur"></div><div class="plist" id="plist"></div>` +
      `<div class="links"><button class="btn ghost sm" id="bSkip">⏭ Закончить таймер</button><button class="btn ghost sm" id="bCpl">💍 Телефоны пары</button><button class="btn ghost sm" id="bRemote2">📱 Пульт</button><button class="btn ghost sm" id="bSnd"></button><button class="btn ghost sm" id="bRestart">↺ Заново</button></div></div>` +
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
    const okT = q.type === 'number' ? `✓ ${nums(q.num)} ${esc(q.unit || '')}` : q.type === 'couple' ? '💍 ответ даст пара' : '✓ ' + q.ok.map(i => L[i] + ' — ' + esc(q.opts[i].t || 'фото')).join(', ');
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
function bootHost() {
  document.addEventListener('keydown', e => {
    if (!G || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '') || $('modal').classList.contains('on')) return;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
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
  const DEMO_GO = !!P.get('demo') && !G;
  if (P.get('demo')) try { history.replaceState(null, '', location.pathname); } catch (e) {}
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
        if (wsKey() && ok) {
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
    const good = q.type === 'number' ? ids.filter(id => +A[id].v === +q.num).length : ids.filter(id => ok.indexOf(A[id].o) >= 0).length;
    rows.push([q.text || 'Вопрос ' + (i + 1), q.type === 'number' ? q.num + ' ' + (q.unit || '') : ok.map(k => (q.opts[k] || {}).t || '').join(', '), ids.length, good]);
  });
  const csv = '\ufeff' + rows.map(r => r.map(v => { v = v == null ? '' : String(v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = ((G.couple || G.title || 'квиз') + ' — итоги.csv').replace(/[\\/:*?"<>|]/g, ''); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
