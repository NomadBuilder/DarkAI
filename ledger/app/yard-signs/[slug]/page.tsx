import { legacyProductSlugRedirects } from '@/lib/products'
import YardSignSlugRedirect from './YardSignSlugRedirect'

export function generateStaticParams() {
  return Object.keys(legacyProductSlugRedirects).map((slug) => ({ slug }))
}

export default function YardSignSlugRedirectPage() {
  return <YardSignSlugRedirect />
}
