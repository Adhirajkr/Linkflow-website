import { COL, DARK, pcApp, phoneApp, box, txt, icon, pill, rgba, ease, seg, ribbon } from './draw.js';
import { L, POSE, kf } from './layout.js';

const ACC = [COL.cyan, COL.teal, COL.blue];
function bars(ctx, x, y, w, h, t, n, color, amp = 1, seed = 0) {
  const bw = w / n;
  for (let i = 0; i < n; i++) { const v = (0.25 + 0.75 * Math.abs(Math.sin(t * 3.1 + i * 0.7 + seed) * Math.cos(t * 1.7 + i * 0.35))) * amp; const bh = Math.max(4, v * h); box(ctx, x + i * bw + 1.5, y + (h - bh) / 2, bw - 3, bh, 3, color); }
}
function art(ctx, x, y, s) { const g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, COL.purple); g.addColorStop(1, COL.cyan); box(ctx, x, y, s, s, s * 0.14, g); icon(ctx, 'audio', x + s / 2, y + s / 2, s * 0.42, '#fff'); }

const pcModes = [
  (ctx, W, H, t) => { // Phone as speaker: PC audio -> phone
    const r = pcApp(ctx, W, H, { active: 5, connected: true }); txt(ctx, 'Audio', r.x + 6, r.y + 14, { size: 24, w: 700 });
    box(ctx, r.x, r.y + 52, r.w, 120, 18, DARK.surf, DARK.line); art(ctx, r.x + 18, r.y + 68, 88); txt(ctx, 'Now playing on this PC', r.x + 124, r.y + 92, { size: 18, w: 700 });
    bars(ctx, r.x + 124, r.y + 112, 300, 40, t, 24, COL.cyan);
    txt(ctx, 'Output device', r.x + 6, r.y + 206, { size: 15, w: 700 });
    [['PC speakers', false], ['Phone speaker', true]].forEach(([n, on], i) => { box(ctx, r.x, r.y + 226 + i * 62, r.w, 52, 16, on ? rgba(COL.cyan, 0.14) : DARK.surf, on ? rgba(COL.cyan, 0.8) : DARK.line, on ? 1.6 : 1); icon(ctx, i ? 'phone' : 'pc', r.x + 34, r.y + 252 + i * 62, 22, on ? COL.cyan : COL.mute); txt(ctx, n, r.x + 64, r.y + 252 + i * 62, { size: 16, w: 600, c: on ? COL.text : COL.mute }); if (on) icon(ctx, 'check', r.x + r.w - 32, r.y + 252 + i * 62, 20, COL.cyan); });
    
  },
  (ctx, W, H, t) => { // Phone as microphone: phone -> PC
    const r = pcApp(ctx, W, H, { active: 5, connected: true }); txt(ctx, 'Audio', r.x + 6, r.y + 14, { size: 24, w: 700 });
    txt(ctx, 'Input device', r.x + 6, r.y + 62, { size: 15, w: 700 });
    box(ctx, r.x, r.y + 84, r.w, 56, 16, rgba(COL.teal, 0.14), rgba(COL.teal, 0.8), 1.6); icon(ctx, 'mic', r.x + 34, r.y + 112, 22, COL.teal); txt(ctx, 'Phone microphone', r.x + 64, r.y + 112, { size: 17, w: 600 }); icon(ctx, 'check', r.x + r.w - 32, r.y + 112, 20, COL.teal);
    box(ctx, r.x, r.y + 160, r.w, 210, 18, DARK.surf, DARK.line); txt(ctx, 'Input level', r.x + 20, r.y + 186, { size: 14, c: COL.mute });
    bars(ctx, r.x + 20, r.y + 206, r.w - 40, 130, t, 44, COL.teal, 1, 2);
    ribbon(ctx, W);
  },
  (ctx, W, H, t) => { // PC as speaker: phone audio -> PC
    const r = pcApp(ctx, W, H, { active: 5, connected: true }); txt(ctx, 'Audio', r.x + 6, r.y + 14, { size: 24, w: 700 });
    txt(ctx, 'Output device', r.x + 6, r.y + 62, { size: 15, w: 700 });
    box(ctx, r.x, r.y + 84, r.w, 56, 16, rgba(COL.blue, 0.14), rgba(COL.blue, 0.8), 1.6); icon(ctx, 'pc', r.x + 34, r.y + 112, 22, COL.blue); txt(ctx, 'PC speakers', r.x + 64, r.y + 112, { size: 17, w: 600 }); icon(ctx, 'check', r.x + r.w - 32, r.y + 112, 20, COL.blue);
    box(ctx, r.x, r.y + 160, r.w, 210, 18, DARK.surf, DARK.line); txt(ctx, 'Playing from your phone', r.x + 20, r.y + 186, { size: 14, c: COL.mute });
    bars(ctx, r.x + 20, r.y + 206, r.w - 40, 130, t, 44, COL.blue, 1, 5);
    
  },
];
const phoneModes = [
  (ctx, W, H, t) => { const r = phoneApp(ctx, W, H, { connected: true, nav: 0 }); const cx = W / 2, cy = 400; for (let i = 0; i < 3; i++) { const p = ((t * 0.6 + i / 3) % 1); ctx.strokeStyle = rgba(COL.cyan, 0.6 * (1 - p)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 60 + p * 110, 0, 7); ctx.stroke(); } box(ctx, cx - 62, cy - 62, 124, 124, 62, rgba(COL.cyan, 0.18), COL.cyan, 2); icon(ctx, 'audio', cx, cy, 56, COL.cyan); txt(ctx, 'Playing PC audio', cx, 590, { size: 26, w: 700, a: 'center' }); txt(ctx, 'Phone as speaker', cx, 628, { size: 17, c: COL.mute, a: 'center' }); bars(ctx, cx - 100, 660, 200, 50, t, 16, COL.cyan);  },
  (ctx, W, H, t) => { phoneApp(ctx, W, H, { connected: true, nav: 0 }); const cx = W / 2, cy = 400; const lv = 0.6 + 0.4 * Math.sin(t * 5); for (let i = 0; i < 3; i++) { const p = ((t * 0.7 + i / 3) % 1); ctx.strokeStyle = rgba(COL.teal, 0.6 * (1 - p)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 60 + p * 110 * lv, 0, 7); ctx.stroke(); } box(ctx, cx - 62, cy - 62, 124, 124, 62, rgba(COL.teal, 0.2), COL.teal, 2); icon(ctx, 'mic', cx, cy, 56, COL.teal); txt(ctx, 'Microphone on', cx, 590, { size: 26, w: 700, a: 'center' }); txt(ctx, 'Sending to your PC', cx, 628, { size: 17, c: COL.mute, a: 'center' }); bars(ctx, cx - 120, 660, 240, 60, t, 22, COL.teal, 1, 2); ribbon(ctx, W, 'IN DEVELOPMENT', 100); },
  (ctx, W, H, t) => { phoneApp(ctx, W, H, { connected: true, nav: 0 }); const x = W / 2 - 130; art(ctx, x, 190, 260); txt(ctx, 'Phone audio', W / 2, 500, { size: 28, w: 700, a: 'center' }); txt(ctx, 'Playing through your PC', W / 2, 536, { size: 17, c: COL.mute, a: 'center' }); box(ctx, 60, 580, W - 120, 8, 4, 'rgba(255,255,255,.14)'); box(ctx, 60, 580, (W - 120) * (0.25 + 0.5 * ((t * 0.08) % 1)), 8, 4, COL.blue); [['arrow', -1], ['play', 0], ['arrow', 1]].forEach(([ic, d], i) => icon(ctx, ic === 'arrow' ? 'arrow' : 'play', W / 2 + d * 92, 650, ic === 'play' ? 52 : 34, i === 1 ? COL.text : COL.mute)); bars(ctx, W / 2 - 80, 710, 160, 30, t, 14, COL.blue);  },
];

export const audio = {
  id: 'audio', duration: 8, modes: 3, ease: 3, still: 3,
  layout: (t, o = {}) => {
    const m = o.mode || 0;
    const base = { ...POSE.side, lap: { ...POSE.side.lap, x: 1.1 } };
    return L({ ...base, waves: 1, flow: 0.55, dir: m === 0 ? -1 : 1, src: m === 0 ? 0 : 1, col: [[0.09, 0.72, 0.82], [0.13, 0.72, 0.65], [0.28, 0.5, 0.96]][m], glow: [0.2, 0.5, 0.9, 0.3] });
  },
  pc: (ctx, W, H, t, o = {}) => pcModes[o.mode || 0](ctx, W, H, t),
  phone: (ctx, W, H, t, o = {}) => phoneModes[o.mode || 0](ctx, W, H, t),
};
