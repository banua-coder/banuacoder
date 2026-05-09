import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const allPosts = await getCollection('blog')
  const posts = allPosts
    .filter((p) => p.data.locale === 'id' && !p.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())

  const siteUrl = context.site!.toString().replace(/\/$/, '')

  return rss({
    title: 'Blog — Banua Coder',
    description:
      'Insights seputar engineering, product, dan transformasi digital dari tim Banua Coder.',
    site: context.site!,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.data.slug}/`,
      pubDate: post.data.publishedAt,
    })),
    customData: `<language>id</language><atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>`,
  })
}
