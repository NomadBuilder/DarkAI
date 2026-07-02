'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { HUB_NAV } from '@/lib/indigenous-hub'

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

  const activeHref =
    HUB_NAV.find((item) => isActive(pathname, item.href, basePath, item.exact))?.href ??
    hubHref('/indigenous/', basePath)

  return (
    <div className="relative min-h-screen bg-[#f4f7f2]">
      <header className="sticky top-0 z-50 border-b border-[#1a4d3a]/10 bg-[#f4f7f2]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start sm:items-center justify-between gap-3 py-3 sm:py-3.5 border-b border-[#1a4d3a]/8 sm:border-0">
            <Link href={hubHref('/indigenous/', basePath)} className="min-w-0 group">
              <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#5a7a66] font-medium leading-none">
                Indigenous-led · Official sources
              </span>
              <span className="block mt-1 text-lg sm:text-xl font-light text-[#142818] leading-tight group-hover:text-[#1a4d3a] transition-colors">
                Land &amp; Water Hub
              </span>
            </Link>
            <Link
              href={siteHref(basePath)}
              className="shrink-0 text-xs text-[#5a7a66] hover:text-[#1a4d3a] pt-0.5 sm:pt-0 transition-colors"
            >
              <span className="sm:hidden">← Protect Ontario</span>
              <span className="hidden sm:inline">← Back to Protect Ontario</span>
            </Link>
          </div>

          {/* Mobile section picker */}
          <div className="sm:hidden pb-3">
            <label className="sr-only" htmlFor="indigenous-hub-section">
              Hub section
            </label>
            <select
              id="indigenous-hub-section"
              value={activeHref}
              onChange={(e) => router.push(e.target.value)}
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
            </select>
          </div>

          {/* Desktop nav */}
          <nav
            className="hidden sm:flex flex-wrap gap-1.5 lg:gap-2 pb-3"
            aria-label="Land & Water Hub"
          >
            {HUB_NAV.map((item) => {
              const href = hubHref(item.href, basePath)
              const active = isActive(pathname, item.href, basePath, item.exact)
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`rounded-full px-3 py-1.5 text-sm font-light transition-colors ${
                    active
                      ? 'bg-[#1a4d3a] text-white'
                      : 'text-[#2d4a38] hover:bg-[#1a4d3a]/8'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {disclaimer && (
        <div className="border-b border-[#1a4d3a]/8 bg-[#e8f0e4]/80">
          <p className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm text-[#3d5c48] font-light leading-relaxed">
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
          <p className="text-xs opacity-70">
            <Link href={hubHref('/indigenous/', basePath)} className="underline underline-offset-2 hover:opacity-100">
              protectont.ca/indigenous
            </Link>
            {' · '}
            <Link href={siteHref(basePath)} className="underline underline-offset-2 hover:opacity-100">
              protectont.ca
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
