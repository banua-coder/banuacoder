/**
 * Build-time OG image generator using Satori + @resvg/resvg-js
 * Produces 1200×630 PNG for each route.
 *
 * Fonts must be TTF (not woff2) for Satori's opentype.js parser.
 * Bundled TTF files are stored in src/assets/fonts/ — downloaded once
 * from Google Fonts (Inter v20, Geist v4, latin subset, weight 400).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

// ── Fonts — TTF required by Satori's opentype.js ───────────────────────────
// Fonts live in public/fonts/ so they are always copied to dist/fonts/
// during the static build. At prerender time Astro's cwd is the project root,
// so `dist/fonts/` resolves correctly.
//
// During dev / check, process.cwd() is also the project root → same path.
function readFontFile(name: string): Buffer {
  // After build Astro prerenders from project root; dist/fonts/ has the files.
  // During the two-pass Vite build the font file is also available there.
  // Fallback: public/fonts/ for when dist/ hasn't been populated yet.
  const candidates = [
    join(process.cwd(), 'dist', 'fonts', name),
    join(process.cwd(), 'public', 'fonts', name),
  ]
  for (const p of candidates) {
    try {
      return readFileSync(p)
    } catch {
      // try next
    }
  }
  throw new Error(`Font file not found: ${name}. Checked: ${candidates.join(', ')}`)
}

const geistFont = readFontFile('geist-latin-400.ttf')
const geistBold = readFontFile('geist-latin-700.ttf')
const geistBlack = readFontFile('geist-latin-800.ttf')

// ── Brand colours (THE PROSPECTUS) ───────────────────────────────────────
const PLATE = '#0B1FD0'
const PLATE_LIFT = '#1634F0'
const PLATE_MUTE = '#A9B6FF'
const PLATE_LINE = 'rgba(255,255,255,0.25)'
const CYAN = '#3DE0F2'

export type OGPageType = 'home' | 'portfolio' | 'services' | 'blog' | 'about' | 'founder' | 'contact' | 'estimate' | 'default'

export interface OGOptions {
  title: string
  eyebrow?: string
  pageType?: OGPageType
  locale?: 'id' | 'en'
  dark?: boolean
  /** Giant tonal numeral; defaults to the page-type number */
  numeral?: string
}

const typeEyebrow: Record<'id' | 'en', Record<OGPageType, string>> = {
  id: {
    home: 'BERANDA', portfolio: 'PORTFOLIO', services: 'LAYANAN', blog: 'BLOG',
    about: 'TENTANG KAMI', founder: 'FOUNDER', contact: 'KONTAK', estimate: 'ESTIMASI',
    default: 'BANUACODER.COM',
  },
  en: {
    home: 'HOME', portfolio: 'PORTFOLIO', services: 'SERVICES', blog: 'BLOG',
    about: 'ABOUT', founder: 'FOUNDER', contact: 'CONTACT', estimate: 'ESTIMATE',
    default: 'BANUACODER.COM',
  },
}

// Giant tonal numeral per page type (the folio number of that section)
const typeNumeral: Record<OGPageType, string> = {
  home: '19', services: '02', portfolio: '03', blog: '04', about: '05',
  founder: '06', contact: '07', estimate: '08', default: '19',
}

