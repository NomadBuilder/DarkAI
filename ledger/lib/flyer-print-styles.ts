/** Shared print CSS for flyer pages (popup print + @media print). */
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
    margin: 0 auto;
    overflow: hidden;
    page-break-after: avoid;
    break-after: avoid-page;
  }
  .flyer-sheet {
    box-sizing: border-box;
    width: 8.5in;
    max-width: 8.5in;
    margin: 0 auto;
    border: 3pt solid #1a1a1a;
    border-radius: 0;
    overflow: hidden;
    background: white;
    page-break-inside: avoid;
    break-inside: avoid-page;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .flyer-sheet-header {
    padding: 0.26in 0.34in 0.2in !important;
  }
  .flyer-sheet-footer {
    padding: 0.16in 0.34in 0.18in !important;
  }
  .flyer-sheet-header .text-xl,
  .flyer-sheet-header .sm\\:text-2xl {
    font-size: 11pt !important;
  }
  .flyer-sheet-header img.h-11,
  .flyer-sheet-header img.sm\\:h-12 {
    height: 0.34in !important;
    width: 0.34in !important;
  }
  .flyer-headline {
    font-size: 16pt !important;
    line-height: 1.05 !important;
  }
  .flyer-subhead {
    font-size: 11pt !important;
    line-height: 1.1 !important;
    margin-top: 2pt !important;
  }
  .flyer-sheet-header .flyer-body-text {
    font-size: 7.5pt !important;
    line-height: 1.25 !important;
    margin-top: 5pt !important;
  }
  .flyer-sheet-header .mt-6 {
    margin-top: 0.12in !important;
  }
  .flyer-sheet-header .rounded-md {
    padding: 2pt 5pt !important;
    font-size: 6.5pt !important;
  }
  .flyer-sheet-header .shrink-0 img {
    max-height: 0.85in !important;
  }
  .flyer-sheet .h-2 {
    height: 3pt !important;
  }
  .flyer-sheet section.px-8,
  .flyer-sheet section.sm\\:px-10 {
    padding: 0.14in 0.34in !important;
  }
  .flyer-sheet section.py-6,
  .flyer-sheet section.sm\\:py-7 {
    padding-top: 0.12in !important;
    padding-bottom: 0.12in !important;
  }
  .flyer-section-title {
    font-size: 8.5pt !important;
    padding-bottom: 1pt !important;
  }
  .flyer-body-text {
    font-size: 7.25pt !important;
    line-height: 1.22 !important;
  }
  .flyer-sheet ul.space-y-3 {
    gap: 0 !important;
  }
  .flyer-sheet ul.space-y-3 > li {
    margin-top: 2pt !important;
  }
  .flyer-sheet ul.space-y-3 > li span.h-2\\.5 {
    height: 5pt !important;
    width: 5pt !important;
    margin-top: 2pt !important;
  }
  .flyer-sheet-footer .text-sm,
  .flyer-sheet-footer .sm\\:text-base {
    font-size: 7pt !important;
  }
  .flyer-sheet-footer .text-base,
  .flyer-sheet-footer .sm\\:text-lg {
    font-size: 8pt !important;
  }
  .flyer-sheet-footer .text-xs {
    font-size: 6pt !important;
  }
  .flyer-sheet-footer .mt-5 {
    margin-top: 0.1in !important;
  }
  .flyer-sheet-footer .rounded-lg {
    padding: 0.08in 0.1in !important;
  }
  .flyer-qr-block img {
    height: 0.62in !important;
    width: 0.62in !important;
  }
  .flyer-qr-block .rounded-xl {
    padding: 2pt !important;
  }
  .flyer-qr-block .mt-2 {
    margin-top: 3pt !important;
  }
  .flyer-qr-block .text-\\[10px\\] {
    font-size: 5.5pt !important;
  }
  .flyer-sheet-footer .text-\\[11px\\],
  .flyer-sheet-footer .sm\\:text-xs {
    font-size: 5.5pt !important;
    line-height: 1.25 !important;
    margin-top: 0.08in !important;
  }
`
