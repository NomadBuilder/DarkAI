'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPublicDataFile } from '../../utils/dataPath'
import {
  type Protest,
  type ProtestTopicId,
  type FeaturedCampaign,
  PROTEST_TOPICS,
  parseProtestDate,
  parseProtestsFile,
  getCityFromLocation,
  mapsUrlForEvent,
  topicLabel,
} from '../../lib/protests'
import FindNearestProtest from '../../components/protests/FindNearestProtest'
import ProtestFaq from '../../components/protests/ProtestFaq'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

const rallyTopics = [
  {
    title: 'Public healthcare',
    description: 'Rallies against cuts, staffing agency spending, and for-profit clinics taking publicly funded capacity.',
    href: '/healthcare',
  },
  {
    title: 'Water & public services',
    description: 'Bill 60 and the push toward corporate control of water and wastewater—municipal accountability at stake.',
    href: '/water',
  },
  {
    title: 'Public land',
    description: 'Greenbelt accountability, Ontario Place, and who benefits when protected land and waterfront are opened up.',
    href: '/public-land',
  },
  {
    title: 'Wildlife & Bill 5',
    description: 'Species protection, special economic zones, and weakened environmental participation.',
    href: '/wildlife',
  },
  {
    title: 'Indigenous rights',
    description: 'Free, prior, and informed consent, Ring of Fire development, and treaty obligations.',
    href: '/indigenous-rights',
  },
]

const getReadyLinks = [
  { label: 'First-time protest FAQ', href: '#protest-faq', description: 'What to expect, what to bring, and safety basics' },
  { label: 'What you can do', href: '/take-action', description: 'Contact your MPP, petitions, and more' },
  { label: 'Protest chants', href: '/chants', description: 'Call-and-response lines for the crowd' },
  { label: 'Print a sign', href: '/signs', description: 'Make a yard sign or poster before you head out' },
  { label: 'Yard signs (order)', href: '/products', description: 'Ready-made designs from local organizers' },
]

