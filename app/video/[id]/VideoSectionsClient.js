'use client'

import { useMemo, useState } from 'react'

export default function VideoSectionsClient({ videoDetails, comments, moreDetails }) {
  const tabs = useMemo(
    () => [
      { key: 'details', label: 'Video Details', color: 'purple' },
      { key: 'comments', label: 'Comments', color: 'pink' },
      { key: 'more', label: 'Show More Details', color: 'blue' },
    ],
    []
  )

  const [active, setActive] = useState(null)

  const renderActive = () => {
    if (active === 'details') return videoDetails
    if (active === 'comments') return comments
    if (active === 'more') return moreDetails
    return null
  }

  return (
    <div className="mt-6">
      <div className="video-sections-scroll flex flex-row flex-nowrap gap-3 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = active === t.key

          const base =
            'shrink-0 inline-flex items-center justify-center rounded-lg border px-4 py-3 font-medium transition-colors'

          const styles =
            t.color === 'purple'
              ? isActive
                ? 'border-purple-500/60 bg-purple-500/20 text-purple-200'
                : 'border-gray-700 bg-gray-800/50 text-purple-400 hover:text-purple-300'
              : t.color === 'pink'
                ? isActive
                  ? 'border-pink-500/60 bg-pink-500/20 text-pink-200'
                  : 'border-gray-700 bg-gray-800/50 text-pink-400 hover:text-pink-300'
                : isActive
                  ? 'border-blue-500/60 bg-blue-500/20 text-blue-200'
                  : 'border-gray-700 bg-gray-800/50 text-blue-400 hover:text-blue-300'

          return (
            <button
              key={t.key}
              type="button"
              className={`${base} ${styles}`}
              onClick={() => setActive((prev) => (prev === t.key ? null : t.key))}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <style jsx>{`
        .video-sections-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.06);
        }
        .video-sections-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .video-sections-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
        }
        .video-sections-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.22);
          border-radius: 9999px;
        }
        .video-sections-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.32);
        }
      `}</style>

      {active && (
        <div className="mt-4 w-full">
          <div className="w-full rounded-lg border border-gray-700 bg-gray-800/30 p-4">
            {renderActive()}
          </div>
        </div>
      )}
    </div>
  )
}
