/**
 * magnetic.ts — Subtle magnetic hover for [data-magnetic] elements.
 * Translates element up to ±6px toward the cursor using rAF.
 * Only activates on pointer-fine + hover-capable devices.
 * Disabled under prefers-reduced-motion: reduce.
 */

const MAX_SHIFT = 6 // px

export function initMagnetic(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(pointer: fine) and (hover: hover)').matches) return

  const buttons = document.querySelectorAll<HTMLElement>('[data-magnetic]')
  if (!buttons.length) return

  buttons.forEach((btn) => {
    let rafId: number | null = null

    btn.addEventListener(
      'pointermove',
      (e: PointerEvent) => {
        if (rafId !== null) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = ((e.clientX - cx) / (rect.width / 2)) * MAX_SHIFT
          const dy = ((e.clientY - cy) / (rect.height / 2)) * MAX_SHIFT
          btn.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`
          rafId = null
        })
      },
      { passive: true },
    )

    btn.addEventListener('pointerleave', () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
      btn.style.transform = ''
    })
  })
}
