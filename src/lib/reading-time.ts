/**
 * Estimate reading time from a raw text string.
 * Assumes average adult reading speed of 200 words per minute.
 * Returns minutes (minimum 1).
 */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
