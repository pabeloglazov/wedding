(() => {
'use strict';
/* ================= общее ================= */
const P = new URLSearchParams(location.search);
const VIEW = P.get('view') || 'host';
const GID = (P.get('g') || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);
const PF_API = 'https://script.google.com/macros/s/AKfycbwvLVfMge8_eCpteZrgj-MpxqO1W_TvQoMAz0jxqx42W8ySqwz2xmutpwKfVGUGZXcG3w/exec';
const DEMO_MAX = 3, DEMO_MIN = 60;
const GAME = window.PB_GAME === 'fact' ? 'fact' : 'quiz';
const GNAME = GAME === 'fact' ? 'Интересный факт' : 'Квиз';
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
const hasRng = q => !!(q && q.rng && q.num2 !== '' && q.num2 != null && isFinite(+q.num2));
const numTxt = (a, b) => b != null && b !== '' && isFinite(+b) && +b !== +a ? nums(a) + '–' + nums(b) : nums(a);
const numErr = (q, v) => { const lo = +q.num, hi = hasRng(q) ? +q.num2 : lo; return v < lo ? lo - v : v > hi ? v - hi : 0; };

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

/* ---------- видео и аудио к вопросам: YouTube или файл (файл живёт в IndexedDB этого устройства) ---------- */
const MEDIA = (() => {
  let db = null; const urls = {};
  const open = new Promise(res => { try { const r = indexedDB.open('pbmedia', 1); r.onupgradeneeded = () => r.result.createObjectStore('m'); r.onsuccess = () => { db = r.result; res(); }; r.onerror = () => res(); setTimeout(res, 3000); } catch (e) { res(); } });
  function put(blob) { const id = 'm' + uid(10); return open.then(() => new Promise((res, rej) => { if (!db) return rej(new Error('db')); try { const tx = db.transaction('m', 'readwrite'); tx.objectStore('m').put(blob, id); tx.oncomplete = () => { urls[id] = URL.createObjectURL(blob); res(id); }; tx.onerror = () => rej(tx.error || new Error('db')); } catch (e) { rej(e); } })); }
  function url(id) { if (!id) return Promise.resolve(''); if (urls[id]) return Promise.resolve(urls[id]); return open.then(() => new Promise(res => { if (!db) return res(''); try { const rq = db.transaction('m').objectStore('m').get(id); rq.onsuccess = () => { const b = rq.result; if (!b) return res(''); urls[id] = URL.createObjectURL(b); res(urls[id]); }; rq.onerror = () => res(''); } catch (e) { res(''); } })); }
  return { put, url };
})();
const ytId = s => { s = String(s || '').trim(); const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/); return m ? m[1] : /^[\w-]{11}$/.test(s) ? s : ''; };
const ytT = s => { const m = String(s || '').match(/[?&#](?:t|start)=([0-9hms]+)/); if (!m) return 0; const v = m[1]; if (/^\d+$/.test(v)) return +v; const h = v.match(/(\d+)h/), mi = v.match(/(\d+)m/), se = v.match(/(\d+)s/); return (h ? +h[1] * 3600 : 0) + (mi ? +mi[1] * 60 : 0) + (se ? +se[1] : 0); };
const mmss = s => { s = Math.max(0, Math.round(+s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const parseT = v => { v = String(v || '').trim(); if (!v) return 0; const p = v.split(/[:.]/).map(Number); if (p.some(x => !isFinite(x))) return 0; return p.length > 1 ? p[0] * 60 + p[1] : p[0]; };
const mdOk = m => !!(m && (m.k === 'video' || m.k === 'audio') && (m.yt || m.fid));
function mountMedia(box, m, snd) {
  if (!box) return;
  box.className = 'mdw' + (m.k === 'audio' ? ' aud' : '');
  const cover = m.k === 'audio' ? '<div class="cover"><div class="eq"><i></i><i></i><i></i><i></i><i></i></div><span>Слушаем</span></div>' : '';
  if (m.yt) {
    const t0 = Math.round(+m.t0 || 0), t1 = Math.round(+m.t1 || 0);
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(m.yt)}?autoplay=1&mute=${snd ? 0 : 1}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&start=${t0}${t1 > t0 ? '&end=' + t1 : ''}" allow="autoplay; encrypted-media" title="video"></iframe>` + cover;
    return;
  }
  box.innerHTML = '<div class="mph">Загружаем…</div>';
  MEDIA.url(m.fid).then(u => {
    if (!box.isConnected) return;
    if (!u) { box.innerHTML = `<div class="mph">${m.k === 'audio' ? '🎧' : '🎬'}<span>Файл «${esc(m.name || '')}» есть только на устройстве, где его загрузили. Откройте экран на этом ноутбуке или используйте ссылку YouTube.</span></div>`; return; }
    const el = document.createElement(m.k === 'audio' ? 'audio' : 'video');
    el.src = u; el.autoplay = true; el.playsInline = true; el.muted = !snd; el.preload = 'auto';
    const t0 = +m.t0 || 0, t1 = +m.t1 || 0;
    el.addEventListener('loadedmetadata', () => { if (t0) el.currentTime = t0; el.play().catch(() => {}); });
    if (t1 > t0) el.addEventListener('timeupdate', () => { if (el.currentTime >= t1) el.pause(); });
    box.innerHTML = cover; box.insertBefore(el, box.firstChild);
  });
}
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
