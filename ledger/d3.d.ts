declare module 'd3' {
  namespace d3 {
    interface SimulationNodeDatum {
      x?: number
      y?: number
      vx?: number
      vy?: number
      fx?: number | null
      fy?: number | null
    }
    interface Simulation<NodeDatum extends SimulationNodeDatum, LinkDatum> {
      [key: string]: any
    }
  }
  const d3: any
  export = d3
}
