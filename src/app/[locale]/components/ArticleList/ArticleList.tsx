// Also update the ArticleList component to handle URL-encoded slugs
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from './article';

interface ArticleListProps {
  articles: Article[];
  filterType: 'platforms' | 'category' | 'tag';
  slug: string;
  locale: string;
}

const ArticleItem: React.FC<{
  article: Article;
  locale: string;
  PLACEHOLDER_IMAGE: string;
}> = ({ article, locale, PLACEHOLDER_IMAGE }) => {
  const [mainImageSrc, setMainImageSrc] = useState(article.mainImage);
  const [authorImageSrc, setAuthorImageSrc] = useState(article.author.image);

  return (
    <Link
      key={article.id}
      href={`/${locale}/articles/${article.slug}`}
      className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative w-full h-48">
        <Image
          src={mainImageSrc}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setMainImageSrc(PLACEHOLDER_IMAGE)}
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">{article.title}</h2>
        <p className="text-gray-600 line-clamp-3">{article.description}</p>
        <div className="mt-4 flex items-center">
          <Image
            src={authorImageSrc}
            alt={article.author.username}
            width={32}
            height={32}
            className="rounded-full"
            onError={() => setAuthorImageSrc(PLACEHOLDER_IMAGE)}
          />
          <span className="ml-2 text-sm text-gray-500">{article.author.username}</span>
        </div>
      </div>
    </Link>
  );
};

export default function ArticleList({
  articles,
  filterType,
  slug,
  locale,
}: ArticleListProps) {
  const PLACEHOLDER_IMAGE = '/placeholder-image.png';

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
            <ArticleItem
              key={article.id}
              article={article}
              locale={locale}
              PLACEHOLDER_IMAGE={PLACEHOLDER_IMAGE}
            />
          ))}
        </div>
      )}
    </div>
  );
}