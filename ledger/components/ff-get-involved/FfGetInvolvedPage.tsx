'use client'

import { useCallback, useState } from 'react'
import GetInvolvedForm from '@/components/get-involved/GetInvolvedForm'
import { PROTECT_ONTARIO_DONATE_URL } from '@/lib/get-involved'
import { FF_COLORS, FF_SIGN_DOWNLOADS, FF_SOURCE_PAGE } from '@/lib/ff-get-involved'
import type { InvolvementRole } from '@/lib/get-involved'

function FfSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="inline-block font-bold uppercase tracking-wide text-base sm:text-lg px-3 py-1.5 mb-4"
      style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
    >
      {children}
    </h2>
  )
}

function FfLink({
  href,
  children,
  onClick,
}: {
  href?: string
  children: React.ReactNode
  onClick?: () => void
}) {
  const className = 'underline underline-offset-2 font-medium hover:opacity-90'
  const style = { color: FF_COLORS.link }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} text-left`} style={style}>
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

function FfBulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2 marker:text-[#f9e04c]">
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function FfGetInvolvedPage() {
  const [presetRole, setPresetRole] = useState<InvolvementRole | ''>('')

  const goToForm = useCallback((role: InvolvementRole) => {
    setPresetRole(role)
    requestAnimationFrame(() => {
      document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const textStyle = { color: FF_COLORS.text }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: FF_COLORS.background }}
    >
      {/* Dot texture — corners */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[min(55vw,420px)] h-[min(45vh,320px)] opacity-40"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.22) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[min(50vw,380px)] h-[min(40vh,280px)] opacity-35"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14 pb-24 space-y-10 sm:space-y-12">
        <header className="space-y-5" style={textStyle}>
          <h1 className="text-3xl sm:text-4xl font-bold">Hi there!</h1>
          <p className="text-base sm:text-lg leading-relaxed">
            Thank you for joining our cause. Together, we can make a difference.
          </p>
          <p className="text-base sm:text-lg leading-relaxed">
            We are a growing grassroots group powered by volunteers and community support. As we continue
            to expand, we&apos;re building new delivery networks, sign pickup hubs, and local connections
            across Ontario.
          </p>
          <p className="text-base sm:text-lg leading-relaxed">
            Thank you for your patience as we grow. We may still be building resources in your area, but
            we&apos;ll work with you to find the best way to get a sign to you.
          </p>
        </header>

        <nav className="space-y-3" style={textStyle} aria-label="Jump to section">
          <p className="text-lg sm:text-xl font-semibold">What are you here for?</p>
          <FfBulletList
            items={[
              <>
                <FfLink onClick={() => goToForm('yard-sign')}>Signs</FfLink>
                <span className="opacity-80"> — order or download artwork</span>
              </>,
              <>
                <FfLink onClick={() => goToForm('dropoff')}>Sign Pickup Hub</FfLink>
                <span className="opacity-80"> — host a local pickup point</span>
              </>,
              <>
                <FfLink onClick={() => goToForm('volunteer')}>Volunteer</FfLink>
                <span className="opacity-80"> — deliveries, outreach, events, and more</span>
              </>,
              <>
                <a
                  href={PROTECT_ONTARIO_DONATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 font-medium"
                  style={{ color: FF_COLORS.link }}
                >
                  Donations
                </a>
                <span className="opacity-80"> — support the campaign</span>
              </>,
              <>
                <FfLink onClick={() => goToForm('other')}>Other</FfLink>
                <span className="opacity-80"> — ideas, connections, or skills</span>
              </>,
            ]}
          />
        </nav>

        <section id="signs" className="scroll-mt-8 space-y-4" style={textStyle}>
          <FfSectionHeading>Signs</FfSectionHeading>
          <p className="leading-relaxed">
            You can either order signs directly through us or download the artwork and have it printed
            yourself at a local printer. Pricing may vary depending on your location and the quantity
            ordered.
          </p>
          <FfBulletList
            items={[
              <>
                <FfLink onClick={() => goToForm('yard-sign')}>Order a sign from us</FfLink>
              </>,
              <>
                Download a high-resolution file for home printing or professional printing:{' '}
                <FfLink href={FF_SIGN_DOWNLOADS.highRes}>Dropbox (high resolution)</FfLink>
              </>,
              <>
                Download a low-resolution file for online sharing and social media posts:{' '}
                <FfLink href={FF_SIGN_DOWNLOADS.lowRes}>Dropbox (low resolution)</FfLink>
              </>,
            ]}
          />
          <p className="leading-relaxed text-sm sm:text-base opacity-95">
            Signs ordered through us are <strong className="font-semibold">$10 each plus delivery</strong>.
            All digital downloads are free.
          </p>
          <p className="leading-relaxed text-sm sm:text-base opacity-95">
            If you&apos;d like to support the campaign further, donations are always appreciated.
            Additional funds help us expand our reach through larger signs, billboards, promotional
            materials, T-shirts, and more.
          </p>
        </section>

        <section id="pickup-hub" className="scroll-mt-8 space-y-4" style={textStyle}>
          <FfSectionHeading>Sign Pickup Hub</FfSectionHeading>
          <p className="leading-relaxed">
            Interested in becoming a local pickup location?
          </p>
          <p className="leading-relaxed">
            Please provide your location, availability, and contact information so we can determine
            whether a Sign Pickup Hub would be a good fit for your area.{' '}
            <FfLink onClick={() => goToForm('dropoff')}>Fill out the sign-up form</FfLink>
          </p>
        </section>

        <section id="volunteer" className="scroll-mt-8 space-y-4" style={textStyle}>
          <FfSectionHeading>Volunteer</FfSectionHeading>
          <p className="leading-relaxed">
            We&apos;re always looking for people who want to help make a difference.
          </p>
          <p className="leading-relaxed">
            Whether you can assist with deliveries, organizing, outreach, logistics, events, or other
            tasks, we&apos;d love to hear from you.
          </p>
          <p className="leading-relaxed">
            Please provide your contact information and availability.{' '}
            <FfLink onClick={() => goToForm('volunteer')}>Fill out the sign-up form</FfLink>
          </p>
        </section>

        <section id="donations" className="scroll-mt-8 space-y-4" style={textStyle}>
          <FfSectionHeading>Donations</FfSectionHeading>
          <p className="leading-relaxed">Thank you for supporting our efforts.</p>
          <p className="leading-relaxed">
            Every contribution helps us reach more communities, expand our visibility, and continue
            growing the movement.
          </p>
          <a
            href={PROTECT_ONTARIO_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center mt-2 px-8 py-3.5 rounded-lg font-bold uppercase tracking-wide text-sm sm:text-base transition-opacity hover:opacity-95"
            style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
          >
            Donate
          </a>
        </section>

        <section id="other" className="scroll-mt-8 space-y-4" style={textStyle}>
          <FfSectionHeading>Other</FfSectionHeading>
          <p className="leading-relaxed">
            Have an idea, resource, connection, or skill that could help?
          </p>
          <p className="leading-relaxed">
            We&apos;re always interested in hearing suggestions related to logistics, community contacts,
            delivery support, fundraising, media opportunities, or anything else that could strengthen our
            efforts.
          </p>
          <p className="leading-relaxed">
            <FfLink onClick={() => goToForm('other')}>Share your thoughts with us</FfLink>
          </p>
        </section>

        <section id="signup-form" className="scroll-mt-8 pt-4">
          <p className="text-lg font-semibold mb-6" style={textStyle}>
            Sign-up form
          </p>
          <GetInvolvedForm
            variant="ff"
            sourcePage={FF_SOURCE_PAGE}
            presetRole={presetRole}
          />
        </section>
      </div>
    </div>
  )
}
