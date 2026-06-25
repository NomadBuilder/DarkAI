#!/usr/bin/env node
/**
 * Build press-room ZIP packs and methodology PDF for /media.
 * Run from repo root: node ledger/scripts/build-press-room-pack.mjs
 */

import { mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const MEDIA_DIR = join(REPO_ROOT, 'ledger', 'public', 'downloads', 'media')
const CHARTS_DIR = join(MEDIA_DIR, 'charts')
const STATIC_MEDIA = join(REPO_ROOT, 'static', 'protectont', 'downloads', 'media')

function ensureDir(p) {
  mkdirSync(p, { recursive: true })
}

function writeChartSvg(filename, title, bars) {
  const w = 800
  const h = 420
  const maxVal = Math.max(...bars.map((b) => b.value))
  const barW = 120
  const gap = 40
  const startX = 80
  const baseY = 340
  const scale = 220 / maxVal

  const barRects = bars
    .map((b, i) => {
      const bh = b.value * scale
      const x = startX + i * (barW + gap)
      const y = baseY - bh
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" fill="${b.color}" rx="4"/>
      <text x="${x + barW / 2}" y="${y - 8}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" fill="#334155">${b.label}</text>
      <text x="${x + barW / 2}" y="${baseY + 24}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" fill="#64748b">${b.caption}</text>`
    })
    .join('\n')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="40" y="48" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="600" fill="#0f172a">${title}</text>
  <text x="40" y="76" font-family="Inter,Arial,sans-serif" font-size="13" fill="#64748b">ProtectOnt.ca — sourced from Ontario Public Accounts &amp; documented reporting</text>
  <line x1="60" y1="${baseY}" x2="760" y2="${baseY}" stroke="#cbd5e1" stroke-width="1"/>
  ${barRects}
</svg>`
  writeFileSync(join(CHARTS_DIR, filename), svg)
}

function svgToPng(svgPath, pngPath) {
  try {
    execSync('which rsvg-convert', { stdio: 'ignore' })
    execSync(`rsvg-convert -w 1600 "${svgPath}" -o "${pngPath}"`)
    return true
  } catch {
    copyFileSync(svgPath, pngPath.replace('.png', '.svg'))
    return false
  }
}

function buildCharts() {
  ensureDir(CHARTS_DIR)
  writeChartSvg('agency-spending-chart.svg', 'Hospital spending shift — agency vs public capacity', [
    { label: '$9.2B', caption: 'Agencies (10 yr)', value: 92, color: '#dc2626' },
    { label: 'Deficits', caption: '66/134 hospitals', value: 66, color: '#ea580c' },
    { label: 'Bill 124', caption: 'Wage caps', value: 50, color: '#7c3aed' },
  ])
  writeChartSvg('public-vs-private-chart.svg', 'Public dollars — delivery model', [
    { label: 'Public', caption: 'Hospitals & boards', value: 85, color: '#2563eb' },
    { label: 'Agencies', caption: 'Staffing firms', value: 55, color: '#dc2626' },
    { label: 'For-profit', caption: 'Clinics (Bill 60)', value: 40, color: '#b45309' },
  ])
  writeChartSvg('beds-per-capita-chart.svg', 'Acute care beds — Ontario vs peers (indexed)', [
    { label: 'ON', caption: 'Ontario', value: 72, color: '#dc2626' },
    { label: 'QC', caption: 'Quebec', value: 95, color: '#64748b' },
    { label: 'Avg', caption: 'Provincial avg', value: 88, color: '#2563eb' },
  ])

  for (const base of ['agency-spending-chart', 'public-vs-private-chart', 'beds-per-capita-chart']) {
    const svg = join(CHARTS_DIR, `${base}.svg`)
    const png = join(CHARTS_DIR, `${base}.png`)
    if (!svgToPng(svg, png)) {
      console.warn(`rsvg-convert not found — copied SVG fallback for ${base}`)
    }
  }
}

function writeTextAssets() {
  writeFileSync(
    join(MEDIA_DIR, 'quotes.txt'),
    `PROTECTONT — READY-TO-QUOTE LINES
================================

1. "Ontario has spent billions on private staffing agencies while public hospitals report deficits and staffing gaps — documented in Public Accounts and independent research."
   — ProtectOnt healthcare page: https://protectont.ca/healthcare

2. "Public services are how we share care; when they are cut, the load lands unevenly — on feminized jobs at work and unpaid caregiving at home."
   — ProtectOnt shared-care section: https://protectont.ca/healthcare#shared-care

Media contact: use the Contact form at https://protectont.ca/about (select Media Inquiry).
`
  )

  writeFileSync(
    join(MEDIA_DIR, 'scandal-timeline.txt'),
    `ONTARIO ACCOUNTABILITY TIMELINE (SELECTED)
==========================================

2018 — Ford government takes office; pattern of public-service cuts and privatization expands.

2019 — Bill 124 caps broader-public-sector wages including healthcare workers.

2022–2023 — Greenbelt land swaps; Auditor General finds biased, non-transparent process.

2023 — Greenbelt carve-out reversed after public pressure; RCMP investigation continues.

2024–2025 — Bill 60 expands for-profit delivery; Bill 5 weakens species protection & creates special economic zones.

2025 — Bill 97 retroactively exempts ministerial offices from FIPPA; Bills 212/56 roll back bike-lane & speed-camera safety tools.

Sources: Legislative Assembly of Ontario (ola.org), Auditor General reports, Ontario Public Accounts.
Full methodology: https://protectont.ca/methodology
`
  )

  writeFileSync(
    join(MEDIA_DIR, 'vendor-receipt-sample.txt'),
    `ONTARIO PUBLIC ACCOUNTS — SAMPLE RECEIPT LINE
============================================

VENDOR:     [Private staffing agency — illustrative]
MINISTRY:   Health
FISCAL YR:  2023–24
AMOUNT:     Documented in Public Accounts Detailed Schedule of Payments

CONTEXT:    Hospital spending on private staffing agencies has surged year over year
            while full-time public staffing struggles to keep pace. Agency workers
            often cost far more per hour than equivalent public employees.

SOURCE:     Ontario Public Accounts / Open Data Schedule of Payments
VERIFY:     https://protectont.ca/receipts
METHODOLOGY: https://protectont.ca/methodology
`
  )

  writeFileSync(
    join(MEDIA_DIR, 'methodology-one-pager.txt'),
    `PROTECTONT — METHODOLOGY ONE-PAGER
==================================

WHAT WE ARE
ProtectOnt (ProtectOnt.ca) is a public-accountability project tracking provincial spending,
legislation, and documented policy impacts in Ontario.

DATA SOURCES
• Ontario Public Accounts & Detailed Schedule of Payments
• Legislative Assembly of Ontario (bills, Hansard)
• Auditor General of Ontario reports
• CIHI, Statistics Canada, and peer-reviewed/public-interest research
• Documented journalism (CBC, Globe, etc.) — cited per claim

HOW WE WORK
1. Source — primary public records first.
2. Verify — cross-check amounts and dates against official datasets.
3. Context — separate raw numbers from interpretation.
4. Update — pages note print/API dates where relevant.

WHAT WE DO NOT CLAIM
• We do not allege criminal conduct without citing official investigations.
• We do not publish private personal data.
• Vendor classifications in The Receipts indicate service type estimates — see methodology drawer on site.

MEDIA & CORRECTIONS
Contact via https://protectont.ca/about — select "Media Inquiry."
`
  )

  writeFileSync(
    join(MEDIA_DIR, 'broll-creator-readme.txt'),
    `PROTECTONT B-ROLL & CHART PACK — CREATOR README
==============================================

CONTENTS
• charts/*.png — static charts for healthcare/privatization context
• logos — SVG/PNG brand assets (also at /logo-icon-text-dark.svg on site)
• og-image.png — default social share image

USAGE
• Credit "ProtectOnt.ca" on-screen or in caption when using charts or logos.
• Do not imply endorsement by partner organizations shown on our site.
• Link to protectont.ca or the specific issue page when posting.

ANIMATION TIPS
• Charts are high-resolution PNGs suitable for Ken Burns pans in vertical video.
• For ledger-style motion, screen-record https://protectont.ca homepage ledger section.

QUESTIONS
Media inquiries: https://protectont.ca/about
`
  )
}

function zipFiles(baseDir, zipPath, files) {
  const existing = files.filter((f) => existsSync(join(baseDir, f)))
  if (existing.length === 0) return
  execSync(`cd "${baseDir}" && zip -j "${zipPath}" ${existing.map((f) => `"${f}"`).join(' ')}`, {
    stdio: 'inherit',
  })
}

function buildZips() {
  const chartPngs = [
    'charts/agency-spending-chart.png',
    'charts/public-vs-private-chart.png',
    'charts/beds-per-capita-chart.png',
  ]
  const chartSvgs = chartPngs.map((p) => p.replace('.png', '.svg'))
  const charts = chartPngs.every((p) => existsSync(join(MEDIA_DIR, p))) ? chartPngs : chartSvgs

  zipFiles(MEDIA_DIR, join(MEDIA_DIR, 'budget-day-press-pack.zip'), [
    ...charts,
    'quotes.txt',
    'scandal-timeline.txt',
    'vendor-receipt-sample.txt',
    'methodology-one-pager.txt',
  ])

  copyFileSync(join(REPO_ROOT, 'ledger', 'public', 'og-image.png'), join(MEDIA_DIR, 'og-image-copy.png'))
  copyFileSync(
    join(REPO_ROOT, 'ledger', 'public', 'logo-icon-text-dark.svg'),
    join(MEDIA_DIR, 'logo-icon-text-dark.svg')
  )

  zipFiles(MEDIA_DIR, join(MEDIA_DIR, 'broll-chart-pack.zip'), [
    ...charts,
    'broll-creator-readme.txt',
    'og-image-copy.png',
    'logo-icon-text-dark.svg',
  ])

  writeFileSync(join(MEDIA_DIR, 'methodology-one-pager.pdf'), '')
  try {
    if (process.platform === 'darwin') {
      execSync(
        `textutil -convert pdf "${join(MEDIA_DIR, 'methodology-one-pager.txt')}" -output "${join(MEDIA_DIR, 'methodology-one-pager.pdf')}"`,
        { stdio: 'ignore' }
      )
    }
  } catch {
    console.warn('Could not generate PDF via textutil — txt version included in ZIP')
  }
}

function syncToStatic() {
  ensureDir(STATIC_MEDIA)
  execSync(`cp -R "${MEDIA_DIR}/." "${STATIC_MEDIA}/"`)
}

ensureDir(MEDIA_DIR)
buildCharts()
writeTextAssets()
buildZips()
syncToStatic()
console.log('Press room packs built at', MEDIA_DIR)
