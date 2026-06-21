#!/usr/bin/env node
/** Build June 27, 2026 Fight Ford events from province-wide flyer (Sides A–D, updated June 19, 2026). */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const protestsPath = path.join(__dirname, '../ledger/public/data/protests.json')

const SOURCE_LINK = 'https://protestdougford.com/june-27th-protest-locations/'
const ORGANIZER = 'Fight Ford Province-Wide Protests'

/** @type {{ slug: string, city: string, time?: string, date?: string, address?: string, venue: string }[]} */
const RAW = [
  // Side A — column 1
  { slug: 'ancaster', city: 'Ancaster', time: '1:00 PM', address: '977 Golf Links Rd', venue: 'Sobeys' },
  { slug: 'angus', city: 'Angus', time: '1:00 PM', address: '12 Commerce Rd', venue: 'Peacekeepers Park' },
  {
    slug: 'barrie',
    city: 'Barrie',
    time: '1:00 PM',
    address: '70 Collier St',
    venue: "Farmers' Market | City Hall",
  },
  {
    slug: 'belleville',
    city: 'Belleville',
    time: '10:00 AM',
    address: 'Bell Blvd & Front St N',
    venue: 'Bell Front Shopping Centre',
  },
  {
    slug: 'bowmanville',
    city: 'Bowmanville',
    time: '2:00 PM',
    address: '23 King St W',
    venue: "MPP Todd McCarthy's Office",
  },
  {
    slug: 'bracebridge',
    city: 'Bracebridge',
    time: '12:00 PM',
    address: '230 Manitoba St',
    venue: "MPP Graydon Smith's Office",
  },
  {
    slug: 'bradford',
    city: 'Bradford',
    time: '12:00 PM',
    address: '425 Holland St W',
    venue: 'Bradford West Gwillimbury Public Library',
  },
  {
    slug: 'brampton',
    city: 'Brampton',
    time: '9:00 AM',
    address: 'Main St S & Wellington St W',
    venue: 'City Hall',
  },
  // Side A — column 2
  {
    slug: 'brantford',
    city: 'Brantford',
    time: '12:00 PM',
    address: '96 Nelson St',
    venue: "MPP Will Bouma's Office",
  },
  {
    slug: 'blyth',
    city: 'Blyth',
    time: '1:00 PM',
    address: '408 Queen St',
    venue: "MPP Lisa Thompson's Office",
  },
  {
    slug: 'burlington',
    city: 'Burlington',
    time: '1:00 PM',
    address: '3027 Harvester Rd',
    venue: "MPP Natalie Pierre's Office",
  },
  {
    slug: 'cambridge',
    city: 'Cambridge',
    time: '11:00 AM',
    address: '73 Water St',
    venue: "MPP Brian Riddell's Office",
  },
  {
    slug: 'chatham',
    city: 'Chatham',
    time: '1:00 PM',
    address: '111 Heritage Rd',
    venue: "MPP Trevor Jones' Office",
  },
  {
    slug: 'cornwall',
    city: 'Cornwall',
    time: '1:00 PM',
    address: '120 2nd St W',
    venue: "MPP Nolan Quinn's Office",
  },
  {
    slug: 'elmira',
    city: 'Elmira',
    time: '2:00 PM',
    address: '63 Arthur St S',
    venue: "MPP Mike Harris's Office",
  },
  {
    slug: 'etobicoke-weston',
    city: 'Etobicoke',
    time: '12:30 PM',
    address: 'Weston Wood Rd & Royal York Rd',
    venue: "End of Doug Ford's Street",
  },
  // Side B — column 1
  {
    slug: 'etobicoke-albion',
    city: 'Etobicoke',
    time: '2:00 PM',
    address: '964 Albion Rd',
    venue: "Doug Ford's Office",
  },
  {
    slug: 'guelph',
    city: 'Guelph',
    time: '12:00 PM',
    address: 'Gordon St & Wellington St E',
    venue: 'Wellington Plaza',
  },
  {
    slug: 'hamilton',
    city: 'Hamilton',
    time: '2:00 PM',
    address: 'Upper Wentworth St & Kingfisher Dr',
    venue: 'Lime Ridge Mall',
  },
  {
    slug: 'kanata',
    city: 'Kanata',
    time: '1:00 PM',
    address: 'Eagleson Rd & ON-417',
    venue: 'Eagleson Park & Ride',
  },
  {
    slug: 'kincardine',
    city: 'Kincardine',
    time: '12:30 PM',
    address: '807 Queen St',
    venue: "MPP Lisa Thompson's Office",
  },
  {
    slug: 'kingston',
    city: 'Kingston',
    time: '12:00 PM',
    address: '225 Ontario St',
    venue: 'Confederation Park',
  },
  {
    slug: 'lindsay',
    city: 'Lindsay',
    time: '11:00 AM',
    address: 'St. Joseph Rd & Kent St W',
    venue: 'Lindsay Square Mall',
  },
  {
    slug: 'listowel',
    city: 'Listowel',
    time: '12:00 PM',
    address: 'Main St E & Wallace Ave S',
    venue: 'Wallace Avenue North/South',
  },
  // Side B — column 2
  {
    slug: 'london',
    city: 'London',
    time: '1:00 PM',
    address: 'Central Ave',
    venue: 'Victoria Park northwest corner',
  },
  {
    slug: 'markham-thornhill',
    city: 'Markham-Thornhill',
    time: '12:30 PM',
    address: '7380 McCowan Rd',
    venue: "MPP Logan Kanapathi's Office",
  },
  { slug: 'meaford', city: 'Meaford', time: '12:00 PM', address: 'Sykes St', venue: 'Meaford Hall' },
  {
    slug: 'milton',
    city: 'Milton',
    time: '2:00 PM',
    address: 'Main St & Ontario St',
    venue: 'Ontario Street North/South',
  },
  {
    slug: 'mississauga',
    city: 'Mississauga',
    time: '2:00 PM',
    address: '1077 N Service Rd',
    venue: 'Applewood Village Plaza',
  },
  {
    slug: 'newmarket',
    city: 'Newmarket',
    time: '1:00 PM',
    address: 'Yonge St & Sawmill Valley Dr',
    venue: "MPP Dawn Gallagher Murphy's Office",
  },
  {
    slug: 'new-liskeard',
    city: 'New Liskeard',
    time: '10:00 AM',
    address: '83 Whitewood Ave',
    venue: 'Canada Post',
  },
  {
    slug: 'north-bay',
    city: 'North Bay',
    time: '1:00 PM',
    address: '219 Main St E',
    venue: "MPP Vic Fedeli's Office",
  },
  // Side C — column 1
  {
    slug: 'oakville',
    city: 'Oakville',
    time: '11:00 AM',
    address: '2525 Old Bronte Rd',
    venue: "MPP Effie Triantafilopoulos' Office",
  },
  {
    slug: 'orangeville',
    city: 'Orangeville',
    time: '12:00 PM',
    address: '180 Broadway Ave',
    venue: "MPP Sylvia Jones' Office",
  },
  {
    slug: 'orillia',
    city: 'Orillia',
    time: '12:00 PM',
    address: 'West St S & Mississaga St W',
    venue: 'West Street North/South',
  },
  {
    slug: 'ottawa',
    city: 'Ottawa',
    time: '1:00 PM',
    address: '220 Elgin St',
    venue: 'Canadian Tribute to Human Rights Monument',
  },
  {
    slug: 'owen-sound',
    city: 'Owen Sound',
    time: '9:00 AM',
    address: '345 8th St E',
    venue: "MPP Paul Vickers' Office",
  },
  {
    slug: 'pembroke',
    city: 'Pembroke',
    time: '1:00 PM',
    address: '400 Pembroke St E',
    venue: 'Service Ontario',
  },
  {
    slug: 'peterborough',
    city: 'Peterborough',
    time: '1:00 PM',
    address: '864 Chemong Rd',
    venue: "MPP Dave Smith's Office",
  },
  {
    slug: 'pickering',
    city: 'Pickering',
    time: '11:00 AM',
    address: '1550 Kingston Rd',
    venue: "MPP Peter Bethlenfalvy's Office",
  },
  // Side C — column 2
  {
    slug: 'port-hope',
    city: 'Port Hope',
    time: '1:00 PM',
    address: '117 Peter St',
    venue: "MPP David Piccini's Office",
  },
  {
    slug: 'sarnia',
    city: 'Sarnia',
    time: '1:00 PM',
    address: '800 Christina St N',
    venue: "MPP Bob Bailey's Office",
  },
  {
    slug: 'sault-ste-marie',
    city: 'Sault Ste. Marie',
    time: '11:00 AM',
    address: '153 Great Northern Rd',
    venue: "MPP Chris Scott's Office",
  },
  { slug: 'simcoe', city: 'Simcoe', time: '12:00 PM', address: '50 Bonnie Dr', venue: 'Wellington Park' },
  {
    slug: 'st-catharines',
    city: 'St. Catharines',
    time: '11:00 AM',
    address: 'Tremont Dr & Glendale Ave',
    venue: 'Pen Centre',
  },
  {
    slug: 'st-thomas',
    city: 'St. Thomas',
    time: '2:00 PM',
    address: '750 Talbot St',
    venue: "MPP Robert Flack's Office",
  },
  {
    slug: 'stayner',
    city: 'Stayner',
    time: '2:00 PM',
    address: '7317 Highway 26 E',
    venue: "MPP Brian Saunderson's Office",
  },
  {
    slug: 'stouffville',
    city: 'Stouffville',
    time: '12:00 PM',
    address: '37 Sandiford Dr',
    venue: "MPP Paul Calandra's Office",
  },
  // Side D — column 1
  {
    slug: 'stratford',
    city: 'Stratford',
    time: '10:00 AM',
    address: '55 Lorne Ave E',
    venue: "MPP Matthew Rae's Office",
  },
  { slug: 'sudbury', city: 'Sudbury', time: '12:00 PM', address: '200 Brady St', venue: 'City Hall' },
  {
    slug: 'thunder-bay',
    city: 'Thunder Bay',
    time: '11:00 AM',
    address: '774 James St N',
    venue: "MPP Kevin Holland's Office",
  },
  {
    slug: 'toronto-queens-park',
    city: 'Toronto',
    date: 'Jun 29, 2026 · 7:00 PM',
    address: '111 Wellesley St W',
    venue: "Queen's Park (Monday, June 29)",
  },
  {
    slug: 'wallaceburg',
    city: 'Wallaceburg',
    time: '12:00 PM',
    address: '60 McNaughton Ave',
    venue: "MPP Steve Pinsonneault's Office",
  },
  // Side D — column 2
  {
    slug: 'waterdown',
    city: 'Waterdown',
    time: '1:00 PM',
    address: 'Hamilton St & Dundas St E',
    venue: 'Hamilton Street North/South',
  },
  {
    slug: 'waterloo',
    city: 'Waterloo',
    time: '12:00 PM',
    address: '136 King St S',
    venue: 'William Street West/South',
  },
  {
    slug: 'whitby',
    city: 'Whitby',
    time: '12:00 PM',
    address: '3000 Garden St',
    venue: "MPP Lorne Coe's Office",
  },
  {
    slug: 'windsor',
    city: 'Windsor',
    time: '1:00 PM',
    address: '5452 Tecumseh Rd E',
    venue: "MPP Andrew Dowie's Office",
  },
  {
    slug: 'woodstock',
    city: 'Woodstock',
    time: '1:00 PM',
    address: '12 Perry St',
    venue: "MPP Ernie Hardeman's Office",
  },
]

function buildDescription({ address, venue }) {
  if (venue.toLowerCase().includes('mpp') || venue.toLowerCase().includes("doug ford")) {
    return `${venue}, ${address}.`
  }
  if (address.includes('&') || !address.match(/^\d/)) {
    return `${venue}, ${address}.`
  }
  return `${venue}, ${address}.`
}

function toEvent(row) {
  const location = `${row.city}, ON`
  const description = buildDescription(row)
  const date = row.date ?? (row.time ? `Jun 27, 2026 · ${row.time}` : 'Jun 27, 2026')
  const title = row.date?.startsWith('Jun 29') ? 'Fight Ford Protests (June 29)' : 'Fight Ford Protests (June 27)'

  const event = {
    id: `fight-ford-2026-06-27-${row.slug}`,
    title,
    date,
    location,
    description,
    link: SOURCE_LINK,
    organizer: ORGANIZER,
    status: 'confirmed',
    topics: ['accountability'],
    campaignId: 'june-27-2026',
    featured: true,
  }

  if (row.address?.trim()) {
    event.address = row.address.trim()
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
console.log(`Built ${june27Events.length} June 27 campaign events; total ${file.events.length}`)
