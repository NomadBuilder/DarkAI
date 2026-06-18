import type { Flyer } from './flyers'

/** Default flyer copy — expanded for full letter-size print. */
export const defaultFlyerEntries: Flyer[] = [
  {
    id: 'overview',
    slug: 'overview',
    title: "DOUG FORD'S ONTARIO",
    subtitle: "WHAT'S BEING SOLD OFF?",
    intro:
      'Ontario is shifting public money, land, water, and environmental protections toward private profit — while accountability is weakened. That includes rolling back freedom-of-information access and overriding evidence-based street safety policy. This flyer summarizes the pattern documented in public accounts, legislation, and independent reporting. Share it. Print it. Talk about it with neighbours.',
    heroImageUrl: '',
    highlights: [
      'Public $ → private delivery',
      'Greenbelt & waterfront opened up',
      'Bills 5, 60 & weakened oversight',
      'FOI rollback · street safety',
    ],
    sections: [
      {
        title: 'Healthcare',
        lead: 'Hospitals are stretched while for-profit operators and staffing agencies capture more of the budget.',
        bullets: [
          'Ontario has spent billions on private staffing agencies while public hospitals report deficits and staffing gaps.',
          'For-profit clinics have been paid more per procedure than public hospitals for the same surgeries (documented in CBC and Public Accounts reporting).',
          'Bill 124 capped wages for many public healthcare workers while agency rates climbed.',
          'Emergency departments and hallway medicine remain widespread as capacity shifts out of public hands.',
          'Long-term care bed allocations have favoured for-profit operators in multiple rounds of licensing.',
        ],
      },
      {
        title: 'Water & wastewater',
        lead: 'Bill 60 changes who controls the systems communities depend on every day.',
        bullets: [
          'Legislation opens pathways for corporate involvement in water and wastewater services.',
          'Municipal utilities face pressure to partner with or sell assets to private operators.',
          'Ratepayers risk losing transparency when decisions move behind corporate walls.',
          'Environmental enforcement and local accountability become harder when ownership changes.',
        ],
      },
      {
        title: 'Public land',
        lead: 'Protected land and public waterfront are treated as development opportunity — not a public trust.',
        bullets: [
          'Greenbelt land swaps removed protections while benefiting selected landowners and developers.',
          'Ontario Place privatization hands a major public waterfront to a private spa resort project.',
          'Farmland, watershed, and urban green space face ongoing pressure from sprawl and infrastructure.',
          'Communities often learn about deals after key decisions are already made.',
        ],
      },
      {
        title: 'Environment & Indigenous rights',
        lead: 'Species protection, public participation, and treaty obligations are being sidelined for faster development.',
        bullets: [
          'Bill 5 weakens species-at-risk rules and Indigenous participation in environmental decisions.',
          'Special economic zones can bypass normal environmental review.',
          'Ring of Fire and northern development proceed without adequate free, prior, and informed consent.',
          'Biodiversity loss and treaty violations carry long-term costs communities will bear.',
        ],
      },
    ],
    calloutTitle: 'See the full picture',
    calloutBody:
      'ProtectOnt.ca maps spending, policy, and land decisions using only public sources — interactive timelines, issue pages, and methodology you can verify. No logins. No spin. Just the pattern in the data.',
    published: true,
  },
  {
    id: 'healthcare',
    slug: 'healthcare',
    title: 'HEALTHCARE UNDER FORD',
    subtitle: 'PUBLIC CARE · PRIVATE PROFIT',
    intro:
      'Ontario\'s universal public healthcare system is being hollowed out. Public hospitals face deficits and long waits while private staffing agencies, for-profit clinics, and corporate operators capture more publicly funded capacity — often at higher cost.',
    heroImageUrl: '/products/yard-signs/ford-failed-you.png',
    highlights: [
      'Billions to staffing agencies',
      'Bill 124 wage caps',
      'For-profit clinics expand',
    ],
    sections: [
      {
        title: 'Private staffing agencies',
        lead: 'CCPA\'s "Hollowed Out" report and Ontario Public Accounts document the shift of hospital budgets to temp agencies.',
        bullets: [
          'Hospital spending on private staffing agencies has surged year over year while full-time public staffing struggles to keep pace.',
          'Agency nurses and workers often cost far more per hour than equivalent public employees — the public pays the premium.',
          'Bill 124 (2019) capped compensation for many public-sector workers, including healthcare staff, while agency use increased.',
          'Agency reliance is a policy choice: it transfers public money to private intermediaries instead of building stable public capacity.',
          'Rural and understaffed hospitals feel this pressure most acutely — closures and reduced services follow funding gaps.',
        ],
      },
      {
        title: 'For-profit clinics & Bill 60',
        lead: 'Private surgical and diagnostic clinics are expanding with public funding — sometimes paid more than hospitals for the same work.',
        bullets: [
          'Bill 60 and related policies expand for-profit delivery of publicly insured services.',
          'CBC reporting documented cases where for-profit clinics were paid more per procedure than public hospitals.',
          'Every dollar to for-profit clinics is a dollar not rebuilding public hospital capacity and staffing.',
          'Wait-list optics may improve for some procedures while the system becomes more fragmented and expensive.',
          'American-style two-tier pressure grows when public capacity is deliberately constrained.',
        ],
      },
      {
        title: 'Hospitals, ER waits & long-term care',
        lead: 'Ontarians still face hallway medicine, closed ERs, and LTC decisions that favour private beds.',
        bullets: [
          'Emergency department wait times and hallway medicine remain defining crises across the province.',
          'Ontario ranks poorly on per-capita acute care beds compared to other provinces (CIHI data).',
          'Long-term care bed allocations have repeatedly favoured for-profit operators in licensing rounds.',
          'Ontario Health Coalition and other groups have documented the tilt toward corporate LTC chains.',
          'Underfunding public capacity while expanding private delivery is a political choice — not an inevitability.',
        ],
      },
    ],
    calloutTitle: 'What you can do',
    calloutBody: '',
    calloutActions: [
      { label: 'Tell your MPP', text: 'protectont.ca/take-action' },
      { label: 'Find a rally', text: 'protectont.ca/protests' },
      { label: 'Request a sign', text: 'protectont.ca/join' },
      { label: 'Healthcare data', text: 'protectont.ca/healthcare' },
    ],
    published: true,
  },
  {
    id: 'water',
    slug: 'water',
    title: 'WATER & WASTEWATER',
    subtitle: 'WHO CONTROLS THE TAP?',
    intro:
      'Clean water and wastewater treatment are basic public responsibilities. Bill 60 and related provincial policy open the door to corporate control — weakening municipal oversight and making it harder for communities to hold decision-makers accountable.',
    heroImageUrl: '',
    highlights: ['Bill 60', 'Municipal utilities at risk', 'Rates & secrecy'],
    sections: [
      {
        title: 'What Bill 60 changes',
        lead: 'The "Your Health Act" and related water legislation are not only about healthcare — they reshape who can own and operate water services.',
        bullets: [
          'New frameworks allow greater private-sector involvement in water and wastewater services.',
          'Municipalities may face pressure to enter public-private partnerships or sell utility assets.',
          'Long-term contracts can lock communities in before full costs and risks are understood.',
          'Environmental compliance and spill response may be harder to enforce under private operators.',
          'Once privatized, bringing services back under public control is expensive and politically difficult.',
        ],
      },
      {
        title: 'What privatization costs communities',
        lead: 'Experience in Ontario and elsewhere shows the public still pays — often more — when profits are extracted.',
        bullets: [
          'Private operators must return profit to shareholders; that money comes from ratepayers or service cuts.',
          'Rate increases often follow privatization despite promises of "efficiency."',
          'Transparency declines when financial decisions happen behind corporate walls.',
          'Local councils lose leverage when multi-decade contracts bind future councils.',
          'Water security during climate emergencies requires public accountability — not quarterly earnings targets.',
        ],
      },
      {
        title: 'Questions to ask locally',
        lead: 'Use these at council meetings, with your MPP, and in local media.',
        bullets: [
          'Who owns our water and wastewater systems today — and who is lobbying to change that?',
          'What are the full 20-year costs of any proposed partnership vs public operation?',
          'What happens to rates, jobs, and environmental enforcement if a private operator fails?',
          'Will the public get open-book audits and council votes before any asset transfer?',
          'Does this align with municipal climate and watershed protection plans?',
        ],
      },
    ],
    calloutTitle: 'Dig deeper',
    calloutBody: 'Interactive analysis, legislation links, and documented sources.',
    calloutActions: [
      { label: 'Water issue page', text: 'protectont.ca/water' },
      { label: 'Contact your MPP', text: 'protectont.ca/take-action' },
    ],
    published: true,
  },
  {
    id: 'public-land',
    slug: 'public-land',
    title: 'PUBLIC LAND',
    subtitle: 'GREENBELT · ONTARIO PLACE · WHO BENEFITS?',
    intro:
      'Protected farmland, Greenbelt land, and public waterfront are being opened for development — often after opaque processes that benefit well-connected landowners and developers more than communities.',
    heroImageUrl: '',
    highlights: ['Greenbelt swaps', 'Ontario Place spa deal', 'Developer access'],
    sections: [
      {
        title: 'Greenbelt scandal',
        lead: 'The Auditor General and RCMP investigations documented land-use changes that favoured specific properties.',
        bullets: [
          'Provincial land swaps removed Greenbelt protections from selected parcels while adding elsewhere.',
          'Some landowners benefited from re-zoning and access decisions shortly before public announcements.',
          'Farmland and watershed protection were traded for sprawl-friendly development patterns.',
          'The Greenbelt was created to be permanent — political reversals undermine trust in all conservation policy.',
          'Communities were not given meaningful input before boundaries were redrawn.',
        ],
      },
      {
        title: 'Ontario Place & waterfront',
        lead: 'A public cultural and recreational waterfront is being handed to a private Austrian spa operator.',
        bullets: [
          'Ontario Place privatization replaces public access and cultural space with a commercial thermal spa.',
          'The footprint and public benefit of the original Ontario Place vision have been sharply reduced.',
          'Waterfront land in Toronto belongs to the public — not a single term of government.',
          'Similar patterns appear wherever public land is "leased" to private operators for decades.',
          'Ask: who profits, who pays maintenance costs, and what public access remains?',
        ],
      },
      {
        title: 'Sprawl & accountability',
        lead: 'When land rules change in favour of developers, housing affordability and climate targets suffer.',
        bullets: [
          'Opening protected land encourages car-dependent sprawl instead of infill and transit-oriented growth.',
          'Infrastructure costs for sprawl are borne by municipalities and provincial taxpayers.',
          'Backroom land deals are difficult to challenge without public records and journalism.',
          'ProtectOnt.ca/receipts tracks timelines and documented connections — verify and share.',
        ],
      },
    ],
    calloutTitle: 'See the receipts',
    calloutBody: 'Timelines, sources, and land policy context.',
    calloutActions: [
      { label: 'Public land', text: 'protectont.ca/public-land' },
      { label: 'Receipts', text: 'protectont.ca/receipts' },
      { label: 'Greenbelt', text: 'protectont.ca/greenbelt' },
    ],
    published: true,
  },
  {
    id: 'wildlife',
    slug: 'wildlife',
    title: 'WILDLIFE & SPECIES',
    subtitle: 'BILL 5 · WEAKER PROTECTION',
    intro:
      'Bill 5 and related changes roll back species-at-risk protections, environmental assessment, and public participation — clearing the way for development that communities and scientists have long opposed.',
    heroImageUrl: '',
    highlights: ['Bill 5', 'Species at risk', 'SEZs'],
    sections: [
      {
        title: 'Bill 5 — what changed',
        lead: 'Ontario Nature, the David Suzuki Foundation, and legal experts have documented broad rollbacks.',
        bullets: [
          'Species-at-risk habitat protections weakened — more projects can proceed with less scrutiny.',
          'Environmental assessment requirements reduced for categories of development.',
          'Public participation windows shortened; community objections are easier to dismiss.',
          'Ministerial discretion expanded — fewer independent checks on harmful projects.',
          'Petitions calling for repeal reflect widespread concern across Ontario communities.',
        ],
      },
      {
        title: 'Special economic zones',
        lead: 'SEZs can bundle land-use, environmental, and labour rules into fast-track development packages.',
        bullets: [
          'Special economic zones may bypass normal municipal and environmental planning.',
          'Water, wildlife habitat, and farmland in zone boundaries face concentrated risk.',
          'Jobs promises are often overstated; environmental liabilities stay with the public.',
          'Once a zone is declared, local democratic control is permanently reduced.',
        ],
      },
      {
        title: 'Why biodiversity matters here',
        lead: 'Ontario\'s species and ecosystems underpin farming, fishing, tourism, and climate resilience.',
        bullets: [
          'Habitat loss is irreversible on human timescales — extinction is permanent.',
          'Weakened enforcement shifts costs to future generations and rural communities.',
          'Indigenous knowledge and stewardship are sidelined when participation rules shrink.',
          'Full issue page: protectont.ca/wildlife',
        ],
      },
    ],
    calloutTitle: 'Take action',
    calloutBody: 'Ontario Nature and David Suzuki Foundation campaigns — share this flyer.',
    calloutActions: [
      { label: 'Petitions & MPP', text: 'protectont.ca/take-action' },
    ],
    published: true,
  },
  {
    id: 'indigenous-rights',
    slug: 'indigenous-rights',
    title: 'INDIGENOUS RIGHTS',
    subtitle: 'CONSENT · TREATIES · RING OF FIRE',
    intro:
      'Free, prior, and informed consent is not optional — it is a treaty obligation and a human rights standard. Provincial policy is pushing Ring of Fire and other northern development without adequate consent processes or respect for Indigenous governance.',
    heroImageUrl: '',
    highlights: ['FPIC', 'Ring of Fire', 'Bill 5'],
    sections: [
      {
        title: 'Free, prior & informed consent',
        lead: 'UNDRIP and Canadian law increasingly recognize FPIC — Ontario\'s rush to develop often ignores it.',
        bullets: [
          'Bill 5 reduces Indigenous participation in environmental decision-making.',
          'Major projects proceed before consent is sought from affected Nations.',
          'Treaty rights to hunt, fish, and govern traditional territories are treated as obstacles.',
          'Court challenges and land defender actions reflect legitimate opposition — not "blockades" to dismiss.',
          'Reconciliation requires changing process, not just adding consultation after decisions are made.',
        ],
      },
      {
        title: 'Ring of Fire',
        lead: 'A massive mining and infrastructure corridor in the James Bay lowlands affects multiple First Nations.',
        bullets: [
          'Roads, power lines, and mines would permanently alter wetlands and caribou habitat.',
          'Promised jobs and revenue rarely match environmental and cultural costs borne locally.',
          'Nations have not uniformly consented — some have explicitly opposed the current timeline.',
          'Federal and provincial governments have pressured acceleration despite outstanding land claims.',
          'Water contamination risk in northern river systems affects downstream communities for generations.',
        ],
      },
      {
        title: 'What solidarity looks like',
        lead: 'Non-Indigenous Ontarians can support Nations leading on their own terms.',
        bullets: [
          'Listen to Indigenous-led organizations — do not speak over them.',
          'Contact your MPP: development without consent is not reconciliation.',
          'Learn treaty history for the land you live on.',
          'Read more: protectont.ca/indigenous-rights',
        ],
      },
    ],
    calloutTitle: 'Learn & organize',
    calloutBody: '',
    calloutActions: [
      { label: 'Indigenous rights', text: 'protectont.ca/indigenous-rights' },
      { label: 'Join', text: 'protectont.ca/join' },
      { label: 'Take action', text: 'protectont.ca/take-action' },
    ],
    published: true,
  },
  {
    id: 'accountability',
    slug: 'accountability',
    title: 'ACCOUNTABILITY',
    subtitle: 'FOLLOW THE PUBLIC MONEY',
    intro:
      'When services are privatized and land deals happen behind closed doors, transparency is the first casualty. Protect Ontario pulls public accounts, legislation, and documented journalism into one place so citizens can see the pattern — and demand better.',
    heroImageUrl: '/products/yard-signs/ford-failed-you.png',
    highlights: ['Public Accounts', 'Auditor General', 'Open data'],
    sections: [
      {
        title: 'What the books show',
        lead: 'Ontario Public Accounts and Detailed Schedule of Payments reveal where provincial dollars actually go.',
        bullets: [
          'Spending on private staffing agencies, consultants, and contractors has grown in multiple sectors.',
          'Hospital and ministry deficits coexist with large transfers to private operators.',
          'Open data exists — but it is scattered across portals most residents never see.',
          'ProtectOnt.ca visualizes trends so you do not need a finance degree to spot shifts.',
        ],
      },
      {
        title: 'Legislation & oversight',
        lead: 'Bills that change ownership of water, land, and healthcare pass with limited debate time.',
        bullets: [
          'Omnibus bills bundle unrelated changes — making scrutiny harder for MPPs and the public.',
          'Bill 97 (2026) excludes premier and ministerial records from Ontario\'s Freedom of Information and Protection of Privacy Act (FIPPA), with retroactive effect — see protectont.ca/flyer/freedom-of-information.',
          'Auditor General reports on Greenbelt and other files documented process failures.',
          'Integrity Commissioner and lobbying registers exist but require journalists and citizens to connect dots.',
          'Weakened environmental and Indigenous participation rules reduce formal opposition channels.',
        ],
      },
      {
        title: 'How to use ProtectOnt.ca',
        lead: 'Built for neighbours, organizers, and journalists who want verified starting points.',
        bullets: [
          'Issue pages: healthcare, water, public land, wildlife, Indigenous rights.',
          'Methodology and data sources are documented — challenge us if we get it wrong.',
          'Protest calendar: protectont.ca/protests',
          'Contact your MPP with one click: protectont.ca/take-action',
          'Join the volunteer network: protectont.ca/join',
        ],
      },
    ],
    calloutTitle: 'Explore the data',
    calloutBody: 'Print this flyer, post it, talk about it with neighbours.',
    calloutActions: [
      { label: 'Home', text: 'protectont.ca' },
      { label: 'Methodology', text: 'protectont.ca/methodology' },
      { label: 'Receipts', text: 'protectont.ca/receipts' },
    ],
    published: true,
  },
  {
    id: 'yard-sign',
    slug: 'yard-sign',
    title: 'GET A YARD SIGN',
    subtitle: 'FORD FAILED YOU',
    intro:
      'Put the message on your lawn where neighbours can see it. Our protest yard sign highlights healthcare, education, and transparency — the same issues documented on ProtectOnt.ca. Order a printed sign with stand for $10, or download the artwork and print your own.',
    heroImageUrl: '/products/yard-signs/ford-failed-you.png',
    highlights: ['$10 with stand', '24″×18″ or 18″×12″', 'Local delivery'],
    sections: [
      {
        title: 'What the sign says',
        lead: 'Bold purple-and-gold design built for visibility from the street.',
        bullets: [
          'Healthcare — public hospitals hollowed out while private agencies and for-profit clinics capture more funding.',
          'Education — schools and supports under strain while public dollars shift elsewhere.',
          'Transparency — land deals, spending, and legislation that communities struggle to track.',
          'Full issue breakdowns with sources at protectont.ca.',
        ],
      },
      {
        title: 'Order a printed sign',
        lead: 'Delivered by volunteers in your area — not shipped by mail.',
        bullets: [
          '$10 per sign, stand included.',
          'Sizes: 24″ × 18″ or 18″ × 12″ — choose on the order form or at checkout.',
          'Pay online at protectont.ca/products or request delivery at protectont.ca/join.',
          'We are a growing grassroots network — if we are still building capacity near you, we will work with you to find a pickup or delivery option.',
        ],
      },
      {
        title: 'Print your own',
        lead: 'Use the same artwork for bulletin boards, windows, or home printing.',
        bullets: [
          'Download the PNG from protectont.ca/products/ford-failed-you.',
          'Print at a copy shop on cardstock or coroplast for a DIY lawn sign.',
          'Pair this flyer with an issue poster from protectont.ca/flyer for a full info table.',
        ],
      },
    ],
    calloutTitle: 'Order or volunteer',
    calloutBody: 'Put a sign up before the next rally.',
    calloutActions: [
      { label: 'Order sign', text: 'protectont.ca/products' },
      { label: 'Join', text: 'protectont.ca/join' },
      { label: 'Protests', text: 'protectont.ca/protests' },
    ],
    published: true,
  },
  {
    id: 'yard-sign-education',
    slug: 'yard-sign-education',
    title: 'EDUCATION UNDER FORD',
    subtitle: 'PUT IT ON YOUR LAWN',
    intro:
      'Schools, educators, and families are carrying more with less while provincial policy favours privatization and cuts to public supports. The Ford Failed You yard sign calls out education alongside healthcare and transparency — share the facts and show solidarity on your block.',
    heroImageUrl: '/products/yard-signs/ford-failed-you.png',
    highlights: ['Public schools', 'Underfunding', 'Yard sign $10'],
    sections: [
      {
        title: 'Public education pressure',
        lead: 'Ontario classrooms face larger classes, fewer supports, and chronic underinvestment relative to need.',
        bullets: [
          'School boards report staffing gaps, capital repair backlogs, and program cuts.',
          'Special education and mental-health supports are stretched while demand grows.',
          'Private and online alternatives receive political attention while public systems are asked to do more with less.',
          'Education workers and parents have organized repeatedly for adequate funding and respect.',
        ],
      },
      {
        title: 'Why a yard sign helps',
        lead: 'Visible, local messaging starts conversations that social media alone cannot.',
        bullets: [
          'Neighbours who do not follow politics still see the sign on their street.',
          'The design matches ProtectOnt.ca branding — one movement, many entry points.',
          'Pair the sign with flyers from protectont.ca/flyer at community events.',
          'Request a sign: protectont.ca/join · Order: protectont.ca/products.',
        ],
      },
    ],
    calloutTitle: 'Get the sign',
    calloutBody: 'Ford Failed You yard sign — $10 with stand. Download artwork on the product page.',
    calloutActions: [{ label: 'Order', text: 'protectont.ca/products' }],
    published: true,
  },
  {
    id: 'yard-sign-rally',
    slug: 'yard-sign-rally',
    title: 'BRING A SIGN TO THE RALLY',
    subtitle: 'HEALTHCARE · EDUCATION · TRANSPARENCY',
    intro:
      'Rallies need visible, readable messaging. Whether you order our yard sign or print this flyer, help the crowd show a unified message: Ford failed Ontarians on healthcare, education, and transparency. Find the next protest and bring neighbours with you.',
    heroImageUrl: '/products/yard-signs/ford-failed-you.png',
    highlights: ['protectont.ca/protests', 'Unified message', 'Print & share'],
    sections: [
      {
        title: 'Before you go',
        lead: 'A few minutes of prep makes your sign and conversation more effective.',
        bullets: [
          'Check protectont.ca/protests for date, time, location, and any local organizer notes.',
          'Read one issue page on ProtectOnt.ca so you can answer basic questions from passersby.',
          'Bring water, weather-appropriate gear, and a friend — numbers matter.',
          'Photograph your sign at the event (with consent) and tag local organizers.',
        ],
      },
      {
        title: 'Healthcare · Education · Transparency',
        lead: 'Three words on the sign — three areas where public money and trust are at stake.',
        bullets: [
          'Healthcare: billions to staffing agencies and for-profit clinics while hospitals struggle.',
          'Education: public schools asked to absorb cuts while supports for students shrink.',
          'Transparency: Greenbelt deals, Ontario Place, and spending that happens before communities can respond.',
          'Deep dives: protectont.ca/healthcare · protectont.ca/take-action',
        ],
      },
      {
        title: 'After the rally',
        lead: 'Keep the momentum on your block.',
        bullets: [
          'Leave a yard sign up for two weeks — neighbours will ask questions.',
          'Host a coffee chat or share protectont.ca/flyer printouts door to door.',
          'Volunteer for delivery or outreach: protectont.ca/join.',
        ],
      },
    ],
    calloutTitle: 'Find a protest',
    calloutBody: '',
    calloutActions: [
      { label: 'Protest calendar', text: 'protectont.ca/protests' },
      { label: 'Join', text: 'protectont.ca/join' },
      { label: 'Order yard sign', text: 'protectont.ca/products' },
    ],
    published: true,
  },
  {
    id: 'freedom-of-information',
    slug: 'freedom-of-information',
    title: 'FREEDOM OF INFORMATION',
    subtitle: 'SHUTTING THE FILES',
    intro:
      'Ontario\'s freedom-of-information laws let residents, journalists, and researchers request government records. Bill 97 — passed in 2026 as part of the Plan to Protect Ontario Act — rolls back that right for the premier, cabinet ministers, and their political staff, and weakens oversight in other ways. Civil liberties groups and Ontario\'s Information and Privacy Commissioner warned these changes undermine transparency Ontarians have relied on for decades.',
    heroImageUrl: '',
    highlights: ['Bill 97 · FIPPA', 'Ministerial records exempt', 'Retroactive to 1988'],
    sections: [
      {
        title: 'What Bill 97 changes',
        lead: 'Source: Legislative Assembly of Ontario — Bill 97, Schedule 7 (FIPPA amendments); received Royal Assent in 2026.',
        bullets: [
          'FIPPA will no longer apply to records in the custody or control of a minister, a minister\'s office, or a parliamentary assistant — unless the same record is also held by a government institution.',
          'That exclusion covers the premier, every cabinet minister, parliamentary assistants, and their political staff — the offices where many high-stakes decisions are made.',
          'The standard deadline to answer an access request increases from 30 calendar days to 45 business days — a longer wait for public answers.',
          'Certain cybersecurity records prepared under the Enhancing Digital Security and Trust Act, 2024 are also carved out of access laws.',
        ],
      },
      {
        title: 'Retroactive secrecy',
        lead: 'Source: Bill 97 transitional provisions (Ontario.ca/ola); Canadian Civil Liberties Association analysis.',
        bullets: [
          'Ministerial-record exclusions are deemed to have come into force on January 1, 1988 — not just for future requests.',
          'Transitional rules can invalidate existing disclosure orders and court decisions that conflict with the new exclusions.',
          'Records that were already ordered released may be pulled back behind the new wall of secrecy.',
          'CCLA warned this lets the government avoid accountability for decisions already under scrutiny.',
        ],
      },
      {
        title: 'Why independent voices objected',
        lead: 'Source: Information and Privacy Commissioner of Ontario (ipc.on.ca), March 2026; CCLA (ccla.org).',
        bullets: [
          'The IPC said excluding the highest levels of government "diminish[es] the public\'s right to information" and that retroactivity "raises serious concerns."',
          'The Commissioner argued modernizing FOI should mean faster disclosure and proactive release — not rolling back rights.',
          'CCLA called the ministerial carve-out one of the most troubling elements of Bill 97 and warned cybersecurity exemptions could hide evaluations that pose no security risk.',
          'When ministers\' records leave FIPPA, statutory privacy and security safeguards for those records are weakened too — the IPC flagged increased cybersecurity risk.',
        ],
      },
      {
        title: 'Questions to ask locally',
        lead: 'Use this flyer at doors, community boards, and MPP offices.',
        bullets: [
          'Why hide ministerial records now — after Greenbelt, Ontario Place, and healthcare privatization debates?',
          'What requests or court orders does this retroactive change affect?',
          'Will your MPP vote to restore FIPPA coverage for ministerial offices?',
          'Ask for proactive disclosure of contracts, lobbying contacts, and land-use decisions — not less access.',
          'More context: protectont.ca/flyer/accountability · protectont.ca/take-action',
        ],
      },
    ],
    calloutTitle: '',
    calloutBody: '',
    published: true,
  },
  {
    id: 'bike-lanes-safety',
    slug: 'bike-lanes-safety',
    title: 'BIKE LANES & SPEED CAMERAS',
    subtitle: 'SAFETY CUTS · LAWSUIT SHIELDS',
    intro:
      'The Ford government has overridden Toronto on protected bike lanes, banned municipal automated speed enforcement cameras province-wide, and passed legislation that blocks lawsuits when those changes hurt people. A Superior Court judge found the targeted Toronto bike-lane removals arbitrary — they would not reduce congestion and would put cyclists at greater risk — yet the province appealed. These are shallow populist moves that sacrifice road safety for drivers-first messaging.',
    heroImageUrl: '',
    highlights: ['Bill 212 · Toronto lanes', 'Bill 56 · speed cameras', 'Lawsuit immunity'],
    sections: [
      {
        title: 'Toronto bike lanes — Bill 212',
        lead: 'Source: Bill 212, Reducing Gridlock, Saving You Time Act, 2024 (ola.org); Cycle Toronto et al. v. Attorney General of Ontario, 2025 ONSC 4397.',
        bullets: [
          'Bill 212 amended the Highway Traffic Act to require removal of protected bike lanes on Bloor Street, University Avenue, and Yonge Street in Toronto — restoring motor-vehicle lanes.',
          'A last-minute amendment added ss. 195.10–195.14: no lawsuits against the government, municipalities, or contractors for collisions, injuries, or deaths resulting from removing those lanes.',
          'In July 2025, Justice Schabas ruled s. 195.6 unconstitutional: removal would increase harm to cyclists without achieving the stated goal of reducing congestion.',
          'The judge found the law arbitrary and grossly disproportionate under Section 7 of the Charter; internal advice to government had already said removals would not fix gridlock.',
          'The province appealed; a Court of Appeal hearing was held in January 2026 — decision pending as of print date.',
        ],
      },
      {
        title: 'Speed cameras — Bill 56',
        lead: 'Source: Bill 56, Building a More Competitive Economy Act, 2025 (ola.org); CBC and Global News reporting, November 2025.',
        bullets: [
          'Bill 56 repealed Part XIV.1 of the Highway Traffic Act — ending municipal automated speed enforcement (ASE) cameras in school zones and community safety zones.',
          'Royal Assent November 3, 2025; municipalities were required to remove cameras by November 14, 2025 — before permanent traffic-calming replacements were in place.',
          'Premier Ford called the cameras a "tax grab"; police associations and many municipalities had documented their effectiveness at slowing drivers.',
          'Section 206.6 extinguishes certain lawsuits against the Crown and municipalities tied to repealing speed-camera contracts.',
          'Temporary signage was promised, but ripping out working enforcement first trades proven safety tools for political optics.',
        ],
      },
      {
        title: 'Future bike lanes — Bill 60',
        lead: 'Source: Bill 60, Fighting Delays, Building Faster Act, 2025 (ola.org); Environmental Registry of Ontario notice 025-1071.',
        bullets: [
          'Bill 60 prohibits municipalities from reducing motor-vehicle lanes when installing new bicycle lanes — unless a regulation exempts the project.',
          'Passed November 24, 2025; Ottawa and other cities reported planned bike projects cancelled or redesigned because of the lane-reduction ban.',
          'The province says cities can still build bike lanes that do not remove a car lane — but on many arterial roads, safe separated lanes require rebalancing space.',
          'Bill 60 stacks on Bill 212: remove existing protected infrastructure in Toronto, then restrict how other cities build safer alternatives.',
          'This does not fix induced demand — more car lanes tend to fill with more cars, not less congestion.',
        ],
      },
      {
        title: 'What this means for commuters',
        lead: 'Pedestrians, cyclists, children, and low-income residents who rely on bikes bear the highest risk.',
        bullets: [
          'Protected bike lanes separate people from traffic — removing them increases injury and death risk, according to the court record and city data cited in Cycle Toronto v. AG.',
          'Speed cameras enforce limits 24/7 in school zones; removing them shifts enforcement back to sporadic police presence.',
          'Lawsuit-immunity clauses signal the government expects harm — then blocks accountability.',
          'Congestion is a regional problem; scapegoating bike lanes ignores transit, induced demand, and sprawl policy.',
          'Talk to neighbours: protectont.ca/flyer · protectont.ca/protests · protectont.ca/take-action',
        ],
      },
    ],
    calloutTitle: '',
    calloutBody: '',
    published: true,
  },
]
