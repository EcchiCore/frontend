// app/[locale]/articles/[...paths]/page.tsx

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Navbar from './../../components/Navbar';
import ArticleContent from './components/ArticleContent';
import ArticleBodyServer from './components/ArticleBodyServer';
import GTMArticleTracker from './components/GTMArticleTracker';
import Script from 'next/script';
import ArticleModsPage from './components/ArticleModsPage';
import ArticleDiscussionsPage from './components/ArticleDiscussionsPage';
import {
  generatePageMetadata,
  generateArticleStructuredData,
  createSEOTitle,
  constructContentPath,
} from "@/utils/metadataUtils";
import { getValidLocale, type Locale } from "@/utils/localeUtils";
import { Article } from "@/types/article";
const siteUrl = process.env.FRONTEND || 'https://chanomhub.com';

// SDK client removed in favor of cached functions in lib
import { getCachedArticle, getCachedArticleWithDownloads } from '@/lib/articlePageCache';

// Import shared cache functions - no extra API calls needed
import { getCachedRecommendationPool, getRelatedFromPool } from '@/lib/articlesCache';



export async function generateMetadata(props: ArticlePageProps): Promise<Metadata> {
  const params = await Promise.resolve(props.params);

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = decodeURIComponent(paths[0]);

  const originalArticle = await getCachedArticle(slug, locale);
  if (!originalArticle) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found',
    };
  }

  // Get main image URL - ensure we extract string value
  let mainImageUrl: string | null = null;

  const coverImage = originalArticle.coverImage;
  const mainImage = originalArticle.mainImage;
  const backgroundImage = originalArticle.backgroundImage;

  // Use priority order for main image: coverImage > mainImage > backgroundImage
  if (coverImage) {
    mainImageUrl = coverImage;
  } else if (mainImage) {
    mainImageUrl = mainImage;
  } else if (backgroundImage) {
    mainImageUrl = backgroundImage;
  }

  // URLs are already transformed by the API layer

  // Construct content path for hreflang and canonical
  const contentPath = constructContentPath(locale, paths);

  // For original article page
  const seoTitle = createSEOTitle(originalArticle);
  return generatePageMetadata({
    title: seoTitle,
    description: originalArticle.description,
    keywords: originalArticle.tags.map((tag: { name: string }) => tag.name) || [],
    locale,
    contentPath,
    type: 'article',
    publishedTime: originalArticle.createdAt,
    modifiedTime: originalArticle.updatedAt,
    authors: [originalArticle.author.name],
    images: mainImageUrl ? [{
      url: mainImageUrl,
      width: 1200,
      height: 630,
      alt: seoTitle
    }] : undefined
  });
}


// Function to generate JSON-LD structured data for the article
function generateArticleJsonLd(
  article: Article,
  locale: Locale,
  slug: string
) {
  // Get main image URL - already transformed by API layer
  let mainImageUrl = article.mainImage || '';

  // URLs are already transformed by the API layer

  // Construct the correct article URL without locale prefix for default locale
  const articleUrl = locale === 'en'
    ? `${siteUrl}/articles/${slug}`
    : `${siteUrl}/${locale}/articles/${slug}`;

  return generateArticleStructuredData({
    title: createSEOTitle(article),
    description: article.description,
    url: articleUrl,
    locale,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    authors: [article.author.name],
    images: mainImageUrl ? [mainImageUrl] : undefined
  });
}

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    paths: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArticlePage(props: ArticlePageProps) {
  const params = await props.params;

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = decodeURIComponent(paths[0]);

  // Fetch article and downloads together - no ID needed in URL
  const { article: originalArticle, downloads } = await getCachedArticleWithDownloads(slug, locale);

  if (!originalArticle) {
    return notFound();
  }

  // Fetch related articles based on tags (server-side, no extra client request)
  const tagNames = originalArticle.tags?.map((t: { name: string }) => t.name) || [];
  const articlePool = await getCachedRecommendationPool();
  const relatedArticles = getRelatedFromPool(articlePool, tagNames, originalArticle.id);

  // Generate structured data JSON-LD for the article (only once, SEO handles language)
  const articleJsonLd = generateArticleJsonLd(
    originalArticle,
    locale,
    slug
  );

  // Client Content: Hydrates after JS loads - replaces SSR content
  return (
    <>
      <Navbar />
      {/* Add JSON-LD structured data */}
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <GTMArticleTracker
        title={originalArticle.title}
        slug={originalArticle.slug}
        categoryList={originalArticle.categories.map((c: { name: string }) => c.name)}
        authorUsername={originalArticle.author.name}
      />

      {/* Workshop Page Routing */}
      {paths[1] === 'mods' ? (
        <ArticleModsPage
          article={originalArticle}
          mods={originalArticle.mods || []}
          isAuthenticated={false} // You might want to pass real auth state here if possible, or handle it in client comp
        />
      ) : paths[1] === 'discussions' ? (
        <ArticleDiscussionsPage
          article={originalArticle}
          isAuthenticated={false}
        />
      ) : (
        <>
          {/* SSR Content: Rendered on server for SEO - Google will index this */}
          <div className="ssr-article-content">
            <ArticleBodyServer article={originalArticle} />
          </div>

          {/* Client Content: Hydrates after JS loads - replaces SSR content */}
          <Suspense fallback={null}>
            <ArticleContent
              article={originalArticle}
              slug={slug}
              articleId={originalArticle.id}
              downloads={downloads || []}
              relatedArticles={relatedArticles}
            />
          </Suspense>
        </>
      )}
    </>
  );
}