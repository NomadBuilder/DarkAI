'use client'

import { useEffect } from 'react'
import { SOCIAL_POST_IDEAS, buildShareableCaption } from '@/lib/social-post-ideas'
import { renderSocialGraphicDataUrl } from '@/lib/render-social-graphic'

declare global {
  interface Window {
    __SOCIAL_EXPORT__?: { dataUrl: string; caption: string; id: string }
  }
}

export default function SocialExportClient({ id }: { id: string }) {
  useEffect(() => {
    const idea = SOCIAL_POST_IDEAS.find((i) => i.id === id)
    if (!idea) {
      document.body.dataset.exportError = 'not-found'
      return
    }

    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    Promise.resolve(fontsReady)
      .then(() =>
        Promise.all([
          document.fonts?.load?.('400 32px Inter') ?? Promise.resolve(),
          document.fonts?.load?.('800 32px "Arial Black"') ?? Promise.resolve(),
        ])
      )
      .then(() => renderSocialGraphicDataUrl(idea))
      .then((dataUrl) => {
        window.__SOCIAL_EXPORT__ = {
          dataUrl,
          caption: buildShareableCaption(idea),
          id: idea.id,
        }
        document.body.dataset.exportReady = 'true'
      })
      .catch(() => {
        document.body.dataset.exportError = 'render-failed'
      })
  }, [id])

  return null
}
