/**
 * axe-core audit script using jsdom (no browser required).
 * Audits dist/index.html + a portfolio detail page.
 */
import { readFileSync } from 'node:fs'
import { JSDOM, VirtualConsole } from 'jsdom'
import axe from 'axe-core'

const files = [
  'dist/index.html',
  'dist/portfolio/index.html',
]

let totalViolations = 0

for (const file of files) {
  const html = readFileSync(file, 'utf8')
  const vc = new VirtualConsole()
  const dom = new JSDOM(html, { virtualConsole: vc, url: 'http://localhost/' })
  const { window } = dom

  // Use axe-core directly against the document via a script tag injection approach
  // axe.run operates in Node context but needs a DOM-compatible document
  // We configure axe to use the jsdom window's document
  const axeInstance = axe
  const results = await axeInstance.run(dom.window.document.body, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })

  console.log(`\n=== ${file} ===`)
  if (results.violations.length === 0) {
    console.log('PASS: zero violations')
  } else {
    for (const v of results.violations) {
      console.log(`FAIL [${v.impact}] ${v.id}: ${v.description}`)
      for (const node of v.nodes) {
        console.log(`  - ${node.html.slice(0, 120)}`)
      }
    }
  }
  totalViolations += results.violations.length
  console.log(`Passes: ${results.passes.length}, Violations: ${results.violations.length}, Incomplete: ${results.incomplete.length}`)
}

console.log(`\nTotal violations: ${totalViolations}`)
process.exit(totalViolations > 0 ? 1 : 0)
