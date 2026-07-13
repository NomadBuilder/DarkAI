'use client'

import { useEffect } from 'react'

/** Single report for now — send visitors straight to the brief. */
export default function ReportsIndexRedirect() {
  useEffect(() => {
    window.location.replace('/reports/they-called-it-protection/')
  }, [])

  return (
    <main className="min-h-[50vh] flex items-center justify-center px-4">
      <p className="text-slate-600 font-light">
        <a href="/reports/they-called-it-protection/" className="underline underline-offset-2">
          Opening the report…
        </a>
      </p>
    </main>
  )
}
