'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SiteWayfindingBar from './SiteWayfindingBar'

function isAdminRoute(pathname: string): boolean {
  return /^\/(flyer-admin|form-admin|admin-events|admin)\/?$/.test(pathname)
}

function needsWayfindingBar(pathname: string): boolean {
  if (/^\/join\/?$/.test(pathname)) return true
  return /^\/flyers\/[^/]+\/?$/.test(pathname)
}

export default function Footer() {
  const pathname = usePathname() ?? ''

  if (isAdminRoute(pathname)) {
    return null
  }

  if (needsWayfindingBar(pathname)) {
    return (
      <>
        <SiteWayfindingBar />
        <footer className="border-t border-slate-100 bg-white pb-14 sm:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-3">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500 font-light">
              <Link href="/flyers" className="hover:text-slate-700 transition-colors">
                Flyers
              </Link>
              <Link href="/materials" className="hover:text-slate-700 transition-colors">
                Materials
              </Link>
              <Link href="/social-ideas" className="hover:text-slate-700 transition-colors">
                Social posts
              </Link>
              <Link href="/protests" className="hover:text-slate-700 transition-colors">
                Protests
              </Link>
              <Link href="/about" className="hover:text-slate-700 transition-colors">
                About
              </Link>
            </div>
          </div>
        </footer>
      </>
    )
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
            <Link href="/flyers" className="hover:text-slate-700 transition-colors">
              Flyers
            </Link>
            <Link href="/materials" className="hover:text-slate-700 transition-colors">
              Materials
            </Link>
            <Link href="/social-ideas" className="hover:text-slate-700 transition-colors">
              Social posts
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
