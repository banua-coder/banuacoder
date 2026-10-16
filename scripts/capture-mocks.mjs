/**
 * Dev tool: renders every recreated mock (via /dev/mock/<slug> on `pnpm dev`) into
 * src/content/portfolio/<slug>/{cover,thumbnail}.webp. Usage: node scripts/capture-mocks.mjs [slug...]
 * Needs playwright-core (PW_CORE env = path) and `magick`.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
const { chromium } = createRequire(import.meta.url)(process.env.PW_CORE ?? 'playwright-core')
const base = process.env.BASE ?? 'http://localhost:4321'
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync('src/content/portfolio').filter((s) => !s.startsWith('.'))
const browser = await chromium.launch({ executablePath: process.env.CHROME })
for (const [name, w, h] of [['cover', 1600, 1000], ['thumbnail', 800, 600]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: 'light' })
  for (const slug of slugs) {
    await page.goto(`${base}/dev/mock/${slug}/`, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: '*{animation:none!important}' })
    const png = `/tmp/mock-${slug}-${name}.png`
    await page.screenshot({ path: png })
    execFileSync('magick', [png, '-quality', '86', `src/content/portfolio/${slug}/${name}.webp`])
    console.log(slug, name)
  }
}
await browser.close()
