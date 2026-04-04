import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Ben's Model Railway",
  description:
    "A life-size railway in miniature — 00 gauge model railway project featuring real-life-inspired locations",
  keywords: ["model railway", "00 gauge", "railway modelling", "Fusion 360"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚂</text></svg>"
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-body bg-railway-bg text-railway-text antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
