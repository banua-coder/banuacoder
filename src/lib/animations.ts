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

    // ── Hero auto-cycling product carousels ───────────────────────────────────
    // Slots tagged with [data-hero-cycle-group="<name>"] advance their
    // [data-hero-slide] children IN LOCKSTEP. So the front phone and the
    // back phone always show the SAME product index — the hero never pairs
    // mismatched apps. Labels for the chip come from the slot in the group
    // that carries data-hero-cycle-labels (typically the main phone).
    const groupNames = new Set<string>()
    document.querySelectorAll<HTMLElement>('[data-hero-cycle-group]').forEach((el) => {
      groupNames.add(el.dataset.heroCycleGroup ?? '')
    })
    const chipLabel = document.querySelector<HTMLElement>('[data-hero-chip-label]')

    groupNames.forEach((groupName) => {
      if (!groupName) return
      const groupSlots = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-hero-cycle-group="${groupName}"]`),
      )
      if (!groupSlots.length) return

      // Use the label-bearing slot for tick interval + label list. Default
      // interval lives on whichever slot carries data-hero-cycle-interval.
      const masterSlot =
        groupSlots.find((s) => s.dataset.heroCycleLabels !== undefined) ?? groupSlots[0]
      const interval = parseInt(masterSlot.dataset.heroCycleInterval ?? '4000', 10)
      const labels = (masterSlot.dataset.heroCycleLabels ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      // Per-slot slide arrays. Each slot's slide-count may differ; we mod
      // the global index by each slot's length so they all stay in sync
      // even if one stack has fewer companion shots.
      const slotSlides = groupSlots.map((slot) =>
        Array.from(slot.querySelectorAll<HTMLElement>('[data-hero-slide]')),
      )
      if (slotSlides.every((arr) => arr.length < 2)) return

      let index = 0
      const advance = () => {
        index += 1
        slotSlides.forEach((slides) => {
          if (!slides.length) return
          slides.forEach((s) => s.classList.remove('is-active'))
          slides[index % slides.length].classList.add('is-active')
        })
        if (labels.length && chipLabel) {
          gsap.to(chipLabel, {
            opacity: 0,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => {
              chipLabel.textContent = `// ${labels[index % labels.length]}`
              gsap.to(chipLabel, { opacity: 1, duration: 0.22, ease: 'power2.out' })
            },
          })
        }
      }
      window.setInterval(advance, interval)
    })

    // ── Pinned client logo cycle ──────────────────────────────────────────────
    // Two LAYERS of blur, combined via CSS calc on .client-cycle-cell:
    //
    //   --cell-fade-blur (timeline-controlled): the entrance/exit dolly
    //     blur — 40px when off-screen / mid-fade, 0px when the logo is
    //     fully resolved on-screen.
    //
    //   --cell-overlap-blur (ticker-controlled): only non-zero while the
    //     logo's centre is INSIDE the centred headline's bounding rect
    //     (1px margin per spec). The instant a logo crosses 1px past the
    //     headline edge, this falls to 0 and the logo reads sharp.
    //
    // CSS combines them additively: filter: blur(calc(fade + overlap))
    // grayscale(fade-gray). Both vars default to 0 so a fresh cell with
    // nothing set renders cleanly.
    const cycleSection = document.querySelector<HTMLElement>('.client-cycle')
    const cycleCells = cycleSection
      ? Array.from(cycleSection.querySelectorAll<HTMLElement>('.client-cycle-cell'))
      : []

    if (cycleSection && cycleCells.length) {
      // Hide everything first. Filter is owned entirely by CSS variables.
      gsap.set(cycleCells, {
        autoAlpha: 0,
        scale: 0.4,
        '--cell-fade-blur': '40px',
        '--cell-fade-gray': 1,
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
        const fromX = parseFloat(cell.dataset.cellFromX ?? '50')
        const fromY = parseFloat(cell.dataset.cellFromY ?? '50')
        const toX = parseFloat(cell.dataset.cellToX ?? String(fromX))
        const toY = parseFloat(cell.dataset.cellToY ?? String(fromY))
        const rotIn = gsap.utils.random(-25, 25, 1)
        const rotOut = -rotIn * 1.3

        // Enter — short, snappy: blur unwinds quickly so the logo reads
        // clean for most of its on-screen life. Opacity, scale, rotation
        // all settle within the same 0.08 window.
        cycleTl.fromTo(
          cell,
          {
            autoAlpha: 0,
            scale: 0.25,
            rotation: rotIn,
            '--cell-fade-blur': '40px',
            '--cell-fade-gray': 1,
          },
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            '--cell-fade-blur': '0px',
            '--cell-fade-gray': 0,
            duration: 0.08,
            ease: 'sine.out',
          },
          enter,
        )

        // Position drift across the cell's FULL lifespan (enter → exit-end).
        // Logos travel from fromX/Y to toX/Y while they're on screen — this
        // is the parallax-drift that gives the cycle ZOG-like motion instead
        // of pop-in/pop-out. ease: 'none' for a constant scroll-linked drift.
        const exitEnd = exit !== null && !Number.isNaN(exit) ? exit + 0.08 : 1
        const driftDuration = exitEnd - enter
        if (driftDuration > 0 && (toX !== fromX || toY !== fromY)) {
          cycleTl.fromTo(
            cell,
            { left: `${fromX}%`, top: `${fromY}%` },
            {
              left: `${toX}%`,
              top: `${toY}%`,
              ease: 'none',
              duration: driftDuration,
            },
            enter,
          )
        }

        // Exit — short and tight, kicks in only as the logo approaches the
        // far viewport edge. Blur, scale, and grayscale all wind up in
        // the same 0.08 window so the logo dissolves into the edge cleanly.
        if (exit !== null && !Number.isNaN(exit)) {
          cycleTl.to(
            cell,
            {
              autoAlpha: 0,
              scale: 1.55,
              rotation: rotOut,
              '--cell-fade-blur': '40px',
              '--cell-fade-gray': 1,
              duration: 0.08,
              ease: 'sine.in',
            },
            exit,
          )
        }
      })

      // Position-aware overlap-blur ticker. Adds an EXTRA 18px of blur via
      // --cell-overlap-blur whenever a cell's centre is inside the headline
      // rect (1px margin). The CSS calc on .client-cycle-cell stacks this
      // on top of the timeline's fade-blur.
      const headline = cycleSection.querySelector<HTMLElement>('h2')
      if (headline) {
        const overlapBlurPx = 18
        const margin = 1
        const blurTick = () => {
          const sectionRect = cycleSection.getBoundingClientRect()
          if (sectionRect.bottom < -200 || sectionRect.top > window.innerHeight + 200) {
            return
          }
          const hr = headline.getBoundingClientRect()
          for (const cell of cycleCells) {
            const r = cell.getBoundingClientRect()
            if (r.width === 0) continue
            const cx = r.left + r.width / 2
            const cy = r.top + r.height / 2
            const inside =
              cx >= hr.left - margin &&
              cx <= hr.right + margin &&
              cy >= hr.top - margin &&
              cy <= hr.bottom + margin
            cell.style.setProperty('--cell-overlap-blur', inside ? `${overlapBlurPx}px` : '0px')
          }
        }
        gsap.ticker.add(blurTick)
      }
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

    // ── Services 2-card slide-in ─────────────────────────────────────────────
    // The two service preview cards slide in from opposite sides with a
    // touch of 3D rotation Y for depth, alternating: Build & Engineer
    // comes from the left tilted away, Brand & Grow from the right.
    const servicesGrid = document.querySelector<HTMLElement>('[data-tell-services]')
    const servicesCards = servicesGrid
      ? Array.from(servicesGrid.querySelectorAll<HTMLElement>('[data-tell-services-card]'))
      : []
    if (servicesGrid && servicesCards.length) {
      servicesCards.forEach((card, i) => {
        const fromX = i % 2 === 0 ? -120 : 120
        const fromRotY = i % 2 === 0 ? -25 : 25
        gsap.fromTo(
          card,
          { opacity: 0, x: fromX, rotationY: fromRotY, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: servicesGrid,
              start: 'top 82%',
              once: true,
            },
          },
        )
      })
    }

    // ── Public-sector bullets cascade ────────────────────────────────────────
    // Each bullet slides in from the left with the arrow scaling up — gives
    // the bullet list a sense of progressive proof rather than a wall of
    // text dumping in at once.
    const publicBulletsList = document.querySelector<HTMLElement>('[data-tell-public-bullets]')
    const publicBullets = publicBulletsList
      ? Array.from(publicBulletsList.querySelectorAll<HTMLElement>('[data-tell-public-bullet]'))
      : []
    if (publicBulletsList && publicBullets.length) {
      gsap.fromTo(
        publicBullets,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: publicBulletsList,
            start: 'top 88%',
            once: true,
          },
        },
      )
      // Pulse the arrow span on each bullet so it feels like a list of
      // proof points being checked off in sequence.
      publicBullets.forEach((li, i) => {
        const arrow = li.querySelector<HTMLElement>('span[aria-hidden="true"]')
        if (!arrow) return
        gsap.fromTo(
          arrow,
          { scale: 0, rotation: -90 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            delay: i * 0.08 + 0.05,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: publicBulletsList,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })
    }

    // ── Testimonial word-by-word reveal ──────────────────────────────────────
    // Splits the quote text into individual word-spans (constructed via
    // createElement, NOT innerHTML, so MDX-authored content stays
    // untouched as plain text), then fades them in with a tight stagger
    // as the quote scrolls into view.
    const testimonialSection = document.querySelector<HTMLElement>('[data-tell-testimonial]')
    const quoteEl = testimonialSection?.querySelector<HTMLElement>('blockquote p')
    if (testimonialSection && quoteEl) {
      const text = quoteEl.textContent ?? ''
      quoteEl.textContent = ''
      const fragment = document.createDocumentFragment()
      for (const part of text.split(/(\s+)/)) {
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part))
        } else if (part.length > 0) {
          const span = document.createElement('span')
          span.className = 'tell-quote-word'
          span.style.display = 'inline-block'
          span.style.willChange = 'opacity,transform'
          span.textContent = part
          fragment.appendChild(span)
        }
      }
      quoteEl.appendChild(fragment)
      const words = Array.from(
        quoteEl.querySelectorAll<HTMLElement>('.tell-quote-word'),
      )
      gsap.fromTo(
        words,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.025,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: testimonialSection,
            start: 'top 78%',
            once: true,
          },
        },
      )
      const figcaption = testimonialSection.querySelector<HTMLElement>('figcaption')
      if (figcaption) {
        gsap.fromTo(
          figcaption,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: words.length * 0.025 + 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: testimonialSection,
              start: 'top 78%',
              once: true,
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
