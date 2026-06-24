/** Flyer headlines are stored in caps for print; show readable case on the index. */
export function toFlyerDisplayCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  const letters = trimmed.replace(/[^a-zA-Z]/g, '')
  if (letters && letters === letters.toUpperCase()) {
    return trimmed.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
  }
  return trimmed
}
