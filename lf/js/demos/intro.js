// Hero, live "connection" sequence (scroll-scrubbed) and the closing "devices together" finale.
import { COL, DARK, NAV, pcApp, phoneApp, box, txt, icon, pill, pinBoxes, pinEntry, qr, spinner, checkBadge, rgba, ease, easeOut, seg, clamp } from './draw.js';
import { L, POSE, kf } from './layout.js';

export function dashboardPC(ctx, W, H, t, connected = true, lit = -1) {
  const r = pcApp(ctx, W, H, { active: -1, connected });
  txt(ctx, 'Dashboard', r.x + 6, r.y + 14, { size: 24, w: 700 });
  txt(ctx, connected ? 'Your phone is linked and ready.' : 'Waiting for your phone…', r.x + 6, r.y + 44, { size: 14, c: COL.mute });
  box(ctx, r.x, r.y + 72, r.w, 88, 18, DARK.surf, DARK.line);
  box(ctx, r.x + 18, r.y + 90, 52, 52, 14, rgba(COL.cyan, 0.15), rgba(COL.cyan, 0.5)); icon(ctx, 'phone', r.x + 44, r.y + 116, 26, COL.cyan);
  txt(ctx, 'Your Phone', r.x + 88, r.y + 106, { size: 18, w: 700 }); txt(ctx, connected ? 'Android · paired' : 'Android · searching', r.x + 88, r.y + 132, { size: 13, c: COL.mute });
  const cw = (r.w - 36) / 4, ch = (r.h - 184 - 12) / 2, act = lit >= 0 ? lit : Math.floor(t * 1.1) % 8;
  NAV.forEach(([ic, label], i) => {
    const x = r.x + (i % 4) * (cw + 12), y = r.y + 176 + Math.floor(i / 4) * (ch + 12);
    const on = connected && (lit >= 0 ? i < lit : i === act), soon = i === 5 || i === 6;
    box(ctx, x, y, cw, ch, 18, on ? rgba(COL.cyan, 0.14) : DARK.surf, on ? rgba(COL.cyan, 0.7) : DARK.line, on ? 1.6 : 1);
    icon(ctx, ic, x + cw / 2, y + ch / 2 - 12, 30, on ? COL.cyan : COL.mute);
    txt(ctx, label, x + cw / 2, y + ch / 2 + 26, { size: 14, w: 600, a: 'center', c: on ? COL.text : COL.mute });
    if (soon) pill(ctx, x + cw - 8, y + 8, 'Soon', COL.warn, { right: true, h: 20, size: 10.5 });
  });
}
export function dashboardPhone(ctx, W, H, t, connected = true) {
  const r = phoneApp(ctx, W, H, { connected, nav: 0 });
  box(ctx, r.x, r.y, r.w, 118, 22, DARK.surf, DARK.line);
  box(ctx, r.x + 18, r.y + 22, 74, 74, 20, rgba(COL.cyan, 0.15), rgba(COL.cyan, 0.5)); icon(ctx, 'pc', r.x + 55, r.y + 59, 34, COL.cyan);
  txt(ctx, 'Your PC', r.x + 108, r.y + 46, { size: 24, w: 700 }); txt(ctx, connected ? 'Windows · paired' : 'Searching…', r.x + 108, r.y + 78, { size: 16, c: COL.mute });
  const rows = [['clip', 'Clipboard sync'], ['file', 'File transfer'], ['screen', 'Screen sharing'], ['pad', 'Trackpad']];
  const act = Math.floor(t * 1.1) % 4;
  rows.forEach(([ic, l], i) => {
    const y = r.y + 140 + i * 92, on = connected && i === act;
    box(ctx, r.x, y, r.w, 78, 20, on ? rgba(COL.cyan, 0.13) : DARK.surf, on ? rgba(COL.cyan, 0.65) : DARK.line, on ? 1.6 : 1);
    icon(ctx, ic, r.x + 42, y + 39, 28, on ? COL.cyan : COL.mute); txt(ctx, l, r.x + 80, y + 40, { size: 20, w: 600 });
    box(ctx, r.x + r.w - 70, y + 24, 48, 28, 14, connected ? rgba(COL.ok, 0.9) : 'rgba(255,255,255,.15)'); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r.x + r.w - (connected ? 36 : 56), y + 38, 11, 0, 7); ctx.fill();
  });
  box(ctx, r.x, r.y + 520, r.w, 60, 18, rgba(COL.purple, 0.12), rgba(COL.purple, 0.4)); txt(ctx, 'Audio & USB · in development', r.x + r.w / 2, r.y + 551, { size: 16, c: '#BBA8FF', a: 'center', w: 600 });
}

