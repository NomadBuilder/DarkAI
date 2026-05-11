'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import { getApiBaseUrl } from '../../utils/apiOrigin'

type PrintPreset = {
  id: string
  label: string
  widthIn: number
  heightIn: number
}

const PRESETS: PrintPreset[] = [
  { id: '18x24', label: '18 x 24 in (Poster)', widthIn: 18, heightIn: 24 },
  { id: '24x36', label: '24 x 36 in (Large Poster)', widthIn: 24, heightIn: 36 },
  { id: '11x17', label: '11 x 17 in (Tabloid)', widthIn: 11, heightIn: 17 },
  { id: '8.5x11', label: '8.5 x 11 in (Letter)', widthIn: 8.5, heightIn: 11 },
]

type SignLibraryItem = {
  id: string
  title: string
  headline: string
  subhead: string
  footer: string
  bgColor: string
  textColor: string
  accentColor: string
  borderColor: string
}

const SIGN_LIBRARY: SignLibraryItem[] = [
  {
    id: 'protect-services',
    title: 'Protect Public Services',
    headline: 'Protect Public Services',
    subhead: 'Stop Ford privatization',
    footer: 'protectont.ca',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#dc2626',
    borderColor: '#0f172a',
  },
  {
    id: 'healthcare-first',
    title: 'Healthcare First',
    headline: 'Fund Public Healthcare',
    subhead: 'No More Cuts. No More Sell-Offs.',
    footer: 'join us at protectont.ca',
    bgColor: '#f8fafc',
    textColor: '#0b3a5b',
    accentColor: '#dc2626',
    borderColor: '#0b3a5b',
  },
  {
    id: 'accountability',
    title: 'Accountability Now',
    headline: 'Ford Failed Ontario',
    subhead: 'Healthcare. Education. Transparency.',
    footer: 'protectont.ca/protests',
    bgColor: '#fff7ed',
    textColor: '#1f2937',
    accentColor: '#b91c1c',
    borderColor: '#1f2937',
  },
]

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  x: number,
  y: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center'
) {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let line = ''

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  })

  if (line) lines.push(line)
  ctx.textAlign = align
  lines.forEach((ln, idx) => {
    ctx.fillText(ln, x, y + idx * lineHeight)
  })
  return lines.length
}

