import Link from 'next/link'
import flyersData from '../../../public/data/flyers.json'
import FlyerPrintView from '@/components/flyers/FlyerPrintView'
import { flyerPath } from '@/lib/flyer-routes'
import { getFlyerBySlug, getPublishedFlyers, parseFlyersFile } from '@/lib/flyers'

export function generateStaticParams() {
  const file = parseFlyersFile(flyersData)
  return getPublishedFlyers(file).map((f) => ({ slug: f.slug }))
}

export default function FlyerSlugPage({ params }: { params: { slug: string } }) {
  const file = parseFlyersFile(flyersData)
  const flyer = getFlyerBySlug(file, params.slug)

  if (!flyer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#3d2b7a] to-[#2a1f58] px-4 py-20 text-center">
        <p className="text-[#f9e04c] text-lg font-light mb-4">Flyer not found.</p>
        <Link href={flyerPath()} className="text-sm text-white/80 underline hover:text-white">
          View all flyers
        </Link>
      </div>
    )
  }

  return <FlyerPrintView flyer={flyer} shared={file.shared} />
}
