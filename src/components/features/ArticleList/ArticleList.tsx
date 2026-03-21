// Also update the ArticleList component to handle URL-encoded slugs
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from './article';
import imageLoader from '@/lib/imageLoader';

interface ArticleListProps {
  articles: Article[];
  filterType: 'platforms' | 'category' | 'tag';
  slug: string;
  locale: string;
}

const ArticleItem: React.FC<{
  article: Article;
  locale: string;

}> = ({ article, locale }) => {
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
          loader={imageLoader}
          src={mainImageSrc}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2 text-foreground">{article.title}</h2>
        <p className="text-gray-600 line-clamp-3">{article.description}</p>
        <div className="mt-4 flex items-center">
          <Image
            loader={imageLoader}
            src={authorImageSrc}
            alt={article.author.name}
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
          <span className="ml-2 text-sm text-gray-500">{article.author.name}</span>
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

            />
          ))}
        </div>
      )}
    </div>
  );
}