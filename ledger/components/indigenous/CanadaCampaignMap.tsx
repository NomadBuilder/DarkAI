'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { CAMPAIGN_STATUS_LABELS, indigenousHubPath } from '@/lib/indigenous-hub'

type Props = {
  campaigns: IndigenousCampaign[]
  selectedSlug?: string | null
  onSelect?: (slug: string | null) => void
  className?: string
  compact?: boolean
  scrollWheelZoom?: boolean
}

export default function CanadaCampaignMap({
  campaigns,
  selectedSlug,
  onSelect,
  className = '',
  compact = false,
  scrollWheelZoom = true,
}: Props) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import('react-leaflet').MapContainer
    TileLayer: typeof import('react-leaflet').TileLayer
    Marker: typeof import('react-leaflet').Marker
    Popup: typeof import('react-leaflet').Popup
    useMap: typeof import('react-leaflet').useMap
  } | null>(null)
  const [L, setL] = useState<typeof import('leaflet') | null>(null)

  useEffect(() => {
    void Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, leafletMod]) => {
      const leaflet = ('default' in leafletMod ? leafletMod.default : leafletMod) as typeof import('leaflet')
      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
        useMap: rl.useMap,
      })
      setL(leaflet)
    })
  }, [])

  const icon = useMemo(() => {
    if (!L) return undefined
    return L.divIcon({
      className: 'indigenous-map-marker',
      html: '<span aria-hidden="true"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }, [L])

  if (!MapComponents || !L || !icon) {
    const minH = compact ? 'h-[240px] sm:h-[280px]' : 'min-h-[min(420px,55vh)] sm:min-h-[420px]'
    return (
      <div
        className={`rounded-2xl border border-[#1a4d3a]/12 bg-[#e8f0e4] flex items-center justify-center ${minH} ${className}`}
      >
        <p className="text-sm text-[#5a7a66] font-light">Loading map…</p>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents
  const mapHeight = compact ? 'h-[240px] sm:h-[280px]' : 'h-[min(420px,55vh)] sm:h-[520px]'
  const mapZoom = compact ? 3 : 4

  return (
    <>
      <style jsx global>{`
        .indigenous-map-marker span {
          display: block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1a4d3a;
          border: 3px solid #c4a574;
          box-shadow: 0 2px 8px rgba(26, 77, 58, 0.35);
        }
        .leaflet-container {
          font-family: inherit;
          border-radius: 1rem;
        }
      `}</style>
      <div className={`rounded-2xl overflow-hidden border border-[#1a4d3a]/12 shadow-lg ${className}`}>
        <MapContainer
          center={[56, -96]}
          zoom={mapZoom}
          scrollWheelZoom={scrollWheelZoom}
          className={`${mapHeight} w-full z-0`}
          aria-label="Map of Indigenous-led campaigns across Canada"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {campaigns.map((c) => (
            <Marker
              key={c.slug}
              position={[c.lat, c.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelect?.(c.slug),
              }}
            >
              <Popup>
                <div className="min-w-[200px] max-w-[260px] p-1">
                  <p className="text-xs text-[#5a7a66] uppercase tracking-wide">{CAMPAIGN_STATUS_LABELS[c.status]}</p>
                  <p className="font-medium text-[#142818] text-base leading-snug mt-0.5">{c.title}</p>
                  <p className="text-sm text-[#3d5c48] mt-2 leading-relaxed">{c.summary.slice(0, 120)}…</p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    <Link
                      href={indigenousHubPath('campaigns', c.slug)}
                      className="text-sm text-[#1a4d3a] font-medium hover:underline"
                    >
                      Campaign page →
                    </Link>
                    {c.officialSite && (
                      <a
                        href={c.officialSite.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#5a7a66] hover:underline"
                      >
                        Official site ↗
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  )
}
