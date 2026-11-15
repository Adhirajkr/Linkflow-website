// Fade/slide-in on scroll. Content is visible by default; only hidden once we know we can reveal it.
export function initReveal() {
  const els = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const show = (el) => el.classList.add('in');
  els.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) show(el); });
  document.documentElement.classList.add('can-reveal');
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
}

// Highlights the current caption of the scroll-driven connection demo.
export function initConnectSteps() {
  const sec = document.querySelector('[data-scrub]'); if (!sec) return;
  const items = [...sec.querySelectorAll('.cap li')];
  const apply = () => { const n = +sec.dataset.step || 0; items.forEach((li, i) => { li.classList.toggle('on', i + 1 === n); li.classList.toggle('done', i + 1 < n); }); };
  new MutationObserver(apply).observe(sec, { attributes: true, attributeFilter: ['data-step'] }); apply();
}
