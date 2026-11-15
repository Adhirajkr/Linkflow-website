// Autotype: write text on the phone; it is typed into the chosen window on the PC. Start / pause / stop from the phone.
import { COL, DARK, pcApp, phoneApp, box, txt, icon, pill, rgba, ease, seg, ripple, checkBadge, progressBar } from './draw.js';
import { L, POSE, kf } from './layout.js';

const TEXT = 'Hello from LinkFlow! This message was typed by my phone, straight into my PC.';
const RUN = [[2.6, 6.0], [7.2, 10.2]]; // seconds when typing is active (paused in between)
const TOTAL = RUN.reduce((s, [a, b]) => s + b - a, 0);
const progress = (t) => RUN.reduce((s, [a, b]) => s + Math.max(0, Math.min(t, b) - a), 0) / TOTAL;
const phase = (t) => (t < 2.4 ? 'ready' : t < 6 ? 'typing' : t < 7.2 ? 'paused' : t < 10.2 ? 'typing' : 'done');

function lines(ctx, text, maxW, size) {
  ctx.save(); ctx.font = `500 ${size}px "Segoe UI Variable","Segoe UI",system-ui,Roboto,sans-serif`;
  const out = []; let cur = '';
  text.split(' ').forEach((w) => { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { out.push(cur); cur = w; } else cur = n; });
  ctx.restore(); if (cur) out.push(cur); return out;
}
function typed(ctx, x, y, maxW, size, count, lh, caret, t, color = COL.text) {
  let left = count, last = null;
  lines(ctx, TEXT, maxW, size).forEach((ln, i) => {
    if (left <= 0) return; const part = ln.slice(0, left); left -= ln.length + 1; txt(ctx, part, x, y + i * lh, { size, c: color }); last = { i, part };
  });
  if (caret && Math.floor(t * 2.2) % 2 === 0) { ctx.save(); ctx.font = `500 ${size}px "Segoe UI",system-ui,sans-serif`; const px = last ? ctx.measureText(last.part).width : 0; ctx.restore(); ctx.fillStyle = COL.cyan; ctx.fillRect(x + px + 2, y + (last ? last.i : 0) * lh - size * 0.6, 3, size * 1.2); }
}

export const autotype = {
  id: 'autotype', duration: 12, ease: 3, still: 4.5,
  layout: (t) => L({ ...POSE.side, flow: kf(t, [[2.4, 0.15], [2.8, 0.9], [5.8, 0.9], [6.2, 0.2], [7.0, 0.2], [7.4, 0.9], [10.0, 0.9], [10.4, 0.2]]), dir: 1, glow: [0.09, 0.72, 0.82, 0.4] }),
  pc: (ctx, W, H, t) => {
    pcApp(ctx, W, H, { bare: true });
    const ph = phase(t), x = 120, y = 44, w = W - 240, h = H - 150;
    ctx.save(); ctx.shadowColor = ph === 'typing' ? rgba(COL.cyan, 0.5) : 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; box(ctx, x, y, w, h, 16, '#0E1A2E', ph === 'typing' ? rgba(COL.cyan, 0.8) : 'rgba(255,255,255,.12)', ph === 'typing' ? 2 : 1); ctx.restore();
    box(ctx, x, y, w, 40, 16, 'rgba(255,255,255,.05)'); ['#ff6b6b', '#f5b642', '#2ccb8a'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 24 + i * 20, y + 20, 5.5, 0, 7); ctx.fill(); });
    txt(ctx, 'Notes', x + w / 2, y + 21, { size: 15, c: COL.mute, a: 'center' });
    typed(ctx, x + 40, y + 96, w - 80, 34, Math.floor(TEXT.length * progress(t)), 54, ph !== 'done', t);
    const label = { ready: ['Autotype ready', COL.mute], typing: ['Typing…', COL.ok], paused: ['Paused', COL.warn], done: ['Done', COL.ok] }[ph];
    pill(ctx, W - 24, 12, 'Autotype · ' + label[0], label[1], { right: true, dot: true, h: 30, size: 13, fill: 0.4 });
  },
  phone: (ctx, W, H, t) => {
    const ph = phase(t), r = phoneApp(ctx, W, H, { connected: true, title: 'Autotype', nav: 0 });
    txt(ctx, 'Text to type', r.x, r.y + 14, { size: 18, w: 700 });
    box(ctx, r.x, r.y + 36, r.w, 290, 20, DARK.surf, ph === 'ready' ? rgba(COL.cyan, 0.7) : DARK.line, ph === 'ready' ? 1.8 : 1);
    typed(ctx, r.x + 20, r.y + 74, r.w - 40, 22, Math.floor(TEXT.length * seg(t, 0.3, 2.2)), 34, t < 2.4, t, COL.text);
    pill(ctx, r.x, r.y + 346, 'Types into: Notes', COL.teal, { h: 30, size: 13 });
    const by = r.y + 410;
    if (ph === 'ready') {
      box(ctx, r.x, by, r.w, 70, 35, COL.cyan); icon(ctx, 'play', r.x + r.w / 2 - 70, by + 35, 24, '#04202a'); txt(ctx, 'Start autotype', r.x + r.w / 2 + 10, by + 36, { size: 22, w: 700, a: 'center', c: '#04202a' });
      ripple(ctx, r.x + r.w / 2, by + 35, seg(t, 2.2, 2.6), COL.cyan, 50);
    } else if (ph === 'done') {
      checkBadge(ctx, r.x + r.w / 2, by + 20, 36, seg(t, 10.2, 10.7)); txt(ctx, 'Finished typing', r.x + r.w / 2, by + 100, { size: 24, w: 700, a: 'center' });
    } else {
      progressBar(ctx, r.x, by, r.w, 12, progress(t)); txt(ctx, ph === 'paused' ? 'Paused' : 'Typing on your PC…', r.x, by + 42, { size: 18, w: 600, c: ph === 'paused' ? COL.warn : COL.ok });
      const half = (r.w - 14) / 2, on = ph === 'paused';
      box(ctx, r.x, by + 70, half, 66, 33, on ? COL.cyan : DARK.surf, on ? null : DARK.line);
      if (on) { icon(ctx, 'play', r.x + half / 2 - 40, by + 103, 22, '#04202a'); txt(ctx, 'Resume', r.x + half / 2 + 8, by + 104, { size: 19, w: 700, a: 'center', c: '#04202a' }); } else { ctx.fillStyle = COL.text; ctx.fillRect(r.x + half / 2 - 40, by + 92, 7, 22); ctx.fillRect(r.x + half / 2 - 28, by + 92, 7, 22); txt(ctx, 'Pause', r.x + half / 2 + 14, by + 104, { size: 19, w: 700, a: 'center' }); }
      box(ctx, r.x + half + 14, by + 70, half, 66, 33, DARK.surf, rgba('#FF6B6B', 0.6)); ctx.fillStyle = '#FF6B6B'; ctx.fillRect(r.x + half + 14 + half / 2 - 40, by + 94, 18, 18); txt(ctx, 'Stop', r.x + half + 14 + half / 2 + 12, by + 104, { size: 19, w: 700, a: 'center' });
      ripple(ctx, r.x + half / 2, by + 103, seg(t, 5.8, 6.4), COL.warn, 44); ripple(ctx, r.x + half / 2, by + 103, seg(t, 7.0, 7.5), COL.cyan, 44);
    }
  },
};
