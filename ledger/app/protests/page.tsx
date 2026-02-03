'use client'

import TopNavigation from '../../components/TopNavigation'
import MethodologyDrawer from '../../components/MethodologyDrawer'
import DataSourcesDrawer from '../../components/DataSourcesDrawer'
import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPublicDataFile } from '../../utils/dataPath'
import type { Protest } from '../../data/protests'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

export default function ProtestsPage() {
  const [showMethodology, setShowMethodology] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [protests, setProtests] = useState<Protest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('All cities')
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const parseProtestDate = (dateStr: string) => {
    if (!dateStr) return null
    const [datePartRaw, timePartRaw] = dateStr.split('·').map((part) => part.trim())
    const datePart = datePartRaw || ''
    const timePart = timePartRaw || ''
    const dateMatch = datePart.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})$/)
    if (!dateMatch) return null
    const [, monthNameRaw, dayRaw, yearRaw] = dateMatch
    const monthName = monthNameRaw.toLowerCase()
    const monthMap: Record<string, number> = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    }
    const monthIndex = monthMap[monthName]
    if (monthIndex === undefined) return null
    const timeMatch = timePart.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
    let hour = 12
    let minute = 0
    if (timeMatch) {
      const rawHour = parseInt(timeMatch[1], 10)
      const rawMinute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0
      const meridiem = timeMatch[3].toUpperCase()
      hour = rawHour % 12
      if (meridiem === 'PM') hour += 12
      minute = rawMinute
    }
    const year = parseInt(yearRaw, 10)
    const day = parseInt(dayRaw, 10)
    return new Date(year, monthIndex, day, hour, minute)
  }

  const formattedProtests = useMemo(() => {
    return protests
      .map((protest) => ({
        ...protest,
        parsedDate: parseProtestDate(protest.date),
      }))
      .sort((a, b) => {
        if (!a.parsedDate || !b.parsedDate) return 0
        return a.parsedDate.getTime() - b.parsedDate.getTime()
      })
  }, [protests])

  const cityOptions = useMemo(() => {
    const cities = new Set<string>()
    formattedProtests.forEach((protest) => {
      if (!protest.location) return
      const city = protest.location.split(',')[0]?.trim()
      if (city) cities.add(city)
    })
    return ['All cities', ...Array.from(cities).sort()]
  }, [formattedProtests])

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>()
    formattedProtests.forEach((protest) => {
      if (!protest.parsedDate) return
      const year = protest.parsedDate.getFullYear()
      const month = protest.parsedDate.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      const label = protest.parsedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      months.set(key, label)
    })
    return Array.from(months.entries()).sort(([a], [b]) => (a < b ? -1 : 1))
  }, [formattedProtests])

  useEffect(() => {
    if (!selectedMonth && monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0][0])
    }
  }, [monthOptions, selectedMonth])

  const filteredProtests = useMemo(() => {
    return formattedProtests.filter((protest) => {
      const cityMatch =
        selectedCity === 'All cities' || protest.location?.startsWith(selectedCity)
      const monthMatch = !selectedMonth
        ? true
        : protest.parsedDate
          ? `${protest.parsedDate.getFullYear()}-${String(protest.parsedDate.getMonth() + 1).padStart(2, '0')}` === selectedMonth
          : false
      return cityMatch && monthMatch
    })
  }, [formattedProtests, selectedCity, selectedMonth])

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
      const dayEvents = filteredProtests.filter((protest) => {
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
  }, [filteredProtests, selectedMonth])

  const mobileEventGroups = useMemo(() => {
    if (!selectedMonth) return []
    const groups = new Map<string, typeof filteredProtests>()
    filteredProtests.forEach((protest) => {
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
  }, [filteredProtests, selectedMonth])

  useEffect(() => {
    const url = getPublicDataFile('protests.json')
    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProtests(Array.isArray(data) ? data : [])
      })
      .catch(() => setProtests([]))
      .finally(() => setLoading(false))
  }, [])

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
        <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight"
            >
              Protests &amp; rallies
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 font-light max-w-2xl mx-auto"
            >
              Rallies and protests calling for accountability from the Ford government, across Ontario. Add your voice in person.
            </motion.p>
          </div>
        </section>

        {/* Filters + Calendar */}
        <section className="relative px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50 border-b border-slate-200 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 opacity-80" />
          <div className="max-w-5xl mx-auto pl-4 sm:pl-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <div className="flex-1">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Browse events</p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Find a protest near you</h2>
                <p className="text-gray-600 font-light">Filter by city and view events on the calendar.</p>
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

            {loading ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
                Loading calendar…
              </div>
            ) : monthOptions.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No events listed yet.
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                            const city = event.location?.split(',')[0]?.trim()
                            return (
                              <button
                                key={event.id}
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`event-${event.id}`)
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                  }
                                }}
                                className="w-full text-left rounded-md bg-blue-50 text-blue-700 text-xs px-2 py-1 leading-tight hover:bg-blue-100 transition-colors"
                              >
                                <span className="block font-medium">{event.title}</span>
                                {city ? <span className="block text-[11px] text-blue-500">{city}</span> : null}
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
                          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">{group.label}</div>
                          <div className="space-y-2">
                            {group.items.map((event) => {
                              const city = event.location?.split(',')[0]?.trim()
                              return (
                                <button
                                  key={event.id}
                                  type="button"
                                  onClick={() => {
                                    const el = document.getElementById(`event-${event.id}`)
                                    if (el) {
                                      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    }
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
        </section>

        {/* Card list */}
        <section className="relative px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50 min-h-[50vh] overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-blue-300 to-blue-600 opacity-70" />
          <div className="max-w-5xl mx-auto pr-4 sm:pr-6">
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
            ) : (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                {filteredProtests.map((protest, idx) => (
                  <motion.article
                    key={protest.id}
                    id={`event-${protest.id}`}
                    {...fadeIn}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 sm:p-8 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-wrap gap-2 text-sm text-slate-500 font-light">
                          <span>{protest.date}</span>
                          <span className="text-slate-300">·</span>
                          <span>{protest.location}</span>
                        </div>
                        <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-1">Event</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-light text-gray-900 mb-3 leading-tight">
                        {protest.title}
                      </h2>
                      {protest.description && (
                        <p className="text-gray-600 font-light leading-relaxed flex-grow mb-4">
                          {protest.description}
                        </p>
                      )}
                      {protest.link ? (
                        <a
                          href={protest.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-light text-sm mt-auto"
                        >
                          Event details →
                        </a>
                      ) : null}
                    </div>
                  </motion.article>
                ))}
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
