import hubData from '../../public/data/indigenous-hub.json'
import Stand4LandHome from '@/components/indigenous/Stand4LandHome'
import { parseIndigenousHubFile } from '@/lib/indigenous-hub'

export default function IndigenousHubHomePage() {
  const hub = parseIndigenousHubFile(hubData)
  const featured = hub.campaigns.slice(0, 6)

  return <Stand4LandHome campaigns={hub.campaigns} featured={featured} />
}
