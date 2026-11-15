// Minimal column-major 4x4 matrix helpers (no dependencies).
export const ident = () => { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; };

export function mul(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  }
  return o;
}
export const mulN = (...ms) => ms.reduce((a, b) => mul(a, b));

export function persp(fov, asp, n, f) {
  const t = 1 / Math.tan(fov / 2), m = new Float32Array(16);
  m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = (2 * f * n) / (n - f);
  return m;
}
export function T(x, y, z) { const m = ident(); m[12] = x; m[13] = y; m[14] = z; return m; }
export function S(x, y = x, z = x) { const m = ident(); m[0] = x; m[5] = y; m[10] = z; return m; }
export function RX(a) { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
export function RY(a) { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[8] = s; m[2] = -s; m[10] = c; return m; }
export function RZ(a) { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[4] = -s; m[1] = s; m[5] = c; return m; }
export function pt(m, x, y, z) {
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
}
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const seg = (t, a, b) => clamp((t - a) / (b - a));
