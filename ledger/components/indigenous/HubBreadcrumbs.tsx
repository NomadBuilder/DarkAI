import Link from 'next/link'

export type HubBreadcrumbItem = {
  label: string
  href?: string
}

export default function HubBreadcrumbs({ items }: { items: HubBreadcrumbItem[] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#5a7a66] font-light">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-[#1a4d3a]/35 select-none" aria-hidden>
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[#1a4d3a] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-[#142818]' : undefined} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
