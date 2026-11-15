// Cinematic stage: one fixed WebGL canvas. The two devices "fly" to whichever [data-stage] element is on screen,
// re-pose themselves for that feature, and play that feature's demo on their screens.
import { GL } from '../gl/gl.js';
import { persp, T, S, RX, RY, RZ, mulN, pt, clamp, seg, easeOut, ident } from '../gl/math.js';
import { createDevices, PC_W, PC_H, PH_W, PH_H } from './devices.js';
import { glowCanvas, ringCanvas, dashRingCanvas, floorCanvas, iconBadge, ICON_NAMES } from './fx.js';
import { DEMOS } from '../demos/index.js';
import { DEF } from '../demos/layout.js';
import { state } from '../state.js';
import { plane } from '../gl/geo.js';

const FOV = (34 * Math.PI) / 180, D = 13;

function copyTo(cur, tgt) { for (const k in tgt) { if (Array.isArray(tgt[k])) cur[k] = tgt[k].slice(); else if (tgt[k] && typeof tgt[k] === 'object') { cur[k] = {}; copyTo(cur[k], tgt[k]); } else cur[k] = tgt[k]; } }
function tween(cur, tgt, k) {
  for (const key in tgt) {
    const v = tgt[key];
    if (key === 'dir' || key === 'src') cur[key] = v;
    else if (Array.isArray(v)) v.forEach((n, i) => { cur[key][i] += (n - cur[key][i]) * k; });
    else if (v && typeof v === 'object') tween(cur[key], v, k);
    else cur[key] += (v - cur[key]) * k;
  }
}
function maskRound(ctx, W, H, r) {
  ctx.save(); ctx.globalCompositeOperation = 'destination-in'; ctx.beginPath(); ctx.roundRect(0, 0, W, H, r); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
}
const fract = (v) => v - Math.floor(v);

