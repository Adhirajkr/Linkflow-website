import { COL, DARK, pcApp, phoneApp, box, txt, icon, pill, rgba, ease, easeOut, seg } from './draw.js';
import { L, POSE, kf } from './layout.js';

const TEXT1 = 'Launch notes: ship the new site on Friday.';
const TEXT2 = 'Meet at 4:30, bring the demo phone.';

function chip(ctx, x, y, label, a = 1, s = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = rgba(COL.cyan, 0.7); ctx.shadowBlur = 22;
  box(ctx, -110, -22, 220, 44, 22, '#0E2B3A', rgba(COL.cyan, 0.9), 1.5); ctx.shadowBlur = 0;
  icon(ctx, 'clip', -86, 0, 18, COL.cyan); txt(ctx, label, -64, 1, { size: 14, w: 600, c: COL.text }); ctx.restore();
}

export const clipboard = {
  id: 'clipboard', duration: 10, ease: 3, still: 3.2,
  layout: (t) => L({
    ...POSE.side, lap: { ...POSE.side.lap, ry: -0.32 }, ph: { ...POSE.side.ph, x: -1.9 }, flow: kf(t, [[2.0, 0.2], [2.6, 1], [4.2, 0.2], [6.8, 0.2], [7.4, 1], [9, 0.25]]),
    dir: t < 5 ? -1 : 1, ext: { w: 6.2, h: 4.1 },
  }),
  pc: (ctx, W, H, t) => {
    const r = pcApp(ctx, W, H, { active: 1, connected: true });
    txt(ctx, 'Clipboard', r.x + 6, r.y + 14, { size: 24, w: 700 }); pill(ctx, r.x + r.w - 4, r.y + 2, 'Sync on', COL.ok, { right: true, h: 28, dot: true });
    // editor card
    box(ctx, r.x, r.y + 52, r.w, 130, 18, DARK.surf, DARK.line);
    const typed = t < 5 ? TEXT1 : TEXT2.slice(0, Math.floor(seg(t, 8.4, 8.9) * TEXT2.length));
    const show = t < 5 ? TEXT1 : (t > 8.4 ? TEXT2 : '');
    if (t < 5 && t > 0.5 && t < 1.7) { const w = 560 * seg(t, 0.5, 1.2); ctx.fillStyle = rgba(COL.cyan, 0.3); ctx.fillRect(r.x + 24, r.y + 78, w, 28); }
    txt(ctx, show || '—', r.x + 24, r.y + 93, { size: 19, w: 500, c: show ? COL.text : COL.mute });
    txt(ctx, t < 5 ? 'Notes · on this PC' : 'Pasted from your phone', r.x + 24, r.y + 150, { size: 13, c: COL.mute });
    if (t > 1.2 && t < 2.4) { const p = ease(seg(t, 1.2, 1.5)); box(ctx, r.x + r.w - 118, r.y + 138, 96, 30, 15, rgba(COL.cyan, 0.2 * p), rgba(COL.cyan, 0.8 * p)); txt(ctx, 'Ctrl + C', r.x + r.w - 70, r.y + 153, { size: 13, w: 700, a: 'center', alpha: p }); }
    // history
    txt(ctx, 'History', r.x + 6, r.y + 214, { size: 16, w: 700 });
    const items = [[t > 8.8 ? TEXT2 : null, 'From phone'], [TEXT1, 'Copied on PC'], ['https://linkflow.example/demo', 'From phone']].filter((i) => i[0]);
    items.forEach(([s, src], i) => {
      const slide = i === 0 && t > 8.8 ? ease(seg(t, 8.8, 9.2)) : 1; box(ctx, r.x, r.y + 240 + i * 58, r.w, 48, 14, DARK.surf, DARK.line);
      ctx.globalAlpha = slide; txt(ctx, s, r.x + 18, r.y + 264 + i * 58, { size: 15 }); pill(ctx, r.x + r.w - 12, r.y + 250 + i * 58, src, src === 'Copied on PC' ? COL.cyan : COL.teal, { right: true, h: 26, size: 11.5 }); ctx.globalAlpha = 1;
    });
    // flying chip PC -> out right edge
    if (t > 2.2 && t < 3.6) { const p = ease(seg(t, 2.2, 3.4)); chip(ctx, r.x + 200 + p * (W - r.x - 120), r.y + 118 + Math.sin(p * Math.PI) * -30, 'Copied text', 1 - seg(t, 3.1, 3.6), 1); }
    // incoming chip from the right edge (phone -> PC)
    if (t > 7.4 && t < 8.6) { const p = ease(seg(t, 7.4, 8.4)); chip(ctx, W + 100 - p * (W - r.x - 330), r.y + 118, 'From phone', 1 - seg(t, 8.2, 8.6)); }
  },
  phone: (ctx, W, H, t) => {
    const r = phoneApp(ctx, W, H, { connected: true, nav: 0 });
    txt(ctx, t < 5 ? 'Clipboard' : 'Notes', r.x + 4, r.y + 12, { size: 26, w: 700 });
    // received card
    const p1 = ease(seg(t, 3.5, 4.2)), p1o = 1 - ease(seg(t, 5.0, 5.4));
    if (t > 3.4 && p1o > 0) {
      ctx.save(); ctx.globalAlpha = p1o; ctx.translate(0, (1 - p1) * -40);
      box(ctx, r.x, r.y + 56, r.w, 160, 24, DARK.surf, rgba(COL.cyan, 0.6), 1.6);
      pill(ctx, r.x + 20, r.y + 76, 'From your PC', COL.cyan, { h: 28, size: 13 }); txt(ctx, TEXT1, r.x + 22, r.y + 138, { size: 21, w: 500 });
      txt(ctx, 'Copied to clipboard', r.x + 22, r.y + 186, { size: 15, c: COL.ok, w: 600 }); ctx.restore();
    }
    if (t >= 5) { // notes app with text and copy menu
      box(ctx, r.x, r.y + 56, r.w, 160, 24, DARK.surf, DARK.line); txt(ctx, TEXT2, r.x + 22, r.y + 138, { size: 21 });
      if (t > 5.8 && t < 8.0) { ctx.fillStyle = rgba(COL.cyan, 0.3); ctx.fillRect(r.x + 22, r.y + 120, 342 * seg(t, 5.8, 6.4), 36); }
      if (t > 6.4 && t < 8.0) { const p = ease(seg(t, 6.4, 6.8)); box(ctx, r.x + 120, r.y + 70, 140, 48, 24, '#17283f', rgba(COL.cyan, 0.7)); txt(ctx, 'Copy', r.x + 190, r.y + 95, { size: 20, w: 700, a: 'center', c: COL.cyan, alpha: p }); }
      if (t > 7.0 && t < 8.0) { const p = ease(seg(t, 7.0, 7.9)); chip(ctx, r.x + r.w / 2, r.y + 60 - p * 120, 'Copied text', 1 - p, 1); }
    }
    // synced history
    [['Launch notes…', 'PC'], ['Meet at 4:30…', 'Phone']].forEach(([s, src], i) => { box(ctx, r.x, r.y + 250 + i * 80, r.w, 66, 20, DARK.surf, DARK.line); txt(ctx, s, r.x + 22, r.y + 283 + i * 80, { size: 19 }); pill(ctx, r.x + r.w - 14, r.y + 270 + i * 80, src, i ? COL.teal : COL.cyan, { right: true, h: 26 }); });
    txt(ctx, 'Two-way sync', r.x + r.w / 2, r.y + 460, { size: 16, c: COL.mute, a: 'center' });
  },
};
