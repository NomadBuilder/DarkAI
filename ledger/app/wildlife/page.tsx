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

export default function WildlifePage() {
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
        {/* Hero — same nav-to-content spacing as healthcare */}
        <section className="relative flex items-start justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-0 pb-16 md:pb-24 bg-white">
          <div className="max-w-5xl w-full text-center">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8 leading-tight"
            >
              Species, Rights & What We Stand to Lose
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto mb-8"
            >
              The government sold it as economic reform. In reality, it&apos;s an attack on endangered species, Indigenous rights, and the land and water we all depend on.
            </motion.p>
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-800 font-light italic border-l-4 border-amber-500 pl-6 py-2 text-left max-w-2xl mx-auto"
            >
              After years of neglect, endangered species in Ontario are facing their biggest threat in a generation.
            </motion.blockquote>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm text-gray-500 mt-4"
            >
              — Ontario Nature
            </motion.p>
          </div>
        </section>

        {/* The moment we're in */}
        <section className="px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              The moment we&apos;re in
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                Bill 5 — officially the <em>Protect Ontario by Unleashing our Economy Act, 2025</em> — has received Royal Assent. It is now law. What that means: the Endangered Species Act has been replaced with a weaker regime, &quot;special economic zones&quot; can exempt developers from the rules that protect our environment, and the first of those zones has already been declared in the Ring of Fire — on the doorstep of Indigenous nations who have not given free, prior and informed consent.
              </p>
              <p>
                This isn&apos;t progress. It&apos;s erasure. It&apos;s handing over our shared inheritance — species, wetlands, forests, watersheds — to a handful of proponents while the rest of us are left with the bill. Healthy forests and waters sustain all Ontarians. Bulldozing species protection doesn&apos;t &quot;unleash&quot; the economy; it unleashes more problems for our kids and for every community that depends on a living landscape.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What Bill 5 actually does */}
        <section className="px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-12 md:mb-16">
              What Bill 5 actually does
            </motion.h2>

            <div className="space-y-16 md:space-y-20">
              {/* Species */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  Species protection gutted
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed">
                  <p>
                    The <strong className="font-normal text-gray-900">Endangered Species Act, 2007</strong> is replaced by the <strong className="font-normal text-gray-900">Species Conservation Act, 2025</strong>. Listing species at risk is no longer mandatory — the government can choose not to list species that scientists say are endangered or threatened. Recovery strategies, government response statements, and management plans are repealed or stripped. Habitat is redefined in a way that leaves huge swaths of land and water outside protection. Permits no longer need to meet the same bar; the minister can issue them without satisfying the conditions that used to protect at-risk species.
                  </p>
                  <p>
                    The result: species that have clung to existence under the old law are now exposed. Polar bears, caribou, countless plants and animals that belong on this land — their fate is now more political than scientific. That&apos;s not conservation. That&apos;s a retreat from the promise we made to protect what we have left.
                  </p>
                </div>
              </motion.div>

              {/* Special economic zones */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  Special economic zones: a blank cheque for developers
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed">
                  <p>
                    The new <strong className="font-normal text-gray-900">Special Economic Zones Act, 2025</strong> lets the province designate areas and &quot;trusted proponents&quot; or &quot;designated projects&quot; that can be exempt from requirements under other Acts — including environmental rules and municipal by-laws. In practice: in those zones, the usual safeguards don&apos;t apply. The government has already declared the first special economic zone in the Ring of Fire.
                  </p>
                  <p>
                    So land that sustains wildlife, stores carbon, and holds cultural and treaty significance can be opened up without the same scrutiny. It&apos;s being sold as economic reform. In reality, it&apos;s a blank cheque to bulldoze lands and waters that belong to all of us — and to the species and nations who have no say in the deal.
                  </p>
                </div>
              </motion.div>

              {/* Indigenous rights */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  Indigenous rights at risk
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed">
                  <p>
                    Bill 5 has the potential to trample Indigenous rights. Free, prior and informed consent is not respected when special economic zones are imposed on territories and watersheds that Indigenous Peoples have stewarded for generations. Pushing the Ring of Fire as the first such zone — without proper consent — is a direct affront to those nations and to the promise of reconciliation.
                  </p>
                  <p>
                    Indigenous Peoples must be at the centre of decisions about sustainable economies and about protecting species and place. Bill 5 puts developers and government at the centre instead. That&apos;s not partnership. That&apos;s the same old pattern of decisions made elsewhere, with communities and rights-holders left to pick up the pieces.
                  </p>
                </div>
              </motion.div>

              {/* Other attacks */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  More giveaways: Ontario Place, mining, procurement
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed">
                  <p>
                    The bill doesn&apos;t stop there. It exempts the Ontario Place redevelopment from the normal public and environmental scrutiny under the Environmental Bill of Rights. It changes the Mining Act to prioritize &quot;the protection of Ontario&apos;s economy&quot; and to fast-track mining approvals. It restricts electricity and energy procurement in ways that lock in certain interests. And it extinguishes causes of action — meaning if you or your community are harmed by decisions made under this law, your ability to seek redress is severely limited.
                  </p>
                  <p>
                    Taken together, Bill 5 isn&apos;t a tweak. It&apos;s a fundamental shift: away from science, away from consent, away from accountability, and toward a model where a few benefit and the rest of us — and the land, water, and species we depend on — pay the price.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What we're losing */}
        <section className="px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-amber-50/60">
          <div className="max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              What we&apos;re losing
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                We&apos;re losing the legal backbone that made Ontario list species at risk, plan for their recovery, and protect their habitat. We&apos;re losing the expectation that major projects face environmental and democratic scrutiny. We&apos;re losing the promise that Indigenous Peoples will be full partners in decisions that affect their territories and rights.
              </p>
              <p>
                We&apos;re not just losing paperwork. We&apos;re losing the chance for caribou, polar bears, and countless other species to recover. We&apos;re losing wetlands that filter water and store carbon. We&apos;re losing the idea that the economy should work within the limits of the land — not the other way around. And we&apos;re passing that loss to the next generation, who will inherit a province that chose short-term deals over long-term care.
              </p>
              <p className="text-gray-900 font-medium">
                No matter how it&apos;s spun, bulldozing species protection doesn&apos;t unleash opportunity. It unleashes risk — for wildlife, for water, for communities, and for the future we claim to care about.
              </p>
            </motion.div>
          </div>
        </section>

        {/* We've stopped them before */}
        <section className="px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              We&apos;ve stopped them before
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
              <p>
                When the government tried to carve up the Greenbelt and hand it to connected developers, public pressure forced a reversal. People showed up. They wrote. They refused to accept that protected land was for sale. That reversal proved that bad policy can be pushed back — but only if we make it politically impossible to ignore.
              </p>
              <p>
                Bill 5 is already law. Reversing it will take the same kind of sustained, loud, and clear demand: from scientists, from First Nations, from municipalities, from ordinary people who believe that endangered species and Indigenous rights are not negotiable. Ontario Nature, the David Suzuki Foundation, and many others are calling for Premier Ford to cancel Bill 5 and end the attacks on species and accountability. They&apos;re inviting you to join.
              </p>
              <p className="text-blue-600 font-medium">
                This is a moment to mobilize. The question is whether we use it.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section — matches healthcare / water */}
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
                    Tell your MPP you want Bill 5 repealed and species protection and Indigenous rights restored
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

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} variant="bill5" />

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
