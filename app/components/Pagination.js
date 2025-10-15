"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Pagination({ basePath = '/', currentPage = 1, totalPages = 1 }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (totalPages <= 1) return null

  const pageNumbers = getVisiblePages(currentPage, totalPages, isMobile)

  const pageHref = (page) => {
    // Query-based pagination: preserve existing query params
    if (basePath.includes('?')) {
      const [path, queryString] = basePath.split('?')
      const params = new URLSearchParams(queryString || '')
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      const qs = params.toString()
      return qs ? `${path}?${qs}` : path
    }
    if (basePath.endsWith('/')) basePath = basePath.slice(0, -1)
    return page === 1 ? `${basePath}` : `${basePath}/${page}`
  }

  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2 mt-8 flex-wrap px-2" aria-label="Pagination">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm transition-colors whitespace-nowrap ${currentPage === 1 ? 'text-gray-500 border-gray-700 bg-gray-800/50 cursor-not-allowed pointer-events-none' : 'text-gray-100 border-gray-600 bg-gray-900 hover:border-purple-500 hover:text-white'}`}
      >
        {isMobile ? '←' : '← Prev'}
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        {pageNumbers.map((p, idx) => (
          p === '...' ? (
            <span key={idx} className="px-1 sm:px-2 text-gray-400 select-none text-xs sm:text-sm">…</span>
          ) : (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm transition-colors min-w-[32px] sm:min-w-[40px] text-center ${p === currentPage ? 'bg-purple-600 border-purple-600 text-white font-semibold' : 'text-gray-100 border-gray-600 bg-gray-900 hover:border-purple-500 hover:text-white'}`}
            >
              {p}
            </Link>
          )
        ))}
      </div>

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm transition-colors whitespace-nowrap ${currentPage === totalPages ? 'text-gray-500 border-gray-700 bg-gray-800/50 cursor-not-allowed pointer-events-none' : 'text-gray-100 border-gray-600 bg-gray-900 hover:border-purple-500 hover:text-white'}`}
      >
        {isMobile ? '→' : 'Next →'}
      </Link>
    </nav>
  )
}

function getVisiblePages(current, total, isMobile = false) {
  // Show fewer pages on mobile
  const delta = isMobile ? 1 : 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
}
