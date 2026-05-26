'use client'

import { useCallback, useState } from 'react'
import GetInvolvedForm from '@/components/get-involved/GetInvolvedForm'
import { PROTECT_ONTARIO_DONATE_URL, type InvolvementRole } from '@/lib/get-involved'
import {
  FF_COLORS,
  FF_INTRO,
  FF_PAGE_GRADIENT,
  FF_SOURCE_PAGE,
  FF_YARD_SIGN_DESIGNS,
} from '@/lib/ff-get-involved'

type QuickAction = {
  id: string
  title: string
  subtitle: string
  role?: InvolvementRole
  icon: 'sign' | 'hub' | 'volunteer' | 'donate' | 'other'
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'signs', title: 'Signs', subtitle: 'Order or download artwork', role: 'yard-sign', icon: 'sign' },
  { id: 'pickup-hub', title: 'Sign Pickup Hub', subtitle: 'Host a local pickup point', role: 'dropoff', icon: 'hub' },
  { id: 'volunteer', title: 'Volunteer', subtitle: 'Deliveries, outreach & events', role: 'volunteer', icon: 'volunteer' },
  { id: 'donations', title: 'Donations', subtitle: 'Support the campaign', icon: 'donate' },
  { id: 'other', title: 'Other', subtitle: 'Ideas, connections, skills', role: 'other', icon: 'other' },
]

function ActionIcon({ type }: { type: QuickAction['icon'] }) {
  const className = 'h-6 w-6'
  const stroke = FF_COLORS.headingText
  switch (type) {
    case 'sign':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 9h4M7 13h10" strokeLinecap="round" />
        </svg>
      )
    case 'hub':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case 'volunteer':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
          <circle cx="9" cy="7" r="3" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
        </svg>
      )
    case 'donate':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'other':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

function SectionCard({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 sm:scroll-mt-32 rounded-[1.75rem] border border-[#f9e04c]/20 bg-gradient-to-br from-white/[0.14] via-white/[0.06] to-transparent p-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-[#f9e04c]/35 sm:rounded-[2rem] sm:p-8 lg:p-10"
    >
      {children}
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="border-b border-[#f9e04c]/25 pb-3 text-2xl font-bold tracking-tight text-[#f9e04c] sm:text-3xl">
        {children}
      </h2>
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
    'inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-[3px] transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm'
  const style = { color: FF_COLORS.link, outlineColor: FF_COLORS.link }

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
        <span className="text-[0.65rem] font-bold opacity-90" aria-hidden>
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
  fullWidthOnMobile = true,
  download,
}: {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  fullWidthOnMobile?: boolean
  download?: string
}) {
  const className = [
    'inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold uppercase tracking-[0.08em]',
    'shadow-[0_8px_24px_-8px_rgba(249,224,76,0.55)] transition-all motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-[0_12px_32px_-8px_rgba(249,224,76,0.65)] motion-safe:active:scale-[0.98]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    fullWidthOnMobile ? 'w-full sm:w-auto' : '',
  ].join(' ')
  const style = {
    backgroundColor: FF_COLORS.headingBg,
    color: FF_COLORS.headingText,
    outlineColor: FF_COLORS.headingBg,
  }

  const arrow = (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {children}
        {arrow}
      </button>
    )
  }
  return (
    <a
      href={href}
      download={download}
      className={className}
      style={style}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
      {arrow}
    </a>
  )
}

function YardSignPreview({
  title,
  imageUrl,
  downloadUrl,
  filename,
}: {
  title: string
  imageUrl: string
  downloadUrl: string
  filename: string
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#f9e04c]/20 bg-black/15 shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={`Yard sign: ${title}`}
        className="w-full bg-black/25 object-contain"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <p className="text-sm font-semibold leading-snug text-[#f9e04c] sm:text-base">{title}</p>
        <PrimaryButton href={downloadUrl} download={filename} fullWidthOnMobile>
          Download sign
        </PrimaryButton>
      </div>
    </article>
  )
}

