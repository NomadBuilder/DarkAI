'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import { useState } from 'react'

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500">Last updated: January 31, 2026</p>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto space-y-8 text-sm md:text-base text-gray-700 font-light leading-relaxed">
            <p>
              Protect Ontario respects your privacy. This policy explains what we collect, how we use it,
              and the choices you have.
            </p>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="font-normal">Voluntary submissions:</strong> If you contact us, we collect the information you provide (e.g., name, email, message).</li>
                <li><strong className="font-normal">Basic analytics:</strong> We may collect aggregate usage data to understand site performance and improve content.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">How We Use Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To respond to inquiries and feedback.</li>
                <li>To improve the platform’s accuracy, usability, and relevance.</li>
                <li>To maintain site security and reliability.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Data Sharing</h2>
              <p>
                We do not sell or rent personal information. We may share information only when required
                by law or to protect the safety and integrity of the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Data Retention</h2>
              <p>
                We retain submissions only as long as necessary to respond or for legitimate operational needs.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Your Choices</h2>
              <p>
                You can request access, correction, or deletion of your personal information by contacting us
                via the Contact section on the About page.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-3">Changes to this Policy</h2>
              <p>
                We may update this policy from time to time. The “Last updated” date above reflects the latest revision.
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
