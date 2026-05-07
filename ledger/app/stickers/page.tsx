'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import TopNavigation from '../../components/TopNavigation'

type StickerPreset = {
  id: string
  label: string
  widthIn: number
  heightIn: number
}

const PRESETS: StickerPreset[] = [
  { id: '3x3', label: '3 x 3 in (Square sticker)', widthIn: 3, heightIn: 3 },
  { id: '4x4', label: '4 x 4 in (Square sticker)', widthIn: 4, heightIn: 4 },
  { id: '5x5', label: '5 x 5 in (Square sticker)', widthIn: 5, heightIn: 5 },
  { id: '11x8.5-sheet', label: '11 x 8.5 in (Sticker sheet)', widthIn: 11, heightIn: 8.5 },
]

const DEFAULT_BASE_IMAGE = '/stickers-base.png'
type StickerLibraryItem = {
  id: string
  title: string
  description: string
  imageUrl?: string
  headline: string
  subhead: string
  textColor: string
  strokeColor: string
  overlayOpacity: number
  showCircleCut: boolean
}

const STICKER_LIBRARY: StickerLibraryItem[] = [
  {
    id: 'collage-pack',
    title: 'Sticker Pack Collage',
    description: 'Use your uploaded collage as a starting base for remixes.',
    imageUrl: DEFAULT_BASE_IMAGE,
    headline: 'DOUG FORD HATES ONTARIO',
    subhead: '',
    textColor: '#fff200',
    strokeColor: '#000000',
    overlayOpacity: 0,
    showCircleCut: true,
  },
]

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  x: number,
  y: number,
  lineHeight: number
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
  lines.forEach((ln, idx) => ctx.fillText(ln, x, y + idx * lineHeight))
}

