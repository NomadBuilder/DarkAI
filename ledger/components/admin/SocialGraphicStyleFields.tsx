'use client'

import { BACKGROUND_PRESETS } from '@/lib/social-graphic-style'
import type { SocialPostIdea } from '@/lib/social-post-ideas'

const fieldClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300'
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5'

type Props = {
  idea: SocialPostIdea
  onChange: (next: SocialPostIdea) => void
  compact?: boolean
}

export default function SocialGraphicStyleFields({ idea, onChange, compact = false }: Props) {
  const applyPreset = (bg: string, end: string) => {
    onChange({ ...idea, graphicBgColor: bg, graphicBgColorEnd: end })
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4'}>
      {!compact && (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Graphic style</p>
      )}

      <div>
        <span className={labelClass}>Background photo (optional)</span>
        <input
          className={fieldClass}
          value={idea.imageUrl?.startsWith('data:') ? '' : idea.imageUrl ?? ''}
          onChange={(e) => onChange({ ...idea, imageUrl: e.target.value || undefined })}
          placeholder="https://… or upload below"
        />
        <input
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            if (f.size > 900_000) {
              window.alert('Image must be under 900 KB for publishing.')
              return
            }
            const reader = new FileReader()
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                onChange({ ...idea, imageUrl: reader.result })
              }
            }
            reader.readAsDataURL(f)
          }}
        />
        {idea.imageUrl?.startsWith('data:') ? (
          <button
            type="button"
            onClick={() => onChange({ ...idea, imageUrl: undefined })}
            className="mt-2 text-xs text-red-600 hover:text-red-700"
          >
            Remove uploaded image
          </button>
        ) : null}
      </div>

      <div>
        <span className={labelClass}>Background color</span>
        <div className="flex flex-wrap gap-2 mb-2">
          {BACKGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.bg, preset.end)}
              className="rounded-full px-3 py-1 text-xs font-medium border border-slate-200 bg-white hover:border-slate-300"
              style={{
                boxShadow: `inset 0 0 0 3px ${preset.bg}`,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="color"
              value={idea.graphicBgColor ?? '#152a45'}
              onChange={(e) => onChange({ ...idea, graphicBgColor: e.target.value })}
              className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
            />
            Start
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="color"
              value={idea.graphicBgColorEnd ?? '#2E4A6B'}
              onChange={(e) => onChange({ ...idea, graphicBgColorEnd: e.target.value })}
              className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
            />
            End
          </label>
        </div>
      </div>

      <div>
        <span className={labelClass}>CTA bar</span>
        <div className="space-y-2">
          <input
            className={fieldClass}
            value={idea.ctaPrimary ?? ''}
            onChange={(e) => onChange({ ...idea, ctaPrimary: e.target.value || undefined })}
            placeholder="#FightFord"
          />
          <input
            className={fieldClass}
            value={idea.ctaSecondary ?? ''}
            onChange={(e) => onChange({ ...idea, ctaSecondary: e.target.value || undefined })}
            placeholder="protectont.ca"
          />
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="color"
              value={idea.ctaBackground ?? '#f9e04c'}
              onChange={(e) => onChange({ ...idea, ctaBackground: e.target.value })}
              className="h-8 w-10 rounded border border-slate-200 cursor-pointer"
            />
            Bar color
          </label>
        </div>
      </div>
    </div>
  )
}
