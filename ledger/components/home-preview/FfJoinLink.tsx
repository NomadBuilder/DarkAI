import Link from 'next/link'
import { FF_COLORS } from '@/lib/ff-get-involved'

type FfJoinLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  fullWidthOnMobile?: boolean
}

/** Primary CTA button styled like the /join page */
export default function FfJoinLink({
  href,
  children,
  className = '',
  fullWidthOnMobile = true,
}: FfJoinLinkProps) {
  const widthClass = fullWidthOnMobile ? 'w-full sm:w-auto' : ''
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold uppercase tracking-[0.08em] shadow-[0_8px_24px_-8px_rgba(249,224,76,0.55)] transition-all motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-[0_12px_32px_-8px_rgba(249,224,76,0.65)] motion-safe:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${widthClass} ${className}`}
      style={{
        backgroundColor: FF_COLORS.headingBg,
        color: FF_COLORS.headingText,
        outlineColor: FF_COLORS.headingBg,
      }}
    >
      {children}
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}
