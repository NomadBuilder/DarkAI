/** Print only the flyer poster — blank document title, no site chrome. */
import { FLYER_PRINT_CSS } from './flyer-print-styles'
import { fitFlyerSheetToPage, fitFlyerSheetToPageWhenReady, resetFlyerSheetFit } from './flyer-print-fit'

export function printFlyerSheet(): void {
  if (typeof window === 'undefined') return

  const sheet = document.querySelector('.flyer-sheet') as HTMLElement | null
  if (!sheet) {
    window.print()
    return
  }

  const page = sheet.closest('.flyer-print-page')
  let cloneRoot: HTMLElement
  if (page) {
    cloneRoot = page.cloneNode(true) as HTMLElement
  } else {
    cloneRoot = document.createElement('div')
    cloneRoot.className = 'flyer-print-page'
    cloneRoot.appendChild(sheet.cloneNode(true))
  }

  cloneRoot.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')
    if (src?.startsWith('/')) {
      img.setAttribute('src', `${window.location.origin}${src}`)
    }
  })

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1200')
  if (!printWindow) {
    window.print()
    return
  }

  printWindow.document.open()
  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title> </title>
  <style>${FLYER_PRINT_CSS}</style>
</head>
<body>${cloneRoot.outerHTML}</body>
</html>`)
  printWindow.document.close()

  const runPrint = () => {
    const docSheet = printWindow.document.querySelector('.flyer-sheet') as HTMLElement | null
    if (docSheet) {
      fitFlyerSheetToPageWhenReady(docSheet)
      window.setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }, 80)
      return
    }
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  if (printWindow.document.readyState === 'complete') {
    window.setTimeout(runPrint, 250)
  } else {
    printWindow.onload = () => window.setTimeout(runPrint, 250)
  }
}

/** Blank page title during Cmd+P; scale flyer to one page when printing. */
export function bindFlyerPrintTitleCleanup(): () => void {
  if (typeof window === 'undefined') return () => {}

  let savedTitle = document.title

  const onBeforePrint = () => {
    savedTitle = document.title
    document.title = ' '
    const sheet = document.querySelector('.flyer-sheet') as HTMLElement | null
    if (sheet) fitFlyerSheetToPageWhenReady(sheet)
  }
  const onAfterPrint = () => {
    document.title = savedTitle
    const sheet = document.querySelector('.flyer-sheet') as HTMLElement | null
    if (sheet) resetFlyerSheetFit(sheet)
  }

  window.addEventListener('beforeprint', onBeforePrint)
  window.addEventListener('afterprint', onAfterPrint)

  return () => {
    window.removeEventListener('beforeprint', onBeforePrint)
    window.removeEventListener('afterprint', onAfterPrint)
  }
}
