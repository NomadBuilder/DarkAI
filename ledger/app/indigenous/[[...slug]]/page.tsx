import hubData from '../../../public/data/indigenous-hub.json'
import { parseIndigenousHubFile } from '@/lib/indigenous-hub'
import IndigenousLegacyRedirect from './IndigenousLegacyRedirect'

const LEGACY_SECTIONS = ['campaigns', 'map', 'organizations', 'learn', 'news', 'support', 'funding'] as const

export function generateStaticParams() {
  const hub = parseIndigenousHubFile(hubData)
  const paths: { slug?: string[] }[] = [{}]
  for (const section of LEGACY_SECTIONS) {
    paths.push({ slug: [section] })
  }
  for (const campaign of hub.campaigns) {
    paths.push({ slug: ['campaigns', campaign.slug] })
  }
  for (const topic of hub.learningTopics) {
    paths.push({ slug: ['learn', topic.slug] })
  }
  return paths
}

export default function IndigenousLegacyRedirectPage() {
  return <IndigenousLegacyRedirect />
}
