'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface MethodologyDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MethodologyDrawer({ isOpen, onClose }: MethodologyDrawerProps) {
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
                <h2 className="text-2xl md:text-3xl font-light text-gray-900">Methodology</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl leading-none transition-colors active:scale-95 touch-manipulation"
                  aria-label="Close Methodology"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 md:space-y-8 prose prose-sm md:prose max-w-none">
                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Data Sources</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 font-light leading-relaxed">
                    This experience visualizes publicly reported spending data from Ontario&apos;s Public Accounts — 
                    Detailed Schedule of Payments. This is first-party government data published under Ontario&apos;s 
                    open data program.
                  </p>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 font-light leading-relaxed">
                    The data answers a simple question: &quot;Who did Ontario pay, and how much?&quot;
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-light block"
                    >
                      View raw data on Ontario Open Data Portal →
                    </a>
                    <a
                      href="https://www.ontario.ca/page/public-accounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-light block"
                    >
                      Official Public Accounts website →
                    </a>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Additional Research Sources</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 font-light leading-relaxed">
                    This visualization incorporates insights and data from additional research reports:
                  </p>
                  <div className="space-y-3">
                    <a
                      href="https://www.policyalternatives.ca/news-research/hollowed-out/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-light block"
                    >
                      CCPA: &quot;Hollowed Out&quot; — Private Staffing Agencies Report →
                    </a>
                    <a
                      href="https://www.ontariohealthcoalition.ca/wp-content/uploads/Final-Ford-government-LTC-bed-allocations-report.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-light block"
                    >
                      Ontario Health Coalition: LTC Bed Allocations Report →
                    </a>
                    <a
                      href="https://ofl.ca/ford-tracker/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-light block"
                    >
                      OFL Ford Tracker →
                    </a>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Time Window</h3>
                  <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed">
                    Data covers fiscal years 2018-2024, focusing on the period since Doug Ford took office 
                    and Ford era (2018-2024).
                  </p>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Data Integrity</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 font-light leading-relaxed">
                    This data has been systematically audited and corrected:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4 font-light leading-relaxed">
                    <li><strong className="font-normal">Payment Processors Excluded:</strong> Accounting pass-throughs like D+H (OSAP loans) are excluded from for-profit calculations</li>
                    <li><strong className="font-normal">Public Institutions Corrected:</strong> Hospitals, municipalities, and public entities misclassified as for-profit have been corrected</li>
                    <li><strong className="font-normal">Multi-Source Verification:</strong> Data cross-referenced with CCPA reports, Ontario Health Coalition analysis, and OFL tracking</li>
                    <li><strong className="font-normal">Transparent Methodology:</strong> All classification rules, exclusions, and corrections are documented</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-700 mt-3 md:mt-4 font-light leading-relaxed">
                    <strong className="font-normal">Example:</strong> D+H Corporation was initially classified as for-profit with a $1.7B payment, but was corrected to a payment processor/pass-through for OSAP loans and grants. This was not a $1.7B payment to a for-profit company—it was student financial aid flowing through a payment system.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Vendor Classification</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 font-light leading-relaxed">
                    Vendors are classified into three categories:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4 font-light leading-relaxed">
                    <li><strong className="font-normal">Public:</strong> Hospitals, school boards, municipalities, crown agencies</li>
                    <li><strong className="font-normal">Non-profit:</strong> Registered charities, known non-profit operators</li>
                    <li><strong className="font-normal">For-profit:</strong> Incorporated companies, staffing agencies, clinics, consultants, IT vendors</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-700 mt-3 md:mt-4 font-light leading-relaxed">
                    Only the top ~200 vendors by total spend or growth are classified. Everything else remains 
                    &quot;unclassified&quot; and is visually de-emphasized.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Limitations</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4 font-light leading-relaxed">
                    <li>This visualization shows spending patterns, not intent or legality</li>
                    <li>Classification is based on publicly available information</li>
                    <li>Not all vendors are classified — focus is on top spenders and fastest growers</li>
                    <li>Data is a static snapshot — no real-time updates</li>
                    <li>Public Accounts show payment processors, not always end recipients — large pass-through payments are excluded</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Interpretation vs. Source Material</h3>
                  <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed">
                    This experience clearly distinguishes interpretation from source material. All payment data 
                    comes directly from Ontario&apos;s Public Accounts. Visual patterns and classifications are our 
                    interpretation of that data.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Data Processing</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 font-light leading-relaxed">
                    Raw payment data is processed through the following pipeline:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4 font-light leading-relaxed">
                    <li>Ingest: Concatenate annual Public Accounts CSVs</li>
                    <li>Normalize: Merge vendor name variations and aliases</li>
                    <li>Aggregate: Calculate totals by vendor, year, and ministry</li>
                    <li>Classify: Tag top vendors by type and category</li>
                    <li>Derive: Generate growth rates and first appearance dates</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg md:text-xl font-light text-gray-900 mb-3 md:mb-4">Water Privatization Analysis</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 font-light leading-relaxed">
                    The water privatization section analyzes Bill 60&apos;s Water and Wastewater Public Corporations Act, 2025:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4 font-light leading-relaxed">
                    <li><strong className="font-normal">Legal Analysis:</strong> Direct excerpts from the legislation, including sections on corporate structure, municipal control, and financial authority</li>
                    <li><strong className="font-normal">Government vs. Critics:</strong> Side-by-side comparison of government claims versus critics&apos; interpretation of the law&apos;s implications</li>
                    <li><strong className="font-normal">Cost Calculator:</strong> Based on documented global examples where privatized water systems saw 30-50% rate increases (Atlanta, Indianapolis, and other cities)</li>
                    <li><strong className="font-normal">Control Comparison:</strong> Interactive visualization showing how control shifts from public to corporate under the legislation</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-700 mt-3 md:mt-4 font-light leading-relaxed">
                    <strong className="font-normal">Source:</strong> Bill 60 (Your Health Act) was passed in November 2025 and is publicly available through the Legislative Assembly of Ontario. The legal analysis is based on direct reading of the statute text.
                  </p>
                  <div className="mt-3 md:mt-4">
                    <a
                      href="https://www.ola.org/en/legislative-business/bills/parliament-43/session-1/bill-60"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-light block"
                    >
                      View Bill 60 on Legislative Assembly website →
                    </a>
                  </div>
                </section>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
