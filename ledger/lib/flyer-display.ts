/** Flyer headlines are stored in caps for print; show readable case on the index. */
export function toFlyerDisplayCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  const letters = trimmed.replace(/[^a-zA-Z]/g, '')
  if (!letters || letters !== letters.toUpperCase()) return trimmed

  return trimmed
    .toLowerCase()
    .split(/(\s+|·)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === '·') return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')
}
