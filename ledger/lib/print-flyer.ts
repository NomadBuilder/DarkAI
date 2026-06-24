/** Print the flyer on the current page — uses @media print rules in globals.css (no popup). */
export function printFlyerSheet(): void {
  if (typeof window === 'undefined') return
  window.print()
}

/** Blank page title during print so the browser header line stays empty. */
export function bindFlyerPrintTitleCleanup(): () => void {
  if (typeof window === 'undefined') return () => {}

  let savedTitle = document.title

  const onBeforePrint = () => {
    savedTitle = document.title
    document.title = ' '
  }
  const onAfterPrint = () => {
    document.title = savedTitle
  }

  window.addEventListener('beforeprint', onBeforePrint)
  window.addEventListener('afterprint', onAfterPrint)

  return () => {
    window.removeEventListener('beforeprint', onBeforePrint)
    window.removeEventListener('afterprint', onAfterPrint)
  }
}
