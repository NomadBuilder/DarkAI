'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import { useState } from 'react'

const logoAssets = [
  { label: 'Logo (primary)', href: '/logo-ledger-book.svg' },
  { label: 'Logo + text', href: '/logo-icon-text.svg' },
  { label: 'Text only', href: '/logo-text-only.svg' },
  { label: 'Minimal mark', href: '/logo-minimal.svg' },
  { label: 'Shield icon', href: '/shield-icon.png' },
]

export default function MediaKitPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)

  const handleMethodologyToggle = () => {
    if (showMethodology) {
      setShowMethodology(false)
    } else {
      setShowDataSources(false)
      setShowMethodology(true)
    }
  }

  const handleDataSourcesToggle = () => {
    if (showDataSources) {
      setShowDataSources(false)
    } else {
      setShowMethodology(false)
      setShowDataSources(true)
    }
  }

  return (
    <div className="relative">
      <TopNavigation
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-20 sm:pt-24">
        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
              Media Kit
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              Logos, mission, contact information, and quick facts for journalists and partners.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4">Mission</h2>
              <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed">
                Protect Ontario is a public‑accountability project that tracks provincial spending, legislation,
                and policy impacts — turning complex public records into clear, actionable insights.
              </p>
              <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed mt-3">
                We use public sources, transparent methodology, and clear separation between source data and interpretation.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4">Quick Facts</h2>
              <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 font-light leading-relaxed">
                <li><strong className="font-normal">Focus:</strong> Public spending, healthcare privatization, Greenbelt, water, wildlife &amp; Indigenous rights</li>
                <li><strong className="font-normal">Sources:</strong> Ontario Public Accounts, legislation, Auditor General, public research</li>
                <li><strong className="font-normal">Coverage:</strong> Ontario (2018–2024 fiscal years)</li>
                <li><strong className="font-normal">Website:</strong> ProtectOnt.ca</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4">Contact</h2>
              <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed">
                Media inquiries and corrections can be sent via the Contact section on the About page.
              </p>
              <a
                href="/about"
                className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 underline font-light"
              >
                Contact Protect Ontario →
              </a>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4">Logos &amp; Assets</h2>
              <ul className="space-y-2 text-sm md:text-base text-gray-700 font-light leading-relaxed">
                {logoAssets.map((asset) => (
                  <li key={asset.href}>
                    <a
                      href={asset.href}
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {asset.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <MethodologyDrawer
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />

      <DataSourcesDrawer
        isOpen={showDataSources}
        onClose={() => setShowDataSources(false)}
      />
    </div>
  )
}
