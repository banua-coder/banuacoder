// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://banuacoder.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false },
    fallback: { en: 'id' },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/dev/'),
    }),
  ],
  vite: { plugins: [/** @type {any} */ (tailwindcss())] },
})
