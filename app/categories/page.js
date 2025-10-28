import Link from 'next/link'

export const metadata = {
  title: 'Categories',
  description: 'Browse video categories on FreshPrn.',
  alternates: { canonical: '/categories' },
}

const categories = [
  { name: 'Indian', href: '/indian' },
  { name: 'Hijabi', href: '/muslim' },
  { name: 'Scout69', href: '/category/scout69' },
  { name: 'Lesbify', href: '/category/lesbify' },
  { name: 'MilfNut', href: '/category/milfnut' },
  { name: 'Desi49', href: '/category/desi49' },
  { name: 'Teen Sex', href: '/category/teen-sex' },
  { name: 'Family Sex', href: '/category/famili-sex-com' },
  { name: 'Blue Film', href: '/category/blueflim' },
  { name: 'Small Tits', href: '/category/small-tits' },
]

export default function CategoriesIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm px-4 py-3 rounded-md text-center transition-colors duration-200"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
