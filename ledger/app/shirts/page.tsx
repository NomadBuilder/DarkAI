'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import { getApiBaseUrl } from '../../utils/apiOrigin'

type TransferPreset = {
  id: string
  label: string
  widthIn: number
  heightIn: number
}

const PRESETS: TransferPreset[] = [
  { id: '8.5x11', label: 'Letter sheet (8.5 x 11 in)', widthIn: 8.5, heightIn: 11 },
  { id: '11x17', label: 'Tabloid sheet (11 x 17 in)', widthIn: 11, heightIn: 17 },
]

const IDEAS = [
  'Protect Public Services',
  'Healthcare Over Profits',
  'Fund Schools, Fund Care',
  'Public Dollars, Public Good',
]

type ShirtLibraryItem = {
  id: string
  title: string
  headline: string
  subhead: string
  bgColor: string
  textColor: string
  accentColor: string
}

const SHIRT_LIBRARY: ShirtLibraryItem[] = [
  {
    id: 'protect-public-services',
    title: 'Protect Public Services',
    headline: 'Protect Public Services',
    subhead: 'Ontario belongs to all of us',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#dc2626',
  },
  {
    id: 'healthcare-over-profits',
    title: 'Healthcare Over Profits',
    headline: 'Healthcare Over Profits',
    subhead: 'Defend public hospitals',
    bgColor: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#2563eb',
  },
  {
    id: 'fund-schools-fund-care',
    title: 'Fund Schools, Fund Care',
    headline: 'Fund Schools, Fund Care',
    subhead: 'Invest in communities',
    bgColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#16a34a',
  },
  {
    id: 'public-dollars-public-good',
    title: 'Public Dollars, Public Good',
    headline: 'Public Dollars',
    subhead: 'Public Good',
    bgColor: '#fefce8',
    textColor: '#0f172a',
    accentColor: '#ca8a04',
  },
]

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let current = ''
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  })
  if (current) lines.push(current)
  lines.forEach((line, idx) => ctx.fillText(line, x, y + idx * lineHeight))
}

const SHIRT_ORDER_SIZES = ['S', 'M', 'L', 'XL', '2XL'] as const

type ShirtPaintParams = {
  dimensions: { width: number; height: number }
  dpi: number
  bgColor: string
  accentColor: string
  textColor: string
  headline: string
  subhead: string
  image: HTMLImageElement | null
  imageScale: number
  imageOpacity: number
  mirrorForTransfer: boolean
  showCutGuide: boolean
}

/** Shared by live preview and shipped-tee export (export uses mirrorForTransfer: false). */
function paintShirtDesign(canvas: HTMLCanvasElement, p: ShirtPaintParams) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = p.dimensions
  canvas.width = width
  canvas.height = height
  const pad = Math.round(width * 0.08)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = p.bgColor
  ctx.fillRect(0, 0, width, height)

  if (p.mirrorForTransfer) {
    ctx.save()
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  }

  if (p.image && p.imageScale > 0) {
    const img = p.image
    const drawW = Math.round(width * (p.imageScale / 100))
    const drawH = Math.round((drawW * img.naturalHeight) / img.naturalWidth)
    const x = Math.round((width - drawW) / 2)
    const y = Math.round((height - drawH) / 2)
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, p.imageOpacity / 100))
    ctx.drawImage(img, x, y, drawW, drawH)
    ctx.restore()
  }

  ctx.fillStyle = p.accentColor
  ctx.fillRect(0, Math.round(height * 0.06), width, Math.round(height * 0.07))

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const headlineSize = Math.round(height * 0.1)
  ctx.font = `900 ${headlineSize}px "Arial Black", Inter, sans-serif`
  ctx.fillStyle = p.textColor
  drawWrappedText(
    ctx,
    p.headline,
    width / 2,
    Math.round(height * 0.2),
    width - pad * 2,
    Math.round(headlineSize * 0.95)
  )

  const subheadSize = Math.round(height * 0.05)
  ctx.font = `700 ${subheadSize}px Inter, Arial, sans-serif`
  ctx.fillStyle = p.textColor
  drawWrappedText(
    ctx,
    p.subhead,
    width / 2,
    Math.round(height * 0.78),
    width - pad * 2,
    Math.round(subheadSize * 1.1)
  )

  if (p.mirrorForTransfer) {
    ctx.restore()
  }

  if (p.showCutGuide) {
    const bleed = Math.round(0.25 * p.dpi)
    ctx.strokeStyle = '#94a3b8'
    ctx.setLineDash([14, 10])
    ctx.lineWidth = Math.max(2, Math.round(p.dpi / 100))
    ctx.strokeRect(bleed, bleed, width - bleed * 2, height - bleed * 2)
    ctx.setLineDash([])
  }
}

