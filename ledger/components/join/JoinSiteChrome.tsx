'use client'

import TopNavigation from '@/components/TopNavigation'

/** Site header on /join — purple nav bar to match campaign page */
export default function JoinSiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavigation navOnDark />
      {children}
    </>
  )
}
