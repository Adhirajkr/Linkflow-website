// Phone as a virtual controller. Eight layouts (tabs in the page switch `o.mode`), haptics + gyro shown on both devices.
import { COL, DARK, pcApp, box, txt, icon, pill, rgba, seg } from './draw.js';
import { L, POSE } from './layout.js';
import { landscape } from './screen.js';

export const PRESET_NAMES = ['Xbox', 'PS5', 'Racing', 'FPS', 'Fight', 'Keyboard & Mouse', 'Media', 'Customise'];
const ACC = [COL.ok, COL.blue, COL.warn, '#FF6B6B', COL.purple, COL.teal, COL.cyan, COL.cyan];
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const DIM = 'rgba(255,255,255,.07)', EDGE = 'rgba(255,255,255,.28)';

const circ = (c, x, y, r, f, s, lw = 2) => { c.beginPath(); c.arc(x, y, r, 0, 7); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw; c.stroke(); } };
const hot = (t, i, n, rate = 1.6) => Math.floor(t * rate) % n === i;
function round(c, x, y, r, label, on, col, size) { circ(c, x, y, r, on ? rgba(col, 0.45) : DIM, on ? col : EDGE, on ? 3 : 1.6); if (label) txt(c, label, x, y + 1, { size: size || r * 0.9, w: 700, a: 'center', c: on ? '#fff' : COL.mute }); }
function key(c, x, y, w, h, label, on, col = COL.cyan, r = 12) { box(c, x, y, w, h, r, on ? rgba(col, 0.38) : DIM, on ? col : EDGE, on ? 2.4 : 1.3); if (label) txt(c, label, x + w / 2, y + h / 2 + 1, { size: Math.min(18, h * 0.42), w: 700, a: 'center', c: on ? '#fff' : COL.mute }); }
function stick(c, x, y, r, t, k, col) { circ(c, x, y, r, DIM, EDGE); const a = t * 1.5 + k; circ(c, x + Math.cos(a) * r * 0.32, y + Math.sin(a * 1.3) * r * 0.32, r * 0.52, rgba(col, 0.35), col, 2.5); }
function dpad(c, x, y, s, on, col) {
  box(c, x - s / 3, y - s, (s * 2) / 3, s * 2, 8, DIM, EDGE, 1.4); box(c, x - s, y - s / 3, s * 2, (s * 2) / 3, 8, DIM, EDGE, 1.4);
  const arm = [[x - s / 3, y - s, (s * 2) / 3, s * 0.7], [x + s * 0.3, y - s / 3, s * 0.7, (s * 2) / 3], [x - s / 3, y + s * 0.3, (s * 2) / 3, s * 0.7], [x - s, y - s / 3, s * 0.7, (s * 2) / 3]];
  if (on >= 0) box(c, ...arm[on], 6, rgba(col, 0.6), col, 1.5);
}
const shape = {
  tri: (c, x, y, r, col) => { c.beginPath(); c.moveTo(x, y - r * 0.55); c.lineTo(x + r * 0.5, y + r * 0.38); c.lineTo(x - r * 0.5, y + r * 0.38); c.closePath(); c.strokeStyle = col; c.lineWidth = 3; c.stroke(); },
  circ: (c, x, y, r, col) => circ(c, x, y, r * 0.42, null, col, 3),
  cross: (c, x, y, r, col) => { c.beginPath(); c.moveTo(x - r * 0.38, y - r * 0.38); c.lineTo(x + r * 0.38, y + r * 0.38); c.moveTo(x + r * 0.38, y - r * 0.38); c.lineTo(x - r * 0.38, y + r * 0.38); c.strokeStyle = col; c.lineWidth = 3; c.stroke(); },
  sq: (c, x, y, r, col) => { c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(x - r * 0.38, y - r * 0.38, r * 0.76, r * 0.76); },
};
const bar = (c, x, y, w, h, label, on, col) => key(c, x, y, w, h, label, on, col, h / 2);

