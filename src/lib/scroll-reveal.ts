/**
 * scroll-reveal.ts — Lightweight IntersectionObserver-based fade-up reveal.
 * Adds `is-revealed` class to [data-reveal] and [data-reveal-stagger] elements.
 * Bails out entirely under prefers-reduced-motion: reduce.
 * Each element is observed once; observer disconnects after triggering.
 */

export function initScrollReveal(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const elements = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-stagger]')
  if (!elements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  )

  elements.forEach((el) => observer.observe(el))
}
