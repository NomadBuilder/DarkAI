import flyersData from '../../../public/data/flyers.json'
import { FlyerSlugRedirect } from '@/components/flyers/FlyerLegacyRedirect'
import { getPublishedFlyers, parseFlyersFile } from '@/lib/flyers'

export function generateStaticParams() {
  const file = parseFlyersFile(flyersData)
  return getPublishedFlyers(file).map((f) => ({ slug: f.slug }))
}

/** Legacy /flyer/[slug] → /flyers/[slug] */
export default function FlyerLegacySlugPage({ params }: { params: { slug: string } }) {
  return <FlyerSlugRedirect slug={params.slug} />
}
