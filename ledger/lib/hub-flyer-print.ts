import type { FlyerPrintBrand } from '@/components/flyers/FlyerPrintView'
import { HUB_FLYER_SITE_URL } from '@/lib/hub-flyers'

export const HUB_FLYER_PRINT_BRAND: FlyerPrintBrand = {
  chromeFrom: '#1a4d3a',
  chromeTo: '#142818',
  chromeAccent: '#e8dfd0',
  chromeMuted: '#e8dfd0',
  siteUrl: HUB_FLYER_SITE_URL,
  siteLabel: 'protectont.ca/stand4land',
  qrImageUrl: '/hub/stand4land-flyer-qr.png',
  ariaPrefix: 'Standing for the Land printable flyer',
  backLabel: '← Standing for the Land',
}
