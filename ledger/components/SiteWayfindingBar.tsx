'use client'

import Link from 'next/link'

const LINKS = [
  { href: '/protests', label: 'Protests' },
  { href: '/join', label: 'Join' },
  { href: '/materials', label: 'Materials' },
  { href: '/reports', label: 'Reports' },
  { href: '/flyers', label: 'Flyers' },
] as const

/** Slim sticky links for pages that hide the full footer (join, flyer detail). */
export default function SiteWayfindingBar() {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:hidden"
      aria-label="Site navigation"
    >
      <nav className="flex overflow-x-auto gap-0.5 px-1 py-2 scrollbar-none">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-[#2E4A6B] transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
