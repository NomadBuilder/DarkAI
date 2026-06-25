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

const FOOTER_LINKS = [
  { href: '/protests', label: 'Protests' },
  { href: '/join', label: 'Join' },
  { href: '/materials', label: 'Materials' },
  { href: '/flyers', label: 'Flyers' },
  { href: '/products', label: 'Products' },
  { href: '/take-action', label: 'Take action' },
  { href: '/about', label: 'About' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const

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
              {FOOTER_LINKS.slice(0, 6).map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-slate-700 transition-colors">
                  {label}
                </Link>
              ))}
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
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-slate-700 transition-colors ${href === '/join' ? 'font-medium text-slate-600' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
