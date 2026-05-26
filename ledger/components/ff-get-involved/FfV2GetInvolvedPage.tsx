'use client'

import { useCallback, useState } from 'react'
import GetInvolvedForm from '@/components/get-involved/GetInvolvedForm'
import { PROTECT_ONTARIO_DONATE_URL, type InvolvementRole } from '@/lib/get-involved'
import {
  FF_COLORS,
  FF_INTRO,
  FF_SIGN_DOWNLOADS,
  FFV2_SOURCE_PAGE,
} from '@/lib/ff-get-involved'

const QUICK_ACTIONS: {
  id: string
  title: string
  subtitle: string
  role?: InvolvementRole
  icon: string
}[] = [
  { id: 'signs', title: 'Signs', subtitle: 'Order or download artwork', role: 'yard-sign', icon: '🪧' },
  {
    id: 'hub',
    title: 'Sign Pickup Hub',
    subtitle: 'Host a local pickup point',
    role: 'dropoff',
    icon: '📍',
  },
  { id: 'volunteer', title: 'Volunteer', subtitle: 'Deliveries, outreach & events', role: 'volunteer', icon: '🤝' },
  { id: 'donations', title: 'Donations', subtitle: 'Support the campaign', icon: '❤️' },
  { id: 'other', title: 'Other', subtitle: 'Ideas, connections, skills', role: 'other', icon: '💡' },
]

function SectionCard({
  id,
  children,
  className = '',
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-3xl border border-[#f9e04c]/25 bg-gradient-to-br from-white/[0.12] to-white/[0.04] p-6 sm:p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45)] backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <h2
        className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] sm:text-base"
        style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
      >
        {children}
      </h2>
      <span className="h-px flex-1 min-w-[3rem] bg-[#f9e04c]/30" aria-hidden />
    </div>
  )
}