export default function ProtestsPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [protests, setProtests] = useState<Protest[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [featuredCampaign, setFeaturedCampaign] = useState<FeaturedCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('All cities')
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<ProtestTopicId | 'all'>('all')
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [calendarExpanded, setCalendarExpanded] = useState(false)

  const startOfToday = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  type ProtestWithDate = Protest & { parsedDate: Date }

  const protestsWithDates = useMemo(() => {
    return protests
      .map((protest) => ({
        ...protest,
        parsedDate: parseProtestDate(protest.date),
      }))
      .filter((p): p is ProtestWithDate => p.parsedDate !== null)
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return a.parsedDate.getTime() - b.parsedDate.getTime()
      })
  }, [protests])

  const upcomingProtests = useMemo(
    () => protestsWithDates.filter((p) => p.parsedDate >= startOfToday),
    [protestsWithDates, startOfToday]
  )

  const pastProtests = useMemo(
    () => protestsWithDates.filter((p) => p.parsedDate < startOfToday),
    [protestsWithDates, startOfToday]
  )

  const displayPool = showPastEvents ? protestsWithDates : upcomingProtests

  const cityOptions = useMemo(() => {
    const cities = new Set<string>()
    displayPool.forEach((protest) => {
      const city = getCityFromLocation(protest.location)
      if (city) cities.add(city)
    })
    return ['All cities', ...Array.from(cities).sort()]
  }, [displayPool])

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>()
    displayPool.forEach((protest) => {
      const year = protest.parsedDate.getFullYear()
      const month = protest.parsedDate.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      const label = protest.parsedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      months.set(key, label)
    })
    return Array.from(months.entries()).sort(([a], [b]) => (a < b ? -1 : 1))
  }, [displayPool])

  useEffect(() => {
    if (!selectedMonth && monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0][0])
    }
  }, [monthOptions, selectedMonth])

  const filteredProtests = useMemo(() => {
    return displayPool.filter((protest) => {
      const city = getCityFromLocation(protest.location)
      const cityMatch = selectedCity === 'All cities' || city === selectedCity || protest.location?.startsWith(selectedCity)
      const monthMatch = !selectedMonth
        ? true
        : `${protest.parsedDate.getFullYear()}-${String(protest.parsedDate.getMonth() + 1).padStart(2, '0')}` === selectedMonth
      const topicMatch =
        selectedTopic === 'all' || (protest.topics?.includes(selectedTopic) ?? false)
      return cityMatch && monthMatch && topicMatch
    })
  }, [displayPool, selectedCity, selectedMonth, selectedTopic])

  const calendarProtests = useMemo(
    () => filteredProtests.filter((p) => p.status !== 'cancelled'),
    [filteredProtests]
  )

  const calendarDaysWithEvents = useMemo(() => {
    if (!selectedMonth) return 0
    const days = new Set<number>()
    calendarProtests.forEach((protest) => {
      days.add(protest.parsedDate.getDate())
    })
    return days.size
  }, [calendarProtests, selectedMonth])

  const showCalendarBlock = calendarDaysWithEvents > 1

  const calendarDays = useMemo(() => {
    if (!selectedMonth) return []
    const [yearStr, monthStr] = selectedMonth.split('-')
    const year = parseInt(yearStr, 10)
    const monthIndex = parseInt(monthStr, 10) - 1
    const firstDay = new Date(year, monthIndex, 1)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const startOffset = firstDay.getDay()
    const days: Array<{ day: number | null; events: typeof filteredProtests }> = []
    for (let i = 0; i < startOffset; i += 1) {
      days.push({ day: null, events: [] })
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayEvents = calendarProtests.filter((protest) => {
        if (!protest.parsedDate) return false
        return (
          protest.parsedDate.getFullYear() === year &&
          protest.parsedDate.getMonth() === monthIndex &&
          protest.parsedDate.getDate() === day
        )
      })
      days.push({ day, events: dayEvents })
    }
    return days
  }, [calendarProtests, selectedMonth])

  const mobileEventGroups = useMemo(() => {
    if (!selectedMonth) return []
    const groups = new Map<string, typeof calendarProtests>()
    calendarProtests.forEach((protest) => {
      if (!protest.parsedDate) return
      const key = protest.parsedDate.toISOString().slice(0, 10)
      const group = groups.get(key) || []
      group.push(protest)
      groups.set(key, group)
    })
    return Array.from(groups.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, items]) => {
        const date = items[0]?.parsedDate
        const label = date
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : key
        return { key, label, items }
      })
  }, [calendarProtests, selectedMonth])

  useEffect(() => {
    const url = getPublicDataFile('protests.json')
    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const file = parseProtestsFile(data)
        setProtests(file.events)
        setLastUpdated(file.lastUpdated ?? null)
        setFeaturedCampaign(file.featuredCampaign?.enabled ? file.featuredCampaign : null)
      })
      .catch(() => setProtests([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || typeof window === 'undefined') return
    if (monthOptions.length > 0 && !selectedMonth) return

    const scrollToEventList = () => {
      if (window.location.hash !== '#event-list') return
      const el = document.getElementById('event-list')
      if (!el) return
      const nav = document.querySelector('nav')
      const stickyH = nav?.getBoundingClientRect().height ?? 0
      const gap = 12
      const top = el.getBoundingClientRect().top + window.scrollY - stickyH - gap
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }

    scrollToEventList()
    let nestedRaf = 0
    const outerRaf = requestAnimationFrame(() => {
      nestedRaf = requestAnimationFrame(scrollToEventList)
    })
    const t = window.setTimeout(scrollToEventList, 240)
    window.addEventListener('hashchange', scrollToEventList)
    return () => {
      cancelAnimationFrame(outerRaf)
      if (nestedRaf) cancelAnimationFrame(nestedRaf)
      window.clearTimeout(t)
      window.removeEventListener('hashchange', scrollToEventList)
    }
  }, [loading, selectedMonth, monthOptions.length])

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
      <div className="relative z-10 pt-20 sm:pt-24">
        {/* Hero */}
        <section className="relative px-4 sm:px-6 md:px-8 py-12 md:py-20 bg-gradient-to-b from-blue-50/80 via-white to-white border-b border-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-800/70 mb-4 font-medium"
            >
              Events
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight"
            >
              Protests &amp; rallies across Ontario
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg sm:text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              A single calendar for province-wide and local actions—healthcare, land, water, schools, and
              accountability. Showing up in person still shifts what politicians can ignore.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <a
                href="#find-nearest"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-slate-900 text-white text-sm font-light hover:bg-slate-800 transition-colors"
              >
                Find nearest protest
              </a>
              <a
                href="#event-list"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-light hover:bg-slate-50 transition-colors"
              >
                Browse all events
              </a>
              <a
                href="#protest-faq"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-light hover:bg-slate-50 transition-colors"
              >
                First-time FAQ
              </a>
            </motion.div>
          </div>
        </section>

        {!loading && upcomingProtests.length > 0 && (
          <FindNearestProtest
            protests={upcomingProtests}
            campaignId={featuredCampaign?.campaignId}
            dateLabel={
              featuredCampaign?.label?.includes('June 27')
                ? 'Saturday June 27, 2026'
                : 'upcoming province-wide actions'
            }
          />
        )}

        <ProtestFaq />

        <section className="px-4 sm:px-6 md:px-8 py-14 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6">
              Why this page exists
            </motion.h2>
            <motion.div {...fadeIn} className="space-y-5 text-lg text-gray-700 font-light leading-relaxed">
              <p>
                Ontario has no one official protest calendar. Actions are announced by unions, community groups,
                health coalitions, and local organizers—often on social media, email lists, or separate websites.
                Protect Ontario gathers upcoming dates here so you can see what&apos;s happening near you without
                hunting across platforms.
              </p>
              <p>
                Listings focus on actions tied to{' '}
                <strong className="font-normal text-gray-900">public services, environmental protection, land use, and provincial accountability</strong>
                —the same themes covered elsewhere on this site. We verify links when we can; always confirm time and
                location with the organizer before you travel.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-14 md:py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-5xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 text-center">
              What people are rallying for
            </motion.h2>
            <motion.p {...fadeIn} className="text-center text-gray-600 font-light max-w-2xl mx-auto mb-10">
              Most events connect to one or more of these issues. Each link goes to background and sources on Protect Ontario.
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {rallyTopics.map((topic, idx) => (
                <motion.div
                  key={topic.href}
                  {...fadeIn}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={topic.href}
                    className="block h-full rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <h3 className="text-lg font-light text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">{topic.description}</p>
                    <span className="inline-block mt-4 text-sm text-blue-600 font-light">Learn more →</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-14 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.h2 {...fadeIn} className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 text-center">
              Before you go
            </motion.h2>
            <motion.p {...fadeIn} className="text-center text-gray-600 font-light max-w-2xl mx-auto mb-10">
              Practical resources on this site—not legal advice. Follow organizer instructions at the event.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getReadyLinks.map((item, idx) => {
                const isHash = item.href.startsWith('#')
                const className =
                  'flex flex-col h-full rounded-xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-blue-50/40 hover:border-blue-100 transition-colors'
                return (
                  <motion.div key={item.href} {...fadeIn} transition={{ delay: idx * 0.05 }}>
                    {isHash ? (
                      <a href={item.href} className={className}>
                        <span className="text-lg font-light text-gray-900">{item.label}</span>
                        <span className="text-sm text-gray-600 font-light mt-1">{item.description}</span>
                      </a>
                    ) : (
                      <Link href={item.href} className={className}>
                        <span className="text-lg font-light text-gray-900">{item.label}</span>
                        <span className="text-sm text-gray-600 font-light mt-1">{item.description}</span>
                      </Link>
                    )}
                  </motion.div>
                )
              })}
            </div>
            <motion.div
              {...fadeIn}
              className="mt-10 rounded-xl bg-blue-50/60 border border-blue-100 p-6 sm:p-8 text-center"
            >
              <p className="text-gray-700 font-light text-base sm:text-lg leading-relaxed">
                <strong className="font-normal text-gray-900">Want to add an event?</strong> Anyone can suggest a rally—we
                don&apos;t offer organizer logins. Send the title, date, time, city, address, and a link (if you have one)
                through the{' '}
                <Link href="/about#contact" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
                  contact form on About
                </Link>
                . We review submissions and publish updates here.
              </p>
            </motion.div>
          </div>
        </section>

        {featuredCampaign?.label && (
          <section className="px-4 sm:px-6 md:px-8 py-8 bg-[#9f1239]/5 border-y border-[#9f1239]/20">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-[#9f1239]/80 mb-2 font-medium">Featured</p>
              <p className="text-xl sm:text-2xl font-light text-gray-900">{featuredCampaign.label}</p>
              <a
                href="#event-list"
                className="inline-block mt-4 text-sm text-[#9f1239] font-light underline underline-offset-2 hover:text-[#881337]"
              >
                Jump to event list →
              </a>
            </div>
          </section>
        )}

        {/* Event list + filters */}
        <section
          id="event-list"
          className="relative scroll-mt-28 sm:scroll-mt-32 px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50 border-b border-slate-200 overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-300 to-blue-600 opacity-70" />
          <div className="max-w-5xl mx-auto pr-4 sm:pl-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 mb-6">
              <div className="flex-1">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Upcoming events</p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Find a protest near you</h2>
                <p className="text-gray-600 font-light">
                  Past rallies are hidden by default. Filter by city, month, and topic.
                  {lastUpdated && (
                    <span className="block text-sm text-slate-500 mt-1">List last updated {lastUpdated}.</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="text-sm text-slate-500 font-light">
                  City
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="mt-1 block w-full sm:w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-500 font-light">
                  Month
                  <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-1 block w-full sm:w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {monthOptions.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setSelectedTopic('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-light border transition-colors ${
                  selectedTopic === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-gray-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                All topics
              </button>
              {PROTEST_TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTopic(t.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-light border transition-colors ${
                    selectedTopic === t.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-gray-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              {!loading && filteredProtests.length > 0 && (
                <p className="text-sm text-slate-500 font-light">{filteredProtests.length} shown</p>
              )}
              {pastProtests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPastEvents((v) => !v)}
                  className="text-sm text-blue-600 font-light underline underline-offset-2 hover:text-blue-700"
                >
                  {showPastEvents
                    ? 'Hide past events'
                    : `Show past events (${pastProtests.length})`}
                </button>
              )}
            </div>

            {loading ? (
              <div className="rounded-xl bg-white border border-slate-200 p-12 text-center">
                <p className="text-gray-500 font-light">Loading…</p>
              </div>
            ) : protests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-white border border-slate-200 p-8 md:p-12 text-center"
              >
                <p className="text-gray-600 font-light">
                  No protests are listed yet. Check back soon or see the{' '}
                  <Link href="/take-action" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                    Take action
                  </Link>{' '}
                  page for other ways to get involved.
                </p>
              </motion.div>
            ) : filteredProtests.length === 0 ? (
              <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-gray-600 font-light">
                No events match your filters.
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                {filteredProtests.map((protest, idx) => {
                  const mapsUrl = mapsUrlForEvent(protest)
                  const isCancelled = protest.status === 'cancelled'
                  const isPostponed = protest.status === 'postponed'
                  return (
                    <motion.article
                      key={protest.id}
                      id={`event-${protest.id}`}
                      {...fadeIn}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-2xl bg-white border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                        protest.featured ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                      } ${isCancelled ? 'opacity-60' : ''}`}
                    >
                      <div className="p-6 sm:p-8 flex flex-col h-full">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {protest.featured && (
                            <span className="rounded-full bg-blue-100 text-blue-800 text-xs px-2 py-0.5 font-light">
                              Featured
                            </span>
                          )}
                          {isCancelled && (
                            <span className="rounded-full bg-red-100 text-red-800 text-xs px-2 py-0.5 font-light">
                              Cancelled
                            </span>
                          )}
                          {isPostponed && (
                            <span className="rounded-full bg-amber-100 text-amber-900 text-xs px-2 py-0.5 font-light">
                              Postponed
                            </span>
                          )}
                          {protest.topics?.map((tid) => (
                            <span
                              key={tid}
                              className="rounded-full bg-slate-100 text-slate-600 text-xs px-2 py-0.5 font-light"
                            >
                              {topicLabel(tid)}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-500 font-light mb-3">
                          <span>{protest.date}</span>
                          <span className="text-slate-300">·</span>
                          <span>{protest.location}</span>
                        </div>
                        {protest.organizer && (
                          <p className="text-sm text-slate-600 font-light mb-2">{protest.organizer}</p>
                        )}
                        <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3 leading-tight">
                          {protest.title}
                        </h2>
                        {protest.address && (
                          <p className="text-sm text-gray-500 font-light mb-2">{protest.address}</p>
                        )}
                        {protest.description && (
                          <p className="text-gray-600 font-light leading-relaxed flex-grow mb-4">
                            {protest.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-auto pt-2">
                          {protest.link && (
                            <a
                              href={protest.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-light text-sm"
                            >
                              Event page →
                            </a>
                          )}
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-light text-sm"
                            >
                              Directions →
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            )}

            {showCalendarBlock && !loading && filteredProtests.length > 0 && (
              <div className="mt-12 pt-10 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCalendarExpanded((v) => !v)}
                  className="flex w-full items-center justify-between gap-4 text-left rounded-xl border border-slate-200 bg-white px-5 py-4 hover:bg-slate-50 transition-colors"
                  aria-expanded={calendarExpanded}
                >
                  <span>
                    <span className="block text-sm uppercase tracking-[0.2em] text-slate-400 mb-1">
                      Optional
                    </span>
                    <span className="block text-lg font-light text-gray-900">Calendar view</span>
                    <span className="block text-sm text-slate-500 font-light mt-1">
                      Month grid for {monthOptions.find(([k]) => k === selectedMonth)?.[1] ?? 'selected month'}
                    </span>
                  </span>
                  <span className="text-slate-400 text-xl shrink-0" aria-hidden>
                    {calendarExpanded ? '−' : '+'}
                  </span>
                </button>

                {calendarExpanded && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-7 bg-slate-100 text-xs uppercase tracking-widest text-slate-500">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="px-3 py-2 text-center">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-px bg-slate-100">
                        {calendarDays.map((cell, idx) => (
                          <div key={`${cell.day}-${idx}`} className="min-h-[110px] bg-white p-2">
                            <div className="text-xs text-slate-400 mb-1">{cell.day ?? ''}</div>
                            <div className="space-y-1">
                              {cell.events.slice(0, 2).map((event) => {
                                const city = getCityFromLocation(event.location)
                                return (
                                  <button
                                    key={event.id}
                                    type="button"
                                    onClick={() => {
                                      document.getElementById(`event-${event.id}`)?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                      })
                                    }}
                                    className="w-full text-left rounded-md bg-blue-50 text-blue-700 text-xs px-2 py-1 leading-tight hover:bg-blue-100 transition-colors"
                                  >
                                    <span className="block font-medium">{event.title}</span>
                                    {city ? (
                                      <span className="block text-[11px] text-blue-500">{city}</span>
                                    ) : null}
                                  </button>
                                )
                              })}
                              {cell.events.length > 2 && (
                                <div className="text-xs text-slate-400">+{cell.events.length - 2} more</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="sm:hidden">
                      <div className="divide-y divide-slate-100">
                        {mobileEventGroups.length === 0 ? (
                          <div className="p-4 text-sm text-slate-500">No events this month.</div>
                        ) : (
                          mobileEventGroups.map((group) => (
                            <div key={group.key} className="p-4">
                              <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                                {group.label}
                              </div>
                              <div className="space-y-2">
                                {group.items.map((event) => {
                                  const city = getCityFromLocation(event.location)
                                  return (
                                    <button
                                      key={event.id}
                                      type="button"
                                      onClick={() => {
                                        document.getElementById(`event-${event.id}`)?.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'start',
                                        })
                                      }}
                                      className="w-full text-left rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-sm text-blue-800"
                                    >
                                      <div className="font-medium">{event.title}</div>
                                      {city ? <div className="text-xs text-blue-600">{city}</div> : null}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Back to Take action */}
        <section className="px-4 sm:px-6 md:px-8 py-8 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto text-center">
            <Link
              href="/take-action"
              className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
            >
              ← Back to What you can do
            </Link>
          </div>
        </section>
      </div>

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