/** Brand mark (same paths as the site loader/logo). Rendered as an <img> data URL for Satori. */
function logoDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="193 745 165 130" fill="none" fill-rule="evenodd"><path d="M246.91,763.974l6.66,6.661c-10.99,8.825 -18.115,22.954 -18.115,38.867c0,15.912 7.125,30.042 18.115,38.867l-6.66,6.66c-12.681,-10.582 -20.835,-27.047 -20.835,-45.527c-0,-18.48 8.154,-34.946 20.835,-45.528Z" fill="#3DE0F2"/><path d="M259.8,863.013c-4.628,2.713 -10.015,4.269 -15.762,4.269l-47.601,-0l-0,-40.616c-0,-6.885 -5.59,-12.474 -12.475,-12.474c0,0 0,-9.38 0,-9.38c6.885,-0 12.475,-5.59 12.475,-12.475l-0,-40.615l47.601,-0l0.101,0c5.71,0.019 11.061,1.572 15.66,4.268c6.314,-2.751 13.224,-4.268 20.463,-4.268c18.578,-0 34.985,9.991 44.75,25.205l-6.817,6.817c-7.937,-13.6 -21.965,-22.642 -37.933,-22.642c-4.248,0 -8.36,0.641 -12.255,1.836c4.535,5.422 7.266,12.404 7.266,20.019c-0,11.2 -5.908,21.031 -14.775,26.545c8.867,5.513 14.775,15.344 14.775,26.545c-0,7.614 -2.731,14.596 -7.266,20.018c3.896,1.196 8.007,1.836 12.255,1.836c18.318,0 34.082,-11.898 41.028,-28.927l7.096,7.096c-9.027,18.536 -27.198,31.212 -48.124,31.212c-7.239,-0 -14.149,-1.517 -20.462,-4.269Zm-53.983,-5.112l0,-31.235c0,-6.958 -3.259,-13.162 -8.332,-17.164c5.073,-4.003 8.332,-10.206 8.332,-17.165l0,-31.235l38.221,0c12.062,0 21.854,9.793 21.854,21.855c0,12.062 -9.792,21.855 -21.854,21.855l-0,9.38c12.062,0 21.854,9.793 21.854,21.855c0,12.037 -9.753,21.815 -21.784,21.854l-0.07,0l-38.221,0Z" fill="#FFFFFF"/></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/** Split title into visually balanced lines (greedy by words toward an even target width). */
function balanceLines(title: string, maxLines = 3, maxChars = 26): string[] {
  const words = title.split(/\s+/)
  const n = Math.min(maxLines, Math.max(1, Math.ceil(title.length / maxChars)))
  const target = Math.ceil(title.length / n)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (cur && next.length > target && lines.length < n - 1) {
      lines.push(cur)
      cur = w
    } else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

/** Truncate a string to maxLen chars, appending "…" if trimmed */
function clamp(s: string, maxLen: number): string {
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s
}

/**
 * Generate a 1200×630 OG PNG buffer: an ultramarine plate with a giant
 * tonal numeral, hairline rules, a cyan folio and the white logo mark.
 */
export async function generateOGImage(opts: OGOptions): Promise<Buffer> {
  const { title, pageType = 'default' } = opts
  const locale = opts.locale ?? 'id'
  const folio = opts.eyebrow ?? typeEyebrow[locale][pageType]
  const numeral = opts.numeral ?? typeNumeral[pageType]

  const displayTitle = clamp(title, 90)
  const titleLines = balanceLines(displayTitle, 3, 24)
  const titleSize = displayTitle.length > 70 ? 56 : displayTitle.length > 40 ? 68 : 84

  const rule = (top: number) => ({
    type: 'div',
    props: { style: { position: 'absolute', left: 72, right: 72, top, height: 1, background: PLATE_LINE } },
  })

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px', height: '630px', display: 'flex', position: 'relative',
          overflow: 'hidden', backgroundColor: PLATE, fontFamily: '"Geist Variable", sans-serif',
        },
        children: [
          // giant tonal numeral
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', right: -30, bottom: -150, fontSize: 640, fontWeight: 800,
                letterSpacing: '-38px', lineHeight: 1, color: PLATE_LIFT,
              },
              children: numeral,
            },
          },
          rule(112),
          rule(534),
          // top row: logo mark + folio
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', left: 72, right: 72, top: 36, height: 60, display: 'flex',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              },
              children: [
                { type: 'img', props: { src: logoDataUrl(), width: 62, height: 49 } },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 18, letterSpacing: '3px', color: CYAN, textTransform: 'uppercase' as const },
                    children: `№ ${numeral.padStart(2, '0')} / ${folio}`,
                  },
                },
              ],
            },
          },
          // title
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', left: 72, top: 140, width: 960, height: 380, display: 'flex',
                flexDirection: 'column', justifyContent: 'center',
              },
              children: titleLines.map((line) => ({
                type: 'div',
                props: {
                  style: {
                    fontSize: titleSize, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.02,
                    letterSpacing: `${Math.round(titleSize * -0.045)}px`,
                  },
                  children: line,
                },
              })),
            },
          },
          // bottom row
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', left: 72, right: 72, top: 552, height: 40, display: 'flex',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              },
              children: [
                { type: 'div', props: { style: { fontSize: 18, letterSpacing: '2px', color: PLATE_MUTE }, children: 'banuacoder.com' } },
                { type: 'div', props: { style: { fontSize: 18, letterSpacing: '3px', color: PLATE_MUTE, textTransform: 'uppercase' as const }, children: 'Palu · 2019' } },
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
        { name: 'Geist Variable', data: geistFont, weight: 400, style: 'normal' },
        { name: 'Geist Variable', data: geistBold, weight: 700, style: 'normal' },
        { name: 'Geist Variable', data: geistBlack, weight: 800, style: 'normal' },
      ],
    },
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  return Buffer.from(resvg.render().asPng())
}
