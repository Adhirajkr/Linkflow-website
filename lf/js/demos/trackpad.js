import { COL, DARK, pcApp, phoneApp, desktop, box, txt, icon, pill, rgba, ease, easeOut, seg, cursor, ripple } from './draw.js';
import { L, kf } from './layout.js';

// Pad path in 0..1 space (shared by phone touch + PC cursor so they stay in sync)
const path = (t) => { const p = Math.min(t, 3.2) / 3.2; return { x: 0.5 + 0.34 * Math.sin(p * Math.PI * 2.0), y: 0.5 + 0.3 * Math.sin(p * Math.PI * 4.0) * (1 - 0.2 * p) }; };

export const trackpad = {
  id: 'trackpad', duration: 9, ease: 3, still: 2,
  layout: (t) => L({
    lap: { x: 0, y: -0.2, z: -1.3, ry: 0, s: 1.1 }, ph: { x: 0.1, y: -1.1, z: 1.6, rx: -1.12, ry: 0.08, s: 1.05 },
    ext: { w: 6.2, h: 4.4 }, flow: 0.7, dir: 1, glow: [0.09, 0.72, 0.82, 0.4],
  }),
  pc: (ctx, W, H, t) => {
    const r = desktop(ctx, W, H, t * 0.3); const th = 0;
    // list that scrolls
    const sc = t > 4.6 ? ease(seg(t, 4.6, 8)) * 140 : 0;
    ctx.save(); ctx.beginPath(); ctx.rect(70 + 20, 82, W - 300 - 40, H - 150 - 70); ctx.clip();
    ctx.fillStyle = 'rgba(8,14,25,.92)'; ctx.fillRect(70, 74, W - 300, H - 150);
    txt(ctx, 'Pages', 100, 100 - 0, { size: 14, c: COL.mute });
    for (let i = 0; i < 9; i++) { const y = 130 + i * 62 - sc; box(ctx, 100, y, W - 360, 50, 14, DARK.surf, DARK.line); box(ctx, 118, y + 12, 26, 26, 8, rgba([COL.cyan, COL.purple, COL.teal][i % 3], 0.5)); txt(ctx, ['Roadmap', 'Design notes', 'Release plan', 'Pairing flow', 'Beta feedback', 'Changelog', 'FAQ draft', 'Launch list', 'Ideas'][i], 160, y + 25, { size: 16, w: 600 }); }
    ctx.restore();
    // cursor
    const p = t < 3.2 ? path(t) : path(3.2);
    const sx = 70 + 40 + p.x * (W - 420), sy = 130 + p.y * (H - 300);
    const cx = t < 4.6 ? sx : sx, cy = sy;
    ripple(ctx, cx, cy, seg(t, 3.4, 4.1), COL.cyan, 46);
    if (t > 3.4 && t < 3.7) { ctx.fillStyle = rgba(COL.cyan, 0.25); box(ctx, 100, 300 - 0, W - 360, 50, 14, rgba(COL.cyan, 0.25), COL.cyan); }
    cursor(ctx, cx, cy, 1.3 - 0.15 * (t > 3.5 && t < 3.8 ? 1 : 0));
    pill(ctx, W - 24, 12, t < 3.2 ? 'Moving' : t < 4.6 ? 'Click' : 'Scrolling', COL.cyan, { right: true, h: 30, size: 13 });
  },
  phone: (ctx, W, H, t) => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0B1527'); g.addColorStop(1, '#070C16'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    txt(ctx, 'Trackpad', 32, 92, { size: 26, w: 700 }); pill(ctx, W - 22, 78, 'Connected', COL.ok, { right: true, dot: true, h: 28, size: 12.5 });
    const x = 26, y = 150, w = W - 52, h = 580;
    box(ctx, x, y, w, h, 34, 'rgba(255,255,255,.05)', rgba(COL.cyan, 0.45), 1.6);
    for (let i = 1; i < 6; i++) for (let j = 1; j < 9; j++) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.arc(x + (w / 6) * i, y + (h / 9) * j, 2.2, 0, 7); ctx.fill(); }
    const moving = t < 3.2, scroll = t > 4.6;
    if (moving) { const p = path(t); const px = x + p.x * w, py = y + p.y * h; for (let k = 8; k > 0; k--) { const q = path(Math.max(0, t - k * 0.04)); ctx.fillStyle = rgba(COL.cyan, 0.05 * (9 - k)); ctx.beginPath(); ctx.arc(x + q.x * w, y + q.y * h, 20 - k, 0, 7); ctx.fill(); } finger(ctx, px, py, 1); }
    else if (!scroll) { const p = path(3.2); const px = x + p.x * w, py = y + p.y * h; const dn = seg(t, 3.4, 3.6) * (1 - seg(t, 3.8, 4.1)); finger(ctx, px, py, 1 - 0.18 * dn); ripple(ctx, px, py, seg(t, 3.4, 4.1), COL.cyan, 70); }
    else { const s = ease(seg(t, 4.6, 8)); const off = (s * 160); [0.38, 0.62].forEach((fx) => finger(ctx, x + w * fx, y + h * 0.65 - off, 0.9)); ctx.strokeStyle = rgba(COL.cyan, 0.7); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.82); ctx.lineTo(x + w * 0.5, y + h * 0.3); ctx.moveTo(x + w * 0.44, y + h * 0.36); ctx.lineTo(x + w * 0.5, y + h * 0.3); ctx.lineTo(x + w * 0.56, y + h * 0.36); ctx.stroke(); }
    const bw = (w - 16) / 2; const click = t > 3.5 && t < 3.9;
    box(ctx, x, y + h + 18, bw, 70, 22, click ? rgba(COL.cyan, 0.3) : DARK.surf, click ? COL.cyan : DARK.line); txt(ctx, 'Left click', x + bw / 2, y + h + 53, { size: 17, w: 600, a: 'center' });
    box(ctx, x + bw + 16, y + h + 18, bw, 70, 22, DARK.surf, DARK.line); txt(ctx, 'Right click', x + bw * 1.5 + 16, y + h + 53, { size: 17, w: 600, a: 'center' });
  },
};
function finger(ctx, x, y, s) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 46 * s); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.45, 'rgba(22,184,208,.35)'); g.addColorStop(1, 'rgba(22,184,208,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 46 * s, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(x, y, 9 * s, 0, 7); ctx.fill();
}
