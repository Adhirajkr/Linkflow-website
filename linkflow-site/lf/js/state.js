// Tiny shared state between the UI (tabs, colour picker) and the 3D stage.
import { DEFAULT_CUSTOM } from './demos/customization.js';
export const state = {
  modes: { screen: 0, audio: 0 },
  custom: { ...DEFAULT_CUSTOM },
  dark: false,
  pointer: { x: 0, y: 0 },
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  modeStamp: 0,
};
export function setMode(id, i) { state.modes[id] = i; state.modeStamp++; }
