'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import MPPContactModal from '../../components/MPPContactModal'
import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

export default function GreenbeltPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <div className="relative z-10 pt-28 sm:pt-32">
        {/* Hero */}
        <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 md:px-8 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-slate-50/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
          <div className="relative max-w-5xl w-full text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm sm:text-base uppercase tracking-widest text-emerald-700 font-medium mb-4 md:mb-6"
            >
              Ontario · 2022–2025
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8 leading-tight"
            >
              The Greenbelt: Land Swap, Developers & a Criminal Probe
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto mb-10"
            >
              The government removed 7,400 acres of protected land for development. The process was biased, secretive, and is now under RCMP criminal investigation. Public pressure forced a reversal — but the scandal isn&apos;t over.
            </motion.p>
            {/* Key stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-14"
            >
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-emerald-800 tabular-nums">7,400</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">acres removed</span>
              </div>
              <div className="w-px h-12 bg-emerald-200/80 hidden sm:block self-center" />
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-emerald-800 tabular-nums">$8.28B</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">estimated value</span>
              </div>
              <div className="w-px h-12 bg-emerald-200/80 hidden sm:block self-center" />
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-emerald-800 tabular-nums">12 of 15</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">sites developer-requested</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What happened */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-80" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12 flex items-center gap-3">
              <span className="inline-block w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600" aria-hidden>1</span>
              What happened
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                In late 2022, the Ford government removed 7,400 acres from the Greenbelt — the protected band of farmland, forests, and wetlands that rings the Greater Golden Horseshoe — and opened it for housing development. The move was framed as necessary to build more homes. The Auditor General and integrity commissioner found otherwise: the process was &quot;biased and lacked transparency,&quot; favoured a handful of developers who had lobbied for the removals, and proceeded without evidence that Greenbelt land was needed to meet housing targets. Municipalities and the public were not meaningfully consulted.
              </p>
              <div className="rounded-xl bg-white/80 border border-emerald-100 p-6 sm:p-8 shadow-sm">
                <p className="text-emerald-800 font-medium text-lg sm:text-xl mb-1">$8.28 billion</p>
                <p className="text-gray-600 text-base sm:text-lg">Estimated value of the land removed — much of it in the hands of developers who had acquired it knowing it was protected, with direct access to government decision-makers in the months before the decision.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Auditor General & developer ties */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12 flex items-center gap-3">
              <span className="inline-block w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700" aria-hidden>2</span>
              What the Auditor General found
            </motion.h2>
            <motion.blockquote
              {...fadeIn}
              className="border-l-4 border-amber-500 pl-6 py-2 my-8 text-xl sm:text-2xl text-gray-800 font-light italic"
            >
              The selection of which lands to remove was &quot;biased and lacked transparency.&quot;
            </motion.blockquote>
            <motion.div {...fadeIn} className="flex flex-wrap gap-4 mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-amber-800 font-medium">
                <span className="text-2xl tabular-nums">12 of 15</span>
                <span className="text-sm font-normal text-amber-700">sites requested by developers</span>
              </div>
            </motion.div>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                Of 15 sites removed from the Greenbelt, 12 had been requested by developers in the months before the decision. Senior political staff drove the process; housing need was not the basis for the choices. The government had received advice that there was enough land already designated for development to meet housing goals — so carving up the Greenbelt was not necessary. It did it anyway.
              </p>
              <p>
                The integrity commissioner later found that the former housing minister had violated ethics rules in his dealings with developers. The picture that emerged was not of evidence-based policy but of privileged access and a process built to deliver a windfall to a small group of landowners.
              </p>
            </motion.div>
          </div>
        </section>

        {/* RCMP investigation */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-slate-300 to-slate-500 opacity-60" />
          <div className="max-w-4xl mx-auto pr-4 sm:pr-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12 flex items-center gap-3">
              <span className="inline-block w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700" aria-hidden>3</span>
              The RCMP criminal investigation
            </motion.h2>
            <motion.div {...fadeIn} className="rounded-xl bg-slate-800 text-white p-6 sm:p-8 mb-8 shadow-lg">
              <p className="text-sm uppercase tracking-wider text-slate-300 mb-2">Status</p>
              <p className="text-xl sm:text-2xl font-light">Criminal investigation ongoing</p>
              <p className="text-slate-400 text-base mt-2">No charges laid — provincial land-use decision under federal criminal probe</p>
            </motion.div>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                The RCMP launched a criminal investigation into the Greenbelt land swap. Detectives have been interviewing current and former Progressive Conservative aides as witnesses in connection with the 2022 decision. The premier has said his government will &quot;fully co-operate&quot; and has &quot;nothing to hide.&quot; As of early 2025, the investigation was ongoing. No charges have been laid — but the fact that a provincial land-use decision is the subject of a federal criminal probe underscores how seriously the process has been called into question.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Reversal — we stopped them */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12 flex items-center gap-3">
              <span className="inline-block w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700" aria-hidden>4</span>
              We stopped them — this time
            </motion.h2>
            <motion.div {...fadeIn} className="rounded-xl bg-emerald-50/80 border border-emerald-100 p-6 sm:p-8 mb-8">
              <p className="text-lg sm:text-xl text-emerald-900 font-light italic">
                &quot;It was a rare, full retreat — and it happened because people showed up, wrote, and refused to accept that protected land was for sale.&quot;
              </p>
            </motion.div>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
              <p>
                Faced with overwhelming public outrage, reporting from journalists, and the findings of the Auditor General and integrity commissioner, the government reversed course. In September 2023 it announced it would restore the 7,400 acres to the Greenbelt and would not remove land in the future.
              </p>
              <p>
                The reversal proved that bad policy can be pushed back when it becomes politically impossible to ignore. It also left a lasting stain: the RCMP investigation continues, and the same government has since pursued other contentious policies — from Bill 5 to Ontario Place — with the same pattern of favouring well-connected proponents and sidestepping accountability. The Greenbelt story is both a warning and a reminder: public pressure works, but it has to be sustained.
              </p>
              <p className="text-blue-600 font-medium text-xl sm:text-2xl mt-8">
                The question is whether we keep using it.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-16 md:pt-24">
          <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 md:px-8 bg-slate-900 text-white py-16 md:py-24">
            <div className="max-w-5xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-center space-y-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300">
                    Contact your provincial representative
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto">
                    Hold the government to account: demand transparency, no favours for developers, and protection for the Greenbelt and other shared resources
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-block px-6 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5 md:py-6 bg-white text-slate-900 text-base sm:text-lg md:text-xl lg:text-2xl font-light rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl active:scale-95 touch-manipulation min-h-[48px] sm:min-h-0 text-center"
                  >
                    Contact Your MPP
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="greenbelt" />

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
