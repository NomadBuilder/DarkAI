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

export default function IndigenousRightsPage() {
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
        <div className="relative pb-16 md:pb-24 bg-gradient-to-b from-stone-100 via-stone-50/95 to-stone-50">
          <section className="relative flex items-start justify-center px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.12),transparent)]" />
            <div className="relative max-w-5xl w-full text-center">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs sm:text-sm uppercase tracking-[0.35em] text-teal-800/80 mb-4 font-medium"
              >
                Indigenous &amp; First Nations rights
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8 leading-tight"
              >
                Consent, treaties, and who decides on the land
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto mb-10"
              >
                Ontario&apos;s push for mines, special economic zones, and weakened environmental rules is landing on
                Indigenous territories and watersheds—often without free, prior and informed consent. Treaty rights and
                self-determination are not optional extras in provincial law.
                <InlineCitation href="#source-1" label="1" />
                <InlineCitation href="#source-2" label="2" />
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-14"
              >
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-teal-800 tabular-nums">FPIC</span>
                  <span className="block text-sm sm:text-base text-gray-500 mt-1">
                    free, prior &amp; informed consent
                    <InlineCitation href="#source-3" label="3" />
                  </span>
                </div>
                <div className="w-px h-12 bg-stone-300/80 hidden sm:block self-center" />
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-stone-800 tabular-nums">Ring of Fire</span>
                  <span className="block text-sm sm:text-base text-gray-500 mt-1">
                    first special economic zone
                    <InlineCitation href="#source-4" label="4" />
                  </span>
                </div>
                <div className="w-px h-12 bg-stone-300/80 hidden sm:block self-center" />
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-teal-900 tabular-nums">Bill 5</span>
                  <span className="block text-sm sm:text-base text-gray-500 mt-1">
                    weakens oversight &amp; redress
                    <InlineCitation href="#source-1" label="1" />
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-teal-500 to-teal-700 opacity-90" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12 flex items-center gap-3">
              <span className="inline-block w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700" aria-hidden>
                1
              </span>
              What&apos;s at stake
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                First Nations, Métis, and Inuit peoples in Ontario hold inherent rights, treaty rights, and—in many
                regions—jurisdiction over lands and waters that predate the province. When the government declares special
                economic zones, fast-tracks mining, or weakens species and environmental law, those decisions land on
                nations who were not equal partners in the process.
              </p>
              <p>
                The United Nations Declaration on the Rights of Indigenous Peoples (UNDRIP) affirms that states shall
                consult and cooperate in good faith to obtain free, prior and informed consent before adopting measures
                that affect Indigenous peoples&apos; rights.
                <InlineCitation href="#source-3" label="3" />
                Ontario has committed to implementing UNDRIP—but Bill 5 and the Ring of Fire zone push in the opposite
                direction.
                <InlineCitation href="#source-2" label="2" />
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-teal-500 to-teal-700 opacity-70 z-10" />
          <div className="max-w-4xl mx-auto pr-4 sm:pr-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              How provincial policy is overriding rights
            </motion.h2>
            <div className="space-y-14 md:space-y-20">
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-teal-200">
                  Special economic zones without consent
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    Bill 5&apos;s <strong className="font-normal text-gray-900">Special Economic Zones Act, 2025</strong>{' '}
                    lets the province designate areas where &quot;trusted proponents&quot; and &quot;designated projects&quot; can be
                    exempt from rules that normally apply—including environmental and municipal requirements. The first zone
                    was declared in the Ring of Fire, a region of peatlands and rivers on Treaty 9 territory where several
                    First Nations have not consented to development at the pace or scale proposed.
                    <InlineCitation href="#source-4" label="4" />
                    <InlineCitation href="#source-5" label="5" />
                  </p>
                  <div className="rounded-xl bg-teal-50/80 border border-teal-100 p-6 sm:p-8 shadow-sm">
                    <p className="text-teal-900 font-medium text-lg mb-1">Economic zones are not empty land.</p>
                    <p className="text-gray-700 text-base">
                      They are home territories, traplines, burial sites, and watersheds. Treating them as blank slate for
                      extraction repeats a colonial pattern: decide elsewhere, develop anyway, offer consultation after the
                      fact.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-teal-200">
                  Mining, infrastructure, and the duty to consult
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    The Ring of Fire is promoted as a critical minerals hub. Building roads and mines across the Far North
                    affects water flowing south, caribou habitat, and communities that depend on both. The Crown has a legal
                    duty to consult when Indigenous rights may be affected—but consultation is not the same as consent, and
                    it is not a veto when the province has already decided to proceed.
                  </p>
                  <p>
                    Bill 5 also changes the <strong className="font-normal text-gray-900">Mining Act</strong> to prioritize
                    protecting &quot;Ontario&apos;s economy&quot; and to speed approvals—raising the risk that rights-holders are
                    sidelined when timelines and profits come first.
                    <InlineCitation href="#source-1" label="1" />
                  </p>
                </div>
              </motion.div>

              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-teal-200">
                  Closing the door on accountability
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    Bill 5 extinguishes certain causes of action—limiting the ability of communities to seek redress when
                    harmed by decisions made under the new regime. Combined with weaker species protection and exemptions
                    from the Environmental Bill of Rights for projects like Ontario Place, the message is clear: fewer
                    checks, less recourse, more power concentrated in Queen&apos;s Park and corporate boardrooms.
                  </p>
                  <p>
                    For more on species law and environmental rollbacks, see our{' '}
                    <Link href="/wildlife" className="text-teal-800 underline underline-offset-2 hover:text-teal-900">
                      wildlife &amp; species page
                    </Link>
                    .
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-teal-500 to-teal-700 opacity-90" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              What respect looks like
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                Indigenous nations are not stakeholders in someone else&apos;s mining plan—they are governments and rights-holders
                with their own laws and stewardship responsibilities. Respect means funding community-led environmental
                monitoring, honouring treaties, stopping projects without consent, and repealing laws that bypass Indigenous
                jurisdiction.
              </p>
              <motion.div {...fadeIn} className="rounded-xl bg-white/80 border border-teal-100 p-6 sm:p-8 shadow-sm">
                <p className="text-teal-900 font-medium text-lg sm:text-xl mb-1">Solidarity is not a slogan.</p>
                <p className="text-gray-700 text-base sm:text-lg">
                  It means showing up for indigenous-led campaigns, amplifying their demands in your riding, and refusing to treat
                  reconciliation as a press release while the bulldozers are already scheduled.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-teal-500 to-teal-700 opacity-70 z-10" />
          <div className="max-w-4xl mx-auto pr-4 sm:pr-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              Ways to stand with rights-holders
            </motion.h2>
            <motion.ul {...fadeIn} className="space-y-5 text-lg text-gray-700 font-light leading-relaxed">
              <li className="flex gap-3">
                <span className="text-teal-700 font-medium shrink-0">→</span>
                <span>
                  <Link href="/take-action" className="text-teal-800 underline underline-offset-2 hover:text-teal-900">
                    Contact your MPP
                  </Link>{' '}
                  and demand repeal of Bill 5, an end to special economic zones without consent, and full implementation of
                  UNDRIP in provincial law.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-700 font-medium shrink-0">→</span>
                <span>
                  Sign petitions and follow campaigns from organizations standing with Indigenous-led opposition—including{' '}
                  <a
                    href="https://ontarionature.org/bill-5-a-moment-to-mobilize-for-nature-in-ontario-blog/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-800 underline underline-offset-2 hover:text-teal-900"
                  >
                    Ontario Nature
                  </a>{' '}
                  and the{' '}
                  <a
                    href="https://davidsuzuki.org/action/repealbill5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-800 underline underline-offset-2 hover:text-teal-900"
                  >
                    David Suzuki Foundation
                  </a>
                  .
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-700 font-medium shrink-0">→</span>
                <span>
                  <Link href="/stand4land/" className="text-teal-800 underline underline-offset-2 hover:text-teal-900">
                    Standing for the Land
                  </Link>{' '}
                  — discover and support Indigenous-led campaigns across Canada through official channels.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-700 font-medium shrink-0">→</span>
                <span>
                  <Link href="/protests#event-list" className="text-teal-800 underline underline-offset-2 hover:text-teal-900">
                    Join protests and rallies
                  </Link>{' '}
                  where Indigenous nations and allies are making the demand visible.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-700 font-medium shrink-0">→</span>
                <span>
                  Listen to and share statements from affected First Nations on Ring of Fire and northern development—follow
                  their leadership, not provincial talking points.
                </span>
              </li>
            </motion.ul>
          </div>
        </section>

        <section id="sources" className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4">Sources &amp; citations</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-700 font-light leading-relaxed">
              <li id="source-1">
                <span className="mr-2 text-slate-500">1.</span>
                <a
                  href="https://www.ola.org/en/legislative-business/bills/parliament-44/session-1/bill-5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Legislative Assembly of Ontario: Bill 5 — Protect Ontario by Unleashing our Economy Act, 2025
                </a>
              </li>
              <li id="source-2">
                <span className="mr-2 text-slate-500">2.</span>
                <a
                  href="https://www.ontario.ca/page/ontarios-action-plan-undrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  Government of Ontario: Ontario&apos;s Action Plan on UNDRIP
                </a>
              </li>
              <li id="source-3">
                <span className="mr-2 text-slate-500">3.</span>
                <a
                  href="https://www.un.org/development/desa/indigenouspeoples/declaration-on-the-rights-of-indigenous-peoples.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  United Nations: Declaration on the Rights of Indigenous Peoples (UNDRIP)
                </a>
              </li>
              <li id="source-4">
                <span className="mr-2 text-slate-500">4.</span>
                <a
                  href="https://www.cbc.ca/news/canada/toronto/ring-of-fire-special-economic-zone-ontario-1.7553352"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  CBC: Ontario to make Ring of Fire a special economic zone
                </a>
              </li>
              <li id="source-5">
                <span className="mr-2 text-slate-500">5.</span>
                <a
                  href="https://www.thecanadianencyclopedia.ca/en/article/ring-of-fire"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  The Canadian Encyclopedia: Ring of Fire
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section className="pt-16 md:pt-24">
          <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 md:px-8 bg-[#2E4A6B] text-white pt-16 pb-24 md:pt-24 md:pb-32">
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
                    Tell your MPP that treaty rights and free, prior and informed consent must come before special economic
                    zones and fast-tracked mining
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

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="indigenous" />

      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />

      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
