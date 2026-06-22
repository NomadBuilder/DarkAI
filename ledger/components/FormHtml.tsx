'use client'

import { sanitizeFormHtml } from '@/lib/form-html'

type Props = {
  html: string
  className?: string
  linkClassName?: string
}

export default function FormHtml({ html, className = '', linkClassName }: Props) {
  const safe = sanitizeFormHtml(html)
  if (!safe) return null

  const linkClasses =
    linkClassName ??
    '[&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-blue-700'

  return (
    <div
      className={`form-html [&_p]:m-0 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 ${linkClasses} ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
