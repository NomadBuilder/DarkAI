#!/usr/bin/env node
/**
 * Verify every published flyer fits on one letter page when printed.
 *
 * Requires: npm install (playwright + pdf-lib are devDependencies)
 * First run: npx playwright install chromium
 *
 * Usage (from repo root):
 *   node ledger/scripts/test-flyer-print-fit.mjs
 *   node ledger/scripts/test-flyer-print-fit.mjs --slug healthcare
 *
 * Serves static/protectont (run ./scripts/verify-protectont-before-deploy.sh first if stale).
 */

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const STATIC_ROOT = join(REPO_ROOT, 'static', 'protectont')
const FLYERS_JSON = join(STATIC_ROOT, 'data', 'flyers.json')

const PX_PER_IN = 96
const PAGE_W = 8.5 * PX_PER_IN
const PAGE_H = 11 * PX_PER_IN
const MIN_WIDTH_RATIO = 0.94
const MIN_HEIGHT_FILL = 0.88
const MAX_HEIGHT_RATIO = 1.02

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
}

function parseArgs(argv) {
  const slugIdx = argv.indexOf('--slug')
  return {
    slug: slugIdx >= 0 ? argv[slugIdx + 1] : null,
  }
}

function loadPublishedSlugs(filterSlug) {
  if (!existsSync(FLYERS_JSON)) {
    throw new Error(`Missing ${FLYERS_JSON} — run ./scripts/verify-protectont-before-deploy.sh first`)
  }
  const data = JSON.parse(readFileSync(FLYERS_JSON, 'utf8'))
  let slugs = (data.flyers || [])
    .filter((f) => f.published !== false && f.slug)
    .map((f) => f.slug)
  if (filterSlug) {
    slugs = slugs.filter((s) => s === filterSlug)
    if (slugs.length === 0) throw new Error(`No published flyer with slug "${filterSlug}"`)
  }
  return slugs
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

        const ext = extname(target)
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

async function measurePrintLayout(page) {
  return page.evaluate(
    ({ pageW, pageH }) => {
      const sheet = document.querySelector('.flyer-sheet')
      const pageEl = document.querySelector('.flyer-print-page')
      if (!sheet) return { error: 'Missing .flyer-sheet' }

      const transform = getComputedStyle(sheet).transform
      const box = sheet.getBoundingClientRect()
      const pageBox = pageEl?.getBoundingClientRect()

      return {
        transform,
        width: box.width,
        height: box.height,
        pageW,
        pageH,
        pageWidth: pageBox?.width ?? pageW,
        pageHeight: pageBox?.height ?? pageH,
        widthRatio: box.width / pageW,
        heightRatio: box.height / pageH,
        scrollHeight: sheet.scrollHeight,
      }
    },
    { pageW: PAGE_W, pageH: PAGE_H }
  )
}

async function pdfPageCount(page) {
  const buffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })
  const doc = await PDFDocument.load(buffer)
  return doc.getPageCount()
}

function checkMetrics(slug, metrics) {
  const issues = []
  if (metrics.error) {
    issues.push(metrics.error)
    return issues
  }
  if (metrics.heightRatio > MAX_HEIGHT_RATIO) {
    issues.push(
      `height ${(metrics.heightRatio * 100).toFixed(1)}% of page (max ${MAX_HEIGHT_RATIO * 100}%) — may spill to page 2`
    )
  }
  if (metrics.heightRatio < MIN_HEIGHT_FILL) {
    issues.push(
      `height fill ${(metrics.heightRatio * 100).toFixed(1)}% of page (min ${MIN_HEIGHT_FILL * 100}%) — flyer looks too small on the sheet`
    )
  }
  if (metrics.widthRatio < MIN_WIDTH_RATIO) {
    issues.push(
      `width ${(metrics.widthRatio * 100).toFixed(1)}% of page (min ${MIN_WIDTH_RATIO * 100}%) — not using full page width`
    )
  }
  if (metrics.transform && metrics.transform !== 'none') {
    issues.push(`unexpected CSS transform: ${metrics.transform} — print should not shrink the flyer`)
  }
  if (metrics.scrollHeight > PAGE_H * MAX_HEIGHT_RATIO) {
    issues.push(
      `content height ${metrics.scrollHeight}px exceeds page ${PAGE_H}px — may clip or paginate`
    )
  }
  return issues
}

async function main() {
  const { slug: filterSlug } = parseArgs(process.argv.slice(2))

  if (!existsSync(STATIC_ROOT)) {
    console.error(`❌ ${STATIC_ROOT} not found. Run ./scripts/verify-protectont-before-deploy.sh first.`)
    process.exit(1)
  }

  const slugs = loadPublishedSlugs(filterSlug)
  const port = 8765 + Math.floor(Math.random() * 500)
  const server = await startStaticServer(STATIC_ROOT, port)
  const baseUrl = `http://127.0.0.1:${port}`

  console.log(`Testing ${slugs.length} flyer(s) from ${STATIC_ROOT}`)
  console.log(`Server: ${baseUrl}\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1200, height: 1600 } })
  const page = await context.newPage()

  let failed = 0
  const results = []

  try {
    for (const slug of slugs) {
      const url = `${baseUrl}/flyer/${slug}/`
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.flyer-sheet', { state: 'attached', timeout: 30000 })
      await page.waitForLoadState('networkidle').catch(() => {})
      await page.emulateMedia({ media: 'print' })
      await page.waitForTimeout(100)

      const metrics = await measurePrintLayout(page)
      const pages = await pdfPageCount(page)

      const issues = [...checkMetrics(slug, metrics)]
      if (pages !== 1) {
        issues.push(`PDF has ${pages} page(s), expected 1`)
      }

      const ok = issues.length === 0
      if (!ok) failed++

      results.push({ slug, ok, pages, metrics, issues })
      const icon = ok ? '✅' : '❌'
      const fill =
        metrics.heightRatio != null
          ? ` fill=${(metrics.heightRatio * 100).toFixed(0)}%`
          : ''
      console.log(`${icon} ${slug} — ${pages} PDF page(s)${fill}`)
      if (issues.length) {
        for (const issue of issues) console.log(`   · ${issue}`)
      }
    }
  } finally {
    await browser.close()
    await new Promise((r) => server.close(r))
  }

  console.log('\n' + '='.repeat(50))
  if (failed) {
    console.error(`❌ ${failed}/${slugs.length} flyer(s) failed print-fit checks\n`)
    process.exit(1)
  }
  console.log(`✅ All ${slugs.length} flyer(s) fit on one letter page\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
