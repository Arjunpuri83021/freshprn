import Link from 'next/link'
import { api } from './lib/api'
import VideoCard from './components/VideoCard'
import Pagination from './components/Pagination'

export const revalidate = 60

export const metadata = {
  title: 'FreshPrn Free HD Adult Videos and XXXHD Porn',
  description: 'FreshPrn brings fast, clean, free HD porn with trending categories and top stars. Daily updates, no fluff. Explore Indian, Teen, MILF, Lesbian, POV, Anal, and more in crisp HD.',
  alternates: { canonical: '/' },
}

export default async function HomePage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const limit = 16
  const res = await api.getAllPosts(page, limit).catch(() => ({ records: [], data: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / limit)) : 1)
  const totalRecords = res.totalRecords || list.length || 0

  // Build small, brand-unique content from live data (page 1 only)
  const buildHomeContent = () => {
    const titles = list.slice(0, 6).map(v => v.titel || v.title).filter(Boolean)
    const performers = [...new Set(list.flatMap(v => Array.isArray(v.name) ? v.name : []).filter(Boolean))]
      .slice(0, 6).map(n => n.replace(/-/g, ' '))
    const tags = [...new Set(list.flatMap(v => Array.isArray(v.tags) ? v.tags : []).filter(Boolean))]
      .slice(0, 8).map(t => t.replace(/-/g, ' '))
    const brandSalt = 'FreshPrn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const seed = (titles.join('') || 'fresh').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const variant = (seed + brandSalt) % 5

    const intro = [
      `FreshPrn brings ${totalRecords}+ free HD videos across Indian, Teen, MILF, Lesbian, POV, Anal and more. Clean UI, fast load, no fluff — just the good stuff.`,
      `Discover ${totalRecords}+ crisply curated HD videos on FreshPrn. Simple design, fast playback, real categories you actually browse.`,
      `Your fast lane to ${totalRecords}+ HD videos. FreshPrn keeps it clean, quick, and focused on what you watch most.`,
      `Explore ${totalRecords}+ high‑quality scenes with smooth streaming and a clutter‑free interface tuned for speed.`,
      `FreshPrn highlights the best of ${totalRecords}+ HD videos with a streamlined experience that gets you watching sooner.`
    ][variant]

    let details = 'Content spans pro studio releases and authentic amateur uploads with proper categorization.'
    if (tags.length) details += ` Popular right now: ${tags.slice(0, 5).join(', ')}.`
    if (performers.length) details += ` Featuring ${performers.slice(0, 3).join(', ')}${performers.length > 3 ? ' and more' : ''}.`

    const navigation = `Browse page ${page} of ${totalPages} with ${limit} videos per page. Use pagination to jump through the newest additions first.`
    const closing = 'All videos stream free in HD with minimal buffering. Works great on mobile and desktop.'

    return { intro, details, navigation, closing, performers, tags }
  }
  const homeContent = page === 1 ? buildHomeContent() : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">FreshPrn Free HD Adult Videos and XXXHD Porn</h1>

      {/* All Videos (Newest first handled by API) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Videos</h2>
        </div>
        <div className="grid video-grid">
          {list.map((v, idx) => (
            <VideoCard key={v._id || idx} video={v} priority={idx < 6} />
          ))}
        </div>
        <div className="mt-6">
          <Pagination basePath="/?" currentPage={page} totalPages={totalPages} />
        </div>
      </section>

      {homeContent && (
        <section className="mt-2 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Why FreshPrn</h2>
          <p>{homeContent.intro}</p>
          <p>{homeContent.details}</p>
          <p>{homeContent.navigation}</p>
          <p>{homeContent.closing}</p>
          {(homeContent.performers?.length || homeContent.tags?.length) ? (
            <div className="mt-2 border-t border-white/10 pt-3">
              {homeContent.performers?.length ? (
                <p className="text-sm"><span className="text-gray-400">Trending performers:</span> {homeContent.performers.join(', ')}</p>
              ) : null}
              {homeContent.tags?.length ? (
                <p className="text-sm"><span className="text-gray-400">Hot tags:</span> {homeContent.tags.join(', ')}</p>
              ) : null}
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
