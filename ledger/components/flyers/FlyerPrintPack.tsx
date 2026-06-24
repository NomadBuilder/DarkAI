'use client'

import {
  FLYER_PRINT_PACK_ITEMS,
  FLYER_PRINT_PACK_ZIP_FILENAME,
  FLYER_PRINT_PACK_ZIP_PATH,
} from '@/lib/flyer-print-pack'

export default function FlyerPrintPack() {
  return (
    <section
      className="rounded-2xl border-2 border-[#9f1239]/25 bg-gradient-to-br from-[#9f1239]/8 via-white to-[#2E4A6B]/5 p-6 sm:p-8 shadow-md shadow-slate-900/5"
      aria-labelledby="flyer-print-pack-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9f1239] font-medium mb-2">Print pack</p>
          <h2 id="flyer-print-pack-heading" className="text-2xl sm:text-3xl font-light text-slate-900 leading-tight">
            Community Action Pack
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-xl">
            Grab every core flyer in one download — ready to print letter-size for doors, boards, and tabling.
          </p>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2.5" aria-label="Included flyers">
            {FLYER_PRINT_PACK_ITEMS.map((item) => (
              <li key={item.slug} className="flex items-center gap-2.5 text-sm text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#9f1239]/30 bg-[#9f1239]/10 text-[#9f1239] text-xs font-bold" aria-hidden>
                  ✓
                </span>
                {item.label}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-slate-500 font-light">
            ZIP file · {FLYER_PRINT_PACK_ITEMS.length} print-ready PDFs · letter size (8.5″ × 11″)
          </p>
        </div>

        <div className="shrink-0 lg:pl-4">
          <a
            href={FLYER_PRINT_PACK_ZIP_PATH}
            download={FLYER_PRINT_PACK_ZIP_FILENAME}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#9f1239] px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-[#9f1239]/20 hover:bg-[#881337] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1239]"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            Download all {FLYER_PRINT_PACK_ITEMS.length}
          </a>
        </div>
      </div>
    </section>
  )
}
