'use client'

import { useState } from 'react'
import type { SelectOptionCopy } from '../../lib/get-involved-form-config'

export const inputClass =
  'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-light focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400'
export const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 2,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  rows?: number
  hint?: string
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className="text-xs text-slate-500 font-light mb-1.5">{hint}</p>}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  )
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  accent = 'slate',
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  accent?: 'slate' | 'violet' | 'blue'
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  const accentBorder =
    accent === 'violet' ? 'border-violet-200' : accent === 'blue' ? 'border-blue-200' : 'border-slate-200'
  const accentBg =
    accent === 'violet' ? 'bg-violet-50/30' : accent === 'blue' ? 'bg-blue-50/50' : 'bg-white'

  return (
    <div className={`rounded-2xl border ${accentBorder} ${accentBg} shadow-sm overflow-hidden mb-6`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 sm:px-6 text-left hover:bg-white/60 transition-colors"
        aria-expanded={open}
      >
        <span>
          <span className="block text-lg font-medium text-slate-900">{title}</span>
          {subtitle && <span className="block text-sm text-slate-500 font-light mt-0.5">{subtitle}</span>}
        </span>
        <span className="text-slate-400 text-xl shrink-0 mt-0.5" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-slate-100/80 space-y-4">{children}</div>}
    </div>
  )
}

export function SelectOptionsEditor({
  label,
  options,
  onChange,
  hint,
}: {
  label: string
  options: SelectOptionCopy[]
  onChange: (next: SelectOptionCopy[]) => void
  hint?: string
}) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      {hint && <p className="text-xs text-slate-500 font-light mb-2">{hint}</p>}
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.value} className="flex gap-2 items-center">
            <code className="text-xs text-slate-400 shrink-0 w-14">{opt.value}</code>
            <input
              type="text"
              value={opt.label}
              onChange={(e) => {
                const next = [...options]
                next[i] = { ...opt, label: e.target.value }
                onChange(next)
              }}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
