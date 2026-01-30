'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

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

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    // In a real implementation, you would send this to your backend/API
    // For now, we'll simulate a submission
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically send to your backend:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })
      
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (error) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <TopNavigation 
        onDataSourcesClick={handleDataSourcesToggle}
        onMethodologyClick={handleMethodologyToggle}
      />
      <div className="relative z-10 pt-28 sm:pt-32">
        {/* About Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-24 md:py-32">
          <div className="max-w-4xl w-full space-y-12 md:space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
                  About Protect Ontario
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto">
                  Ontario&apos;s quiet privatization (Americanization) — and the data that makes it visible
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6">
                  What Protect Ontario Is
                </h2>
                <div className="space-y-4 text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  <p>
                    Protect Ontario is a project that tracks and visualizes what&apos;s happening to public services and accountability in Ontario under the Ford government. When spending shifts from public to private hands, when legislation opens the door to corporate control of water or species protection, when land and accountability are traded for developer access — the patterns are often buried in spreadsheets, legalese, or press releases. Protect Ontario makes those patterns visible.
                  </p>
                  <p>
                    We cover healthcare (private staffing agencies, for-profit clinics, hospital deficits), water (Bill 60 and the path to corporate control), the Greenbelt scandal and RCMP investigation, and Bill 5&apos;s impact on species and Indigenous rights. We use only publicly available data and sources, document our methodology, and clearly distinguish between raw data and our interpretation. The goal is not to tell you what to think, but to give you the tools to see what&apos;s actually happening — so you can make informed decisions and hold power to account.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6">
                  Methodology
                </h2>
                <div className="space-y-4 text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  <p>
                    Protect Ontario follows a few core principles:
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4 text-base md:text-lg text-gray-700 font-light">
                    <li><strong className="font-normal">Public sources only</strong> — We use data and reports that anyone can access and verify (Ontario Public Accounts, Auditor General reports, legislation, news)</li>
                    <li><strong className="font-normal">Transparent process</strong> — Our methodology and data sources are documented and open to scrutiny</li>
                    <li><strong className="font-normal">Clear distinction</strong> — We separate source data from our interpretation, so you can see both</li>
                    <li><strong className="font-normal">Accessibility</strong> — We make complex information understandable without dumbing it down</li>
                  </ul>
                  <p className="pt-4">
                    You can open <strong className="font-normal">Data Sources</strong> and <strong className="font-normal">Methodology</strong> from the nav to see the full details.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6">
                  Why It Matters
                </h2>
                <div className="space-y-4 text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  <p>
                    Information is power — but only when it&apos;s accessible. When spending shifts, when legislation changes, when accountability is weakened, the details are often buried in spreadsheets and legalese. Protect Ontario makes those details visible so citizens, journalists, and researchers can see what&apos;s actually happening and hold power to account.
                  </p>
                  <p>
                    Transparency is a public good. The data we use is public. The patterns are real. Our role is to make them visible so that informed public discourse — and action — can happen.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6">
                  Behind Protect Ontario
                </h2>
                <div className="space-y-4 text-base md:text-lg text-gray-300 font-light leading-relaxed">
                  <p>
                    Protect Ontario is a project from <a href="https://ProtectOnt.ca/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">ProtectOnt.ca</a>, focused on making hidden patterns visible — from public spending and policy impacts to accountability gaps. Transparent methodology, public sources only, and a focus on what the data actually shows.
                  </p>
                  <p className="pt-4">
                    <a 
                      href="https://ProtectOnt.ca/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline font-light"
                    >
                      ProtectOnt.ca →
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-white to-slate-50 py-24 md:py-32">
          <div className="max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6">
                  Contact
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto">
                  Questions about Protect Ontario, data corrections, or suggestions? Get in touch.
                </p>
              </div>
            </motion.div>

            {hasMounted ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm md:text-base font-light text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm md:text-base font-light text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm md:text-base font-light text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="question">General Question</option>
                    <option value="data-issue">Data Issue or Correction</option>
                    <option value="suggestion">Suggestion or Feedback</option>
                    <option value="media">Media Inquiry</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm md:text-base font-light text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Your message..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 text-green-800 text-sm md:text-base font-light">
                    Thank you! Your message has been sent. We&apos;ll get back to you as soon as possible.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 text-red-800 text-sm md:text-base font-light">
                    There was an error sending your message. Please try again or contact us directly.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 md:px-8 py-4 md:py-5 bg-slate-900 text-white rounded-lg text-base md:text-lg font-light hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isSubmitting ? 'Sending message' : 'Send message'}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-xs md:text-sm text-gray-500 font-light text-center">
                  We respect your privacy. Your information will only be used to respond to your inquiry.
                </p>
                </form>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg min-h-[420px]" aria-hidden="true" />
            )}
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
