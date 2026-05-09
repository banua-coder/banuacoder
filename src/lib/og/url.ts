/**
 * Returns the /og/<slug>.png URL for a given page.
 * Used in BaseLayout and page components to wire og:image.
 */

export function ogUrl(slug: string): string {
  return `/og/${slug}.png`
}

/**
 * Portfolio detail: /og/portfolio-<slug>.png (id) or /og/en-portfolio-<slug>.png (en)
 */
export function portfolioOgUrl(slug: string, locale: 'id' | 'en' = 'id'): string {
  return locale === 'en' ? `/og/en-portfolio-${slug}.png` : `/og/portfolio-${slug}.png`
}

/**
 * Service detail: /og/services-<slug>.png (id) or /og/en-services-<slug>.png (en)
 */
export function serviceOgUrl(slug: string, locale: 'id' | 'en' = 'id'): string {
  return locale === 'en' ? `/og/en-services-${slug}.png` : `/og/services-${slug}.png`
}

/**
 * Blog detail: /og/blog-<slug>.png (id) or /og/en-blog-<slug>.png (en)
 */
export function blogOgUrl(slug: string, locale: 'id' | 'en' = 'id'): string {
  return locale === 'en' ? `/og/en-blog-${slug}.png` : `/og/blog-${slug}.png`
}
