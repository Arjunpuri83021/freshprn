import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'FreshPrn - Free HD Adult Videos',
    template: '%s | FreshPrn'
  },
  description: 'Stream free HD adult videos featuring trending categories and top stars. Fresh content added daily for a fast, clean experience.',
  keywords: 'free porn, hd porn videos, adult videos, streaming',
  authors: [{ name: 'FreshPrn' }],
  creator: 'FreshPrn',
  publisher: 'FreshPrn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://freshprn.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://freshprn.com',
    siteName: 'FreshPrn',
    title: 'FreshPrn - Free HD Adult Videos',
    description: 'Stream free HD adult videos featuring trending categories and top stars. Fresh content added daily.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FreshPrn - Free HD Adult Videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreshPrn - Free HD Adult Videos',
    description: 'Stream free HD adult videos featuring trending categories and top stars. Fresh content added daily.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'xjQ5CqFSirEhMpT2XRcZG-4SMMOCqjWXv3gUX0muLvc',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        {/* Global Ad Scripts */}
        <Script src="//pl23903697.revenuecpmgate.com/5f/0a/3d/5f0a3dbfe0494732a6f51e9f464470b1.js" strategy="afterInteractive" />
        <Script src="//pl23903471.revenuecpmgate.com/26/ce/da/26ceda18834199e5759604d14f16cf08.js" strategy="afterInteractive" />
        <Script id="ad-snrxhp" strategy="afterInteractive">{`
          (function(snrxhp){
            var d = document,
                s = d.createElement('script'),
                l = d.scripts[d.scripts.length - 1];
            s.settings = snrxhp || {};
            s.src = "//greatcomfortable.com/c.D/9J6GbH2L5mlWS/WpQr9yN/T-QM4/MAD-gl0/M/iA0k1WNyDEg_wdOkDRQvzB";
            s.async = true;
            s.referrerPolicy = 'no-referrer-when-downgrade';
            l.parentNode.insertBefore(s, l);
          })({});
        `}</Script>
        <Script id="ad-fajt" strategy="afterInteractive">{`
          (function(fajt){
            var d = document,
                s = d.createElement('script'),
                l = d.scripts[d.scripts.length - 1];
            s.settings = fajt || {};
            s.src = "//greatcomfortable.com/c/Dx9.6WbE2r5vl/SmWfQR9SNKT/Q/3AM_z/Qh0JMOC/0/1TNEDucvzlN/D/Qwxn";
            s.async = true;
            s.referrerPolicy = 'no-referrer-when-downgrade';
            l.parentNode.insertBefore(s, l);
          })({});
        `}</Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "FreshPrn",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://freshprn.com",
              "description": "Free HD adult videos with trending categories and top stars",
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${process.env.NEXT_PUBLIC_SITE_URL || "https://freshprn.com"}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  )
}
