#!/usr/bin/env node
/**
 * One-time / repeatable migration: bare array → wrapped protests.json with enriched fields.
 * Usage: node scripts/migrate-protests-json.mjs [path-to-protests.json]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultPath = path.join(__dirname, '../ledger/public/data/protests.json')
const filePath = process.argv[2] || defaultPath

const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
const events = Array.isArray(raw) ? raw : raw.events ?? []

function inferTopics(event) {
  const id = event.id || ''
  const title = (event.title || '').toLowerCase()
  const desc = (event.description || '').toLowerCase()
  const topics = new Set()

  if (id.startsWith('cupe') || title.includes('health care') || title.includes('healthcare')) {
    topics.add('healthcare')
  }
  if (id.includes('fight-ford') || id.includes('may-30') || title.includes('may 30')) {
    topics.add('accountability')
  }
  if (id.includes('fighting-ford')) {
    topics.add('accountability')
  }
  if (desc.includes('greenbelt') || desc.includes('ontario place')) topics.add('land')
  if (desc.includes('bill 5') || desc.includes('species')) topics.add('wildlife')

  if (topics.size === 0) topics.add('accountability')
  return [...topics]
}

function inferOrganizer(event) {
  const link = event.link || ''
  if (link.includes('CUPEOntario') || link.includes('cupe')) return 'CUPE Ontario'
  return undefined
}

function inferCampaignId(event) {
  const id = event.id || ''
  if (id.startsWith('cupe-')) return 'cupe-healthcare-2026'
  if (id.startsWith('fight-ford-2026-05-30')) return 'may-30-2026'
  if (id.startsWith('fighting-ford')) return 'fighting-ford-feb-2026'
  return undefined
}

function inferAddress(event) {
  const desc = event.description || ''
  const m = desc.match(/(?:^|[\.\s])([\d]+\s+[^\.]+(?:St|Dr|Rd|Ave|Blvd|Park|Arena|Centre|Center)[^\.]*)/i)
  if (m) return m[1].trim()
  return undefined
}

const migrated = events.map((e) => {
  const campaignId = e.campaignId ?? inferCampaignId(e)
  const out = {
    ...e,
    status: e.status ?? 'confirmed',
    topics: e.topics?.length ? e.topics : inferTopics(e),
    organizer: e.organizer ?? inferOrganizer(e),
    campaignId,
  }
  if (!out.address) {
    const addr = inferAddress(e)
    if (addr) out.address = addr
  }
  if (campaignId === 'may-30-2026' && !out.featured) {
    out.featured = false
  }
  return out
})

const wrapped = {
  lastUpdated: new Date().toISOString().slice(0, 10),
  featuredCampaign: {
    enabled: true,
    label: 'Province-wide protests on May 30, 2026 — find your city and join in',
    href: '#event-list',
  },
  events: migrated,
}

fs.writeFileSync(filePath, JSON.stringify(wrapped, null, 2) + '\n')
console.log(`Migrated ${migrated.length} events → ${filePath}`)
