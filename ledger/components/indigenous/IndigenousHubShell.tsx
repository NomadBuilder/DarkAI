'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const basePath = pathname?.startsWith('/ledger') ? '/ledger' : ''
  const [mobileOpen, setMobileOpen] = useState(false)

  const fundingHref = hubHref(HUB_FUNDING_PATH, basePath)
  const fundingActive = isActive(pathname, HUB_FUNDING_PATH, basePath)

  const activeHref = fundingActive
    ? fundingHref
    : hubHref(
        HUB_NAV.find((item) => isActive(pathname, item.href, basePath, item.exact))?.href ?? '/indigenous/',
        basePath
      )

  const navLinkClass = (active: boolean) =>
    active
      ? 'border-[#1a4d3a] text-[#1a4d3a] font-medium'
      : 'border-transparent text-[#5a7a66] hover:text-[#1a4d3a] hover:border-[#1a4d3a]/30'

  return (
    <div className="relative min-h-screen bg-[#f4f7f2]">
      <header className="sticky top-0 z-50 bg-white shadow-sm shadow-[#1a4d3a]/5">
        {/* Brand bar */}
        <div className="border-b border-[#1a4d3a]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-[3.75rem] flex items-center justify-between gap-4">
            <Link href={hubHref('/indigenous/', basePath)} className="min-w-0 group flex items-center gap-3">
              <span
                className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a4d3a] text-[#e8f0e4] text-sm font-light"
                aria-hidden
              >
                LW
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.24em] text-[#5a7a66] font-medium leading-none">
                  Indigenous-led · Official sources
                </span>
                <span className="block mt-1 text-base sm:text-[1.125rem] font-light text-[#142818] leading-tight group-hover:text-[#1a4d3a] transition-colors truncate">
                  Land &amp; Water Hub
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href={fundingHref}
                className={`hidden sm:inline-flex rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  fundingActive
                    ? 'bg-[#1a4d3a] text-white'
                    : 'border border-[#1a4d3a]/20 text-[#1a4d3a] hover:bg-[#1a4d3a]/5'
                }`}
              >
                Apply for funding
              </Link>
              <Link
                href={siteHref(basePath)}
                className="text-xs text-[#5a7a66] hover:text-[#1a4d3a] transition-colors whitespace-nowrap"
              >
                <span className="sm:hidden">← PO</span>
                <span className="hidden sm:inline">Protect Ontario →</span>
              </Link>
              <button
                type="button"
                className="sm:hidden p-2 -mr-2 text-[#1a4d3a]"
                aria-expanded={mobileOpen}
                aria-controls="hub-mobile-nav"
                onClick={() => setMobileOpen((o) => !o)}
              >
                <span className="sr-only">Menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop tab nav */}
        <nav
          className="hidden sm:block border-b border-[#1a4d3a]/8 bg-[#fafbf9]"
          aria-label="Land & Water Hub"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-stretch gap-0.5 -mb-px overflow-x-auto">
              {HUB_NAV.map((item) => {
                const href = hubHref(item.href, basePath)
                const active = isActive(pathname, item.href, basePath, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`shrink-0 border-b-2 px-3 lg:px-4 py-3 text-sm font-light transition-colors whitespace-nowrap ${navLinkClass(active)}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div id="hub-mobile-nav" className="sm:hidden border-b border-[#1a4d3a]/8 bg-[#fafbf9] px-4 py-3 space-y-3">
            <Link
              href={fundingHref}
              onClick={() => setMobileOpen(false)}
              className={`block w-full text-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                fundingActive ? 'bg-[#1a4d3a] text-white' : 'bg-[#1a4d3a]/10 text-[#1a4d3a]'
              }`}
            >
              Apply for funding
            </Link>
            <label className="sr-only" htmlFor="indigenous-hub-section">
              Hub section
            </label>
            <select
              id="indigenous-hub-section"
              value={activeHref}
              onChange={(e) => {
                setMobileOpen(false)
                router.push(e.target.value)
              }}
              className="w-full rounded-xl border border-[#1a4d3a]/15 bg-white px-3 py-2.5 text-sm text-[#142818] focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/25"
            >
              {HUB_NAV.map((item) => {
                const href = hubHref(item.href, basePath)
                return (
                  <option key={item.href} value={href}>
                    {item.label}
                  </option>
                )
              })}
              <option value={fundingHref}>Apply for funding</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              {HUB_NAV.map((item) => {
                const href = hubHref(item.href, basePath)
                const active = isActive(pathname, item.href, basePath, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-center text-sm font-light transition-colors ${
                      active
                        ? 'bg-[#1a4d3a] text-white'
                        : 'bg-white border border-[#1a4d3a]/10 text-[#3d5c48] hover:border-[#1a4d3a]/25'
                    }`}
                  >
                    {item.shortLabel ?? item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {disclaimer && (
        <div className="border-b border-[#1a4d3a]/8 bg-[#e8f0e4]/80">
          <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-xs sm:text-sm text-[#3d5c48] font-light leading-relaxed">
            {disclaimer}
            {lastUpdated && (
              <span className="block mt-1 text-[#5a7a66]">Last updated {lastUpdated}</span>
            )}
          </p>
        </div>
      )}

      <main>{children}</main>

      <footer className="border-t border-[#1a4d3a]/10 bg-[#1a4d3a] text-[#e8f0e4] px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-sm font-light leading-relaxed opacity-90">
            This hub links to official Indigenous-led campaigns. Protect Ontario does not speak for Nations or collect
            donations on their behalf.
          </p>
          <p className="text-xs opacity-70 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href={hubHref('/indigenous/', basePath)} className="underline underline-offset-2 hover:opacity-100">
              protectont.ca/indigenous
            </Link>
            <span aria-hidden>·</span>
            <Link href={fundingHref} className="underline underline-offset-2 hover:opacity-100">
              Apply for funding
            </Link>
            <span aria-hidden>·</span>
            <Link href={siteHref(basePath)} className="underline underline-offset-2 hover:opacity-100">
              protectont.ca
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
