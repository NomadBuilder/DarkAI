/** Shared print CSS for flyer pages (popup print + @media print in globals.css — keep in sync). */
export const FLYER_PRINT_CSS = `
  @page { size: letter portrait; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .flyer-print-page {
    box-sizing: border-box;
    width: 8.5in;
    height: 11in;
    margin: 0;
    overflow: hidden;
    page-break-after: avoid;
    break-after: avoid-page;
  }
  .flyer-sheet {
    box-sizing: border-box;
    width: 8.5in;
    height: 11in;
    max-height: 11in;
    min-height: 0 !important;
    margin: 0;
    border: 3pt solid #1a1a1a;
    border-radius: 0;
    overflow: hidden;
    background: white;
    display: flex;
    flex-direction: column;
    page-break-inside: avoid;
    break-inside: avoid-page;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .flyer-sheet > .h-2 {
    flex: 0 0 4pt;
    height: 4pt !important;
  }
  .flyer-sheet-header {
    flex: 0 0 auto;
    padding: 0.32in 0.4in 0.22in !important;
  }
  .flyer-sheet-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .flyer-sheet-body.flyer-sheet-body--grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
  .flyer-sheet-footer {
    flex: 0 0 auto;
    margin-top: auto;
    padding: 0.18in 0.4in 0.2in !important;
  }
  .flyer-sheet-header .text-xl,
  .flyer-sheet-header .sm\\:text-2xl {
    font-size: 15pt !important;
  }
  .flyer-sheet-header img.h-11,
  .flyer-sheet-header img.sm\\:h-12 {
    height: 0.4in !important;
    width: 0.4in !important;
  }
  .flyer-headline {
    font-size: 26pt !important;
    line-height: 1.05 !important;
  }
  .flyer-subhead {
    font-size: 17pt !important;
    line-height: 1.08 !important;
    margin-top: 3pt !important;
  }
  .flyer-sheet-header .flyer-body-text {
    font-size: 10pt !important;
    line-height: 1.28 !important;
    margin-top: 5pt !important;
  }
  .flyer-sheet-header .mt-6 {
    margin-top: 0.14in !important;
  }
  .flyer-sheet-header .lg\\:flex-row {
    flex-direction: row !important;
    align-items: flex-start !important;
    gap: 0.18in !important;
  }
  .flyer-sheet-header .lg\\:max-w-\\[42\\%\\] {
    max-width: 36% !important;
  }
  .flyer-sheet-header .rounded-md {
    padding: 3pt 6pt !important;
    font-size: 8pt !important;
  }
  .flyer-sheet-header .shrink-0 img {
    max-height: 1.05in !important;
  }
  .flyer-sheet section.px-8,
  .flyer-sheet section.sm\\:px-10 {
    padding-left: 0.4in !important;
    padding-right: 0.4in !important;
  }
  .flyer-sheet section.py-6,
  .flyer-sheet section.sm\\:py-7 {
    padding-top: 0.14in !important;
    padding-bottom: 0.14in !important;
  }
  .flyer-section-title {
    font-size: 11pt !important;
    padding-bottom: 2pt !important;
  }
  .flyer-body-text {
    font-size: 9.5pt !important;
    line-height: 1.26 !important;
  }
  .flyer-sheet ul.space-y-3 > li {
    margin-top: 2pt !important;
  }
  .flyer-sheet ul.space-y-3 > li span.h-2\\.5 {
    height: 6pt !important;
    width: 6pt !important;
    margin-top: 3pt !important;
  }
  .flyer-print-compact section.py-6,
  .flyer-print-compact section.sm\\:py-7 {
    padding-top: 0.11in !important;
    padding-bottom: 0.11in !important;
  }
  .flyer-print-compact .flyer-body-text {
    font-size: 9pt !important;
    line-height: 1.22 !important;
  }
  .flyer-print-dense section.py-6,
  .flyer-print-dense section.sm\\:py-7 {
    padding-top: 0.08in !important;
    padding-bottom: 0.08in !important;
  }
  .flyer-print-dense .flyer-body-text {
    font-size: 8.25pt !important;
    line-height: 1.18 !important;
  }
  .flyer-print-dense .flyer-section-title {
    font-size: 10pt !important;
  }
  .flyer-print-dense .flyer-sheet-header {
    padding-bottom: 0.14in !important;
  }
  .flyer-print-dense .flyer-sheet-header .flyer-body-text {
    font-size: 9pt !important;
  }
  .flyer-sheet-footer .text-sm,
  .flyer-sheet-footer .sm\\:text-base {
    font-size: 8.5pt !important;
  }
  .flyer-sheet-footer .text-base,
  .flyer-sheet-footer .sm\\:text-lg {
    font-size: 10pt !important;
  }
  .flyer-sheet-footer .text-xs {
    font-size: 7.5pt !important;
  }
  .flyer-sheet-footer .mt-5 {
    margin-top: 0.1in !important;
  }
  .flyer-sheet-footer .rounded-lg {
    padding: 0.08in 0.1in !important;
  }
  .flyer-qr-block img {
    height: 0.8in !important;
    width: 0.8in !important;
  }
  .flyer-qr-block .rounded-xl {
    padding: 3pt !important;
  }
  .flyer-qr-block .mt-2 {
    margin-top: 3pt !important;
  }
  .flyer-qr-block .text-\\[10px\\] {
    font-size: 7pt !important;
  }
  .flyer-sheet-footer .text-\\[11px\\],
  .flyer-sheet-footer .sm\\:text-xs {
    font-size: 6.5pt !important;
    line-height: 1.25 !important;
    margin-top: 0.08in !important;
  }
`
