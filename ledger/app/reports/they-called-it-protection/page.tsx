'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import TopNavigation from '../../../components/TopNavigation'

const REPORT_SRC = '/report-assets/they-called-it-protection.html'

export default function TheyCalledItProtectionPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(2400)

  const resize = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc?.body) return
      const next = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 1200)
      setHeight(next)
    } catch {
      /* cross-origin should not happen for same-origin asset */
    }
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const onLoad = () => {
      resize()
      // Charts/fonts can change height after first paint
      const t1 = window.setTimeout(resize, 400)
      const t2 = window.setTimeout(resize, 1200)
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
      }
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
    <div className="min-h-screen bg-white">
      <TopNavigation />
      <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <button
          type="button"
          onClick={() => {
            const win = iframeRef.current?.contentWindow
            if (win) win.print()
            else window.print()
          }}
          className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800"
        >
          Print / Save PDF
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src={REPORT_SRC}
        title="They sold it as protection"
        className="block w-full border-0"
        style={{ height }}
      />
    </div>
  )
}
