'use client'

import { motion } from 'framer-motion'

const regions = [
  {
    name: 'North West',
    agencyCostIncrease: '480%',
    shareOfCosts: '17%',
    description: 'Highest agency costs as share of staffing budget',
    severity: 'critical',
  },
  {
    name: 'North Simcoe Muskoka',
    agencyCostIncrease: '372%',
    shareOfCosts: '7%',
    description: 'Second-highest growth in agency spending',
    severity: 'high',
  },
  {
    name: 'North East',
    agencyCostIncrease: '216%',
    shareOfCosts: '11%',
    description: 'Significant reliance on private agencies',
    severity: 'high',
  },
  {
    name: 'Central West',
    agencyCostIncrease: 'Significant',
    shareOfCosts: '9%',
    description: 'Brampton, Etobicoke, northern Peel — fastest-growing, most-racialized communities',
    severity: 'high',
  },
  {
    name: 'Central',
    agencyCostIncrease: 'Moderate',
    shareOfCosts: 'Moderate',
    description: 'Markham, Vaughan, North York — fast-growing communities',
    severity: 'moderate',
  },
  {
    name: 'Central East',
    agencyCostIncrease: 'Moderate',
    shareOfCosts: 'Moderate',
    description: 'Durham region, Peterborough, Scarborough',
    severity: 'moderate',
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 border-red-400 text-red-900'
    case 'high':
      return 'bg-orange-100 border-orange-300 text-orange-900'
    case 'moderate':
      return 'bg-yellow-100 border-yellow-300 text-yellow-900'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-900'
  }
}

export default function SectionRegionalImpact() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-12 md:py-32">
      <div className="max-w-6xl w-full space-y-16 md:space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
              Regional Impact
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
              Some communities are hit harder than others
            </p>
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12">
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-center mb-4">
            Fastest-growing, most-racialized communities have the lowest per capita hospital spending
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-light mb-2">Central West</p>
              <p className="text-sm md:text-base text-gray-300">Brampton, Etobicoke, Peel</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-light mb-2">Central</p>
              <p className="text-sm md:text-base text-gray-300">Markham, Vaughan, North York</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-light mb-2">Central East</p>
              <p className="text-sm md:text-base text-gray-300">Durham, Peterborough, Scarborough</p>
            </div>
          </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
