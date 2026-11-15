import { COL, DARK, DEMO_PIN, pcApp, phoneApp, box, txt, icon, pill, pinBoxes, pinEntry, spinner, checkBadge, rgba, ease, seg } from './draw.js';
import { L, kf } from './layout.js';

export const pairing = {
  id: 'pairing', duration: 10, ease: 3, still: 7,
  layout: (t) => {
    const near = kf(t, [[1.2, 0], [2.2, 1], [4.6, 1], [5.8, 0]]);
    return L({
      lap: { x: 1.2, y: -0.6, z: -0.3, ry: -0.3 }, ph: { x: -1.75 + near * 0.55, y: -0.35 + near * 0.3, z: 0.6 + near * 0.7, ry: 0.36 + near * 0.1 },
      ext: { w: 6.2, h: 4.2 }, flow: kf(t, [[5.0, 0], [6.0, 0.9]]), dir: 0, glow: [0.09, 0.72, 0.82, 0.25 + 0.35 * seg(t, 5, 6)],
    });
  },
  pc: (ctx, W, H, t) => {
    const done = t > 5.4;
    const r = pcApp(ctx, W, H, { active: 0, connected: done, status: t > 4.5 ? 'Pairing…' : 'Waiting' });
    const cx = r.x + r.w / 2;
    if (!done) {
      txt(ctx, 'Pair a new phone', r.x + 6, r.y + 14, { size: 24, w: 700 }); txt(ctx, 'Enter this 4-digit PIN in LinkFlow on your phone.', r.x + 6, r.y + 44, { size: 14, c: COL.mute });
      box(ctx, cx - 190, r.y + 96, 380, 190, 26, DARK.surf, DARK.line);
      txt(ctx, 'Your pairing PIN', cx, r.y + 128, { size: 16, w: 600, a: 'center', c: COL.mute });
      pinBoxes(ctx, cx, r.y + 204, 64, 4, false);
      icon(ctx, 'lock', cx, r.y + 340, 26, COL.cyan); txt(ctx, 'Secure pairing between your own devices', cx, r.y + 376, { size: 15, w: 600, a: 'center', c: COL.mute });
      if (t > 4.5) { ctx.fillStyle = 'rgba(8,14,25,.8)'; ctx.fillRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12); spinner(ctx, cx, r.y + r.h / 2 - 20, 36, t, COL.cyan); txt(ctx, 'Pairing securely…', cx, r.y + r.h / 2 + 50, { size: 20, w: 600, a: 'center' }); }
    } else {
      checkBadge(ctx, cx, r.y + 100, 46, seg(t, 5.4, 6));
      txt(ctx, 'Phone paired', cx, r.y + 188, { size: 28, w: 700, a: 'center' }); txt(ctx, 'Your devices are connected.', cx, r.y + 222, { size: 15, c: COL.mute, a: 'center' });
      [['zap', 'Quick PIN pairing'], ['lock', 'Secure pairing'], ['loop', 'Auto-reconnect']].forEach(([ic, l], i) => {
        const p = ease(seg(t, 6.0 + i * 0.35, 6.7 + i * 0.35)), w = (r.w - 40) / 3, x = r.x + i * (w + 20), y = r.y + 270 + (1 - p) * 20;
        ctx.globalAlpha = p; box(ctx, x, y, w, 100, 18, DARK.surf, DARK.line); icon(ctx, ic, x + w / 2, y + 36, 30, COL.cyan); txt(ctx, l, x + w / 2, y + 76, { size: 15, w: 600, a: 'center' }); ctx.globalAlpha = 1;
      });
    }
  },
  phone: (ctx, W, H, t) => {
    if (t >= 5.4) {
      phoneApp(ctx, W, H, { connected: true });
      checkBadge(ctx, W / 2, 330, 58, seg(t, 5.4, 6)); txt(ctx, 'Paired with your PC', W / 2, 440, { size: 28, w: 700, a: 'center' }); txt(ctx, 'Reconnects automatically', W / 2, 478, { size: 17, c: COL.mute, a: 'center' });
      [['PIN pairing', COL.cyan], ['Secure pairing', COL.teal], ['Auto-reconnect', COL.blue]].forEach(([l, c], i) => pill(ctx, W / 2 - 75, 540 + i * 44, l, c, { h: 32, size: 14 }));
      return;
    }
    if (t > 1.4) { pinEntry(ctx, W, H, t - 1.4, t > 4.5); return; }
    phoneApp(ctx, W, H, { connected: false });
    box(ctx, 22, 330, W - 44, 190, 26, DARK.surf, DARK.line); icon(ctx, 'lock', W / 2, 400, 48, COL.cyan);
    txt(ctx, 'Enter PIN to connect', W / 2, 462, { size: 24, w: 700, a: 'center' }); txt(ctx, 'Pair with your Windows PC', W / 2, 494, { size: 16, c: COL.mute, a: 'center' });
    box(ctx, 22, 560, W - 44, 64, 32, COL.cyan); txt(ctx, 'Enter PIN', W / 2, 593, { size: 21, w: 700, a: 'center', c: '#04202a' });
  },
};
