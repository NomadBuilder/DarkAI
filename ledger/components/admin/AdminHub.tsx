'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback } from 'react'
import EventsAdminPage from '@/components/admin/EventsAdminSection'
import FlyerAdminPage from '@/components/admin/FlyerAdminSection'
import FormAdminPage from '@/components/admin/FormAdminSection'
import SubmissionsAdminPage from '@/components/admin/SubmissionsAdminSection'
import SignDeliveriesAdminPage from '@/components/admin/SignDeliveriesAdminSection'
import SocialAdminSection from '@/components/admin/SocialAdminSection'

export const ADMIN_SECTIONS = [
  {
    id: 'events',
    label: 'Protests & events',
    blurb: 'Add, edit, or remove protests shown on the public calendar.',
    viewHref: '/protests',
    viewLabel: 'View /protests',
  },
  {
    id: 'flyers',
    label: 'Printable flyers',
    blurb: 'Create and edit letter-size issue flyers.',
    viewHref: '/flyers',
    viewLabel: 'View /flyers',
  },
  {
    id: 'social-posts',
    label: 'Social posts',
    blurb: 'Build Instagram & Facebook graphics, copy captions, and manage the post library.',
  },
  {
    id: 'join-form',
    label: 'Join form copy',
    blurb: 'Edit labels and messages on the /join volunteer form.',
    viewHref: '/join',
    viewLabel: 'View /join',
  },
  {
    id: 'submissions',
    label: 'Sign-ups & orders',
    blurb: 'View join form sign-ups, Stripe payments, and print fulfillment.',
    viewHref: '/join',
    viewLabel: 'View /join',
  },
  {
    id: 'sign-deliveries',
    label: 'Sign deliveries',
    blurb: 'Track yard sign requests — who to contact, paid, and delivered.',
    viewHref: '/join',
    viewLabel: 'View /join',
  },
] as const

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]['id']

const DEFAULT_SECTION: AdminSectionId = 'events'

function isAdminSectionId(value: string | null): value is AdminSectionId {
  return ADMIN_SECTIONS.some((s) => s.id === value)
}

function SocialPostsOnlyInner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <header className="bg-gradient-to-br from-violet-950 via-[#3d2b7a] to-slate-900 text-white px-4 sm:px-6 md:px-8 py-8 sm:py-10 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-violet-200/90 mb-2 font-medium">
            ProtectOnt
          </p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Social posts</h1>
          <p className="text-slate-300/95 font-light mt-2 max-w-xl text-sm sm:text-base">
            Build Instagram and Facebook graphics, copy captions, and browse the post library. No other
            admin sections on this page.
          </p>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <SocialAdminSection embedded />
      </div>
    </div>
  )
}

function AdminHubInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const raw = searchParams.get('section')

  if (raw === 'social-posts-only') {
    return <SocialPostsOnlyInner />
  }

  const section: AdminSectionId = isAdminSectionId(raw) ? raw : DEFAULT_SECTION
  const active = ADMIN_SECTIONS.find((s) => s.id === section) ?? ADMIN_SECTIONS[0]

  const setSection = useCallback(
    (id: AdminSectionId) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id === DEFAULT_SECTION) {
        params.delete('section')
      } else {
        params.set('section', id)
      }
      const qs = params.toString()
      router.replace(qs ? `/admin?${qs}` : '/admin', { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <header className="bg-gradient-to-br from-violet-950 via-[#3d2b7a] to-slate-900 text-white px-4 sm:px-6 md:px-8 py-8 sm:py-10 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-violet-200/90 mb-2 font-medium">
            ProtectOnt admin
          </p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Content editors</h1>
          <p className="text-slate-300/95 font-light mt-2 max-w-xl text-sm sm:text-base">
            Keep this URL private. Pick a section below — changes publish to the live site.
          </p>

          <nav
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Admin sections"
          >
            {ADMIN_SECTIONS.map((item) => {
              const isActive = item.id === section
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#f9e04c] text-[#1a1a1a]'
                      : 'bg-white/10 text-white/90 hover:bg-white/15 border border-white/20'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <div
        className={`mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 ${
          section === 'submissions' || section === 'sign-deliveries' || section === 'social-posts'
            ? 'max-w-6xl'
            : 'max-w-3xl'
        }`}
      >
        {section !== 'submissions' && section !== 'sign-deliveries' && (
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-medium text-slate-900">{active.label}</h2>
              <p className="text-sm text-slate-600 font-light mt-1">{active.blurb}</p>
            </div>
            {'viewHref' in active && active.viewHref ? (
              <Link
                href={active.viewHref}
                target={active.id === 'flyers' ? '_blank' : undefined}
                rel={active.id === 'flyers' ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1.5 text-sm text-[#3d2b7a] hover:text-[#2a1f58] bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-full px-4 py-2 transition-colors shrink-0"
              >
                {active.viewLabel} →
              </Link>
            ) : null}
          </div>
        )}

        {section === 'events' && <EventsAdminPage embedded />}
        {section === 'flyers' && <FlyerAdminPage embedded />}
        {section === 'social-posts' && (
          <>
            <p className="text-sm text-violet-900/90 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-6 font-light">
              Share this link with volunteers (builder + library only, no other admin):{' '}
              <a
                href="/admin?section=social-posts-only"
                className="font-medium text-[#3d2b7a] underline underline-offset-2 break-all"
              >
                protectont.ca/admin?section=social-posts-only
              </a>
            </p>
            <SocialAdminSection embedded />
          </>
        )}
        {section === 'join-form' && <FormAdminPage embedded />}
        {section === 'submissions' && <SubmissionsAdminPage embedded />}
        {section === 'sign-deliveries' && <SignDeliveriesAdminPage embedded />}
      </div>
    </div>
  )
}

export default function AdminHub() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-light">
          Loading admin…
        </div>
      }
    >
      <AdminHubInner />
    </Suspense>
  )
}
