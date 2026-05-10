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
    body: 'Every purchase is a small act of solidarity. Revenue from prints and transfers helps keep this project online, improves outreach tools, and backs real-world organizing—posters for rallies, shirts and stickers for visibility, and materials people can actually use.',
  },
  {
    title: 'Transparent by design',
    body: 'We are not a faceless storefront. Protect Ontario exists to make accountability data public and usable. When you buy here, you know what movement you are supporting—and you get a tangible product you can wear or hold up in public.',
  },
  {
    title: 'Made for Ontario streets',
    body: 'Sizes and formats are chosen for protests, town halls, and neighbourhood conversations: bold posters for walls and windows, iron-on transfers and sticker sheets you can produce locally. Quality that holds up when it matters.',
  },
]

/** Shipped / paid print */
const shippedProducts = [
  {
    id: 'posters',
    eyebrow: 'Wall & rally',
    title: 'Printed posters',
    priceFrom: 'From $45 CAD',
    sizes: '18 × 24 in · 24 × 36 in · matte · Canada shipping',
    description:
      'Design your message on our sign builder, preview exactly what will print, then order a professional poster shipped in Canada. Ideal for offices, community spaces, and demonstrations.',
    href: '/signs#poster-print',
    cta: 'Design & order posters',
    accent: 'from-[#1e3a5f] to-[#2E4A6B]',
    border: 'border-blue-200/80',
  },
]

/** Download / DIY — no shipped merch from us */
const diyProducts = [
  {
    id: 'shirts',
    eyebrow: 'Wear the message',
    title: 'Shirt transfers',
    priceFrom: 'Print at home',
    sizes: 'Letter sheets · mirrored for iron-on',
    description:
      'Build iron-on artwork for light fabrics, download templates, or use the library. Print locally and press with a household iron or heat press—no third-party merch shop required.',
    href: '/shirts',
    cta: 'Open shirt transfer tool',
    accent: 'from-[#9f1239] to-[#7f1230]',
    border: 'border-rose-200/80',
  },
  {
    id: 'stickers',
    eyebrow: 'Laptops & clipboards',
    title: 'Sticker sheets',
    priceFrom: 'Free library · build your own',
    sizes: 'PNG export · cut guides · collage bases',
    description:
      'Create sticker-ready art with custom text and images, or grab ready-made designs from the sticker library. Perfect for tabling, canvassing, and handing out at events.',
    href: '/stickers',
    cta: 'Open sticker builder',
    accent: 'from-emerald-800 to-teal-700',
    border: 'border-emerald-200/80',
  },
  {
    id: 'signs',
    eyebrow: 'Copy room & copy shop',
    title: 'Print-at-home signs',
    priceFrom: 'Free download',
    sizes: 'Multiple sizes · PNG or print dialog',
    description:
      'Use the full sign generator for rally boards and lawn signs you print yourself or at a copy shop. Paid poster printing is optional when you want pro paper shipped to you.',
    href: '/signs',
    cta: 'Open sign generator',
    accent: 'from-slate-700 to-slate-600',
    border: 'border-slate-200/90',
  },
]

