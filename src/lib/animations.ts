/**
 * animations.ts — GSAP + ScrollTrigger + Lenis micro-interactions for Banua Coder.
 * Single entry point replacing vanilla IntersectionObserver scroll-reveal,
 * RAF-based magnetic, and manual counter animation.
 *
 * All scroll-driven animations are scoped inside gsap.matchMedia() so they
 * automatically disable (and clean up) when prefers-reduced-motion: reduce
 * is active. The theme-toggle morph also respects this preference.
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function initAnimations(): () => void {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ── Lenis smooth scroll ───────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: false,
    })

    // Drive lenis via gsap ticker so they share the same frame loop
    const lenisRaf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(lenisRaf)
    gsap.ticker.lagSmoothing(0)

    // Tell ScrollTrigger to use lenis scroll events for updates
    lenis.on('scroll', ScrollTrigger.update)

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

    // ── Pinned client logo cycle ──────────────────────────────────────────────
    const cycleSection = document.querySelector<HTMLElement>('.client-cycle')
    const batches = cycleSection
      ? Array.from(cycleSection.querySelectorAll<HTMLElement>('.client-cycle-batch'))
      : []

    if (cycleSection && batches.length) {
      // Initial: first batch visible (so the section ANCHORS from scroll 0),
      // remaining batches hidden. Cells for first batch start sharp.
      gsap.set(batches, { autoAlpha: 0 })
      gsap.set(batches[0], { autoAlpha: 1 })
      gsap.set('.client-cycle-cell', { filter: 'blur(0px) grayscale(0)', autoAlpha: 1, scale: 1 })

      const cycleTl = gsap.timeline({
        scrollTrigger: {
          trigger: cycleSection,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })

      // Each batch occupies 1 unit of timeline; batches overlap by 0.15 for smooth handoff.
      // Phase per batch (within its 1.0 unit slot, starting at t = i):
      //   0.00 - 0.10  show container (instant)
      //   0.10 - 0.30  unblur cells with stagger (entrance)
      //   0.30 - 0.65  HOLD CLEAR — cells fully sharp (longest phase)
      //   0.65 - 0.85  blur out
      //   0.85 - 1.00  hide container (next batch starts before this finishes)
      batches.forEach((batch, i) => {
        const cells = Array.from(batch.querySelectorAll<HTMLElement>('.client-cycle-cell'))
        const t = i * 0.85 // overlap each subsequent batch

        // For the first batch, skip the entrance — it's already visible/clear from gsap.set above
        if (i > 0) {
          cycleTl
            .to(batch, { autoAlpha: 1, duration: 0.05 }, t + 0.05)
            .fromTo(
              cells,
              { filter: 'blur(20px) grayscale(1)', autoAlpha: 0, scale: 0.9 },
              {
                filter: 'blur(0px) grayscale(0)',
                autoAlpha: 1,
                scale: 1,
                stagger: 0.04,
                duration: 0.25,
                ease: 'power2.out',
              },
              t + 0.1,
            )
        }

        // Hold clear (visible at full clarity for the bulk of the slot)
        cycleTl.to(cells, { duration: 0.4, autoAlpha: 1 }, t + 0.3)

        // Blur out (don't run on the LAST batch — let it stay visible until end of section)
        if (i < batches.length - 1) {
          cycleTl
            .to(
              cells,
              {
                filter: 'blur(20px) grayscale(1)',
                autoAlpha: 0,
                scale: 0.95,
                stagger: 0.03,
                duration: 0.2,
                ease: 'power2.in',
              },
              t + 0.65,
            )
            .to(batch, { autoAlpha: 0, duration: 0.05 }, t + 0.9)
        }
      })
    }

    // ── Pinned why-carousel ───────────────────────────────────────────────────
    const whySection = document.querySelector<HTMLElement>('.why-carousel')
    const whyTiles = whySection
      ? Array.from(whySection.querySelectorAll<HTMLElement>('.why-tile'))
      : []
    const whyDots = whySection
      ? Array.from(whySection.querySelectorAll<HTMLElement>('.why-dot'))
      : []

    if (whySection && whyTiles.length) {
      gsap.set(whyTiles, { autoAlpha: 0, y: 40 })
      gsap.set(whyTiles[0], { autoAlpha: 1, y: 0 })
      if (whyDots.length) {
        gsap.set(whyDots, { opacity: 0.3 })
        gsap.set(whyDots[0], { opacity: 1 })
      }

      const whyTl = gsap.timeline({
        scrollTrigger: {
          trigger: whySection,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })

      whyTiles.forEach((tile, i) => {
        if (i === 0) return
        const prev = whyTiles[i - 1]
        whyTl
          .to(prev, { autoAlpha: 0, y: -40, duration: 0.3 }, i)
          .fromTo(tile, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3 }, i + 0.1)
        if (whyDots.length) {
          whyTl
            .to(whyDots[i - 1], { opacity: 0.3, duration: 0.2 }, i)
            .to(whyDots[i], { opacity: 1, duration: 0.2 }, i + 0.1)
        }
      })
    }

    return () => {
      // Cleanup lenis when matchMedia reverts (e.g. user enables reduced-motion)
      gsap.ticker.remove(lenisRaf)
      lenis.destroy()
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
