#!/usr/bin/env node
/** Render Standing for the Land OG card → indigenous-og-image.png (1200×630). */

import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'indigenous-og-image.png')

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@300;400&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    font-family: Inter, system-ui, sans-serif;
    background: linear-gradient(135deg, #142818 0%, #1a4d3a 45%, #2d6b4f 100%);
    color: #e8f0e4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 80px;
    position: relative;
    overflow: hidden;
  }
  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 60% at 85% 10%, rgba(196, 165, 116, 0.22), transparent);
    pointer-events: none;
  }
  .bar {
    width: 4px; height: 72px;
    background: #c4a574;
    border-radius: 999px;
    margin-bottom: 28px;
  }
  h1 {
    font-family: Fraunces, Georgia, serif;
    font-size: 72px;
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.02em;
    max-width: 900px;
    position: relative;
  }
  h1 span { font-weight: 400; }
  p {
    margin-top: 28px;
    font-size: 28px;
    font-weight: 300;
    line-height: 1.45;
    max-width: 820px;
    opacity: 0.92;
    position: relative;
  }
  .url {
    position: absolute;
    bottom: 48px;
    left: 80px;
    font-size: 22px;
    letter-spacing: 0.04em;
    opacity: 0.7;
  }
</style>
</head>
<body>
  <div class="bar" aria-hidden="true"></div>
  <h1><span>Standing </span>for the Land</h1>
  <p>Indigenous-led land &amp; water defence across Canada — official campaign links.</p>
  <div class="url">protectont.ca/stand4land</div>
</body>
</html>`

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(HTML, { waitUntil: 'networkidle' })
  const buf = await page.screenshot({ type: 'png' })
  writeFileSync(OUT, buf)
  await browser.close()
  console.log('Wrote', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
