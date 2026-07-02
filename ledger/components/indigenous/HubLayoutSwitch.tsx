'use client'

import { usePathname } from 'next/navigation'
import IndigenousHubShell from '@/components/indigenous/IndigenousHubShell'

export default function HubLayoutSwitch({
  children,
  lastUpdated,
}: {
  children: React.ReactNode
  lastUpdated?: string
}) {
  const pathname = usePathname() ?? ''
  const isPrintRoute = pathname.includes('/stand4land/print/')

  if (isPrintRoute) {
    return <>{children}</>
  }

  return <IndigenousHubShell lastUpdated={lastUpdated}>{children}</IndigenousHubShell>
}
