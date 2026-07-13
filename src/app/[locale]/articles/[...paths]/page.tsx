// app/[locale]/articles/[...paths]/page.tsx

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import ArticleContent from './components/ArticleContent';
import ArticleBodyServer from './components/ArticleBodyServer';
import GTMArticleTracker from './components/GTMArticleTracker';
import Script from 'next/script';
import ArticleModsPage from './components/ArticleModsPage';
import ArticleDiscussionsPage from './components/ArticleDiscussionsPage';
import ArticleDevlogPage from './components/ArticleDevlogPage';
import ArticleDevlogDetail from './components/ArticleDevlogDetail';
import ArticleViewTracker from './components/ArticleViewTracker';
import {
  generatePageMetadata,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  createSEOTitle,
  generateGameSoftwareStructuredData,
  constructContentPath,
  generateVideoStructuredData,
} from "@/utils/metadataUtils";
import { getValidLocale, type Locale } from "@/utils/localeUtils";
import { Article } from "@/types/article";
const siteUrl = process.env.FRONTEND || 'https://chanomhub.com';

// SDK client removed in favor of cached functions in lib
import { getCachedArticle, getCachedArticleWithDownloads } from '@/lib/articlePageCache';

// Import shared cache functions - no extra API calls needed



export async function generateMetadata(props: ArticlePageProps): Promise<Metadata> {
  const params = await Promise.resolve(props.params);

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = decodeURIComponent(paths[0]);

  // Get token for server-side auth check
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const originalArticle = await getCachedArticle(slug, locale, token);
  if (!originalArticle) {
    notFound();
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
  const seoTitle = createSEOTitle(originalArticle, locale);
  const isMods = paths[1] === "mods";
  const isDiscussions = paths[1] === "discussions";
  const isDevlog = paths[1] === "devlog";
  
  let finalTitle = seoTitle;
  let finalDesc = originalArticle.description;

  if (isMods) {
    finalTitle = `Mods - ${seoTitle}`;
    finalDesc = `Download mods and translations for ${originalArticle.title}. ${originalArticle.description}`;
  } else if (isDiscussions) {
    finalTitle = `Discussions - ${seoTitle}`;
    finalDesc = `Join the community discussion about ${originalArticle.title}. ${originalArticle.description}`;
  } else if (isDevlog) {
    if (paths[2]) {
      finalTitle = `Update v${paths[2]} - ${seoTitle}`;
      finalDesc = `View change log version ${paths[2]} for ${originalArticle.title}. ${originalArticle.description}`;
    } else {
      finalTitle = `Devlog - ${seoTitle}`;
      finalDesc = `View update log and revision history for ${originalArticle.title}. ${originalArticle.description}`;
    }
  }

  return generatePageMetadata({
    title: finalTitle,
    description: finalDesc,
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
      alt: finalTitle
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
    title: createSEOTitle(article, locale),
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

  // Get token for server-side auth check
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Fetch article and downloads together - no ID needed in URL
  const { article: originalArticle, downloads } = await getCachedArticleWithDownloads(slug, locale, token);

  let mods: any[] = [];
  if (originalArticle && paths[1] === 'mods') {
    const { getArticleMods } = await import('@/lib/article-api');
    const articleId = typeof originalArticle.id === 'string' ? parseInt(originalArticle.id as unknown as string, 10) : originalArticle.id;
    mods = await getArticleMods(articleId);
  }

  let revisions: any[] = [];
  let revisionDetail: any = null;
  if (originalArticle && paths[1] === 'devlog') {
    const { getSdk } = await import('@/lib/sdk');
    const sdk = await getSdk();
    if (paths[2]) {
      const version = parseInt(paths[2], 10) || 1;
      try {
        revisionDetail = await sdk.articles.getRevision(slug, version);
      } catch (err) {
        const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('aborted'));
        if (!isAbort) {
          console.error("Failed to load revision detail via SDK", err);
        }
      }
    } else {
      try {
        const response = await sdk.articles.getRevisions(slug);
        revisions = response.items || [];
      } catch (err) {
        const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('aborted'));
        if (!isAbort) {
          console.error("Failed to load revisions via SDK", err);
        }
      }
    }
  }

  if (!originalArticle) {
    return notFound();
  }

  // Fetch related articles recommended by the backend (fully Server-Side Rendered - SSR via GraphQL)
  const relatedArticles = originalArticle.related || [];

  // Generate structured data JSON-LD for the article (only once, SEO handles language)
  const articleJsonLd = generateArticleJsonLd(
    originalArticle,
    locale,
    slug
  );

  // Generate BreadcrumbList JSON-LD for Google rich results
  const articleUrl = locale === 'en'
    ? `${siteUrl}/articles/${slug}`
    : `${siteUrl}/${locale}/articles/${slug}`;
  const gamesUrl = locale === 'en'
    ? `${siteUrl}/games`
    : `${siteUrl}/${locale}/games`;

  const categoryName = originalArticle.categories?.[0]?.name;
  const breadcrumbItems: Array<{ name: string; url?: string }> = [
    { name: 'Games', url: gamesUrl },
  ];
  if (categoryName) {
    const categoryUrl = locale === 'en'
      ? `${siteUrl}/category/${encodeURIComponent(categoryName)}`
      : `${siteUrl}/${locale}/category/${encodeURIComponent(categoryName)}`;
    breadcrumbItems.push({ name: categoryName, url: categoryUrl });
  }
  breadcrumbItems.push({ name: createSEOTitle(originalArticle, locale) });

  const breadcrumbJsonLd = generateBreadcrumbStructuredData({
    locale,
    items: breadcrumbItems,
  });

  // Generate Game SoftwareApplication schema if it's a software/game article
  const isGame = originalArticle.platforms && originalArticle.platforms.length > 0;
  const gameJsonLd = isGame ? generateGameSoftwareStructuredData(originalArticle, locale) : null;

  // Generate VideoObject structured data for Video SEO
  const videoJsonLd = generateVideoStructuredData(originalArticle, locale);

  // Client Content: Hydrates after JS loads - replaces SSR content
  return (
    <>
      {/* Add JSON-LD structured data */}
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* BreadcrumbList JSON-LD for Google rich results */}
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Game SoftwareApplication JSON-LD for rich rating snippets */}
      {gameJsonLd && (
        <Script
          id="game-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
        />
      )}

      {/* VideoObject JSON-LD for Video SEO */}
      {videoJsonLd && (
        <Script
          id="video-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}

      <GTMArticleTracker
        title={originalArticle.title}
        slug={originalArticle.slug}
        categoryList={originalArticle.categories.map((c: { name: string }) => c.name)}
        authorUsername={originalArticle.author.name}
      />

      <ArticleViewTracker slug={slug} />

      {/* Workshop Page Routing */}
      {paths[1] === 'mods' ? (
        <ArticleModsPage
          article={originalArticle}
          mods={mods.length > 0 ? mods : (originalArticle.mods || [])}
          isAuthenticated={false} // You might want to pass real auth state here if possible, or handle it in client comp
        />
      ) : paths[1] === 'discussions' ? (
        <ArticleDiscussionsPage
          article={originalArticle}
          isAuthenticated={false}
        />
      ) : paths[1] === 'devlog' ? (
        paths[2] ? (
          <ArticleDevlogDetail
            article={originalArticle}
            version={parseInt(paths[2], 10) || 1}
            detail={revisionDetail}
          />
        ) : (
          <ArticleDevlogPage
            article={originalArticle}
            revisions={revisions}
          />
        )
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