export const hero = {
  id: 'hero', duration: 14, ease: 2.6,
  layout: (t) => L({
    lap: { x: -0.25, y: -0.7, z: -0.3, ry: 0.26 }, ph: { x: 2.35, y: -0.45, z: 0.9, ry: -0.42, s: 0.98 },
    rig: { ry: Math.sin(t * 0.35) * 0.16, rx: Math.sin(t * 0.27) * 0.04 }, ext: { w: 7.0, h: 4.2 },
    icons: 1, iconsOn: 8, flow: 0.9, dir: 0,
  }),
  pc: (c, W, H, t) => dashboardPC(c, W, H, t, true),
  phone: (c, W, H, t) => dashboardPhone(c, W, H, t, true),
};

// ---- Scroll-scrubbed connection demo: t runs 0..10 with scroll progress ----
export const connect = {
  id: 'connect', duration: 10, scrub: true, ease: 7, still: 8,
  steps: [0.1, 1.3, 2.9, 5.6, 6.5, 7.0, 7.6],
  layout: (t) => {
    const pIn = kf(t, [[0, 0.01], [1.2, 1]]), lIn = kf(t, [[1.1, 0.01], [2.0, 1]]);
    const near = kf(t, [[3.9, 0], [4.9, 1], [5.7, 1], [6.8, 0]]);
    return L({
      lap: { x: kf(t, [[1.1, 6.5], [2.6, 1.15]]), y: -0.6, z: -0.2, ry: kf(t, [[1.1, 0.7], [2.6, -0.3]]), open: kf(t, [[1.3, 0], [3, 1.78]]), s: lIn },
      ph: { x: kf(t, [[0, -7], [1.6, -2.1]]) + near * 0.75, y: -0.35 + near * 0.35, z: 0.5 + near * 0.8, ry: kf(t, [[0, -2.4], [1.6, 0.34]]) + near * 0.12, rz: 0, s: pIn },
      rig: { ry: kf(t, [[0, -0.4], [4, 0.0], [10, 0.12]]), rx: 0.02 }, ext: { w: 6.6, h: 4.5 },
      flow: kf(t, [[6.3, 0], [7.3, 1]]), dir: 0, icons: kf(t, [[6.7, 0], [7.4, 1]]), iconsOn: kf(t, [[7.4, 0], [9.8, 8]]),
      glow: [0.09, 0.72, 0.82, 0.25 + 0.4 * kf(t, [[6.4, 0], [7.2, 1]])],
    });
  },
  pc: (ctx, W, H, t) => {
    if (t < 2.4) { // booting screen
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#070C16'); g.addColorStop(1, '#0C1B33'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.5 + 0.5 * seg(t, 1.2, 2.2); import_logo(ctx, W / 2, H / 2, 46); ctx.globalAlpha = 1; return;
    }
    if (t >= 6.6) { dashboardPC(ctx, W, H, t, true, Math.floor(seg(t, 7.4, 9.8) * 8)); return; }
    const r = pcApp(ctx, W, H, { active: 0, connected: false, status: t > 5.7 ? 'Pairing…' : 'Waiting' });
    const sc = easeOut(seg(t, 2.6, 3.4)), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(0.6 + 0.4 * sc, 0.6 + 0.4 * sc); ctx.globalAlpha = sc;
    txt(ctx, 'Enter this PIN in LinkFlow on your phone', 0, -90, { size: 18, w: 600, a: 'center' });
    pinBoxes(ctx, 0, 0, 64, 4, false);
    txt(ctx, 'Secure pairing between your own devices', 0, 90, { size: 14, c: COL.mute, a: 'center' });
    ctx.restore();
    if (t > 5.7) { ctx.fillStyle = 'rgba(8,14,25,.78)'; ctx.fillRect(r.x - 10, r.y - 10, r.w + 20, r.h + 20); spinner(ctx, cx, cy - 10, 36, t, COL.cyan); txt(ctx, 'Pairing…', cx, cy + 60, { size: 20, w: 600, a: 'center' }); }
  },
  phone: (ctx, W, H, t) => {
    if (t >= 6.6) { dashboardPhone(ctx, W, H, t, true); checkBadge(ctx, W / 2, H / 2 - 120, 52, seg(t, 6.6, 7.2)); if (t < 7.6) { ctx.fillStyle = `rgba(8,14,25,${0.8 * (1 - seg(t, 7.1, 7.6))})`; ctx.fillRect(0, 0, W, H); checkBadge(ctx, W / 2, H / 2, 64, seg(t, 6.6, 7.0)); txt(ctx, 'Connected', W / 2, H / 2 + 110, { size: 32, w: 700, a: 'center', alpha: 1 - seg(t, 7.2, 7.6) }); } return; }
    if (t > 3.9 && t < 6.6) { pinEntry(ctx, W, H, t - 3.9, t > 5.7); return; }
    phoneApp(ctx, W, H, { connected: false });
    box(ctx, 22, 330, W - 44, 190, 26, DARK.surf, DARK.line); icon(ctx, 'lock', W / 2, 400, 48, COL.cyan);
    txt(ctx, 'Enter PIN to connect', W / 2, 462, { size: 24, w: 700, a: 'center' }); txt(ctx, 'Pair with your Windows PC', W / 2, 494, { size: 16, c: COL.mute, a: 'center' });
    box(ctx, 22, 560, W - 44, 64, 32, COL.cyan); txt(ctx, 'Enter PIN', W / 2, 593, { size: 21, w: 700, a: 'center', c: '#04202a' });
  },
};
function import_logo(ctx, x, y, s) { // local logo draw (avoid circular import)
  ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4);
  const g = ctx.createLinearGradient(-s, -s, s, s); g.addColorStop(0, COL.cyan); g.addColorStop(1, COL.teal);
  ctx.strokeStyle = g; ctx.lineWidth = s * 0.19; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.roundRect(-s * 0.78, -s * 0.3, s, s * 0.6, s * 0.3); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-s * 0.22, -s * 0.3, s, s * 0.6, s * 0.3); ctx.stroke(); ctx.restore();
}

