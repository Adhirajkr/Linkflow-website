// One download action for Windows and Android: it opens the LinkFlow GitHub project.
import * as C from '../config/downloadConfig.js';

const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const open = (a, url) => { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); };

export function initDownloads() {
  const repo = C.repoUrl();
  $$('[data-gh],[data-dl]').forEach((a) => open(a, repo));
  $$('[data-releases]').forEach((a) => open(a, C.releasesUrl()));
  $$('[data-gh-text]').forEach((el) => { el.textContent = repo.replace('https://', ''); });
  $$('[data-oss]').forEach((el) => { el.hidden = !C.SHOW_AS_OPEN_SOURCE; });
}
