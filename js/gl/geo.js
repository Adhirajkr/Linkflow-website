// Procedural geometry: bevelled rounded slabs (device bodies), planes (screens), tubes (cables).
// Vertex layout everywhere: position(3) normal(3) uv(2).

function outline(w, h, r, seg = 7) {
  r = Math.min(r, w / 2, h / 2);
  const cx = [w / 2 - r, -(w / 2 - r), -(w / 2 - r), w / 2 - r];
  const cy = [h / 2 - r, h / 2 - r, -(h / 2 - r), -(h / 2 - r)];
  const pts = [];
  for (let c = 0; c < 4; c++) for (let j = 0; j <= seg; j++) {
    const a = ((c + j / seg) * Math.PI) / 2, nx = Math.cos(a), ny = Math.sin(a);
    pts.push([cx[c] + r * nx, cy[c] + r * ny, nx, ny]);
  }
  return pts;
}

export function extrude(w, h, d, r, b = 0.012, seg = 7) {
  const o = outline(w, h, r, seg), n = o.length, hd = d / 2;
  const P = [], N = [], U = [], I = [];
  const push = (x, y, z, nx, ny, nz) => { P.push(x, y, z); N.push(nx, ny, nz); U.push(0, 0); return P.length / 3 - 1; };
  const cf = push(0, 0, hd, 0, 0, 1);
  const fr = o.map((p) => push(p[0] - p[2] * b, p[1] - p[3] * b, hd, 0, 0, 1));
  const cb = push(0, 0, -hd, 0, 0, -1);
  const br = o.map((p) => push(p[0] - p[2] * b, p[1] - p[3] * b, -hd, 0, 0, -1));
  const r1 = o.map((p) => push(p[0], p[1], hd - b, p[2] * 0.7, p[3] * 0.7, 0.7));
  const r2 = o.map((p) => push(p[0], p[1], -hd + b, p[2] * 0.7, p[3] * 0.7, -0.7));
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    I.push(cf, fr[i], fr[j], cb, br[j], br[i]);
    for (const [A, B] of [[fr, r1], [r1, r2], [r2, br]]) {
      I.push(A[i], B[i], A[j], A[j], B[i], B[j]);
    }
  }
  return { pos: P, nor: N, uv: U, idx: I };
}

export function plane(w, h) {
  const x = w / 2, y = h / 2;
  return {
    pos: [-x, -y, 0, x, -y, 0, x, y, 0, -x, y, 0],
    nor: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    uv: [0, 0, 1, 0, 1, 1, 0, 1],
    idx: [0, 1, 2, 0, 2, 3],
  };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// Fills `out.v` (Float32Array, 8 floats/vertex) and `out.i` (Uint16Array); returns index count.
export function buildTube(pts, r, sides, out) {
  const n = pts.length;
  for (let k = 0; k < n; k++) {
    const t = norm(sub(pts[Math.min(k + 1, n - 1)], pts[Math.max(k - 1, 0)]));
    let up = [0, 1, 0];
    let side = cross(t, up);
    if (len(side) < 0.1) { up = [0, 0, 1]; side = cross(t, up); }
    side = norm(side);
    const up2 = cross(side, t);
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
      const nx = side[0] * c + up2[0] * sn, ny = side[1] * c + up2[1] * sn, nz = side[2] * c + up2[2] * sn;
      const o = (k * sides + s) * 8;
      out.v[o] = pts[k][0] + nx * r; out.v[o + 1] = pts[k][1] + ny * r; out.v[o + 2] = pts[k][2] + nz * r;
      out.v[o + 3] = nx; out.v[o + 4] = ny; out.v[o + 5] = nz; out.v[o + 6] = k / (n - 1); out.v[o + 7] = s / sides;
    }
  }
  let q = 0;
  for (let k = 0; k < n - 1; k++) for (let s = 0; s < sides; s++) {
    const a = k * sides + s, b = k * sides + ((s + 1) % sides), c = (k + 1) * sides + s, d = (k + 1) * sides + ((s + 1) % sides);
    out.i[q++] = a; out.i[q++] = c; out.i[q++] = b; out.i[q++] = b; out.i[q++] = c; out.i[q++] = d;
  }
  return q;
}
