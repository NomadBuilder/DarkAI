import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import Footer from '@/components/Footer'

const CANONICAL_SITE_URL = 'https://protectont.ca'
const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || ''

const isStaticExport =
  process.env.NODE_ENV === 'production' || process.env.STATIC_EXPORT === 'true'

/** Absolute OG image URL — never relative (avoids localhost in social crawlers). */
const OG_IMAGE_URL = `${CANONICAL_SITE_URL}${basePath}/og-image.png`

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  (isStaticExport ? CANONICAL_SITE_URL : '')
)

const metadataBase = siteUrl ? new URL(siteUrl) : new URL(CANONICAL_SITE_URL)

export const metadata: Metadata = {
  metadataBase,
  title: 'Protect Ontario — Public accountability in Ontario',
  description:
    'An interactive visualization of how public money in Ontario has shifted toward private, for-profit delivery—and how to track protests, policy, and public land.',
  applicationName: 'Protect Ontario',
  keywords: ['Ontario', 'provincial government', 'public spending', 'accountability', 'ProtectOnt.ca'],
  icons: {
    icon: [{ url: `${basePath}/favicon.png`, type: 'image/png' }],
    apple: `${basePath}/favicon.png`,
  },
  openGraph: {
    title: 'Protect Ontario — Public accountability in Ontario',
    description:
      'An interactive visualization of how public money in Ontario has shifted toward private, for-profit delivery—and how to track protests, policy, and public land.',
    url: CANONICAL_SITE_URL,
    siteName: 'Protect Ontario',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Protect Ontario — ProtectOnt.ca — Public accountability in Ontario',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Protect Ontario — Public accountability in Ontario',
    description:
      'An interactive visualization of how public money in Ontario has shifted toward private, for-profit delivery—and how to track protests, policy, and public land.',
    images: [{ url: OG_IMAGE_URL, alt: 'Protect Ontario — ProtectOnt.ca' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''
const GA_MEASUREMENT_ID = 'G-8BG6J9ZMF7'
const CLARITY_PROJECT_ID = 'x8hmusnmmu'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased" suppressHydrationWarning>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4-gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
            `,
          }}
        />
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
        <Footer />
      </body>
    </html>
  )
}
