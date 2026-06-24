import Link from 'next/link'

export default function FlyerCredibilityCallout() {
  return (
    <aside
      className="rounded-xl border border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5 shadow-sm"
      aria-label="How we source flyer facts"
    >
      <div className="flex gap-4">
        <div
          className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2E4A6B]/10 text-[#2E4A6B]"
          aria-hidden
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-base sm:text-lg text-slate-800 font-light leading-relaxed">
            Every flyer includes citations to{' '}
            <strong className="font-medium text-slate-900">legislation</strong>,{' '}
            <strong className="font-medium text-slate-900">government documents</strong>,{' '}
            <strong className="font-medium text-slate-900">Auditor General reports</strong>, and{' '}
            <strong className="font-medium text-slate-900">independent reporting</strong>.
          </p>
          <p className="mt-2 text-sm text-slate-500 font-light">
            <Link href="/methodology" className="text-[#2E4A6B] underline-offset-4 hover:underline">
              See our methodology
            </Link>
          </p>
        </div>
      </div>
    </aside>
  )
}
