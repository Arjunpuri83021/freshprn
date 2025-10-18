import { api } from '../../lib/api'
import Link from 'next/link'
import VideoRedirect from '../../components/VideoRedirect'
import VideoCard from '../../components/VideoCard'
import Pagination from '../../components/Pagination'

export const revalidate = 60

function extractMongoId(maybe) {
  if (!maybe || typeof maybe !== 'string') return maybe
  const m = maybe.match(/[a-f0-9]{24}/i)
  return m ? m[0] : maybe
}

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export async function generateMetadata({ params }) {
  const raw = params.id
  const id = extractMongoId(raw)
  let video
  try {
    video = await api.getVideoById(id)
  } catch (e) {
    // ignore
  }

  const title = video?.titel || video?.title || 'Video'
  const description = video?.desc || video?.metatitel || 'Watch premium video on Hexmy.'
  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://hexmy.com'
  const titleSlug = slugify(title)
  const canonical = `${canonicalBase}/video/${id}${titleSlug ? `-${titleSlug}` : ''}`
  const imageUrl = video?.imageUrl || `${canonicalBase}/og-image.jpg`

  // Generate comprehensive keywords
  const keywords = [
    ...(Array.isArray(video?.tags) ? video.tags : []),
    ...(Array.isArray(video?.name) ? video.name : []),
    'hexmy', 'premium video', 'adult entertainment'
  ].filter(Boolean).join(', ')

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Hexmy',
      type: 'video.other',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      videos: video?.iframeUrl ? [
        {
          url: video.iframeUrl,
          width: 1280,
          height: 720,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@hexmy',
    },
    other: {
      'video:duration': video?.minutes ? `${video.minutes * 60}` : undefined,
      'video:release_date': video?.createdAt || undefined,
    }
  }
}

export default async function VideoDetailPage({ params, searchParams }) {
  const raw = params.id
  const id = extractMongoId(raw)
  let video = null
  try {
    video = await api.getVideoById(id)
  } catch (e) {
    // ignore
  }

  if (!video) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-semibold mb-4">Video not found</h1>
        <Link className="text-purple-500" href="/">Go back home</Link>
      </div>
    )
  }

  // Determine tags list for related videos
  const videoTags = Array.isArray(video.tags) ? video.tags.filter(Boolean) : []

  // Related videos with pagination from query param `page`
  const relatedPage = Number(searchParams?.page || 1)

  // Strategy: fetch top N from each tag, merge, de-duplicate, sort, then paginate locally
  let mergedRelated = []
  if (videoTags.length > 0) {
    try {
      const perTagLimit = 50 // adjust if needed
      const results = await Promise.all(
        videoTags.map((t) => api.getPostsByTag(t, 1, perTagLimit).catch(() => ({ records: [], data: [] })))
      )
      const combined = results.flatMap(r => r.records || r.data || [])
      // De-duplicate by _id and exclude current video
      const uniqMap = new Map()
      for (const item of combined) {
        const idStr = String(item._id || '')
        if (!idStr || idStr === String(video._id || id)) continue
        if (!uniqMap.has(idStr)) uniqMap.set(idStr, item)
      }
      mergedRelated = Array.from(uniqMap.values())
      // Sort by createdAt desc if present, else by views desc
      mergedRelated.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (aTime !== 0 || bTime !== 0) return bTime - aTime
        return (b.views || 0) - (a.views || 0)
      })
    } catch (e) {}
  }

  const pageSize = 16
  const totalRelated = mergedRelated.length
  const totalRelatedPages = Math.max(1, Math.ceil(totalRelated / pageSize))
  const pagedRelated = mergedRelated.slice((relatedPage - 1) * pageSize, relatedPage * pageSize)

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.titel || video.title || 'Video',
    "description": video.desc || video.metatitel || 'Watch premium video on Hexmy',
    "thumbnailUrl": video.imageUrl || '',
    "uploadDate": video.createdAt || new Date().toISOString(),
    "duration": video.minutes ? `PT${video.minutes}M` : undefined,
    "contentUrl": video.link || '',
    "embedUrl": video.iframeUrl || undefined,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.views || 0
    }
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {relatedPage === 1 && (
          <>
            <h1 className="text-2xl font-semibold mb-4">{video.titel || 'Video'}</h1>

            {/* Dummy player section with redirect on play click */}
            <VideoRedirect link={video.link} imageUrl={video.imageUrl} title={video.titel} video={video} />

          {/* Meta info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <div><span className="text-gray-400">Duration:</span> {video.minutes || 'N/A'} min</div>
              <div><span className="text-gray-400">Views:</span> {video.views || 0}</div>
              {Array.isArray(video.name) && video.name.length > 0 && (
                <div className="mt-2">
                  <span className="text-gray-400">Pornstars:</span>{' '}
                  {video.name.map((n, i) => (
                    <Link key={i} className="text-pink-400 hover:text-pink-300 mr-2" href={`/pornstar/${n}`}>{n}</Link>
                  ))}
                </div>
              )}
            </div>
            <div>
              {Array.isArray(video.tags) && video.tags.length > 0 && (
                <div className="mt-2">
                  <span className="text-gray-400">Tags:</span>{' '}
                  {video.tags.slice(0, 10).map((t, i) => (
                    <Link key={i} className="text-purple-400 hover:text-purple-300 mr-2" href={`/tag/${t.toLowerCase().replace(/\s+/g,'-')}`}>{t}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {video.desc && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-300 leading-relaxed">{video.desc}</p>
            </div>
          )}
        </>
      )}

      {/* Related Videos */}
      {videoTags.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Related Videos</h2>
            <div className="text-sm text-gray-400">{totalRelated} results</div>
          </div>
          <div className="grid video-grid">
            {pagedRelated.map((v, idx) => (
              <VideoCard key={v._id || idx} video={v} />
            ))}
          </div>
          <Pagination basePath={`/video/${id}-${slugify(video?.titel || video?.title || '')}?`} currentPage={relatedPage} totalPages={totalRelatedPages} />
        </div>
      )}
      </div>
    </>
  )
}
