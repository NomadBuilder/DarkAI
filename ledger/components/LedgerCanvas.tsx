'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useLedgerStore } from '@/store/ledgerStore'
import * as d3 from 'd3'
import type { VendorYearlyPayments, SystemComposition } from '@/types'

interface LedgerData {
  systemComposition: SystemComposition[]
  vendors: VendorYearlyPayments[]
}

interface Node {
  id: string
  type: string
  value: number
  x: number
  y: number
  vx: number
  vy: number
  vendor: VendorYearlyPayments
  radius: number
  opacity: number
}

export default function LedgerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentYear, receiptsMode, activeLens, setSelectedVendor } = useLedgerStore()
  const dataRef = useRef<LedgerData | null>(null)
  const nodesRef = useRef<Node[]>([])
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const previousYearRef = useRef<number>(2018)

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
          try {
            composition = await compositionRes.json()
          } catch (e) {
            console.warn('Failed to parse system_composition.json:', e)
          }
        }
        
        if (vendorsRes && vendorsRes.ok) {
          try {
            vendors = await vendorsRes.json()
          } catch (e) {
            console.warn('Failed to parse vendors_master.json:', e)
          }
        }
        
        if (composition && vendors) {
          dataRef.current = {
            systemComposition: Array.isArray(composition) ? composition : [],
            vendors: Array.isArray(vendors) ? vendors : [],
          }
          draw()
        } else {
          console.warn('Data not fully loaded, using placeholder')
          draw()
        }
      } catch (error) {
        console.warn('Data not loaded yet, using placeholder visualization:', error)
        draw()
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = window.innerWidth
    const height = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance

    // Set canvas size
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    
    // Scale context for high DPI
    ctx.scale(dpr, dpr)

    const data = dataRef.current
    if (!data) {
      drawPlaceholder(ctx, width, height)
      return
    }

    // Find composition for current year, or nearest available year
    let currentComposition = data.systemComposition.find(c => c.year === currentYear)
    let yearToUse = currentYear
    
    // If year doesn't exist, find nearest year
    if (!currentComposition && data.systemComposition.length > 0) {
      const sortedYears = data.systemComposition.map(c => c.year).sort((a, b) => a - b)
      const nearestYear = sortedYears.reduce((prev, curr) => {
        return Math.abs(curr - currentYear) < Math.abs(prev - currentYear) ? curr : prev
      })
      currentComposition = data.systemComposition.find(c => c.year === nearestYear)
      yearToUse = nearestYear
    }

    if (!currentComposition) {
      drawPlaceholder(ctx, width, height)
      return
    }

    drawLedger(ctx, width, height, currentComposition, data.vendors, yearToUse)
  }

  const drawPlaceholder = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Calm, stable placeholder
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, width, height)
    
    // Subtle grid
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }
  }

  const drawLedger = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    composition: SystemComposition,
    vendors: VendorYearlyPayments[],
    year: number
  ) => {
    // Filter vendors for current year and lens
    let activeVendors = vendors.filter(v => {
      const yearKey = year.toString()
      const payments = v.yearly_payments as any
      const amount = payments[yearKey] || payments[year] || 0
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

    // Limit to top vendors for performance (show largest)
    activeVendors.sort((a, b) => {
      const aPayments = a.yearly_payments as any
      const bPayments = b.yearly_payments as any
      const aAmount = aPayments[year.toString()] || aPayments[year] || 0
      const bAmount = bPayments[year.toString()] || bPayments[year] || 0
      return bAmount - aAmount
    })
    activeVendors = activeVendors.slice(0, 500) // Top 500 for performance

    if (activeVendors.length === 0) {
      drawPlaceholder(ctx, width, height)
      return
    }

    // Count vendor types for debugging
    const typeCounts: Record<string, number> = {}
    activeVendors.forEach(v => {
      const type = v.type || (v as any).vendor_type || 'unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    console.log(`Year ${year}: ${activeVendors.length} vendors -`, typeCounts)
    
    if (activeVendors.length === 0) {
      console.warn(`No vendors found for year ${year}`)
      drawPlaceholder(ctx, width, height)
      return
    }
    
    console.log(`Drawing ${activeVendors.length} nodes for year ${year}`)

    // Color mapping with better contrast
    const colorMap: Record<string, string> = {
      public: '#3b82f6',      // Blue
      non_profit: '#10b981',  // Green
      for_profit: '#ef4444',  // Red
      unknown: '#94a3b8',     // Gray
    }

    // Calculate max value for scaling
    const maxValue = Math.max(...activeVendors.map(v => {
      const payments = v.yearly_payments as any
      return payments[year.toString()] || payments[year] || 0
    }))
    const minRadius = 2
    const maxRadius = 40

    // Create or update nodes
    const yearChanged = previousYearRef.current !== year
    previousYearRef.current = year

    const nodes: Node[] = activeVendors.map((v, i) => {
      const yearKey = year.toString()
      const payments = v.yearly_payments as any
      const value = payments[yearKey] || payments[year] || 0
      const radius = Math.max(minRadius, Math.min(maxRadius, Math.sqrt(value / maxValue) * maxRadius))
      
      // Find existing node for smooth transitions
      const existing = nodesRef.current.find(n => n.id === v.vendor_id)
      
      // Get vendor type - check both 'type' and 'vendor_type' fields
      const vendorType = (v.type || (v as any).vendor_type || 'unknown') as string
      
      return {
        id: v.vendor_id,
        type: vendorType,
        value,
        x: existing ? existing.x : width / 2 + (Math.random() - 0.5) * 200,
        y: existing ? existing.y : height / 2 + (Math.random() - 0.5) * 200,
        vx: existing ? existing.vx * 0.5 : 0,
        vy: existing ? existing.vy * 0.5 : 0,
        vendor: v,
        radius,
        opacity: yearChanged ? 0 : (existing?.opacity || 1),
      }
    })

    // Stop any existing animation and simulation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (simulationRef.current) {
      simulationRef.current.stop()
      simulationRef.current = null
    }

    // Create force simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('charge', d3.forceManyBody<Node>().strength((d: Node) => {
        // Stronger repulsion for larger nodes
        return -Math.sqrt(d.value / 1000000) * 2
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<Node>().radius((d) => d.radius + 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))
      .alpha(1)
      .alphaDecay(0.02)

    simulationRef.current = simulation

    // Draw function
    const drawNodes = () => {
      if (!canvasRef.current) return
      const drawCtx = canvasRef.current.getContext('2d', { alpha: true })
      if (!drawCtx) return
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      
      // Clear canvas
      drawCtx.clearRect(0, 0, width * dpr, height * dpr)
      
      // Reset transform and scale
      drawCtx.setTransform(1, 0, 0, 1, 0, 0)
      drawCtx.scale(dpr, dpr)

      // Draw nodes with smooth transitions
      nodes.forEach((node, index) => {
        if (index === 0) {
          console.log(`Drawing node at (${node.x}, ${node.y}) with radius ${node.radius}, type ${node.type}`)
        }
        // Fade in on year change
        if (yearChanged && node.opacity < 1) {
          node.opacity = Math.min(1, node.opacity + 0.05)
        }

        const color = colorMap[node.type] || colorMap.unknown
        const alpha = receiptsMode ? 0.9 : 0.7

        // Draw node
        drawCtx.save()
        drawCtx.globalAlpha = node.opacity * alpha
        
        // Gradient fill for depth
        const gradient = drawCtx.createRadialGradient(
          node.x - node.radius * 0.3,
          node.y - node.radius * 0.3,
          0,
          node.x,
          node.y,
          node.radius
        )
        const d3Color = d3.color(color)
        const brighterColor = d3Color ? d3Color.brighter(0.5).toString() : color
        gradient.addColorStop(0, brighterColor)
        gradient.addColorStop(1, color)
        
        drawCtx.fillStyle = gradient
        drawCtx.beginPath()
        drawCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        drawCtx.fill()

        // Stroke for definition
        const strokeColor = d3Color ? d3Color.darker(0.3).toString() : color
        drawCtx.strokeStyle = strokeColor
        drawCtx.lineWidth = 1
        drawCtx.stroke()

        drawCtx.restore()

        // Draw label in receipts mode
        if (receiptsMode && node.radius > 5) {
          drawCtx.fillStyle = '#0f172a'
          drawCtx.font = `${Math.max(10, node.radius * 0.4)}px Inter, sans-serif`
          drawCtx.globalAlpha = 0.9
          const vendorName = (node.vendor as any).name || (node.vendor as any).vendor_name_normalized || 'Unknown'
          const label = vendorName.substring(0, 25)
          const metrics = drawCtx.measureText(label)
          drawCtx.fillText(
            label,
            node.x - metrics.width / 2,
            node.y + node.radius + 15
          )
        }
      })

      // Store nodes for click detection
      nodesRef.current = nodes
    }

    // Continuous animation loop - keep drawing even after simulation settles
    const animate = () => {
      if (!canvasRef.current) return
      
      drawNodes()
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation loop
    simulation.on('tick', drawNodes)
    animate()
    
    // Keep simulation active longer for smoother transitions
    simulation.alphaDecay(0.01)
  }

  // Handle canvas clicks for receipts mode
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !receiptsMode) return

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scale = window.devicePixelRatio
      const x = (e.clientX - rect.left) * scale
      const y = (e.clientY - rect.top) * scale

      const clickedNode = nodesRef.current.find(node => {
        const nodeX = node.x * scale
        const nodeY = node.y * scale
        const dx = x - nodeX
        const dy = y - nodeY
        return Math.sqrt(dx * dx + dy * dy) <= node.radius * scale
      })

      if (clickedNode) {
        setSelectedVendor(clickedNode.id)
      }
    }

    canvas.addEventListener('click', handleClick)
    canvas.style.pointerEvents = 'auto'

    return () => {
      canvas.removeEventListener('click', handleClick)
      canvas.style.pointerEvents = 'none'
    }
  }, [receiptsMode, setSelectedVendor])

  useEffect(() => {
    // Stop any running animation when year/lens changes
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (simulationRef.current) {
      simulationRef.current.stop()
      simulationRef.current = null
    }
    
    // Small delay to ensure clean state, then redraw
    const timeoutId = setTimeout(() => {
      if (dataRef.current) {
        draw()
      }
    }, 50)
    
    return () => {
      clearTimeout(timeoutId)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, receiptsMode, activeLens])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      draw()
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="canvas-container"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: receiptsMode ? 'auto' : 'none',
        zIndex: 1,
      }}
    />
  )
}
