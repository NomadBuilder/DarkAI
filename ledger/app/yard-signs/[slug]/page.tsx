import { legacyYardSignSlugRedirects } from '@/lib/products'
import YardSignSlugRedirect from './YardSignSlugRedirect'

export function generateStaticParams() {
  return Object.keys(legacyYardSignSlugRedirects).map((slug) => ({ slug }))
}

export default function YardSignSlugRedirectPage() {
  return <YardSignSlugRedirect />
}
