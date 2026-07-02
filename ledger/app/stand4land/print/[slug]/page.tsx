import Link from 'next/link'
import FlyerPrintView from '@/components/flyers/FlyerPrintView'
import { indigenousHubPath } from '@/lib/indigenous-hub'
import { getHubFlyerBySlug, getHubFlyersFile, getPublishedHubFlyers } from '@/lib/hub-flyers'
import { HUB_FLYER_PRINT_BRAND } from '@/lib/hub-flyer-print'
import { buildHubPageMetadata } from '@/lib/page-metadata'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return getPublishedHubFlyers().map((f) => ({ slug: f.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const flyer = getHubFlyerBySlug(params.slug)
  if (!flyer) {
    return buildHubPageMetadata('Flyer not found', 'This printable flyer could not be found.')
  }
  return buildHubPageMetadata(
    `${flyer.title} — printable flyer`,
    flyer.intro?.trim().slice(0, 155) || 'Printable Standing for the Land awareness flyer.'
  )
}

export default function HubFlyerPrintPage({ params }: { params: { slug: string } }) {
  const file = getHubFlyersFile()
  const flyer = getHubFlyerBySlug(params.slug)

  if (!flyer) {
    return (
      <div className="min-h-screen bg-[#142818] text-[#e8f0e4] flex flex-col items-center justify-center p-8">
        <p className="mb-4">Flyer not found.</p>
        <Link href={indigenousHubPath('')} className="text-sm underline">
          Back to Standing for the Land
        </Link>
      </div>
    )
  }

  return (
    <FlyerPrintView
      flyer={flyer}
      shared={file.shared}
      backHref={indigenousHubPath('')}
      showToolbar={true}
      showShareActions={false}
      brand={HUB_FLYER_PRINT_BRAND}
      useOverviewGrid={flyer.slug === 'overview'}
    />
  )
}
