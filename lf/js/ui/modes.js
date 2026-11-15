// Tab groups that switch a feature demo between modes (screen sharing, audio routing).
import { setMode } from '../state.js';
export function initModes() {
  document.querySelectorAll('[data-modes]').forEach((group) => {
    const id = group.dataset.modes, tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll(`[data-mode-panel="${id}"]`)];
    const select = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => { p.hidden = k !== i; });
      group.closest('.chapter').dataset.mode = i;
      setMode(id, i); if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); select((i + tabs.length - 1) % tabs.length, true); }
      });
    });
    select(0);
  });
}
