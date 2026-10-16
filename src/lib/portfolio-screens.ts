import type { ImageMetadata } from 'astro'

/**
 * Real screenshots live in src/content/portfolio/<slug>/screenshots/*.
 * They are not in the content schema (gallery), so they are discovered via glob.
 * Landscape images render in a browser frame, portrait ones in a phone frame.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/portfolio/*/screenshots/*.{webp,png,jpg,jpeg}',
  { eager: true },
)

export interface Screen {
  src: ImageMetadata
  kind: 'phone' | 'desktop'
}

export function getScreens(slug: string): Screen[] {
  const prefix = `/src/content/portfolio/${slug}/screenshots/`
  return Object.entries(files)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => {
      // "home" first, then natural order (screenshot-2 before screenshot-10)
      const home = Number(b.includes('-home')) - Number(a.includes('-home'))
      return home || a.localeCompare(b, undefined, { numeric: true })
    })
    .map(([, m]) => ({
      src: m.default,
      kind: m.default.width > m.default.height ? 'desktop' : 'phone',
    }))
}

/** Own products (client "Banua Coder") are not client work: show a label instead of a client name. */
export const isOwnProduct = (client: string) => client.trim().toLowerCase() === 'banua coder'
export const clientLabel = (client: string, locale: 'id' | 'en') =>
  isOwnProduct(client) ? (locale === 'en' ? 'Our own product' : 'Produk sendiri') : client
