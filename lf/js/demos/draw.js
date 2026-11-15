// Shared 2D drawing kit for everything that appears ON the device screens.
import { ICONS, FILLED } from '../icons.js';
export { clamp, lerp, ease, easeOut, seg } from '../gl/math.js';
import { clamp, ease, easeOut, seg } from '../gl/math.js';

export const COL = { bg: '#080E19', bg2: '#0D1726', cyan: '#16B8D0', teal: '#22B7A5', blue: '#477FF5', purple: '#825CF5', text: '#F5F8FF', mute: '#A7B4C8', ok: '#2CCB8A', warn: '#F5B642' };

export const DARK = { dark: true, wall: ['#070C16', '#0C1B33'], win: '#0C1626', side: 'rgba(255,255,255,.035)', surf: 'rgba(255,255,255,.055)', line: 'rgba(90,210,230,.2)', acc: COL.cyan, acc2: COL.teal, tx: COL.text, tx2: COL.mute, bar: 'rgba(8,14,25,.85)' };
export function lightTheme(c) {
  return { dark: false, wall: [c.bg, c.bg], win: c.bg, side: c.surface, surf: c.surface, line: 'rgba(20,30,50,.14)', acc: c.accent, acc2: c.accent, tx: c.text, tx2: c.text + 'B3', bar: c.surface };
}

