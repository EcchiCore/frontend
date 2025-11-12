// app/[locale]/articles/[...paths]/page.tsx

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Navbar from './../../components/Navbar';
import ArticleContent from './components/ArticleContent';
import GTMArticleTracker from './components/GTMArticleTracker';
import Script from 'next/script';
import {
  generatePageMetadata,
  generateArticleStructuredData
} from "@/utils/metadataUtils";
import { getValidLocale, type Locale } from "@/utils/localeUtils";
import { Article } from "@/types/article";
import { getArticleBySlug, fetchArticleAndDownloads } from "@/lib/article-api";

const siteUrl = process.env.FRONTEND || 'https://chanomhub.online';

// Helper function to create SEO-friendly title
function createSEOTitle(article: Article): string {
  let title = article.title;

  if ('ver' in article && article.ver) {
    title += ` [${article.ver}]`;
  }

  if ('sequentialCode' in article && article.sequentialCode) {
    title += ` (${article.sequentialCode})`;
  }

  return title;
}

// Helper function to construct content path for metadata
function constructContentPath(locale: Locale, paths: string[]): string {
  return `articles/${paths[0]}`;
}

export async function generateMetadata(props: ArticlePageProps): Promise<Metadata> {
  const params = await Promise.resolve(props.params);

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = paths[0];

  const originalArticle = await getArticleBySlug(slug);
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

  if (coverImage) {
    mainImageUrl = coverImage;
  } else if (mainImage) {
    mainImageUrl = mainImage;
  } else if (backgroundImage) {
    mainImageUrl = backgroundImage;
  }

  // Replace domain if URL exists
  if (mainImageUrl) {
    mainImageUrl = mainImageUrl.replace("rustgram.onrender.com", "oi.chanomhub.online");
  }

  // Construct content path for hreflang and canonical
  const contentPath = constructContentPath(locale, paths);

  // For original article page
  const seoTitle = createSEOTitle(originalArticle);
  return generatePageMetadata({
    title: seoTitle,
    description: originalArticle.description,
    keywords: originalArticle.tags.map(tag => tag.name) || [],
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
  let mainImageUrl = article.mainImage || '';

  if (mainImageUrl) {
    mainImageUrl = mainImageUrl.replace('rustgram.onrender.com', 'oi.chanomhub.online');
  }

  // Construct the correct article URL with locale
  const articleUrl = `${siteUrl}/${locale}/articles/${slug}`;

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
  const searchParams = await props.searchParams;

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = paths[0];
  const articleId = searchParams.id ? Number(searchParams.id) : undefined;

  const { article: originalArticle, downloads } = await fetchArticleAndDownloads(slug, articleId || 0);
  if (!originalArticle) {
    return notFound();
  }

  // Generate structured data JSON-LD for the article (only once, SEO handles language)
  const articleJsonLd = generateArticleJsonLd(
    originalArticle,
    locale,
    slug
  );

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
        categoryList={originalArticle.categories.map(c => c.name)}
        authorUsername={originalArticle.author.name}
      />

      <ArticleContent
        article={originalArticle}
        slug={slug}
        articleId={articleId}
        downloads={downloads || []}
      />
    </>
  );
}