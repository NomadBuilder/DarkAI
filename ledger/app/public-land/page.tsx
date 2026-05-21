'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import MPPContactModal from '../../components/MPPContactModal'
import InlineCitation from '../../components/InlineCitation'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

export default function PublicLandPage() {
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
      <div className="relative z-10">
        <div className="relative pb-16 md:pb-24 bg-gradient-to-b from-emerald-50 via-emerald-50/95 to-emerald-50/90">
          <section className="relative flex items-start justify-center px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent)]" />
            <div className="relative max-w-5xl w-full text-center">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs sm:text-sm uppercase tracking-[0.35em] text-emerald-800/80 mb-4 font-medium"
              >
                Public land
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8 leading-tight"
              >
                When protected land and public waterfront go up for grabs
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto mb-8"
              >
                Ontario Place is moving ahead now—a 95-year private spa lease on public waterfront—while the
                Greenbelt swap remains under RCMP investigation. Same playbook: public land, connected proponents,
                accountability sidelined.
                <InlineCitation href="#source-op-2" label="7" />
                <InlineCitation href="#source-gb-1" label="1" />
              </motion.p>
              <motion.nav
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
                className="flex flex-wrap justify-center gap-3 mb-10"
                aria-label="On this page"
              >
                <a
                  href="#ontario-place"
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-light bg-teal-800/10 text-teal-900 border border-teal-200/80 hover:bg-teal-800/15 transition-colors"
                >
                  Ontario Place &amp; Therme
                </a>
                <a
                  href="#greenbelt"
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-light bg-white/80 text-gray-700 border border-emerald-200/80 hover:bg-white transition-colors"
                >
                  Greenbelt scandal
                </a>
              </motion.nav>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12"
              >
                <div className="text-center min-w-[7rem]">
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-teal-800 tabular-nums">95 years</span>
                  <span className="block text-sm sm:text-base text-gray-500 mt-1">
                    Therme lease on public waterfront
                    <InlineCitation href="#source-op-2" label="7" />
                  </span>
                </div>
                <div className="w-px h-12 bg-emerald-200/80 hidden sm:block self-center" />
                <div className="text-center min-w-[7rem]">
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-teal-800 tabular-nums">~50%</span>
                  <span className="block text-sm sm:text-base text-gray-500 mt-1">
                    Footprint vs original spa plan
                    <InlineCitation href="#source-op-3" label="8" />
                  </span>
                </div>
                <div className="w-px h-12 bg-emerald-200/80 hidden sm:block self-center" />
                <div className="text-center min-w-[7rem]">
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-red-600 tabular-nums">7,400</span>
                  <span className="block text-sm sm:text-base text-gray-500 mt-1">
                    Greenbelt acres (reversed)
                    <InlineCitation href="#source-gb-1" label="1" />
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        <section className="relative px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-80" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6 md:mb-8">
              The pattern
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-5 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                Farmland, forests, wetlands, and waterfront are shared public assets—not parcels waiting for a private
                operator. Under the current provincial government, major land decisions have repeatedly favoured well-connected
                proponents: opaque processes, weak consultation, and deals that are nearly impossible to unwind once
                signed.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="ontario-place" className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white overflow-hidden scroll-mt-24">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-teal-400 to-emerald-600 opacity-80" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              {...fadeIn}
              className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-4 py-1.5 text-sm text-teal-900 font-light mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
              </span>
              Active fight — not reversed
            </motion.div>

            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-3">
              Ontario Place &amp; the Therme spa
            </motion.h2>
            <motion.p {...fadeIn} className="text-lg sm:text-xl text-teal-800 font-light mb-10 max-w-3xl">
              Public waterfront, private operator, 95-year lease—and less Environmental Bill of Rights scrutiny than
              comparably large projects elsewhere
            </motion.p>

            <motion.div
              {...fadeIn}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
            >
              {[
                { value: '95 years', label: 'Private lease term', cite: '7', href: '#source-op-2' },
                { value: 'Publicly owned', label: 'Waterfront land (province)', cite: '6', href: '#source-op-1' },
                { value: '~50% smaller', label: '2025 spa footprint vs original', cite: '8', href: '#source-op-3' },
                { value: 'Bill 5 carve-out', label: 'Reduced EBR participation', cite: '9', href: '#source-op-4' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-white p-5 sm:p-6 shadow-sm"
                >
                  <p className="text-2xl sm:text-3xl font-light text-teal-900 tabular-nums">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-2 font-light leading-snug">
                    {stat.label}
                    <InlineCitation href={stat.href} label={stat.cite} />
                  </p>
                </div>
              ))}
            </motion.div>

            <motion.div {...fadeIn} className="rounded-xl bg-slate-800 text-white p-6 sm:p-8 lg:p-10 mb-12 shadow-lg">
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-400 mb-6">The deal at a glance</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-medium text-teal-300/90 mb-1.5">Who owns the land</h4>
                    <p className="text-gray-300 font-light leading-relaxed">
                      Ontario Place remains{' '}
                      <strong className="text-white font-normal">provincially owned waterfront</strong> on Lake
                      Ontario—not a private parcel sold off, but public commons handed to a private operator for
                      generations.
                      <InlineCitation href="#source-op-1" label="6" />
                    </p>
                  </div>
                  <div className="border-t border-slate-600 pt-5">
                    <h4 className="text-sm font-medium text-teal-300/90 mb-1.5">Who runs the spa</h4>
                    <p className="text-gray-300 font-light leading-relaxed">
                      <strong className="text-white font-normal">Therme Canada</strong> would operate a large thermal
                      spa and waterpark under a <strong className="text-white font-normal">95-year lease</strong>—pools,
                      slides, saunas, and paid day passes on a site many Torontonians treat as public waterfront.
                      <InlineCitation href="#source-op-2" label="7" />
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-medium text-teal-300/90 mb-1.5">What stays public</h4>
                    <p className="text-gray-300 font-light leading-relaxed">
                      The province promotes rebuilt <strong className="text-white font-normal">free parkland</strong> on
                      the West Island—beaches, trails, and open space—alongside the commercial spa complex.
                      <InlineCitation href="#source-op-1" label="6" />
                    </p>
                  </div>
                  <div className="border-t border-slate-600 pt-5">
                    <h4 className="text-sm font-medium text-teal-300/90 mb-1.5">Why it still matters</h4>
                    <p className="text-gray-300 font-light leading-relaxed">
                      A generation-long private hold is hard to take back. Critics argue the public gets less waterfront
                      control and less recourse than the scale of the project deserves—especially with Bill 5 limiting
                      normal EBR scrutiny.
                      <InlineCitation href="#source-op-4" label="9" />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.h3 {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-900 mb-6">
              2025 redesign — smaller, still moving ahead
            </motion.h3>
            <motion.div
              {...fadeIn}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
            >
              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-6 sm:p-8">
                <p className="text-teal-900 font-medium text-lg mb-3">What changed in Therme&apos;s proposal</p>
                <ul className="space-y-3 text-base text-gray-700 font-light">
                  <li className="flex gap-3">
                    <span className="text-teal-700 shrink-0">→</span>
                    <span>
                      Roughly <strong className="font-normal text-gray-900">half the footprint</strong> of the original
                      plan, with lower building heights
                      <InlineCitation href="#source-op-3" label="8" />
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-teal-700 shrink-0">→</span>
                    <span>Thermal pools, slides, saunas—commercial attraction with paid day passes</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-teal-700 shrink-0">→</span>
                    <span>Province and Therme frame it as a compromise; opponents say the core lease structure is unchanged</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                <p className="text-gray-900 font-medium text-lg mb-3">What the government emphasizes</p>
                <ul className="space-y-3 text-base text-gray-700 font-light">
                  <li className="flex gap-3">
                    <span className="text-emerald-700 shrink-0">→</span>
                    <span>Final designs and &quot;world-class&quot; waterfront renewal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-700 shrink-0">→</span>
                    <span>Free public beaches, trails, and park areas alongside the spa</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-700 shrink-0">→</span>
                    <span>Jobs and tourism investment on underused public land</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4 font-light">
                  <a
                    href="https://www.ontario.ca/page/final-designs-ontario-place"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-800 underline underline-offset-2 hover:text-teal-900"
                  >
                    Ontario.ca: final designs
                  </a>
                  <InlineCitation href="#source-op-1" label="6" />
                </p>
              </div>
            </motion.div>

            <motion.h3 {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-900 mb-6 pb-2 border-b border-teal-200">
              Why opponents are fighting it
            </motion.h3>
            <motion.div
              {...fadeIn}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
            >
              {[
                {
                  title: 'Hard to unwind',
                  body: 'A 95-year lease locks in private control of waterfront for generations—far longer than most political cycles or council terms.',
                },
                {
                  title: 'Less public scrutiny',
                  body: 'Bill 5 exempts Ontario Place from the usual Environmental Bill of Rights participation requirements for comparably large projects.',
                },
                {
                  title: 'Same playbook',
                  body: 'Streamline first, consult later—the approach critics tie to the Greenbelt scandal, now applied to public waterfront.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:border-teal-200/80 transition-colors"
                >
                  <p className="text-teal-900 font-medium text-lg mb-2">{card.title}</p>
                  <p className="text-gray-600 font-light text-base leading-relaxed">{card.body}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              {...fadeIn}
              className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-6 sm:p-8 mb-10"
            >
              <p className="text-amber-950 font-medium text-lg sm:text-xl mb-2">Bill 5 and the Environmental Bill of Rights</p>
              <p className="text-gray-700 font-light text-base sm:text-lg leading-relaxed">
                Ontario Place redevelopment is carved out from the normal public environmental participation Ontarians
                expect under the Environmental Bill of Rights—less notice, less recourse than for similar-scale projects
                elsewhere.
                <InlineCitation href="#source-op-4" label="9" />
                {' '}For species protection, special economic zones, and Ring of Fire impacts, see{' '}
                <Link href="/wildlife" className="text-teal-800 underline underline-offset-2 hover:text-teal-900">
                  wildlife &amp; Bill 5
                </Link>
                ; for treaty rights and consent on northern development, see{' '}
                <Link href="/indigenous-rights" className="text-teal-800 underline underline-offset-2 hover:text-teal-900">
                  Indigenous rights
                </Link>
                .
              </p>
            </motion.div>

            <motion.blockquote
              {...fadeIn}
              className="border-l-4 border-teal-500 pl-6 py-2 text-xl sm:text-2xl text-gray-800 font-light italic mb-6"
            >
              Unlike the Greenbelt, this deal has not been reversed—it is still moving forward.
            </motion.blockquote>
            <motion.p {...fadeIn} className="text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
              That makes Ontario Place one of the most consequential live fights over public land in Ontario right now.
              Public pressure reversed the Greenbelt carve-out; whether the same happens here depends on whether
              Ontarians treat waterfront the way they treated protected countryside.
            </motion.p>
          </div>
        </section>

        <section id="greenbelt" className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 scroll-mt-24">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-amber-400 to-emerald-600 opacity-70" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.div
              {...fadeIn}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-sm text-emerald-900 font-light mb-6"
            >
              Reversed Sept. 2023 — RCMP probe continues
            </motion.div>
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4">
              The Greenbelt land swap
            </motion.h2>
            <motion.p {...fadeIn} className="text-lg text-emerald-800 font-light mb-10">
              Biased process, developer windfall, criminal investigation—and proof that public pressure can win
            </motion.p>

            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed mb-14">
              <p>
                In late 2022, the government moved to remove 7,400 acres from the Greenbelt—the protected band of
                farmland, forests, and wetlands around the Greater Golden Horseshoe—and open it for housing. The move
                was framed as necessary to build more homes. The Auditor General and integrity commissioner found
                otherwise: the process was &quot;biased and lacked transparency,&quot; favoured developers who had lobbied
                for the removals, and proceeded without evidence that Greenbelt land was needed to meet housing targets.
                <InlineCitation href="#source-gb-1" label="1" />
                <InlineCitation href="#source-gb-4" label="4" />
              </p>
              <div className="rounded-xl bg-emerald-50/80 border border-emerald-100 p-6 sm:p-8">
                <p className="text-emerald-800 font-medium text-lg sm:text-xl mb-1">$8.28 billion</p>
                <p className="text-gray-600 text-base sm:text-lg">
                  Estimated value of land removed—much of it held by developers who had acquired it while it was still
                  protected, with access to decision-makers before the swap was announced.
                </p>
              </div>
            </motion.div>

            <motion.h3 {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-900 mb-6 pb-2 border-b border-amber-200">
              What the Auditor General found
            </motion.h3>
            <motion.blockquote
              {...fadeIn}
              className="border-l-4 border-amber-500 pl-6 py-2 my-8 text-xl sm:text-2xl text-gray-800 font-light italic"
            >
              The selection of which lands to remove was &quot;biased and lacked transparency.&quot;
            </motion.blockquote>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed mb-14">
              <p>
                Of 15 sites removed, 12 had been requested by developers in the months before the decision. Senior political
                staff drove the process; housing need was not the basis for the choices. The government had advice that
                enough land was already designated for development—carving up the Greenbelt was not necessary.
                <InlineCitation href="#source-gb-1" label="1" />
              </p>
              <p>
                The integrity commissioner later found the former housing minister violated ethics rules in dealings
                with developers—not evidence-based policy, but privileged access built to deliver a windfall to a small
                group of landowners.
                <InlineCitation href="#source-gb-4" label="4" />
              </p>
            </motion.div>

            <motion.h3 {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-900 mb-6">
              RCMP criminal investigation
            </motion.h3>
            <motion.div {...fadeIn} className="rounded-xl bg-slate-800 text-white p-6 sm:p-8 mb-8 shadow-lg">
              <p className="text-sm uppercase tracking-wider text-slate-300 mb-2">Status</p>
              <p className="text-xl sm:text-2xl font-light">Criminal investigation ongoing</p>
              <p className="text-slate-400 text-base mt-2">No charges laid—as of early 2025, federal probe continues</p>
            </motion.div>
            <motion.p {...fadeIn} className="text-lg sm:text-xl text-gray-700 font-light leading-relaxed mb-14">
              The RCMP launched a criminal investigation into the Greenbelt land swap, interviewing current and former
              PC aides. A provincial land-use decision under federal criminal probe underscores how seriously the
              process has been questioned.
              <InlineCitation href="#source-gb-2" label="2" />
            </motion.p>

            <motion.h3 {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-900 mb-6">
              Reversed—but not resolved
            </motion.h3>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
              <p>
                Faced with public outrage, journalism, and AG findings, the government reversed course in September 2023
                and restored the 7,400 acres.
                <InlineCitation href="#source-gb-3" label="3" />
                <InlineCitation href="#source-gb-5" label="5" />
              </p>
              <p>
                That retreat mattered. It showed bad land policy can be beaten when it becomes politically impossible to
                ignore. It did not end the fight over who controls Ontario&apos;s land—only proved the public still has
                leverage when it uses it.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="sources" className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4">Sources &amp; citations</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-700 font-light leading-relaxed">
              <li id="source-gb-1">
                <span className="mr-2 text-slate-500">1.</span>
                <a
                  href="https://auditor.on.ca/en/content/specialreports/specialreports/Greenbelt_en.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Auditor General of Ontario: Special Report on Changes to the Greenbelt (2023)
                </a>
              </li>
              <li id="source-gb-2">
                <span className="mr-2 text-slate-500">2.</span>
                <a
                  href="https://www.thestar.com/politics/provincial/rcmp-launches-criminal-investigation-into-doug-ford-s-greenbelt-land-swap/article_f778e402-1c56-54c8-b6b3-1e212fe4d662.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  RCMP criminal investigation into Greenbelt land swap
                </a>
              </li>
              <li id="source-gb-3">
                <span className="mr-2 text-slate-500">3.</span>
                <a
                  href="https://www.cbc.ca/news/canada/toronto/ontario-greenbelt-reversal-1.6954872"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Ontario reverses Greenbelt land removal (2023)
                </a>
              </li>
              <li id="source-gb-4">
                <span className="mr-2 text-slate-500">4.</span>
                <a
                  href="https://oico.on.ca/web/default/files/public/Commissioners%20Reports/Report%20Re%20Minister%20Clark%20-%20August%2030%2C%202023.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Ontario Integrity Commissioner: Report re Minister Clark (Aug 30, 2023)
                </a>
              </li>
              <li id="source-gb-5">
                <span className="mr-2 text-slate-500">5.</span>
                <a
                  href="https://ero.ontario.ca/notice/019-7739"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Environmental Registry of Ontario: Proposal to return lands to the Greenbelt (2023)
                </a>
              </li>
              <li id="source-op-1">
                <span className="mr-2 text-slate-500">6.</span>
                <a
                  href="https://www.ontario.ca/page/final-designs-ontario-place"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Government of Ontario: Final designs for Ontario Place
                </a>
              </li>
              <li id="source-op-2">
                <span className="mr-2 text-slate-500">7.</span>
                <a
                  href="https://www.ctvnews.ca/toronto/politics/queens-park/article/ontario-place-final-designs-revealed/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  CTV News: Ontario Place final designs revealed
                </a>
              </li>
              <li id="source-op-3">
                <span className="mr-2 text-slate-500">8.</span>
                <a
                  href="https://www.torontotoday.ca/local/city-planning-development/therme-shows-design-ontario-place-water-park-10913115"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Toronto Today: Therme shows design of Ontario Place water park (2025)
                </a>
              </li>
              <li id="source-op-4">
                <span className="mr-2 text-slate-500">9.</span>
                <a
                  href="https://www.ola.org/en/legislative-business/bills/parliament-44/session-1/bill-5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Legislative Assembly of Ontario: Bill 5 — Protect Ontario by Unleashing our Economy Act, 2025
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section className="pt-16 md:pt-24">
          <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 md:px-8 bg-slate-900 text-white pt-16 pb-24 md:pt-24 md:pb-32">
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
                    Demand full public scrutiny for Ontario Place, no more developer favours on protected land, and
                    accountability while the Greenbelt probe continues
                  </p>
                  <button
                    type="button"
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

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="publicLand" />

      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />

      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
