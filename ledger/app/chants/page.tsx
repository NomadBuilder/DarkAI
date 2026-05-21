'use client'

import { useMemo, useState } from 'react'
import TopNavigation from '../../components/TopNavigation'

type Chant = {
  id: string
  tone: 'family-friendly' | 'loud' | 'serious' | 'satirical'
  call: string
  response: string
}

const CHANTS: Chant[] = [
  { id: 'c1', tone: 'family-friendly', call: 'Whose province?', response: 'Our province!' },
  { id: 'c2', tone: 'family-friendly', call: 'Public care, public schools!', response: 'Keep them funded, keep them full!' },
  { id: 'c3', tone: 'loud', call: 'Hey hey, ho ho!', response: 'Privatization has got to go!' },
  { id: 'c4', tone: 'loud', call: 'What do we want?', response: 'Accountability! When do we want it? Now!' },
  { id: 'c5', tone: 'serious', call: 'Cuts hurt families.', response: 'Fund public services.' },
  { id: 'c6', tone: 'serious', call: 'Behind closed doors?', response: 'Open the books!' },
  { id: 'c7', tone: 'satirical', call: 'Invoice this, invoice that...', response: 'Public good is not for sale, stat!' },
  { id: 'c8', tone: 'satirical', call: 'More spin, less care?', response: 'We see through it, we are here!' },
  { id: 'c9', tone: 'family-friendly', call: 'Healthy kids, healthy schools!', response: 'That is how democracy rules!' },
  { id: 'c10', tone: 'loud', call: 'No cuts, no sell-off!', response: 'Public services for all!' },
  { id: 'c11', tone: 'loud', call: 'Public land, public care:', response: 'Hands off — we’re staying here!' },
  { id: 'c12', tone: 'family-friendly', call: 'Care and classrooms, land and water?', response: 'Protect Ontario - now, not later!' },
  { id: 'c13', tone: 'serious', call: 'Policy choices, real harm.', response: 'Fund the public, keep us warm.' },
  { id: 'c14', tone: 'satirical', call: 'Photo op one, photo op two...', response: 'Where is the funding? We are asking you.' },
  { id: 'c15', tone: 'loud', call: 'What is this about?', response: 'Accountability, loud and clear!' },
  { id: 'c16', tone: 'family-friendly', call: 'Public money, public good!', response: 'Invest where communities stood!' },
  { id: 'c17', tone: 'serious', call: 'Healthcare is a right.', response: 'Keep it public, keep it bright.' },
  { id: 'c18', tone: 'satirical', call: 'Cuts by stealth, spin by day?', response: 'People see it anyway.' },
  { id: 'c19', tone: 'loud', call: 'No more cuts!', response: 'No more excuses!' },
  { id: 'c20', tone: 'family-friendly', call: 'Neighbour to neighbour, block to block:', response: 'Public services keep us strong.' },
  { id: 'c21', tone: 'serious', call: 'Transparency is not optional.', response: 'Open process is foundational.' },
  { id: 'c22', tone: 'satirical', call: 'If the math is really sound...', response: 'Show the receipts to every town.' },
  { id: 'c23', tone: 'loud', call: 'Stand up, speak out!', response: 'That is what democracy is about!' },
  { id: 'c24', tone: 'family-friendly', call: 'For our kids and elders too:', response: 'Public care must follow through.' },
]

export default function ChantBankPage() {
  const [tone, setTone] = useState<'all' | Chant['tone']>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CHANTS.filter((chant) => {
      if (tone !== 'all' && chant.tone !== tone) return false
      if (!q) return true
      return `${chant.call} ${chant.response}`.toLowerCase().includes(q)
    })
  }, [tone, query])

  const printCard = (chant: Chant) => {
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Print Chant Card</title>
          <style>
            body { margin: 0; font-family: Inter, Arial, sans-serif; padding: 1.2rem; }
            .card { border: 2px solid #0f172a; border-radius: 12px; padding: 1rem; max-width: 560px; margin: 0 auto; }
            .label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; }
            .line { font-size: 26px; font-weight: 800; line-height: 1.2; margin: 0.5rem 0; color: #0f172a; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="label">${chant.tone}</div>
            <div class="line">Call: ${chant.call}</div>
            <div class="line">Response: ${chant.response}</div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-slate-900">Chant Bank</h1>
          <p className="mt-2 text-slate-600 font-light max-w-3xl">
            Search chants by tone and print quick chant cards for call-and-response use on the ground.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Tone
              <select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="all">All tones</option>
                <option value="family-friendly">Family-friendly</option>
                <option value="loud">Loud</option>
                <option value="serious">Serious</option>
                <option value="satirical">Satirical</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Search
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chants..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {filtered.map((chant) => (
            <article key={chant.id} className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="mb-3">
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">{chant.tone}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Call</p>
                  <p className="text-2xl font-extrabold leading-tight text-slate-900">{chant.call}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Response</p>
                  <p className="text-2xl font-extrabold leading-tight text-red-700">{chant.response}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => printCard(chant)}
                className="mt-4 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Print card
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
