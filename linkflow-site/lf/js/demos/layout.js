// Layout = where the two devices sit inside the 3D rig, plus beam/cable/wave strengths.
// Every demo returns a (partial) layout; the stage tweens between them so devices "fly" from scene to scene.
export const DEF = () => ({
  lap: { x: 0, y: -0.6, z: 0, ry: 0, open: 1.78, s: 1 },
  ph: { x: 0, y: -0.3, z: 0, rx: 0, ry: 0, rz: 0, s: 1 },
  rig: { ry: 0, rx: 0 },
  ext: { w: 6.2, h: 4.1 },
  glow: [0.09, 0.72, 0.82, 0.5],
  icons: 0, iconsOn: 0,
  flow: 0, cable: 0, cableP: 0, waves: 0,
  col: [0.09, 0.72, 0.82],
  dir: 0, src: 0,
});

export function merge(base, o) {
  for (const k in o) {
    if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) merge(base[k], o[k]);
    else base[k] = o[k];
  }
  return base;
}
export const L = (o = {}) => merge(DEF(), o);

// Reusable poses
export const POSE = {
  side: { lap: { x: 1.05, y: -0.6, z: -0.2, ry: -0.3 }, ph: { x: -1.95, y: -0.35, z: 0.5, ry: 0.34 } },
  close: { lap: { x: 0.9, y: -0.6, z: -0.2, ry: -0.25 }, ph: { x: -1.7, y: -0.4, z: 0.55, ry: 0.3 } },
};

// Keyframe helper: kf(t, [[t0,v0],[t1,v1],...]) with smooth easing between keys.
export function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i];
      const p = (t - a) / (b - a), e = p * p * (3 - 2 * p);
      return va + (vb - va) * e;
    }
  }
  return keys[keys.length - 1][1];
}
