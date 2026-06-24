import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  /** Use h3 for drawer; h2 for full page */
  headingLevel?: 'h2' | 'h3'
}

function SectionHeading({
  level,
  id,
  children,
}: {
  level: 'h2' | 'h3'
  id?: string
  children: ReactNode
}) {
  const className = level === 'h2'
    ? 'text-xl md:text-2xl font-light text-gray-900 mb-3 md:mb-4'
    : 'text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4'

  if (level === 'h2') {
    return (
      <h2 id={id} className={className}>
        {children}
      </h2>
    )
  }
  return <h3 className={className}>{children}</h3>
}

const body = 'text-sm md:text-base text-gray-700 font-light leading-relaxed'
const bodyMb = `${body} mb-3 md:mb-4`
const list = 'list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4 font-light leading-relaxed'
const link = 'text-sm text-blue-600 hover:text-blue-800 underline font-light block'

export default function MethodologyContent({ headingLevel = 'h2' }: Props) {
  const H = ({ id, children }: { id?: string; children: ReactNode }) => (
    <SectionHeading level={headingLevel} id={id}>
      {children}
    </SectionHeading>
  )

  return (
    <div className="space-y-6 md:space-y-8 prose prose-sm md:prose max-w-none">
      <section>
        <H>Purpose &amp; scope</H>
        <p className={bodyMb}>
          ProtectOnt.ca is a public accountability project. We document how provincial policy, spending, and
          privatization affect Ontario communities — using legislation, government records, Auditor General
          reports, and independent journalism. The site is non-partisan and evidence-driven.
        </p>
        <p className={body}>
          We do not cover every program or vendor in the province. We focus on consequential patterns:
          healthcare privatization, water and land control, environmental rollbacks, weakened oversight, and
          who benefits from major deals.
        </p>
      </section>

      <section>
        <H>What we publish</H>
        <ul className={list}>
          <li>
            <strong className="font-normal">Printable flyers</strong> — letter-size community materials with
            sourced bullets on{' '}
            <Link href="/flyer" className="text-blue-600 hover:text-blue-800 underline">
              protectont.ca/flyer
            </Link>
          </li>
          <li>
            <strong className="font-normal">Issue pages</strong> — deeper context on healthcare, water, public
            land, wildlife, Indigenous rights, and related topics
          </li>
          <li>
            <strong className="font-normal">The Receipts</strong> — searchable Public Accounts payments on{' '}
            <Link href="/receipts" className="text-blue-600 hover:text-blue-800 underline">
              protectont.ca/receipts
            </Link>
          </li>
          <li>
            <strong className="font-normal">Protest listings</strong> — community events on{' '}
            <Link href="/protests" className="text-blue-600 hover:text-blue-800 underline">
              protectont.ca/protests
            </Link>
          </li>
          <li>
            <strong className="font-normal">Materials &amp; products</strong> — signs, shirts, and tabling
            resources for organizers
          </li>
        </ul>
      </section>

      <section>
        <H>Flyers &amp; community materials</H>
        <p className={bodyMb}>
          Every published flyer is built from verifiable public sources. Bullets cite or paraphrase legislation,
          Ontario Public Accounts, Auditor General reports, CIHI and other government data, court filings where
          relevant, and documented journalism (e.g. CBC, Globe and Mail, investigative outlets).
        </p>
        <p className={bodyMb}>Our standard for a flyer claim:</p>
        <ul className={list}>
          <li>Traceable to a named law, report, dataset, or published article</li>
          <li>Accurate in context — we avoid cherry-picking without noting scope</li>
          <li>Updated when major corrections or reversals occur (e.g. Greenbelt carve-out)</li>
          <li>Clearly separated from opinion — flyers state documented facts; interpretation stays on issue pages</li>
        </ul>
        <p className={`${body} mt-3 md:mt-4`}>
          Current topics include overview, healthcare, water, public land, wildlife, Indigenous rights,
          accountability, freedom of information, bike-lane safety, Ontario Place, and Ring of Fire. PDFs are
          generated from the same content shown on each flyer page.
        </p>
      </section>

      <section>
        <H>Legislation &amp; government documents</H>
        <p className={bodyMb}>
          We read and cite primary legal and government sources directly, including:
        </p>
        <ul className={list}>
          <li>
            <strong className="font-normal">Bill 5</strong> — environmental and species-at-risk rollbacks,
            special economic zones
          </li>
          <li>
            <strong className="font-normal">Bill 60 (Your Health Act)</strong> — expanded for-profit delivery,
            water and wastewater corporate structures
          </li>
          <li>
            <strong className="font-normal">Bill 124</strong> — public-sector wage caps (healthcare context)
          </li>
          <li>
            <strong className="font-normal">FOI / transparency changes</strong> — ministerial records and
            accountability mechanisms
          </li>
          <li>
            <strong className="font-normal">Auditor General reports</strong> — Greenbelt, Ontario Place,
            program spending
          </li>
          <li>
            <strong className="font-normal">Ontario Public Accounts</strong> — who the province paid and how much
          </li>
        </ul>
        <div className="mt-3 md:mt-4 space-y-2">
          <a
            href="https://www.ola.org/en/legislative-business/bills/parliament-43/session-1/bill-60"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Bill 60 — Legislative Assembly of Ontario →
          </a>
          <a
            href="https://www.auditor.on.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Office of the Auditor General of Ontario →
          </a>
          <a
            href="https://www.ontario.ca/page/public-accounts"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Official Public Accounts →
          </a>
        </div>
      </section>

      <section>
        <H>Independent research &amp; journalism</H>
        <p className={bodyMb}>
          We cross-check government claims against reputable third-party analysis:
        </p>
        <div className="space-y-3">
          <a
            href="https://www.policyalternatives.ca/news-research/hollowed-out/"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            CCPA: &quot;Hollowed Out&quot; — private staffing agencies →
          </a>
          <a
            href="https://www.ontariohealthcoalition.ca/wp-content/uploads/Final-Ford-government-LTC-bed-allocations-report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Ontario Health Coalition: LTC bed allocations →
          </a>
          <a
            href="https://ofl.ca/ford-tracker/"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            OFL Ford Tracker →
          </a>
          <a
            href="https://www.cihi.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            CIHI — hospital and health system data →
          </a>
        </div>
      </section>

      <section>
        <H>The Receipts — Public Accounts data</H>
        <p className={bodyMb}>
          The Receipts tool visualizes Ontario&apos;s Public Accounts — Detailed Schedule of Payments: who the
          province paid, how much, and through which ministry. This is first-party government data from
          Ontario&apos;s open data program.
        </p>
        <div className="space-y-2">
          <a
            href="https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments"
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Raw data on Ontario Open Data Portal →
          </a>
        </div>
        <p className={`${body} mt-3 md:mt-4`}>
          <strong className="font-normal">Time window:</strong> fiscal years 2018–2024, focusing on the current
          government&apos;s term. <strong className="font-normal">Update cadence:</strong> when new Public
          Accounts releases or major policy changes occur.
        </p>
      </section>

      <section>
        <H>Data integrity (Receipts)</H>
        <p className={bodyMb}>Payment data has been audited and corrected where needed:</p>
        <ul className={list}>
          <li>
            <strong className="font-normal">Payment processors excluded</strong> — pass-throughs like OSAP
            loan processors are not counted as for-profit delivery
          </li>
          <li>
            <strong className="font-normal">Public institutions corrected</strong> — hospitals and
            municipalities misclassified as for-profit have been fixed
          </li>
          <li>
            <strong className="font-normal">Multi-source verification</strong> — large figures cross-checked
            against CCPA, OHC, and OFL research
          </li>
        </ul>
        <p className={`${body} mt-3 md:mt-4`}>
          Vendors are tagged public, non-profit, or for-profit where classification is possible. Only top
          spenders are fully classified; others remain unclassified and de-emphasized.
        </p>
      </section>

      <section>
        <H>Protest &amp; event listings</H>
        <p className={body}>
          Protest dates and locations are submitted by organizers and community members. We verify basic
          details (date, city, public source where available) before publishing. Listings can change — always
          confirm with the host organization before travelling.
        </p>
      </section>

      <section id="derived-estimates">
        <H>Derived estimates</H>
        <p className={body}>
          Some pages translate large totals (e.g. annual agency spending) into illustrative equivalents such
          as beds or staffing. These are directional scale estimates, not precise budget lines. We link the
          underlying figure to its source and note assumptions when we publish an estimate.
        </p>
      </section>

      <section>
        <H>Interpretation vs. source material</H>
        <p className={body}>
          We distinguish raw source material from our interpretation. Payment figures come from Public
          Accounts. Flyer bullets trace to cited sources. Charts, classifications, and summaries are our
          analysis — open to scrutiny on this page and via corrections.
        </p>
      </section>

      <section>
        <H>Limitations</H>
        <ul className={list}>
          <li>We document patterns and documented outcomes — not intent or legality unless sourced</li>
          <li>Not every vendor, bill clause, or program is covered</li>
          <li>Public Accounts show payees, not always end recipients of pass-through funds</li>
          <li>Protest listings depend on community submissions and may lag real-world changes</li>
          <li>Flyers are periodically updated; download the latest PDF from each flyer page</li>
        </ul>
      </section>

      <section>
        <H>Corrections</H>
        <p className={bodyMb}>
          If you find a factual error, send the source link or document reference via{' '}
          <Link href="/take-action" className="text-blue-600 hover:text-blue-800 underline">
            Take action
          </Link>
          . We document corrections and update content in the next release.
        </p>
      </section>
    </div>
  )
}
