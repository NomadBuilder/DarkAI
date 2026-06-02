'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

type FaqItem = {
  id: string
  question: string
  answer: React.ReactNode
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'first-time',
    question: 'I’ve never been to a protest. Is that okay?',
    answer: (
      <>
        Yes. Many people at province-wide days are attending their first rally. You don&apos;t need
        experience—showing up with a sign or simply standing in solidarity counts. Arrive a few minutes early, find
        the gathering point listed for your city, and follow what the crowd and any marshals or organizers are doing.
      </>
    ),
  },
  {
    id: 'safe',
    question: 'Is it safe?',
    answer: (
      <>
        Peaceful assembly is protected in Canada. These listings are for public rallies at visible locations (MPP
        offices, parks, plazas). Stay aware of your surroundings, stick with friends if you can, and leave if you
        ever feel unsafe. We list events from community organizers; always confirm the time and place on the day of
        the event using the directions link on your city&apos;s card.
      </>
    ),
  },
  {
    id: 'bring',
    question: 'What should I bring?',
    answer: (
      <>
        <ul className="list-disc pl-5 space-y-2 mt-1">
          <li>Water and sunscreen (May weather varies—check the forecast).</li>
          <li>Comfortable shoes—you may stand for an hour or more.</li>
          <li>
            A sign: print your own from our{' '}
            <Link href="/signs" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
              sign builder
            </Link>
            , download artwork on{' '}
            <Link href="/join#download-a-sign" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
              Join
            </Link>
            , or{' '}
            <Link href="/products" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
              order a yard sign
            </Link>
            .
          </li>
          <li>Phone charged—for maps, photos, and staying in touch.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'kids',
    question: 'Can I bring kids?',
    answer: (
      <>
        Many families attend rallies. Use your judgment for your children&apos;s ages and the weather. Stay at the
        edge of the crowd if you want an easy exit, and explain to kids that the goal is peaceful protest—chanting,
        signs, and showing up together.
      </>
    ),
  },
  {
    id: 'expect',
    question: 'What actually happens at the event?',
    answer: (
      <>
        Most local actions include people gathering at the listed address, holding signs, and sometimes short
        speeches or chants. There is usually no stage or ticket—find the group, introduce yourself if you like, and
        participate at your comfort level. Browse our{' '}
        <Link href="/chants" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
          chant bank
        </Link>{' '}
        if you want call-and-response lines ready.
      </>
    ),
  },
  {
    id: 'legal',
    question: 'Anything I should know about the law?',
    answer: (
      <>
        This site does not provide legal advice. In general, peaceful protest on public property is widely
        exercised in Ontario. Do not block emergency access, respect police directions if given, and avoid
        confrontation with counter-protesters—ignore or walk away. If you have concerns specific to your situation,
        consult a lawyer or trusted community legal clinic.
      </>
    ),
  },
  {
    id: 'wrong-place',
    question: 'What if I can’t find the spot?',
    answer: (
      <>
        Use the <strong className="font-normal text-gray-900">Directions</strong> link on your event card—it opens
        Google Maps with the address. Arrive 10–15 minutes before the listed start time. If nobody is visible yet,
        wait nearby or check local organizer social pages; start times can shift slightly.
      </>
    ),
  },
  {
    id: 'accessibility',
    question: 'Accessibility and mobility',
    answer: (
      <>
        Locations vary (sidewalks, parks, office plazas). We list addresses so you can preview the area on maps.
        If you need a specific accommodation, contact organizers through the{' '}
        <Link href="/about#contact" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
          About contact form
        </Link>{' '}
        and we can try to connect you with the local lead.
      </>
    ),
  },
]

export default function ProtestFaq() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null)

  return (
    <section id="protest-faq" className="px-4 sm:px-6 md:px-8 py-14 md:py-20 bg-slate-50 border-y border-slate-100 scroll-mt-28 sm:scroll-mt-32">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeIn} className="text-center mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-800/70 mb-3 font-medium">
            First time?
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4">
            Protest FAQ
          </h2>
          <p className="text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
            Nervous about what to expect? You&apos;re not alone. Here are straightforward answers for people heading
            to their first rally—especially upcoming province-wide days.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openId === item.id
            return (
              <motion.div
                key={item.id}
                {...fadeIn}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  id={`faq-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left hover:bg-slate-50/80 transition-colors"
                >
                  <span className="text-base sm:text-lg font-light text-gray-900">{item.question}</span>
                  <span
                    className="shrink-0 mt-1 text-slate-400 text-xl leading-none"
                    aria-hidden
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-${item.id}`}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-gray-600 font-light leading-relaxed text-sm sm:text-base border-t border-slate-100 pt-4"
                  >
                    {item.answer}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <motion.p {...fadeIn} className="mt-8 text-center text-sm text-slate-500 font-light">
          More prep:{' '}
          <Link href="/take-action" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
            Take action
          </Link>
          {' · '}
          <Link href="/message-guide" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
            Message guide
          </Link>
        </motion.p>
      </div>
    </section>
  )
}