export default function ShirtsPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const [presetId, setPresetId] = useState('8.5x11')
  const [dpi, setDpi] = useState(300)
  const [headline, setHeadline] = useState('Protect Public Services')
  const [subhead, setSubhead] = useState('protectont.ca')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [textColor, setTextColor] = useState('#0f172a')
  const [accentColor, setAccentColor] = useState('#dc2626')
  const [mirrorForTransfer, setMirrorForTransfer] = useState(true)
  const [showCutGuide, setShowCutGuide] = useState(true)
  const [imageScale, setImageScale] = useState(0)
  const [imageOpacity, setImageOpacity] = useState(100)
  const [imageName, setImageName] = useState('none')
  const [renderKey, setRenderKey] = useState(0)
  const [shirtOrderSize, setShirtOrderSize] = useState<(typeof SHIRT_ORDER_SIZES)[number]>('M')
  const [shirtCheckoutBusy, setShirtCheckoutBusy] = useState(false)
  const [shirtCheckoutError, setShirtCheckoutError] = useState('')

  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0], [presetId])
  const dimensions = useMemo(
    () => ({
      width: Math.round(preset.widthIn * dpi),
      height: Math.round(preset.heightIn * dpi),
    }),
    [preset, dpi]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    paintShirtDesign(canvas, {
      dimensions,
      dpi,
      bgColor,
      accentColor,
      textColor,
      headline,
      subhead,
      image: imageRef.current,
      imageScale,
      imageOpacity,
      mirrorForTransfer,
      showCutGuide,
    })
  }, [
    dimensions,
    headline,
    subhead,
    bgColor,
    textColor,
    accentColor,
    mirrorForTransfer,
    showCutGuide,
    imageScale,
    imageOpacity,
    renderKey,
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
        if (imageScale === 0) setImageScale(45)
        setRenderKey((prev) => prev + 1)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const downloadTransfer = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `protectont-shirt-transfer-${preset.widthIn}x${preset.heightIn}-${dpi}dpi.png`
    a.click()
  }

  const startShirtCheckout = async () => {
    const exportCanvas = document.createElement('canvas')
    paintShirtDesign(exportCanvas, {
      dimensions,
      dpi,
      bgColor,
      accentColor,
      textColor,
      headline,
      subhead,
      image: imageRef.current,
      imageScale,
      imageOpacity,
      mirrorForTransfer: false,
      showCutGuide: false,
    })
    const apiBase = getApiBaseUrl()
    setShirtCheckoutBusy(true)
    setShirtCheckoutError('')
    try {
      const blob = await new Promise<Blob | null>((resolve) => exportCanvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Could not export image')
      const fd = new FormData()
      fd.append('file', blob, 'shirt-front.png')
      const up = await fetch(`${apiBase}/api/upload-print-artwork`, { method: 'POST', body: fd })
      const upJson = await up.json()
      if (!up.ok) throw new Error(upJson.error || 'Upload failed')
      const imageUrl = upJson.url as string
      const res = await fetch(`${apiBase}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'shirt',
          imageUrl,
          shirtSize: shirtOrderSize,
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Could not start checkout')
      if (j.url) window.location.href = j.url as string
    } catch (e) {
      setShirtCheckoutError(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setShirtCheckoutBusy(false)
    }
  }

  const printTransfer = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Print Iron-on Transfer</title>
          <style>
            body { margin: 0; display: grid; place-items: center; background: white; }
            img { width: ${preset.widthIn}in; height: ${preset.heightIn}in; object-fit: contain; }
            @page { size: ${preset.widthIn}in ${preset.heightIn}in; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Printable shirt transfer" />
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const downloadLibraryTransfer = (item: ShirtLibraryItem) => {
    const libPreset = PRESETS[0]
    const libDpi = 300
    const width = Math.round(libPreset.widthIn * libDpi)
    const height = Math.round(libPreset.heightIn * libDpi)
    const pad = Math.round(width * 0.08)
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = width
    exportCanvas.height = height
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = item.bgColor
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = item.accentColor
    ctx.fillRect(0, Math.round(height * 0.06), width, Math.round(height * 0.07))

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const headlineSize = Math.round(height * 0.1)
    ctx.font = `900 ${headlineSize}px "Arial Black", Inter, sans-serif`
    ctx.fillStyle = item.textColor
    drawWrappedText(ctx, item.headline, width / 2, Math.round(height * 0.2), width - pad * 2, Math.round(headlineSize * 0.95))

    const subheadSize = Math.round(height * 0.05)
    ctx.font = `700 ${subheadSize}px Inter, Arial, sans-serif`
    drawWrappedText(ctx, item.subhead, width / 2, Math.round(height * 0.78), width - pad * 2, Math.round(subheadSize * 1.1))

    const a = document.createElement('a')
    a.href = exportCanvas.toDataURL('image/png')
    a.download = `protectont-shirt-template-${item.id}.png`
    a.click()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-slate-900">Shirt Transfers</h1>
          <p className="mt-2 text-slate-600 font-light max-w-3xl">
            Build graphics for iron-on transfers (mirror as needed) or order a{' '}
            <strong className="font-medium text-slate-800">printed white tee</strong> mailed within Canada with your design
            on the chest. For large posters, use the Signs page.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Transfer sheet</label>
              <select value={presetId} onChange={(e) => setPresetId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Resolution</label>
              <select value={dpi} onChange={(e) => setDpi(parseInt(e.target.value, 10))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value={200}>200 DPI (draft)</option>
                <option value={300}>300 DPI (print)</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Output: {dimensions.width} x {dimensions.height} px
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Headline</label>
              <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <label className="block text-sm text-slate-600">Subhead / URL</label>
              <input value={subhead} onChange={(e) => setSubhead(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              <div className="flex flex-wrap gap-2 pt-1">
                {IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setHeadline(idea)}
                    className="px-2 py-1 rounded-md border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Upload image/logo</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
              <p className="text-xs text-slate-500">Loaded: {imageName}</p>
            </div>

            <label className="block text-xs text-slate-500">
              Image size ({imageScale}%)
              <input type="range" min={0} max={90} value={imageScale} onChange={(e) => setImageScale(parseInt(e.target.value, 10))} className="w-full" />
            </label>

            <label className="block text-xs text-slate-500">
              Image opacity ({imageOpacity}%)
              <input type="range" min={20} max={100} value={imageOpacity} onChange={(e) => setImageOpacity(parseInt(e.target.value, 10))} className="w-full" />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={mirrorForTransfer} onChange={(e) => setMirrorForTransfer(e.target.checked)} />
              Mirror for iron-on transfer
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={showCutGuide} onChange={(e) => setShowCutGuide(e.target.checked)} />
              Show trim guide (0.25in)
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-slate-600">
                BG
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1 h-9 w-full" />
              </label>
              <label className="text-xs text-slate-600">
                Text
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="mt-1 h-9 w-full" />
              </label>
              <label className="text-xs text-slate-600">
                Accent
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="mt-1 h-9 w-full" />
              </label>
            </div>
          </aside>

          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-light text-slate-900">Live Transfer Preview</h2>
              <div className="flex gap-2">
                <button type="button" onClick={downloadTransfer} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800">
                  Download PNG
                </button>
                <button type="button" onClick={printTransfer} className="px-4 py-2 rounded-lg bg-[#2E4A6B] text-white text-sm hover:bg-[#243d56]">
                  Print
                </button>
              </div>
            </div>

            <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-4">
              <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto shadow-sm bg-white" style={{ maxHeight: '70vh' }} />
            </div>
          </section>
        </section>

        <section
          id="shirt-print"
          className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 scroll-mt-28"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-[#2E4A6B] font-medium mb-2">Shipped to you</p>
          <h2 className="text-2xl font-light text-slate-900 mb-2">Order a printed white tee</h2>
          <p className="text-sm text-slate-600 font-light leading-relaxed max-w-3xl mb-6">
            White unisex cotton tee with your artwork printed on the chest. The file we send to production uses the{' '}
            <strong className="font-medium text-slate-800">normal</strong> orientation (not mirrored)—even if your preview
            is mirrored for iron-on. We only ship within Canada. The amount due is shown at checkout before you pay.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4">
            <label className="block text-sm text-slate-600">
              Size
              <select
                value={shirtOrderSize}
                onChange={(e) => setShirtOrderSize(e.target.value as (typeof SHIRT_ORDER_SIZES)[number])}
                className="mt-1 block w-full sm:w-48 rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                {SHIRT_ORDER_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void startShirtCheckout()}
              disabled={shirtCheckoutBusy}
              className="inline-flex justify-center rounded-xl bg-gradient-to-r from-[#9f1239] to-[#7f1230] px-6 py-3 text-sm font-medium text-white shadow-md hover:opacity-95 disabled:opacity-60"
            >
              {shirtCheckoutBusy ? 'Preparing…' : 'Proceed to checkout'}
            </button>
          </div>
          {shirtCheckoutError ? (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{shirtCheckoutError}</p>
          ) : null}
        </section>

        <section className="mt-10 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-2xl font-light text-slate-900">Shirt Library</h2>
            <p className="mt-1 text-sm text-slate-600">
              Ready-made iron-on templates for light fabric transfers. Download and print directly.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SHIRT_LIBRARY.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <h3 className="text-base font-medium text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500">8.5 x 11 in, 300 DPI PNG</p>
                <div className="mt-3 rounded-lg border border-slate-300 overflow-hidden bg-white">
                  <div className="h-3" style={{ backgroundColor: item.accentColor }} />
                  <div className="p-3">
                    <p className="text-sm font-semibold" style={{ color: item.textColor }}>
                      {item.headline}
                    </p>
                    <p className="text-xs mt-1" style={{ color: item.textColor }}>
                      {item.subhead}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadLibraryTransfer(item)}
                  className="mt-4 w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                >
                  Download template
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
