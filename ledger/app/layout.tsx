import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'

// Get basePath for favicon and OG image paths
const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || ''
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://darkai.ca'
const ogImageUrl = `${siteUrl}${basePath}/og-image.svg`

export const metadata: Metadata = {
  title: 'The Ledger — Ontario\'s Quiet Privatization (Americanization)',
  description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
  icons: {
    icon: `${basePath}/favicon.svg`,
    apple: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: 'The Ledger — Ontario\'s Quiet Privatization (Americanization)',
    description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
    url: `${siteUrl}${basePath}`,
    siteName: 'The Ledger',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'The Ledger — Ontario\'s Quiet Privatization (Americanization)',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Ledger — Ontario\'s Quiet Privatization (Americanization)',
    description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
    images: [ogImageUrl],
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
      </body>
    </html>
  )
}
