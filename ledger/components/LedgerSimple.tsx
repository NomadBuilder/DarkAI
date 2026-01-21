'use client'

import { useEffect, useState } from 'react'
import { useLedgerStore } from '../store/ledgerStore'
import LedgerBubbles from './LedgerBubbles'

export default function LedgerSimple() {
  const { currentYear } = useLedgerStore()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  if (dimensions.width === 0 || dimensions.height === 0) {
    return null
  }

  return <LedgerBubbles year={currentYear} width={dimensions.width} height={dimensions.height} />
}