export default function SignsPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const [presetId, setPresetId] = useState('18x24')
  const [dpi, setDpi] = useState(150)
  const [headline, setHeadline] = useState('Protect Public Services')
  const [subhead, setSubhead] = useState('Stop Ford privatization')
  const [footer, setFooter] = useState('protectont.ca')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [textColor, setTextColor] = useState('#0f172a')
  const [accentColor, setAccentColor] = useState('#dc2626')
  const [borderColor, setBorderColor] = useState('#0f172a')
  const [borderWidth, setBorderWidth] = useState(14)
  const [imageScale, setImageScale] = useState(45)
  const [imageOpacity, setImageOpacity] = useState(100)
  const [imagePosition, setImagePosition] = useState<'none' | 'top' | 'center' | 'bottom'>('center')
  const [imageName, setImageName] = useState('')
  const [imageRenderKey, setImageRenderKey] = useState(0)

  const [flowStep, setFlowStep] = useState<'design' | 'checkout'>('design')
  const [posterOrderSize, setPosterOrderSize] = useState<'18x24' | '24x36'>('18x24')
  const [uploadBusy, setUploadBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutPreviewUrl, setCheckoutPreviewUrl] = useState('')

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  )

  const dimensions = useMemo(() => {
    return {
      width: Math.max(1, Math.round(preset.widthIn * dpi)),
      height: Math.max(1, Math.round(preset.heightIn * dpi)),
    }
  }, [preset, dpi])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = dimensions
    const padX = Math.round(width * 0.08)
    const topY = Math.round(height * 0.12)

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    const stripeH = Math.round(height * 0.065)
    ctx.fillStyle = accentColor
    ctx.fillRect(0, 0, width, stripeH)
    ctx.fillRect(0, height - stripeH, width, stripeH)

    ctx.fillStyle = textColor
    const headlineLineHeight = Math.round(height * 0.102)
    const subheadLineHeight = Math.round(height * 0.068)
    ctx.font = `700 ${Math.round(height * 0.09)}px Inter, Arial, sans-serif`
    const headLines = drawWrappedText(
      ctx,
      headline,
      width - padX * 2,
      width / 2,
      topY + stripeH,
      headlineLineHeight
    )

    ctx.font = `600 ${Math.round(height * 0.055)}px Inter, Arial, sans-serif`
    const subheadY = topY + stripeH + Math.round(headLines * height * 0.11)
    const subheadLines = drawWrappedText(
      ctx,
      subhead,
      width - padX * 2,
      width / 2,
      subheadY,
      subheadLineHeight
    )

    if (imageRef.current && imagePosition !== 'none') {
      const img = imageRef.current
      const ratio = img.naturalHeight / img.naturalWidth
      const desiredW = Math.round(width * (imageScale / 100))
      const desiredH = Math.round(desiredW * ratio)
      const safeGap = Math.round(height * 0.02)
      const maxDrawW = width - padX * 2

      // Keep image in dedicated zones that avoid text and footer.
      const topZoneTop = stripeH + safeGap
      const topZoneBottom = topY + stripeH - safeGap
      const textBottom = subheadY + subheadLines * subheadLineHeight
      const lowerZoneTop = textBottom + safeGap
      const lowerZoneBottom = height - stripeH - safeGap

      const zoneTop = imagePosition === 'top' ? topZoneTop : lowerZoneTop
      const zoneBottom = imagePosition === 'top' ? topZoneBottom : lowerZoneBottom
      const zoneHeight = Math.max(0, zoneBottom - zoneTop)

      if (zoneHeight > 8) {
        const scale = Math.min(1, maxDrawW / desiredW, zoneHeight / desiredH)
        const drawW = Math.max(1, Math.round(desiredW * scale))
        const drawH = Math.max(1, Math.round(desiredH * scale))
        const x = Math.round((width - drawW) / 2)
        let y = zoneTop
        if (imagePosition === 'center') {
          y = zoneTop + Math.round((zoneHeight - drawH) / 2)
        } else if (imagePosition === 'bottom') {
          y = zoneBottom - drawH
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, imageOpacity / 100))
        ctx.drawImage(img, x, y, drawW, drawH)
        ctx.restore()
      }
    }

    ctx.fillStyle = '#ffffff'
    ctx.font = `700 ${Math.round(height * 0.045)}px Inter, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(footer.toUpperCase(), width / 2, height - Math.round(stripeH * 0.32))

    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor
      ctx.lineWidth = borderWidth
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth)
    }
  }, [
    dimensions,
    bgColor,
    textColor,
    accentColor,
    borderColor,
    borderWidth,
    headline,
    subhead,
    footer,
    imageScale,
    imageOpacity,
    imagePosition,
    imageRenderKey,
  ])

  useEffect(() => {
    if (flowStep !== 'checkout') {
      setCheckoutPreviewUrl('')
      return
    }
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas || canvas.width < 2 || canvas.height < 2) return
      try {
        setCheckoutPreviewUrl(canvas.toDataURL('image/png'))
      } catch {
        setCheckoutPreviewUrl('')
      }
    })
    return () => cancelAnimationFrame(id)
  }, [
    flowStep,
    dimensions,
    bgColor,
    textColor,
    accentColor,
    borderColor,
    borderWidth,
    headline,
    subhead,
    footer,
    imageScale,
    imageOpacity,
    imagePosition,
    imageRenderKey,
  ])

  const handleImageUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result || '')
      if (!src) return
      const img = new Image()
      img.onload = () => {
        imageRef.current = img
        setImageName(file.name)
        setImagePosition((prev) => (prev === 'none' ? 'center' : prev))
        setImageRenderKey((prev) => prev + 1)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const applySignLibraryItem = (item: SignLibraryItem) => {
    setHeadline(item.headline)
    setSubhead(item.subhead)
    setFooter(item.footer)
    setBgColor(item.bgColor)
    setTextColor(item.textColor)
    setAccentColor(item.accentColor)
    setBorderColor(item.borderColor)
  }

  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `protectont-sign-${preset.widthIn}x${preset.heightIn}-${dpi}dpi.png`
    a.click()
  }

  const goPosterCheckout = () => {
    setCheckoutError('')
    if (presetId === '18x24' || presetId === '24x36') {
      setPosterOrderSize(presetId)
    } else {
      setPosterOrderSize('18x24')
    }
    setFlowStep('checkout')
  }

  const getCheckoutWarnings = () => {
    const canvas = canvasRef.current
    if (!canvas) return { aspect: '', resolution: '' }
    const w = canvas.width
    const h = canvas.height
    const ratio = w / h
    const [pw, ph] = posterOrderSize.split('x').map(Number)
    const expected = pw / ph
    let aspect = ''
    if (Math.abs(ratio - expected) > 0.02) {
      aspect = `Canvas aspect (${ratio.toFixed(3)}) should match the poster you are ordering (${expected.toFixed(3)} for ${posterOrderSize.replace('x', '×')} in). Change print size in the builder or pick a matching order size.`
    }
    const longIn = Math.max(pw, ph)
    const minPx = longIn * 150
    const longPx = Math.max(w, h)
    let resolution = ''
    if (longPx < minPx) {
      resolution = `Long edge is ${longPx}px. For acceptable quality on a ${longIn}" poster, aim for about ${Math.ceil(minPx)}px or more (~150 DPI). Increase DPI above.`
    }
    return { aspect, resolution }
  }

  const startPosterCheckout = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const apiBase = getApiBaseUrl()
    setUploadBusy(true)
    setCheckoutError('')
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Could not export image')
      const fd = new FormData()
      fd.append('file', blob, 'poster.png')
      const up = await fetch(`${apiBase}/api/upload-print-artwork`, { method: 'POST', body: fd })
      const upJson = await up.json()
      if (!up.ok) throw new Error(upJson.error || 'Upload failed')
      const imageUrl = upJson.url as string
      const res = await fetch(`${apiBase}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, size: posterOrderSize }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Could not start checkout')
      if (j.url) window.location.href = j.url as string
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setUploadBusy(false)
    }
  }

  const printSign = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Print Sign</title>
          <style>
            body { margin: 0; display: grid; place-items: center; background: white; }
            img { width: ${preset.widthIn}in; height: ${preset.heightIn}in; object-fit: contain; }
            @page { size: ${preset.widthIn}in ${preset.heightIn}in; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Generated protest sign" />
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
          <h1 className="text-3xl md:text-4xl font-light text-slate-900">Sign Generator</h1>
          <p className="mt-2 text-slate-600 font-light max-w-3xl">
            Build printable protest signs with your own message, image, and colors. Export as PNG or print directly.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Print size</label>
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Resolution (DPI)</label>
              <select
                value={dpi}
                onChange={(e) => setDpi(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value={150}>150 DPI (fast)</option>
                <option value={200}>200 DPI (balanced)</option>
                <option value={300}>300 DPI (print quality)</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Output: {dimensions.width} x {dimensions.height} px
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-slate-600">Headline</label>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <label className="block text-sm text-slate-600">Subhead</label>
              <textarea
                value={subhead}
                onChange={(e) => setSubhead(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <label className="block text-sm text-slate-600">Footer / URL</label>
              <input
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-slate-600">Upload image/logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              {imageName ? <p className="text-xs text-slate-500">Loaded: {imageName}</p> : null}
              <select
                value={imagePosition}
                onChange={(e) => setImagePosition(e.target.value as 'none' | 'top' | 'center' | 'bottom')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="none">No image</option>
                <option value="top">Image near top</option>
                <option value="center">Image centered</option>
                <option value="bottom">Image near bottom</option>
              </select>
              <label className="block text-xs text-slate-500">
                Image size ({imageScale}%)
                <input
                  type="range"
                  min={20}
                  max={85}
                  value={imageScale}
                  onChange={(e) => setImageScale(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </label>
              <label className="block text-xs text-slate-500">
                Image opacity ({imageOpacity}%)
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={imageOpacity}
                  onChange={(e) => setImageOpacity(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-600">
                Background
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1 h-10 w-full" />
              </label>
              <label className="text-sm text-slate-600">
                Text
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="mt-1 h-10 w-full" />
              </label>
              <label className="text-sm text-slate-600">
                Accent
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="mt-1 h-10 w-full" />
              </label>
              <label className="text-sm text-slate-600">
                Border
                <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="mt-1 h-10 w-full" />
              </label>
            </div>

            <label className="block text-xs text-slate-500">
              Border width ({borderWidth}px)
              <input
                type="range"
                min={0}
                max={36}
                value={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </label>
          </aside>

          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-light text-slate-900">Live Preview</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportPng}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                >
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={printSign}
                  className="px-4 py-2 rounded-lg bg-[#2E4A6B] text-white text-sm hover:bg-[#243d56]"
                >
                  Print
                </button>
              </div>
            </div>

            <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-4">
              <canvas
                ref={canvasRef}
                className="block mx-auto max-w-full h-auto shadow-sm bg-white"
                style={{ maxHeight: '70vh' }}
              />
            </div>
          </section>
        </section>

        <section id="poster-print" className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 md:p-8 scroll-mt-28">
          <h2 className="text-xl font-light text-slate-900 mb-2">Order printed poster</h2>
          <p className="text-sm text-slate-600 font-light mb-6 max-w-2xl">
            Matte poster prints, produced on demand and mailed within Canada. Sizes: 18×24 in and 24×36 in (vertical).
            Delivery address must be in Canada.
          </p>

          {flowStep === 'design' ? (
            <button
              type="button"
              onClick={goPosterCheckout}
              className="px-5 py-2.5 rounded-lg bg-[#9f1239] text-white text-sm font-medium hover:bg-[#831036] transition-colors"
            >
              Continue to poster order
            </button>
          ) : (
            <div className="space-y-6 max-w-xl">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">What you are ordering</p>
                <p className="text-xs text-slate-500 mb-3">
                  This is the exact PNG file that will be sent to print ({dimensions.width} × {dimensions.height} px at
                  your chosen DPI).
                </p>
                {checkoutPreviewUrl ? (
                  <div className="rounded-lg border border-slate-200 bg-white overflow-hidden flex justify-center items-center max-h-[min(70vh,520px)]">
                    <img
                      src={checkoutPreviewUrl}
                      alt="Poster artwork exactly as submitted for print"
                      className="max-w-full max-h-[min(70vh,520px)] w-auto h-auto object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-8 text-center">Preparing preview…</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">Poster size</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {(
                    [
                      { id: '18x24' as const, label: '18 × 24 in', price: '$45 CAD' },
                      { id: '24x36' as const, label: '24 × 36 in', price: '$65 CAD' },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm ${
                        posterOrderSize === opt.id
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="poster-size"
                        className="sr-only"
                        checked={posterOrderSize === opt.id}
                        onChange={() => setPosterOrderSize(opt.id)}
                      />
                      <span className="block font-medium text-slate-900">{opt.label}</span>
                      <span className="block text-slate-600 mt-1">{opt.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(() => {
                const { aspect, resolution } = getCheckoutWarnings()
                return (
                  <div className="space-y-2">
                    {aspect ? (
                      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{aspect}</p>
                    ) : null}
                    {resolution ? (
                      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{resolution}</p>
                    ) : null}
                  </div>
                )
              })()}

              {checkoutError ? (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{checkoutError}</p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={uploadBusy}
                  onClick={startPosterCheckout}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-60"
                >
                  {uploadBusy ? 'Preparing…' : 'Proceed to checkout'}
                </button>
                <button
                  type="button"
                  disabled={uploadBusy}
                  onClick={() => setFlowStep('design')}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Back to editing
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-xl font-light text-slate-900 mb-2">Sign Library</h2>
          <p className="text-sm text-slate-600 font-light mb-4">
            Choose a ready-made sign template, then refine copy, image, and colors in the builder.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {SIGN_LIBRARY.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col">
                <div className="rounded-lg border border-slate-200 p-3 mb-3" style={{ backgroundColor: item.bgColor }}>
                  <div className="h-2 rounded mb-2" style={{ backgroundColor: item.accentColor }} />
                  <p className="text-sm font-semibold leading-tight" style={{ color: item.textColor }}>
                    {item.headline}
                  </p>
                  <p className="text-xs mt-1" style={{ color: item.textColor }}>
                    {item.subhead}
                  </p>
                  <div className="h-2 rounded mt-2" style={{ backgroundColor: item.accentColor }} />
                </div>
                <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
                <button
                  type="button"
                  onClick={() => applySignLibraryItem(item)}
                  className="mt-3 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                >
                  Use in builder
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
