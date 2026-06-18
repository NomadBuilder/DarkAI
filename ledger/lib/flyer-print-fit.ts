const PX_PER_IN = 96

/** Letter page content box (full bleed). */
export function flyerPageSizePx(): { width: number; height: number } {
  return { width: 8.5 * PX_PER_IN, height: 11 * PX_PER_IN }
}

export function resetFlyerSheetFit(sheet: HTMLElement): void {
  sheet.style.transform = ''
  sheet.style.transformOrigin = ''
  sheet.style.marginBottom = ''
  sheet.style.width = ''
  sheet.style.maxWidth = ''
  delete sheet.dataset.flyerFitScale
  const page = sheet.closest('.flyer-print-page') as HTMLElement | null
  if (page) {
    page.style.width = ''
    page.style.height = ''
    page.style.overflow = ''
  }
}

/**
 * Scale down only when content is taller than one letter page.
 * Height-only — never shrink width (that caused tiny top-left previews).
 */
export function fitFlyerSheetToPage(sheet: HTMLElement): void {
  resetFlyerSheetFit(sheet)

  const page = sheet.closest('.flyer-print-page') as HTMLElement | null
  const { width: pageW, height: pageH } = flyerPageSizePx()

  if (page) {
    page.style.width = `${pageW}px`
    page.style.height = `${pageH}px`
    page.style.overflow = 'hidden'
  }

  sheet.style.width = `${pageW}px`
  sheet.style.maxWidth = `${pageW}px`
  sheet.style.minHeight = '0'

  const naturalH = sheet.scrollHeight
  if (naturalH <= 0 || naturalH <= pageH + 2) return

  const scale = pageH / naturalH
  if (scale >= 0.995) return

  sheet.dataset.flyerFitScale = String(scale)
  sheet.style.transformOrigin = 'top center'
  sheet.style.transform = `scale(${scale})`
  sheet.style.marginBottom = `${naturalH * (scale - 1)}px`
}

/** Wait for print styles/layout before measuring (beforeprint can run too early). */
export function fitFlyerSheetToPageWhenReady(sheet: HTMLElement): void {
  resetFlyerSheetFit(sheet)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => fitFlyerSheetToPage(sheet))
  })
}
