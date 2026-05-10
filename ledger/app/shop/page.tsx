'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import TopNavigation from '../../components/TopNavigation'

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55 },
}

const pillars = [
  {
    title: 'Community-first',
    body: 'Every purchase is a small act of solidarity. Revenue from prints and transfers helps keep this project online, improves outreach tools, and backs real-world organizing—posters for rallies, shirts for visibility, and materials people can actually use.',
  },
  {
    title: 'Transparent by design',
    body: 'We are not a faceless storefront. Protect Ontario exists to make accountability data public and usable. When you buy here, you know what movement you are supporting—and you get a tangible product you can wear or hold up in public.',
  },
  {
    title: 'Made for Ontario streets',
    body: 'Sizes and formats are chosen for protests, town halls, and neighbourhood conversations: bold posters for walls and windows, iron-on transfers you can apply at home. Quality that holds up when it matters.',
  },
]

const products = [
  {
    id: 'posters',
    eyebrow: 'Wall & rally',
    title: 'Printed posters',
    priceFrom: 'From $45 CAD',
    sizes: '18 × 24 in · 24 × 36 in',
    description:
      'Design your message on our sign builder, preview exactly what will print, then order a professional matte poster shipped in Canada. Perfect for offices, community spaces, and demonstrations.',
    href: '/signs#poster-print',
    cta: 'Design & order posters',
    accent: 'from-[#1e3a5f] to-[#2E4A6B]',
    border: 'border-blue-200/80',
  },
  {
    id: 'shirts',
    eyebrow: 'Wear the message',
    title: 'Shirt transfers',
    priceFrom: 'Print at home',
    sizes: 'Letter-size sheets · mirrored for iron-on',
    description:
      'Build or download iron-on artwork sized for light fabrics. Print locally, press with a household iron or heat press, and show up in gear that starts conversations without relying on third-party merch shops.',
    href: '/shirts',
    cta: 'Open shirt transfer tool',
    accent: 'from-[#9f1239] to-[#7f1230]',
    border: 'border-rose-200/80',
  },
]

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNavigation />

      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#9f1239]/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-28 sm:pb-24">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-blue-200/90 mb-5 font-medium">Shop in solidarity</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.08] mb-6">
            Gear that backs
            <span className="block sm:inline sm:ml-3 text-white/95">the work on the ground</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-200/95 font-light max-w-2xl leading-relaxed mb-10">
            Posters and shirt transfers you can trust—built for accountability organizing in Ontario. When you purchase
            through Protect Ontario, you help keep independent research, protest listings, and civic tools available to
            everyone, while funding the next wave of community actions: printing costs, outreach, and materials for
            volunteers and local groups.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signs#poster-print"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-medium text-slate-900 shadow-lg shadow-black/20 hover:bg-slate-100 transition-colors"
            >
              Posters
            </Link>
            <Link
              href="/shirts"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
            >
              Shirt transfers
            </Link>
            <Link
              href="/take-action"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-light text-blue-100 underline-offset-4 hover:underline"
            >
              Other ways to help
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { stat: 'Open', label: 'Core site stays free to read', sub: 'Shop revenue helps cover hosting and updates' },
            { stat: 'CA', label: 'Poster shipping in Canada', sub: 'Checkout collects a Canadian delivery address' },
            { stat: 'DIY', label: 'Shirt transfers at home', sub: 'Download, print, and press on your schedule' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5"
            >
              <p className="text-2xl sm:text-3xl font-light text-[#2E4A6B] mb-1">{item.stat}</p>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="mt-2 text-xs text-slate-500 font-light leading-relaxed">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-4">Why a shop lives on this site</h2>
          <p className="text-slate-600 font-light leading-relaxed">
            Protect Ontario is volunteer-led and reader-supported. Purchases are not a distraction from the mission—they
            are part of it. Income from posters and downloads helps pay for hosting, data updates, legal-safe design
            work, and printing subsidies when we can offer them. We keep margins modest so more dollars flow back into
            actions you can see: province-wide protest listings, printable resources, and education that does not depend
            on ad networks or paywalls.
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-10 md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.article
              key={p.title}
              {...fade}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 p-8 text-left"
            >
              <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-[#9f1239] to-[#2E4A6B]" />
              <h3 className="text-lg font-medium text-slate-900 mb-3">{p.title}</h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">{p.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-3">Choose your format</h2>
            <p className="text-slate-600 font-light">
              Two complementary paths: professional posters shipped to you, or shirt transfers you print and press at
              home. Same values—different logistics.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {products.map((card, i) => (
              <motion.div
                key={card.id}
                {...fade}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl border ${card.border} bg-white shadow-md shadow-slate-900/5`}
              >
                <div className={`h-2 bg-gradient-to-r ${card.accent}`} />
                <div className="p-8 sm:p-10 flex flex-col h-full">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">{card.eyebrow}</p>
                  <h3 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-sm font-medium text-[#2E4A6B] mb-1">{card.priceFrom}</p>
                  <p className="text-xs text-slate-500 mb-6">{card.sizes}</p>
                  <p className="text-sm text-slate-600 font-light leading-relaxed flex-grow mb-8">{card.description}</p>
                  <Link
                    href={card.href}
                    className={`inline-flex w-full sm:w-auto justify-center rounded-xl bg-gradient-to-r ${card.accent} px-6 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg`}
                  >
                    {card.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl font-light text-slate-900 mb-6">Questions</h2>
          <p className="text-sm text-slate-600 font-light leading-relaxed mb-6">
            Poster checkout uses secure payment and collects a Canadian shipping address. Shirt transfers are files you
            download—no garment is shipped from this site. For issues with an order, use the contact email on your
            receipt or visit the About page.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/about" className="text-blue-700 hover:text-blue-800 underline underline-offset-4 font-light">
              About Protect Ontario
            </Link>
            <Link href="/protests" className="text-blue-700 hover:text-blue-800 underline underline-offset-4 font-light">
              Upcoming events
            </Link>
            <Link href="/signs" className="text-blue-700 hover:text-blue-800 underline underline-offset-4 font-light">
              Sign generator
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
