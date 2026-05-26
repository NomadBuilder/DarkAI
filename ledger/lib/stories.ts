export const STORY_MAX_LENGTH = 300

export type StoryItem = {
  id: string
  displayName: string
  initial: string
  story: string
  avatarUrl: string
  createdAt: string
}

export type StoriesListResponse = {
  stories: StoryItem[]
}

export function storiesApiBase(): string {
  if (typeof window !== 'undefined') {
    return ''
  }
  return ''
}

export async function fetchStories(): Promise<StoryItem[]> {
  const res = await fetch('/api/stories', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Could not load stories')
  }
  const data = (await res.json()) as StoriesListResponse
  return data.stories ?? []
}

export async function submitStory(formData: FormData): Promise<{ message: string }> {
  const res = await fetch('/api/stories', {
    method: 'POST',
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Submission failed')
  }
  return { message: (data as { message?: string }).message || 'Thank you for sharing.' }
}