export function startStage(canvas, { onFail } = {}) {
  let g;
  try { g = new GL(canvas); } catch (e) { onFail && onFail(e); return null; }
  g.fov = FOV; g.cam = [0, 0, D];
  const dev = createDevices(g);
  const pcCtx = dev.pcCanvas.getContext('2d'), phCtx = dev.phCanvas.getContext('2d');
  const quad = g.mesh(plane(1, 1));
  const tex = { glow: g.texture(glowCanvas()), ring: g.texture(ringCanvas()), dash: g.texture(dashRingCanvas()), floor: g.texture(floorCanvas()) };
  const iconTex = ICON_NAMES.map((n) => ({ off: g.texture(iconBadge(n, false)), on: g.texture(iconBadge(n, true)) }));

  let W = 1, H = 1, asp = 1, ppu = 100, dpr = 1;
  const stages = [...document.querySelectorAll('[data-stage]')].map((el) => ({ el, id: el.dataset.stage }));
  const halfH = D * Math.tan(FOV / 2);
  function resize() {
    W = innerWidth; H = innerHeight; asp = W / H;
    dpr = Math.min(devicePixelRatio || 1, W < 700 ? 1.5 : 2) * (perfScale || 1);
    g.resize(W, H, dpr); ppu = H / (2 * halfH);
    g.VP = mulN(persp(FOV, asp, 4, 40), T(0, 0, -D));
  }
  let perfScale = 1; resize();
  addEventListener('resize', resize);

  // dust field (world space)
  const DUST = 380, dust = [];
  for (let i = 0; i < DUST; i++) dust.push({ x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 18, z: -9 + Math.random() * 13, s: 2 + Math.random() * 6, a: 0.05 + Math.random() * 0.22, c: Math.random(), sp: 0.1 + Math.random() * 0.4 });

  const buf = new Float32Array(4096 * 8); let nb = 0;
  const P = (x, y, z, r, gg, b, a, s) => { if (nb >= 4096) return; const o = nb * 8; buf[o] = x; buf[o + 1] = y; buf[o + 2] = z; buf[o + 3] = r; buf[o + 4] = gg; buf[o + 5] = b; buf[o + 6] = a; buf[o + 7] = s; nb++; };

  // ---- state ----
  let active = null, lastActive = null, clock = 0, modeKey = '', time = 0, last = performance.now(), lastTex = 0, intro = state.reduce ? 1 : 0, introStarted = false;
  let cur = null, vis = 0, anc = null, prevAnc = null, fly = { x: 0, y: 0 }, pointer = { x: 0, y: 0 };
  let slow = 0, frames = 0;
  addEventListener('pointermove', (e) => { state.pointer.x = (e.clientX / innerWidth) * 2 - 1; state.pointer.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

  function pickStage() {
    let best = null, bd = 1e9;
    for (const s of stages) {
      const r = s.el.getBoundingClientRect(); s.r = r;
      const v = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)) / Math.max(1, r.height);
      const d = Math.abs(r.top + r.height / 2 - H / 2) - (s === active ? H * 0.12 : 0);
      s.v = v;
      if (v >= 0.3 && r.width > 40 && d < bd) { bd = d; best = s; }
    }
    return best;
  }

  let failed = false;
  function frame(now) {
    try { frameInner(now); } catch (e) {
      if (!failed) { failed = true; console.error('LinkFlow stage stopped:', e); canvas.style.display = 'none'; onFail && onFail(e); }
      return;
    }
    requestAnimationFrame(frame);
  }
  function frameInner(now) {
    if (document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (dt > 0.034) slow++; else slow = Math.max(0, slow - 1);
    if (++frames % 90 === 0 && slow > 40 && dpr > 1) { perfScale = 0.7; resize(); slow = 0; }
    time += dt;
    const nextActive = pickStage();
    if (nextActive) { active = nextActive; }
    const showing = !!nextActive;
    const demo = active ? DEMOS[active.id] : null;
    if (!demo) { return; }
    const o = { mode: state.modes[demo.id] || 0, custom: state.custom, dark: state.dark };
    const key = demo.id + ':' + o.mode;
    if (key !== modeKey) { modeKey = key; clock = 0; }
    clock += dt;
    // scrub or loop time
    let t;
    if (demo.scrub) {
      const sec = active.el.closest('[data-scrub]');
      const r = sec.getBoundingClientRect(); const p = clamp(-r.top / Math.max(1, r.height - H));
      t = p * demo.duration;
      const idx = demo.steps.filter((s) => t >= s).length; if (sec.dataset.step !== String(idx)) sec.dataset.step = idx;
      sec.style.setProperty('--p', p.toFixed(3));
    } else if (state.reduce) t = Array.isArray(demo.still) ? demo.still[o.mode] : demo.still ?? demo.duration * 0.5;
    else t = clock % demo.duration;

    // layout tween
    const tgt = demo.layout(t, o);
    if (!cur) { cur = JSON.parse(JSON.stringify(tgt)); }
    const rate = state.reduce ? 60 : demo.ease || 3;
    tween(cur, tgt, 1 - Math.exp(-dt * rate));
    // anchor
    if (showing) {
      const r = active.r; const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const ax = ((cx / W) * 2 - 1) * halfH * asp, ay = (1 - (cy / H) * 2) * halfH;
      const sc = Math.min(r.width / (cur.ext.w * ppu), r.height / (cur.ext.h * ppu)) * 1.08;
      if (!anc) anc = { x: ax, y: ay, s: sc };
      else { const k = 1 - Math.exp(-dt * (state.reduce ? 60 : 5.2)); prevAnc = { ...anc }; anc.x += (ax - anc.x) * k; anc.y += (ay - anc.y) * k; anc.s += (sc - anc.s) * k; }
    }
    vis += ((showing ? 1 : 0) - vis) * (1 - Math.exp(-dt * 5));
    if (!anc) return;
    // fly spin
    const vx = prevAnc ? (anc.x - prevAnc.x) / Math.max(dt, 0.001) : 0, vy = prevAnc ? (anc.y - prevAnc.y) / Math.max(dt, 0.001) : 0;
    fly.x += (clamp(vx * 0.08, -0.9, 0.9) - fly.x) * 0.1; fly.y += (clamp(vy * 0.05, -0.5, 0.5) - fly.y) * 0.1;
    pointer.x += (state.pointer.x - pointer.x) * 0.05; pointer.y += (state.pointer.y - pointer.y) * 0.05;
    const calm = state.reduce ? 0 : 1;

    // intro (first load): lid opens, phone rises
    if (!introStarted && showing) introStarted = true;
    if (introStarted && intro < 1) intro = Math.min(1, intro + dt / 3.6);
    const eIn = easeOut(clamp(intro));
    const sIn = 0.82 + 0.18 * eIn;
    const open = cur.lap.open * (intro < 1 && active.id === 'hero' ? easeOut(seg(intro, 0.08, 0.62)) : 1);

    // screens (30 fps)
    if (now - lastTex > 33) {
      lastTex = now;
      pcCtx.setTransform(1, 0, 0, 1, 0, 0); pcCtx.globalAlpha = 1; pcCtx.clearRect(0, 0, PC_W, PC_H); demo.pc(pcCtx, PC_W, PC_H, t, o); maskRound(pcCtx, PC_W, PC_H, 12); dev.tex.pc.update();
      phCtx.setTransform(1, 0, 0, 1, 0, 0); phCtx.globalAlpha = 1; phCtx.clearRect(0, 0, PH_W, PH_H); demo.phone(phCtx, PH_W, PH_H, t, o); maskRound(phCtx, PH_W, PH_H, 46); dev.tex.ph.update();
    }

    // compose layout with floating motion
    const L = JSON.parse(JSON.stringify(cur));
    L.lap.y += Math.sin(time * 0.8) * 0.035 * calm; L.ph.y += Math.sin(time * 1.1 + 1) * 0.055 * calm; L.ph.ry += Math.sin(time * 0.7) * 0.025 * calm;
    if (active.id === 'hero') L.ph.y -= (1 - easeOut(seg(intro, 0.4, 1))) * 3;
    const a = clamp(vis) * (active.id === 'hero' ? clamp(intro * 5) : 1);
    const rs = anc.s * vis * sIn;
    const rig = mulN(T(anc.x, anc.y, 0), RX(L.rig.rx + pointer.y * 0.1 * calm - fly.y), RY(L.rig.ry + pointer.x * 0.24 * calm + fly.x), RZ(fly.x * -0.05), S(rs));

    g.VP = mulN(persp(FOV, asp, 4, 40), T(0, 0, -D));
    g.begin();
    const col = cur.col;
    if (vis > 0.01) {
      g.opaque();
      const Pm = dev.drawOpaque(rig, L, open, a);
      // USB cable
      const A = pt(dev.phMat(L), 0, -0.98, 0), B = pt(dev.lapMat(L), -1.68, 0.07, 0.3);
      const phC = [L.ph.x, L.ph.y, L.ph.z], lapC = pt(dev.lapMat(L), 0, 1.0, -0.9);
      const path = (cur.cable > 0.02) ? cablePath(A, B) : arcPath(phC, lapC, L);
      if (cur.cable > 0.02) {
        const n = Math.max(2, Math.round(64 * clamp(cur.cableP)));
        const pts = []; for (let i = 0; i < n; i++) { const u = 1 - (i / (n - 1)) * clamp(cur.cableP); pts.push(bez(path.A, path.C, path.B, u)); }
        if (pts.length > 1) g.drawTube(pts, 0.032 * Math.min(1, cur.cable * 2), 8, rig, { c: [0.06, 0.07, 0.1], metal: 0.5, rough: 0.5, em: [0.1, 0.07, 0.02], a });
      }
      g.alpha();
      dev.drawScreens(Pm, a);
      g.additive();
      // glows & floor
      const gl = cur.glow, glc = [gl[0], gl[1], gl[2]];
      quadAt(rig, [L.lap.x, L.lap.y + 0.9, L.lap.z - 1.0], 5.2 * rs * 1, tex.glow, [glc[0], glc[1], glc[2], gl[3] * 0.32 * a], 'bill');
      quadAt(rig, [L.ph.x, L.ph.y, L.ph.z - 0.3], 2.8 * rs, tex.glow, [glc[0], glc[1], glc[2], gl[3] * 0.4 * a], 'bill');
      g.drawTex(quad, mulN(rig, T(0, -1.95, 0), RX(-Math.PI / 2), S(8.5, 8.5, 1)), tex.floor, { tint: [col[0], col[1], col[2], 0.5 * a] });
      g.drawTex(quad, mulN(rig, T(0, -1.94, 0), RX(-Math.PI / 2), RZ(time * 0.08), S(5.8, 5.8, 1)), tex.dash, { tint: [col[0], col[1], col[2], 0.55 * a] });
      g.drawTex(quad, mulN(rig, T(0, -1.94, 0), RX(-Math.PI / 2), RZ(-time * 0.05), S(7.6, 7.6, 1)), tex.dash, { tint: [col[0], col[1], col[2], 0.22 * a] });
      // beam
      nb = 0;
      const flow = cur.flow * a;
      if (flow > 0.01 || cur.waves > 0.01) {
        const pa = path.A, pbn = path.B;
        const wob = cur.waves;
        for (let i = 0; i < 90; i++) { const u = i / 89, p = bez(pa, path.C, pbn, u); P(p[0], p[1], p[2], col[0], col[1], col[2], 0.2 * flow * (0.6 + 0.4 * Math.sin(u * 20 - time * 3)), 5); }
        for (let i = 0; i < 28; i++) { const u = i / 27, p = bez(pa, path.C, pbn, u); P(p[0], p[1], p[2], col[0], col[1], col[2], 0.05 * flow, 17); }
        const n = 22;
        for (let k = 0; k < n; k++) {
          const sgn = cur.dir === 0 ? (k % 2 ? -1 : 1) : cur.dir;
          let u = fract(k / n + time * 0.3 * sgn * (0.8 + (k % 5) * 0.07)); if (sgn < 0) u = 1 - fract(k / n - time * 0.3 * (0.8 + (k % 5) * 0.07) * -1 * -1);
          u = clamp(u); const p = bez(pa, path.C, pbn, u), fade = Math.sin(u * Math.PI);
          const sz = (13 + (k % 3) * 4) * (1 + wob * 0.9 * Math.sin(k * 1.7 + time * 9));
          P(p[0], p[1], p[2], 0.55 + col[0] * 0.45, 0.8 + col[1] * 0.2, 0.9 + col[2] * 0.1, 0.95 * flow * fade, sz);
        }
        const pulse = 0.7 + 0.3 * Math.sin(time * 3);
        P(pa[0], pa[1], pa[2], col[0], col[1], col[2], 0.4 * flow * pulse, 44); P(pbn[0], pbn[1], pbn[2], col[0], col[1], col[2], 0.4 * flow * pulse, 44);
      }
      g.drawPoints(buf, nb, rig);
      // sound waves (billboards at source device)
      if (cur.waves > 0.01) {
        const src = cur.src ? [L.ph.x, L.ph.y, L.ph.z + 0.3] : pt(dev.lapMat(L), 0, 1.0, -0.6);
        for (let k = 0; k < 4; k++) { const u = fract(time * 0.38 + k / 4); quadAt(rig, src, (0.7 + u * 3.6) * rs, tex.ring, [col[0], col[1], col[2], Math.pow(1 - u, 1.6) * cur.waves * 0.6 * a], 'bill'); }
      }
      // floating feature icons
      if (cur.icons > 0.01) {
        for (let i = 0; i < 8; i++) {
          const ang = time * 0.22 * calm + (i / 8) * Math.PI * 2 + 0.3;
          const lp = [Math.cos(ang) * cur.ext.w * 0.47, 0.35 + Math.sin(ang * 1) * cur.ext.h * 0.3, Math.sin(ang) * 1.6];
          const on = clamp(cur.iconsOn - i), dep = 0.65 + 0.35 * (Math.sin(ang) * 0.5 + 0.5);
          const sz = 0.78 * rs * (0.85 + 0.2 * Math.sin(ang));
          quadAt(rig, lp, sz, iconTex[i].off, [1, 1, 1, (1 - on) * cur.icons * 0.7 * dep * a], 'bill');
          if (on > 0.01) quadAt(rig, lp, sz * (1 + 0.12 * Math.sin(on * Math.PI)), iconTex[i].on, [1, 1, 1, on * cur.icons * dep * a], 'bill');
        }
      }
    }
    // dust
    nb = 0;
    const sy = scrollY;
    for (const d of dust) {
      const y = (((d.y + time * d.sp * 0.15 * calm - sy * 0.0016 * (1 + (d.z + 9) * 0.12)) % 18) + 27) % 18 - 9;
      P(d.x + Math.sin(time * 0.1 + d.y) * 0.3 * calm, y, d.z, 0.5 + d.c * 0.1, 0.85 - d.c * 0.15, 1.0, d.a, d.s);
    }
    g.additive(); g.drawPoints(buf, nb, ident());
  }

  function quadAt(rig, lp, size, tx, tint, mode) { // camera-facing billboard at a rig-local point
    const w = pt(rig, lp[0], lp[1], lp[2]);
    g.drawTex(quad, mulN(T(w[0], w[1], w[2]), S(size, size, 1)), tx, { tint });
  }
  function bez(a, c, b, u) { const v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1], v * v * a[2] + 2 * v * u * c[2] + u * u * b[2]]; }
  function arcPath(phC, lapC, L) {
    const dx = lapC[0] - phC[0], dy = lapC[1] - phC[1], dz = lapC[2] - phC[2], len = Math.hypot(dx, dy, dz) || 1;
    const A = [phC[0] + (dx / len) * 0.65, phC[1] + (dy / len) * 0.65 + 0.2, phC[2] + (dz / len) * 0.65];
    const B = [lapC[0] - (dx / len) * 1.5 * L.lap.s, lapC[1] - (dy / len) * 1.2, lapC[2] - (dz / len) * 1.0 + 0.9];
    const C = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 0.9 + len * 0.08, (A[2] + B[2]) / 2 + 0.7];
    return { A, B, C };
  }
  function cablePath(A, B) { const C = [(A[0] + B[0]) / 2 - 0.2, Math.min(A[1], B[1]) - 0.75, (A[2] + B[2]) / 2 + 0.55]; return { A, B, C }; }

  requestAnimationFrame(frame);
  return { gl: g };
}
