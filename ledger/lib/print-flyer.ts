/** Print only the flyer poster — blank document title, no site chrome. */
export function printFlyerSheet(): void {
  if (typeof window === 'undefined') return

  const sheet = document.querySelector('.flyer-sheet')
  if (!sheet) {
    window.print()
    return
  }

  const clone = sheet.cloneNode(true) as HTMLElement
  clone.querySelectorAll('img').forEach((img) => {
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

  const styles = `
    @page { size: letter portrait; margin: 0; }
    html, body {
      margin: 0;
      padding: 0.375in;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .flyer-sheet {
      box-sizing: border-box;
      width: 7.75in;
      max-width: 100%;
      margin: 0 auto;
      border: 3pt solid #1a1a1a;
      overflow: hidden;
      background: white;
    }
    .flyer-body-text { font-size: 10pt; line-height: 1.4; }
    .flyer-section-title { font-size: 12pt; }
    .flyer-headline { font-size: 26pt; }
    .flyer-subhead { font-size: 18pt; }
  `

  printWindow.document.open()
  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title> </title>
  <style>${styles}</style>
</head>
<body>${clone.outerHTML}</body>
</html>`)
  printWindow.document.close()

  const runPrint = () => {
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

/** Blank page title during Cmd+P so the browser header line stays empty. */
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
