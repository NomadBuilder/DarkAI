'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface DataSourcesDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function DataSourcesDrawer({ isOpen, onClose }: DataSourcesDrawerProps) {
  const dataSources = [
    {
      title: 'Ontario Public Accounts',
      description: 'Official government financial reports published annually',
      link: 'https://www.ontario.ca/page/public-accounts',
      years: '2018-2024',
    },
    {
      title: 'Detailed Schedule of Payments',
      description: 'Complete list of all payments to vendors, by ministry and year',
      link: 'https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments',
      format: 'CSV files',
    },
    {
      title: 'Hollowed Out: Private Staffing Agencies',
      description: 'CCPA report on $9.2B spent on private staffing agencies and hospital crisis',
      link: 'https://www.policyalternatives.ca/news-research/hollowed-out/',
      organization: 'Canadian Centre for Policy Alternatives',
    },
    {
      title: 'Ford Government LTC Bed Allocations',
      description: 'Analysis of long-term care bed allocation decisions showing privatization (Americanization) pattern',
      link: 'https://www.ontariohealthcoalition.ca/wp-content/uploads/Final-Ford-government-LTC-bed-allocations-report.pdf',
      organization: 'Ontario Health Coalition',
    },
    {
      title: 'OFL Ford Tracker',
      description: 'Comprehensive tracking of Ford government cuts, privatization (Americanization), and policy changes',
      link: 'https://ofl.ca/ford-tracker/',
      organization: 'Ontario Federation of Labour',
    },
    {
      title: 'Open Data Portal',
      description: 'Machine-readable data published by the Government of Ontario',
      link: 'https://data.ontario.ca',
      note: 'All data is publicly available and verifiable',
    },
    {
      title: 'Bill 60: Your Health Act',
      description: 'Legislation including the Water and Wastewater Public Corporations Act, 2025',
      link: 'https://www.ola.org/en/legislative-business/bills/parliament-43/session-1/bill-60',
      organization: 'Legislative Assembly of Ontario',
      note: 'Contains the Water and Wastewater Public Corporations Act, 2025',
    },
    {
      title: 'Water Privatization Research',
      description: 'Global examples and analysis of water privatization impacts on costs and service quality',
      note: 'Cost calculator based on documented rate increases of 30-50% in privatized water systems (Atlanta, Indianapolis, and other cities)',
    },
    {
      title: 'Ontario Nature: Bill 5 — A moment to mobilize for nature',
      description: 'Campaign and petition calling on Premier Ford to cancel Bill 5 and end attacks on endangered species',
      link: 'https://ontarionature.org/bill-5-a-moment-to-mobilize-for-nature-in-ontario-blog/',
      organization: 'Ontario Nature',
    },
    {
      title: 'David Suzuki Foundation: Repeal Bill 5',
      description: 'Call to repeal Bill 5 and protect species, Indigenous rights, and accountability',
      link: 'https://davidsuzuki.org/action/repealbill5/',
      organization: 'David Suzuki Foundation',
    },
    {
      title: 'Bill 5: Protect Ontario by Unleashing our Economy Act, 2025',
      description: 'Official bill text, status, and schedules (Species Conservation Act, Special Economic Zones Act, etc.)',
      link: 'https://www.ola.org/en/legislative-business/bills/parliament-44/session-1/bill-5',
      organization: 'Legislative Assembly of Ontario',
    },
    {
      title: 'Auditor General: Special Report on Changes to the Greenbelt',
      description: 'Official report finding the Greenbelt land removal process "biased and lacked transparency"; 12 of 15 sites requested by developers',
      link: 'https://auditor.on.ca/en/content/specialreports/specialreports/Greenbelt_en.pdf',
      organization: 'Office of the Auditor General of Ontario',
    },
    {
      title: 'RCMP criminal investigation into Greenbelt land swap',
      description: 'RCMP launched formal criminal probe into the Ford government\'s 2022 decision to remove 7,400 acres from the Greenbelt',
      link: 'https://www.thestar.com/politics/provincial/rcmp-launches-criminal-investigation-into-doug-ford-s-greenbelt-land-swap/article_f778e402-1c56-54c8-b6b3-1e212fe4d662.html',
      organization: 'Toronto Star',
    },
    {
      title: 'Ontario reverses Greenbelt land removal (2023)',
      description: 'Government restores 7,400 acres to the Greenbelt after public pressure and AG/integrity commissioner findings',
      link: 'https://www.cbc.ca/news/canada/toronto/ontario-greenbelt-reversal-1.6954872',
      organization: 'CBC News',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            aria-hidden="true"
          >
            <div onClick={onClose} className="w-full h-full bg-black/50" />
          </motion.div>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', maxWidth: '42rem', zIndex: 50 }}
          >
            <div className="h-full w-full bg-white shadow-xl overflow-y-auto">
            <div className="p-4 md:p-8">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900">Raw Data Sources</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl leading-none transition-colors active:scale-95 touch-manipulation"
                  aria-label="Close Data Sources"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 md:space-y-8">
                <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed">
                  Every number comes from publicly available government data. Verify it yourself.
                </p>

                <div className="space-y-4 md:space-y-6">
                  {dataSources.map((source, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-light text-gray-900 mb-2">
                            {source.title}
                          </h3>
                          <p className="text-sm md:text-base text-gray-600 font-light mb-2">
                            {source.description}
                          </p>
                          {source.years && (
                            <p className="text-xs md:text-sm text-gray-500 font-light">
                              Years covered: {source.years}
                            </p>
                          )}
                          {source.format && (
                            <p className="text-xs md:text-sm text-gray-500 font-light">
                              Format: {source.format}
                            </p>
                          )}
                          {source.organization && (
                            <p className="text-xs md:text-sm text-gray-500 font-light">
                              Source: {source.organization}
                            </p>
                          )}
                          {source.note && (
                            <p className="text-xs md:text-sm text-gray-500 font-light italic mt-2">
                              {source.note}
                            </p>
                          )}
                        </div>
                        {source.link && (
                          <a
                            href={source.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-light hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2 self-start"
                          >
                            View Source
                            <span className="text-xs">→</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