// Phone camera-style QR scanner view (shared by pairing demos)
export function scanner(ctx, W, H, t, done = false, seed = 7) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d1a2e'); g.addColorStop(1, '#050a14'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const z = 1 + 0.06 * Math.sin(t * 2.2), s = 230 * z, cx = W / 2 + Math.sin(t * 1.7) * 6, cy = H / 2 - 20;
  ctx.save(); ctx.globalAlpha = done ? 0.35 : 1; qr(ctx, cx - s / 2, cy - s / 2, s, seed); ctx.restore();
  const f = 148 * z, c = done ? COL.ok : COL.cyan; ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.lineCap = 'round';
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { ctx.beginPath(); ctx.moveTo(cx + sx * f, cy + sy * (f - 44)); ctx.lineTo(cx + sx * f, cy + sy * f); ctx.lineTo(cx + sx * (f - 44), cy + sy * f); ctx.stroke(); });
  if (!done) { const y = cy - f + (f * 2) * (0.5 - 0.5 * Math.cos(t * 3.2)); const gr = ctx.createLinearGradient(0, y - 30, 0, y + 4); gr.addColorStop(0, 'rgba(22,184,208,0)'); gr.addColorStop(1, 'rgba(22,184,208,.6)'); ctx.fillStyle = gr; ctx.fillRect(cx - f, y - 30, f * 2, 34); ctx.fillStyle = COL.cyan; ctx.fillRect(cx - f, y, f * 2, 3); }
  txt(ctx, done ? 'Pairing…' : 'Point at the code on your PC', W / 2, 120, { size: 22, w: 600, a: 'center' });
  if (done) { spinner(ctx, W / 2, H - 150, 28, t, COL.cyan); }
}

export const finale = {
  id: 'finale', duration: 10, ease: 2.4,
  layout: (t) => {
    const near = kf(t, [[0, 0], [1.2, 0], [3.2, 1], [8.0, 1], [9.8, 0]]);
    return L({
      lap: { x: 1.15 + (1 - near) * 0.3, y: -0.6, z: -0.2, ry: -0.3 }, ph: { x: -1.95 - (1 - near) * 0.5, y: -0.35, z: 0.5, ry: 0.34 },
      rig: { ry: Math.sin(t * 0.4) * 0.1 }, ext: { w: 6.6, h: 4.3 }, flow: near, dir: 0, icons: near * 0.9, iconsOn: 8 * near,
      glow: [0.09, 0.72, 0.82, 0.2 + near * 0.45],
    });
  },
  pc: (c, W, H, t) => dashboardPC(c, W, H, t, kf(t, [[0, 0], [1.4, 0], [3.2, 1]]) > 0.5),
  phone: (c, W, H, t) => dashboardPhone(c, W, H, t, kf(t, [[0, 0], [1.4, 0], [3.2, 1]]) > 0.5),
};