export default function StickersPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const baseImageRef = useRef<HTMLImageElement | null>(null)
  const stickerImageRef = useRef<HTMLImageElement | null>(null)

  const [presetId, setPresetId] = useState('4x4')
  const [dpi, setDpi] = useState(300)
  const [headline, setHeadline] = useState('DOUG FORD HATES ONTARIO')
  const [subhead, setSubhead] = useState('')
  const [bgColor, setBgColor] = useState('#f8fafc')
  const [textColor, setTextColor] = useState('#fff200')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const [baseScale, setBaseScale] = useState(100)
  const [stickerScale, setStickerScale] = useState(0)
  const [stickerOpacity, setStickerOpacity] = useState(100)
  const [showCircleCut, setShowCircleCut] = useState(true)
  const [imageName, setImageName] = useState('none')
  const [renderKey, setRenderKey] = useState(0)

  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0], [presetId])

  const dimensions = useMemo(
    () => ({
      width: Math.max(1, Math.round(preset.widthIn * dpi)),
      height: Math.max(1, Math.round(preset.heightIn * dpi)),
    }),
    [preset, dpi]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = dimensions
    const pad = Math.round(Math.min(width, height) * 0.07)

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    if (baseImageRef.current) {
      const img = baseImageRef.current
      const scale = Math.max(0.2, baseScale / 100)
      const drawW = Math.round(width * scale)
      const drawH = Math.round((drawW * img.naturalHeight) / img.naturalWidth)
      const x = Math.round((width - drawW) / 2)
      const y = Math.round((height - drawH) / 2)
      ctx.drawImage(img, x, y, drawW, drawH)
    }

    if (stickerImageRef.current && stickerScale > 0) {
      const img = stickerImageRef.current
      const drawW = Math.round(width * (stickerScale / 100))
      const drawH = Math.round((drawW * img.naturalHeight) / img.naturalWidth)
      const x = Math.round((width - drawW) / 2)
      const y = Math.round((height - drawH) / 2)
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, stickerOpacity / 100))
      ctx.drawImage(img, x, y, drawW, drawH)
      ctx.restore()
    }

    if (overlayOpacity > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(0.75, overlayOpacity / 100))})`
      ctx.fillRect(0, 0, width, height)
    }

    if (showCircleCut) {
      const lineW = Math.max(2, Math.round(Math.min(width, height) * 0.006))
      const radius = Math.round(Math.min(width, height) / 2 - pad)
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'
      ctx.lineWidth = lineW
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    const headlineFont = Math.round(Math.min(width, height) * 0.13)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.lineJoin = 'round'
    ctx.fillStyle = textColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = Math.max(2, Math.round(headlineFont * 0.14))
    ctx.font = `900 ${headlineFont}px "Arial Black", Impact, sans-serif`
    const startY = pad + Math.round(height * 0.16)

    const words = headline.trim()
    if (words) {
      const lines: string[] = []
      const chunks = words.split(' ')
      let line = ''
      const maxWidth = width - pad * 2
      chunks.forEach((word) => {
        const testLine = line ? `${line} ${word}` : word
        if (ctx.measureText(testLine).width > maxWidth && line) {
          lines.push(line)
          line = word
        } else {
          line = testLine
        }
      })
      if (line) lines.push(line)
      lines.forEach((ln, idx) => {
        const y = startY + idx * Math.round(headlineFont * 0.95)
        ctx.strokeText(ln, width / 2, y)
        ctx.fillText(ln, width / 2, y)
      })
    }

    if (subhead.trim()) {
      const subFont = Math.round(Math.min(width, height) * 0.09)
      ctx.font = `700 ${subFont}px "Arial Black", Impact, sans-serif`
      ctx.lineWidth = Math.max(2, Math.round(subFont * 0.12))
      const y = height - pad - Math.round(subFont * 1.4)
      drawWrappedText(ctx, subhead.toUpperCase(), width - pad * 2, width / 2, y, Math.round(subFont * 1.02))
    }
  }, [
    dimensions,
    headline,
    subhead,
    bgColor,
    textColor,
    strokeColor,
    overlayOpacity,
    baseScale,
    stickerScale,
    stickerOpacity,
    showCircleCut,
    renderKey,
  ])

  const handleBaseUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result || '')
      if (!src) return
      const img = new Image()
      img.onload = () => {
        baseImageRef.current = img
        setImageName(file.name)
        setRenderKey((prev) => prev + 1)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const downloadStickerLibraryItem = (item: StickerLibraryItem) => {
    if (!item.imageUrl) return
    const a = document.createElement('a')
    a.href = item.imageUrl
    a.download = `${item.id}.png`
    a.click()
  }

  const handleOverlayUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result || '')
      if (!src) return
      const img = new Image()
      img.onload = () => {
        stickerImageRef.current = img
        if (stickerScale === 0) setStickerScale(42)
        setRenderKey((prev) => prev + 1)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `protectont-sticker-${preset.widthIn}x${preset.heightIn}-${dpi}dpi.png`
    a.click()
  }

  const printSticker = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Print Sticker</title>
          <style>
            body { margin: 0; display: grid; place-items: center; background: white; }
            img { width: ${preset.widthIn}in; height: ${preset.heightIn}in; object-fit: contain; }
            @page { size: ${preset.widthIn}in ${preset.heightIn}in; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Generated sticker design" />
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
          <h1 className="text-3xl md:text-4xl font-light text-slate-900">Sticker Generator</h1>
          <p className="mt-2 text-slate-600 font-light max-w-3xl">
            Start from the provided sticker base, customize text/colors, or upload your own artwork to generate printable sticker designs.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Sticker size</label>
              <select value={presetId} onChange={(e) => setPresetId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Resolution (DPI)</label>
              <select value={dpi} onChange={(e) => setDpi(parseInt(e.target.value, 10))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value={200}>200 DPI (draft)</option>
                <option value={300}>300 DPI (print)</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Output: {dimensions.width} x {dimensions.height} px
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-slate-600">Main text</label>
              <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <label className="block text-sm text-slate-600">Bottom text (optional)</label>
              <input value={subhead} onChange={(e) => setSubhead(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Base image</label>
              <input type="file" accept="image/*" onChange={(e) => handleBaseUpload(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
              <p className="text-xs text-slate-500">Using: {imageName}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Optional overlay image</label>
              <input type="file" accept="image/*" onChange={(e) => handleOverlayUpload(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
            </div>

            <label className="block text-xs text-slate-500">
              Base scale ({baseScale}%)
              <input type="range" min={60} max={160} value={baseScale} onChange={(e) => setBaseScale(parseInt(e.target.value, 10))} className="w-full" />
            </label>

            <label className="block text-xs text-slate-500">
              Overlay scale ({stickerScale}%)
              <input type="range" min={0} max={100} value={stickerScale} onChange={(e) => setStickerScale(parseInt(e.target.value, 10))} className="w-full" />
            </label>

            <label className="block text-xs text-slate-500">
              Overlay opacity ({stickerOpacity}%)
              <input type="range" min={20} max={100} value={stickerOpacity} onChange={(e) => setStickerOpacity(parseInt(e.target.value, 10))} className="w-full" />
            </label>

            <label className="block text-xs text-slate-500">
              Darken background ({overlayOpacity}%)
              <input type="range" min={0} max={70} value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseInt(e.target.value, 10))} className="w-full" />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={showCircleCut} onChange={(e) => setShowCircleCut(e.target.checked)} />
              Show circular cut guide
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-600">
                Background
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1 h-10 w-full" />
              </label>
              <label className="text-sm text-slate-600">
                Text color
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="mt-1 h-10 w-full" />
              </label>
              <label className="text-sm text-slate-600">
                Stroke color
                <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="mt-1 h-10 w-full" />
              </label>
            </div>
          </aside>

          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-light text-slate-900">Live Preview</h2>
              <div className="flex gap-2">
                <button type="button" onClick={exportPng} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">
                  Download PNG
                </button>
                <button type="button" onClick={printSticker} className="px-4 py-2 rounded-lg bg-[#2E4A6B] text-white text-sm hover:bg-[#243d56]">
                  Print
                </button>
              </div>
            </div>

            <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-4">
              <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto shadow-sm bg-white" style={{ maxHeight: '70vh' }} />
            </div>
          </section>
        </section>

        <section className="mt-8 bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-xl font-light text-slate-900 mb-2">Sticker Library</h2>
          <p className="text-sm text-slate-600 font-light mb-4">
            Pick a starter from the library, then customize it in the builder above.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {STICKER_LIBRARY.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full aspect-square object-cover rounded-lg border border-slate-200 mb-3" />
                ) : (
                  <div className="w-full aspect-square rounded-lg border border-slate-200 mb-3 grid place-items-center bg-white text-center px-3">
                    <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                  </div>
                )}
                <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 mb-3">{item.description}</p>
                <button
                  type="button"
                  onClick={() => downloadStickerLibraryItem(item)}
                  className="mt-auto px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                >
                  Download
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
