import { COL, DARK, pcApp, phoneApp, box, txt, icon, pill, rgba, ease, seg, rr } from './draw.js';
import { L, POSE, kf } from './layout.js';

// Procedural "live camera" picture: sky, sun, parallax hills, drifting bokeh. No real footage / resolution claims.
export function liveScene(ctx, x, y, w, h, t, r = 0) {
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
  const sh = Math.sin(t * 1.3) * 2;
  ctx.translate(sh, Math.cos(t * 1.1) * 1.5);
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2b2d7a'); g.addColorStop(0.5, '#e0698a'); g.addColorStop(1, '#ffb36b'); ctx.fillStyle = g; ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
  const sx = x + w * 0.68, sy = y + h * 0.56; const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.5); sg.addColorStop(0, 'rgba(255,240,200,.95)'); sg.addColorStop(0.18, 'rgba(255,220,150,.7)'); sg.addColorStop(1, 'rgba(255,170,100,0)'); ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
  [['#5a3d8a', 0.62, 0.08, 0.6], ['#3a2c6e', 0.74, 0.1, 1.1], ['#1d1b4a', 0.86, 0.12, 1.7]].forEach(([c, base, amp, ph], i) => {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 10, y + h + 10);
    for (let k = 0; k <= 24; k++) { const px = x + (k / 24) * w; ctx.lineTo(px, y + h * (base + amp * Math.sin(k * 0.55 + ph + t * 0.05 * (i + 1)) * 0.6)); }
    ctx.lineTo(x + w + 10, y + h + 10); ctx.fill();
  });
  for (let i = 0; i < 9; i++) { const bx = x + ((i * 97 + t * 14 * (1 + (i % 3))) % (w + 60)) - 30, by = y + h * (0.15 + (i * 0.083) % 0.5); ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.04 * (i % 3)})`; ctx.beginPath(); ctx.arc(bx, by, 10 + (i % 4) * 8, 0, 7); ctx.fill(); }
  // autofocus brackets
  const f = 46 + 3 * Math.sin(t * 4), fx = x + w * 0.5, fy = y + h * 0.5; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.5;
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(fx + a * f, fy + b * (f - 16)); ctx.lineTo(fx + a * f, fy + b * f); ctx.lineTo(fx + a * (f - 16), fy + b * f); ctx.stroke(); });
  ctx.restore();
}

export const camera = {
  id: 'camera', duration: 9, ease: 2.8, still: 4.5,
  layout: (t) => {
    const ry = kf(t, [[0.3, 0.4], [2.0, Math.PI - 0.55], [5.6, Math.PI - 0.55], [7.4, 0.4]]);
    return L({
      lap: { x: 1.15, y: -0.6, z: -0.3, ry: -0.3 }, ph: { x: -1.9, y: -0.2, z: 0.7, ry, rx: 0.03 },
      flow: kf(t, [[1.6, 0.1], [2.8, 1], [6.6, 1], [7.4, 0.5]]), dir: 1, glow: [0.09, 0.72, 0.82, 0.55],
    });
  },
  pc: (ctx, W, H, t) => {
    const r = pcApp(ctx, W, H, { active: 3, connected: true });
    txt(ctx, 'Phone camera', r.x + 6, r.y + 14, { size: 24, w: 700 });
    const live = t > 2.4;
    pill(ctx, r.x + r.w - 4, r.y + 2, live ? 'Camera source active' : 'Starting…', live ? COL.ok : COL.warn, { right: true, h: 28, dot: true });
    const pw = r.w - 190, ph = r.h - 60;
    box(ctx, r.x, r.y + 50, pw, ph, 18, '#050a14', DARK.line);
    if (live) { liveScene(ctx, r.x + 2, r.y + 52, pw - 4, ph - 4, t, 16); ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - seg(t, 2.4, 2.9))})`; ctx.fillRect(r.x, r.y + 50, pw, ph); }
    else txt(ctx, 'Waiting for camera…', r.x + pw / 2, r.y + 50 + ph / 2, { size: 18, c: COL.mute, a: 'center' });
    pill(ctx, r.x + 16, r.y + 66, 'Phone camera', '#ffffff', { h: 26, size: 12, fill: 0.22 });
    // device list
    const sx = r.x + pw + 16;
    txt(ctx, 'Camera source', sx, r.y + 64, { size: 14, w: 700 });
    [['Phone camera', true], ['Built-in webcam', false]].forEach(([n, on], i) => { box(ctx, sx, r.y + 86 + i * 56, 158, 46, 14, on ? rgba(COL.cyan, 0.14) : DARK.surf, on ? rgba(COL.cyan, 0.7) : DARK.line); icon(ctx, 'camera', sx + 22, r.y + 109 + i * 56, 18, on ? COL.cyan : COL.mute); txt(ctx, n, sx + 42, r.y + 109 + i * 56, { size: 12.5, w: 600, c: on ? COL.text : COL.mute }); });
    txt(ctx, 'Use in any app that', sx, r.y + 232, { size: 12, c: COL.mute }); txt(ctx, 'accepts a camera.', sx, r.y + 250, { size: 12, c: COL.mute });
  },
  phone: (ctx, W, H, t) => {
    liveScene(ctx, 0, 0, W, H, t);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(0, 0, W, 170); ctx.fillRect(0, H - 220, W, 220);
    txt(ctx, 'Camera source', W / 2, 98, { size: 26, w: 700, a: 'center' });
    pill(ctx, W / 2 - 80, H - 190, 'Streaming to PC', COL.ok, { h: 38, size: 15, dot: true });
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(W / 2, H - 100, 44, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W / 2, H - 100, 56, 0, 7); ctx.stroke();
    icon(ctx, 'loop', W * 0.8, H - 100, 38, '#fff');
  },
};
