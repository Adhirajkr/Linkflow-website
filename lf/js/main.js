import { hydrateIcons } from './icons.js';
import { startStage } from './scene/stage.js';
import { initNav } from './ui/nav.js';
import { initFaq } from './ui/faq.js';
import { initModes } from './ui/modes.js';
import { initReveal, initConnectSteps } from './ui/reveal.js';
import { initPalette } from './ui/palette.js';
import { initDownloads } from './ui/download.js';
import { SITE } from './config/siteConfig.js';

hydrateIcons();
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
document.querySelectorAll('[data-tagline]').forEach((el) => { el.textContent = SITE.tagline; });
initNav(); initFaq(); initModes(); initPalette(); initConnectSteps(); initDownloads();

const canvas = document.getElementById('stage');
const stage = startStage(canvas, { onFail: () => document.documentElement.classList.add('no-gl') });
if (!stage) document.documentElement.classList.add('no-gl');
else document.documentElement.classList.add('has-gl');
// Static fallback art for devices without WebGL2 (shown only under .no-gl).
const FALLBACK = '<svg class="fallback-art" viewBox="0 0 200 110" aria-hidden="true" fill="none" stroke="#16B8D0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="22" width="100" height="62" rx="7" fill="rgba(22,184,208,.1)"/><path d="M8 92h124"/><rect x="146" y="26" width="34" height="64" rx="8" fill="rgba(34,183,165,.1)"/><path d="M124 56h18" stroke-dasharray="3 6"/></svg>';
document.querySelectorAll('.stage').forEach((el) => { el.insertAdjacentHTML('afterbegin', FALLBACK); });
initReveal();
