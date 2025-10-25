import { api } from '../lib/api'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export const metadata = {
  title: 'Hexmy Desi49 SxyPrn & BF Sex Videos | IndianGaySite & Hexmy on Hexmy',
  description: 'desi 52 com desi 49 com dehati sex dasi sex blueflim boyfriendtv com bollywood sex bf sexy indiangaysite sxyprn bf hindi video bf hindi movie banglaxx | Hexmy',
  alternates: { canonical: '/indian' },
}

// Generate unique content from videos and meta keywords
function generateIndianContent(videos, totalRecords, totalPages) {
  // Extract video titles
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)
  
  // Extract keywords from titles
  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
  
  // Meta keywords from page metadata
  const metaKeywords = ['desi', 'indiangaysite', 'sxyprn', 'dehati', 'bollywood', 'hindi', 'banglaxx']
  
  // Build content mentions
  let titleMention = ''
  if (titleKeywords.length > 0) {
    titleMention = ` Popular themes include ${titleKeywords.slice(0, 3).join(', ')} content.`
  }
  
  let metaMention = ''
  if (metaKeywords.length > 0) {
    metaMention = ` The collection features ${metaKeywords.slice(0, 4).join(', ')}, and other desi categories.`
  }
  
  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Current page includes videos like "${firstTitle}" among others.`
  }
  
  return {
    intro: `Explore ${totalRecords}+ Indian desi videos featuring authentic South Asian content in high definition. This collection celebrates Indian performers across various scenarios, from traditional desi settings to modern productions. Our Indian category showcases the diversity and sensuality of the subcontinent with content ranging from amateur homemade recordings to professional studio productions.`,
    details: `The Indian video library encompasses desi performers in solo, duo, and group scenarios. Content includes Bollywood-inspired productions, village-themed dehati content, and urban Indian scenarios.${metaMention}${titleMention} Videos maintain cultural authenticity while delivering quality entertainment with proper production values.`,
    navigation: `Browse through ${totalPages} pages of Indian content, with 16 videos per page organized for easy exploration. The collection is regularly updated with new desi releases, balancing popular Indian favorites with fresh content.${exampleMention}`,
    closing: `All Indian videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming of desi content across all devices and connection speeds worldwide.`
  }
}

export default async function IndianPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getIndians(page, 16).catch(() => ({ data: [], records: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)
  const totalRecords = res.totalRecords || 0
  
  // Generate unique content for page 1
  const content = page === 1 ? generateIndianContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Indian Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>
      
      {/* Video Grid */}
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination basePath="/indian?" currentPage={page} totalPages={totalPages} />
      
      {/* Unique content section - Below videos, only on page 1 */}
      {content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About Indian Desi Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
