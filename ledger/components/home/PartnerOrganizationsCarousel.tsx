'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { partnerOrganizations } from '@/lib/partner-organizations'

export default function PartnerOrganizationsSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollPrev(el.scrollLeft > 4)
    setCanScrollNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    return () => window.removeEventListener('resize', updateScrollState)
  }, [updateScrollState])

  const scrollByPage = (direction: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.85 * direction, behavior: 'smooth' })
  }

  return (
    <section
      id="partner-organizations"
      aria-labelledby="partner-organizations-heading"
      className="border-y border-slate-200/80 bg-white px-4 py-12 sm:px-6 md:py-14"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center md:mb-12"
        >
          <h2
            id="partner-organizations-heading"
            className="text-2xl font-light tracking-tight text-slate-900 sm:text-3xl"
          >
            Allied Organizations Fighting for Ontario
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-light leading-relaxed text-slate-600 sm:max-w-3xl sm:text-base lg:max-w-none">
            Explore organizations working to protect public services, strengthen democracy, and build a
            better Ontario.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-light leading-relaxed text-slate-500 sm:max-w-3xl sm:text-base lg:max-w-none">
            Much of Ontario&apos;s opposition is volunteer-led — often women coordinating signs, events,
            and mutual aid.
          </p>
        </motion.div>

        <div className="relative px-10 sm:px-12">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollPrev}
            aria-label="Previous organization"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200/80 bg-white/90 p-2.5 text-slate-600 shadow-sm backdrop-blur-sm transition enabled:hover:border-slate-300 enabled:hover:text-slate-900 disabled:cursor-default disabled:opacity-25 sm:p-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div
            ref={trackRef}
            onScroll={updateScrollState}
            className="flex snap-x snap-mandatory items-center gap-8 overflow-x-auto scroll-smooth py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-10 md:gap-12 [&::-webkit-scrollbar]:hidden"
          >
            {partnerOrganizations.map((org) => (
              <a
                key={org.id}
                href={org.href}
                target="_blank"
                rel="noopener noreferrer"
                title={org.name}
                className="group flex flex-[0_0_auto] snap-center items-center justify-center opacity-90 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-400"
              >
                <span className="sr-only">{org.name}</span>
                <Image
                  src={org.logoSrc}
                  alt={org.name}
                  width={220}
                  height={72}
                  className="h-14 w-auto max-w-[200px] object-contain object-center transition duration-200 group-hover:scale-[1.03] sm:h-16 sm:max-w-[220px]"
                />
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollNext}
            aria-label="Next organization"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200/80 bg-white/90 p-2.5 text-slate-600 shadow-sm backdrop-blur-sm transition enabled:hover:border-slate-300 enabled:hover:text-slate-900 disabled:cursor-default disabled:opacity-25 sm:p-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
