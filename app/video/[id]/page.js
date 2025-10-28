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
  
  // Enhanced SEO description with more detail
  let description = video?.desc || video?.metatitel || ''
  if (!description || description.length < 100) {
    const performers = Array.isArray(video?.name) && video.name.length > 0 
      ? ` featuring ${video.name.slice(0, 2).join(' and ')}` 
      : ''
    const categories = Array.isArray(video?.tags) && video.tags.length > 0 
      ? ` in ${video.tags.slice(0, 3).join(', ')}` 
      : ''
    const duration = video?.minutes ? ` This ${video.minutes} minute` : ' This'
    description = `Watch ${title}${performers}${categories} on FreshPrn.${duration} premium HD video offers high-quality entertainment with smooth streaming. Explore thousands of videos across multiple categories and discover your favorites on FreshPrn.com - free HD adult videos refreshed daily.`
  }
  
  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://freshprn.com'
  const titleSlug = slugify(title)
  const canonical = `${canonicalBase}/video/${id}${titleSlug ? `-${titleSlug}` : ''}`
  const imageUrl = video?.imageUrl || `${canonicalBase}/og-image.jpg`

  // Generate comprehensive keywords
  const keywords = [
    ...(Array.isArray(video?.tags) ? video.tags : []),
    ...(Array.isArray(video?.name) ? video.name : []),
    'freshprn', 'premium video', 'adult entertainment'
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
      siteName: 'FreshPrn',
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
      creator: '@freshprn',
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

  // Helper function to format tag/name display (replace hyphens with spaces)
  const formatDisplay = (text) => {
    if (!text) return text
    return text.replace(/-/g, ' ')
  }

  // Generate unique seed based on video ID for consistent but varied content
  const videoSeed = (video._id || id).toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Brand salt ensures FreshPrn produces different variants than other sites using similar templates
  const brandSalt = 'FreshPrn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const contentVariant = (videoSeed + brandSalt) % 5 // 5 different content variations
  
  // Tag-specific content generator
  const generateTagSpecificContent = (tags, performerName) => {
    if (!Array.isArray(tags) || tags.length === 0) return ''
    
    // Parse tags - handle both array of tags and concatenated strings
    let parsedTags = []
    for (const tag of tags) {
      if (typeof tag === 'string') {
        // Check if tag is concatenated (no spaces, multiple words)
        if (tag.length > 15 && !tag.includes(' ') && !tag.includes('-')) {
          // Try to split concatenated tags by known keywords
          const knownTags = ['doggystyle', 'missionary', 'cowgirl', 'reverse', 'amateur', 'professional', 
                            'milf', 'teen', 'bbw', 'petite', 'blonde', 'brunette', 'redhead',
                            'blowjob', 'deepthroat', 'anal', 'creampie', 'facial', 'cumshot',
                            'pov', 'outdoor', 'public', 'hardcore', 'softcore', 'threesome',
                            'gangbang', 'lesbian', 'solo', 'asian', 'ebony', 'latina', 'indian',
                            'bigtits', 'bigass', 'busty', 'sexy', 'babe', 'homemade']
          
          let remainingTag = tag.toLowerCase()
          const foundTags = []
          
          for (const knownTag of knownTags) {
            if (remainingTag.includes(knownTag)) {
              foundTags.push(knownTag)
              remainingTag = remainingTag.replace(knownTag, '')
            }
          }
          
          if (foundTags.length > 0) {
            parsedTags.push(...foundTags)
          } else {
            parsedTags.push(tag.toLowerCase())
          }
        } else {
          parsedTags.push(tag.toLowerCase())
        }
      }
    }
    
    const tagDescriptions = {
      // Position-based tags
      'doggystyle': [
        `features intense doggystyle action${performerName ? ` with ${performerName}` : ''}`,
        `showcases passionate doggystyle scenes${performerName ? ` starring ${performerName}` : ''}`,
        `includes hot doggystyle positions${performerName ? ` performed by ${performerName}` : ''}`,
        `delivers steamy doggystyle sequences${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'missionary': [
        `captures intimate missionary moments${performerName ? ` with ${performerName}` : ''}`,
        `presents classic missionary scenes${performerName ? ` starring ${performerName}` : ''}`,
        `features passionate missionary action${performerName ? ` with ${performerName}` : ''}`
      ],
      'cowgirl': [
        `showcases exciting cowgirl riding${performerName ? ` by ${performerName}` : ''}`,
        `features intense cowgirl action${performerName ? ` with ${performerName}` : ''}`,
        `includes wild cowgirl scenes${performerName ? ` starring ${performerName}` : ''}`
      ],
      'reverse cowgirl': [
        `displays thrilling reverse cowgirl action${performerName ? ` with ${performerName}` : ''}`,
        `features hot reverse cowgirl scenes${performerName ? ` performed by ${performerName}` : ''}`
      ],
      
      // Experience level tags
      'amateur': [
        `stars an authentic amateur performer${performerName ? ` - ${performerName}` : ''}`,
        `features genuine amateur content${performerName ? ` with ${performerName}` : ''}`,
        `showcases real amateur action${performerName ? ` starring ${performerName}` : ''}`,
        `presents natural amateur scenes${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'professional': [
        `stars a professional performer${performerName ? ` - ${performerName}` : ''}`,
        `features expert professional content${performerName ? ` with ${performerName}` : ''}`
      ],
      
      // Body type tags
      'milf': [
        `stars an experienced MILF${performerName ? ` - ${performerName}` : ''}`,
        `features a stunning MILF performer${performerName ? ` named ${performerName}` : ''}`,
        `showcases a gorgeous MILF${performerName ? ` - ${performerName}` : ''}`,
        `presents a sexy mature woman${performerName ? ` - ${performerName}` : ''}`
      ],
      'teen': [
        `features a young performer${performerName ? ` - ${performerName}` : ''}`,
        `stars a petite teen${performerName ? ` named ${performerName}` : ''}`,
        `showcases youthful energy${performerName ? ` with ${performerName}` : ''}`
      ],
      'bbw': [
        `stars a beautiful BBW${performerName ? ` - ${performerName}` : ''}`,
        `features a curvy performer${performerName ? ` named ${performerName}` : ''}`,
        `showcases a voluptuous beauty${performerName ? ` - ${performerName}` : ''}`
      ],
      'petite': [
        `features a petite performer${performerName ? ` - ${performerName}` : ''}`,
        `stars a small-framed beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      
      // Physical features
      'big tits': [
        `showcases impressive natural assets${performerName ? ` on ${performerName}` : ''}`,
        `features busty action${performerName ? ` with ${performerName}` : ''}`,
        `highlights voluptuous curves${performerName ? ` of ${performerName}` : ''}`
      ],
      'big ass': [
        `displays a perfect booty${performerName ? ` belonging to ${performerName}` : ''}`,
        `features amazing curves${performerName ? ` on ${performerName}` : ''}`,
        `showcases a stunning backside${performerName ? ` of ${performerName}` : ''}`
      ],
      'blonde': [
        `stars a gorgeous blonde${performerName ? ` - ${performerName}` : ''}`,
        `features a stunning blonde performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'brunette': [
        `stars a beautiful brunette${performerName ? ` - ${performerName}` : ''}`,
        `features a sexy dark-haired performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'redhead': [
        `showcases a fiery redhead${performerName ? ` - ${performerName}` : ''}`,
        `stars a stunning red-haired beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      
      // Action tags
      'blowjob': [
        `includes expert oral action${performerName ? ` by ${performerName}` : ''}`,
        `features skilled oral performance${performerName ? ` from ${performerName}` : ''}`,
        `showcases passionate oral scenes${performerName ? ` with ${performerName}` : ''}`
      ],
      'deepthroat': [
        `displays impressive deepthroat skills${performerName ? ` by ${performerName}` : ''}`,
        `features intense deepthroat action${performerName ? ` from ${performerName}` : ''}`
      ],
      'anal': [
        `includes intense anal action${performerName ? ` with ${performerName}` : ''}`,
        `features hardcore anal scenes${performerName ? ` starring ${performerName}` : ''}`,
        `showcases passionate anal play${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'creampie': [
        `culminates in a hot creampie finish${performerName ? ` for ${performerName}` : ''}`,
        `ends with an intense creampie${performerName ? ` inside ${performerName}` : ''}`,
        `features a satisfying creampie conclusion${performerName ? ` with ${performerName}` : ''}`
      ],
      'facial': [
        `finishes with a messy facial${performerName ? ` on ${performerName}` : ''}`,
        `culminates in a hot facial scene${performerName ? ` for ${performerName}` : ''}`
      ],
      'cumshot': [
        `ends with an explosive finish${performerName ? ` for ${performerName}` : ''}`,
        `features a powerful climax scene${performerName ? ` with ${performerName}` : ''}`
      ],
      
      // Setting tags
      'pov': [
        `filmed in immersive POV perspective${performerName ? ` with ${performerName}` : ''}`,
        `shot in first-person POV style${performerName ? ` featuring ${performerName}` : ''}`,
        `captured in intimate POV angles${performerName ? ` starring ${performerName}` : ''}`
      ],
      'outdoor': [
        `filmed in an exciting outdoor location${performerName ? ` with ${performerName}` : ''}`,
        `shot in a daring outdoor setting${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'public': [
        `filmed in a risky public location${performerName ? ` with ${performerName}` : ''}`,
        `shot in a daring public setting${performerName ? ` starring ${performerName}` : ''}`
      ],
      
      // Scenario tags
      'hardcore': [
        `delivers intense hardcore action${performerName ? ` with ${performerName}` : ''}`,
        `features rough and passionate scenes${performerName ? ` starring ${performerName}` : ''}`,
        `showcases extreme hardcore content${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'softcore': [
        `presents sensual softcore content${performerName ? ` with ${performerName}` : ''}`,
        `features gentle and erotic scenes${performerName ? ` starring ${performerName}` : ''}`
      ],
      'threesome': [
        `features an exciting threesome${performerName ? ` including ${performerName}` : ''}`,
        `showcases a hot three-way action${performerName ? ` with ${performerName}` : ''}`
      ],
      'gangbang': [
        `presents an intense gangbang scene${performerName ? ` featuring ${performerName}` : ''}`,
        `showcases multiple partners${performerName ? ` with ${performerName}` : ''}`
      ],
      'lesbian': [
        `features passionate girl-on-girl action${performerName ? ` with ${performerName}` : ''}`,
        `showcases intimate lesbian scenes${performerName ? ` starring ${performerName}` : ''}`
      ],
      'solo': [
        `stars a solo performance${performerName ? ` by ${performerName}` : ''}`,
        `features intimate solo action${performerName ? ` from ${performerName}` : ''}`
      ],
      
      // Ethnicity tags
      'asian': [
        `stars an exotic Asian performer${performerName ? ` - ${performerName}` : ''}`,
        `features a beautiful Asian beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      'ebony': [
        `showcases a stunning ebony performer${performerName ? ` - ${performerName}` : ''}`,
        `stars a gorgeous black beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      'latina': [
        `features a spicy Latina${performerName ? ` - ${performerName}` : ''}`,
        `stars a passionate Latina performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'indian': [
        `showcases an exotic Indian beauty${performerName ? ` - ${performerName}` : ''}`,
        `features a stunning Indian performer${performerName ? ` named ${performerName}` : ''}`
      ],
      
      // Additional descriptive tags
      'busty': [
        `showcases a busty performer${performerName ? ` - ${performerName}` : ''}`,
        `features impressive curves${performerName ? ` on ${performerName}` : ''}`,
        `highlights a well-endowed beauty${performerName ? ` - ${performerName}` : ''}`
      ],
      'sexy': [
        `stars a sexy performer${performerName ? ` - ${performerName}` : ''}`,
        `features an incredibly attractive${performerName ? ` ${performerName}` : ' performer'}`
      ],
      'babe': [
        `showcases a stunning babe${performerName ? ` - ${performerName}` : ''}`,
        `features a gorgeous performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'homemade': [
        `presents authentic homemade content${performerName ? ` with ${performerName}` : ''}`,
        `features genuine homemade footage${performerName ? ` starring ${performerName}` : ''}`,
        `showcases real homemade action${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'bigtits': [
        `showcases impressive natural assets${performerName ? ` on ${performerName}` : ''}`,
        `features busty action${performerName ? ` with ${performerName}` : ''}`
      ],
      'bigass': [
        `displays a perfect booty${performerName ? ` belonging to ${performerName}` : ''}`,
        `features amazing curves${performerName ? ` on ${performerName}` : ''}`
      ]
    }
    
    // Find matching tags and generate descriptions
    const descriptions = []
    for (const tag of parsedTags.slice(0, 3)) { // Use first 3 parsed tags
      const tagLower = tag.toLowerCase().trim()
      if (tagDescriptions[tagLower]) {
        const variants = tagDescriptions[tagLower]
        const selectedVariant = variants[videoSeed % variants.length]
        descriptions.push(selectedVariant)
      }
    }
    
    return descriptions.length > 0 ? descriptions.join(', ') : ''
  }
  
  // Natural language variations for endings
  const streamingPhrases = [
    'Watch now with instant streaming and zero interruptions.',
    'Available for immediate viewing in high definition.',
    'Stream seamlessly on any device without buffering.',
    'Enjoy uninterrupted playback in crystal clear quality.',
    'Experience smooth streaming with fast load times.'
  ]
  
  const explorePhrases = [
    `Browse our extensive ${video.tags?.[0] || 'video'} library for more content.`,
    `Check out similar videos in the ${video.tags?.[0] || 'same'} category.`,
    `Discover more ${video.tags?.[0] || 'premium'} content on FreshPrn.`,
    `Find additional ${video.tags?.[0] || 'exclusive'} videos you'll enjoy.`,
    `Explore our curated ${video.tags?.[0] || 'collection'} of related content.`
  ]
  
  // Generate tag-specific content
  const performerName = Array.isArray(video.name) && video.name.length > 0 ? video.name[0] : null
  const tagSpecificContent = generateTagSpecificContent(video.tags, performerName)
  
  // Build a short intro (max ~180 chars) for the summary preview
  const buildIntro = () => {
    const titleText = video.titel || video.title || 'Video'
    const star = Array.isArray(video.name) && video.name.length > 0 ? formatDisplay(video.name[0]) : ''
    const primaryTag = Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : ''
    let base = (video.desc && video.desc.length > 40) ? video.desc : `Watch ${titleText}${star ? ` with ${star}` : ''}${primaryTag ? ` — ${primaryTag}` : ''} on FreshPrn.`
    if (!video.desc && video.minutes) base += ` ${video.minutes} min HD.`
    base = String(base).replace(/\s+/g, ' ').trim()
    if (base.length <= 180) return base
    const trimmed = base.slice(0, 180)
    return trimmed.replace(/[,;:]?\s+\S*$/, '') + '…'
  }
  const introText = buildIntro()

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

  // Enhanced Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.titel || video.title || 'Video',
    "description": video.desc || video.metatitel || 'Watch premium video on FreshPrn',
    "thumbnailUrl": video.imageUrl || '',
    "uploadDate": video.createdAt || new Date().toISOString(),
    "duration": video.minutes ? `PT${video.minutes}M` : undefined,
    "contentUrl": video.link || '',
    "embedUrl": video.iframeUrl || undefined,
    "publisher": {
      "@type": "Organization",
      "name": "FreshPrn",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://freshprn.com'}/logo.png`
      }
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.views || 0
    },
    ...(Array.isArray(video.name) && video.name.length > 0 && {
      "actor": video.name.map(name => ({
        "@type": "Person",
        "name": name
      }))
    }),
    ...(Array.isArray(video.tags) && video.tags.length > 0 && {
      "genre": video.tags.slice(0, 5),
      "keywords": video.tags.join(', ')
    }),
    "inLanguage": "en",
    "isFamilyFriendly": false,
    "contentRating": "adult"
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{video.titel || 'Video'}</h1>

            {/* Dummy player section with redirect on play click */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/30 ring-1 ring-white/10">
              <VideoRedirect link={video.link} imageUrl={video.imageUrl} title={video.titel} video={video} />
            </div>

          {/* Quick stats */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-200">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
              {video.minutes || 'N/A'} min
            </span>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-200">
              <span className="mr-2 h-2 w-2 rounded-full bg-pink-400" />
              {Number(video.views || 0).toLocaleString()} views
            </span>
            {Array.isArray(video.createdAt) ? null : (
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-200">
                <span className="mr-2 h-2 w-2 rounded-full bg-purple-400" />
                HD Quality
              </span>
            )}
          </div>

          {/* Stars section */}
          {Array.isArray(video.name) && video.name.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Stars</h3>
              <div className="flex flex-wrap gap-2">
                {video.name.map((n, i) => (
                  <Link
                    key={i}
                    className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors"
                    href={`/pornstar/${n}`}
                  >
                    {n.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags section */}
          {Array.isArray(video.tags) && video.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {video.tags.slice(0, 20).map((t, i) => (
                  <Link
                    key={i}
                    className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-300 hover:bg-purple-500/20 transition-colors"
                    href={`/tag/${t.toLowerCase().replace(/\s+/g,'-')}`}
                  >
                    {t.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Description Section with Unique Content - 500+ words */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5">
            <h2 className="text-lg font-semibold mb-3">
              {['Video Overview', 'About This Scene', 'Content Description', 'What to Expect', 'Scene Details'][contentVariant]}
            </h2>
            {video.desc ? (
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>{video.desc}</p>
                {tagSpecificContent && (
                  <p>This scene {tagSpecificContent}. {video.minutes ? `The ${video.minutes}-minute runtime` : 'The video'} provides ample time to showcase the chemistry and action between performers.</p>
                )}
                {video.views > 1000 && (
                  <p>With {video.views.toLocaleString()} views, this has become a popular choice among viewers who appreciate quality content.</p>
                )}
                {/* FreshPrn-specific paragraph for uniqueness */}
                <p>
                  On FreshPrn, this title is curated with fast-loading playback and clean navigation in mind. Our editors surface similar
                  {Array.isArray(video.tags) && video.tags.length > 0 ? ` ${formatDisplay(video.tags[0])}` : ''} content to help you discover
                  more you’ll enjoy, while keeping the page lightweight for better mobile experience.
                </p>
              </div>
            ) : (
              <div className="text-gray-300 leading-relaxed space-y-3">
                {/* Paragraph 1: Introduction with tag-specific content */}
                <p>
                  {contentVariant === 0 && (
                    <>
                      {video.titel || 'This video'} {video.minutes ? `is a ${video.minutes}-minute scene` : 'presents a captivating scene'} 
                      {Array.isArray(video.name) && video.name.length > 0 && ` featuring ${formatDisplay(video.name[0])}`}
                      {Array.isArray(video.name) && video.name.length > 1 && ` alongside ${video.name.slice(1, 3).map(n => formatDisplay(n)).join(' and ')}`}.
                      {tagSpecificContent ? ` The video ${tagSpecificContent}.` : 
                       Array.isArray(video.tags) && video.tags.length > 0 ? ` This ${formatDisplay(video.tags[0])} content delivers exactly what fans are looking for.` : 
                       ' This premium content showcases professional production quality.'}
                    </>
                  )}
                  {contentVariant === 1 && (
                    <>
                      In this {video.minutes ? `${video.minutes}-minute` : 'extended'} video titled {video.titel || 'this scene'},
                      {Array.isArray(video.name) && video.name.length > 0 ? ` ${formatDisplay(video.name[0])} takes center stage` : ' viewers are treated to premium entertainment'}.
                      {tagSpecificContent ? ` The scene ${tagSpecificContent}.` : 
                       Array.isArray(video.tags) && video.tags.length > 0 ? ` The ${formatDisplay(video.tags[0])} elements are expertly captured throughout.` : 
                       ' The production values and performance quality stand out immediately.'}
                    </>
                  )}
                  {contentVariant === 2 && (
                    <>
                      {video.titel || 'This exclusive scene'} brings together 
                      {Array.isArray(video.name) && video.name.length > 0 ? ` ${formatDisplay(video.name[0])}` : ' talented performers'}
                      {video.minutes && ` for ${video.minutes} minutes of captivating content`}.
                      {tagSpecificContent ? ` This video ${tagSpecificContent}.` : 
                       Array.isArray(video.tags) && video.tags.length > 0 ? ` The ${formatDisplay(video.tags[0])} category is well-represented here.` : 
                       ' The chemistry between performers creates an engaging viewing experience.'}
                    </>
                  )}
                  {contentVariant === 3 && (
                    <>
                      Viewers seeking {Array.isArray(video.tags) && video.tags.length > 0 ? `${formatDisplay(video.tags[0])} content` : 'quality entertainment'} will find 
                      {video.titel || 'this video'} particularly satisfying.
                      {Array.isArray(video.name) && video.name.length > 0 && ` ${formatDisplay(video.name[0])} delivers a memorable performance`}
                      {video.minutes && ` across ${video.minutes} minutes`}.
                      {tagSpecificContent ? ` The production ${tagSpecificContent}.` : ' The scene unfolds naturally with authentic interactions.'}
                    </>
                  )}
                  {contentVariant === 4 && (
                    <>
                      {video.titel || 'This scene'} offers {video.minutes ? `${video.minutes} minutes` : 'an extended runtime'} of 
                      {Array.isArray(video.tags) && video.tags.length > 0 ? ` ${formatDisplay(video.tags[0])}` : ' premium'} entertainment.
                      {Array.isArray(video.name) && video.name.length > 0 && ` Featuring ${formatDisplay(video.name[0])},`} 
                      {tagSpecificContent ? ` the video ${tagSpecificContent}.` : ' the content maintains high production standards throughout.'}
                    </>
                  )}
                </p>

                {/* Paragraph 2: Tag-based detailed description */}
                <p>
                  {Array.isArray(video.tags) && video.tags.length > 0 ? (
                    <>
                      The scene incorporates {video.tags.length > 1 ? 'multiple elements including' : 'elements of'} {video.tags.slice(0, 3).map(t => formatDisplay(t)).join(', ')}
                      {video.tags.length > 3 && `, along with ${video.tags.slice(3, 5).map(t => formatDisplay(t)).join(' and ')}`}.
                      {video.tags.some(t => ['doggystyle', 'cowgirl', 'missionary', 'reverse'].some(pos => t.toLowerCase().includes(pos))) && 
                        ' Various positions are showcased throughout, providing visual variety and maintaining viewer engagement.'}
                      {video.tags.some(t => ['pov', 'closeup'].some(style => t.toLowerCase().includes(style))) && 
                        ' The camera work captures intimate angles that enhance the viewing experience.'}
                      {video.tags.some(t => ['creampie', 'facial', 'cumshot'].some(finish => t.toLowerCase().includes(finish))) && 
                        ' The scene builds to a satisfying conclusion that delivers on viewer expectations.'}
                    </>
                  ) : (
                    'The video maintains professional production quality with attention to lighting, camera angles, and pacing that keeps viewers engaged from start to finish.'
                  )}
                </p>

                {/* Paragraph 3: Performer and performance quality */}
                <p>
                  {Array.isArray(video.name) && video.name.length > 0 ? (
                    <>
                      {formatDisplay(video.name[0])}'s performance demonstrates {video.tags.some(t => t.toLowerCase().includes('amateur')) ? 'authentic energy and natural chemistry' : 'professional expertise and engaging screen presence'}.
                      {video.name.length > 1 && ` The dynamic between ${formatDisplay(video.name[0])} and ${formatDisplay(video.name[1])} creates genuine chemistry that elevates the entire scene.`}
                      {video.tags.some(t => ['blonde', 'brunette', 'redhead', 'asian', 'ebony', 'latina'].some(attr => t.toLowerCase().includes(attr))) && 
                        ' Their physical attributes and performance style complement each other perfectly.'}
                    </>
                  ) : (
                    'The performers bring authentic energy to their roles, creating a scene that feels genuine rather than overly scripted. Their chemistry is evident throughout the runtime.'
                  )}
                  {video.minutes > 20 && ' The extended length allows for proper buildup and multiple sequences, avoiding the rushed pacing common in shorter content.'}
                  {video.minutes <= 20 && video.minutes > 10 && ' The runtime is perfectly balanced, providing enough content without unnecessary padding.'}
                </p>

                {/* Paragraph 4: Technical quality and viewing experience */}
                <p>
                  Shot in high definition, the video offers crystal-clear visuals that capture every detail.
                  {video.tags.some(t => t.toLowerCase().includes('homemade')) ? 
                    ' The homemade aesthetic adds authenticity while maintaining good technical quality.' : 
                    ' Professional lighting and camera work ensure optimal viewing quality throughout.'}
                  {video.tags.some(t => t.toLowerCase().includes('pov')) && 
                    ' The POV perspective creates an immersive experience that puts viewers right in the action.'}
                  The audio quality is clear, capturing natural sounds without distracting background noise.
                  {video.minutes > 15 && ' Multiple camera angles provide variety and showcase the action from different perspectives.'}
                </p>

                {/* Paragraph 5: Popularity and viewer reception */}
                <p>
                  {video.views > 10000 ? (
                    `This video has attracted over ${video.views.toLocaleString()} views, making it one of the more popular scenes in its category. The high view count reflects its quality and appeal to viewers seeking this type of content.`
                  ) : video.views > 5000 ? (
                    `With ${video.views.toLocaleString()} views, this scene has gained solid traction among viewers. The growing popularity indicates strong viewer satisfaction and repeat viewing.`
                  ) : video.views > 1000 ? (
                    `Having reached ${video.views.toLocaleString()} views, this video is steadily building an audience. Early viewers have responded positively to the content and performance quality.`
                  ) : (
                    'As a newer addition, this video offers fresh content for viewers looking to discover new scenes and performers. Early viewers can enjoy content before it becomes widely popular.'
                  )}
                  {Array.isArray(video.tags) && video.tags.length > 0 && ` Fans of ${formatDisplay(video.tags[0])} content will find this particularly appealing.`}
                </p>
                {/* FreshPrn-specific paragraph for uniqueness */}
                <p>
                  FreshPrn focuses on efficient browsing and relevant suggestions. After watching, check the related grid below for handpicked
                  videos with similar themes and performers. Our goal is a fast, clean experience without unnecessary clutter.
                </p>
              </div>
            )}
          </div>
          
          {/* Additional Content for SEO - Collapsible for better UX */}
          <div className="mt-6">
            <details className="group">
              <summary className="cursor-pointer list-none flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium py-3 px-4 bg-gray-800 rounded-lg">
                <span className="group-open:hidden">▶ Show More Details</span>
                <span className="hidden group-open:inline">▼ Hide Details</span>
              </summary>
              
              <div className="mt-4 space-y-4">
              {/* Category Information - Unique per video */}
              {Array.isArray(video.tags) && video.tags.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-2 text-purple-400">
                    {[
                      video.tags.length === 1 ? 'Category Focus' : video.tags.length === 2 ? 'Dual Categories' : 'Content Categories',
                      video.tags.length === 1 ? 'Genre' : video.tags.length === 2 ? 'Combined Themes' : 'Multiple Themes',
                      video.tags.length === 1 ? 'Content Type' : video.tags.length === 2 ? 'Category Blend' : 'Diverse Content',
                      video.tags.length === 1 ? 'Category Details' : video.tags.length === 2 ? 'Theme Combination' : 'Content Variety',
                      video.tags.length === 1 ? 'Genre Information' : video.tags.length === 2 ? 'Blended Categories' : 'Tag Overview'
                    ][contentVariant]}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {video.tags.length === 1 ? (
                      `This ${video.minutes || ''} minute video focuses on ${formatDisplay(video.tags[0])} content. The single-category approach allows for concentrated attention on this specific theme, delivering exactly what viewers seeking ${formatDisplay(video.tags[0])} material are looking for.`
                    ) : video.tags.length === 2 ? (
                      `Combining ${formatDisplay(video.tags[0])} and ${formatDisplay(video.tags[1])} elements, this ${video.minutes || ''} minute scene offers viewers the best of both themes. The dual-category approach provides variety while maintaining focus on these complementary styles.`
                    ) : (
                      `This video encompasses ${video.tags.length} different categories: ${video.tags.slice(0, 3).map(t => formatDisplay(t)).join(', ')}${video.tags.length > 3 ? `, ${video.tags.slice(3, 5).map(t => formatDisplay(t)).join(', ')}` : ''} and more. The multi-category nature means diverse content that appeals to viewers with varied preferences. ${video.tags.length > 5 ? `The ${video.tags.length} tags indicate particularly versatile content.` : ''}`
                    )}
                    {' '}Similar videos in the {formatDisplay(video.tags[0])} category offer additional viewing options.
                  </p>
                </div>
              )}

              {/* Performer Information - Highly Dynamic */}
              {Array.isArray(video.name) && video.name.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-md font-semibold mb-2 text-pink-400">
                    {[
                      video.name.length === 1 ? 'Starring' : video.name.length === 2 ? 'Cast Duo' : 'Ensemble Cast',
                      video.name.length === 1 ? 'Lead Performer' : video.name.length === 2 ? 'Featured Pair' : 'Multiple Performers',
                      video.name.length === 1 ? 'Solo Performance' : video.name.length === 2 ? 'Dynamic Duo' : 'Cast Members',
                      video.name.length === 1 ? 'Featured Talent' : video.name.length === 2 ? 'Performer Pairing' : 'Full Cast',
                      video.name.length === 1 ? 'Main Star' : video.name.length === 2 ? 'Co-Stars' : 'Performer Lineup'
                    ][contentVariant]}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {video.name.length === 1 ? (
                      `${video.name[0]} takes the lead role in this ${video.minutes || ''} minute scene. With experience in ${Array.isArray(video.tags) && video.tags.length > 0 ? video.tags.slice(0, 2).join(' and ') : 'various categories'}, their performance showcases strong screen presence and natural chemistry. ${video.views > 2000 ? `The ${video.views.toLocaleString()} view count reflects positive audience reception of this performance.` : `This represents quality work from an established performer.`}`
                    ) : video.name.length === 2 ? (
                      `${formatDisplay(video.name[0])} and ${formatDisplay(video.name[1])} share the screen in this ${video.minutes || ''} minute scene. Their pairing creates strong on-screen dynamics, particularly evident in the ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'featured'} sequences. The collaboration highlights each performer's strengths.`
                    ) : (
                      `The cast includes ${video.name.slice(0, 2).join(', ')}, ${video.name[2]}${video.name.length > 3 ? `, plus ${video.name.length - 3} additional performers` : ''}. This ${video.minutes || ''} minute production benefits from the ensemble approach. ${video.views > 3000 ? `With ${video.views.toLocaleString()} views, the multi-performer format has proven popular.` : 'Each cast member contributes distinct energy to the overall scene.'} Additional content from these performers is available through their profile pages.`
                    )}
                  </p>
                </div>
              )}

              {/* Video Stats & Popularity - Unique per video */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-2 text-blue-400">
                  {[
                    video.views > 10000 ? 'High Viewership' : video.views > 5000 ? 'Growing Popularity' : video.views > 1000 ? 'Gaining Traction' : 'New Release',
                    video.views > 10000 ? 'Top Performer' : video.views > 5000 ? 'Fan Favorite' : video.views > 1000 ? 'Building Audience' : 'Fresh Upload',
                    video.views > 10000 ? 'Trending Now' : video.views > 5000 ? 'Popular Selection' : video.views > 1000 ? 'Rising Views' : 'Latest Addition',
                    video.views > 10000 ? 'Most Watched' : video.views > 5000 ? 'Viewer Choice' : video.views > 1000 ? 'Steady Growth' : 'Recent Content',
                    video.views > 10000 ? 'Highly Rated' : video.views > 5000 ? 'Community Pick' : video.views > 1000 ? 'Emerging Hit' : 'New Arrival'
                  ][contentVariant]}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {video.views > 10000 ? (
                    `With ${video.views.toLocaleString()} views, this ranks among the most-watched content in its category. The ${video.minutes || ''} minute duration provides substantial entertainment value that has resonated with a large audience. The high view count indicates strong viewer satisfaction and repeat watching.`
                  ) : video.views > 5000 ? (
                    `Currently at ${video.views.toLocaleString()} views, this ${video.minutes || ''} minute scene has gained solid traction. ${Array.isArray(video.name) && video.name.length > 0 ? `${video.name[0]}'s performance` : 'The content quality'} has contributed to its growing popularity among viewers seeking this type of material.`
                  ) : video.views > 1000 ? (
                    `This ${video.minutes || ''} minute video has reached ${video.views.toLocaleString()} views from viewers interested in ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'quality'} content. The steady view growth suggests positive word-of-mouth and viewer recommendations.`
                  ) : (
                    `As a recent addition with current views at ${video.views || 'under 1,000'}, this ${video.minutes || ''} minute video offers fresh content ${Array.isArray(video.name) && video.name.length > 0 ? `from ${video.name[0]}` : 'for viewers'}. Early viewers have the opportunity to discover new material before it gains wider attention.`
                  )}
                </p>
              </div>

              {/* What Makes This Video Special - Unique combinations */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-2 text-green-400">
                  {[
                    'Unique Aspects',
                    'Standout Features',
                    'Key Highlights',
                    'Notable Elements',
                    'Special Qualities'
                  ][contentVariant]}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {Array.isArray(video.tags) && video.tags.length > 0 && Array.isArray(video.name) && video.name.length > 0 ? (
                    `The pairing of ${video.tags.slice(0, 2).map(t => formatDisplay(t)).join(' and ')} content with ${video.name.length > 1 ? `${formatDisplay(video.name[0])} and ${formatDisplay(video.name[1])}` : formatDisplay(video.name[0])} offers a distinctive viewing experience. `
                  ) : Array.isArray(video.tags) && video.tags.length > 0 ? (
                    `This ${formatDisplay(video.tags[0])} content distinguishes itself through ${video.minutes > 30 ? 'substantial runtime' : video.minutes > 15 ? 'optimal duration' : 'efficient pacing'} and strong production values. `
                  ) : ''}
                  {video.minutes > 30 ? (
                    `The ${video.minutes}-minute length allows for comprehensive scene development with multiple sequences and natural progression.`
                  ) : video.minutes > 15 ? (
                    `At ${video.minutes} minutes, the duration strikes an ideal balance between thorough content and viewer attention span.`
                  ) : video.minutes > 0 ? (
                    `The ${video.minutes}-minute runtime focuses on core content without extended preliminaries, appealing to viewers who prefer direct action.`
                  ) : (
                    'The pacing maintains viewer engagement through thoughtful scene composition and timing.'
                  )}
                  {' '}The video is available for immediate viewing in high definition format.
                </p>
              </div>
              </div>
            </details>
          </div>
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
