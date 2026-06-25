import { SOCIAL_POST_IDEAS } from '@/lib/social-post-ideas'
import SocialExportClient from './SocialExportClient'

/** Static PNG export targets for Meta Business Suite batch upload. */
export function generateStaticParams() {
  return SOCIAL_POST_IDEAS.filter((i) => Boolean(i.headline?.trim())).map((i) => ({ id: i.id }))
}

export default function SocialExportPage({ params }: { params: { id: string } }) {
  return <SocialExportClient id={params.id} />
}
