'use client'

import Link from 'next/link'

export default function Logo({ href = '/', size = 'md', subtitle = true }) {
  // Sizes for the text and emblem
  const sizes = {
    sm: { emblem: 28, title: 'text-lg', subtitle: 'text-[9px]' },
    md: { emblem: 36, title: 'text-xl', subtitle: 'text-[10px]' },
    lg: { emblem: 44, title: 'text-2xl', subtitle: 'text-[11px]' },
  }
  const s = sizes[size] || sizes.md

  return (
    <Link href={href} className="flex items-center space-x-2 select-none">
      {/* Emblem: folded page with cut corner (brand mark) */}
      <svg
        width={s.emblem}
        height={s.emblem}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_8px_rgba(236,72,153,0.25)]"
        aria-label="FreshPrn logo"
      >
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#06b6d4"/>
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee"/>
            <stop offset="100%" stopColor="#10b981"/>
          </linearGradient>
          {/* Mask to carve the inner hole of the P */}
          <mask id="pmask">
            <rect x="0" y="0" width="64" height="64" fill="#fff" />
            <circle cx="40" cy="28" r="6" fill="#000" />
          </mask>
        </defs>
        {/* base sheet */}
        <path d="M10 6h30l14 14v34a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="url(#g1)"/>
        {/* folded corner */}
        <path d="M40 6v14a4 4 0 0 0 4 4h14L40 6z" fill="white" fillOpacity="0.9"/>
        {/* FP monogram */}
        {/* Shared F/P vertical stem */}
        <rect x="18" y="18" width="8" height="28" rx="2" fill="url(#g2)"/>
        {/* F top and mid bars */}
        <rect x="26" y="18" width="18" height="8" rx="2" fill="url(#g2)"/>
        <rect x="26" y="30" width="12" height="8" rx="2" fill="url(#g2)"/>
        {/* P bowl with inner cut using mask */}
        <rect x="26" y="18" width="18" height="20" rx="10" fill="url(#g2)" mask="url(#pmask)"/>
      </svg>

      {/* Wordmark: FRESH (blue) PRN (teal), uppercase */}
      <div className="leading-tight">
        <div className={`${s.title} font-extrabold tracking-wide`}> 
          <span className="text-[#1d4ed8]">FRESH</span>
          <span className="text-[#10b981]">PRN</span>
        </div>
        {subtitle && (
          <div className={`${s.subtitle} text-gray-400 tracking-[0.25em] -mt-0.5`}>
            F R E S H P R N . C O M
          </div>
        )}
      </div>
    </Link>
  )
}
