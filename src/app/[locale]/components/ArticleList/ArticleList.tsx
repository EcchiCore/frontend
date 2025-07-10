// Also update the ArticleList component to handle URL-encoded slugs
import Link from 'next/link';
import Image from 'next/image';
import { Article } from './article';

interface ArticleListProps {
  articles: Article[];
  filterType: 'platforms' | 'category' | 'tag';
  slug: string;
  locale: string;
}

export default function ArticleList({ articles, filterType, slug, locale  }: ArticleListProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {filterType}: {slug}
      </h1>
      {articles.length === 0 ? (
        <p className="text-gray-500">No articles found for {filterType} &quot;{slug}&quot;.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/articles/${article.slug}`}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-48">
                <Image
                  src={article.mainImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">{article.title}</h2>
                <p className="text-gray-600 line-clamp-3">{article.description}</p>
                <div className="mt-4 flex items-center">
                  <Image
                    src={article.author.image}
                    alt={article.author.username}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="ml-2 text-sm text-gray-500">{article.author.username}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}