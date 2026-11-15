// Floating nav: mobile menu, active-section highlight, smooth anchor scrolling.
export function initNav() {
  const nav = document.querySelector('.nav'), btn = document.getElementById('menu-btn'), panel = document.getElementById('menu');
  const setOpen = (o) => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.documentElement.classList.toggle('lock', o); };
  btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  addEventListener('resize', () => { if (innerWidth > 900) setOpen(false); }, { passive: true });

  const onScroll = () => nav.classList.toggle('stuck', scrollY > 24);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  const links = [...document.querySelectorAll('[data-nav]')];
  const map = new Map(links.map((a) => [a.dataset.nav, []]));
  links.forEach((a) => map.get(a.dataset.nav).push(a));
  const secs = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  let raf = 0;
  const spy = () => {
    raf = 0; let cur = secs[0] && secs[0].id; const y = innerHeight * 0.4;
    for (const s of secs) { if (s.getBoundingClientRect().top <= y) cur = s.id; }
    links.forEach((a) => { const on = a.dataset.nav === cur; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(spy); }, { passive: true }); spy();
}
