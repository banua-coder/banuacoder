/**
 * animations.ts — GSAP + ScrollTrigger micro-interactions for Banua Coder.
 * Single entry point replacing vanilla IntersectionObserver scroll-reveal,
 * RAF-based magnetic, and manual counter animation.
 *
 * All scroll-driven animations are scoped inside gsap.matchMedia() so they
 * automatically disable (and clean up) when prefers-reduced-motion: reduce
 * is active. The theme-toggle morph also respects this preference.
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initAnimations(): () => void {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ── Scroll-reveal sections ────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })

    // ── Stagger card grids ────────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((grid) => {
      const items = gsap.utils.toArray<HTMLElement>(grid.children as HTMLCollectionOf<HTMLElement>)
      if (!items.length) return
      gsap.from(items, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })

    // ── Magnetic CTA (fine-pointer devices only) ──────────────────────────────
    if (window.matchMedia('(pointer: fine) and (hover: hover)').matches) {
      gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })

        btn.addEventListener('pointermove', (e) => {
          const rect = btn.getBoundingClientRect()
          const dx = (e.clientX - rect.left - rect.width / 2) / 6
          const dy = (e.clientY - rect.top - rect.height / 2) / 6
          xTo(Math.max(-6, Math.min(6, dx)))
          yTo(Math.max(-6, Math.min(6, dy)))
        })
        btn.addEventListener('pointerleave', () => {
          xTo(0)
          yTo(0)
        })
      })
    }

    // ── Animated counters ─────────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-count-to]').forEach((el) => {
      const target = parseInt(el.dataset.countTo ?? '0', 10)
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = Math.round(obj.val).toString()
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
      })
    })

    // ── Hero dot-grid parallax scrub ──────────────────────────────────────────
    const dotGrid = document.querySelector<HTMLElement>('[data-dot-grid]')
    if (dotGrid) {
      gsap.to(dotGrid, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: dotGrid,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
    }

    // ── Hero shots parallax scrub ─────────────────────────────────────────────
    const heroShots = gsap.utils.toArray<HTMLElement>('.hero-shot')
    if (heroShots.length) {
      gsap.to(heroShots, {
        yPercent: -15,
        scale: 0.92,
        opacity: 0.6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-stage',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    }
  })

  // ── Theme toggle crossfade morph (click-driven, not scroll) ─────────────────
  // Wired here so it participates in the same matchMedia cleanup on revert.
  // When reduced-motion is active the CSS transitions are already suppressed;
  // the click handler below does an instant opacity toggle instead.
  const themeToggleBtn = document.getElementById('theme-toggle')
  const sunIcon = document.getElementById('theme-icon-sun')
  const moonIcon = document.getElementById('theme-icon-moon')

  if (themeToggleBtn && sunIcon && moonIcon) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark')
      const outgoing = isDark ? sunIcon : moonIcon
      const incoming = isDark ? moonIcon : sunIcon

      if (prefersReduced) {
        // Instant swap — no animation
        gsap.set(outgoing, { opacity: 0, scale: 0.6, pointerEvents: 'none' })
        gsap.set(incoming, { opacity: 1, scale: 1, pointerEvents: 'auto' })
      } else {
        gsap.to(outgoing, {
          opacity: 0,
          scale: 0.6,
          rotate: -90,
          duration: 0.25,
          ease: 'power2.in',
          onComplete() {
            gsap.set(outgoing, { pointerEvents: 'none' })
          },
        })
        gsap.fromTo(
          incoming,
          { opacity: 0, scale: 0.6, rotate: 90 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.25,
            ease: 'power2.out',
            onStart() {
              gsap.set(incoming, { pointerEvents: 'auto' })
            },
          },
        )
      }
    })
  }

  // ── Nav scroll-elevated state ────────────────────────────────────────────
  // Outside matchMedia: this isn't a motion preference — even reduced-motion
  // users want the nav to remain readable when content scrolls under it.
  // Toggles a `is-scrolled` class on [data-nav-scroll] when scrollY > 8.
  const navEl = document.querySelector<HTMLElement>('[data-nav-scroll]')
  let lastNavScrolled: boolean | null = null
  const updateNav = () => {
    const scrolled = window.scrollY > 8
    if (scrolled !== lastNavScrolled) {
      navEl?.classList.toggle('is-scrolled', scrolled)
      lastNavScrolled = scrolled
    }
  }
  if (navEl) {
    updateNav()
    window.addEventListener('scroll', updateNav, { passive: true })
  }

  return () => {
    mm.revert()
    if (navEl) window.removeEventListener('scroll', updateNav)
  }
}