const draw = [
  (c, W, H, t) => { // Xbox
    const a = ACC[0]; bar(c, 70, 24, 150, 34, 'LB', hot(t, 0, 6), a); bar(c, W - 220, 24, 150, 34, 'RB', hot(t, 1, 6), a);
    stick(c, 130, 150, 52, t, 0, a); dpad(c, 250, 300, 40, Math.floor(t * 1.6) % 4, a); stick(c, 440, 300, 48, t, 2, a);
    [[600, 90, 'Y', COL.warn, 2], [556, 140, 'X', COL.blue, 3], [644, 140, 'B', '#FF6B6B', 4], [600, 190, 'A', COL.ok, 5]].forEach(([x, y, l, col, i]) => round(c, x, y, 28, l, hot(t, i, 6), col, 22));
    circ(c, 340, 110, 14, DIM, EDGE); circ(c, 380, 110, 14, DIM, EDGE);
  },
  (c, W, H, t) => { // PS5
    const a = ACC[1]; bar(c, 70, 24, 150, 34, 'L1', hot(t, 0, 6), a); bar(c, W - 220, 24, 150, 34, 'R1', hot(t, 1, 6), a);
    dpad(c, 140, 150, 42, Math.floor(t * 1.6) % 4, a); box(c, 250, 80, 190, 100, 18, DIM, EDGE);
    stick(c, 250, 310, 48, t, 0, a); stick(c, 440, 310, 48, t, 2, a);
    [['tri', 600, 80, '#3DDC97', 2], ['circ', 650, 135, '#FF6B6B', 3], ['cross', 600, 190, '#6EA8FF', 4], ['sq', 550, 135, '#E58BFF', 5]].forEach(([s, x, y, col, i]) => { round(c, x, y, 28, '', hot(t, i, 6), col); shape[s](c, x, y, 52, col); });
  },
  (c, W, H, t) => { // Racing: tilt the phone to steer
    const a = ACC[2], ang = Math.sin(t * 1.2) * 0.6, cx = W / 2, cy = H / 2 - 6;
    c.save(); c.translate(cx, cy); c.rotate(ang); circ(c, 0, 0, 120, null, a, 14); circ(c, 0, 0, 120, null, 'rgba(255,255,255,.12)', 2);
    c.strokeStyle = rgba(a, 0.8); c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-118, 0); c.lineTo(-30, 0); c.moveTo(118, 0); c.lineTo(30, 0); c.moveTo(0, 118); c.lineTo(0, 30); c.stroke(); circ(c, 0, 0, 26, rgba(a, 0.35), a, 3); c.restore();
    txt(c, 'Tilt to steer', cx, 36, { size: 18, w: 600, a: 'center', c: COL.mute });
    key(c, 40, 190, 110, 190, 'BRAKE', hot(t, 0, 3, 0.9), '#FF6B6B', 18); key(c, W - 150, 150, 110, 230, 'GAS', hot(t, 1, 3, 0.9), COL.ok, 18);
    bar(c, 40, 60, 90, 36, 'SHIFT -', false, a); bar(c, W - 130, 60, 90, 36, 'SHIFT +', false, a);
  },
  (c, W, H, t) => { // FPS
    const a = ACC[3]; stick(c, 120, 290, 62, t, 0, a); box(c, 290, 40, 220, 350, 20, 'rgba(255,255,255,.04)', EDGE, 1.4); txt(c, 'Look', 400, 70, { size: 16, c: COL.mute, a: 'center' });
    circ(c, 400 + Math.sin(t * 1.4) * 60, 215 + Math.cos(t * 1.1) * 50, 18, rgba(a, 0.4), a, 2.5);
    round(c, 600, 250, 52, 'FIRE', hot(t, 0, 4, 1.2), a, 20); round(c, 520, 120, 30, 'ADS', hot(t, 1, 4, 1.2), COL.blue, 15); round(c, 630, 120, 30, 'JUMP', hot(t, 2, 4, 1.2), COL.ok, 13);
    key(c, 40, 40, 90, 40, 'RELOAD', hot(t, 3, 4, 1.2), COL.warn, 12); key(c, 40, 100, 90, 40, 'CROUCH', false, COL.teal, 12);
  },
  (c, W, H, t) => { // Fight
    const a = ACC[4]; dpad(c, 140, 230, 56, Math.floor(t * 1.6) % 4, a);
    ['LP', 'MP', 'HP', 'LK', 'MK', 'HK'].forEach((l, i) => round(c, 400 + (i % 3) * 90, 150 + Math.floor(i / 3) * 100, 34, l, hot(t, i, 8, 1.4), i < 3 ? a : COL.cyan, 18));
    key(c, 400, 330, 120, 44, 'SPECIAL', hot(t, 6, 8, 1.4), COL.warn, 14); key(c, 540, 330, 100, 44, 'GUARD', hot(t, 7, 8, 1.4), COL.blue, 14);
  },
  (c, W, H, t) => { // Keyboard & mouse
    const a = ACC[5]; const k = (x, y, l, i) => key(c, x, y, 56, 56, l, hot(t, i, 7, 1.5), a, 12);
    k(100, 70, 'W', 0); k(36, 134, 'A', 1); k(100, 134, 'S', 2); k(164, 134, 'D', 3);
    key(c, 36, 214, 184, 44, 'SPACE', hot(t, 4, 7, 1.5), a, 12); key(c, 36, 274, 86, 40, 'SHIFT', hot(t, 5, 7, 1.5), a, 12); key(c, 134, 274, 86, 40, 'CTRL', hot(t, 6, 7, 1.5), a, 12);
    box(c, 290, 50, 360, 250, 22, 'rgba(255,255,255,.04)', EDGE, 1.4); txt(c, 'Mouse pad', 470, 80, { size: 16, c: COL.mute, a: 'center' });
    circ(c, 470 + Math.sin(t * 1.5) * 90, 180 + Math.sin(t * 2.1) * 50, 16, rgba(a, 0.4), a, 2.5);
    key(c, 290, 316, 176, 56, 'LEFT', hot(t, 0, 5, 0.8), a, 14); key(c, 474, 316, 176, 56, 'RIGHT', hot(t, 3, 5, 0.8), a, 14);
  },
  (c, W, H, t) => { // Media
    const a = ACC[6], cx = W / 2; round(c, cx, 150, 56, '', hot(t, 0, 3, 0.7), a); const pl = Math.floor(t * 0.7) % 2;
    c.fillStyle = '#fff'; if (pl) { c.fillRect(cx - 14, 132, 10, 36); c.fillRect(cx + 4, 132, 10, 36); } else { c.beginPath(); c.moveTo(cx - 12, 130); c.lineTo(cx + 16, 150); c.lineTo(cx - 12, 170); c.fill(); }
    round(c, cx - 140, 150, 38, '<<', false, a, 20); round(c, cx + 140, 150, 38, '>>', false, a, 20);
    box(c, 70, 250, W - 140, 10, 5, 'rgba(255,255,255,.14)'); box(c, 70, 250, (W - 140) * (0.2 + 0.6 * ((t * 0.08) % 1)), 10, 5, a);
    txt(c, 'Volume', 70, 310, { size: 15, c: COL.mute }); box(c, 150, 304, 220, 10, 5, 'rgba(255,255,255,.14)'); box(c, 150, 304, 220 * (0.4 + 0.3 * Math.sin(t)), 10, 5, COL.ok); key(c, 420, 288, 110, 44, 'MUTE', false, a, 14); key(c, 546, 288, 90, 44, 'FULL', false, a, 14);
  },
  (c, W, H, t) => { // Customise: a button gets picked up and moved onto a grid
    const a = ACC[7]; c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; for (let x = 40; x < W; x += 52) { c.beginPath(); c.moveTo(x, 20); c.lineTo(x, H - 20); c.stroke(); } for (let y = 20; y < H; y += 52) { c.beginPath(); c.moveTo(20, y); c.lineTo(W - 20, y); c.stroke(); }
    const p = (Math.sin(t * 1.1) + 1) / 2; stick(c, 150, 280, 52, t, 0, a); round(c, 540, 120, 34, 'A', false, COL.ok, 22); round(c, 620, 200, 34, 'B', false, '#FF6B6B', 22);
    const mx = 250 + p * 220, my = 100 + p * 60; c.setLineDash([8, 6]); circ(c, 470, 160, 38, null, a, 2); c.setLineDash([]); round(c, mx, my, 34, 'X', true, COL.blue, 22);
    key(c, 40, 24, 130, 40, '+ Add button', false, a, 12); key(c, W - 170, H - 64, 130, 40, 'Save layout', false, COL.ok, 12);
  },
];

