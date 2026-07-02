#!/usr/bin/env node
/**
 * Generate per-campaign OG images (1200×630) and printable PDF flyers.
 * Output: ledger/public/hub/og/{slug}.png, ledger/public/downloads/hub-campaigns/{slug}.pdf
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const HUB_JSON = join(ROOT, 'public', 'data', 'indigenous-hub.json')
const OG_DIR = join(ROOT, 'public', 'hub', 'og')
const PDF_DIR = join(ROOT, 'public', 'downloads', 'hub-campaigns')

const PROVINCE_LABELS = {
  BC: 'British Columbia',
  AB: 'Alberta',
  SK: 'Saskatchewan',
  MB: 'Manitoba',
  ON: 'Ontario',
  QC: 'Quebec',
  NB: 'New Brunswick',
  NS: 'Nova Scotia',
  PE: 'Prince Edward Island',
  NL: 'Newfoundland & Labrador',
  YT: 'Yukon',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  National: 'Canada',
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ogHtml(campaign) {
  const region = campaign.provinces.map((p) => PROVINCE_LABELS[p] ?? p).join(' · ')
  const title = escapeHtml(campaign.title)
  const summary = escapeHtml(campaign.summary.slice(0, 140) + (campaign.summary.length > 140 ? '…' : ''))
  const regionText = escapeHtml(region || 'Canada')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@300;400&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    font-family: Inter, system-ui, sans-serif;
    background: linear-gradient(135deg, #142818 0%, #1a4d3a 50%, #2d6b4f 100%);
    color: #e8f0e4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 64px 72px;
    position: relative;
    overflow: hidden;
  }
  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 90% 15%, rgba(196, 165, 116, 0.2), transparent);
    pointer-events: none;
  }
  .eyebrow {
    font-size: 20px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.75;
    margin-bottom: 20px;
    position: relative;
  }
  h1 {
    font-family: Fraunces, Georgia, serif;
    font-size: 56px;
    font-weight: 600;
    line-height: 1.08;
    max-width: 1000px;
    position: relative;
  }
  p {
    margin-top: 24px;
    font-size: 26px;
    font-weight: 300;
    line-height: 1.4;
    max-width: 900px;
    opacity: 0.9;
    position: relative;
  }
  .footer {
    position: absolute;
    bottom: 44px;
    left: 72px;
    right: 72px;
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    opacity: 0.65;
  }
</style>
</head>
<body>
  <p class="eyebrow">${regionText}</p>
  <h1>${title}</h1>
  <p>${summary}</p>
  <div class="footer">
    <span>Standing for the Land</span>
    <span>protectont.ca/stand4land</span>
  </div>
</body>
</html>`
}

function flyerHtml(campaign) {
  const region = campaign.provinces.map((p) => PROVINCE_LABELS[p] ?? p).join(', ')
  const nations = escapeHtml(campaign.nations.join(' · '))
  const title = escapeHtml(campaign.title)
  const summary = escapeHtml(campaign.summary)
  const why = escapeHtml(campaign.whyItMatters.slice(0, 420) + (campaign.whyItMatters.length > 420 ? '…' : ''))
  const official = campaign.officialSite?.href ?? ''
  const donate = campaign.donate?.[0]?.href ?? official
  const directory = `https://protectont.ca/stand4land/campaigns/${campaign.slug}/`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 8.5in;
    min-height: 11in;
    font-family: Inter, system-ui, sans-serif;
    color: #142818;
    padding: 0.65in 0.7in;
    background: #faf8f4;
  }
  .bar { width: 48px; height: 4px; background: #1a4d3a; border-radius: 999px; margin-bottom: 20px; }
  .eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #5a7a66; margin-bottom: 8px; }
  h1 { font-family: Fraunces, Georgia, serif; font-size: 32px; line-height: 1.12; color: #142818; max-width: 6.5in; }
  .nations { margin-top: 8px; font-size: 13px; color: #1a4d3a; font-weight: 500; }
  .summary { margin-top: 18px; font-size: 14px; line-height: 1.55; color: #3d5c48; max-width: 6.5in; }
  .why { margin-top: 22px; padding: 18px 20px; background: #e8f0e4; border-left: 4px solid #c4a574; border-radius: 0 8px 8px 0; }
  .why h2 { font-family: Fraunces, Georgia, serif; font-size: 16px; margin-bottom: 8px; color: #1a4d3a; }
  .why p { font-size: 13px; line-height: 1.55; color: #3d5c48; }
  .actions { margin-top: 28px; }
  .actions h2 { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #5a7a66; margin-bottom: 12px; }
  .link-box {
    display: block;
    padding: 14px 16px;
    margin-bottom: 10px;
    border: 1px solid #1a4d3a33;
    border-radius: 10px;
    background: white;
    font-size: 13px;
    line-height: 1.45;
    word-break: break-all;
  }
  .link-box strong { display: block; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #1a4d3a; margin-bottom: 4px; }
  .footer {
    margin-top: 36px;
    padding-top: 16px;
    border-top: 1px solid #1a4d3a22;
    font-size: 10px;
    line-height: 1.5;
    color: #5a7a66;
  }
  .footer strong { color: #1a4d3a; }
</style>
</head>
<body>
  <div class="bar"></div>
  <p class="eyebrow">${escapeHtml(region)} · Nation-led campaign</p>
  <h1>${title}</h1>
  <p class="nations">${nations}</p>
  <p class="summary">${summary}</p>
  <div class="why">
    <h2>Why it matters</h2>
    <p>${why}</p>
  </div>
  <div class="actions">
    <h2>Official channels — use these links only</h2>
    ${official ? `<div class="link-box"><strong>Official campaign site</strong>${escapeHtml(official)}</div>` : ''}
    ${donate && donate !== official ? `<div class="link-box"><strong>Donate (official)</strong>${escapeHtml(donate)}</div>` : ''}
    <div class="link-box"><strong>Verified links directory</strong>${escapeHtml(directory)}</div>
  </div>
  <div class="footer">
    <strong>Standing for the Land</strong> — Protect Ontario curates links to official Nation-led campaigns.
    We do not speak for Nations or collect donations. Always verify links on the official campaign website.
    <br />protectont.ca/stand4land · Data verified ${escapeHtml(campaign.lastVerified ?? '')}
  </div>
</body>
</html>`
}

async function main() {
  const hub = JSON.parse(readFileSync(HUB_JSON, 'utf8'))
  const campaigns = hub.campaigns ?? []
  if (!campaigns.length) {
    console.error('No campaigns in', HUB_JSON)
    process.exit(1)
  }

  mkdirSync(OG_DIR, { recursive: true })
  mkdirSync(PDF_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  for (const campaign of campaigns) {
    const ogPath = join(OG_DIR, `${campaign.slug}.png`)
    const pdfPath = join(PDF_DIR, `${campaign.slug}.pdf`)

    const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } })
    await ogPage.setContent(ogHtml(campaign), { waitUntil: 'networkidle' })
    writeFileSync(ogPath, await ogPage.screenshot({ type: 'png' }))
    await ogPage.close()
    console.log('OG', campaign.slug)

    const pdfPage = await browser.newPage()
    await pdfPage.setContent(flyerHtml(campaign), { waitUntil: 'networkidle' })
    await pdfPage.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    await pdfPage.close()
    console.log('PDF', campaign.slug)
  }

  await browser.close()
  console.log(`✅ ${campaigns.length} campaign OG images + PDF flyers`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
