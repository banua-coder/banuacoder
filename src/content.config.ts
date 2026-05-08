import { defineCollection, reference } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const portfolio = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/portfolio',
    // Use `{slug}.{locale}` as the content collection ID so bilingual entries
    // (e.g. reab/index.id.mdx and reab/index.en.mdx) are stored as distinct
    // entries instead of colliding on the frontmatter `slug` field.
    generateId: ({ entry, data }) => {
      const locale = (data as Record<string, unknown>).locale ?? 'id'
      const slug = (data as Record<string, unknown>).slug ?? entry
      return `${slug}.${locale}`
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      bucket: z.enum(['consumer', 'public-sector', 'operational', 'engineering']),
      client: z.string(),
      clientUrl: z.string().url().optional(),
      year: z.number().int(),
      status: z.enum(['live', 'maintained', 'archived']),
      cover: image(),
      thumbnail: image(),
      gallery: z.array(image()).optional(),
      summary: z.string(),
      problem: z.string(),
      solution: z.string(),
      impact: z.array(z.string()),
      stack: z.array(z.string()),
      links: z
        .object({
          playStore: z.string().url().optional(),
          appStore: z.string().url().optional(),
          web: z.string().url().optional(),
          github: z.string().url().optional(),
        })
        .optional(),
      featured: z.boolean(),
      order: z.number().int(),
      locale: z.enum(['id', 'en']),
    }),
})

const services = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/services',
    generateId: ({ entry, data }) => {
      const locale = (data as Record<string, unknown>).locale ?? 'id'
      const slug = (data as Record<string, unknown>).slug ?? entry
      return `${slug}.${locale}`
    },
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.enum(['customer-facing', 'internal-ops', 'product-engineering', 'design', 'social-media']),
    tagline: z.string(),
    icon: z.string(),
    deliverables: z.array(z.string()),
    idealFor: z.array(z.string()),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .optional(),
    order: z.number().int(),
    locale: z.enum(['id', 'en']),
  }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      photo: image(),
      links: z.object({
        linkedin: z.string().url().optional(),
        github: z.string().url().optional(),
        medium: z.string().url().optional(),
        youtube: z.string().url().optional(),
      }),
    }),
})

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
    generateId: ({ entry, data }) => {
      const locale = (data as Record<string, unknown>).locale ?? 'id'
      const slug = (data as Record<string, unknown>).slug ?? entry.replace(/\.(id|en)\.(md|mdx)$/, '').replace(/\.(md|mdx)$/, '')
      return `${slug}.${locale}`
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      publishedAt: z.date(),
      updatedAt: z.date().optional(),
      author: reference('authors'),
      tags: z.array(z.string()),
      cover: image(),
      draft: z.boolean(),
      locale: z.enum(['id', 'en']),
    }),
})

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/testimonials' }),
  schema: ({ image }) =>
    z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
      company: z.string(),
      avatar: image().optional(),
      companyLogo: image().optional(),
      project: reference('portfolio').optional(),
      featured: z.boolean(),
      order: z.number().int(),
      locale: z.enum(['id', 'en']),
    }),
})

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(['id', 'en']),
    // Optional home page copy fields (present only on home.*.mdx)
    hero: z
      .object({
        eyebrow: z.string(),
        headline: z.string(),
        subheadline: z.string(),
        primaryCta: z.string(),
        primaryHref: z.string(),
        secondaryCta: z.string(),
        secondaryHref: z.string(),
        supportingLine: z.string().optional(),
      })
      .optional(),
    trustClaims: z.array(z.object({ label: z.string() })).optional(),
    about: z
      .object({
        eyebrow: z.string(),
        body: z.string(),
      })
      .optional(),
    services: z
      .object({
        eyebrow: z.string(),
        marker: z.string(),
        title: z.string(),
        description: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            tagline: z.string(),
            icon: z.string(),
            deliverables: z.array(z.string()),
            href: z.string(),
          }),
        ),
      })
      .optional(),
    why: z
      .object({
        eyebrow: z.string(),
        marker: z.string(),
        title: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            body: z.string(),
          }),
        ),
      })
      .optional(),
    process: z
      .object({
        eyebrow: z.string(),
        marker: z.string(),
        title: z.string(),
        description: z.string(),
        steps: z.array(
          z.object({
            title: z.string(),
            body: z.string(),
          }),
        ),
      })
      .optional(),
    portfolio: z
      .object({
        eyebrow: z.string(),
        marker: z.string(),
        title: z.string(),
        description: z.string(),
        viewAllLabel: z.string(),
      })
      .optional(),
    founder: z
      .object({
        eyebrow: z.string(),
        marker: z.string(),
        sectionTitle: z.string(),
        headline: z.string(),
        narrative: z.string(),
        readMoreLabel: z.string(),
      })
      .optional(),
    cta: z
      .object({
        headline: z.string(),
        sub: z.string(),
        primaryCta: z.string(),
        primaryHref: z.string(),
      })
      .optional(),
  }),
})

export const collections = { portfolio, services, blog, authors, testimonials, pages }
