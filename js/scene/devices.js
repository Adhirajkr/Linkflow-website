// The two hero objects: a Windows laptop and an Android phone, built from procedural geometry.
import { T, S, RX, RY, RZ, mulN, pt } from '../gl/math.js';
import { extrude, plane } from '../gl/geo.js';

export const PC_W = 1024, PC_H = 640, PH_W = 430, PH_H = 950;

function keyboardCanvas() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 661; const x = c.getContext('2d');
  x.fillStyle = '#0c1422'; x.fillRect(0, 0, 1024, 661);
  const rows = [14, 14, 13, 12, 10];
  for (let r = 0; r < 5; r++) {
    const n = rows[r], kw = (960 - (n - 1) * 8) / n;
    for (let i = 0; i < n; i++) { x.fillStyle = '#16233a'; x.beginPath(); x.roundRect(32 + i * (kw + 8), 40 + r * 62, kw, 52, 8); x.fill(); x.fillStyle = 'rgba(90,210,230,.1)'; x.fillRect(32 + i * (kw + 8) + 6, 40 + r * 62 + 46, kw - 12, 2); }
  }
  x.strokeStyle = 'rgba(90,210,230,.28)'; x.lineWidth = 3; x.beginPath(); x.roundRect(352, 380, 320, 210, 22); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.03)'; x.fill();
  return c;
}

export function createDevices(g) {
  const pcCanvas = Object.assign(document.createElement('canvas'), { width: PC_W, height: PC_H });
  const phCanvas = Object.assign(document.createElement('canvas'), { width: PH_W, height: PH_H });
  const keyCanvas = keyboardCanvas();
  const tex = { pc: g.texture(pcCanvas), ph: g.texture(phCanvas), keys: g.texture(keyCanvas) };
  const m = {
    base: g.mesh(extrude(3.3, 2.2, 0.09, 0.14, 0.014)),
    lid: g.mesh(extrude(3.3, 2.12, 0.07, 0.12, 0.012)),
    bezelPC: g.mesh(extrude(3.2, 2.02, 0.002, 0.07, 0.001)),
    scrPC: g.mesh(plane(3.1, 1.94)),
    keys: g.mesh(plane(3.1, 2.0)),
    ph: g.mesh(extrude(0.92, 1.96, 0.09, 0.16, 0.014)),
    bezelPh: g.mesh(extrude(0.9, 1.94, 0.002, 0.14, 0.001)),
    scrPh: g.mesh(plane(0.86, 1.9)),
    bump: g.mesh(extrude(0.4, 0.4, 0.03, 0.11, 0.008)),
    lens: g.mesh(extrude(0.15, 0.15, 0.04, 0.075, 0.008)),
    btn: g.mesh(extrude(0.03, 0.26, 0.02, 0.012, 0.004)),
  };
  const ALU = { c: [0.1, 0.14, 0.21], metal: 0.9, rough: 0.35 };
  const TI = { c: [0.13, 0.18, 0.27], metal: 0.9, rough: 0.3 };
  const GLASS = { c: [0.008, 0.012, 0.02], metal: 0.5, rough: 0.2 };

  // local-space helpers (rig-local coordinates) used by the beam/cable code
  function lapMat(L) { return mulN(T(L.lap.x, L.lap.y, L.lap.z), RY(L.lap.ry), S(L.lap.s)); }
  function phMat(L) { return mulN(T(L.ph.x, L.ph.y, L.ph.z), RY(L.ph.ry), RX(L.ph.rx), RZ(L.ph.rz), S(L.ph.s)); }

  function drawOpaque(rig, L, open, a = 1) {
    const Ml = mulN(rig, lapMat(L));
    const Eb = mulN(Ml, T(0, 0.045, 0), RX(-Math.PI / 2));
    g.drawLit(m.base, Eb, { ...ALU, a });
    const Mlid = mulN(Ml, T(0, 0.125, -1.06), RX(-open));
    const El = mulN(Mlid, T(0, 0, 1.06), RX(Math.PI / 2));
    g.drawLit(m.lid, El, { ...ALU, a });
    g.drawLit(m.bezelPC, mulN(El, T(0, 0, 0.037)), { ...GLASS, a });
    // phone
    const Mp = mulN(rig, phMat(L));
    g.drawLit(m.ph, Mp, { ...TI, a });
    g.drawLit(m.bezelPh, mulN(Mp, T(0, 0, 0.049)), { ...GLASS, a });
    g.drawLit(m.bump, mulN(Mp, T(-0.2, 0.72, -0.06)), { c: [0.1, 0.14, 0.22], metal: 0.85, rough: 0.3, a });
    for (const [lx, ly] of [[-0.31, 0.83], [-0.31, 0.61], [-0.09, 0.72]]) g.drawLit(m.lens, mulN(Mp, T(lx + 0.0, ly, -0.078)), { c: [0.01, 0.02, 0.03], metal: 0.6, rough: 0.15, em: [0.0, 0.06, 0.1], a });
    g.drawLit(m.btn, mulN(Mp, T(0.465, 0.35, 0)), { ...TI, a });
    g.drawLit(m.btn, mulN(Mp, T(0.465, 0.0, 0)), { ...TI, a });
    return { Ml, El, Eb, Mp };
  }
  function drawScreens(P, a = 1) {
    g.drawTex(m.keys, mulN(P.Eb, T(0, 0, 0.046)), tex.keys, { tint: [1, 1, 1, a] });
    g.drawTex(m.scrPC, mulN(P.El, T(0, 0, 0.0395)), tex.pc, { tint: [1, 1, 1, a], sheen: 0.4 + 0.3 * Math.sin(performance.now() / 3000) });
    g.drawTex(m.scrPh, mulN(P.Mp, T(0, 0, 0.0515)), tex.ph, { tint: [1, 1, 1, a], sheen: 0.8 });
  }
  return { pcCanvas, phCanvas, tex, lapMat, phMat, drawOpaque, drawScreens, pt };
}
