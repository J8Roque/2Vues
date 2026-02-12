// ===============================
// 2VUES - Minimal JS
// - Mobile menu toggle
// - Smooth scrolling
// - Header auto-close on navigation
// ===============================

(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const enterBtn = document.querySelector('[data-enter]');

  // Smooth scroll (respect reduced motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smoothBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  }

  function toggleMenu() {
    if (!navLinks || !navToggle) return;
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target;
      const clickedInside =
        navLinks.contains(target) || navToggle.contains(target);

      if (!clickedInside) closeMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // Smooth-scroll for in-page anchors
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const id = a.getAttribute('href');
    if (!id || id === '#') return;

    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    closeMenu();
    el.scrollIntoView({ behavior: smoothBehavior, block: 'start' });
  });

  // Enter button micro effect
  if (enterBtn) {
    enterBtn.addEventListener('pointerdown', () => {
      enterBtn.style.transform = 'translateY(0px) scale(0.99)';
      setTimeout(() => (enterBtn.style.transform = ''), 120);
    });
  }
})();
