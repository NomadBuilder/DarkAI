#!/usr/bin/env node
/** Build June 27, 2026 Fight Ford events from province-wide flyer. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const protestsPath = path.join(__dirname, '../ledger/public/data/protests.json')

/** @type {{ slug: string, city: string, time?: string, address?: string, venue: string }[]} */
const RAW = [
  { slug: 'angus', city: 'Angus', time: '1:00 PM', address: '12 Commerce Rd', venue: 'Peacekeepers Park' },
  { slug: 'barrie', city: 'Barrie', time: '1:00 PM', address: '555 Bayview Dr', venue: 'Sadlon Arena' },
  {
    slug: 'bowmanville',
    city: 'Bowmanville',
    time: '2:00 PM',
    address: '23 King St W',
    venue: "MPP Todd McCarthy's office",
  },
  {
    slug: 'brantford',
    city: 'Brantford',
    time: '12:00 PM',
    address: '96 Nelson St',
    venue: "MPP Will Bouma's office",
  },
  {
    slug: 'cornwall',
    city: 'Cornwall',
    time: '1:00 PM',
    address: '120 2nd St W',
    venue: "MPP Nolan Quinn's office",
  },
  {
    slug: 'guelph',
    city: 'Guelph',
    time: '12:00 PM',
    address: 'Gordon St & Wellington St E',
    venue: 'Wellington Plaza',
  },
  {
    slug: 'london',
    city: 'London',
    time: '1:00 PM',
    address: 'Central Ave',
    venue: 'Victoria Park northwest corner',
  },
  {
    slug: 'new-liskeard',
    city: 'New Liskeard',
    time: '10:00 AM',
    address: '83 Whitewood Ave',
    venue: 'Canada Post',
  },
  {
    slug: 'simcoe',
    city: 'Simcoe',
    time: '12:00 PM',
    address: '50 Bonnie Dr',
    venue: 'Wellington Park',
  },
  {
    slug: 'st-catharines',
    city: 'St. Catharines',
    time: '11:00 AM',
    address: 'Tremont Dr & Glendale Ave',
    venue: 'Pen Centre',
  },
  {
    slug: 'stayner',
    city: 'Stayner',
    time: '2:00 PM',
    address: '7317 Highway 26 E',
    venue: "MPP Brian Saunderson's office",
  },
  {
    slug: 'stratford',
    city: 'Stratford',
    time: '10:00 AM',
    address: '55 Lorne Ave E',
    venue: "MPP Matthew Rae's office",
  },
  {
    slug: 'wallaceburg',
    city: 'Wallaceburg',
    venue: "MPP Steve Pinsonneault's office",
    address: '60 McNaughton Ave',
  },
  {
    slug: 'woodstock',
    city: 'Woodstock',
    time: '1:00 PM',
    address: '12 Perry St',
    venue: "MPP Ernie Hardeman's office",
  },
]

function buildDescription({ address, venue }) {
  if (venue.toLowerCase().includes('mpp')) {
    return `${address}. Target: ${venue}.`
  }
  if (address.includes('&') || !address.match(/^\d/)) {
    return `${venue}, ${address}.`
  }
  return `${venue}, ${address}.`
}

function toEvent(row) {
  const location = `${row.city}, ON`
  const description = buildDescription(row)
  const date = row.time ? `Jun 27, 2026 · ${row.time}` : 'Jun 27, 2026'
  const event = {
    id: `fight-ford-2026-06-27-${row.slug}`,
    title: 'Fight Ford Protests (June 27)',
    date,
    location,
    description,
    status: 'confirmed',
    topics: ['accountability'],
    campaignId: 'june-27-2026',
    featured: true,
  }
  if (row.address && row.address.match(/^\d/)) {
    event.address = row.address
  }
  return event
}

const june27Events = RAW.map(toEvent)
const file = JSON.parse(fs.readFileSync(protestsPath, 'utf8'))
const kept = file.events.filter((e) => e.campaignId !== 'june-27-2026')
file.events = [...kept, ...june27Events]
file.lastUpdated = new Date().toISOString().slice(0, 10)
file.featuredCampaign = {
  enabled: true,
  label: 'Province-wide protest Saturday June 27, 2026 — find your city and join in',
  href: '#event-list',
  campaignId: 'june-27-2026',
}

fs.writeFileSync(protestsPath, JSON.stringify(file, null, 2) + '\n')
console.log(`Built ${june27Events.length} June 27 events; total ${file.events.length}`)
