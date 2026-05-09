/**
 * Build-time OG image generator using Satori + @resvg/resvg-js
 * Produces 1200×630 PNG for each route.
 *
 * Font files are loaded once (module-level) so multiple calls amortise I/O.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..', '..', '..')

// ── Fonts ──────────────────────────────────────────────────────────────────
const geistFont = readFileSync(
  join(
    rootDir,
    'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
  ),
)
const interFont = readFileSync(
  join(
    rootDir,
    'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  ),
)

// ── Brand colours ─────────────────────────────────────────────────────────
const INK = '#0A0E14'
const ACCENT = '#1D9CD4'
const PRIMARY = '#12398C'
const STONE_800 = '#292524'
const STONE_500 = '#78716C'

export type OGPageType = 'home' | 'portfolio' | 'services' | 'blog' | 'about' | 'founder' | 'contact' | 'estimate' | 'default'

export interface OGOptions {
  title: string
  eyebrow?: string
  pageType?: OGPageType
  dark?: boolean
}

const typeEyebrow: Record<OGPageType, string> = {
  home: '// BERANDA',
  portfolio: '// PORTFOLIO',
  services: '// LAYANAN',
  blog: '// BLOG',
  about: '// TENTANG KAMI',
  founder: '// FOUNDER',
  contact: '// KONTAK',
  estimate: '// ESTIMASI',
  default: '// BANUACODER.COM',
}

/** Truncate a string to maxLen chars, appending "…" if trimmed */
function clamp(s: string, maxLen: number): string {
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s
}

/**
 * Generate a 1200×630 OG PNG buffer.
 */
export async function generateOGImage(opts: OGOptions): Promise<Buffer> {
  const { title, pageType = 'default', dark = true } = opts
  const eyebrow = opts.eyebrow ?? typeEyebrow[pageType]

  const bg = dark ? INK : '#F7F7F4'
  const textMain = dark ? '#F7F7F4' : INK
  const textMuted = dark ? STONE_500 : STONE_500
  const dotColor = dark ? 'rgba(255,255,255,0.03)' : 'rgba(10,14,20,0.04)'
  const glowColor = dark
    ? 'radial-gradient(ellipse 800px 600px at 100% 10%, rgba(18,57,140,0.35) 0%, transparent 70%)'
    : 'radial-gradient(ellipse 800px 600px at 100% 10%, rgba(29,156,212,0.12) 0%, transparent 70%)'

  // Build a dot-grid via a repeating SVG pattern encoded inline
  const dotSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="1" cy="1" r="1" fill="${dotColor}"/></svg>`
  const dotDataUrl = `data:image/svg+xml;base64,${Buffer.from(dotSvg).toString('base64')}`

  const displayTitle = clamp(title, 72)

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: bg,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"Inter Variable", sans-serif',
        },
        children: [
          // ── Background dot grid ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${dotDataUrl}")`,
                backgroundRepeat: 'repeat',
              },
            },
          },
          // ── Brand glow gradient ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                inset: 0,
                background: glowColor,
              },
            },
          },
          // ── Accent left stripe ──
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: `linear-gradient(to bottom, ${ACCENT}, ${PRIMARY})`,
              },
            },
          },
          // ── Main content area ──
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '60px 80px',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
              },
              children: [
                // ── Top row: icon + eyebrow ──
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '16px',
                    },
                    children: [
                      // BC chip
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            border: `1px solid ${dark ? STONE_800 : '#E7E5E4'}`,
                            background: dark ? '#1C1917' : '#FAFAF9',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: '"Geist Variable", sans-serif',
                                  fontWeight: 700,
                                  fontSize: '18px',
                                  color: ACCENT,
                                  letterSpacing: '-0.5px',
                                },
                                children: 'BC',
                              },
                            },
                          ],
                        },
                      },
                      // eyebrow label
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: '"Geist Variable", monospace',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: ACCENT,
                            letterSpacing: '2px',
                            textTransform: 'uppercase' as const,
                          },
                          children: eyebrow,
                        },
                      },
                    ],
                  },
                },
                // ── Title ──
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      flex: 1,
                      justifyContent: 'center',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: '"Geist Variable", sans-serif',
                            fontWeight: 600,
                            fontSize: displayTitle.length > 40 ? '52px' : '64px',
                            color: textMain,
                            lineHeight: 1.1,
                            letterSpacing: '-1px',
                            maxWidth: '900px',
                          },
                          children: displayTitle,
                        },
                      },
                    ],
                  },
                },
                // ── Bottom row: domain ──
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: '"Geist Variable", monospace',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: textMuted,
                            letterSpacing: '1px',
                          },
                          children: 'banuacoder.com',
                        },
                      },
                      // right: accent dots decoration
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                          },
                          children: [
                            { type: 'div', props: { style: { width: '6px', height: '6px', borderRadius: '50%', background: PRIMARY } } },
                            { type: 'div', props: { style: { width: '6px', height: '6px', borderRadius: '50%', background: ACCENT } } },
                            { type: 'div', props: { style: { width: '6px', height: '6px', borderRadius: '50%', background: textMuted } } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Geist Variable',
          data: geistFont,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter Variable',
          data: interFont,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  )

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  return Buffer.from(resvg.render().asPng())
}
