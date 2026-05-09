/**
 * Build-time static OG image endpoint.
 * Each route maps to a 1200×630 PNG at /og/<slug>.png
 *
 * Routes covered:
 *   - home (id + en)
 *   - about (id + en)
 *   - founder (id + en)
 *   - contact (id + en)
 *   - estimate (id + en)
 *   - services/index (id + en)
 *   - services/<slug> (id + en)
 *   - portfolio/index (id + en)
 *   - portfolio/<slug> (id + en)
 *   - blog/index (id + en)
 *   - blog/<slug> (id + en)
 */
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import { generateOGImage } from '../../lib/og/generate'
import type { OGPageType } from '../../lib/og/generate'

interface RouteEntry {
  slug: string
  title: string
  pageType: OGPageType
}

export const getStaticPaths: GetStaticPaths = async () => {
  const routes: RouteEntry[] = []

  // ── Static pages ─────────────────────────────────────────────────────────
  const staticPages: RouteEntry[] = [
    { slug: 'home',     title: 'Banua Coder — Software House Engineering-Led, Palu, Sulawesi Tengah', pageType: 'home' },
    { slug: 'en-home',  title: 'Banua Coder — Engineering-Led Technology Partner, Palu, Indonesia', pageType: 'home' },
    { slug: 'about',    title: 'Tentang Banua Coder — Software House Engineering-Led di Sulawesi Tengah', pageType: 'about' },
    { slug: 'en-about', title: 'About Banua Coder — Engineering-Led Software House in Central Sulawesi', pageType: 'about' },
    { slug: 'founder',  title: 'Fajrian Aidil Pratama — Founder, Banua Coder', pageType: 'founder' },
    { slug: 'en-founder', title: 'Fajrian Aidil Pratama — Founder, Banua Coder', pageType: 'founder' },
    { slug: 'contact',  title: 'Kontak Banua Coder — Software House Palu, Sulawesi Tengah', pageType: 'contact' },
    { slug: 'en-contact', title: 'Contact Banua Coder — Software House Palu, Indonesia', pageType: 'contact' },
    { slug: 'estimate', title: 'Estimasi Biaya Proyek — Aplikasi Mobile, Web, Sistem Internal', pageType: 'estimate' },
    { slug: 'en-estimate', title: 'Project Cost Estimate — Mobile App, Web, Internal Systems', pageType: 'estimate' },
    { slug: 'portfolio', title: 'Portofolio Aplikasi Mobile, Web, & Sistem Pemerintah — Banua Coder', pageType: 'portfolio' },
    { slug: 'en-portfolio', title: 'Portfolio — Mobile Apps, Web & Government Systems · Banua Coder', pageType: 'portfolio' },
    { slug: 'services', title: 'Layanan Pengembangan Aplikasi & Website — Banua Coder', pageType: 'services' },
    { slug: 'en-services', title: 'Development Services — Apps, Web & Digital Systems · Banua Coder', pageType: 'services' },
    { slug: 'blog',     title: 'Blog Engineering & Product — Banua Coder', pageType: 'blog' },
    { slug: 'en-blog',  title: 'Engineering & Product Blog — Banua Coder', pageType: 'blog' },
  ]
  routes.push(...staticPages)

  // ── Portfolio detail pages ─────────────────────────────────────────────
  const allPortfolio = await getCollection('portfolio')
  for (const entry of allPortfolio) {
    const prefix = entry.data.locale === 'en' ? 'en-portfolio-' : 'portfolio-'
    routes.push({
      slug: `${prefix}${entry.data.slug}`,
      title: entry.data.title,
      pageType: 'portfolio',
    })
  }

  // ── Service detail pages ───────────────────────────────────────────────
  const allServices = await getCollection('services')
  for (const entry of allServices) {
    const prefix = entry.data.locale === 'en' ? 'en-services-' : 'services-'
    routes.push({
      slug: `${prefix}${entry.data.slug}`,
      title: entry.data.title,
      pageType: 'services',
    })
  }

  // ── Blog detail pages ──────────────────────────────────────────────────
  const allPosts = await getCollection('blog')
  for (const entry of allPosts.filter((p) => !p.data.draft)) {
    const prefix = entry.data.locale === 'en' ? 'en-blog-' : 'blog-'
    routes.push({
      slug: `${prefix}${entry.data.slug}`,
      title: entry.data.title,
      pageType: 'blog',
    })
  }

  return routes.map((r) => ({
    params: { slug: r.slug },
    props: { title: r.title, pageType: r.pageType },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { title, pageType } = props as { title: string; pageType: OGPageType }
  const pngBuffer = await generateOGImage({ title, pageType, dark: true })
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
