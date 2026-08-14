import type { Metadata } from "next";
import {
  Fraunces,
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
} from "next/font/google";
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
  title: "Un-Default — Inclusive language review",
  description:
    "A welcoming tool to review website copy for colonial, gendered, ableist, and other excluding language — catch defaults, then rewrite with care.",
};

export default function RootLayout({
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