function phoneView(ctx, W, H, t, mode) {
  landscape(ctx, W, H, (cw, ch) => {
    const g = ctx.createLinearGradient(0, 0, cw, ch); g.addColorStop(0, '#0b1325'); g.addColorStop(1, '#141a42'); ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    draw[mode](ctx, cw, ch, t);
    const pulse = (t * 1.6) % 1; pill(ctx, cw / 2 - 46, ch - 34, 'Haptics', ACC[mode], { dot: true, h: 26, size: 12, fill: 0.1 + 0.3 * (1 - pulse) });
    pill(ctx, cw / 2 + 52, ch - 34, 'Gyro', COL.purple, { dot: true, h: 26, size: 12 });
  });
}

function pcView(ctx, W, H, t, mode) {
  const r = pcApp(ctx, W, H, { active: -1, connected: true }), a = ACC[mode];
  txt(ctx, 'Controller', r.x + 6, r.y + 14, { size: 24, w: 700 }); pill(ctx, r.x + r.w - 4, r.y + 2, PRESET_NAMES[mode], a, { right: true, h: 28 });
  const short = ['Xbox', 'PS5', 'Racing', 'FPS', 'Fight', 'KB+Mouse', 'Media', 'Custom'], cw = (r.w - 7 * 8) / 8;
  short.forEach((n, i) => key(ctx, r.x + i * (cw + 8), r.y + 48, cw, 38, n, i === mode, ACC[i], 19));
  const y0 = r.y + 112, h = r.h - 130, pw = (r.w - 24) / 3;
  const panel = (i, title) => { const x = r.x + i * (pw + 12); box(ctx, x, y0, pw, h, 18, DARK.surf, DARK.line); txt(ctx, title, x + 18, y0 + 24, { size: 14, w: 700, c: COL.mute }); return x; };
  let x = panel(0, 'Input');
  const cx = x + pw / 2, cy = y0 + h / 2 + 10, R = Math.min(pw, h) * 0.3; circ(ctx, cx, cy, R, 'rgba(255,255,255,.04)', DARK.line); circ(ctx, cx + Math.cos(t * 1.5) * R * 0.5, cy + Math.sin(t * 1.9) * R * 0.5, 14, rgba(a, 0.5), a, 2.5);
  x = panel(1, 'Gyro tilt');
  box(ctx, x + 24, y0 + 80, pw - 48, 10, 5, 'rgba(255,255,255,.14)'); const gx = x + pw / 2 + Math.sin(t * 1.3) * (pw / 2 - 40); circ(ctx, gx, y0 + 85, 13, a);
  box(ctx, x + 24, y0 + 140, pw - 48, 10, 5, 'rgba(255,255,255,.14)'); circ(ctx, x + pw / 2 + Math.sin(t * 0.9 + 1) * (pw / 2 - 40), y0 + 145, 13, COL.purple);
  txt(ctx, 'Left / right', x + 24, y0 + 62, { size: 13, c: COL.mute }); txt(ctx, 'Forward / back', x + 24, y0 + 122, { size: 13, c: COL.mute });
  x = panel(2, 'Haptic feedback');
  for (let i = 0; i < 12; i++) { const v = Math.max(0.12, Math.abs(Math.sin(t * 3 + i * 0.6))), bh = v * (h - 110); box(ctx, x + 22 + i * ((pw - 44) / 12), y0 + h - 24 - bh, (pw - 44) / 12 - 4, bh, 3, rgba(a, 0.85)); }
}

export const controller = {
  id: 'controller', duration: 9, modes: 8, ease: 3, still: 2.4,
  layout: (t, o = {}) => {
    const m = o.mode || 0;
    return L({
      lap: { x: -0.9, y: -0.6, z: -0.3, ry: 0.22 },
      ph: { x: 2.3, y: -0.12, z: 0.05, ry: -0.5 + Math.sin(t * 0.8) * 0.12, rx: Math.sin(t * 1.3) * 0.1, rz: Math.PI / 2 + Math.sin(t * 1.1) * 0.07, s: 1.12 },
      flow: 0.8, dir: 1, ext: { w: 7.2, h: 4.2 }, col: rgb(ACC[m]), glow: [...rgb(ACC[m]), 0.5],
    });
  },
  pc: (ctx, W, H, t, o = {}) => pcView(ctx, W, H, t, o.mode || 0),
  phone: (ctx, W, H, t, o = {}) => phoneView(ctx, W, H, t, o.mode || 0),
};
