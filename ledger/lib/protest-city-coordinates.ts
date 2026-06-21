/** Approximate centroids for May 30 protest cities (Ontario). Used for nearest-event lookup. */

export type LatLng = { lat: number; lng: number }

/** Keys: lowercase city name with spaces (matches getCityFromLocation output). */
export const PROTEST_CITY_COORDINATES: Record<string, LatLng> = {
  ancaster: { lat: 43.2186, lng: -79.9879 },
  angus: { lat: 44.3167, lng: -79.8833 },
  barrie: { lat: 44.3894, lng: -79.6903 },
  belleville: { lat: 44.1628, lng: -77.3832 },
  blyth: { lat: 43.7333, lng: -81.7167 },
  bowmanville: { lat: 43.9128, lng: -78.6875 },
  bracebridge: { lat: 45.0333, lng: -79.3167 },
  bradford: { lat: 44.1167, lng: -79.5667 },
  brampton: { lat: 43.7315, lng: -79.7624 },
  brantford: { lat: 43.1394, lng: -80.2644 },
  brockville: { lat: 44.5897, lng: -75.6841 },
  burlington: { lat: 43.3255, lng: -79.799 },
  cambridge: { lat: 43.3616, lng: -80.3144 },
  chatham: { lat: 42.4048, lng: -82.191 },
  cornwall: { lat: 45.0181, lng: -74.7282 },
  'elliot lake': { lat: 46.1834, lng: -82.6542 },
  elmira: { lat: 43.4039, lng: -80.5558 },
  etobicoke: { lat: 43.6544, lng: -79.5672 },
  fergus: { lat: 43.7067, lng: -80.377 },
  georgetown: { lat: 43.6487, lng: -79.9173 },
  guelph: { lat: 43.5448, lng: -80.2482 },
  hamilton: { lat: 43.2557, lng: -79.8711 },
  kanata: { lat: 45.3088, lng: -75.8986 },
  kincardine: { lat: 44.175, lng: -81.633 },
  'king city': { lat: 43.928, lng: -79.526 },
  kingston: { lat: 44.2312, lng: -76.486 },
  lindsay: { lat: 44.3531, lng: -78.7359 },
  listowel: { lat: 43.7328, lng: -80.9509 },
  london: { lat: 42.9849, lng: -81.2453 },
  'markham-thornhill': { lat: 43.8561, lng: -79.337 },
  meaford: { lat: 44.606, lng: -80.5927 },
  milton: { lat: 43.5183, lng: -79.8774 },
  mississauga: { lat: 43.589, lng: -79.6441 },
  newmarket: { lat: 44.0592, lng: -79.4613 },
  'north bay': { lat: 46.3092, lng: -79.4608 },
  oakville: { lat: 43.4675, lng: -79.6877 },
  orangeville: { lat: 43.919, lng: -80.0943 },
  orillia: { lat: 44.6082, lng: -79.4207 },
  ottawa: { lat: 45.4215, lng: -75.6972 },
  'owen sound': { lat: 44.567, lng: -80.9435 },
  pembroke: { lat: 45.8267, lng: -77.1109 },
  peterborough: { lat: 44.3091, lng: -78.3197 },
  pickering: { lat: 43.8384, lng: -79.0868 },
  'port hope': { lat: 43.9509, lng: -78.2936 },
  'richmond hill': { lat: 43.8828, lng: -79.4403 },
  sarnia: { lat: 42.9745, lng: -82.4066 },
  'sault ste. marie': { lat: 46.5219, lng: -84.3195 },
  simcoe: { lat: 42.837, lng: -80.303 },
  'st. catharines': { lat: 43.1594, lng: -79.2469 },
  'st. thomas': { lat: 42.778, lng: -81.183 },
  stayner: { lat: 44.4167, lng: -80.0833 },
  stouffville: { lat: 43.9667, lng: -79.25 },
  stratford: { lat: 43.37, lng: -80.983 },
  strathroy: { lat: 42.955, lng: -81.623 },
  sudbury: { lat: 46.4917, lng: -80.993 },
  'temiskaming shores': { lat: 47.5126, lng: -79.6829 },
  'new liskeard': { lat: 47.5126, lng: -79.6829 },
  'thunder bay': { lat: 48.3809, lng: -89.2477 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  vaughan: { lat: 43.8361, lng: -79.4983 },
  wallaceburg: { lat: 42.6, lng: -82.3833 },
  waterdown: { lat: 43.3344, lng: -79.8947 },
  waterloo: { lat: 43.4643, lng: -80.5204 },
  whitby: { lat: 43.8975, lng: -78.9428 },
  windsor: { lat: 42.3149, lng: -83.0364 },
  woodstock: { lat: 43.1305, lng: -80.7476 },
}

export function cityKeyFromLocation(location: string): string {
  const city = location.split(',')[0]?.trim().toLowerCase() ?? ''
  return city
}

export function getCityCoordinates(location: string): LatLng | null {
  const key = cityKeyFromLocation(location)
  return PROTEST_CITY_COORDINATES[key] ?? null
}
