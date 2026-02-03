'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-3">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left gap-2 text-xs text-slate-500 font-light">
          <span>Copyright {new Date().getFullYear()} ProtectOnt. All rights reserved.</span>
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2">
            <Link href="/about" className="hover:text-slate-700 transition-colors">
              About
            </Link>
            <Link href="/methodology" className="hover:text-slate-700 transition-colors">
              Methodology
            </Link>
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
