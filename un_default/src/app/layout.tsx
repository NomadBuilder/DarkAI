import type { Metadata } from "next";
import {
  Fraunces,
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
} from "next/font/google";
import { LIVE_APP_URL } from "@/lib/links";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

/** Designed for clarity — Braille Institute */
const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`${LIVE_APP_URL}/`),
  title: "Un-Default — Inclusive language review",
  description:
    "A welcoming tool to review website copy for colonial, gendered, ableist, and other excluding language — catch defaults, then rewrite with care.",
  openGraph: {
    type: "website",
    siteName: "Un-Default",
    title: "Un-Default — Inclusive language review",
    description:
      "Catch colonial, gendered, and ableist defaults in AI-written copy — locally, with public rules.",
    url: LIVE_APP_URL,
    images: [
      {
        url: "/og.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "Un-Default — inclusive language review for AI-written copy",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Un-Default — Inclusive language review",
    description:
      "Catch colonial, gendered, and ableist defaults in AI-written copy — locally, with public rules.",
    images: ["/og.jpg?v=2"],
  },
};export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
