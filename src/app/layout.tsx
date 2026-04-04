import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import DisclaimerBanner from "@/components/DisclaimerBanner";

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
        <Script
          id="banner-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var dismissed = localStorage.getItem('railway-disclaimer-dismissed');
                document.documentElement.style.setProperty('--banner-h', dismissed ? '0px' : '48px');
              })();
            `,
          }}
        />
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          strategy="lazyOnload"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚂</text></svg>"
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-body bg-railway-bg text-railway-text antialiased`}
        style={{ paddingTop: "var(--banner-h, 48px)" }}
      >
        <DisclaimerBanner />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
