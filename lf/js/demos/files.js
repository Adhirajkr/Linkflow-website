import { COL, DARK, pcApp, phoneApp, box, txt, icon, pill, rgba, ease, easeOut, seg, cursor, ripple, progressBar, checkBadge } from './draw.js';
import { L, POSE, kf } from './layout.js';

const FILES = [['file', 'Report.pdf', COL.cyan], ['image', 'Photo.jpg', COL.purple], ['note', 'Notes.txt', COL.teal], ['play', 'Clip.mp4', COL.blue]];

function fileTile(ctx, x, y, w, h, ic, name, col, scale = 1, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x + w / 2, y + h / 2); ctx.scale(scale, scale); ctx.translate(-w / 2, -h / 2);
  box(ctx, 0, 0, w, h, 16, DARK.surf, rgba(col, 0.55)); icon(ctx, ic, w / 2, h / 2 - 10, 30, col); txt(ctx, name, w / 2, h - 20, { size: 13, w: 600, a: 'center' }); ctx.restore();
}

export const files = {
  id: 'files', duration: 12, ease: 3, still: 4.2,
  layout: (t) => L({
    ...POSE.side, flow: kf(t, [[1.6, 0.2], [2.4, 1], [5.4, 1], [5.9, 0.2], [6.6, 0.2], [7.4, 1], [10.6, 1], [11.2, 0.2]]), dir: t < 6 ? -1 : 1,
  }),
  pc: (ctx, W, H, t) => {
    const r = pcApp(ctx, W, H, { active: 2, connected: true });
    txt(ctx, 'Files', r.x + 6, r.y + 14, { size: 24, w: 700 });
    const cw = 118, ch = 104, dropX = r.x + r.w - 200, dropY = r.y + 60;
    // PC -> phone
    FILES.forEach(([ic, n, c], i) => {
      const x = r.x + (i % 2) * (cw + 14), y = r.y + 56 + Math.floor(i / 2) * (ch + 14);
      if (i === 0 && t > 0.9 && t < 6.2) return; // being dragged
      if (i === 1 && t > 6.6) { fileTile(ctx, x, y, cw, ch, ic, n, c, 1, 1); return; }
      fileTile(ctx, x, y, cw, ch, ic, n, c);
    });
    // drop zone
    const hot = t > 1.6 && t < 6 ? 1 : 0;
    ctx.save(); ctx.setLineDash([8, 8]); box(ctx, dropX, dropY, 180, 150, 20, hot ? rgba(COL.cyan, 0.1) : null, rgba(COL.cyan, hot ? 0.9 : 0.35), 2); ctx.restore();
    icon(ctx, 'phone', dropX + 90, dropY + 52, 30, COL.cyan); txt(ctx, 'Send to phone', dropX + 90, dropY + 100, { size: 14, w: 600, a: 'center' });
    const prog1 = seg(t, 2.6, 5.2);
    if (t > 2.4 && t < 6.4) { progressBar(ctx, dropX + 14, dropY + 122, 152, 8, prog1); txt(ctx, prog1 >= 1 ? 'Sent' : Math.round(prog1 * 100) + '%', dropX + 90, dropY + 148, { size: 12, c: prog1 >= 1 ? COL.ok : COL.mute, a: 'center', w: 600 }); }
    // drag path
    if (t > 0.9 && t < 2.6) { const p = ease(seg(t, 0.9, 2.2)); const sx = r.x + 59, sy = r.y + 108, ex = dropX + 90, ey = dropY + 70; const x = sx + (ex - sx) * p, y = sy + (ey - sy) * p; fileTile(ctx, x - 59, y - 52, cw, ch, 'file', 'Report.pdf', COL.cyan, 1 + 0.06 * Math.sin(p * 3), 0.95); cursor(ctx, x + 10, y + 6); }
    if (t > 2.6 && t < 5.2) { const p = seg(t, 2.6, 5.2); for (let i = 0; i < 3; i++) { const q = (p * 3 + i / 3) % 1; ctx.fillStyle = rgba(COL.cyan, 0.8 * (1 - q)); ctx.fillRect(dropX + 180 + q * 120, dropY + 40 + i * 30, 26, 6); } }
    // PC receiving (phone -> PC)
    const rx = r.x, ry = r.y + 300;
    txt(ctx, 'Receiving', rx + 6, ry - 10, { size: 15, w: 700, c: t > 6.6 ? COL.text : COL.mute });
    if (t > 6.6) { const p = seg(t, 7.0, 10.2); box(ctx, rx, ry + 6, r.w, 76, 18, DARK.surf, DARK.line); icon(ctx, 'image', rx + 38, ry + 44, 30, COL.purple); txt(ctx, 'Photo.jpg', rx + 72, ry + 32, { size: 17, w: 700 }); progressBar(ctx, rx + 72, ry + 54, r.w - 200, 8, p, COL.purple); txt(ctx, p >= 1 ? 'Received' : Math.round(p * 100) + '%', rx + r.w - 24, ry + 44, { size: 14, w: 700, a: 'right', c: p >= 1 ? COL.ok : COL.mute }); if (p >= 1) checkBadge(ctx, rx + r.w - 100, ry + 44, 12, seg(t, 10.2, 10.6)); }
  },
  phone: (ctx, W, H, t) => {
    const r = phoneApp(ctx, W, H, { connected: true, nav: 1 });
    if (t < 6) {
      txt(ctx, 'Incoming', r.x + 4, r.y + 12, { size: 26, w: 700 });
      const p = seg(t, 2.6, 5.2), a = ease(seg(t, 2.4, 3));
      if (t > 2.4) { ctx.globalAlpha = a; box(ctx, r.x, r.y + 56, r.w, 150, 24, DARK.surf, rgba(COL.cyan, 0.6), 1.6); icon(ctx, 'file', r.x + 48, r.y + 108, 34, COL.cyan); txt(ctx, 'Report.pdf', r.x + 90, r.y + 96, { size: 22, w: 700 }); txt(ctx, p >= 1 ? 'Saved to your phone' : 'Receiving from PC…', r.x + 90, r.y + 128, { size: 15, c: p >= 1 ? COL.ok : COL.mute }); progressBar(ctx, r.x + 24, r.y + 166, r.w - 90, 10, p); txt(ctx, Math.round(p * 100) + '%', r.x + r.w - 20, r.y + 171, { size: 15, w: 700, a: 'right' }); if (p >= 1) checkBadge(ctx, r.x + r.w - 40, r.y + 100, 16, seg(t, 5.2, 5.6)); ctx.globalAlpha = 1; }
      else { txt(ctx, 'Nothing incoming', r.x + r.w / 2, r.y + 120, { size: 17, c: COL.mute, a: 'center' }); }
    } else {
      txt(ctx, 'Send to PC', r.x + 4, r.y + 12, { size: 26, w: 700 });
      const cols = [COL.purple, COL.cyan, COL.teal, COL.blue, COL.warn, '#ff6b8b'];
      for (let i = 0; i < 6; i++) { const x = r.x + (i % 3) * 126, y = r.y + 56 + Math.floor(i / 3) * 126, sel = i === 1 && t > 6.8; box(ctx, x, y, 114, 114, 18, rgba(cols[i], 0.25), sel ? COL.cyan : rgba(cols[i], 0.5), sel ? 3 : 1); icon(ctx, 'image', x + 57, y + 57, 36, cols[i]); if (sel) checkBadge(ctx, x + 96, y + 18, 11, 1); }
      ripple(ctx, r.x + 183, r.y + 113, seg(t, 6.6, 7.0), COL.cyan, 50);
      const a = ease(seg(t, 7.3, 7.8)); ctx.globalAlpha = a; box(ctx, r.x, r.y + 330, r.w, 120, 24, DARK.surf, rgba(COL.cyan, 0.6), 1.6);
      const p = seg(t, 7.4, 10.2); txt(ctx, 'Sending Photo.jpg', r.x + 24, r.y + 362, { size: 20, w: 700 }); progressBar(ctx, r.x + 24, r.y + 392, r.w - 48, 10, p, COL.purple); txt(ctx, p >= 1 ? 'Delivered to your PC' : Math.round(p * 100) + '%', r.x + 24, r.y + 428, { size: 15, w: 600, c: p >= 1 ? COL.ok : COL.mute }); ctx.globalAlpha = 1;
    }
  },
};
