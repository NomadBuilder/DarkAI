'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { CAMPAIGN_STATUS_LABELS, indigenousHubPath } from '@/lib/indigenous-hub'

type Props = {
  campaigns: IndigenousCampaign[]
  selectedSlug?: string | null
  flyToSlug?: string | null
  onSelect?: (slug: string | null) => void
  className?: string
  compact?: boolean
  scrollWheelZoom?: boolean
}

function MapFlyTo({
  lat,
  lng,
  zoom,
  useMap,
}: {
  lat: number
  lng: number
  zoom: number
  useMap: typeof import('react-leaflet').useMap
}) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.1 })
  }, [map, lat, lng, zoom])
  return null
}

function CampaignMarker({
  campaign,
  selected,
  icon,
  selectedIcon,
  onSelect,
  Marker,
  Popup,
}: {
  campaign: IndigenousCampaign
  selected: boolean
  icon: import('leaflet').DivIcon
  selectedIcon: import('leaflet').DivIcon
  onSelect?: (slug: string | null) => void
  Marker: typeof import('react-leaflet').Marker
  Popup: typeof import('react-leaflet').Popup
}) {
  const markerRef = useRef<import('leaflet').Marker | null>(null)

  useEffect(() => {
    if (selected && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [selected])

  return (
    <Marker
      ref={markerRef}
      position={[campaign.lat, campaign.lng]}
      icon={selected ? selectedIcon : icon}
      eventHandlers={{
        click: () => onSelect?.(campaign.slug),
      }}
    >
      <Popup>
        <div className="min-w-[200px] max-w-[260px] p-1">
          <p className="text-xs text-[#5a7a66] uppercase tracking-wide">{CAMPAIGN_STATUS_LABELS[campaign.status]}</p>
          <p className="font-medium text-[#142818] text-base leading-snug mt-0.5">{campaign.title}</p>
          <p className="text-sm text-[#3d5c48] mt-2 leading-relaxed">{campaign.summary.slice(0, 120)}…</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Link
              href={indigenousHubPath('campaigns', campaign.slug)}
              className="text-sm text-[#1a4d3a] font-medium hover:underline"
            >
              Campaign page →
            </Link>
            {campaign.officialSite && (
              <a
                href={campaign.officialSite.href}
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
  )
}

export default function CanadaCampaignMap({
  campaigns,
  selectedSlug,
  flyToSlug,
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

  const selectedIcon = useMemo(() => {
    if (!L) return undefined
    return L.divIcon({
      className: 'indigenous-map-marker indigenous-map-marker--selected',
      html: '<span aria-hidden="true"></span>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    })
  }, [L])

  const flyToCampaign = flyToSlug ? campaigns.find((c) => c.slug === flyToSlug) : null
  const flyZoom = compact ? 5 : 6

  if (!MapComponents || !L || !icon || !selectedIcon) {
    const minH = compact ? 'h-[240px] sm:h-[280px]' : 'min-h-[min(420px,55vh)] sm:min-h-[420px]'
    return (
      <div
        className={`rounded-2xl border border-[#1a4d3a]/12 bg-[#e8f0e4] flex items-center justify-center ${minH} ${className}`}
      >
        <p className="text-sm text-[#5a7a66] font-light">Loading map…</p>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, useMap } = MapComponents
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
        .indigenous-map-marker--selected span {
          width: 20px;
          height: 20px;
          border-width: 4px;
          box-shadow: 0 0 0 4px rgba(196, 165, 116, 0.35);
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
          {flyToCampaign && (
            <MapFlyTo lat={flyToCampaign.lat} lng={flyToCampaign.lng} zoom={flyZoom} useMap={useMap} />
          )}
          {campaigns.map((c) => (
            <CampaignMarker
              key={c.slug}
              campaign={c}
              selected={selectedSlug === c.slug || flyToSlug === c.slug}
              icon={icon}
              selectedIcon={selectedIcon}
              onSelect={onSelect}
              Marker={Marker}
              Popup={Popup}
            />
          ))}
        </MapContainer>
      </div>
    </>
  )
}
