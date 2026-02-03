'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import { useState } from 'react'

export default function TermsPage() {
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-gray-500">Last updated: January 31, 2026</p>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto space-y-8 text-sm md:text-base text-gray-700 font-light leading-relaxed">
            <p>
              By accessing Protect Ontario, you agree to the terms below. If you do not agree, do not use the site.
            </p>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Purpose of the Site</h2>
              <p>
                Protect Ontario provides publicly sourced data and analysis for civic awareness and accountability.
                Content is provided for informational purposes only and does not constitute legal or professional advice.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Accuracy &amp; Limitations</h2>
              <p>
                We strive for accuracy and transparency, but errors or omissions may occur. Data may be incomplete,
                delayed, or subject to interpretation. Please verify critical information independently.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">User Contributions</h2>
              <p>
                If you submit information, you affirm it is accurate to the best of your knowledge and you have the
                right to share it. We may edit or decline submissions to maintain accuracy and relevance.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Intellectual Property</h2>
              <p>
                Unless otherwise noted, content on this site is the property of Protect Ontario and may not be
                reproduced without permission. Public documents and data retain their original copyrights.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">External Links</h2>
              <p>
                This site may link to external sources. We are not responsible for the content or policies of those sites.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the site indicates acceptance of the updates.
              </p>
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
