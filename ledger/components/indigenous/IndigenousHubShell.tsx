'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import TopNavigation from '@/components/TopNavigation'
import MethodologyDrawer from '@/components/MethodologyDrawer'
import DataSourcesDrawer from '@/components/DataSourcesDrawer'
import { HUB_NAV } from '@/lib/indigenous-hub'

function hubHref(path: string, basePath: string): string {
  const clean = path.replace(/\/+$/, '') || '/indigenous'
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
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

  return (
    <div className="relative min-h-screen bg-[#f4f7f2]">
      <TopNavigation
        onMethodologyClick={() => {
          setShowDataSources(false)
          setShowMethodology(true)
        }}
        onDataSourcesClick={() => {
          setShowMethodology(false)
          setShowDataSources(true)
        }}
      />
      <div className="relative z-10">
        {/* Hub sub-nav */}
        <div className="sticky top-14 sm:top-16 z-40 border-b border-[#1a4d3a]/10 bg-[#f4f7f2]/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-none">
              <Link
                href={hubHref('/indigenous/', basePath)}
                className="shrink-0 text-xs uppercase tracking-[0.25em] text-[#1a4d3a] font-medium pr-2 border-r border-[#1a4d3a]/15"
              >
                Land &amp; Water Hub
              </Link>
              <nav className="flex gap-1 sm:gap-2" aria-label="Indigenous hub">
                {HUB_NAV.map((item) => {
                  const href = hubHref(item.href, basePath)
                  const active = isActive(pathname, item.href, basePath, item.exact)
                  return (
                    <Link
                      key={item.href}
                      href={href}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-light transition-colors ${
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
          </div>
        </div>

        {disclaimer && (
          <div className="border-b border-[#1a4d3a]/8 bg-[#e8f0e4]/80">
            <p className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs sm:text-sm text-[#3d5c48] font-light leading-relaxed">
              {disclaimer}
              {lastUpdated && (
                <span className="block mt-1 text-[#5a7a66]">Last updated {lastUpdated}</span>
              )}
            </p>
          </div>
        )}

        <main>{children}</main>

        <footer className="border-t border-[#1a4d3a]/10 bg-[#1a4d3a] text-[#e8f0e4] px-4 sm:px-6 py-10">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <p className="text-sm font-light leading-relaxed opacity-90">
              This hub links to official Indigenous-led campaigns. Protect Ontario does not speak for Nations or
              collect donations on their behalf.
            </p>
            <p className="text-xs opacity-70">
              Hosted at{' '}
              <Link href={hubHref('/indigenous/', basePath)} className="underline underline-offset-2 hover:opacity-100">
                protectont.ca/indigenous
              </Link>
              {' '}— a future standalone site may launch on its own domain.
            </p>
          </div>
        </footer>
      </div>

      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
