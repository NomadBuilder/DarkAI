#!/usr/bin/env node
/** Render logo-shield.svg → favicon.png + shield-icon.png for browsers and OG image script. */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')
const SVG = readFileSync(join(PUBLIC, 'logo-shield.svg'), 'utf8')

const OUTPUTS = [
  { size: 32, file: 'favicon.png' },
  { size: 192, file: 'favicon-192.png' },
  { size: 512, file: 'shield-icon.png' },
]

async function renderShield(size, outPath) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const html = `<!DOCTYPE html><html><body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px">${SVG.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`
  await page.setContent(html, { waitUntil: 'load' })
  const png = await page.locator('svg').screenshot({ type: 'png', omitBackground: true })
  writeFileSync(outPath, png)
  await browser.close()
}

async function main() {
  for (const { size, file } of OUTPUTS) {
    const outPath = join(PUBLIC, file)
    process.stdout.write(`  ${file} (${size}px)… `)
    await renderShield(size, outPath)
    console.log('✓')
  }
  console.log('\n✅ Shield PNGs generated from logo-shield.svg')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
