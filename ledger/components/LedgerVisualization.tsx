'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'
import * as d3 from 'd3'
import type { VendorYearlyPayments, SystemComposition } from '@/types'

interface LedgerData {
  systemComposition: SystemComposition[]
  vendors: VendorYearlyPayments[]
}

interface Node extends d3.SimulationNodeDatum {
  id: string
  type: string
  value: number
  x: number
  y: number
  vx?: number
  vy?: number
  vendor: VendorYearlyPayments
  radius: number
  opacity: number
}

export default function LedgerVisualization() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentYear, receiptsMode, activeLens, setSelectedVendor } = useLedgerStore()
  const dataRef = useRef<LedgerData | null>(null)
  const nodesRef = useRef<Node[]>([])
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [compositionRes, vendorsRes] = await Promise.all([
          fetch('/data/processed/system_composition.json').catch(() => null),
          fetch('/data/processed/vendors_master.json').catch(() => null),
        ])
        
        let composition = null
        let vendors = null
        
        if (compositionRes && compositionRes.ok) {
          composition = await compositionRes.json()
        }
        
        if (vendorsRes && vendorsRes.ok) {
          vendors = await vendorsRes.json()
        }
        
        if (composition && vendors) {
          dataRef.current = {
            systemComposition: Array.isArray(composition) ? composition : [],
            vendors: Array.isArray(vendors) ? vendors : [],
          }
          setIsReady(true)
          console.log('Data loaded:', {
            composition: dataRef.current.systemComposition.length,
            vendors: dataRef.current.vendors.length
          })
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [])

  // Update visualization when year/lens changes
  useEffect(() => {
    if (!isReady || !dataRef.current || !svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Set SVG size
    svg.attr('width', width).attr('height', height)
    
    // Clear previous nodes and any error messages
    svg.selectAll('*').remove()

    const data = dataRef.current

    // Find composition for current year, or nearest available year
    let currentComposition = data.systemComposition.find(c => c.year === currentYear)
    let yearToUse = currentYear
    
    if (!currentComposition && data.systemComposition.length > 0) {
      const sortedYears = data.systemComposition.map(c => c.year).sort((a, b) => a - b)
      const nearestYear = sortedYears.reduce((prev, curr) => {
        return Math.abs(curr - currentYear) < Math.abs(prev - currentYear) ? curr : prev
      })
      currentComposition = data.systemComposition.find(c => c.year === nearestYear)
      yearToUse = nearestYear
    }

    if (!currentComposition) {
      console.warn(`No composition data for year ${currentYear}`)
      return
    }

    // Filter vendors for current year and lens
    let activeVendors = data.vendors.filter(v => {
      const yearKey = yearToUse.toString()
      const payments = v.yearly_payments as any
      const amount = payments[yearKey] || payments[yearToUse] || 0
      return amount > 0
    })

    // Apply lens filter
    if (activeLens) {
      activeVendors = activeVendors.filter(v => {
        if (activeLens === 'staffing') return v.category === 'staffing'
        if (activeLens === 'consulting') return v.category === 'consulting'
        if (activeLens === 'healthcare') return v.category === 'healthcare_delivery'
        return false
      })
    }

    // Sort and limit for performance
    activeVendors.sort((a, b) => {
      const aPayments = a.yearly_payments as any
      const bPayments = b.yearly_payments as any
      const aAmount = aPayments[yearToUse.toString()] || aPayments[yearToUse] || 0
      const bAmount = bPayments[yearToUse.toString()] || bPayments[yearToUse] || 0
      return bAmount - aAmount
    })
    activeVendors = activeVendors.slice(0, 500)

    if (activeVendors.length === 0) {
      console.warn(`No vendors found for year ${yearToUse} (requested ${currentYear})`)
      // Don't return - still render empty state or show placeholder
      svg.selectAll('circle').remove()
      svg.selectAll('text').remove()
      return
    }

    console.log(`Rendering ${activeVendors.length} vendors for year ${yearToUse} (requested ${currentYear})`)

    // Color mapping
    const colorMap: Record<string, string> = {
      public: '#3b82f6',
      non_profit: '#10b981',
      for_profit: '#ef4444',
      unknown: '#94a3b8',
    }

    // Calculate max value for scaling
    const maxValue = Math.max(...activeVendors.map(v => {
      const payments = v.yearly_payments as any
      return payments[yearToUse.toString()] || payments[yearToUse] || 0
    }))
    const minRadius = 3
    const maxRadius = 40

    // Create nodes
    const nodes: Node[] = activeVendors.map((v) => {
      const yearKey = yearToUse.toString()
      const payments = v.yearly_payments as any
      const value = payments[yearKey] || payments[yearToUse] || 0
      const radius = Math.max(minRadius, Math.min(maxRadius, Math.sqrt(value / maxValue) * maxRadius))
      
      // Find existing node for smooth transitions
      const existing = nodesRef.current.find(n => n.id === v.vendor_id)
      
      const vendorType = (v.type || (v as any).vendor_type || 'unknown') as string
      
      return {
        id: v.vendor_id,
        type: vendorType,
        value,
        x: existing && existing.x !== undefined ? existing.x : width / 2 + (Math.random() - 0.5) * 200,
        y: existing && existing.y !== undefined ? existing.y : height / 2 + (Math.random() - 0.5) * 200,
        vx: existing && existing.vx !== undefined ? existing.vx * 0.5 : 0,
        vy: existing && existing.vy !== undefined ? existing.vy * 0.5 : 0,
        vendor: v,
        radius,
        opacity: 1,
      }
    })

    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    // Create force simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('charge', d3.forceManyBody<Node>().strength((d: Node) => {
        return -Math.sqrt(d.value / 1000000) * 2
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<Node>().radius((d) => d.radius + 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))
      .alpha(1)
      .alphaDecay(0.02)

    simulationRef.current = simulation

    // Create circles
    const circles = svg.selectAll<SVGCircleElement, Node>('circle')
      .data(nodes, d => d.id)

    // Enter: new circles
    const circlesEnter = circles.enter()
      .append('circle')
      .attr('r', 0)
      .attr('opacity', 0)
      .attr('fill', d => colorMap[d.type] || colorMap.unknown)
      .attr('stroke', d => {
        const color = d3.color(colorMap[d.type] || colorMap.unknown)
        return color ? color.darker(0.3).toString() : colorMap.unknown
      })
      .attr('stroke-width', 1)
      .style('cursor', receiptsMode ? 'pointer' : 'default')
      .on('click', (event, d) => {
        if (receiptsMode) {
          setSelectedVendor(d.id)
        }
      })

    // Update: existing circles
    circlesEnter.merge(circles as any)
      .transition()
      .duration(300)
      .attr('r', d => d.radius)
      .attr('opacity', receiptsMode ? 0.9 : 0.7)

    // Exit: remove old circles
    circles.exit()
      .transition()
      .duration(300)
      .attr('r', 0)
      .attr('opacity', 0)
      .remove()

    // Update positions on simulation tick
    simulation.on('tick', () => {
      circlesEnter.merge(circles as any)
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)
    })

    // Store nodes for reference
    nodesRef.current = nodes

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [currentYear, receiptsMode, activeLens, isReady, setSelectedVendor])

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      if (svgRef.current && containerRef.current) {
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        d3.select(svgRef.current).attr('width', width).attr('height', height)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial call

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isReady) {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 w-full h-full bg-slate-50"
        style={{ zIndex: 1 }}
      />
    )
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ pointerEvents: receiptsMode ? 'auto' : 'none' }}
      />
    </div>
  )
}
