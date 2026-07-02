'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { HUB_FUNDING_PATH, HUB_NAV } from '@/lib/indigenous-hub'

function hubHref(path: string, basePath: string): string {
  const clean = path.replace(/\/+$/, '') || '/indigenous'
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`
  return basePath ? `${basePath}${withSlash}` : withSlash
}

function siteHref(basePath: string): string {
  return basePath || '/'
}

function isActive(pathname: string | null, href: string, basePath: string, exact?: boolean): boolean {
  if (!pathname) return false
  const full = hubHref(href, basePath).replace(/\/+$/, '')
  const current = pathname.replace(/\/+$/, '')
  if (exact) return current === full
  return current === full || current.startsWith(`${full}/`)
}

function NavLink({
  href,
  active,
  children,
  onNavigate,
  className = '',
}: {
  href: string
  active: boolean
  children: React.ReactNode
  onNavigate?: () => void
  className?: string
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`text-sm font-light transition-colors ${
        active
          ? 'text-[#1a4d3a] underline decoration-[#c4a574] decoration-2 underline-offset-[0.45rem]'
          : 'text-[#5a7a66] hover:text-[#1a4d3a]'
      } ${className}`}
    >
      {children}
    </Link>
  )
}

export default function IndigenousHubShell({
  children,
  disclaimer,
  lastUpdated,
}: {
  children: React.ReactNode
  disclaimer?: string
  lastUpdated?: string
}) {
  const pathname = usePathname()
  const basePath = pathname?.startsWith('/ledger') ? '/ledger' : ''
  const [mobileOpen, setMobileOpen] = useState(false)

  const homeHref = hubHref('/indigenous/', basePath)
  const fundingHref = hubHref(HUB_FUNDING_PATH, basePath)
  const fundingActive = isActive(pathname, HUB_FUNDING_PATH, basePath)
  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="relative min-h-screen bg-[#f4f7f2]">
      <header className="sticky top-0 z-50 border-b border-[#1a4d3a]/8 bg-[#f4f7f2]/92 backdrop-blur-md">
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-7 sm:pt-10 pb-6 sm:pb-8 text-center">
          <button
            type="button"
            className="sm:hidden absolute right-4 top-7 p-2 text-[#5a7a66] hover:text-[#1a4d3a] transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="hub-mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link href={homeHref} className="inline-block group max-w-full" onClick={closeMobile}>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.34em] text-[#5a7a66] font-medium">
              Indigenous-led · Official sources
            </p>
            <p className="mt-3 sm:mt-4 text-2xl sm:text-[2rem] font-light text-[#142818] tracking-tight leading-none group-hover:text-[#1a4d3a] transition-colors">
              Land &amp; Water Hub
            </p>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden sm:block mt-9 sm:mt-10" aria-label="Land & Water Hub">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 lg:gap-x-9 gap-y-3">
              {HUB_NAV.map((item) => {
                const href = hubHref(item.href, basePath)
                const active = isActive(pathname, item.href, basePath, item.exact)
                return (
                  <li key={item.href}>
                    <NavLink href={href} active={active}>
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
              <li>
                <NavLink href={fundingHref} active={fundingActive}>
                  Apply for funding
                </NavLink>
              </li>
            </ul>
          </nav>

          <p className="hidden sm:block mt-8 text-xs text-[#5a7a66]/90 font-light">
            <Link href={siteHref(basePath)} className="hover:text-[#1a4d3a] transition-colors">
              Protect Ontario
            </Link>
          </p>

          {/* Mobile navigation */}
          {mobileOpen && (
            <nav
              id="hub-mobile-nav"
              className="sm:hidden mt-8 pt-8 border-t border-[#1a4d3a]/10"
              aria-label="Land & Water Hub"
            >
              <ul className="space-y-5">
                {HUB_NAV.map((item) => {
                  const href = hubHref(item.href, basePath)
                  const active = isActive(pathname, item.href, basePath, item.exact)
                  return (
                    <li key={item.href}>
                      <NavLink href={href} active={active} onNavigate={closeMobile} className="text-base">
                        {item.label}
                      </NavLink>
                    </li>
                  )
                })}
                <li>
                  <NavLink href={fundingHref} active={fundingActive} onNavigate={closeMobile} className="text-base">
                    Apply for funding
                  </NavLink>
                </li>
              </ul>
              <p className="mt-8 pt-6 border-t border-[#1a4d3a]/10 text-xs text-[#5a7a66]">
                <Link href={siteHref(basePath)} onClick={closeMobile} className="hover:text-[#1a4d3a]">
                  Protect Ontario →
                </Link>
              </p>
            </nav>
          )}
        </div>
      </header>

      {disclaimer && (
        <div className="border-b border-[#1a4d3a]/6 bg-[#eef3eb]/90">
          <p className="max-w-2xl mx-auto px-5 sm:px-8 py-5 sm:py-6 text-xs sm:text-sm text-[#3d5c48] font-light leading-relaxed text-center">
            {disclaimer}
            {lastUpdated && (
              <span className="block mt-2 text-[#5a7a66]">Last updated {lastUpdated}</span>
            )}
          </p>
        </div>
      )}

      <main>{children}</main>

      <footer className="border-t border-[#1a4d3a]/10 bg-[#1a4d3a] text-[#e8f0e4] px-5 sm:px-8 py-10 sm:py-12">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="text-sm font-light leading-relaxed opacity-90">
            This hub links to official Indigenous-led campaigns. Protect Ontario does not speak for Nations or collect
            donations on their behalf.
          </p>
          <p className="text-xs opacity-70 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href={homeHref} className="hover:opacity-100 opacity-80 transition-opacity">
              protectont.ca/indigenous
            </Link>
            <Link href={fundingHref} className="hover:opacity-100 opacity-80 transition-opacity">
              Apply for funding
            </Link>
            <Link href={siteHref(basePath)} className="hover:opacity-100 opacity-80 transition-opacity">
              protectont.ca
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