export const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); };
export function box(ctx, x, y, w, h, r, fill, stroke, lw = 1) {
  rr(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.w || 500} ${o.size || 16}px "Segoe UI Variable","Segoe UI",system-ui,Roboto,sans-serif`;
  ctx.fillStyle = o.c || COL.text; ctx.textAlign = o.a || 'left'; ctx.textBaseline = o.base || 'middle';
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.fillText(s, x, y); ctx.restore();
}
export function icon(ctx, name, cx, cy, s, color, lw = 1.8) {
  ctx.save(); ctx.translate(cx - s / 2, cy - s / 2); ctx.scale(s / 24, s / 24);
  if (FILLED[name]) { ctx.fillStyle = color; ctx.fill(new Path2D(FILLED[name])); }
  else { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(new Path2D(ICONS[name])); }
  ctx.restore();
}
export function glow(ctx, x, y, r, color, a = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace('A', a)); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
export function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
export function pill(ctx, x, y, label, color, o = {}) {
  const h = o.h || 26, size = o.size || 12;
  ctx.save(); ctx.font = `600 ${size}px "Segoe UI",system-ui,sans-serif`;
  const w = ctx.measureText(label).width + (o.dot ? 32 : 22); ctx.restore();
  const ax = o.right ? x - w : x;
  box(ctx, ax, y, w, h, h / 2, rgba(color, o.fill ?? 0.16), rgba(color, 0.55));
  if (o.dot) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(ax + 13, y + h / 2, 3.5, 0, 7); ctx.fill(); }
  txt(ctx, label, ax + (o.dot ? 23 : 11), y + h / 2 + 0.5, { size, w: 600, c: color });
  return w;
}

// Illustrative pairing symbol. Deliberately NOT a scannable QR code.
export function qr(ctx, x, y, size, seed = 5, fg = '#0A1220', bg = '#F5F8FF') {
  const n = 21, c = size / n; let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  box(ctx, x - c, y - c, size + c * 2, size + c * 2, c * 1.6, bg);
  ctx.fillStyle = fg;
  const finder = (ox, oy) => {
    ctx.fillRect(x + ox * c, y + oy * c, 7 * c, 7 * c); ctx.fillStyle = bg; ctx.fillRect(x + (ox + 1) * c, y + (oy + 1) * c, 5 * c, 5 * c);
    ctx.fillStyle = fg; ctx.fillRect(x + (ox + 2) * c, y + (oy + 2) * c, 3 * c, 3 * c);
  };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const inF = (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
    if (!inF && rnd() > 0.5) ctx.fillRect(x + i * c, y + j * c, c * 0.92, c * 0.92);
  }
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
}

export function logo(ctx, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4);
  const g = ctx.createLinearGradient(-s, -s, s, s); g.addColorStop(0, COL.cyan); g.addColorStop(1, COL.teal);
  ctx.strokeStyle = g; ctx.lineWidth = s * 0.19; ctx.lineCap = 'round';
  rr(ctx, -s * 0.78, -s * 0.3, s * 1.0, s * 0.6, s * 0.3); ctx.stroke();
  rr(ctx, -s * 0.22, -s * 0.3, s * 1.0, s * 0.6, s * 0.3); ctx.stroke();
  ctx.restore();
}

export const NAV = [['lock', 'Pairing'], ['clip', 'Clipboard'], ['file', 'Files'], ['camera', 'Camera'], ['screen', 'Screen'], ['audio', 'Audio'], ['usb', 'USB'], ['pad', 'Trackpad']];

// Windows-style desktop wallpaper + LinkFlow window. Returns the content rect.
export function pcApp(ctx, W, H, o = {}) {
  const th = o.th || DARK;
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, th.wall[0]); g.addColorStop(1, th.wall[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (th.dark) {
    let r = ctx.createRadialGradient(W * 0.15, H * 0.95, 0, W * 0.15, H * 0.95, W * 0.6); r.addColorStop(0, 'rgba(22,184,208,.28)'); r.addColorStop(1, 'rgba(22,184,208,0)');
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
    r = ctx.createRadialGradient(W * 0.95, H * 0.05, 0, W * 0.95, H * 0.05, W * 0.55); r.addColorStop(0, 'rgba(130,92,245,.26)'); r.addColorStop(1, 'rgba(130,92,245,0)');
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  }
  // taskbar
  ctx.fillStyle = th.dark ? 'rgba(6,10,18,.8)' : 'rgba(255,255,255,.7)'; ctx.fillRect(0, H - 42, W, 42);
  for (let i = 0; i < 6; i++) box(ctx, W / 2 - 100 + i * 36, H - 32, 22, 22, 6, i === 0 ? th.acc : th.dark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.14)');
  if (o.bare) return { x: 0, y: 0, w: W, h: H - 42 };
  const wx = 60, wy = 36, ww = W - 120, wh = H - 36 - 42 - 24;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  box(ctx, wx, wy, ww, wh, 16, th.win); ctx.restore();
  box(ctx, wx, wy, ww, wh, 16, null, th.line);
  logo(ctx, wx + 28, wy + 24, 11); txt(ctx, 'LinkFlow', wx + 48, wy + 24, { size: 15, w: 700, c: th.tx });
  const conn = o.connected;
  pill(ctx, wx + ww - 18, wy + 11, conn ? 'Connected' : (o.status || 'Not connected'), conn ? COL.ok : '#7E8CA3', { right: true, dot: true, h: 26 });
  ctx.fillStyle = th.line; ctx.fillRect(wx, wy + 48, ww, 1);
  // sidebar
  const sx = wx + 12, sy = wy + 62;
  NAV.forEach(([ic, label], i) => {
    const y = sy + i * 44, act = o.active === i;
    if (act) { box(ctx, sx, y, 160, 38, 11, rgba(th.acc.length === 7 ? th.acc : COL.cyan, th.dark ? 0.16 : 0.18), rgba(th.acc.length === 7 ? th.acc : COL.cyan, 0.5)); }
    icon(ctx, ic, sx + 22, y + 19, 18, act ? th.acc : th.tx2);
    txt(ctx, label, sx + 42, y + 19.5, { size: 14, w: act ? 650 : 500, c: act ? th.tx : th.tx2 });
  });
  return { x: wx + 188, y: wy + 62, w: ww - 188 - 18, h: wh - 62 - 16 };
}

// Phone app chrome. Returns content rect.
export function phoneApp(ctx, W, H, o = {}) {
  const th = o.th || DARK;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.dark ? '#0B1527' : th.wall[0]); g.addColorStop(1, th.dark ? '#070C16' : th.wall[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (th.dark) { const r = ctx.createRadialGradient(W * 0.9, 0, 0, W * 0.9, 0, W); r.addColorStop(0, 'rgba(130,92,245,.25)'); r.addColorStop(1, 'rgba(130,92,245,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H); }
  box(ctx, W / 2 - 14, 18, 28, 28, 14, '#000');
  logo(ctx, 40, 92, 13); txt(ctx, o.title || 'LinkFlow', 64, 92, { size: 22, w: 700, c: th.tx });
  pill(ctx, W - 22, 78, o.connected ? 'Connected' : (o.status || 'Not connected'), o.connected ? COL.ok : '#7E8CA3', { right: true, dot: true, h: 28, size: 12.5 });
  // bottom nav
  ctx.fillStyle = th.bar; ctx.fillRect(0, H - 86, W, 86);
  ctx.fillStyle = th.line; ctx.fillRect(0, H - 86, W, 1);
  ['phone', 'file', 'screen', 'pad'].forEach((ic, i) => icon(ctx, ic, W * (0.14 + i * 0.24), H - 52, 26, i === (o.nav ?? 0) ? th.acc : th.tx2));
  box(ctx, W / 2 - 60, H - 14, 120, 5, 3, 'rgba(255,255,255,.35)');
  return { x: 22, y: 136, w: W - 44, h: H - 136 - 100 };
}

export function ribbon(ctx, W, label = 'IN DEVELOPMENT', y = 0) {
  ctx.save(); ctx.font = '700 12px "Segoe UI",system-ui,sans-serif';
  const w = ctx.measureText(label).width + 28;
  box(ctx, W - w - 14, y + 14, w, 26, 13, 'rgba(245,182,66,.14)', 'rgba(245,182,66,.7)');
  txt(ctx, label, W - w / 2 - 14, y + 27.5, { size: 12, w: 700, c: COL.warn, a: 'center' });
  ctx.restore();
}

export function cursor(ctx, x, y, s = 1, c = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(6, 17); ctx.lineTo(10.5, 27); ctx.lineTo(14, 25.5); ctx.lineTo(9.5, 16); ctx.lineTo(17, 16); ctx.closePath();
  ctx.fillStyle = c; ctx.strokeStyle = '#06101c'; ctx.lineWidth = 1.6; ctx.fill(); ctx.stroke(); ctx.restore();
}
export function ripple(ctx, x, y, p, color = COL.cyan, r = 40) {
  if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, 8 + r * easeOut(p), 0, 7); ctx.stroke(); ctx.restore();
}
export function spinner(ctx, x, y, r, t, color = COL.cyan) {
  ctx.save(); ctx.strokeStyle = rgba(color, 0.2); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, t * 6, t * 6 + 1.6); ctx.stroke(); ctx.restore();
}
export function checkBadge(ctx, x, y, r, p, color = COL.ok) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = easeOut(p) * (1 + 0.12 * Math.sin(p * Math.PI)); ctx.scale(s, s);
  ctx.fillStyle = rgba(color, 0.18); ctx.beginPath(); ctx.arc(0, 0, r * 1.35, 0, 7); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#06101c'; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.08, r * 0.36); ctx.lineTo(r * 0.46, -r * 0.32); ctx.stroke(); ctx.restore();
}
export function progressBar(ctx, x, y, w, h, p, color = COL.cyan) {
  box(ctx, x, y, w, h, h / 2, 'rgba(255,255,255,.1)');
  if (p > 0) { const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, COL.cyan); g.addColorStop(1, color); box(ctx, x, y, Math.max(h, w * p), h, h / 2, g); }
}

// Generic scrolling desktop used by several demos.
export function desktop(ctx, W, H, t, th = DARK) {
  const r = pcApp(ctx, W, H, { th, bare: true });
  // browser-ish window with animated bars
  const x = 70, y = 40, w = W - 300, h = H - 150;
  box(ctx, x, y, w, h, 14, '#0E1A2E', 'rgba(255,255,255,.09)');
  box(ctx, x, y, w, 34, 14, 'rgba(255,255,255,.05)');
  ['#ff6b6b', '#f5b642', '#2ccb8a'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 20 + i * 18, y + 17, 5, 0, 7); ctx.fill(); });
  txt(ctx, 'Weekly overview', x + 90, y + 18, { size: 13, c: COL.mute });
  for (let i = 0; i < 9; i++) {
    const bh = (0.35 + 0.55 * Math.abs(Math.sin(i * 1.3 + t * 0.8))) * (h - 120);
    const bx = x + 30 + i * ((w - 60) / 9);
    const gr = ctx.createLinearGradient(0, y + h - 24 - bh, 0, y + h - 24); gr.addColorStop(0, i % 3 === 0 ? COL.purple : COL.cyan); gr.addColorStop(1, 'rgba(22,184,208,.15)');
    box(ctx, bx, y + h - 24 - bh, (w - 60) / 9 - 14, bh, 8, gr);
  }
  // side notes window
  box(ctx, W - 215, 70, 175, 230, 14, '#101D33', 'rgba(255,255,255,.09)');
  txt(ctx, 'Tasks', W - 197, 96, { size: 14, w: 700 });
  for (let i = 0; i < 4; i++) { box(ctx, W - 197, 120 + i * 40, 16, 16, 5, null, COL.cyan); box(ctx, W - 170, 124 + i * 40, 100 - (i % 2) * 24, 8, 4, 'rgba(255,255,255,.16)'); }
  return r;
}

export function phoneHome(ctx, W, H, t, th = DARK) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#12254a'); g.addColorStop(0.55, '#1c1650'); g.addColorStop(1, '#0a3a4a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  txt(ctx, '9:41', W / 2, 150, { size: 78, w: 300, a: 'center' });
  txt(ctx, 'Friday, 13 November', W / 2, 205, { size: 20, c: 'rgba(255,255,255,.75)', a: 'center' });
  const cols = [COL.cyan, COL.purple, COL.teal, COL.blue, '#F5B642', '#ff6b8b'];
  const ics = ['image', 'note', 'camera', 'clip', 'file', 'wifi', 'audio', 'screen', 'clock', 'palette', 'phone', 'mic'];
  ics.forEach((ic, i) => {
    const cx = W * (0.17 + (i % 4) * 0.222), cy = 330 + Math.floor(i / 4) * 118 + Math.sin(t * 1.4 + i) * 2;
    box(ctx, cx - 36, cy - 36, 72, 72, 20, cols[i % cols.length] + '', null); ctx.fillStyle = 'rgba(8,14,25,.35)'; rr(ctx, cx - 36, cy - 36, 72, 72, 20); ctx.fill();
    icon(ctx, ic, cx, cy, 34, '#fff');
  });
  box(ctx, W * 0.07, H - 190, W * 0.86, 120, 32, 'rgba(255,255,255,.12)');
  ['phone', 'wifi', 'camera', 'note'].forEach((ic, i) => icon(ctx, ic, W * (0.2 + i * 0.2), H - 130, 40, '#fff'));
}

export { clamp as _c, ease as _e };

// ---- 4-digit PIN pairing visuals (illustrative PIN, not a real code) ----
export const DEMO_PIN = '4826';
export function pinBoxes(ctx, cx, cy, size, shown, mask = false, color = COL.cyan) {
  const gap = size * 0.22, total = size * 4 + gap * 3, x0 = cx - total / 2;
  for (let i = 0; i < 4; i++) {
    const on = i < shown, x = x0 + i * (size + gap);
    box(ctx, x, cy - size / 2, size, size * 1.15, size * 0.2, on ? rgba(color, 0.16) : DARK.surf, on ? rgba(color, 0.9) : DARK.line, on ? 2.2 : 1.4);
    if (on) { if (mask) { ctx.fillStyle = COL.text; ctx.beginPath(); ctx.arc(x + size / 2, cy + size * 0.07, size * 0.11, 0, 7); ctx.fill(); } else txt(ctx, DEMO_PIN[i], x + size / 2, cy + size * 0.07, { size: size * 0.62, w: 700, a: 'center' }); }
  }
}
export function keypad(ctx, x, y, w, h, hot = -1) {
  const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '<'], kw = (w - 20) / 3, kh = (h - 30) / 4;
  labels.forEach((l, i) => {
    if (!l) return; const kx = x + (i % 3) * (kw + 10), ky = y + Math.floor(i / 3) * (kh + 10), on = l === String(hot);
    box(ctx, kx, ky, kw, kh, kh / 2.4, on ? rgba(COL.cyan, 0.4) : 'rgba(255,255,255,.07)', on ? COL.cyan : DARK.line, on ? 2.2 : 1);
    txt(ctx, l, kx + kw / 2, ky + kh / 2 + 1, { size: 30, w: 600, a: 'center', c: on ? '#fff' : COL.text });
  });
}
// Phone screen where the PIN is typed. t = seconds since entry started.
export function pinEntry(ctx, W, H, t, done = false) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d1a2e'); g.addColorStop(1, '#050a14'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  txt(ctx, 'Enter the PIN', W / 2, 120, { size: 30, w: 700, a: 'center' }); txt(ctx, 'Shown on your PC', W / 2, 160, { size: 18, c: COL.mute, a: 'center' });
  const n = done ? 4 : Math.min(4, Math.floor(t / 0.55));
  pinBoxes(ctx, W / 2, 260, 72, n, true, done ? COL.ok : COL.cyan);
  if (done) { spinner(ctx, W / 2, 520, 34, t, COL.cyan); txt(ctx, 'Pairing…', W / 2, 600, { size: 24, w: 600, a: 'center' }); return; }
  keypad(ctx, 40, 380, W - 80, 480, n < 4 ? DEMO_PIN[n] : -1);
}