function AccentLink({
  href,
  onClick,
  children,
  className = '',
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  const base =
    'inline-flex items-center gap-1 font-semibold underline decoration-2 underline-offset-4 transition-colors hover:decoration-[#ff66b2]'
  const style = { color: FF_COLORS.link }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${className}`} style={style}>
        {children}
      </button>
    )
  }
  return (
    <a
      href={href}
      className={`${base} ${className}`}
      style={style}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
      {href?.startsWith('http') && (
        <span className="text-xs opacity-80" aria-hidden>
          ↗
        </span>
      )}
    </a>
  )
}

function PrimaryButton({
  href,
  onClick,
  children,
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  const className =
    'inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-bold uppercase tracking-wide shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
  const style = { backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {children}
      </button>
    )
  }
  return (
    <a
      href={href}
      className={className}
      style={style}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  )
}

export default function FfV2GetInvolvedPage() {
  const [presetRole, setPresetRole] = useState<InvolvementRole | ''>('')
  const [activeNav, setActiveNav] = useState<string>('')

  const goToForm = useCallback((role: InvolvementRole) => {
    setPresetRole(role)
    setActiveNav(role)
    requestAnimationFrame(() => {
      document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveNav(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const textClass = 'text-[#f9e04c]'

  return (
    <div
      className="relative min-h-screen overflow-x-hidden antialiased"
      style={{ backgroundColor: FF_COLORS.background }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #5c3d9e 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -left-32 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2a1f52 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 h-[min(45vh,360px)] w-[min(55vw,420px)] opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.18) 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div
          className="absolute bottom-24 left-0 h-[min(35vh,280px)] w-[min(45vw,320px)] opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-28 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        {/* Hero */}
        <header className="mb-14 text-center sm:mb-16">
          <p
            className="mb-4 inline-block rounded-full border border-[#f9e04c]/30 bg-[#f9e04c]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f9e04c]"
          >
            Grassroots · Ontario
          </p>
          <h1
            className="text-4xl font-bold leading-tight tracking-tight text-[#f9e04c] sm:text-5xl md:text-6xl"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.25)' }}
          >
            Hi there!
          </h1>
          <div className={`mx-auto mt-8 max-w-2xl space-y-4 text-base leading-relaxed sm:text-lg ${textClass}`}>
            {FF_INTRO.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </header>

        {/* Quick actions */}
        <nav className="mb-16" aria-label="What are you here for?">
          <h2 className={`mb-6 text-center text-xl font-semibold sm:text-2xl ${textClass}`}>
            What are you here for?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACTIONS.map((action) => {
              const isActive = activeNav === (action.role ?? action.id)
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    if (action.role) {
                      goToForm(action.role)
                      return
                    }
                    scrollToSection(action.id)
                  }}
                  className={`group flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                    isActive
                      ? 'border-[#ff3399] bg-[#ff3399]/15 shadow-lg ring-2 ring-[#ff3399]/40'
                      : 'border-[#f9e04c]/20 bg-[#f9e04c]/[0.07] hover:border-[#f9e04c]/45 hover:bg-[#f9e04c]/[0.12]'
                  }`}
                >
                  <span className="mb-3 text-2xl" aria-hidden>
                    {action.icon}
                  </span>
                  <span className="text-base font-bold text-[#f9e04c]">{action.title}</span>
                  <span className="mt-1 text-sm leading-snug text-[#f9e04c]/75">{action.subtitle}</span>
                  <span
                    className="mt-3 text-xs font-semibold uppercase tracking-wide transition-colors"
                    style={{ color: FF_COLORS.link }}
                  >
                    {action.role ? 'Go to form →' : 'View section →'}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="space-y-8 sm:space-y-10">
          {/* Signs */}
          <SectionCard id="signs">
            <SectionTitle>Signs</SectionTitle>
            <div className={`space-y-5 text-base leading-relaxed sm:text-[1.05rem] ${textClass}`}>
              <p>
                You can either order signs directly through us or download the artwork and have it printed
                yourself at a local printer. Pricing may vary depending on your location and the quantity
                ordered.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3 rounded-2xl border border-[#f9e04c]/15 bg-black/10 p-4">
                  <span className="text-lg" aria-hidden>
                    1
                  </span>
                  <span>
                    <AccentLink onClick={() => goToForm('yard-sign')}>Order a sign from us</AccentLink>
                  </span>
                </li>
                <li className="flex gap-3 rounded-2xl border border-[#f9e04c]/15 bg-black/10 p-4">
                  <span className="text-lg" aria-hidden>
                    2
                  </span>
                  <span>
                    Download a high-resolution file for home printing or professional printing:{' '}
                    <AccentLink href={FF_SIGN_DOWNLOADS.highRes}>High-resolution Dropbox</AccentLink>
                  </span>
                </li>
                <li className="flex gap-3 rounded-2xl border border-[#f9e04c]/15 bg-black/10 p-4">
                  <span className="text-lg" aria-hidden>
                    3
                  </span>
                  <span>
                    Download a low-resolution file for online sharing and social media posts:{' '}
                    <AccentLink href={FF_SIGN_DOWNLOADS.lowRes}>Low-resolution Dropbox</AccentLink>
                  </span>
                </li>
              </ul>
              <div className="rounded-2xl border border-[#f9e04c]/40 bg-[#f9e04c]/15 px-5 py-4">
                <p className="font-semibold text-[#f9e04c]">
                  Signs ordered through us are $10 each plus delivery. All digital downloads are free.
                </p>
              </div>
              <p className="text-[#f9e04c]/90">
                If you&apos;d like to support the campaign further, donations are always appreciated.
                Additional funds help us expand our reach through larger signs, billboards, promotional
                materials, T-shirts, and more.
              </p>
            </div>
          </SectionCard>

          {/* Pickup hub */}
          <SectionCard id="pickup-hub">
            <SectionTitle>Sign Pickup Hub</SectionTitle>
            <div className={`space-y-4 text-base leading-relaxed sm:text-[1.05rem] ${textClass}`}>
              <p>Interested in becoming a local pickup location?</p>
              <p>
                Please provide your location, availability, and contact information so we can determine
                whether a Sign Pickup Hub would be a good fit for your area.
              </p>
              <PrimaryButton onClick={() => goToForm('dropoff')}>Fill out the sign-up form</PrimaryButton>
            </div>
          </SectionCard>

          {/* Volunteer */}
          <SectionCard id="volunteer">
            <SectionTitle>Volunteer</SectionTitle>
            <div className={`space-y-4 text-base leading-relaxed sm:text-[1.05rem] ${textClass}`}>
              <p>We&apos;re always looking for people who want to help make a difference.</p>
              <p>
                Whether you can assist with deliveries, organizing, outreach, logistics, events, or other
                tasks, we&apos;d love to hear from you.
              </p>
              <p>Please provide your contact information and availability.</p>
              <PrimaryButton onClick={() => goToForm('volunteer')}>Fill out the sign-up form</PrimaryButton>
            </div>
          </SectionCard>

          {/* Donations */}
          <SectionCard id="donations">
            <SectionTitle>Donations</SectionTitle>
            <div className={`space-y-5 text-base leading-relaxed sm:text-[1.05rem] ${textClass}`}>
              <p>Thank you for supporting our efforts.</p>
              <p>
                Every contribution helps us reach more communities, expand our visibility, and continue
                growing the movement.
              </p>
              <PrimaryButton href={PROTECT_ONTARIO_DONATE_URL}>Donate</PrimaryButton>
            </div>
          </SectionCard>

          {/* Other */}
          <SectionCard id="other">
            <SectionTitle>Other</SectionTitle>
            <div className={`space-y-4 text-base leading-relaxed sm:text-[1.05rem] ${textClass}`}>
              <p>Have an idea, resource, connection, or skill that could help?</p>
              <p>
                We&apos;re always interested in hearing suggestions related to logistics, community contacts,
                delivery support, fundraising, media opportunities, or anything else that could strengthen our
                efforts.
              </p>
              <PrimaryButton onClick={() => goToForm('other')}>Share your thoughts with us</PrimaryButton>
            </div>
          </SectionCard>

          {/* Form */}
          <section id="signup-form" className="scroll-mt-24 pt-4">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#f9e04c] sm:text-3xl">Sign-up form</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-[#f9e04c]/80 sm:text-base">
                One form for signs, pickup hubs, volunteering, and more. We&apos;ll follow up by email.
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_32px_100px_-20px_rgba(0,0,0,0.5)] ring-1 ring-black/5">
              <GetInvolvedForm
                variant="ff"
                sourcePage={FFV2_SOURCE_PAGE}
                presetRole={presetRole}
                embedded
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
