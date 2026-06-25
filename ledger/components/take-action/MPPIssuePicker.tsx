'use client'

import { MPP_ISSUE_OPTIONS, type MppContactVariant } from '@/lib/mpp-contact'

type Props = {
  selected: MppContactVariant | null
  onSelect: (variant: MppContactVariant) => void
}

export default function MPPIssuePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {MPP_ISSUE_OPTIONS.map((issue) => {
        const active = selected === issue.id
        return (
          <button
            key={issue.id}
            type="button"
            onClick={() => onSelect(issue.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              active
                ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <span
              className={`block text-sm font-medium mb-1 ${active ? 'text-white' : 'text-slate-900'}`}
            >
              {issue.label}
            </span>
            <span className={`block text-xs font-light leading-relaxed ${active ? 'text-slate-200' : 'text-slate-600'}`}>
              {issue.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
