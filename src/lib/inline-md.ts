/**
 * Tiny inline-Markdown renderer for short string fields (frontmatter).
 * Handles: `code`, **bold**. HTML-escapes everything else first.
 * Not a full Markdown parser — for paragraph-level content use Prose + Content.
 */

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const codeClasses = [
  'font-mono',
  'text-[0.88em]',
  'bg-bnc-stone-100',
  'dark:bg-bnc-stone-800',
  'text-bnc-ink',
  'dark:text-bnc-paper',
  'px-1.5',
  'py-0.5',
  'rounded-[var(--radius-sm)]',
].join(' ')

export function renderInlineMd(input: string | undefined | null): string {
  if (!input) return ''
  let s = escapeHtml(input)
  s = s.replace(/`([^`]+)`/g, `<code class="${codeClasses}">$1</code>`)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  return s
}
