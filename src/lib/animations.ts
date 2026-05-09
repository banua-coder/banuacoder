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
    // Use fromTo + once:true so the trigger fires reliably even when long
    // pinned sections above shift the document height after registration.
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            once: true,
          },
        },
      )
    })

    // ── Stagger card grids ────────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((grid) => {
      const items = gsap.utils.toArray<HTMLElement>(grid.children as HTMLCollectionOf<HTMLElement>)
      if (!items.length) return
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: grid,
            start: 'top 92%',
            once: true,
          },
        },
      )
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
    // Each .client-cycle-cell carries data-cell-enter / data-cell-exit (0–1
    // scroll progress) and gets its own fromTo + (optional) to placed on a
    // single scrubbed timeline. Cells overlap in time so multiple logos are
    // visible / fading at any moment — matches Zero One Group's continuous
    // scatter rather than a synchronized batch swap.
    const cycleSection = document.querySelector<HTMLElement>('.client-cycle')
    const cycleCells = cycleSection
      ? Array.from(cycleSection.querySelectorAll<HTMLElement>('.client-cycle-cell'))
      : []

    if (cycleSection && cycleCells.length) {
      // Hide everything first; per-cell fromTo will reveal at its enter mark.
      gsap.set(cycleCells, {
        autoAlpha: 0,
        scale: 0.4,
        filter: 'blur(24px) grayscale(1)',
      })

      const cycleTl = gsap.timeline({
        scrollTrigger: {
          trigger: cycleSection,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })

      cycleCells.forEach((cell) => {
        const enter = parseFloat(cell.dataset.cellEnter ?? '0')
        const exitRaw = cell.dataset.cellExit ?? ''
        const exit = exitRaw === '' ? null : parseFloat(exitRaw)
        const rotIn = gsap.utils.random(-25, 25, 1)
        const rotOut = -rotIn * 1.3

        // Enter (long, gradual): scale 0.25 → 1.0, rotation random → 0,
        // blur 40px → 0, opacity 0 → 1. sine.out lets the blur lift
        // smoothly across the scrub instead of snapping at the last frame.
        cycleTl.fromTo(
          cell,
          {
            autoAlpha: 0,
            scale: 0.25,
            rotation: rotIn,
            filter: 'blur(40px) grayscale(1)',
          },
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            filter: 'blur(0px) grayscale(0)',
            duration: 0.22,
            ease: 'sine.out',
          },
          enter,
        )

        // Exit (long, gradual): zoom OUT past 1 (scale 1 → 1.55) so the logo
        // appears to fly toward the camera as it dissolves — Ken Burns
        // dolly-out feel — combined with blur 0 → 40px and reverse rotation.
        // Cells without a defined exit remain visible through end-of-section.
        if (exit !== null && !Number.isNaN(exit)) {
          cycleTl.to(
            cell,
            {
              autoAlpha: 0,
              scale: 1.55,
              rotation: rotOut,
              filter: 'blur(40px) grayscale(1)',
              duration: 0.22,
              ease: 'sine.in',
            },
            exit,
          )
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

    // ── Process steps (zig-zag scroll-driven reveal) ─────────────────────────
    // Each step slides in from its column edge as it enters the viewport;
    // the connector line "draws" itself as user scrolls. Even-index steps
    // come in from the left, odd-index from the right.
    const processStrip = document.querySelector<HTMLElement>('[data-process-strip]')
    const processSteps = processStrip
      ? Array.from(processStrip.querySelectorAll<HTMLElement>('[data-process-step]'))
      : []

    if (processStrip && processSteps.length) {
      processSteps.forEach((step, i) => {
        const fromX = i % 2 === 0 ? -60 : 60
        gsap.fromTo(
          step,
          { opacity: 0, x: fromX, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 88%',
              once: true,
            },
          },
        )

        // Pulse the step dot when it enters
        const dot = step.querySelector<HTMLElement>('[data-process-dot]')
        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0.4, boxShadow: '0 0 0 0 rgba(29,156,212,0.6)' },
            {
              scale: 1,
              boxShadow: '0 0 0 12px rgba(29,156,212,0)',
              duration: 0.9,
              ease: 'back.out(1.6)',
              scrollTrigger: { trigger: step, start: 'top 88%', once: true },
            },
          )
        }
      })

      // Connector line scales from 0 → full as user scrolls through the strip
      const connector = processStrip.querySelector<HTMLElement>('[data-process-line]')
      if (connector) {
        gsap.fromTo(
          connector,
          { scaleY: 0, transformOrigin: 'top' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: processStrip,
              start: 'top 75%',
              end: 'bottom 75%',
              scrub: 0.5,
            },
          },
        )
      }
    }

    // ── Ideal-clients tile burst-in ──────────────────────────────────────────
    // Tiles cascade from a slight rotation + scale + y offset, one after the
    // next as the section enters viewport. Each tile gets a tiny lingering
    // float once it lands.
    const idealStrip = document.querySelector<HTMLElement>('[data-ideal-strip]')
    const idealTiles = idealStrip
      ? Array.from(idealStrip.querySelectorAll<HTMLElement>('[data-ideal-tile]'))
      : []

    if (idealStrip && idealTiles.length) {
      gsap.fromTo(
        idealTiles,
        {
          opacity: 0,
          y: 40,
          scale: 0.85,
          rotation: (i: number) => (i % 2 === 0 ? -3 : 3),
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.7,
          ease: 'back.out(1.2)',
          stagger: 0.09,
          scrollTrigger: {
            trigger: idealStrip,
            start: 'top 85%',
            once: true,
          },
        },
      )
    }

    return () => {
      // Cleanup lenis when matchMedia reverts (e.g. user enables reduced-motion)
      gsap.ticker.remove(lenisRaf)
      lenis.destroy()
    }
  })

  // ── ScrollTrigger refresh after init ─────────────────────────────────────
  // Pinned ScrollTriggers add ~700vh of pin-spacer height to the document.
  // Without an explicit refresh, downstream non-pinned triggers keep stale
  // start positions calculated before the spacers existed (root cause of the
  // Selected Work / portfolio-grid not revealing). Refreshing on next frame
  // and again after window load handles font/image layout shifts too.
  requestAnimationFrame(() => ScrollTrigger.refresh())
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
  }

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

  // ── Nav auto-hide + reveal-on-top-hover ──────────────────────────────────
  // Outside matchMedia: this isn't a motion preference — even reduced-motion
  // users get the same show/hide rules (the CSS transition is suppressed
  // under reduced-motion via the @media block in Nav.astro).
  //
  // Desktop (fine pointer + hover capable):
  //   • scrollY <= 80px              → SHOW (anchored at hero)
  //   • Pointer within top 80px      → SHOW (hover-to-reveal)
  //   • Otherwise                    → HIDE (translateY(-100%))
  //
  // Touch devices: nav is always shown — there's no hover to trigger reveal,
  // so auto-hiding would strand mobile users without nav access.
  //
  // Elevated state (`is-scrolled`) applies whenever scrollY > 8 regardless,
  // so the nav has a visible bg/border even when revealed mid-page.
  const navEl = document.querySelector<HTMLElement>('[data-nav-scroll]')
  const canHover = window.matchMedia('(pointer: fine) and (hover: hover)').matches
  const HOVER_BAND = 80
  const TOP_BAND = 80
  let pointerNearTop = false
  let lastShown: boolean | null = null
  let lastScrolled: boolean | null = null

  const updateNav = () => {
    if (!navEl) return
    const y = window.scrollY
    const scrolled = y > 8
    const atTop = y <= TOP_BAND
    const shown = canHover ? atTop || pointerNearTop : true

    if (shown !== lastShown) {
      navEl.classList.toggle('is-hidden', !shown)
      lastShown = shown
    }
    if (scrolled !== lastScrolled) {
      navEl.classList.toggle('is-scrolled', scrolled)
      lastScrolled = scrolled
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    const next = e.clientY <= HOVER_BAND
    if (next !== pointerNearTop) {
      pointerNearTop = next
      updateNav()
    }
  }
  const onPointerLeave = () => {
    if (pointerNearTop) {
      pointerNearTop = false
      updateNav()
    }
  }

  if (navEl) {
    updateNav()
    window.addEventListener('scroll', updateNav, { passive: true })
    if (canHover) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
    }
  }

  return () => {
    mm.revert()
    if (navEl) {
      window.removeEventListener('scroll', updateNav)
      if (canHover) {
        window.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerleave', onPointerLeave)
      }
    }
  }
}
