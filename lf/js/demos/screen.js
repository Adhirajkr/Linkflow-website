import { COL, DARK, pcApp, phoneApp, phoneHome, desktop, box, txt, icon, pill, qr, rgba, ease, easeOut, seg, cursor, ripple, spinner } from './draw.js';
import { L, POSE, kf } from './layout.js';
import { scanner } from './intro.js';

const ACC = [COL.cyan, COL.blue, COL.purple];
const COLV = [[0.09, 0.72, 0.82], [0.28, 0.5, 0.96], [0.51, 0.36, 0.96]];

// draw landscape content on the (portrait) phone texture, upright once the phone mesh has rotated +90deg
export function landscape(ctx, W, H, draw, cw = 688, ch = 430) {
  ctx.fillStyle = '#02050b'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(Math.PI / 2); ctx.translate(-cw / 2, -ch / 2);
  ctx.beginPath(); ctx.rect(0, 0, cw, ch); ctx.clip(); draw(cw, ch); ctx.restore();
}

function mirrorPC(ctx, W, H, t) {
  const r = pcApp(ctx, W, H, { active: 4, connected: t > 3.8 });
  txt(ctx, 'Screen sharing', r.x + 6, r.y + 14, { size: 24, w: 700 });
  pill(ctx, r.x + r.w - 4, r.y + 2, 'Phone to PC · QR mirror', COL.cyan, { right: true, h: 28 });
  const cx = r.x + r.w / 2;
  if (t < 4.6) {
    const a = 1 - seg(t, 4.2, 4.7);
    ctx.globalAlpha = a; qr(ctx, cx - 100, r.y + 62, 200, 11); txt(ctx, 'Scan to mirror your phone', cx, r.y + 300, { size: 17, w: 600, a: 'center' });
    pill(ctx, cx - 135, r.y + 330, 'Uses wireless debugging (ADB over Wi-Fi)', COL.mute === '' ? COL.cyan : COL.teal, { h: 28, size: 12 }); ctx.globalAlpha = 1;
    if (t > 3.2 && t < 4.7) { spinner(ctx, cx, r.y + 180, 34, t, COL.cyan); }
  } else {
    const p = easeOut(seg(t, 4.6, 5.8)), h = (r.h - 8) * p, w = h * 0.4526, x = r.x + r.w / 2 - w - 20 + (1 - p) * 60, y = r.y + 4 + (r.h - 8 - h) / 2;
    ctx.save(); ctx.shadowColor = rgba(COL.cyan, 0.5); ctx.shadowBlur = 26; box(ctx, x - 5, y - 5, w + 10, h + 10, 26 * p, '#05080e', rgba(COL.cyan, 0.8), 2); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 22 * p); ctx.clip(); ctx.translate(x, y); ctx.scale(w / 430, h / 950); phoneHome(ctx, 430, 950, t); ctx.restore();
    const a = ease(seg(t, 5.6, 6.2)); ctx.globalAlpha = a;
    txt(ctx, 'Your phone,', x + w + 50, r.y + 120, { size: 28, w: 700 }); txt(ctx, 'on your PC.', x + w + 50, r.y + 156, { size: 28, w: 700, c: COL.cyan });
    txt(ctx, 'Live mirror of the', x + w + 50, r.y + 200, { size: 15, c: COL.mute }); txt(ctx, 'Android screen.', x + w + 50, r.y + 222, { size: 15, c: COL.mute });
    pill(ctx, x + w + 50, r.y + 256, 'Mirroring', COL.ok, { dot: true, h: 28 }); ctx.globalAlpha = 1;
  }
}
function mirrorPhone(ctx, W, H, t) {
  if (t < 1.2) { phoneApp(ctx, W, H, { connected: false }); box(ctx, 22, 330, W - 44, 190, 26, DARK.surf, DARK.line); icon(ctx, 'screen', W / 2, 400, 48, COL.cyan); txt(ctx, 'Mirror to PC', W / 2, 462, { size: 24, w: 700, a: 'center' }); txt(ctx, 'Scan the code on your PC', W / 2, 494, { size: 16, c: COL.mute, a: 'center' }); return; }
  if (t < 4.6) { scanner(ctx, W, H, t - 1.2, t > 3.4, 11); return; }
  phoneHome(ctx, W, H, t);
  const p = 1 - seg(t, 4.6, 5.3); if (p > 0) { ctx.fillStyle = `rgba(8,14,25,${p * 0.9})`; ctx.fillRect(0, 0, W, H); }
  pill(ctx, W / 2 - 78, 56, 'Mirroring to PC', COL.ok, { dot: true, h: 34, size: 14, fill: 0.5 });
}

