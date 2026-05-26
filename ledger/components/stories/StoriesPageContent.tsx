'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  STORY_MAX_LENGTH,
  fetchStories,
  submitStory,
  type StoryItem,
} from '@/lib/stories'

function StoryAvatar({ story }: { story: StoryItem }) {
  const [imgError, setImgError] = useState(false)
  const showImg = story.avatarUrl && !imgError

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700 sm:h-16 sm:w-16"
      aria-hidden={!showImg}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{story.initial}</span>
      )}
    </div>
  )
}

function StoryRow({ story }: { story: StoryItem }) {
  return (
    <li className="flex gap-4 border-b border-slate-100 py-5 last:border-b-0 sm:gap-5 sm:py-6">
      <StoryAvatar story={story} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{story.displayName}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700 sm:text-base">{story.story}</p>
      </div>
    </li>
  )
}

export default function StoriesPageContent() {
  const [stories, setStories] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [story, setStory] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadStories = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const list = await fetchStories()
      setStories(list)
    } catch {
      setLoadError('Stories could not be loaded right now. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStories()
  }, [loadStories])

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null)
      return
    }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')
    const trimmed = story.trim()
    if (!trimmed) {
      setSubmitError('Please share your story.')
      return
    }
    if (trimmed.length > STORY_MAX_LENGTH) {
      setSubmitError(`Story must be ${STORY_MAX_LENGTH} characters or fewer.`)
      return
    }

    const fd = new FormData()
    fd.append('displayName', displayName.trim())
    fd.append('story', trimmed)
    fd.append('website', '')
    if (avatarFile) fd.append('avatar', avatarFile)

    setSubmitting(true)
    try {
      const { message } = await submitStory(fd)
      setSubmitSuccess(message)
      setDisplayName('')
      setStory('')
      setAvatarFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadStories()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const remaining = STORY_MAX_LENGTH - story.length

  return (
    <div className="max-w-3xl mx-auto w-full">
      <header className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4">
          Your stories
        </h1>
        <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
          How has Doug Ford&apos;s government affected you? Why do you want change? Share a short
          note — we&apos;ll display it here (first name or nickname only; photo optional).
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-10">
        <h2 className="text-xl font-light text-gray-900 mb-6">Share your story</h2>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-600">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{(displayName.trim()[0] || '?').toUpperCase()}</span>
                )}
              </div>
              <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 underline underline-offset-2">
                Add photo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {avatarFile && (
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    setAvatarFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                >
                  Remove photo
                </button>
              )}
            </div>
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <label htmlFor="story-name" className="block text-sm text-gray-700 mb-2">
                  Name or nickname <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="story-name"
                  type="text"
                  maxLength={60}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sam from Hamilton"
                />
              </div>
              <div>
                <label htmlFor="story-text" className="block text-sm text-gray-700 mb-2">
                  Your story <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="story-text"
                  required
                  rows={4}
                  maxLength={STORY_MAX_LENGTH}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="In a few sentences, tell us what matters to you…"
                />
                <p
                  className={`mt-1 text-xs ${remaining < 20 ? 'text-amber-600' : 'text-gray-400'}`}
                >
                  {remaining} characters left
                </p>
              </div>
            </div>
          </div>

          {/* Honeypot — hidden from users */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px] opacity-0 h-0 w-0"
            aria-hidden
          />

          {submitError && (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="text-sm text-green-700" role="status">
              {submitSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-lg text-base font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit story'}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-light text-gray-900 mb-2">Community voices</h2>
        <p className="text-sm text-gray-500 font-light mb-6">
          Short stories from Ontarians — newest first.
        </p>

        {loading && <p className="text-gray-500 font-light">Loading stories…</p>}
        {loadError && <p className="text-red-600 text-sm">{loadError}</p>}
        {!loading && !loadError && stories.length === 0 && (
          <p className="text-gray-500 font-light">Be the first to share your story above.</p>
        )}
        {!loading && stories.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {stories.map((s) => (
              <StoryRow key={s.id} story={s} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
