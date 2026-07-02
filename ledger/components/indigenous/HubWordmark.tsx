import Link from 'next/link'
import { HUB_SITE_NAME } from '@/lib/indigenous-hub'

type HubWordmarkProps = {
  href: string
  className?: string
}

export default function HubWordmark({ href, className = '' }: HubWordmarkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}
      aria-label={HUB_SITE_NAME}
    >
      <span
        className="h-7 sm:h-8 w-0.5 rounded-full bg-[#1a4d3a]/70 group-hover:bg-[#1a4d3a] transition-colors"
        aria-hidden
      />
      <span className="font-hub-display text-[1.05rem] sm:text-[1.2rem] leading-tight tracking-[-0.02em] text-[#142818] group-hover:text-[#1a4d3a] transition-colors">
        <span className="font-normal">Standing </span>
        <span className="font-semibold">for the Land</span>
      </span>
    </Link>
  )
}
