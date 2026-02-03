import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

// Base URL and paths for meta, OG, and icons (lowercase canonical URL)
const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || ''
// Use canonical URL only when set (e.g. in production); otherwise relative so dev/404 doesn't break metadata
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
const metadataBase = siteUrl ? new URL(siteUrl) : undefined

export const metadata: Metadata = {
  metadataBase,
  title: 'Protect Ontario — Accountability for the Ford Government',
  description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
  applicationName: 'Protect Ontario',
  keywords: ['Ontario', 'Ford government', 'public spending', 'accountability', 'ProtectOnt.ca'],
  icons: {
    icon: [{ url: `${basePath}/favicon.png`, type: 'image/png' }],
    apple: `${basePath}/favicon.png`,
  },
  openGraph: {
    title: 'Protect Ontario — Accountability for the Ford Government',
    description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
    url: basePath || '/',
    siteName: 'Protect Ontario',
    images: [
      {
        url: `${basePath}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: 'Protect Ontario — ProtectOnt.ca — Accountability for the Ford Government',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Protect Ontario — Accountability for the Ford Government',
    description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
    images: [{ url: `${basePath}/og-image.svg`, alt: 'Protect Ontario — ProtectOnt.ca' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
}

// Get GTM ID from environment variable
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased" suppressHydrationWarning>
        {/* Google Tag Manager */}
        {GTM_ID && (
          <>
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${GTM_ID}');
                `,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ChatWidget />
        <Footer />
      </body>
    </html>
  )
}