const freeTools = [
  {
    title: 'Message guide',
    desc: 'Short framing lines by issue—say this, avoid that—for interviews and social posts.',
    href: '/message-guide',
  },
  {
    title: 'Chant bank',
    desc: 'Searchable call-and-response chants with printable cards for the line.',
    href: '/chants',
  },
  {
    title: 'Province-wide events',
    desc: 'Filter protests and rallies by city and month—May 30 and beyond.',
    href: '/protests#event-list',
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
            Posters, shirt transfers, stickers, and printable signs—built for accountability organizing in Ontario. When
            you purchase through Protect Ontario, you help keep independent research, protest listings, and civic tools
            available to everyone, while funding community actions: printing, outreach, and materials for volunteers and
            local groups.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signs#poster-print"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-lg shadow-black/20 hover:bg-slate-100 transition-colors"
            >
              Posters
            </Link>
            <Link
              href="/shirts"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
            >
              Shirts
            </Link>
            <Link
              href="/stickers"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
            >
              Stickers
            </Link>
            <Link
              href="/signs"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
            >
              Signs
            </Link>
            <Link
              href="/protests#event-list"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
            >
              Events
            </Link>
            <Link
              href="/take-action"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-light text-blue-100 underline-offset-4 hover:underline"
            >
              More ways to help
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { stat: 'Open', label: 'Core site stays free to read', sub: 'Shop revenue helps cover hosting and updates' },
            { stat: 'CA', label: 'Poster shipping in Canada', sub: 'Checkout collects a Canadian delivery address' },
            { stat: 'DIY', label: 'Stickers & shirts at home', sub: 'Download, print, and cut on your schedule' },
            { stat: 'Free', label: 'Signs & organizing tools', sub: 'Generators, chants, and message guides—no paywall' },
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
            are part of it. Income from posters helps pay for hosting, data updates, design tooling, and printing support
            when we can offer it. We keep margins modest so more dollars flow back into actions you can see: protest
            listings, printable resources, and education that does not depend on ad networks or paywalls.
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

      {/* Shipped */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#2E4A6B] font-medium mb-2">Shipped to you</p>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-3">Professional posters</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              When you want museum-grade matte paper and reliable fulfilment—without running to the print shop yourself.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-1 max-w-2xl">
            {shippedProducts.map((card, i) => (
              <motion.div
                key={card.id}
                {...fade}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className={`overflow-hidden rounded-3xl border ${card.border} bg-white shadow-md shadow-slate-900/5`}
              >
                <div className={`h-2 bg-gradient-to-r ${card.accent}`} />
                <div className="p-8 sm:p-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">{card.eyebrow}</p>
                    <h3 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">{card.title}</h3>
                    <p className="text-sm font-medium text-[#2E4A6B] mb-1">{card.priceFrom}</p>
                    <p className="text-xs text-slate-500 mb-4">{card.sizes}</p>
                    <p className="text-sm text-slate-600 font-light leading-relaxed max-w-xl">{card.description}</p>
                  </div>
                  <Link
                    href={card.href}
                    className={`inline-flex shrink-0 justify-center rounded-xl bg-gradient-to-r ${card.accent} px-6 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg`}
                  >
                    {card.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DIY */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9f1239] font-medium mb-2">Print & cut at home</p>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-3">Shirts, stickers & signs</h2>
            <p className="text-slate-600 font-light leading-relaxed">
              Same energy as the shipped poster—different logistics. You control paper stock, ink, and timing; we give
              you the files and builders tuned for Ontario organizing.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {diyProducts.map((card, i) => (
              <motion.div
                key={card.id}
                {...fade}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className={`flex flex-col overflow-hidden rounded-3xl border ${card.border} bg-slate-50/50 shadow-md shadow-slate-900/5`}
              >
                <div className={`h-2 bg-gradient-to-r ${card.accent}`} />
                <div className="p-8 flex flex-col flex-grow">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">{card.eyebrow}</p>
                  <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-sm font-medium text-[#2E4A6B] mb-1">{card.priceFrom}</p>
                  <p className="text-xs text-slate-500 mb-5">{card.sizes}</p>
                  <p className="text-sm text-slate-600 font-light leading-relaxed flex-grow mb-8">{card.description}</p>
                  <Link
                    href={card.href}
                    className={`mt-auto inline-flex justify-center rounded-xl bg-gradient-to-r ${card.accent} px-5 py-3 text-sm font-medium text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg`}
                  >
                    {card.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free tools strip */}
      <section className="py-14 sm:py-16 bg-gradient-to-b from-slate-100 to-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-light text-slate-900 mb-2">Included with the movement</h2>
            <p className="text-sm text-slate-600 font-light">
              No purchase required—these tools stay free so anyone can organize with clear messaging and up-to-date event
              info.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {freeTools.map((t, i) => (
              <motion.div
                key={t.href}
                {...fade}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-medium text-slate-900 mb-2">{t.title}</h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed mb-4">{t.desc}</p>
                <Link href={t.href} className="text-sm text-blue-700 hover:text-blue-800 font-medium underline underline-offset-4">
                  Open →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl font-light text-slate-900 mb-6">Questions</h2>
          <p className="text-sm text-slate-600 font-light leading-relaxed mb-6">
            Poster checkout uses secure payment and collects a Canadian shipping address. Shirt transfers, stickers, and
            sign downloads are files you handle locally—nothing is shipped from this site except poster orders. For
            issues with a poster order, use the contact email on your receipt or visit the About page.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <Link href="/about" className="text-blue-700 hover:text-blue-800 underline underline-offset-4 font-light">
              About Protect Ontario
            </Link>
            <Link href="/protests" className="text-blue-700 hover:text-blue-800 underline underline-offset-4 font-light">
              Upcoming events
            </Link>
            <Link href="/signs" className="text-blue-700 hover:text-blue-800 underline underline-offset-4 font-light">
              Sign generator
            </Link>
            <Link href="/stickers" className="text-blue-700 hover:text-blue-800 underline underline-offset-4 font-light">
              Stickers
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
