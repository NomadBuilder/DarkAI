import React from 'react'

type InlineCitationProps = {
  href: string
  label: string
}

export default function InlineCitation({ href, label }: InlineCitationProps) {
  const isExternal = href.startsWith('http')
  return (
    <sup className="-ml-0.5 align-super text-[0.65em] font-medium text-current">
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="no-underline hover:text-blue-700 transition-colors"
      >
        {label}
      </a>
    </sup>
  )
}