function p2pPC(ctx, W, H, t) {
  if (t < 1.9) {
    const r = pcApp(ctx, W, H, { active: 4, connected: true }); txt(ctx, 'Screen sharing', r.x + 6, r.y + 14, { size: 24, w: 700 }); pill(ctx, r.x + r.w - 4, r.y + 2, 'PC to Phone', COL.blue, { right: true, h: 28 });
    box(ctx, r.x + r.w / 2 - 150, r.y + 130, 300, 70, 35, COL.blue); txt(ctx, 'Stream to phone', r.x + r.w / 2, r.y + 165, { size: 21, w: 700, a: 'center' });
    const p = seg(t, 0.8, 1.2); cursor(ctx, r.x + r.w / 2 + 200 - p * 190 * (1), r.y + 260 - p * 100 + 0, 1); ripple(ctx, r.x + r.w / 2 + 10, r.y + 160, seg(t, 1.2, 1.9), COL.blue, 60); return;
  }
  desktop(ctx, W, H, t);
  pill(ctx, W - 24, 12, 'Streaming to phone', COL.blue, { right: true, dot: true, h: 30, size: 13, fill: 0.5 });
  const a = 1 - seg(t, 1.9, 2.4); if (a > 0) { ctx.fillStyle = `rgba(8,14,25,${a})`; ctx.fillRect(0, 0, W, H); }
}
function p2pPhone(ctx, W, H, t) {
  if (t < 2.7) { phoneApp(ctx, W, H, { connected: true, nav: 2 }); txt(ctx, 'Waiting for PC screen…', W / 2, 400, { size: 22, w: 600, a: 'center', c: COL.mute }); spinner(ctx, W / 2, 330, 30, t, COL.blue); return; }
  landscape(ctx, W, H, (cw, ch) => { ctx.save(); ctx.scale(ch / 640, ch / 640); ctx.translate((cw / (ch / 640) - 1024) / 2, 0); desktop(ctx, 1024, 640, t); ctx.restore(); ctx.globalAlpha = 1 - seg(t, 2.7, 3.3); ctx.fillStyle = '#0a1220'; ctx.fillRect(0, 0, cw, ch); });
}

const WIN = { w: 330, h: 230 };
function note(ctx, x, y, t) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; box(ctx, x, y, WIN.w, WIN.h, 14, '#101D33', rgba(COL.purple, 0.8), 1.6); ctx.restore();
  box(ctx, x, y, WIN.w, 34, 14, rgba(COL.purple, 0.3)); txt(ctx, 'Notes — drag me', x + 16, y + 18, { size: 13, w: 700 });
  for (let i = 0; i < 5; i++) box(ctx, x + 20, y + 58 + i * 30, WIN.w - 40 - (i % 3) * 50, 9, 4.5, 'rgba(255,255,255,.2)');
}
const winX = (t) => t < 8.6 ? kf(t, [[2.0, 330], [4.6, 1024 + 100], [5.2, 1024 + 100]]) : kf(t, [[8.6, 1124], [9.8, 330]]);
function secondPC(ctx, W, H, t) {
  const r = pcApp(ctx, W, H, { th: DARK, bare: true }); desktop(ctx, W, H, t);
  ctx.fillStyle = 'rgba(8,14,25,.45)'; ctx.fillRect(0, 0, W, H);
  pill(ctx, 24, 14, 'Display 1', COL.cyan, { h: 28 }); pill(ctx, W - 24, 14, 'Display 2 → phone', COL.purple, { h: 28, right: true });
  const x = winX(t); note(ctx, x, 190, t);
  if (t > 1.2 && t < 5.2) cursor(ctx, x + 70, 196, 1.1); else if (t > 8.6 && t < 9.8) cursor(ctx, x + 70, 196, 1.1);
}
function secondPhone(ctx, W, H, t) {
  if (t < 1.5) { phoneApp(ctx, W, H, { connected: true, nav: 2 }); spinner(ctx, W / 2, 330, 30, t, COL.purple); txt(ctx, 'Extending your PC…', W / 2, 400, { size: 22, w: 600, a: 'center', c: COL.mute }); return; }
  landscape(ctx, W, H, (cw, ch) => {
    const g = ctx.createLinearGradient(0, 0, cw, ch); g.addColorStop(0, '#0b1325'); g.addColorStop(1, '#1a1550'); ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    pill(ctx, cw - 16, 12, 'Display 2', COL.purple, { right: true, h: 26 });
    ctx.save(); ctx.scale(0.672, 0.672); const x = winX(t) - 1024; note(ctx, x, 190, t); ctx.restore();
    if (t < 3.6) txt(ctx, 'Extended display', cw / 2, ch / 2, { size: 26, w: 600, a: 'center', c: 'rgba(255,255,255,.55)' });
  });
}

export const screen = {
  id: 'screen', duration: 10, modes: 3, ease: 3, still: [7, 6, 7],
  layout: (t, o = {}) => {
    const m = o.mode || 0;
    if (m === 0) return L({ ...POSE.side, flow: kf(t, [[3.8, 0], [4.8, 1]]), dir: 1, col: COLV[0], glow: [0.09, 0.72, 0.82, 0.45] });
    if (m === 1) return L({ lap: { x: 1.1, y: -0.6, z: -0.5, ry: -0.3 }, ph: { x: -1.9, y: -0.2, z: 0.9, ry: 0.5, rz: kf(t, [[1.7, 0], [2.7, Math.PI / 2]]) }, flow: kf(t, [[1.9, 0], [2.7, 1]]), dir: -1, col: COLV[1], glow: [0.28, 0.5, 0.96, 0.5] });
    return L({ lap: { x: -0.9, y: -0.6, z: -0.3, ry: 0.22 }, ph: { x: 2.55, y: -0.12, z: 0.05, ry: -0.55, rz: Math.PI / 2, s: 1.12 }, flow: kf(t, [[1.3, 0], [2.0, 0.7]]), dir: -1, col: COLV[2], ext: { w: 7.2, h: 4.2 }, glow: [0.51, 0.36, 0.96, 0.5] });
  },
  pc: (ctx, W, H, t, o = {}) => [mirrorPC, p2pPC, secondPC][o.mode || 0](ctx, W, H, t),
  phone: (ctx, W, H, t, o = {}) => [mirrorPhone, p2pPhone, secondPhone][o.mode || 0](ctx, W, H, t),
};
