import Link from 'next/link'

const STEPS = [
  {
    href: '/protests',
    title: 'Find a protest',
    blurb: 'Events and campaigns across Ontario',
  },
  {
    href: '/join',
    title: 'Join us',
    blurb: 'Signs, volunteering, and local pickup',
  },
  {
    href: '/flyers',
    title: 'Printable flyers',
    blurb: 'Letter-size PDFs for doors, boards, and tabling',
  },
  {
    href: '/materials',
    title: 'Materials',
    blurb: 'Signs, shirts, stickers, and protest prep',
  },
  {
    href: '/reports',
    title: 'Reports',
    blurb: 'Accountability briefs — including how your MPP voted',
  },
  {
    href: '/take-action',
    title: 'Contact your MPP',
    blurb: 'Petitions, templates, and civic action',
  },
] as const

export default function ResourceNextSteps() {
  return (
    <section className="mt-10 rounded-2xl border border-[#2E4A6B]/15 bg-gradient-to-br from-[#2E4A6B]/5 to-white p-6 sm:p-8">
      <h2 className="text-xl font-light text-slate-900 mb-1">Next steps</h2>
      <p className="text-sm text-slate-600 font-light mb-5 max-w-2xl">
        Turn talking points into action — print a flyer, grab a sign, or share online.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step) => (
          <Link
            key={step.href}
            href={step.href}
            className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-[#2E4A6B]/30 hover:shadow-sm transition-all"
          >
            <h3 className="text-sm font-medium text-slate-900 group-hover:text-[#2E4A6B]">{step.title}</h3>
            <p className="mt-1 text-xs text-slate-600 font-light leading-relaxed">{step.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
