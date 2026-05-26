'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  STORY_DEFAULT_AVATAR_URL,
  STORY_MAX_LENGTH,
  fetchStories,
  submitStory,
  type StoryItem,
} from '@/lib/stories'

function avatarSrc(story: StoryItem): string {
  return story.avatarUrl?.trim() || STORY_DEFAULT_AVATAR_URL
}

function StoryAvatar({ story }: { story: StoryItem }) {
  const [imgError, setImgError] = useState(false)
  const src = avatarSrc(story)

  return (
    <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-black shadow-sm sm:h-16 sm:w-16">
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-slate-200 text-base font-medium text-slate-600">
          {story.initial}
        </span>
      )}
    </div>
  )
}

function StoryCard({ story }: { story: StoryItem }) {
  return (
    <li className="flex gap-4 rounded-xl border border-slate-200/90 bg-white px-4 py-5 shadow-sm transition-shadow hover:shadow-md sm:gap-6 sm:rounded-2xl sm:px-6 sm:py-6">
      <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2 sm:w-24">
        <StoryAvatar story={story} />
        <p className="w-full text-center text-xs font-medium leading-tight text-slate-800 sm:text-sm">
          {story.displayName}
        </p>
      </div>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-600 font-light sm:text-[0.95rem] sm:leading-relaxed">
        {story.story}
      </p>
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

  const formAvatarSrc = avatarPreview || STORY_DEFAULT_AVATAR_URL

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
    <>
      <section className="relative flex items-start justify-center px-4 sm:px-6 md:px-8 pt-4 sm:pt-0 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
        <div className="relative max-w-3xl w-full text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight"
          >
            Community voices
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Share how Doug Ford&apos;s government has affected you — a short note, first name or
            nickname, optional photo. Read stories from other Ontarians below.
          </motion.p>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 pb-16 md:pb-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto space-y-10">
          <div>
            <h2 className="text-xl font-light text-gray-900 mb-2">Stories</h2>
            <p className="text-sm text-gray-500 font-light mb-6">Newest first</p>

            {loading && (
              <p className="text-sm text-gray-500 font-light py-6">Loading stories…</p>
            )}
            {loadError && <p className="text-sm text-red-600 font-light py-4">{loadError}</p>}
            {!loading && !loadError && stories.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                <p className="text-gray-600 font-light text-sm sm:text-base">
                  No stories yet — yours could be the first below.
                </p>
              </div>
            )}
            {!loading && stories.length > 0 && (
              <ul className="flex flex-col gap-3 sm:gap-4 list-none p-0 m-0">
                {stories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </ul>
            )}
          </div>

          <div
            id="share-your-story"
            className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white shadow-lg p-8 md:p-10"
          >
            <h2 className="text-2xl font-light text-gray-900 mb-2">Share your story</h2>
            <p className="text-sm text-gray-500 font-light mb-8">
              Up to {STORY_MAX_LENGTH} characters · respectful tone · photo optional
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
                <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 sm:w-28 shrink-0">
                  <div className="flex h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200 bg-black shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formAvatarSrc} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 sm:items-center">
                    <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-light underline underline-offset-2">
                      {avatarFile ? 'Change photo' : 'Add your photo'}
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
                        className="text-xs text-slate-500 hover:text-slate-700 font-light"
                        onClick={() => {
                          setAvatarFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        Use default
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-4 min-w-0">
                  <div>
                    <label htmlFor="story-name" className="block text-sm font-light text-gray-700 mb-2">
                      Name or nickname <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="story-name"
                      type="text"
                      maxLength={60}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Sarah, Brampton"
                    />
                  </div>
                  <div>
                    <label htmlFor="story-text" className="block text-sm font-light text-gray-700 mb-2">
                      Your story <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="story-text"
                      required
                      rows={4}
                      maxLength={STORY_MAX_LENGTH}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="In a few sentences, tell us what matters to you…"
                    />
                    <p
                      className={`mt-1 text-xs font-light ${remaining < 20 ? 'text-amber-600' : 'text-gray-400'}`}
                    >
                      {remaining} characters left
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] opacity-0 h-0 w-0"
                aria-hidden
              />

              {submitError && (
                <p className="text-sm text-red-600 font-light" role="alert">
                  {submitError}
                </p>
              )}
              {submitSuccess && (
                <p className="text-sm text-green-700 font-light" role="status">
                  {submitSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-lg text-base font-light hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit story'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
