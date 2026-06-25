export type SignSpotItem = {
  id: string
  photoUrl: string
  fsa: string | null
  locationLabel: string
  caption: string
  createdAt: string
}

export type SignSpotsResponse = {
  spots: SignSpotItem[]
  countThisWeek: number
}

export async function fetchSignSpots(limit = 48): Promise<SignSpotsResponse> {
  const res = await fetch(`/api/sign-spots?limit=${limit}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Could not load sign gallery')
  }
  const data = (await res.json()) as SignSpotsResponse
  return {
    spots: data.spots ?? [],
    countThisWeek: data.countThisWeek ?? 0,
  }
}

export async function submitSignSpot(formData: FormData): Promise<{ message: string }> {
  const res = await fetch('/api/sign-spots', {
    method: 'POST',
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Upload failed')
  }
  return { message: (data as { message?: string }).message || 'Thank you for sharing your sign.' }
}

/** Canadian FSA (first 3 chars) — never store or display full postal publicly. */
export function postalToFsa(raw: string): string | null {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (compact.length >= 3 && /^[A-Z]\d[A-Z]/.test(compact)) {
    return compact.slice(0, 3)
  }
  return null
}
