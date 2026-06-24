#!/usr/bin/env node
/**
 * Build Community Action Pack ZIP (5 letter-size PDFs).
 *
 * Requires: npm install in ledger/ (playwright devDependency)
 * First run: npx playwright install chromium
 *
 * Usage (from repo root):
 *   ./scripts/build-flyer-print-pack.sh
 *
 * Reads built static site from static/protectont (run verify-protectont first if stale).
 * Writes:
 *   static/protectont/downloads/community-action-pack.zip
 *   ledger/public/downloads/community-action-pack.zip
 *   static/protectont/downloads/flyers/{slug}.pdf (every published flyer)
 *   ledger/public/downloads/flyers/{slug}.pdf
 */

import { createServer } from 'node:http'
import {
  readFileSync,
  existsSync,
  statSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  mkdtempSync,
  copyFileSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const STATIC_ROOT = join(REPO_ROOT, 'static', 'protectont')
const LEDGER_PUBLIC_ZIP = join(REPO_ROOT, 'ledger', 'public', 'downloads', 'community-action-pack.zip')
const STATIC_ZIP = join(STATIC_ROOT, 'downloads', 'community-action-pack.zip')
const FLYERS_JSON = join(STATIC_ROOT, 'data', 'flyers.json')
const LEDGER_PDF_DIR = join(REPO_ROOT, 'ledger', 'public', 'downloads', 'flyers')
const STATIC_PDF_DIR = join(STATIC_ROOT, 'downloads', 'flyers')

/** Keep in sync with ledger/lib/flyer-print-pack.ts */
const PACK = [
  { slug: 'overview', filename: 'ProtectOnt-Overview-Flyer.pdf' },
  { slug: 'healthcare', filename: 'ProtectOnt-Healthcare.pdf' },
  { slug: 'water', filename: 'ProtectOnt-Water.pdf' },
  { slug: 'public-land', filename: 'ProtectOnt-Public-Land.pdf' },
  { slug: 'accountability', filename: 'ProtectOnt-Accountability.pdf' },
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
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

async function renderFlyerPdf(page, baseUrl, slug) {
  const url = `${baseUrl}/flyers/${slug}/`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.flyer-sheet', { state: 'attached', timeout: 30000 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.emulateMedia({ media: 'print' })
  await page.waitForTimeout(150)

  return page.pdf({
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })
}

function loadPublishedSlugs() {
  if (!existsSync(FLYERS_JSON)) {
    throw new Error(`Missing ${FLYERS_JSON}`)
  }
  const data = JSON.parse(readFileSync(FLYERS_JSON, 'utf8'))
  return (data.flyers || [])
    .filter((f) => f.published !== false && f.slug)
    .map((f) => f.slug)
}

function writePdfToDirs(slug, buffer) {
  for (const dir of [LEDGER_PDF_DIR, STATIC_PDF_DIR]) {
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${slug}.pdf`), buffer)
  }
}

async function main() {
  if (!existsSync(STATIC_ROOT) || !existsSync(join(STATIC_ROOT, 'index.html'))) {
    console.error(`❌ ${STATIC_ROOT} missing — run ./scripts/verify-protectont-before-deploy.sh first`)
    process.exit(1)
  }

  const publishedSlugs = loadPublishedSlugs()
  const port = 8865 + Math.floor(Math.random() * 500)
  const server = await startStaticServer(STATIC_ROOT, port)
  const baseUrl = `http://127.0.0.1:${port}`
  const tmpDir = mkdtempSync(join(tmpdir(), 'flyer-pack-'))

  console.log(`Building flyer PDFs (${publishedSlugs.length} published) from ${STATIC_ROOT}`)
  console.log(`Server: ${baseUrl}\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1200, height: 1600 } })
  const page = await context.newPage()

  try {
    for (const slug of publishedSlugs) {
      process.stdout.write(`  ${slug}.pdf… `)
      const buffer = await renderFlyerPdf(page, baseUrl, slug)
      writePdfToDirs(slug, buffer)
      console.log(`✓ (${(buffer.length / 1024).toFixed(0)} KB)`)
    }

    console.log('\nCommunity Action Pack ZIP:')
    for (const { slug, filename } of PACK) {
      const src = join(STATIC_PDF_DIR, `${slug}.pdf`)
      if (!existsSync(src)) {
        throw new Error(`Missing PDF for pack flyer: ${slug}`)
      }
      copyFileSync(src, join(tmpDir, filename))
      console.log(`  ${filename}`)
    }
  } finally {
    await browser.close()
    await new Promise((r) => server.close(r))
  }

  mkdirSync(join(STATIC_ROOT, 'downloads'), { recursive: true })
  mkdirSync(dirname(LEDGER_PUBLIC_ZIP), { recursive: true })

  for (const outZip of [STATIC_ZIP, LEDGER_PUBLIC_ZIP]) {
    if (existsSync(outZip)) rmSync(outZip)
    execSync(`zip -j -q ${JSON.stringify(outZip)} ${PACK.map((p) => JSON.stringify(join(tmpDir, p.filename))).join(' ')}`)
  }

  rmSync(tmpDir, { recursive: true, force: true })

  const sizeKb = (statSync(STATIC_ZIP).size / 1024).toFixed(0)
  console.log(`\n✅ community-action-pack.zip (${sizeKb} KB)`)
  console.log(`   ${STATIC_ZIP}`)
  console.log(`   ${LEDGER_PUBLIC_ZIP}`)
  console.log(`✅ ${publishedSlugs.length} individual PDFs in downloads/flyers/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
