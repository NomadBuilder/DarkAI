'use client'

import { motion } from 'framer-motion'
import InlineCitation from '../InlineCitation'

export default function SectionKeyFindings() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-24 md:py-32">
      <div className="max-w-6xl w-full space-y-16 md:space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-8 md:mb-12">
              Key Findings
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              The data tells a clear story — spending since 2018
            </p>
          </div>
        </motion.div>

        {/* Findings Grid */}
        <div className="space-y-6 md:space-y-8">
          {[
            {
              number: '1',
              title: (
                <>
                  Private spending grew nearly 2x faster than public funding between 2018 and 2024
                </>
              ),
              description: (
                <>
                  For-profit payments increased 86.7% while public funding grew 46.5%
                  <InlineCitation href="#source-1" label="1" />
                </>
              ),
              highlight: true,
            },
            {
              number: '2',
              title: (
                <>
                  $9.2 billion to private staffing agencies over 10 years
                </>
              ),
              description: (
                <>
                  Private agency costs grew 98% while public staff spending grew only 6%
                  <InlineCitation href="#source-2" label="2" />
                </>
              ),
            },
            {
              number: '3',
              title: (
                <>
                  Private agencies cost 3x more than public staff
                </>
              ),
              description: (
                <>
                  0.4% of hours but 6% of costs ($725M annually)
                  <InlineCitation href="#source-2" label="2" />
                </>
              ),
            },
            {
              number: '4',
              title: (
                <>
                  66 of 134 hospitals had deficits in 2023-24
                </>
              ),
              description: (
                <>
                  49% of Ontario hospitals ended the year in deficit
                  <InlineCitation href="#source-2" label="2" />
                </>
              ),
            },
            {
              number: '5',
              title: (
                <>
                  Ontario ranked 33 out of 38 OECD countries
                </>
              ),
              description: (
                <>
                  Staffed hospital beds per capita
                  <InlineCitation href="#source-2" label="2" />
                </>
              ),
            },
            {
              number: '6',
              title: 'New for-profit vendors appeared post-2018',
              description: (
                <>
                  WCG ($403M), Omni Health Care entities ($732M total), Southbridge ($175M) and others
                  <InlineCitation href="#source-4" label="4" />
                </>
              ),
            },
            {
              number: '7',
              title: (
                <>
                  Bill 60 accelerated surgical privatization
                </>
              ),
              description: (
                <>
                  For-profit surgical clinics paid 2-3x more than public hospitals for the same procedures
                  <InlineCitation href="#source-3" label="3" />
                </>
              ),
            },
            {
              number: '8',
              title: 'Public capacity hollowed out',
              description: 'Once capacity leaves the public system, it doesn\'t return',
            },
            {
              number: '9',
              title: 'System-wide staff shortages',
              description: 'Created by wage suppression and underfunding',
            },
          ].map((finding, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            >
              <div className={`rounded-2xl p-8 md:p-12 border-2 ${
                finding.highlight
                  ? 'bg-red-50 border-red-400'
                  : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-start gap-6">
                <div className={`text-4xl md:text-5xl font-light ${
                  finding.highlight ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {finding.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                    {finding.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-light">
                    {finding.description}
                  </p>
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
