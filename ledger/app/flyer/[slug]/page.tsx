import flyersData from '../../../public/data/flyers.json'
import { getPublishedFlyers, parseFlyersFile } from '@/lib/flyers'
import FlyerSlugClient from './FlyerSlugClient'

export function generateStaticParams() {
  const file = parseFlyersFile(flyersData)
  return getPublishedFlyers(file).map((f) => ({ slug: f.slug }))
}

export default function FlyerSlugPage({ params }: { params: { slug: string } }) {
  return <FlyerSlugClient slug={params.slug} />
}
