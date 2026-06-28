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
      <div className="relative z-10">
        {/* Hero — no padding-top on gradient; top spacing on inner content so gradient goes to top */}
        <section className="relative pb-16 md:pb-24 flex items-start justify-center px-4 sm:px-6 md:px-8 overflow-hidden bg-gradient-to-b from-amber-50/90 via-amber-50/60 to-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.08),transparent)]" />
          <div className="relative pt-20 sm:pt-24 max-w-5xl w-full text-center">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8 leading-tight"
            >
              Species, Rights &amp; What We Stand to Lose
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-3xl mx-auto mb-6"
            >
              This page covers two distinct policy fights in Ontario:{' '}
              <strong className="font-normal text-gray-800">Bill 5</strong> — sweeping rollbacks to species protection
              and environmental accountability — and{' '}
              <strong className="font-normal text-gray-800">Bill 75</strong> — new rules for dogs and cats used in
              research, taking effect January 1, 2027, with major loopholes still open.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base sm:text-lg text-gray-500 font-light max-w-2xl mx-auto mb-8"
            >
              Both are documented below with primary sources — legislation, regulations, and independent advocacy
              analysis.
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
              <InlineCitation href="#source-2" label="2" />
            </motion.p>
            {/* Key context strip — like greenbelt stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 mt-10"
            >
              <div className="text-center min-w-[7rem]">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-amber-700 tabular-nums">Bill 5</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">
                  species &amp; SEZs
                  <InlineCitation href="#source-1" label="1" />
                </span>
              </div>
              <div className="w-px h-12 bg-amber-200/80 hidden sm:block self-center" />
              <div className="text-center min-w-[7rem]">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-amber-800 tabular-nums">Bill 75</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">
                  research animals · Jan 2027
                  <InlineCitation href="#source-5" label="5" />
                </span>
              </div>
              <div className="w-px h-12 bg-amber-200/80 hidden sm:block self-center" />
              <div className="text-center min-w-[7rem]">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-amber-800 tabular-nums">Ring of Fire</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">
                  first special economic zone
                  <InlineCitation href="#source-4" label="4" />
                </span>
              </div>
              <div className="w-px h-12 bg-amber-200/80 hidden sm:block self-center" />
              <div className="text-center min-w-[7rem]">
                <span className="block text-2xl sm:text-3xl md:text-4xl font-light text-amber-700 tabular-nums">Pound to lab</span>
                <span className="block text-sm sm:text-base text-gray-500 mt-1">
                  pipeline not closed
                  <InlineCitation href="#source-6" label="6" />
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* On this page */}
        <section className="relative px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-xl sm:text-2xl font-light text-gray-900 mb-6">
              On this page
            </motion.h2>
            <motion.div {...fadeIn} className="grid gap-4 sm:grid-cols-2">
              <a
                href="#bill-5"
                className="rounded-xl border border-amber-100 bg-amber-50/40 p-5 sm:p-6 hover:border-amber-200 transition-colors group"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-amber-800 mb-2">Topic 1</p>
                <h3 className="text-lg sm:text-xl font-light text-gray-900 group-hover:text-amber-900">
                  Bill 5 — species, zones &amp; accountability
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                  Endangered species law replaced, special economic zones, Ring of Fire, Indigenous rights, Ontario Place
                  carve-outs.
                </p>
              </a>
              <a
                href="#bill-75"
                className="rounded-xl border border-amber-100 bg-amber-50/40 p-5 sm:p-6 hover:border-amber-200 transition-colors group"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-amber-800 mb-2">Topic 2</p>
                <h3 className="text-lg sm:text-xl font-light text-gray-900 group-hover:text-amber-900">
                  Bill 75 — dogs, cats &amp; research
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                  Final regulations under the Animals for Research Act — what they achieve, where loopholes remain, and
                  the pound-to-research pipeline.
                </p>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Section 1: Bill 5 — The moment we're in */}
        <section id="bill-5" className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden scroll-mt-20">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-90" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 md:mb-4">
              Bill 5: the moment we&apos;re in
            </motion.h2>
            <motion.p {...fadeIn} className="text-base sm:text-lg text-gray-500 font-light mb-8 md:mb-12 max-w-3xl">
              The government sold Bill 5 as economic reform. In reality, it weakens endangered species protection,
              creates special economic zones, and rolls back accountability — with direct consequences for Indigenous
              rights and the land and water we all depend on.
            </motion.p>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                Bill 5 — officially the <em>Protect Ontario by Unleashing our Economy Act, 2025</em> — has received Royal Assent. It is now law. What that means: the Endangered Species Act has been replaced with a weaker regime, &quot;special economic zones&quot; can exempt developers from the rules that protect our environment, and the first of those zones has already been declared in the Ring of Fire — on the doorstep of Indigenous nations who have not given free, prior and informed consent.
                <InlineCitation href="#source-1" label="1" />
              </p>
              <motion.div {...fadeIn} className="rounded-xl bg-white/80 border border-amber-100 p-6 sm:p-8 shadow-sm">
                <p className="text-amber-800 font-medium text-lg sm:text-xl mb-2">This isn&apos;t progress. It&apos;s erasure.</p>
                <p className="text-gray-700 text-base sm:text-lg">It&apos;s handing over our shared inheritance — species, wetlands, forests, watersheds — to a handful of proponents while the rest of us are left with the bill. Bulldozing species protection doesn&apos;t &quot;unleash&quot; the economy; it unleashes risk for our kids and for every community that depends on a living landscape.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: What Bill 5 actually does */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-70 z-10" />
          <div className="max-w-4xl mx-auto pr-4 sm:pr-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              What Bill 5 actually does
            </motion.h2>
            <div className="space-y-14 md:space-y-20">
              {/* Species — callout */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  Species protection gutted
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    The <strong className="font-normal text-gray-900">Endangered Species Act, 2007</strong> is replaced by the <strong className="font-normal text-gray-900">Species Conservation Act, 2025</strong>. Listing species at risk is no longer mandatory — the government can choose not to list species that scientists say are endangered or threatened. Recovery strategies, government response statements, and management plans are repealed or stripped. Habitat is redefined in a way that leaves huge swaths of land and water outside protection. Permits no longer need to meet the same bar; the minister can issue them without satisfying the conditions that used to protect at-risk species.
                  </p>
                  <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-6 sm:p-8 shadow-sm">
                    <p className="text-amber-900 font-medium text-lg mb-1">Their fate is now more political than scientific.</p>
                    <p className="text-gray-700 text-base">Polar bears, caribou, countless plants and animals that belong on this land — that&apos;s not conservation. That&apos;s a retreat from the promise we made to protect what we have left.</p>
                  </div>
                </div>
              </motion.div>

              {/* Special economic zones */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  Special economic zones: a blank cheque for developers
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    The new <strong className="font-normal text-gray-900">Special Economic Zones Act, 2025</strong> lets the province designate areas and &quot;trusted proponents&quot; or &quot;designated projects&quot; that can be exempt from requirements under other Acts — including environmental rules and municipal by-laws. In practice: in those zones, the usual safeguards don&apos;t apply. The government has already declared the first special economic zone in the Ring of Fire.
                  </p>
                  <p>
                    So land that sustains wildlife, stores carbon, and holds cultural and treaty significance can be opened up without the same scrutiny. It&apos;s being sold as economic reform. In reality, it&apos;s a blank cheque to bulldoze lands and waters that belong to all of us — and to the species and nations who have no say in the deal.
                  </p>
                </div>
              </motion.div>

              {/* Indigenous rights — callout */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  Indigenous rights at risk
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    Bill 5 has the potential to trample Indigenous rights. Free, prior and informed consent is not respected when special economic zones are imposed on territories and watersheds that Indigenous Peoples have stewarded for generations. Pushing the Ring of Fire as the first such zone — without proper consent — is a direct affront to those nations and to the promise of reconciliation.
                  </p>
                  <div className="rounded-xl bg-white border border-amber-200 p-6 sm:p-8 shadow-sm">
                    <p className="text-amber-800 font-medium text-lg mb-1">That&apos;s not partnership.</p>
                    <p className="text-gray-700 text-base">Indigenous Peoples must be at the centre of decisions about sustainable economies and about protecting species and place. Bill 5 puts developers and government at the centre instead — the same old pattern of decisions made elsewhere, with communities and rights-holders left to pick up the pieces.</p>
                  </div>
                </div>
              </motion.div>

              {/* Other attacks */}
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  More giveaways: Ontario Place, mining, procurement
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
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

        {/* Section 3: Bill 75 — Animals for Research Act */}
        <section id="bill-75" className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden scroll-mt-20">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-90" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 md:mb-4">
              Bill 75: dogs, cats &amp; animals used in research
            </motion.h2>
            <motion.p {...fadeIn} className="text-base sm:text-lg text-gray-500 font-light mb-8 md:mb-12 max-w-3xl">
              Bill 75 (Schedule 1 of the <em>Keeping Criminals Behind Bars Act, 2026</em>) amends Ontario&apos;s{' '}
              <em>Animals for Research Act</em>. Final regulations were published in 2026 and come into force on{' '}
              <strong className="font-normal text-gray-700">January 1, 2027</strong>.
              <InlineCitation href="#source-5" label="5" />
              {' '}After years of advocacy — including from Animal Alliance of Canada
              <InlineCitation href="#source-6" label="6" />
              {' '}— the framework adds some safeguards for dogs and cats used in research. Important gaps remain.
            </motion.p>

            <div className="space-y-14 md:space-y-16">
              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  What the regulations achieve
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    The regulations implement Bill 75&apos;s amendments to the <em>Animals for Research Act</em>. Among
                    other changes, they:
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    {[
                      'Require research proposals involving dogs and cats to be reviewed by institutional Animal Care Committees (ACCs).',
                      'Require researchers to consider alternatives to animal use before proceeding.',
                      'Introduce planning for the potential rehoming of dogs and cats following research, where appropriate.',
                      'Build on Bill 75 restrictions on invasive medical research on dogs and cats and on breeding cats and dogs for research in Ontario supply facilities.',
                    ].map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p>
                    Animal Alliance of Canada welcomed these steps as progress reflecting growing public concern about
                    animals used in research.
                    <InlineCitation href="#source-6" label="6" />
                  </p>
                </div>
              </motion.div>

              <motion.div {...fadeIn}>
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4 pb-2 border-b border-amber-200">
                  Where the regulations fall short
                </h3>
                <div className="space-y-4 text-gray-700 font-light leading-relaxed text-lg">
                  <p>
                    Throughout the public consultation process, advocates urged the Ontario government to strengthen the
                    proposed rules. While some improvements were made, several issues remain unresolved:
                    <InlineCitation href="#source-6" label="6" />
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    {[
                      'They do not require dogs and cats to be rehomed after research when it is safe and appropriate — rehoming is planned for only where “appropriate,” not mandated.',
                      'They do not close Ontario’s long-standing pound-to-research pipeline, under which unclaimed dogs and cats can be transferred from municipal pounds to research facilities.',
                      'They continue to rely on institutional Animal Care Committees rather than independent oversight.',
                      'They permit the use of “animals of a lower order” as a substitute rather than prioritizing modern, non-animal alternatives.',
                    ].map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl bg-white/80 border border-amber-100 p-6 sm:p-8 shadow-sm">
                    <p className="text-amber-800 font-medium text-lg mb-1">Partial reform is not the same as protection.</p>
                    <p className="text-gray-700 text-base">
                      Bill 75 and its regulations mark a shift for dogs and cats in Ontario labs — but leaving the
                      pound-to-research pipeline open and rehoming optional means the system still treats living animals
                      as resources to be used, not beings owed a real exit when research ends.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 4: What we're losing */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-slate-50 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-90" />
          <div className="max-w-4xl mx-auto pl-4 sm:pl-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              What we&apos;re losing — on both fronts
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                Under <strong className="font-normal text-gray-900">Bill 5</strong>, we&apos;re losing the legal backbone
                that made Ontario list species at risk, plan for their recovery, and protect their habitat. We&apos;re
                losing the expectation that major projects face environmental and democratic scrutiny. We&apos;re losing
                the promise that Indigenous Peoples will be full partners in decisions that affect their territories and
                rights.
              </p>
              <p>
                Under <strong className="font-normal text-gray-900">Bill 75</strong>, Ontario is moving toward stronger
                rules for dogs and cats in research — but without closing the pound-to-research pipeline, mandating
                rehoming when safe, or establishing independent oversight, the province still normalizes using shelter
                animals and institutional self-regulation as good enough.
              </p>
              <p>
                We&apos;re not just losing paperwork. We&apos;re losing the chance for caribou, polar bears, and
                countless other species to recover. We&apos;re losing wetlands that filter water and store carbon. We&apos;re
                losing the idea that the economy should work within the limits of the land — not the other way around.
                And we&apos;re passing that loss to the next generation, who will inherit a province that chose
                short-term deals over long-term care.
              </p>
              <motion.div {...fadeIn} className="rounded-xl bg-white/80 border border-amber-100 p-6 sm:p-8 shadow-sm">
                <p className="text-amber-800 font-medium text-lg sm:text-xl mb-1">No matter how it&apos;s spun, bulldozing species protection doesn&apos;t unleash opportunity.</p>
                <p className="text-gray-700 text-base sm:text-lg">It unleashes risk — for wildlife, for water, for communities, and for the future we claim to care about.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 4: We've stopped them before */}
        <section className="relative px-4 sm:px-6 md:px-8 py-16 md:py-24 bg-white overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-70 z-10" />
          <div className="max-w-4xl mx-auto pr-4 sm:pr-6">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-8 md:mb-12">
              We&apos;ve stopped them before
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-6 text-lg sm:text-xl text-gray-700 font-light leading-relaxed">
              <p>
                When the government tried to carve up the{' '}
                <Link href="/public-land#greenbelt" className="text-amber-800 underline underline-offset-2 hover:text-amber-900">
                  Greenbelt
                </Link>{' '}
                and hand it to connected developers, public pressure forced a reversal. People showed up. They wrote. They refused to accept that protected land was for sale. That reversal proved that bad policy can be pushed back — but only if we make it politically impossible to ignore.
              </p>
              <p>
                Bill 5 is already law. Reversing it will take the same kind of sustained, loud, and clear demand: from scientists, from First Nations, from municipalities, from ordinary people who believe that endangered species and Indigenous rights are not negotiable. On Bill 75, advocates have until the January 2027 implementation date to push for stronger regulations and to close loopholes before they become normalized. Ontario Nature
                <InlineCitation href="#source-2" label="2" />
                , the David Suzuki Foundation
                <InlineCitation href="#source-3" label="3" />
                , and many others are calling for Bill 5 to be cancelled and for attacks on species and accountability to end. They&apos;re inviting you to join.
              </p>
              <motion.div {...fadeIn} className="rounded-xl bg-amber-50/80 border border-amber-200 p-6 sm:p-8 shadow-sm">
                <p className="text-amber-900 font-medium text-lg sm:text-xl mb-1">This is a moment to mobilize.</p>
                <p className="text-gray-700 text-base sm:text-lg">The question is whether we use it.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Sources */}
        <section id="sources" className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-4">Sources &amp; citations</h3>
            <ul className="space-y-2 text-sm md:text-base text-gray-700 font-light leading-relaxed">
              <li id="source-1">
                <span className="mr-2 text-slate-500">1.</span>
                <a href="https://www.ola.org/en/legislative-business/bills/parliament-44/session-1/bill-5" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Legislative Assembly of Ontario: Bill 5 — Protect Ontario by Unleashing our Economy Act, 2025
                </a>
              </li>
              <li id="source-2">
                <span className="mr-2 text-slate-500">2.</span>
                <a href="https://ontarionature.org/bill-5-a-moment-to-mobilize-for-nature-in-ontario-blog/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Ontario Nature: Bill 5 — A moment to mobilize for nature
                </a>
              </li>
              <li id="source-3">
                <span className="mr-2 text-slate-500">3.</span>
                <a href="https://davidsuzuki.org/action/repealbill5/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  David Suzuki Foundation: Repeal Bill 5
                </a>
              </li>
              <li id="source-4">
                <span className="mr-2 text-slate-500">4.</span>
                <a href="https://www.cbc.ca/news/canada/toronto/ring-of-fire-special-economic-zone-ontario-1.7553352" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  CBC: Ontario to make Ring of Fire a special economic zone
                </a>
              </li>
              <li id="source-5">
                <span className="mr-2 text-slate-500">5.</span>
                <a href="https://www.ontario.ca/laws/regulation/900022" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Ontario.ca: O. Reg. 900022 — regulations under the Animals for Research Act (Bill 75 implementation; in force January 1, 2027)
                </a>
              </li>
              <li id="source-6">
                <span className="mr-2 text-slate-500">6.</span>
                <a href="https://www.globenewswire.com/news-release/2026/06/26/3318289/0/en/ontario-finalizes-animal-research-regulations-leaving-critical-loopholes-unaddressed.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Animal Alliance of Canada (via GlobeNewswire): Ontario finalizes animal research regulations — critical loopholes unaddressed
                </a>
              </li>
              <li id="source-7">
                <span className="mr-2 text-slate-500">7.</span>
                <a href="https://www.ola.org/en/legislative-business/bills/parliament-44/session-1/bill-75" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                  Legislative Assembly of Ontario: Bill 75 — Keeping Criminals Behind Bars Act, 2026 (Schedule 1: Animals for Research Act)
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA Section — matches water / greenbelt */}
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
                    Tell your MPP you want Bill 5 repealed, species protection restored, and stronger Bill 75 rules —
                    including closing the pound-to-research pipeline and mandating rehoming where safe
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
