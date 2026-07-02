#!/usr/bin/env node
/**
 * Build Standing for the Land printable flyer PDFs (letter size).
 *
 * Unlisted print routes: /stand4land/print/{slug}/
 * Output (local only, not deployed): ledger/output/hub-flyers/{slug}.pdf
 *
 * Usage (from repo root, after static build):
 *   ./scripts/verify-protectont-before-deploy.sh   # or ledger build + static copy
 *   cd ledger && node scripts/build-hub-flyer-pdfs.mjs
 *
 * Also writes ledger/public/hub/stand4land-flyer-qr.png for print footer QR.
 */

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const REPO_ROOT = join(ROOT, '..')
const STATIC_ROOT = join(REPO_ROOT, 'static', 'protectont')
const OUTPUT_DIR = join(ROOT, 'output', 'hub-flyers')
const QR_PATH = join(ROOT, 'public', 'hub', 'stand4land-flyer-qr.png')
const HUB_FLYER_SITE = 'https://protectont.ca/stand4land/'

const SLUGS = ['overview', 'how-to-support']

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

function startStaticServer(rootDir, port) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
        if (urlPath === '/') urlPath = '/index.html'
        if (urlPath.endsWith('/')) urlPath += 'index.html'

        const filePath = join(rootDir, urlPath)
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403)
          res.end('Forbidden')
          return
        }

        let target = filePath
        if (existsSync(target) && statSync(target).isDirectory()) {
          target = join(filePath, 'index.html')
        }
        if (!existsSync(target)) {
          res.writeHead(404)
          res.end('Not found')
          return
        }

        const ext = target.slice(target.lastIndexOf('.'))
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        res.end(readFileSync(target))
      } catch (err) {
        res.writeHead(500)
        res.end(String(err))
      }
    })

    server.on('error', reject)
    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}

async function fetchQrPng(staticRoot) {
  const targets = [QR_PATH, join(staticRoot, 'hub', 'stand4land-flyer-qr.png')]
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(HUB_FLYER_SITE)}`
  const res = await fetch(qrApi)
  if (!res.ok) throw new Error(`QR fetch failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  for (const target of targets) {
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, buf)
  }
  console.log('✅ QR → public/hub/ + static/protectont/hub/')
}

async function renderFlyerPdf(page, baseUrl, slug) {
  const url = `${baseUrl}/stand4land/print/${slug}/`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.flyer-sheet', { state: 'attached', timeout: 30000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.emulateMedia({ media: 'print' })
  await page.waitForTimeout(200)

  return page.pdf({
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })
}

async function main() {
  if (!existsSync(join(STATIC_ROOT, 'index.html'))) {
    console.error(`❌ ${STATIC_ROOT} missing — run ./scripts/verify-protectont-before-deploy.sh first`)
    process.exit(1)
  }

  await fetchQrPng(STATIC_ROOT)

  mkdirSync(OUTPUT_DIR, { recursive: true })

  const port = 8875 + Math.floor(Math.random() * 500)
  const server = await startStaticServer(STATIC_ROOT, port)
  const baseUrl = `http://127.0.0.1:${port}`

  console.log(`Building hub flyer PDFs → ${OUTPUT_DIR}`)
  console.log(`Preview routes: /stand4land/print/{${SLUGS.join(', ')}}/`)
  console.log(`Server: ${baseUrl}\n`)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } })

  try {
    for (const slug of SLUGS) {
      process.stdout.write(`  ${slug}.pdf… `)
      const buffer = await renderFlyerPdf(page, baseUrl, slug)
      const out = join(OUTPUT_DIR, `${slug}.pdf`)
      writeFileSync(out, buffer)
      console.log(`✓ (${(buffer.length / 1024).toFixed(0)} KB) → ${out}`)
    }
  } finally {
    await browser.close()
    await new Promise((r) => server.close(r))
  }

  console.log(`\n✅ ${SLUGS.length} hub flyers in ledger/output/hub-flyers/ (local only — not in static bundle)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
