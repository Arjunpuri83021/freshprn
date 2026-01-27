"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppFrame({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {isAdmin && (
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
      )}
      {!isAdmin && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAdmin && <Footer />}

      {!isAdmin && (
        <>
          <Script
            src="//pl23903697.revenuecpmgate.com/5f/0a/3d/5f0a3dbfe0494732a6f51e9f464470b1.js"
            strategy="afterInteractive"
          />
          <Script
            src="//pl23903471.revenuecpmgate.com/26/ce/da/26ceda18834199e5759604d14f16cf08.js"
            strategy="afterInteractive"
          />
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
                name: "FreshPrn",
                url: process.env.NEXT_PUBLIC_SITE_URL || "https://freshprn.com",
                description: "Free HD adult videos with trending categories and top stars",
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://freshprn.com"}/search?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
        </>
      )}
    </div>
  );
}
