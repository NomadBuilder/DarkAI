'use client'

import { useRef } from 'react'
import { labelClass, inputClass } from './FormFields'

type Props = {
  label: string
  value: string
  onChange: (html: string) => void
  hint?: string
  rows?: number
}

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.slice(start, end)
  const next = textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end)
  return { next, cursor: start + before.length + selected.length + after.length }
}

export default function RichTextField({ label, value, onChange, hint, rows = 6 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const apply = (before: string, after: string = before) => {
    const el = ref.current
    if (!el) return
    const { next, cursor } = wrapSelection(el, before, after)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  const insertLink = () => {
    const el = ref.current
    if (!el) return
    const url = window.prompt('Link URL (e.g. /products or mailto:email@example.com)', '/products')
    if (!url) return
    const labelText = window.prompt('Link text', 'Products') ?? 'Link'
    const { next, cursor } = wrapSelection(el, `<a href="${url}">${labelText}</a>`, '')
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className="text-xs text-slate-500 font-light mb-1.5">{hint}</p>}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <button
          type="button"
          onClick={() => apply('<strong>', '</strong>')}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => apply('<em>', '</em>')}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs italic text-slate-700 hover:bg-slate-50"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => apply('<p>', '</p>')}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          Paragraph
        </button>
      </div>
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
        spellCheck
      />
    </div>
  )
}
