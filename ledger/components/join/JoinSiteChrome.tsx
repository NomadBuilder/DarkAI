'use client'

import TopNavigation from '@/components/TopNavigation'

/** Site header on /join — white nav so logo and links read clearly */
export default function JoinSiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavigation />
      {children}
    </>
  )
}
