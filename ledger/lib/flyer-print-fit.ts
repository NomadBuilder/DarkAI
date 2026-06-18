const PX_PER_IN = 96

/** Letter page content box (full bleed). */
export function flyerPageSizePx(): { width: number; height: number } {
  return { width: 8.5 * PX_PER_IN, height: 11 * PX_PER_IN }
}

export function resetFlyerSheetFit(sheet: HTMLElement): void {
  sheet.style.transform = ''
  sheet.style.transformOrigin = ''
  sheet.style.marginBottom = ''
  delete sheet.dataset.flyerFitScale
  const page = sheet.closest('.flyer-print-page') as HTMLElement | null
  if (page) {
    page.style.width = ''
    page.style.height = ''
    page.style.overflow = ''
  }
}

/**
 * Scale the flyer down if content exceeds one letter page (8.5″×11″).
 * Call on beforeprint; reset on afterprint.
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

  const naturalH = sheet.scrollHeight
  const naturalW = sheet.scrollWidth
  if (naturalH <= 0 || naturalW <= 0) return

  const scale = Math.min(1, pageH / naturalH, pageW / naturalW)
  if (scale >= 0.999) return

  sheet.dataset.flyerFitScale = String(scale)
  sheet.style.transformOrigin = 'top center'
  sheet.style.transform = `scale(${scale})`
  // Collapse extra layout height so the browser does not add a second page.
  sheet.style.marginBottom = `${naturalH * (scale - 1)}px`
}
