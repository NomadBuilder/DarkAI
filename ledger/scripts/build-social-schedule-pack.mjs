#!/usr/bin/env node
/**
 * Export social schedule pack: numbered PNGs, caption TXTs, schedule.csv, ZIP.
 *
 * Requires static/protectont built with /social-export/[id]/ routes.
 * From repo root: ./scripts/build-social-schedule-pack.sh
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
  readdirSync,
  cpSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const STATIC_ROOT = join(REPO_ROOT, 'static', 'protectont')
const IDEAS_JSON = join(REPO_ROOT, 'ledger', 'public', 'data', 'social-post-ideas.json')
const LEDGER_OUT = join(REPO_ROOT, 'ledger', 'public', 'downloads', 'social-schedule')
const STATIC_OUT = join(STATIC_ROOT, 'downloads', 'social-schedule')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.zip': 'application/zip',
}

const ISSUE_ORDER = [
  'healthcare',
  'education',
  'water',
  'public-land',
  'greenbelt',
  'accountability',
  'transparency',
  'foi',
  'ontario-place',
  'ring-of-fire',
  'bike-lanes',
]

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
        if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
          res.writeHead(404)
          res.end('Not found')
          return
        }
        const ext = filePath.slice(filePath.lastIndexOf('.'))
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        res.end(readFileSync(filePath))
      } catch {
        res.writeHead(500)
        res.end('Error')
      }
    })
    server.on('error', reject)
    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}

function loadIdeas() {
  if (!existsSync(IDEAS_JSON)) {
    throw new Error(`Missing ${IDEAS_JSON} — run: cd ledger && npx tsx scripts/sync-social-ideas-json.ts`)
  }
  const data = JSON.parse(readFileSync(IDEAS_JSON, 'utf8'))
  const ideas = (data.ideas || []).filter((i) => i.headline?.trim())
  if (!ideas.length) throw new Error('No exportable ideas (need headline)')
  return ideas
}

function interleaveByIssue(ideas) {
  const byIssue = new Map()
  for (const idea of ideas) {
    const list = byIssue.get(idea.issue) || []
    list.push(idea)
    byIssue.set(idea.issue, list)
  }

  const keys = [
    ...ISSUE_ORDER.filter((k) => byIssue.has(k)),
    ...[...byIssue.keys()].filter((k) => !ISSUE_ORDER.includes(k)).sort(),
  ]

  const maxLen = Math.max(...keys.map((k) => byIssue.get(k).length))
  const ordered = []
  for (let i = 0; i < maxLen; i++) {
    for (const key of keys) {
      const list = byIssue.get(key)
      if (i < list.length) ordered.push(list[i])
    }
  }
  return ordered
}

function nextTuesday(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const add = day <= 2 ? 2 - day : 9 - day
  date.setDate(date.getDate() + (add === 0 ? 7 : add))
  return date
}

/** Tue + Thu 10:00 America/Toronto approximated as local wall-clock in script env */
function buildScheduleDates(count, start = new Date()) {
  const slots = []
  let weekStart = nextTuesday(start)
  let slotInWeek = 0

  while (slots.length < count) {
    const d = new Date(weekStart)
    if (slotInWeek === 0) d.setDate(d.getDate())
    else if (slotInWeek === 1) d.setDate(d.getDate() + 2)
    else {
      weekStart = new Date(weekStart)
      weekStart.setDate(weekStart.getDate() + 7)
      slotInWeek = 0
      continue
    }
    d.setHours(10, 0, 0, 0)
    slots.push(d)
    slotInWeek++
  }
  return slots
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatFilename(index, id) {
  return `${pad2(index)}-${id}.png`
}

function csvEscape(s) {
  const t = String(s).replace(/"/g, '""')
  return `"${t}"`
}

async function exportGraphic(page, baseUrl, id) {
  const url = `${baseUrl}/social-export/${id}/`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('body[data-export-ready="true"]', { timeout: 60000 })
  const payload = await page.evaluate(() => window.__SOCIAL_EXPORT__)
  if (!payload?.dataUrl) throw new Error(`No export data for ${id}`)
  const base64 = payload.dataUrl.replace(/^data:image\/png;base64,/, '')
  return { buffer: Buffer.from(base64, 'base64'), caption: payload.caption }
}

function writeOutputs(ordered, dates, tmpDir) {
  const rows = [
    'index,scheduled_date,scheduled_time,timezone,idea_id,issue,headline,platforms,image_file,caption_file',
  ]

  ordered.forEach((idea, idx) => {
    const index = idx + 1
    const pngName = formatFilename(index, idea.id)
    const txtName = `${pad2(index)}-${idea.id}.txt`
    const date = dates[idx]
    const dateStr = date.toISOString().slice(0, 10)
    const timeStr = '10:00'
    rows.push(
      [
        index,
        dateStr,
        timeStr,
        'America/Toronto',
        idea.id,
        idea.issue,
        csvEscape(idea.headline || ''),
        csvEscape((idea.platforms || []).join('; ')),
        pngName,
        txtName,
      ].join(',')
    )
  })

  writeFileSync(
    join(tmpDir, 'META-SCHEDULE-README.txt'),
    `PROTECTONT SOCIAL SCHEDULE PACK
===============================

${ordered.length} posts · 2 per week (Tue + Thu, 10:00 Toronto) · round-robin by issue

HOW TO USE (Meta Business Suite — free)
1. Go to business.facebook.com → Planner / Content
2. For each row in schedule.csv (in order):
   - Upload the matching PNG (01-….png, 02-….png, …)
   - Paste caption from the matching .txt file
   - Schedule for the date/time in schedule.csv
3. Cross-post to Instagram + Facebook (and Threads if linked)

Regenerate this pack after library changes:
  ./scripts/build-social-schedule-pack.sh

Source library: protectont.ca/admin?section=social-posts
`
  )

  writeFileSync(join(tmpDir, 'schedule.csv'), rows.join('\n') + '\n')
}

async function main() {
  if (!existsSync(join(STATIC_ROOT, 'index.html'))) {
    console.error(`❌ ${STATIC_ROOT} missing — run ./scripts/verify-protectont-before-deploy.sh first`)
    process.exit(1)
  }

  const ideas = loadIdeas()
  const ordered = interleaveByIssue(ideas)
  const dates = buildScheduleDates(ordered.length)
  const tmpDir = mkdtempSync(join(tmpdir(), 'social-schedule-'))

  const port = 8875 + Math.floor(Math.random() * 500)
  const server = await startStaticServer(STATIC_ROOT, port)
  const baseUrl = `http://127.0.0.1:${port}`

  console.log(`Exporting ${ordered.length} graphics from ${baseUrl}`)
  console.log(`Schedule span: ${dates[0].toISOString().slice(0, 10)} → ${dates[dates.length - 1].toISOString().slice(0, 10)} (~${(ordered.length / 2).toFixed(1)} weeks @ 2/wk)\n`)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    for (let idx = 0; idx < ordered.length; idx++) {
      const idea = ordered[idx]
      const index = idx + 1
      const pngName = formatFilename(index, idea.id)
      const txtName = `${pad2(index)}-${idea.id}.txt`
      process.stdout.write(`  ${pngName}… `)
      const { buffer, caption } = await exportGraphic(page, baseUrl, idea.id)
      writeFileSync(join(tmpDir, pngName), buffer)
      writeFileSync(join(tmpDir, txtName), caption + '\n', 'utf8')
      console.log(`✓ (${(buffer.length / 1024).toFixed(0)} KB)`)
    }
    writeOutputs(ordered, dates, tmpDir)
  } finally {
    await browser.close()
    await new Promise((r) => server.close(r))
  }

  for (const outDir of [LEDGER_OUT, STATIC_OUT]) {
    if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true })
    mkdirSync(outDir, { recursive: true })
    for (const name of readdirSync(tmpDir)) {
      cpSync(join(tmpDir, name), join(outDir, name), { recursive: true })
    }
  }

  const zipPath = join(STATIC_OUT, 'social-schedule-pack.zip')
  if (existsSync(zipPath)) rmSync(zipPath)
  execSync(`cd ${JSON.stringify(tmpDir)} && zip -r -q ${JSON.stringify(zipPath)} .`)

  copyFileSync(zipPath, join(LEDGER_OUT, 'social-schedule-pack.zip'))

  rmSync(tmpDir, { recursive: true, force: true })

  const sizeKb = (statSync(zipPath).size / 1024).toFixed(0)
  console.log(`\n✅ social-schedule-pack.zip (${sizeKb} KB)`)
  console.log(`   ${zipPath}`)
  console.log(`   ${join(LEDGER_OUT, 'social-schedule-pack.zip')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
