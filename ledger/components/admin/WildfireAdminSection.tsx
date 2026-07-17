'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deriveWildfireCampaign,
  formatCad,
  type WildfireCampaignConfig,
  type WildfireDonationEntry,
} from '@/lib/wildfire-campaign'
import {
  defaultWildfireCampaign,
  loadWildfireCampaign,
  serializeWildfireCampaign,
  totalsFromDonations,
} from '@/lib/wildfire-campaign-store'

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300'
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5'

type Props = {
  embedded?: boolean
}

export default function WildfireAdminSection({ embedded: _embedded = true }: Props) {
  const [campaign, setCampaign] = useState<WildfireCampaignConfig>(defaultWildfireCampaign)
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle')
  const [publishMessage, setPublishMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    loadWildfireCampaign()
      .then((data) => {
        if (!cancelled) {
          setCampaign(data)
          setLoadStatus('ok')
        }
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const derived = useMemo(() => deriveWildfireCampaign(campaign), [campaign])

  const update = useCallback((patch: Partial<WildfireCampaignConfig>) => {
    setCampaign((c) => ({ ...c, ...patch }))
    setPublishStatus('idle')
  }, [])

  const updateDonation = (index: number, next: WildfireDonationEntry) => {
    setCampaign((c) => {
      const donations = c.donations.map((d, i) => (i === index ? next : d))
      return { ...c, donations }
    })
    setPublishStatus('idle')
  }

  const addDonation = () => {
    setCampaign((c) => ({
      ...c,
      donations: [
        {
          displayName: 'Anonymous',
          amount: 0,
          date: new Date().toISOString().slice(0, 10),
        },
        ...c.donations,
      ],
    }))
    setPublishStatus('idle')
  }

  const removeDonation = (index: number) => {
    setCampaign((c) => ({
      ...c,
      donations: c.donations.filter((_, i) => i !== index),
    }))
    setPublishStatus('idle')
  }

  const recalculateFromList = () => {
    const { communityTotal, donorCount } = totalsFromDonations(campaign.donations)
    update({ communityTotal, donorCount })
  }

  const publish = async () => {
    setPublishStatus('publishing')
    setPublishMessage('')
    try {
      const res = await fetch('/api/protectont/wildfire-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializeWildfireCampaign(campaign),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      if (!res.ok) {
        setPublishStatus('error')
        setPublishMessage(body.error || body.message || `Save failed (${res.status})`)
        return
      }
      setPublishStatus('published')
    } catch {
      setPublishStatus('error')
      setPublishMessage('Network error — could not reach the server.')
    }
  }

  if (loadStatus === 'loading') {
    return <p className="text-slate-500 font-light py-10 animate-pulse">Loading wildfire campaign…</p>
  }

  return (
    <div className="space-y-8">
      {loadStatus === 'error' && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Could not load saved campaign — showing defaults. You can still edit and save.
        </p>
      )}
      {publishStatus === 'published' && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          Campaign saved. The public page will pick this up on the next load (no full site rebuild needed).
        </p>
      )}
      {publishStatus === 'error' && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {publishMessage}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-medium text-slate-900">Community totals</h3>
            <p className="text-sm text-slate-600 font-light mt-1">
              Combined impact preview:{' '}
              <strong className="font-medium text-slate-900">{formatCad(derived.combinedImpact)}</strong>
              {' '}(community {formatCad(campaign.communityTotal)} + match{' '}
              {formatCad(derived.personalMatch)})
            </p>
          </div>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishStatus === 'publishing'}
            className="rounded-xl bg-[#3d2b7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a1f58] disabled:opacity-50"
          >
            {publishStatus === 'publishing' ? 'Saving…' : 'Save to live site'}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="wf-total">
              Community total ($)
            </label>
            <input
              id="wf-total"
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={campaign.communityTotal}
              onChange={(e) => update({ communityTotal: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="wf-donors">
              Community donor count
            </label>
            <input
              id="wf-donors"
              type="number"
              min={0}
              step="1"
              className={inputClass}
              value={campaign.donorCount}
              onChange={(e) => update({ donorCount: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#3d2b7a]">ProtectOnt match</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="wf-match-max">
                Match maximum ($)
              </label>
              <input
                id="wf-match-max"
                type="number"
                min={0}
                step="1"
                className={inputClass}
                value={campaign.matchMaximum}
                onChange={(e) => update({ matchMaximum: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="wf-match-url">
                Match confirmation URL (optional)
              </label>
              <input
                id="wf-match-url"
                type="url"
                className={inputClass}
                value={campaign.matchConfirmationUrl}
                onChange={(e) => update({ matchConfirmationUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={campaign.matchCompleted}
              onChange={(e) => update({ matchCompleted: e.target.checked })}
              className="rounded border-slate-300 text-[#3d2b7a] focus:ring-[#3d2b7a]"
            />
            Matching donation has been completed
          </label>
          <p className="text-xs text-slate-600 font-light">
            Matched so far (calculated): {formatCad(derived.personalMatch)} of{' '}
            {formatCad(campaign.matchMaximum)}
            {derived.matchUnlocked ? ' — match unlocked' : ''}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium text-slate-900">Donation list</h3>
            <p className="text-sm text-slate-600 font-light mt-1">
              Names only when the donor agreed. Never store emails, receipts, or payment details here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={recalculateFromList}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Recalculate totals from list
            </button>
            <button
              type="button"
              onClick={addDonation}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add donation
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={campaign.showDonorList}
            onChange={(e) => update({ showDonorList: e.target.checked })}
            className="rounded border-slate-300 text-[#3d2b7a] focus:ring-[#3d2b7a]"
          />
          Show donor list on the public page
        </label>

        {campaign.donations.length === 0 ? (
          <p className="text-sm text-slate-500 font-light py-4">No donations listed yet.</p>
        ) : (
          <ul className="space-y-3">
            {campaign.donations.map((d, index) => (
              <li
                key={`${d.date}-${index}`}
                className="grid gap-2 sm:grid-cols-[1fr_7rem_9rem_auto] rounded-xl border border-slate-100 bg-slate-50/80 p-3"
              >
                <div>
                  <label className={labelClass}>Display name</label>
                  <input
                    className={inputClass}
                    value={d.displayName}
                    onChange={(e) => updateDonation(index, { ...d, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={inputClass}
                    value={d.amount}
                    onChange={(e) =>
                      updateDonation(index, { ...d, amount: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={d.date}
                    onChange={(e) => updateDonation(index, { ...d, date: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeDonation(index)}
                    className="w-full sm:w-auto rounded-lg border border-red-200 px-3 py-2.5 text-sm text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-medium text-slate-900">Contact &amp; confirmation</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="wf-email">
              Confirmation email
            </label>
            <input
              id="wf-email"
              type="email"
              className={inputClass}
              value={campaign.contactEmail}
              onChange={(e) => update({ contactEmail: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="wf-form">
              External confirmation form URL (optional)
            </label>
            <input
              id="wf-form"
              type="url"
              className={inputClass}
              value={campaign.confirmationFormUrl}
              onChange={(e) => update({ confirmationFormUrl: e.target.value })}
              placeholder="Leave blank to hide button"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void publish()}
          disabled={publishStatus === 'publishing'}
          className="rounded-xl bg-[#3d2b7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2a1f58] disabled:opacity-50"
        >
          {publishStatus === 'publishing' ? 'Saving…' : 'Save to live site'}
        </button>
      </div>
    </div>
  )
}
