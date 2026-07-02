import Link from 'next/link'
import hubData from '../../../public/data/indigenous-hub.json'
import { indigenousHubPath, parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata(
  'Learning centre — Indigenous Land & Water Hub',
  'Educational resources on Land Back, IPCAs, treaties, FPIC, environmental racism, and Indigenous governance.'
)

export default function IndigenousLearnPage() {
  const hub = parseIndigenousHubFile(hubData)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 max-w-6xl mx-auto">
      <header className="mb-10 md:mb-14 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818]">Learning centre</h1>
        <p className="mt-4 text-lg text-[#3d5c48] font-light leading-relaxed">
          Plain-language guides to concepts behind land defence movements — with links to Indigenous-led and academic
          resources. We cite sources; we do not speak for Nations.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {hub.learningTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={indigenousHubPath('learn', topic.slug)}
            className="group rounded-2xl border border-[#1a4d3a]/10 bg-white p-6 sm:p-8 hover:border-[#1a4d3a]/25 hover:shadow-md transition-all"
          >
            <h2 className="text-xl sm:text-2xl font-light text-[#142818] group-hover:text-[#1a4d3a]">{topic.title}</h2>
            <p className="mt-3 text-[#3d5c48] font-light leading-relaxed">{topic.summary}</p>
            <span className="inline-block mt-5 text-sm text-[#1a4d3a] font-medium">Read guide →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
