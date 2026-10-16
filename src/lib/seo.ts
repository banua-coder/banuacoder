/**
 * BreadcrumbList JSON-LD. Usage in a page:
 *   <script type="application/ld+json" slot="head" set:html={breadcrumbJsonLd(Astro.site!, [['Home','/'],['Blog','/blog/'],['Post']])} />
 * Last item may omit the path (current page).
 */
export function breadcrumbJsonLd(site: URL | string, items: Array<[name: string, path?: string]>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(path ? { item: new URL(path, site).href } : {}),
    })),
  })
}
