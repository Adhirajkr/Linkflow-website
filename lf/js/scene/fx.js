// Small procedural textures for glows, rings and the floating feature-icon badges.
import { icon, COL, NAV, rgba } from '../demos/draw.js';

function cv(s) { const c = document.createElement('canvas'); c.width = c.height = s; return c; }

export function glowCanvas() {
  const c = cv(256), x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.45)'); g.addColorStop(0.6, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return c;
}
export function ringCanvas() {
  const c = cv(256), x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 96, 128, 128, 126);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return c;
}
export function dashRingCanvas() {
  const c = cv(512), x = c.getContext('2d'); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 3; x.lineCap = 'round';
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; x.globalAlpha = i % 3 === 0 ? 1 : 0.35; x.beginPath(); x.arc(256, 256, 248, a, a + (i % 3 === 0 ? 0.11 : 0.05)); x.stroke(); }
  x.globalAlpha = 0.25; x.lineWidth = 1.5; x.beginPath(); x.arc(256, 256, 248, 0, 7); x.stroke(); return c;
}
export function floorCanvas() {
  const c = cv(512), x = c.getContext('2d'), g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.35, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512); return c;
}
export function iconBadge(name, active) {
  const c = cv(128), x = c.getContext('2d'), col = active ? COL.cyan : '#7E8CA3';
  const g = x.createRadialGradient(64, 64, 10, 64, 64, 60); g.addColorStop(0, active ? 'rgba(22,184,208,.34)' : 'rgba(167,180,200,.14)'); g.addColorStop(1, active ? 'rgba(22,184,208,.14)' : 'rgba(167,180,200,.06)');
  x.fillStyle = g; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill();
  x.strokeStyle = active ? 'rgba(90,230,245,.95)' : 'rgba(167,180,200,.4)'; x.lineWidth = active ? 3 : 2; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.stroke();
  icon(x, name, 64, 64, 50, active ? '#E9FCFF' : col, 2);
  return c;
}
export const ICON_NAMES = NAV.map((n) => n[0]);
