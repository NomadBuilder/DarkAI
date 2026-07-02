import Link from 'next/link'

export type HubBreadcrumbItem = {
  label: string
  href?: string
}

export default function HubBreadcrumbs({ items }: { items: HubBreadcrumbItem[] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-light text-[var(--hub-land-muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-[var(--hub-land-forest)]/35" aria-hidden>
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[var(--hub-land-forest)]">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-[var(--hub-land-ink)]' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
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
