'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import MPPContactModal from '../../components/MPPContactModal'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'

const STSC = 'https://stopthespraycanada.ca/'
const STSC_ONTARIO = 'https://stopthespraycanada.ca/ontario'
const STSC_PLANS = 'https://stopthespraycanada.ca/poison-plans'
const STSC_MUNICIPAL = 'https://stopthespraycanada.ca/municipal-tracker'
const STSC_TOXIC = 'https://stopthespraycanada.ca/toxic-legacy/'
const STSC_WILDFIRE = 'https://stopthespraycanada.ca/wildfire/'
const STSC_QUEBEC = 'https://stopthespraycanada.ca/quebec/'

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55 },
}

export default function StopTheSprayPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="relative bg-[#0c1612] text-white">
      <TopNavigation
        navOnDark
        onDataSourcesClick={() => {
          setShowMethodology(false)
          setShowDataSources((v) => !v)
        }}
        onMethodologyClick={() => {
          setShowDataSources(false)
          setShowMethodology((v) => !v)
        }}
      />

      {/* Hero — keep */}
      <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hub/hero-morice-canyon.jpg')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0c1612] via-[#0c1612]/72 to-[#0c1612]/30"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1612]/75 via-transparent to-transparent" aria-hidden />

        <div className="relative z-10 px-4 sm:px-6 md:px-8 pb-14 sm:pb-20 pt-28 max-w-5xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/90 mb-4"
          >
            ProtectOnt · Chemical forestry
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight max-w-3xl"
          >
            Our forests are not weeds
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 text-lg sm:text-xl text-white/75 font-light max-w-xl leading-relaxed"
          >
            Herbicides are sprayed over public forests so softwood plantations win. Watersheds, wildlife, and
            forest foods lose.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#act"
              className="inline-flex items-center justify-center rounded-md bg-emerald-400 px-6 py-3.5 text-base font-semibold text-[#0c1612] hover:bg-emerald-300 transition-colors min-h-[48px]"
            >
              Stop the 2026 spray
            </a>
            <a
              href="#story"
              className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3.5 text-base font-medium hover:bg-white/10 transition-colors min-h-[48px]"
            >
              How we got here
            </a>
          </motion.div>
        </div>
      </section>

      {/* Partnership */}
      <div className="px-4 sm:px-6 md:px-8 relative z-10 -mt-1">
        <div className="max-w-5xl mx-auto flex items-center gap-4 rounded-xl border border-white/10 bg-[#14201a] px-4 sm:px-5 py-3.5 shadow-xl shadow-black/20">
          <Image
            src="/partners/stop-the-spray-canada.jpg"
            alt="Stop the Spray Canada National Coalition"
            width={52}
            height={52}
            className="rounded-md shrink-0 bg-white"
          />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-emerald-400 font-semibold">
              In partnership with
            </p>
            <p className="text-white font-medium leading-tight">Stop the Spray Canada</p>
            <p className="text-white/45 text-sm font-light truncate sm:whitespace-normal">
              National coalition ending chemical forestry ·{' '}
              <a href={STSC} target="_blank" rel="noopener noreferrer" className="text-emerald-300/90 underline underline-offset-2">
                stopthespraycanada.ca
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Signal strip */}
      <section className="px-4 sm:px-6 md:px-8 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
          {[
            { n: '94%', l: 'of Ontarians live in the south — spray hits the North & Treaty lands' },
            { n: '1989', l: 'First Nations resolutions opposing spray — still ignored' },
            { n: '60+', l: 'municipalities now on record against forest spraying' },
            { n: '2001', l: 'Québec stopped licences. Forestry adapted without herbicides' },
          ].map((s, i) => (
            <motion.div key={s.n} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <p className="text-3xl sm:text-4xl font-light text-emerald-400 tabular-nums tracking-tight">{s.n}</p>
              <p className="mt-2 text-sm sm:text-[15px] text-white/55 font-light leading-snug">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What it is — lean */}
      <section id="what" className="scroll-mt-24 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 grid lg:grid-cols-12 gap-10 lg:gap-14">
          <motion.div {...fadeUp} className="lg:col-span-5">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              The practice
            </p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight">
              Kill the “competition.” Plant the softwoods.
            </h2>
          </motion.div>
          <motion.div {...fadeUp} className="lg:col-span-7 space-y-5 text-lg text-white/70 font-light leading-relaxed">
            <p>
              After clearcutting, companies spray herbicides — by air or backpack — to wipe out broadleaf
              regrowth so conifer plantations take over. That “competition” is forest food, medicine plants,
              pollinator habitat, and mixedwood resilience.
            </p>
            <p>
              Chemical forestry is not one chemical. When 2,4,5-T became indefensible, industry switched to
              glyphosate. As glyphosate collapses under science and lawsuits, triclopyr and imazapyr move in.
              Registration is not consent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline — curated */}
      <section id="story" className="scroll-mt-24 bg-[#0a1210] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20">
          <motion.div {...fadeUp} className="mb-10 sm:mb-12 max-w-2xl">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              Ontario’s toxic switch
            </p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight">
              They never stopped. They just changed poisons.
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-400/60 via-white/15 to-transparent" aria-hidden />
            <ul className="space-y-8 sm:space-y-10">
              {[
                {
                  y: '1950s–79',
                  t: 'Agent Orange era',
                  d: 'Ontario forests sprayed with 2,4-D and 2,4,5-T — the same pair used in Agent Orange, contaminated with dioxin. Workers and Junior Rangers were exposed. Ontario banned 2,4,5-T by 1980.',
                },
                {
                  y: '1980',
                  t: 'Glyphosate fills the gap',
                  d: 'Industry did not modernize. It grabbed the next cheap herbicide to keep killing competition for conifer plantations — and sold “trust the approvals” for 40+ years.',
                },
                {
                  y: '1999',
                  t: 'Senate: phase it out',
                  d: 'After two years studying the boreal, Canada’s Senate said all herbicide and chemical pesticide use there should end as soon as possible. Provinces kept spraying.',
                },
                {
                  y: '2001',
                  t: 'Québec ends spray licences',
                  d: 'No more forestry herbicide approvals in public forests. Tall stock, mechanical release, early reforestation — industry adapted. Proof the excuse is gone.',
                },
                {
                  y: '2009',
                  t: 'Cosmetic ban, forest pass',
                  d: 'Ontario protects lawns and gardens from unnecessary pesticides — while the same chemical logic keeps raining on northern public forests and Treaty territories.',
                },
                {
                  y: '2025–26',
                  t: 'The safety shield cracks',
                  d: 'A cornerstone 2000 glyphosate “safety” review is retracted over Monsanto involvement. Courts, settlements, and the Seattle Statement pile on. Ontario still posts 2026 spray plans.',
                },
              ].map((row, i) => (
                <motion.li
                  key={row.y}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.2) }}
                  className="relative pl-10 sm:pl-12"
                >
                  <span className="absolute left-0 top-1.5 h-6 w-6 sm:h-8 sm:w-8 rounded-full border border-emerald-400/50 bg-[#0c1612] flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <p className="text-emerald-400 text-sm font-semibold tabular-nums">{row.y}</p>
                  <p className="text-xl sm:text-2xl font-light text-white mt-1 tracking-tight">{row.t}</p>
                  <p className="mt-2 text-white/60 font-light leading-relaxed max-w-2xl">{row.d}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Wildfire */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <motion.div {...fadeUp} className="lg:col-span-5">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              Fire & forests
            </p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight">
              Composition is fuel.
            </h2>
            <p className="mt-5 text-white/60 font-light leading-relaxed">
              Spray does not “cause every wildfire.” But decades of killing aspen, birch, and shrubs to favour
              conifers remakes what will burn — denser, more connected, hotter when fire hits.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="lg:col-span-7 space-y-4">
            <div className="border-l-2 border-emerald-400/70 pl-5 py-1">
              <p className="text-white/85 text-lg font-light leading-relaxed">
                Canada’s Fire Behaviour Prediction System treats conifer plantations as their own fuel type.
                Deciduous and mixedwood stands often burn slower and cooler — especially in growing season.
              </p>
            </div>
            <div className="border-l-2 border-white/20 pl-5 py-1">
              <p className="text-white/85 text-lg font-light leading-relaxed">
                2026 research highlights trembling aspen as a natural fire barrier. Chemical forestry suppresses
                that broadleaf resilience on purpose.
              </p>
            </div>
            <p className="text-sm text-white/40 font-light pt-2">
              Even if wildfire risk vanished tomorrow, generations of opposition, a Senate warning, and Québec’s
              example would still demand an end to spraying public forests.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quote band */}
      <section className="bg-emerald-950/40 border-y border-emerald-400/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-14 sm:py-16">
          <motion.blockquote {...fadeUp}>
            <p className="text-2xl sm:text-3xl md:text-[2.35rem] font-light leading-snug tracking-tight text-white">
              “All herbicide and chemical pesticide use in the boreal forest should be phased out as soon as
              possible.”
            </p>
            <footer className="mt-5 text-sm text-emerald-200/50 font-light">
              Senate Subcommittee on the Boreal Forest · Competing Realities (1999)
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* Québec + pressure */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-10 sm:gap-8">
          <motion.div {...fadeUp}>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              The proof
            </p>
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">Québec already did it</h3>
            <p className="text-white/65 font-light leading-relaxed mb-4">
              Since 2001: early reforestation, taller planting stock, mechanical tending, site-specific
              management — not aerial poison. Forestry kept running. The “we have no choice” line is false.
            </p>
            <a
              href={STSC_QUEBEC}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              How Québec adapted ↗
            </a>
          </motion.div>
          <motion.div {...fadeUp}>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              The pressure
            </p>
            <h3 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">The North never consented</h3>
            <p className="text-white/65 font-light leading-relaxed mb-4">
              Formal Indigenous opposition since 1989. Chiefs of Ontario and the Métis Nation of Ontario renewed
              calls in 2025. Sixty-plus municipalities are now on record. The Ombudsman still points elsewhere —
              the blame circle.
            </p>
            <a
              href={STSC_TOXIC}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Ontario’s toxic legacy timeline ↗
            </a>
          </motion.div>
        </div>
      </section>

      {/* Act */}
      <section id="act" className="scroll-mt-24 border-t border-white/[0.06] bg-[#0a1210]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
          <motion.div {...fadeUp} className="max-w-2xl mb-10">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.18em] mb-3">
              Take action
            </p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-4">
              Suspend the 2026 spray season
            </h2>
            <p className="text-white/60 font-light leading-relaxed">
              Demand non-chemical forestry on public land — the same ask communities have made for decades.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-left rounded-xl bg-emerald-400 px-6 py-6 text-[#0c1612] hover:bg-emerald-300 transition-colors"
            >
              <p className="text-lg font-semibold">Email your MPP</p>
              <p className="text-sm font-medium text-[#0c1612]/70 mt-1">
                Ask them to push Natural Resources & Environment to stop the season
              </p>
            </button>
            <Link
              href="/take-action"
              className="rounded-xl border border-white/15 bg-white/[0.03] px-6 py-6 hover:border-emerald-400/40 hover:bg-emerald-400/5 transition-colors"
            >
              <p className="text-lg font-semibold text-white">ProtectOnt take-action hub</p>
              <p className="text-sm text-white/50 font-light mt-1">Find your representative and send a focused ask</p>
            </Link>
          </div>

          <p className="text-xs uppercase tracking-[0.16em] text-white/35 font-semibold mb-3">
            Stop the Spray Canada Tools
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Ontario hub', href: STSC_ONTARIO },
              { label: '2026 poison plans', href: STSC_PLANS },
              { label: 'Municipal tracker', href: STSC_MUNICIPAL },
              { label: 'Wildfire & forestry', href: STSC_WILDFIRE },
            ].map((a) => (
              <a
                key={a.href}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white hover:border-white/30 transition-colors"
              >
                {a.label}
                <span className="text-white/30" aria-hidden>
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer links */}
      <section className="px-4 sm:px-6 md:px-8 py-12 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="text-white/35 text-sm mb-2">Connected ProtectOnt issues</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-white/75">
              <Link href="/wildlife" className="hover:text-emerald-300 transition-colors">
                Wildlife
              </Link>
              <Link href="/public-land" className="hover:text-emerald-300 transition-colors">
                Public land
              </Link>
              <Link href="/indigenous-rights" className="hover:text-emerald-300 transition-colors">
                Indigenous rights
              </Link>
              <Link href="/water" className="hover:text-emerald-300 transition-colors">
                Water
              </Link>
            </div>
          </div>
          <a
            href={STSC}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <Image
              src="/partners/stop-the-spray-canada.jpg"
              alt=""
              width={40}
              height={40}
              className="rounded bg-white"
            />
            <span className="text-sm text-white/45 group-hover:text-white/70 transition-colors">
              In partnership with Stop the Spray Canada
              <span className="block text-white/30">Campaign site ↗</span>
            </span>
          </a>
        </div>
      </section>

      <MPPContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <MethodologyDrawer isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      <DataSourcesDrawer isOpen={showDataSources} onClose={() => setShowDataSources(false)} />
    </div>
  )
}
