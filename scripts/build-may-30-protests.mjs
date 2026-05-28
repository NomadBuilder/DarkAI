#!/usr/bin/env node
/** Build May 30, 2026 Fight Ford events from province-wide list (Sides A–C). */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const protestsPath = path.join(__dirname, '../ledger/public/data/protests.json')

/** @type {{ slug: string, city: string, time: string, address?: string, venue: string }[]} */
const RAW = [
  // Side A
  { slug: 'angus', city: 'Angus', time: '1:00 PM', address: '12 Commerce Rd', venue: 'Peacekeepers Park' },
  { slug: 'barrie', city: 'Barrie', time: '1:00 PM', address: '555 Bayview Dr', venue: 'Sadlon Arena' },
  {
    slug: 'belleville',
    city: 'Belleville',
    time: '1:00 PM',
    address: 'Bell Blvd & Front St N',
    venue: 'Bell Front Shopping Centre',
  },
  {
    slug: 'blyth',
    city: 'Blyth',
    time: '1:00 PM',
    address: '408 Queen St',
    venue: "MPP Lisa Thompson's office",
  },
  {
    slug: 'bowmanville',
    city: 'Bowmanville',
    time: '2:00 PM',
    address: '23 King St W',
    venue: "MPP Todd McCarthy's office",
  },
  {
    slug: 'bracebridge',
    city: 'Bracebridge',
    time: '12:00 PM',
    address: '230 Manitoba St',
    venue: "MPP Graydon Smith's office",
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
    time: '1:00 PM',
    address: 'Main St S & Wellington St E',
    venue: 'City Hall',
  },
  {
    slug: 'brantford',
    city: 'Brantford',
    time: '12:00 PM',
    address: '96 Nelson St',
    venue: "MPP Will Bouma's office",
  },
  {
    slug: 'brockville',
    city: 'Brockville',
    time: '11:00 AM',
    address: '77 Blockhouse Island Pkwy',
    venue: 'South End Brockville Railway Tunnel',
  },
  {
    slug: 'burlington',
    city: 'Burlington',
    time: '1:00 PM',
    address: '3027 Harvester Rd',
    venue: "MPP Natalie Pierre's office",
  },
  {
    slug: 'cambridge',
    city: 'Cambridge',
    time: '11:00 AM',
    address: '73 Water St',
    venue: "MPP Brian Riddell's office",
  },
  {
    slug: 'cornwall',
    city: 'Cornwall',
    time: '1:00 PM',
    address: '120 2nd St W',
    venue: "MPP Nolan Quinn's office",
  },
  {
    slug: 'elliot-lake',
    city: 'Elliot Lake',
    time: '12:00 PM',
    address: "325 King's Hwy 108",
    venue: "Miner's Memorial Park",
  },
  {
    slug: 'elmira',
    city: 'Elmira',
    time: '2:00 PM',
    address: '63 Arthur St S',
    venue: "MPP Mike Harris's office",
  },
  {
    slug: 'etobicoke-weston',
    city: 'Etobicoke',
    time: '12:30 PM',
    address: 'Weston Wood Rd & Royal York Rd',
    venue: "End of Doug Ford's street",
  },
  {
    slug: 'etobicoke-office',
    city: 'Etobicoke',
    time: '2:00 PM',
    address: '964 Albion Rd',
    venue: "Doug Ford's office",
  },
  {
    slug: 'fergus',
    city: 'Fergus',
    time: '10:00 AM',
    address: '181 St. Andrew St E',
    venue: "MPP Joseph Racinsky's office",
  },
  {
    slug: 'georgetown',
    city: 'Georgetown',
    time: '1:00 PM',
    address: 'Mountainview Rd N & Guelph St',
    venue: 'Mountainview Road North/South',
  },
  {
    slug: 'guelph',
    city: 'Guelph',
    time: '12:00 PM',
    address: 'Gordon St & Wellington St E',
    venue: 'Wellington Plaza',
  },
  // Side B
  {
    slug: 'hamilton',
    city: 'Hamilton',
    time: '2:00 PM',
    address: 'York Blvd & Dundurn St N',
    venue: 'Dundurn Park',
  },
  {
    slug: 'kincardine',
    city: 'Kincardine',
    time: '12:30 PM',
    address: '807 Queen St',
    venue: "MPP Lisa Thompson's office",
  },
  {
    slug: 'king-city',
    city: 'King City',
    time: '11:00 AM',
    address: '2220 King Rd',
    venue: "MPP Stephen Lecce's office",
  },
  {
    slug: 'kingston',
    city: 'Kingston',
    time: '12:00 PM',
    address: 'Princess St & Gardiners Rd',
    venue: 'The North-West "Big Box" hub',
  },
  {
    slug: 'lindsay',
    city: 'Lindsay',
    time: '12:00 PM',
    address: 'St. Joseph & Kent St W',
    venue: 'Lindsay Square Mall',
  },
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
    venue: "MPP Logan Kanapathi's office",
  },
  { slug: 'meaford', city: 'Meaford', time: '12:00 PM', address: 'Sykes St', venue: 'Meaford Hall' },
  {
    slug: 'milton',
    city: 'Milton',
    time: '11:30 AM',
    address: 'Main St & Martin St',
    venue: 'Downtown Centre',
  },
  {
    slug: 'mississauga',
    city: 'Mississauga',
    time: '1:00 PM',
    address: '120 Lakeshore Rd W',
    venue: "MPP Rudy Cuzzetto's office",
  },
  {
    slug: 'newmarket',
    city: 'Newmarket',
    time: '1:00 PM',
    address: 'Yonge St & Sawmill Valley Dr',
    venue: "MPP Dawn Gallagher Murphy's office",
  },
  {
    slug: 'north-bay',
    city: 'North Bay',
    time: '1:00 PM',
    address: '219 Main St E',
    venue: "MPP Vic Fedeli's office",
  },
  {
    slug: 'oakville-crawford',
    city: 'Oakville',
    time: '12:00 PM',
    address: '74 Rebecca St',
    venue: "MPP Stephen Crawford's office",
  },
  {
    slug: 'oakville-triantafilopoulos',
    city: 'Oakville',
    time: '1:30 PM',
    address: '2525 Old Bronte Rd',
    venue: "MPP Effie Triantafilopoulos' office",
  },
  {
    slug: 'orangeville',
    city: 'Orangeville',
    time: '12:00 PM',
    address: '180 Broadway Ave',
    venue: "MPP Sylvia Jones' office",
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
    venue: "MPP Paul Vickers' office",
  },
  {
    slug: 'pembroke',
    city: 'Pembroke',
    time: '1:00 PM',
    address: '400 Pembroke St E',
    venue: 'Service Ontario Plaza',
  },
  {
    slug: 'peterborough',
    city: 'Peterborough',
    time: '1:00 PM',
    address: '864 Chemong Rd',
    venue: "MPP Dave Smith's office",
  },
  {
    slug: 'pickering',
    city: 'Pickering',
    time: '11:00 AM',
    address: '1550 Kingston Rd',
    venue: "MPP Peter Bethlenfalvy's office",
  },
  // Side C
  {
    slug: 'port-hope',
    city: 'Port Hope',
    time: '1:00 PM',
    address: '117 Peter St',
    venue: "MPP David Piccini's office",
  },
  {
    slug: 'richmond-hill',
    city: 'Richmond Hill',
    time: '3:00 PM',
    address: '9555 Yonge St',
    venue: "MPP Daisy Wai's office",
  },
  {
    slug: 'sarnia',
    city: 'Sarnia',
    time: '1:00 PM',
    address: '805 Christina St N',
    venue: "MPP Bob Bailey's office",
  },
  {
    slug: 'sault-ste-marie',
    city: 'Sault Ste. Marie',
    time: '11:00 AM',
    address: '153 Great Northern Rd',
    venue: "MPP Chris Scott's office",
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
    slug: 'st-thomas',
    city: 'St. Thomas',
    time: '2:00 PM',
    address: '750 Talbot St',
    venue: "MPP Robert Flack's office",
  },
  {
    slug: 'stayner',
    city: 'Stayner',
    time: '2:00 PM',
    address: '7317 Highway 26 E',
    venue: "MPP Brian Saunderson's office",
  },
  {
    slug: 'stouffville',
    city: 'Stouffville',
    time: '12:00 PM',
    address: '37 Sandiford Dr',
    venue: "MPP Paul Calandra's office",
  },
  {
    slug: 'stratford',
    city: 'Stratford',
    time: '10:00 AM',
    address: '55 Lorne Ave E',
    venue: "MPP Matthew Rae's office",
  },
  {
    slug: 'strathroy',
    city: 'Strathroy',
    time: '1:00 PM',
    address: '81 Front St W',
    venue: "MPP Steve Pinsonneault's office",
  },
  {
    slug: 'sudbury',
    city: 'Sudbury',
    time: '12:00 PM',
    address: 'Paris St & Brady St',
    venue: 'Tom Davies Square',
  },
  {
    slug: 'temiskaming-shores',
    city: 'Temiskaming Shores',
    time: '1:00 PM',
    address: '83 Whitewood Ave',
    venue: 'Canada Post',
  },
  {
    slug: 'thunder-bay',
    city: 'Thunder Bay',
    time: '11:00 AM',
    address: '774 James St N',
    venue: "MPP Kevin Holland's office",
  },
  {
    slug: 'toronto',
    city: 'Toronto',
    time: '11:00 AM',
    address: '111 Wellesley St W',
    venue: "Queen's Park",
  },
  {
    slug: 'vaughan',
    city: 'Vaughan',
    time: '11:00 AM',
    address: 'Islington Ave & Rutherford Rd',
    venue: "MPP Michael Tibollo's office",
  },
  {
    slug: 'wallaceburg',
    city: 'Wallaceburg',
    time: '11:00 AM',
    address: '60 McNaughton Ave',
    venue: "MPP Steve Pinsonneault's office",
  },
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
    address: '100 Regina St S',
    venue: 'City Hall',
  },
  {
    slug: 'whitby',
    city: 'Whitby',
    time: '12:00 PM',
    address: '3000 Garden St',
    venue: "MPP Lorne Coe's office",
  },
  {
    slug: 'windsor',
    city: 'Windsor',
    time: '1:00 PM',
    address: '5452 Tecumseh Rd E',
    venue: "MPP Andrew Dowie's office",
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
  const event = {
    id: `fight-ford-2026-05-30-${row.slug}`,
    title: 'Fight Ford Protests (May 30)',
    date: `May 30, 2026 · ${row.time}`,
    location,
    description,
    status: 'confirmed',
    topics: ['accountability'],
    campaignId: 'may-30-2026',
    featured: false,
  }
  if (row.address && row.address.match(/^\d/)) {
    event.address = row.address
  }
  return event
}

const may30Events = RAW.map(toEvent)
console.log(`Built ${may30Events.length} May 30 events`)

const file = JSON.parse(fs.readFileSync(protestsPath, 'utf8'))
const kept = file.events.filter((e) => e.campaignId !== 'may-30-2026')
file.events = [...kept, ...may30Events]
file.lastUpdated = new Date().toISOString().slice(0, 10)
file.featuredCampaign = {
  enabled: true,
  label: 'Province-wide protests (60+ cities!) on May 30, 2026 — find your city and join in',
  href: '#event-list',
}

fs.writeFileSync(protestsPath, JSON.stringify(file, null, 2) + '\n')
console.log(`Total events: ${file.events.length}`)
