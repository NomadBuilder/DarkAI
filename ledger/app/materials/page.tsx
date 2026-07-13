'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import TopNavigation from '../../components/TopNavigation'
import ResourceNextSteps from '../../components/ResourceNextSteps'

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

const printAtHome = [
  {
    title: 'Print-at-home signs',
    description: 'Rally boards and lawn signs you print yourself or at a local shop.',
    href: '/signs',
    cta: 'Build signs',
  },
  {
    title: 'Shirt transfers',
    description: 'Iron-on sheets for light fabrics — print at home and press yourself.',
    href: '/shirts',
    cta: 'Build transfers',
  },
  {
    title: 'Sticker sheets',
    description: 'Custom layouts and ready-made designs for tabling and canvassing.',
    href: '/stickers',
    cta: 'Create stickers',
  },
]

const orderMaterials = [
  {
    title: 'Printed yard signs',
    description: '$10 each with stand — delivered by volunteers in your area.',
    href: '/products#yard-signs',
    cta: 'Order yard signs',
  },
  {
    title: 'Printed posters',
    description: 'Professional posters for walls, windows, and rallies.',
    href: '/signs#poster-print',
    cta: 'Design posters',
  },
  {
    title: 'Printed tees',
    description: 'White unisex tees with your design on the chest.',
    href: '/shirts#shirt-print',
    cta: 'Design a tee',
  },
]

const tablingAndDoors = [
  {
    title: 'Printable flyers',
    description: 'Per-issue PDFs plus the Community Action Pack — print for doors, boards, and events.',
    href: '/flyers',
    cta: 'Browse flyers',
  },
  {
    title: 'Order printed signs & tees',
    description: 'Yard signs, posters, and shirts — optional paid orders fund local delivery.',
    href: '/products',
    cta: 'View products',
  },
]

const protestPrep = [
  { title: 'Free sign downloads', href: '/join#download-a-sign', cta: 'Download on Join' },
  { title: 'Signs in the wild', href: '/signs-in-the-wild', cta: 'Upload a photo' },
  { title: 'Find a protest', href: '/protests#event-list', cta: 'See events' },
  { title: 'Reports', href: '/reports/they-called-it-protection', cta: 'Read brief' },
  { title: 'Contact your MPP', href: '/take-action', cta: 'Take action' },
]

const organizerTools = [
  {
    title: 'Message guide',
    description: 'Talking points by issue — what to say and what to avoid at the door or on camera.',
    href: '/message-guide',
    cta: 'Read guide',
  },
  {
    title: 'Chant bank',
    description: 'Call-and-response chants by tone — print quick cards for rallies.',
    href: '/chants',
    cta: 'Browse chants',
  },
]

export default function MaterialsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNavigation />

      <header className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-12">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-blue-200/90 mb-3 font-medium">
            Protest materials
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-4">
            Signs, shirts, stickers &amp; more
          </h1>
          <p className="text-lg text-slate-200/95 font-light max-w-2xl leading-relaxed">
            Everything you need for demonstrations and neighbourhood visibility — download free artwork, build your
            own, or order printed materials. Start on{' '}
            <Link href="/join" className="text-white underline underline-offset-4 hover:text-blue-100">
              Join
            </Link>{' '}
            if you want a sign delivered or to volunteer.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">
        <motion.section {...fade}>
          <h2 className="text-2xl font-light text-slate-900 mb-2">Tabling &amp; door knocking</h2>
          <p className="text-sm text-slate-600 font-light mb-5 max-w-2xl">
            Start with a printable flyer or a ready-made social post — then bring signs and chants to the event.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {tablingAndDoors.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#2E4A6B]/30 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-light text-slate-900 group-hover:text-[#2E4A6B]">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600 font-light leading-relaxed">{item.description}</p>
                <span className="mt-4 text-sm text-[#2E4A6B] font-medium">{item.cta} →</span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section {...fade}>
          <h2 className="text-2xl font-light text-slate-900 mb-2">Going to a protest?</h2>
          <p className="text-sm text-slate-600 font-light mb-5 max-w-2xl">
            Grab a free download or order a printed yard sign before you head out.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {protestPrep.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#2E4A6B]/30 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-light text-slate-900 group-hover:text-[#2E4A6B]">{item.title}</h3>
                <span className="mt-2 inline-block text-sm text-[#2E4A6B] font-medium">{item.cta} →</span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section {...fade}>
          <h2 className="text-2xl font-light text-slate-900 mb-2">Print at home</h2>
          <p className="text-sm text-slate-600 font-light mb-5">Free builders — export and print locally.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {printAtHome.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-light text-slate-900">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600 font-light leading-relaxed">{item.description}</p>
                <span className="mt-4 text-sm text-[#2E4A6B] font-medium group-hover:underline">{item.cta} →</span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section {...fade}>
          <h2 className="text-2xl font-light text-slate-900 mb-2">Organizer tools</h2>
          <p className="text-sm text-slate-600 font-light mb-5 max-w-2xl">
            Optional extras for tabling, social media, and on-the-ground events.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {organizerTools.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#2E4A6B]/30 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-light text-slate-900 group-hover:text-[#2E4A6B]">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600 font-light leading-relaxed">{item.description}</p>
                <span className="mt-4 text-sm text-[#2E4A6B] font-medium">{item.cta} →</span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section {...fade}>
          <h2 className="text-2xl font-light text-slate-900 mb-2">Order printed materials</h2>
          <p className="text-sm text-slate-600 font-light mb-5">
            Optional paid orders help fund printing, stands, and local delivery.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {orderMaterials.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-light text-slate-900">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600 font-light leading-relaxed">{item.description}</p>
                <span className="mt-4 text-sm text-[#2E4A6B] font-medium group-hover:underline">{item.cta} →</span>
              </Link>
            ))}
          </div>
        </motion.section>

        <ResourceNextSteps />
      </main>
    </div>
  )
}
