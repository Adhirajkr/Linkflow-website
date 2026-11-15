import { COL, DARK, pcApp, phoneApp, box, txt, icon, pill, rgba, ease, seg, ribbon, checkBadge, progressBar } from './draw.js';
import { L, kf } from './layout.js';

export const usb = {
  id: 'usb', duration: 10, ease: 3, still: 6,
  layout: (t) => L({
    lap: { x: 1.35, y: -0.6, z: -0.5, ry: -0.38 }, ph: { x: -1.95, y: -0.75, z: 0.8, ry: 0.32, rx: -0.12 },
    cable: kf(t, [[0.8, 0], [1.2, 1]]), cableP: kf(t, [[1.0, 0], [3.4, 1]]), flow: kf(t, [[4.4, 0], [5.4, 0.9]]), dir: 0,
    col: [0.96, 0.71, 0.26], glow: [0.96, 0.71, 0.26, 0.25 + 0.2 * seg(t, 3.4, 4.4)],
  }),
  pc: (ctx, W, H, t) => {
    const on = t > 3.6;
    const r = pcApp(ctx, W, H, { active: 6, connected: on, status: 'No device' });
    txt(ctx, 'USB mode', r.x + 6, r.y + 14, { size: 24, w: 700 });
    const cx = r.x + r.w / 2;
    box(ctx, r.x, r.y + 60, r.w, 100, 18, DARK.surf, on ? rgba(COL.warn, 0.7) : DARK.line, on ? 1.6 : 1);
    icon(ctx, 'usb', r.x + 44, r.y + 110, 34, on ? COL.warn : COL.mute); txt(ctx, on ? 'Phone detected over USB' : 'Waiting for a USB device…', r.x + 82, r.y + 100, { size: 20, w: 700 }); txt(ctx, on ? 'Wired connection established' : 'Plug in your phone with a cable', r.x + 82, r.y + 130, { size: 14, c: COL.mute });
    if (on) checkBadge(ctx, r.x + r.w - 44, r.y + 110, 18, seg(t, 3.6, 4.1), COL.ok);
    if (t > 4.6) { const p = seg(t, 4.8, 9); txt(ctx, 'Wired transfer', r.x + 6, r.y + 200, { size: 15, w: 700 }); for (let i = 0; i < 3; i++) { const q = Math.min(1, Math.max(0, p * 1.6 - i * 0.25)); box(ctx, r.x, r.y + 222 + i * 58, r.w, 46, 14, DARK.surf, DARK.line); icon(ctx, 'file', r.x + 28, r.y + 245 + i * 58, 20, COL.warn); progressBar(ctx, r.x + 54, r.y + 241 + i * 58, r.w - 140, 8, q, COL.warn); txt(ctx, q >= 1 ? 'Done' : Math.round(q * 100) + '%', r.x + r.w - 20, r.y + 245 + i * 58, { size: 13, w: 700, a: 'right', c: q >= 1 ? COL.ok : COL.mute }); } }
    ribbon(ctx, W);
  },
  phone: (ctx, W, H, t) => {
    const on = t > 3.6; const r = phoneApp(ctx, W, H, { connected: on, status: 'No USB' });
    const cx = W / 2; box(ctx, cx - 60, 300, 120, 120, 60, rgba(on ? COL.warn : COL.mute, 0.15), on ? COL.warn : '#7E8CA3', 2); icon(ctx, 'usb', cx, 360, 54, on ? COL.warn : COL.mute);
    txt(ctx, on ? 'USB connected' : 'USB not connected', cx, 470, { size: 28, w: 700, a: 'center' }); txt(ctx, on ? 'Wired link to your PC' : 'Plug in the cable', cx, 508, { size: 17, c: COL.mute, a: 'center' });
    if (on) { for (let i = 0; i < 5; i++) { const q = ((t * 1.2 + i / 5) % 1); ctx.fillStyle = rgba(COL.warn, 0.9 * (1 - q)); ctx.fillRect(cx - 4, 560 + q * 100, 8, 14); } }
    ribbon(ctx, W, 'IN DEVELOPMENT', 100);
  },
};
