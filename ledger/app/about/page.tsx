'use client'

import TopNavigation from '@/components/TopNavigation'
import MethodologyDrawer from '@/components/MethodologyDrawer'
import DataSourcesDrawer from '@/components/DataSourcesDrawer'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AboutPage() {
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
                  About Dark AI
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto">
                  Making hidden patterns visible for the public good
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
                  Our Philosophy
                </h2>
                <div className="space-y-4 text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  <p>
                    Dark AI believes that information should be accessible, transparent, and actionable. When data is buried in spreadsheets, hidden in complex systems, or obscured by technical barriers, important patterns remain invisible — and accountability becomes impossible.
                  </p>
                  <p>
                    We build tools and visualizations that reveal what the data actually shows, not what we want it to show. Our methodology prioritizes transparency: we use only publicly available sources, document our process, and clearly distinguish between raw data and our interpretation.
                  </p>
                  <p>
                    The goal is not to tell you what to think, but to give you the tools to see what&apos;s actually happening — so that citizens, journalists, researchers, and policymakers can make informed decisions based on evidence, not assumptions.
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
                    Every project we build follows the same core principles:
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4 text-base md:text-lg text-gray-700 font-light">
                    <li><strong className="font-normal">Public sources only</strong> — We use data that anyone can access and verify themselves</li>
                    <li><strong className="font-normal">Transparent process</strong> — Our methodology is documented and open to scrutiny</li>
                    <li><strong className="font-normal">Clear distinction</strong> — We separate source data from our interpretation, so you can see both</li>
                    <li><strong className="font-normal">No hidden agendas</strong> — We let the data speak for itself, providing context but not spin</li>
                    <li><strong className="font-normal">Accessibility</strong> — We make complex information understandable without dumbing it down</li>
                  </ul>
                  <p className="pt-4">
                    This approach applies whether we&apos;re mapping public spending, investigating infrastructure networks, or analyzing policy impacts. The methodology is consistent; the subject matter varies.
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
                  The Public Good
                </h2>
                <div className="space-y-4 text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  <p>
                    Information is power — but only when it&apos;s accessible. When data is locked away, difficult to understand, or presented in ways that obscure rather than illuminate, it serves the interests of those who control it, not the public.
                  </p>
                  <p>
                    We believe that transparency is a public good. When citizens can see how their government spends money, when researchers can trace patterns in complex systems, when journalists can verify claims with accessible data — democracy works better.
                  </p>
                  <p>
                    The Ledger project applies this philosophy to public spending. By visualizing Ontario&apos;s Public Accounts data, we make it possible to see patterns that might otherwise go unnoticed: how spending shifts over time, how policy decisions correlate with changes in allocation, how public dollars flow to different types of institutions.
                  </p>
                  <p>
                    This isn&apos;t about advocacy or agenda — it&apos;s about making information accessible so that informed public discourse can happen. The data is public. The patterns are real. Our role is simply to make them visible.
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
                  Our Work
                </h2>
                <div className="space-y-4 text-base md:text-lg text-gray-300 font-light leading-relaxed">
                  <p>
                    Dark AI develops investigative tools and reports across multiple domains — from AI-enabled harms to public spending transparency. What unites our work is not the subject matter, but the approach: making hidden patterns visible through accessible visualization and transparent methodology.
                  </p>
                  <p>
                    Whether we&apos;re mapping infrastructure networks, analyzing policy impacts, or visualizing spending patterns, the goal is the same: give people the tools to see what&apos;s actually happening, so they can make informed decisions and hold power to account.
                  </p>
                  <p className="pt-4">
                    <a 
                      href="https://darkai.ca/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-400 underline font-light"
                    >
                      Learn more about Dark AI&apos;s work →
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
                  Contact Us
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto">
                  Have questions, suggestions, or want to report an issue? We&apos;d love to hear from you.
                </p>
              </div>
            </motion.div>

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
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-xs md:text-sm text-gray-500 font-light text-center">
                  We respect your privacy. Your information will only be used to respond to your inquiry.
                </p>
              </form>
            </motion.div>
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
