import { NextResponse } from 'next/server'
import { api } from '../lib/api'

export const revalidate = 3600

const slugify = (s = '') => String(s).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export async function GET(req) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freshprn.com'
  const currentDate = new Date().toISOString().split('T')[0]

  const url = req?.nextUrl
  const pageParam = url?.searchParams?.get('page') || '1'
  const perParam = url?.searchParams?.get('per') || '5000'
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const per = Math.min(5000, Math.max(50, parseInt(perParam, 10) || 1000))

  // Fetch paginated list of posts (videos)
  let apiPage = 1
  const apiLimit = 200
  let posts = []
  try {
    while (true) {
      const res = await api.getAllPosts(apiPage, apiLimit)
      const batch = Array.isArray(res?.records) ? res.records
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res) ? res
        : []
      posts = posts.concat(batch)
      if (batch.length < apiLimit) break
      apiPage++
      if (apiPage > 200) break
    }
  } catch (e) {
    posts = []
  }

  // Normalize to unique id-title
  const uniq = new Map()
  for (const p of posts) {
    const id = p?._id ? String(p._id) : ''
    const title = p?.titel || p?.title || p?.metatitel || ''
    if (!id) continue
    if (!uniq.has(id)) uniq.set(id, title)
  }

  const ids = Array.from(uniq.keys())

  // Paginate for output
  const start = (page - 1) * per
  const pageIds = ids.slice(start, start + per)

  const urlEntries = pageIds.map(id => {
    const title = uniq.get(id) || ''
    const slug = slugify(title)
    const loc = slug ? `${siteUrl}/video/${id}-${slug}` : `${siteUrl}/video/${id}`
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
  }).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