function SignOptionCard({
  step,
  children,
}: {
  step: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-[#f9e04c]/15 bg-black/15 p-4 sm:p-5 transition-colors hover:border-[#f9e04c]/30 hover:bg-black/20">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
        style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
        aria-hidden
      >
        {step}
      </span>
      <span className="min-w-0 flex-1 pt-0.5 text-[0.95rem] leading-relaxed sm:text-base">{children}</span>
    </li>
  )
}

export default function FfGetInvolvedPage() {
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

  const handleQuickAction = (action: QuickAction) => {
    if (action.role) {
      goToForm(action.role)
      return
    }
    scrollToSection(action.id)
  }

  const prose = `text-[#f9e04c] text-[0.95rem] leading-relaxed sm:text-base sm:leading-relaxed`

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden antialiased selection:bg-[#f9e04c]/30 selection:text-[#1a1a1a]"
      style={{ background: FF_PAGE_GRADIENT }}
    >
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 28%, rgba(0,0,0,0.12) 100%)',
          }}
        />
        <div
          className="absolute -top-32 right-[-8%] h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl sm:h-[34rem] sm:w-[34rem]"
          style={{ background: 'radial-gradient(circle, #f5b87a 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-[12%] left-[-12%] h-80 w-80 rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(circle, #e07830 0%, transparent 68%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-96 w-[120%] -translate-x-1/2 opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at center, #f9e04c 0%, transparent 55%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
          }}
        />
      </div>

      {/* Sticky jump nav — mobile & tablet */}
      <div
        className="sticky top-0 z-30 border-b border-[#f9e04c]/15 backdrop-blur-xl lg:hidden"
        style={{ backgroundColor: `${FF_COLORS.background}d9` }}
        role="navigation"
        aria-label="Jump to section"
      >
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_ACTIONS.map((action) => {
            const key = action.role ?? action.id
            const isActive = activeNav === key
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleQuickAction(action)}
                className={`shrink-0 snap-start rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  isActive
                    ? 'bg-[#f9e04c] text-[#1a1a1a]'
                    : 'bg-white/10 text-[#f9e04c] hover:bg-white/15'
                }`}
              >
                {action.title}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-14 lg:max-w-6xl lg:px-10 lg:pt-20">
        {/* Hero */}
        <header className="mb-12 text-center sm:mb-16 lg:mb-20">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f9e04c]/25 bg-[#f9e04c]/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#f9e04c] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff9a3c]" aria-hidden />
            Grassroots · Ontario
          </p>
          <h1
            className="text-[2.5rem] font-bold leading-[1.08] tracking-tight text-[#f9e04c] sm:text-5xl md:text-6xl lg:text-[4.25rem]"
            style={{ textShadow: '0 4px 32px rgba(0,0,0,0.35)' }}
          >
            Hi there!
          </h1>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 sm:mt-10 sm:space-y-5">
            {FF_INTRO.map((paragraph, i) => (
              <p key={paragraph.slice(0, 24)} className={`${prose} ${i === 0 ? 'text-lg font-medium sm:text-xl' : 'text-[#f9e04c]/90'}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </header>

        {/* Quick actions — desktop grid */}
        <nav className="mb-14 hidden lg:mb-20 lg:block" aria-label="What are you here for?">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-[#f9e04c]">
            What are you here for?
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
            {QUICK_ACTIONS.map((action, index) => {
              const key = action.role ?? action.id
              const isActive = activeNav === key
              const gridSpan = index < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className={`group ${gridSpan} flex min-h-[10.5rem] flex-col rounded-[1.35rem] border p-6 text-left transition-all duration-300 motion-safe:hover:-translate-y-1 ${
                    isActive
                      ? 'border-[#ff9a3c] bg-[#ff9a3c]/12 shadow-[0_16px_40px_-12px_rgba(255,154,60,0.45)] ring-2 ring-[#ff9a3c]/35'
                      : 'border-[#f9e04c]/18 bg-[#f9e04c]/[0.06] hover:border-[#f9e04c]/40 hover:bg-[#f9e04c]/[0.11] hover:shadow-xl'
                  }`}
                >
                  <span
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner"
                    style={{ backgroundColor: FF_COLORS.headingBg }}
                  >
                    <ActionIcon type={action.icon} />
                  </span>
                  <span className="text-lg font-bold text-[#f9e04c]">{action.title}</span>
                  <span className="mt-2 flex-1 text-sm leading-snug text-[#f9e04c]/70">{action.subtitle}</span>
                  <span className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: FF_COLORS.link }}>
                    {action.role ? 'Go to form →' : 'View section →'}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Quick actions — mobile/tablet cards (below hero; sticky pills above) */}
        <div className="mb-12 lg:hidden">
          <h2 className={`mb-5 text-center text-xl font-semibold sm:text-2xl ${prose}`}>What are you here for?</h2>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 min-[520px]:grid-cols-6">
            {QUICK_ACTIONS.map((action, index) => {
              const key = action.role ?? action.id
              const isActive = activeNav === key
              const gridSpan = index < 3 ? 'min-[520px]:col-span-2' : 'min-[520px]:col-span-3'
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className={`${gridSpan} flex min-h-[5.5rem] items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] sm:p-5 ${
                    isActive
                      ? 'border-[#ff9a3c] bg-[#ff9a3c]/12 ring-2 ring-[#ff9a3c]/30'
                      : 'border-[#f9e04c]/18 bg-[#f9e04c]/[0.06]'
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: FF_COLORS.headingBg }}
                  >
                    <ActionIcon type={action.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[#f9e04c]">{action.title}</span>
                    <span className="mt-0.5 block text-sm text-[#f9e04c]/70">{action.subtitle}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          <SectionCard id="signs">
            <SectionTitle>Signs</SectionTitle>
            <div className={`space-y-6 ${prose}`}>
              <p>
                You can either order signs directly through us or download the artwork and have it printed
                yourself at a local printer. Pricing may vary depending on your location and the quantity
                ordered.
              </p>
              <ul className="grid gap-3 sm:gap-4">
                <SignOptionCard step="1">
                  <AccentLink onClick={() => goToForm('yard-sign')}>Order a sign from us</AccentLink>
                </SignOptionCard>
              </ul>
              <p className="text-[#f9e04c]/90">
                Download printable artwork below and take it to a local printer, or use the files for
                social media.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {FF_YARD_SIGN_DESIGNS.map((design) => (
                  <YardSignPreview
                    key={design.id}
                    title={design.title}
                    imageUrl={design.imageUrl}
                    downloadUrl={design.downloadUrl}
                    filename={design.filename}
                  />
                ))}
              </div>
              <div className="rounded-2xl border border-[#f9e04c]/35 bg-gradient-to-r from-[#f9e04c]/20 to-[#f9e04c]/8 px-5 py-4 sm:px-6 sm:py-5">
                <p className="font-semibold text-[#f9e04c] sm:text-lg">
                  Signs ordered through us are $10 each plus delivery. All digital downloads are free.
                </p>
              </div>
              <p className="text-[#f9e04c]/85">
                If you&apos;d like to support the campaign further, donations are always appreciated.
                Additional funds help us expand our reach through larger signs, billboards, promotional
                materials, T-shirts, and more.
              </p>
            </div>
          </SectionCard>

          <SectionCard id="pickup-hub">
            <SectionTitle>Sign Pickup Hub</SectionTitle>
            <div className={`space-y-5 ${prose}`}>
              <p>Interested in becoming a local pickup location?</p>
              <p>
                Please provide your location, availability, and contact information so we can determine
                whether a Sign Pickup Hub would be a good fit for your area.
              </p>
              <PrimaryButton onClick={() => goToForm('dropoff')}>Fill out the sign-up form</PrimaryButton>
            </div>
          </SectionCard>

          <SectionCard id="volunteer">
            <SectionTitle>Volunteer</SectionTitle>
            <div className={`space-y-5 ${prose}`}>
              <p>We&apos;re always looking for people who want to help make a difference.</p>
              <p>
                Whether you can assist with deliveries, organizing, outreach, logistics, events, or other
                tasks, we&apos;d love to hear from you.
              </p>
              <p>Please provide your contact information and availability.</p>
              <PrimaryButton onClick={() => goToForm('volunteer')}>Fill out the sign-up form</PrimaryButton>
            </div>
          </SectionCard>

          <SectionCard id="donations">
            <SectionTitle>Donations</SectionTitle>
            <div className={`space-y-6 ${prose}`}>
              <p>Thank you for supporting our efforts.</p>
              <p>
                Every contribution helps us reach more communities, expand our visibility, and continue
                growing the movement.
              </p>
              <div className="rounded-3xl bg-[#f9e04c] p-4 shadow-lg sm:inline-block sm:p-5">
                <a
                  href={PROTECT_ONTARIO_DONATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl px-10 py-4 text-base font-bold uppercase tracking-wide text-[#f9e04c] transition-opacity hover:opacity-90 sm:text-lg"
                  style={{ backgroundColor: FF_COLORS.background }}
                >
                  Donate
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="other">
            <SectionTitle>Other</SectionTitle>
            <div className={`space-y-5 ${prose}`}>
              <p>Have an idea, resource, connection, or skill that could help?</p>
              <p>
                We&apos;re always interested in hearing suggestions related to logistics, community contacts,
                delivery support, fundraising, media opportunities, or anything else that could strengthen our
                efforts.
              </p>
              <PrimaryButton onClick={() => goToForm('other')}>Share your thoughts with us</PrimaryButton>
            </div>
          </SectionCard>

          <section id="signup-form" className="scroll-mt-28 sm:scroll-mt-32 pt-4 lg:pt-8">
            <div className="mb-8 text-center sm:mb-10">
              <p
                className="mb-3 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
                style={{ color: FF_COLORS.link }}
              >
                Ready to join?
              </p>
              <h2 className="text-2xl font-bold text-[#f9e04c] sm:text-3xl lg:text-4xl">Sign-up form</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-[#f9e04c]/75 sm:mt-4 sm:max-w-lg sm:text-base">
                One form for signs, pickup hubs, volunteering, and more. We&apos;ll follow up by email.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-gradient-to-b from-[#f9e04c]/25 to-[#f9e04c]/5 p-1 sm:rounded-[2rem] sm:p-1.5">
              <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] sm:rounded-[1.75rem]">
                <GetInvolvedForm
                  variant="ff"
                  sourcePage={FF_SOURCE_PAGE}
                  presetRole={presetRole}
                  embedded
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
