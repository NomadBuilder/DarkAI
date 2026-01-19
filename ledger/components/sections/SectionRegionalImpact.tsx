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
    note: 'Lowest per capita hospital spending',
  },
  {
    name: 'Central',
    agencyCostIncrease: 'Moderate',
    shareOfCosts: 'Moderate',
    description: 'Markham, Vaughan, North York — fast-growing communities',
    severity: 'moderate',
    note: 'Lowest per capita hospital spending',
  },
  {
    name: 'Central East',
    agencyCostIncrease: 'Moderate',
    shareOfCosts: 'Moderate',
    description: 'Durham region, Peterborough, Scarborough',
    severity: 'moderate',
    note: 'Lowest per capita hospital spending',
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
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-white py-16 md:py-0">
      <div className="max-w-6xl w-full space-y-12 md:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 md:mb-8">
            Regional Impact
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 font-light max-w-4xl mx-auto">
            Some communities are hit harder than others
          </p>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-slate-900 text-white rounded-2xl p-8 md:p-12"
        >
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
        </motion.div>

        {/* Regional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {regions.map((region, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
              className={`rounded-xl p-6 md:p-8 border-2 ${getSeverityColor(region.severity)}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-xl md:text-2xl font-light flex-1">
                  {region.name}
                </h3>
                {region.severity === 'critical' && (
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-light">
                    Critical
                  </span>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-light opacity-80">Agency cost increase:</span>
                  <span className="text-2xl md:text-3xl font-light">
                    {region.agencyCostIncrease}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-light opacity-80">Share of staffing costs:</span>
                  <span className="text-xl md:text-2xl font-light">
                    {region.shareOfCosts}
                  </span>
                </div>
              </div>
              
              <p className="text-sm md:text-base font-light opacity-90 mb-2">
                {region.description}
              </p>
              
              {region.note && (
                <p className="text-xs md:text-sm font-light opacity-75 mt-3 pt-3 border-t border-current/20">
                  ⚠️ {region.note}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Northern Crisis */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="bg-red-50 border-2 border-red-400 rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6 text-center">
            The Northern Crisis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-light text-red-600 mb-2">480%</p>
              <p className="text-sm md:text-base text-gray-700 font-light">North West</p>
              <p className="text-xs text-gray-600 font-light mt-1">increase in agency costs</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-light text-red-600 mb-2">372%</p>
              <p className="text-sm md:text-base text-gray-700 font-light">North Simcoe Muskoka</p>
              <p className="text-xs text-gray-600 font-light mt-1">increase in agency costs</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-light text-red-600 mb-2">216%</p>
              <p className="text-sm md:text-base text-gray-700 font-light">North East</p>
              <p className="text-xs text-gray-600 font-light mt-1">increase in agency costs</p>
            </div>
          </div>
          <p className="text-center text-lg md:text-xl font-light text-gray-700 mt-8 pt-6 border-t border-red-200">
            Where shortages are most severe, privatization costs are highest
          </p>
        </motion.div>
      </div>
    </section>
  )
}
