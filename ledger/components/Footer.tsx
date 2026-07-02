'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SiteWayfindingBar from './SiteWayfindingBar'

function isAdminRoute(pathname: string): boolean {
  return /^\/(flyer-admin|form-admin|admin-events|admin)\/?$/.test(pathname)
}

function isHubRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return (
    normalized === '/stand4land' ||
    normalized.startsWith('/stand4land/') ||
    normalized.startsWith('/ledger/stand4land') ||
    normalized === '/indigenous' ||
    normalized.startsWith('/indigenous/') ||
    normalized.startsWith('/ledger/indigenous')
  )
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

const footerShellClass =
  'border-t border-slate-200/80 bg-white pb-[max(1.5rem,env(safe-area-inset-bottom))]'
const footerInnerClass = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'

function FooterNav({ links }: { links: readonly { href: string; label: string }[] }) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-sm text-slate-600 font-light"
      aria-label="Site footer"
    >
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`hover:text-slate-900 transition-colors ${href === '/join' ? 'font-medium text-slate-800' : ''}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

function FooterCopyright() {
  return (
    <p className="text-center text-xs text-slate-400 font-light">
      Copyright {new Date().getFullYear()} ProtectOnt. All rights reserved.
    </p>
  )
}

export default function Footer() {
  const pathname = usePathname() ?? ''

  if (isAdminRoute(pathname)) {
    return null
  }

  if (isHubRoute(pathname)) {
    return null
  }

  if (needsWayfindingBar(pathname)) {
    return (
      <>
        <SiteWayfindingBar />
        <footer className={`${footerShellClass} pb-[max(4.5rem,env(safe-area-inset-bottom))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]`}>
          <div className={`${footerInnerClass} pt-6 pb-2 space-y-4`}>
            <FooterNav links={FOOTER_LINKS.slice(0, 6)} />
            <FooterCopyright />
          </div>
        </footer>
      </>
    )
  }

  return (
    <footer className={footerShellClass}>
      <div className={`${footerInnerClass} pt-7 sm:pt-8 pb-2 space-y-4 sm:space-y-5`}>
        <FooterNav links={FOOTER_LINKS} />
        <FooterCopyright />
      </div>
    </footer>
  )
}
