'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import { Play } from 'lucide-react'
import { api } from '../lib/api'

export default function VideoRedirect({ link, imageUrl, title, video }) {
  // Auto-show iframe if iframeUrl is available
  const [showIframe, setShowIframe] = useState(!!video?.iframeUrl)
  const hasIframe = !!video?.iframeUrl

  const handlePlay = useCallback(async () => {
    if (!showIframe && hasIframe) {
      setShowIframe(true)
    }
    
    // Update views in background (don't wait for response)
    if (video && (video._id || video.id)) {
      try {
        const videoId = video._id || video.id
        const currentViews = parseInt(video.views) || 0
        
        api.updateViews(videoId, currentViews).catch(error => {
          console.log('Failed to update views:', error)
        })
      } catch (error) {
        console.log('Error updating views:', error)
      }
    }

    // If no iframe URL, redirect to external link
    if (!hasIframe && link) {
      window.location.href = link
    }
  }, [link, video, hasIframe, showIframe])

  // If iframe is available and should be shown, display it
  if (showIframe && video?.iframeUrl) {
    // Add autoplay parameter to the iframe URL if it's a YouTube or Vimeo URL
    let iframeUrl = video.iframeUrl
    if (iframeUrl.includes('youtube.com') || iframeUrl.includes('youtu.be')) {
      iframeUrl = iframeUrl.includes('?') 
        ? `${iframeUrl}&autoplay=1&mute=1` 
        : `${iframeUrl}?autoplay=1&mute=1`
    } else if (iframeUrl.includes('vimeo.com')) {
      iframeUrl = iframeUrl.includes('?') 
        ? `${iframeUrl}&autoplay=1` 
        : `${iframeUrl}?autoplay=1`
    }

    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={title || 'Video player'}
        />
      </div>
    )
  }

  // Show thumbnail with play button
  return (
    <div className="relative">
      <div className="relative video-container rounded-lg overflow-hidden bg-black">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || 'Video thumbnail'}
            fill
            className="object-cover opacity-70"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        <button
          onClick={handlePlay}
          disabled={!link && !hasIframe}
          className="absolute inset-0 m-auto flex items-center justify-center group"
          aria-label="Play video"
          title={link || hasIframe ? 'Play video' : 'No video available'}
        >
          <span className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-200 ${(link || hasIframe) ? 'bg-white/20 hover:bg-white/30 group-hover:scale-110' : 'bg-gray-600 cursor-not-allowed'}`}>
            <Play className="w-8 h-8 text-white ml-1" />
          </span>
        </button>
        
        {hasIframe && (
          <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Play Here
          </div>
        )}
      </div>
    </div>
  )
}
