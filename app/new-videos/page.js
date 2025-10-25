import { api } from '../lib/api'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export const metadata = {
  title: 'New Videos',
  description: 'Watch the latest new videos on Hexmy with high-quality streaming.',
  alternates: { canonical: '/new-videos' },
}

// Generate unique content from videos
function generateNewVideosContent(videos, totalRecords, totalPages) {
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)
  
  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
  
  let titleMention = ''
  if (titleKeywords.length > 0) {
    titleMention = ` Recent uploads feature ${titleKeywords.slice(0, 3).join(', ')} themes.`
  }
  
  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Latest additions include videos like "${firstTitle}" among others.`
  }
  
  return {
    intro: `Explore ${totalRecords}+ newest videos uploaded to our platform in high definition. This collection features the latest releases across all categories, updated daily with fresh content from various performers and studios. Our New Videos section ensures you never miss the most recent additions to our extensive library.`,
    details: `The New Videos library showcases the latest uploads across multiple genres and categories. Content includes fresh releases from established performers, debut videos from new talent, and recent productions from various studios.${titleMention} Videos are sorted by upload date with the newest content appearing first, ensuring you always see the latest additions.`,
    navigation: `Browse through ${totalPages} pages of new content, with 16 videos per page organized chronologically. The collection updates daily with fresh uploads, making it easy to discover the latest releases across all categories and performers.${exampleMention}`,
    closing: `All new videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming of the latest releases across all devices.`
  }
}

export default async function NewVideosPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getNewVideos(page, 16).catch(() => ({ data: [], records: [], videos: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || res.videos || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)
  const totalRecords = res.totalRecords || 0
  
  const content = page === 1 ? generateNewVideosContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>
      
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>
      
      <Pagination basePath="/new-videos?" currentPage={page} totalPages={totalPages} />
      
      {content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About New Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
