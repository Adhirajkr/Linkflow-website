import { COL, NAV, pcApp, phoneApp, box, txt, icon, pill, rgba, lightTheme, logo } from './draw.js';
import { L, POSE } from './layout.js';
import { dashboardPC, dashboardPhone } from './intro.js';

export const DEFAULT_CUSTOM = { accent: '#16B8D0', bg: '#EEF3FA', surface: '#FFFFFF', text: '#0E1A2B' };

export const customization = {
  id: 'customization', duration: 8, ease: 3, still: 1,
  layout: () => L({ ...POSE.side, flow: 0.25, dir: 0, glow: [0.9, 0.6, 0.5, 0.35] }),
  pc: (ctx, W, H, t, o = {}) => {
    if (o.dark) return dashboardPC(ctx, W, H, t, true, 0);
    const c = o.custom || DEFAULT_CUSTOM, th = lightTheme(c);
    const r = pcApp(ctx, W, H, { th, active: 0, connected: true });
    txt(ctx, 'Appearance', r.x + 6, r.y + 14, { size: 24, w: 700, c: th.tx });
    pill(ctx, r.x + r.w - 4, r.y + 2, 'Light mode · custom', c.accent, { right: true, h: 28 });
    box(ctx, r.x, r.y + 52, r.w, 96, 18, th.surf, 'rgba(0,0,0,.08)');
    box(ctx, r.x + 18, r.y + 70, 60, 60, 16, rgba(c.accent, 0.18), c.accent); icon(ctx, 'phone', r.x + 48, r.y + 100, 28, c.accent);
    txt(ctx, 'Your Phone', r.x + 96, r.y + 88, { size: 19, w: 700, c: th.tx }); txt(ctx, 'Connected', r.x + 96, r.y + 118, { size: 14, c: th.tx2 });
    const cw = (r.w - 36) / 4, ch = (r.h - 170) / 2;
    NAV.forEach(([ic, label], i) => {
      const x = r.x + (i % 4) * (cw + 12), y = r.y + 164 + Math.floor(i / 4) * (ch + 12), on = i === 0;
      box(ctx, x, y, cw, ch, 18, on ? c.accent : th.surf, on ? null : 'rgba(0,0,0,.08)'); icon(ctx, ic, x + cw / 2, y + ch / 2 - 10, 28, on ? '#fff' : c.accent); txt(ctx, label, x + cw / 2, y + ch / 2 + 24, { size: 14, w: 600, a: 'center', c: on ? '#fff' : th.tx });
    });
  },
  phone: (ctx, W, H, t, o = {}) => {
    if (o.dark) return dashboardPhone(ctx, W, H, t, true);
    const c = o.custom || DEFAULT_CUSTOM, th = lightTheme(c);
    const r = phoneApp(ctx, W, H, { th, connected: true, nav: 0 });
    box(ctx, r.x, r.y, r.w, 130, 24, th.surf, 'rgba(0,0,0,.08)'); box(ctx, r.x + 20, r.y + 24, 80, 80, 22, rgba(c.accent, 0.2), c.accent); icon(ctx, 'pc', r.x + 60, r.y + 64, 36, c.accent);
    txt(ctx, 'Your PC', r.x + 120, r.y + 52, { size: 25, w: 700, c: th.tx }); txt(ctx, 'Windows · paired', r.x + 120, r.y + 88, { size: 16, c: th.tx2 });
    [['clip', 'Clipboard'], ['file', 'Files'], ['screen', 'Screen']].forEach(([ic, l], i) => { const y = r.y + 156 + i * 92; box(ctx, r.x, y, r.w, 78, 20, i === 0 ? c.accent : th.surf, i === 0 ? null : 'rgba(0,0,0,.08)'); icon(ctx, ic, r.x + 42, y + 39, 28, i === 0 ? '#fff' : c.accent); txt(ctx, l, r.x + 80, y + 40, { size: 21, w: 600, c: i === 0 ? '#fff' : th.tx }); });
    box(ctx, r.x, r.y + 450, r.w, 64, 32, c.accent); txt(ctx, 'Save preset', r.x + r.w / 2, r.y + 483, { size: 20, w: 700, a: 'center', c: '#fff' });
  },
};
