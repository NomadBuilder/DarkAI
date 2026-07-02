import Link from 'next/link'
import hubData from '../../../../public/data/indigenous-hub.json'
import { getLearningTopicBySlug, getCampaignBySlug, indigenousHubPath, parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'
import type { Metadata } from 'next'

export function generateStaticParams() {
  const hub = parseIndigenousHubFile(hubData)
  return hub.learningTopics.map((t) => ({ slug: t.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const hub = parseIndigenousHubFile(hubData)
  const topic = getLearningTopicBySlug(hub, params.slug)
  if (!topic) return buildPageMetadata('Topic not found', '')
  return buildPageMetadata(`${topic.title} — Learning centre`, topic.summary.slice(0, 155))
}

export default function IndigenousLearnTopicPage({ params }: { params: { slug: string } }) {
  const hub = parseIndigenousHubFile(hubData)
  const topic = getLearningTopicBySlug(hub, params.slug)

  if (!topic) {
    return (
      <div className="px-4 py-20 text-center">
        <Link href={indigenousHubPath('learn')} className="text-[#1a4d3a] underline">
          Back to learning centre
        </Link>
      </div>
    )
  }

  const related = (topic.relatedSlugs ?? [])
    .map((slug) => getCampaignBySlug(hub, slug))
    .filter(Boolean)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 max-w-4xl mx-auto">
      <Link href={indigenousHubPath('learn')} className="text-sm text-[#5a7a66] hover:text-[#1a4d3a] mb-8 inline-block">
        ← Learning centre
      </Link>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818]">{topic.title}</h1>
      <p className="mt-4 text-lg text-[#3d7a57] font-light">{topic.summary}</p>

      <div className="mt-10 space-y-6">
        {topic.body.map((para) => (
          <p key={para.slice(0, 40)} className="text-lg text-[#3d5c48] font-light leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {topic.keyPoints && topic.keyPoints.length > 0 && (
        <section className="mt-10 rounded-2xl bg-[#e8f0e4]/60 border border-[#1a4d3a]/10 p-6 sm:p-8">
          <h2 className="text-lg font-light text-[#142818] mb-4">Key points</h2>
          <ul className="space-y-2">
            {topic.keyPoints.map((point) => (
              <li key={point} className="flex gap-3 text-[#3d5c48] font-light">
                <span className="text-[#c4a574] shrink-0">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-light text-[#142818] mb-4">Further reading</h2>
        <ul className="space-y-3">
          {topic.resources.map((r) => (
            <li key={r.href}>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a4d3a] hover:underline font-medium"
              >
                {r.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-[#1a4d3a]/10">
          <h2 className="text-lg font-light text-[#142818] mb-4">Related campaigns</h2>
          <ul className="space-y-2">
            {related.map((c) => (
              <li key={c!.slug}>
                <Link href={indigenousHubPath('campaigns', c!.slug)} className="text-[#1a4d3a] hover:underline">
                  {c!.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
