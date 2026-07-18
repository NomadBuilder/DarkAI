'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import TopNavigation from '../../../components/TopNavigation'

const REPORT_SRC = '/report-assets/mpp-expense-disclosure.html'
const HERO_TOP = '#5c4899'

export default function MppExpenseDisclosurePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(2800)

  const resize = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc?.body) return
      const next = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 1400)
      setHeight(next)
    } catch {
      /* same-origin asset */
    }
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const onLoad = () => {
      resize()
      window.setTimeout(resize, 400)
      window.setTimeout(resize, 1200)
      window.setTimeout(resize, 2500)
    }

    iframe.addEventListener('load', onLoad)
    if (iframe.contentDocument?.readyState === 'complete') onLoad()
    window.addEventListener('resize', resize)
    return () => {
      iframe.removeEventListener('load', onLoad)
      window.removeEventListener('resize', resize)
    }
  }, [resize])

  return (
    <div className="min-h-screen" style={{ background: HERO_TOP }}>
      <TopNavigation navOnDark />
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            const win = iframeRef.current?.contentWindow
            if (win) win.print()
            else window.print()
          }}
          className="absolute top-3 right-4 z-10 text-xs font-medium text-white/70 underline underline-offset-2 hover:text-white"
        >
          Print / Save PDF
        </button>
        <iframe
          ref={iframeRef}
          src={REPORT_SRC}
          title="What MPP expense disclosure actually shows"
          className="block w-full border-0"
          style={{ height, background: HERO_TOP }}
        />
      </div>
    </div>
  )
}
