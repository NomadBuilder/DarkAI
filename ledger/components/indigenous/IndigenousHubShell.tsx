'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import HubWordmark from '@/components/indigenous/HubWordmark'
import { HUB_BASE_PATH, HUB_FUNDING_PATH, HUB_NAV, HUB_SITE_NAME } from '@/lib/indigenous-hub'

function hubHref(path: string, basePath: string): string {
  const clean = path.replace(/\/+$/, '') || HUB_BASE_PATH
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`
  return basePath ? `${basePath}${withSlash}` : withSlash
}

function isActive(pathname: string | null, href: string, basePath: string, exact?: boolean): boolean {
  if (!pathname) return false
  const full = hubHref(href, basePath).replace(/\/+$/, '')
  const current = pathname.replace(/\/+$/, '')
  if (exact) return current === full
  return current === full || current.startsWith(`${full}/`)
}

function hubNavClass(active: boolean, variant: 'pill' | 'funding' = 'pill'): string {
  const base = 'inline-flex items-center justify-center h-8 px-3.5 text-sm leading-none rounded-md transition-colors'
  if (variant === 'funding') {
    return `${base} font-medium border ${
      active
        ? 'bg-[var(--hub-land-forest)] text-white border-[var(--hub-land-forest)]'
        : 'bg-transparent text-[var(--hub-land-forest)] border-[var(--hub-land-forest)]/25 hover:border-[var(--hub-land-forest)]/45'
    }`
  }
  return `${base} font-normal ${
    active
      ? 'bg-[var(--hub-land-forest)] text-white'
      : 'text-[var(--hub-land-muted)] hover:bg-[var(--hub-land-forest)]/8'
  }`
}

function navLabel(item: (typeof HUB_NAV)[number], useShort: boolean): string {
  if (!useShort) return item.label
  return item.shortLabel ?? item.label
}

export default function IndigenousHubShell({
  children,
  lastUpdated,
}: {
  children: React.ReactNode
  lastUpdated?: string
}) {
  const pathname = usePathname()
  const basePath = pathname?.startsWith('/ledger') ? '/ledger' : ''
  const protectOntHref = basePath || '/'
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const homeHref = hubHref(`${HUB_BASE_PATH}/`, basePath)
  const fundingHref = hubHref(HUB_FUNDING_PATH, basePath)
  const fundingActive = isActive(pathname, HUB_FUNDING_PATH, basePath)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  const renderNavLink = (
    item: (typeof HUB_NAV)[number],
    options?: { responsive?: boolean; label?: string }
  ) => {
    const href = hubHref(item.href, basePath)
    const active = isActive(pathname, item.href, basePath, item.exact)
    return (
      <Link
        key={item.href}
        href={href}
        className={hubNavClass(active)}
        onClick={() => setMobileNavOpen(false)}
      >
        {options?.responsive ? (
          <>
            <span className="lg:hidden">{navLabel(item, true)}</span>
            <span className="hidden lg:inline">{item.label}</span>
          </>
        ) : (
          options?.label ?? item.label
        )}
      </Link>
    )
  }

  const fundingLink = (label: string) => (
    <Link
      href={fundingHref}
      className={hubNavClass(fundingActive, 'funding')}
      onClick={() => setMobileNavOpen(false)}
    >
      {label}
    </Link>
  )

  return (
    <div className="relative min-h-screen flex flex-col">
      <header className="hub-shell-header sticky top-0 z-40 border-b border-[var(--hub-land-forest)]/12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <HubWordmark href={homeHref} />
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[var(--hub-land-forest)]/15 bg-white text-[var(--hub-land-forest)] hover:bg-[var(--hub-land-forest)]/5 transition-colors"
                aria-expanded={mobileNavOpen}
                aria-controls="hub-mobile-nav"
              >
                <span className="sr-only">{mobileNavOpen ? 'Close menu' : 'Open menu'}</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
            <div
              id="hub-mobile-nav"
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                mobileNavOpen ? 'max-h-[28rem] opacity-100 mt-3' : 'max-h-0 opacity-0'
              }`}
              aria-hidden={!mobileNavOpen}
            >
              <nav
                className="flex flex-wrap gap-2 rounded-2xl border border-[var(--hub-land-forest)]/10 bg-white/80 p-3"
                aria-label={HUB_SITE_NAME}
              >
                {HUB_NAV.map((item) => renderNavLink(item))}
                {fundingLink('Apply for funding')}
              </nav>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 lg:gap-8">
            <HubWordmark href={homeHref} />
            <nav
              className="flex flex-1 flex-wrap items-center justify-end gap-1.5 lg:gap-2"
              aria-label={HUB_SITE_NAME}
            >
              {HUB_NAV.map((item) => renderNavLink(item, { responsive: true }))}
              {fundingLink('Apply for funding')}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="hub-shell-footer border-t border-[var(--hub-land-forest)]/20 text-[#e8f0e4] px-4 sm:px-6 py-6 sm:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto text-center space-y-3">
          <p className="text-sm font-light leading-relaxed opacity-90">
            This site links to official Indigenous-led campaigns. We do not speak for Nations or collect donations on
            their behalf.
          </p>
          {lastUpdated && (
            <p className="text-xs opacity-60">Data last reviewed {lastUpdated}</p>
          )}
          <p className="text-xs opacity-60">
            <Link href={protectOntHref} className="hover:opacity-100 transition-opacity">
              protectont.ca
            </Link>
            <span className="mx-2 opacity-50" aria-hidden>
              ·
            </span>
            <span>© {new Date().getFullYear()} ProtectOnt</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
