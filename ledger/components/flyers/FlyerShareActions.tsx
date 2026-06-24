'use client'

import { useCallback, useState } from 'react'
import { printFlyerSheet } from '@/lib/print-flyer'
import {
  facebookShareUrl,
  flyerPdfFilename,
  flyerPdfPath,
  flyerPublicUrl,
} from '@/lib/flyer-share'

type Props = {
  slug: string
}

const actionClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#f9e04c]/25 bg-[#f9e04c]/10 px-3 py-2 text-sm font-medium text-[#f9e04c] hover:bg-[#f9e04c]/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f9e04c]'

export default function FlyerShareActions({ slug }: Props) {
  const [copied, setCopied] = useState(false)
  const pageUrl = flyerPublicUrl(slug)
  const pdfPath = flyerPdfPath(slug)

  const handlePrint = () => printFlyerSheet()

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', pageUrl)
    }
  }, [pageUrl])

  return (
    <div className="flyer-no-print mx-auto w-full max-w-[8.5in]">
      <p className="mb-2 text-center text-xs uppercase tracking-[0.25em] text-[#f9e04c]/50">Share this flyer</p>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <a
          href={pdfPath}
          download={flyerPdfFilename(slug)}
          className={actionClass}
        >
          <PdfIcon />
          PDF
        </a>
        <button type="button" onClick={handlePrint} className={actionClass}>
          <PrintIcon />
          Print
        </button>
        <a
          href={facebookShareUrl(pageUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClass}
        >
          <FacebookIcon />
          <span className="hidden sm:inline">Share on </span>Facebook
        </a>
        <button type="button" onClick={handleCopyLink} className={actionClass}>
          <LinkIcon />
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}

function PdfIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  )
}

function PrintIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm8.5 1.5L14.5 7H11V4.5zm-1 8a1 1 0 10-2 0v1.085a1.5 1.5 0 01-2.433 1.177l-.35-.35a1 1 0 00-1.414 1.414l.35.35A3.5 3.5 0 008.5 17.5V19a1 1 0 102 0v-1.415a3.5 3.5 0 002.433-3.177l.35.35a1 1 0 001.414-1.414l-.35-.35A1.5 1.5 0 0011.5 13.5V12.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
    </svg>
  )
}
