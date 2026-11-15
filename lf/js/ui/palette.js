// "Make LinkFlow Yours": 360° colour wheel, brightness, three presets. Light mode only; dark mode is fixed.
import { state } from '../state.js';
import { DEFAULT_CUSTOM } from '../demos/customization.js';

const KEY = 'linkflow.presets.v1';
const hsv2hex = (h, s, v) => {
  const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
};
const hex2hsv = (hex) => {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: mx ? d / mx : 0, v: mx };
};

export function initPalette() {
  const root = document.getElementById('personalize'); if (!root) return;
  const cv = root.querySelector('#wheel'), ctx = cv.getContext('2d'), val = root.querySelector('#bright');
  const chips = [...root.querySelectorAll('[data-el]')], slots = [...root.querySelectorAll('[data-slot]')];
  const modeBtns = [...root.querySelectorAll('[data-theme-mode]')], hexOut = root.querySelector('#hexout');
  let el = 'accent', hsv = hex2hsv(state.custom.accent), active = 0, presets = [null, null, null], drag = false, size = 0;
  try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(p) && p.length === 3) presets = p; } catch (e) { /* storage unavailable */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(presets)); } catch (e) { /* ignore */ } };

  function drawWheel() {
    const dpr = Math.min(devicePixelRatio || 1, 2), css = cv.clientWidth || 220; size = Math.round(css * dpr);
    if (cv.width !== size) { cv.width = size; cv.height = size; }
    const img = ctx.createImageData(size, size), R = size / 2, v = hsv.v;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - R, dy = y + 0.5 - R, d = Math.hypot(dx, dy), i = (y * size + x) * 4;
      if (d > R) continue;
      const h = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360, s = Math.min(1, d / (R - 1));
      const c = hsv2hex(h, s, v), n = parseInt(c.slice(1), 16);
      img.data[i] = n >> 16; img.data[i + 1] = (n >> 8) & 255; img.data[i + 2] = n & 255; img.data[i + 3] = d > R - 1.5 ? 255 * (R - d) / 1.5 : 255;
    }
    ctx.putImageData(img, 0, 0);
    const a = (hsv.h * Math.PI) / 180, r = hsv.s * (R - 1), mx = R + Math.cos(a) * r, my = R + Math.sin(a) * r;
    ctx.lineWidth = 3 * dpr; ctx.strokeStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6 * dpr;
    ctx.beginPath(); ctx.arc(mx, my, 9 * dpr, 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = hsv2hex(hsv.h, hsv.s, hsv.v); ctx.beginPath(); ctx.arc(mx, my, 6.5 * dpr, 0, 7); ctx.fill();
  }
  const frameDraw = (() => { let q = 0; return () => { if (!q) q = requestAnimationFrame(() => { q = 0; drawWheel(); }); }; })();

  function paintUI() {
    chips.forEach((c) => { const on = c.dataset.el === el; c.setAttribute('aria-pressed', String(on)); c.style.setProperty('--sw', state.custom[c.dataset.el]); });
    hexOut.textContent = state.custom[el]; val.value = Math.round(hsv.v * 100);
    slots.forEach((s, i) => { const p = presets[i]; s.setAttribute('aria-pressed', String(i === active)); s.classList.toggle('empty', !p); s.style.setProperty('--sw', p ? p.accent : 'transparent'); s.querySelector('small').textContent = p ? 'Saved' : 'Empty'; });
    const dark = state.dark; root.classList.toggle('is-dark', dark);
    modeBtns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.themeMode === 'dark') === dark)));
    root.querySelectorAll('.pal-lock input, .pal-lock button').forEach((x) => { x.disabled = dark; });
  }
  function setFromHsv() { state.custom = { ...state.custom, [el]: hsv2hex(hsv.h, hsv.s, hsv.v) }; paintUI(); frameDraw(); }
  function pick(e) {
    const r = cv.getBoundingClientRect(), R = r.width / 2, dx = e.clientX - r.left - R, dy = e.clientY - r.top - R;
    hsv = { h: ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360, s: Math.min(1, Math.hypot(dx, dy) / (R - 1)), v: hsv.v }; setFromHsv();
  }
  cv.addEventListener('pointerdown', (e) => { if (state.dark) return; drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener('pointermove', (e) => { if (drag) pick(e); });
  cv.addEventListener('pointerup', () => { drag = false; }); cv.addEventListener('pointercancel', () => { drag = false; });
  cv.addEventListener('keydown', (e) => {
    const d = { ArrowRight: [6, 0], ArrowLeft: [-6, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] }[e.key]; if (!d || state.dark) return;
    e.preventDefault(); hsv = { h: (hsv.h + d[0] + 360) % 360, s: Math.max(0, Math.min(1, hsv.s + d[1])), v: hsv.v }; setFromHsv();
  });
  val.addEventListener('input', () => { hsv = { ...hsv, v: Math.max(0.2, val.value / 100) }; setFromHsv(); });
  chips.forEach((c) => c.addEventListener('click', () => { el = c.dataset.el; hsv = hex2hsv(state.custom[el]); paintUI(); frameDraw(); }));
  modeBtns.forEach((b) => b.addEventListener('click', () => { state.dark = b.dataset.themeMode === 'dark'; paintUI(); }));
  slots.forEach((s, i) => s.addEventListener('click', () => {
    active = i; if (presets[i]) { state.custom = { ...presets[i] }; hsv = hex2hsv(state.custom[el]); } paintUI(); frameDraw();
  }));
  root.querySelector('#save-preset').addEventListener('click', () => { presets[active] = { ...state.custom }; persist(); paintUI(); });
  root.querySelector('#reset-preset').addEventListener('click', () => { presets[active] = null; persist(); state.custom = { ...DEFAULT_CUSTOM }; hsv = hex2hsv(state.custom[el]); paintUI(); frameDraw(); });

  // Gentle self-playing demo until the visitor touches the wheel.
  let touched = false, t0 = performance.now();
  root.addEventListener('pointerdown', () => { touched = true; }, { once: true });
  root.addEventListener('keydown', () => { touched = true; }, { once: true });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let io; const loop = () => {
    if (touched || state.dark || reduce) return;
    const t = (performance.now() - t0) / 1000; el = 'accent';
    hsv = { h: (190 + t * 28) % 360, s: 0.78, v: 0.88 }; state.custom = { ...state.custom, accent: hsv2hex(hsv.h, hsv.s, hsv.v) }; paintUI(); frameDraw();
    requestAnimationFrame(loop);
  };
  if ('IntersectionObserver' in window && !reduce) { io = new IntersectionObserver((es) => { if (es[0].isIntersecting && !touched) { t0 = performance.now(); loop(); } }, { threshold: 0.4 }); io.observe(root); }
  addEventListener('resize', frameDraw, { passive: true });
  paintUI(); drawWheel();
}
