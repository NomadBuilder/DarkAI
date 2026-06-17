'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HIDE_FOOTER_PATHS = /^\/(join|get-involved|flyer|flyer-admin)\/?$/

export default function Footer() {
  const pathname = usePathname()
  if (pathname && HIDE_FOOTER_PATHS.test(pathname)) {
    return null
  }

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left gap-3 text-xs text-slate-500 font-light">
          <span>Copyright {new Date().getFullYear()} ProtectOnt. All rights reserved.</span>
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2">
            <Link href="/join" className="hover:text-slate-700 transition-colors font-medium text-slate-600">
              Join
            </Link>
            <Link href="/protests" className="hover:text-slate-700 transition-colors">
              Protests
            </Link>
            <Link href="/take-action" className="hover:text-slate-700 transition-colors">
              Take action
            </Link>
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
