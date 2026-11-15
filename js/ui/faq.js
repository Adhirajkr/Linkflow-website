// Accessible accordion. Height animation is done with CSS grid rows (see .faq-a in the stylesheet).
export function initFaq() {
  const items = [...document.querySelectorAll('.faq-item')];
  items.forEach((it) => {
    const q = it.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const open = it.classList.toggle('open'); q.setAttribute('aria-expanded', String(open));
    });
  });
}
