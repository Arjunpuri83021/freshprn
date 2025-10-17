'use client'

import Image from 'next/image'
import { useCallback, useState, useEffect } from 'react'
import { Play, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'

// Extract domain name from URL
function extractDomain(url) {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return null
  }
}

export default function VideoRedirect({ link, imageUrl, title, video }) {
  // Auto-show iframe if iframeUrl is available
  const [showIframe, setShowIframe] = useState(!!video?.iframeUrl)
  const [iframeError, setIframeError] = useState(false)
  const [useProxy, setUseProxy] = useState(false)
  const [proxyUrl, setProxyUrl] = useState('')
  const hasIframe = !!video?.iframeUrl
  const domain = extractDomain(link)

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

  // Handle iframe errors - fallback to external link
  const handleIframeError = useCallback(() => {
    console.log('⚠️ Iframe failed to load, attempting proxy...');
    setIframeError(true);
    
    // Try proxy first
    if (video?.iframeUrl && !useProxy) {
      const encodedUrl = encodeURIComponent(video.iframeUrl);
      const proxyEndpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/proxy-video?url=${encodedUrl}`;
      setProxyUrl(proxyEndpoint);
      setUseProxy(true);
      
      // Check if proxy works
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/check-video-url?url=${encodedUrl}`)
        .then(res => res.json())
        .then(data => {
          if (!data.accessible) {
            console.log('❌ Proxy also failed, redirecting to external link...');
            setTimeout(() => {
              if (link) window.location.href = link;
            }, 2000);
          }
        })
        .catch(() => {
          console.log('❌ Proxy check failed, redirecting to external link...');
          setTimeout(() => {
            if (link) window.location.href = link;
          }, 2000);
        });
    } else {
      // Proxy also failed, redirect to external link
      console.log('❌ All methods failed, redirecting to external link...');
      setTimeout(() => {
        if (link) window.location.href = link;
      }, 2000);
    }
  }, [video?.iframeUrl, link, useProxy]);

  // If iframe is available and should be shown, display it
  if (showIframe && video?.iframeUrl) {
    // Add autoplay parameter to the iframe URL if it's a YouTube or Vimeo URL
    let iframeUrl = useProxy ? proxyUrl : video.iframeUrl;
    
    if (!useProxy) {
      if (iframeUrl.includes('youtube.com') || iframeUrl.includes('youtu.be')) {
        iframeUrl = iframeUrl.includes('?') 
          ? `${iframeUrl}&autoplay=1&mute=1` 
          : `${iframeUrl}?autoplay=1&mute=1`
      } else if (iframeUrl.includes('vimeo.com')) {
        iframeUrl = iframeUrl.includes('?') 
          ? `${iframeUrl}&autoplay=1` 
          : `${iframeUrl}?autoplay=1`
      }
    }

    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        {iframeError && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-yellow-500/90 text-black px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              {useProxy 
                ? 'Video blocked. Redirecting to external site...' 
                : 'Video blocked. Trying alternative method...'}
            </span>
          </div>
        )}
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={title || 'Video player'}
          onError={handleIframeError}
        />
      </div>
    )
  }

  // Show thumbnail with play button
  return (
    <div className="relative w-full aspect-video">
      <div className="absolute inset-0 rounded-lg overflow-hidden bg-black flex items-center justify-center">
        {/* Blurred background */}
        {imageUrl && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={imageUrl}
              alt="Background"
              fill
              className="object-cover"
              style={{ filter: 'blur(40px)', opacity: 0.3 }}
              sizes="100vw"
            />
          </div>
        )}

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 md:gap-8 px-4 w-full">
          {/* Small centered thumbnail */}
          <div 
            className="video-thumbnail-preview relative rounded-lg overflow-hidden shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-200" 
            onClick={handlePlay}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || 'Video thumbnail'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800" />
            )}
            
            {/* Duration badge */}
            {video?.minutes && (
              <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black/80 text-white text-xs md:text-sm font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                {video.minutes}:00
              </div>
            )}
          </div>

          {/* Watch button */}
          {!hasIframe && domain && (
            <button
              onClick={handlePlay}
              disabled={!link}
              className="bg-white hover:bg-gray-100 text-black font-semibold text-sm md:text-base px-6 py-2.5 md:px-10 md:py-4 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Watch this video on {domain}
            </button>
          )}
        </div>
        
        {hasIframe && (
          <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-20">
            Play Here
          </div>
        )}
      </div>
    </div>
  )
}
