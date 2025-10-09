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
import { Article, ArticleResponse } from "./components/Interfaces";


interface MetadataProps {
  params: Promise<{ locale: string; paths: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface DownloadFile {
  id: number;
  articleId: number;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DownloadsResponse {
  links: DownloadFile[];
  articleExists: boolean;
  articleStatus: string;
}

const apiUrl = process.env.API_URL;
const siteUrl = process.env.FRONTEND || 'https://chanomhub.online';

async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`${apiUrl}/api/articles/${slug}`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) return null;

    const data = await response.json() as ArticleResponse;
    return data.article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

async function fetchDownloads(articleId: number): Promise<DownloadFile[]> {
  try {
    const response = await fetch(`${apiUrl}/api/downloads/article/${articleId}`, {
      cache: 'no-store'
    });

    if (!response.ok) return [];

    const data = await response.json() as DownloadsResponse;
    return data.links || [];
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return [];
  }
}

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

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
  const params = await props.params;

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = paths[0];

  // First check if original article exists
  const originalArticle = await fetchArticle(slug);
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
    mainImageUrl = typeof coverImage === 'string' ? coverImage : coverImage?.url || null;
  } else if (mainImage) {
    mainImageUrl = typeof mainImage === 'string' ? mainImage : mainImage?.url || null;
  } else if (backgroundImage) {
    mainImageUrl = typeof backgroundImage === 'string' ? backgroundImage : backgroundImage?.url || null;
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
    keywords: originalArticle.tagList || [],
    locale,
    contentPath,
    type: 'article',
    publishedTime: originalArticle.createdAt,
    modifiedTime: originalArticle.updatedAt,
    authors: [originalArticle.author.username],
    images: mainImageUrl ? [{
      url: mainImageUrl,
      width: 1200,
      height: 630,
      alt: seoTitle
    }] : undefined
  });
}

interface ArticlePageProps {
  params: Promise<{ locale: string; paths: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Function to generate JSON-LD structured data for the article
function generateArticleJsonLd(
  article: Article,
  locale: Locale,
  slug: string
) {
  let mainImageUrl = typeof article.mainImage === 'string'
    ? article.mainImage
    : article.mainImage?.url || '';

  if (mainImageUrl) {
    mainImageUrl = mainImageUrl.replace('rustgram.onrender.com', 'oi.chanomhub.online');
  }

  // Construct the correct article URL with locale
  const articleUrl = `${siteUrl}/${locale}/articles/${slug}`;

  return generateArticleStructuredData({
    title: createSEOTitle(article),
    description: article.description,
    url: articleUrl,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    authors: [article.author.username],
    images: mainImageUrl ? [mainImageUrl] : undefined,
    locale
  });
}

export default async function ArticlePage(props: ArticlePageProps) {
  const params = await props.params;

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = paths[0];

  const originalArticle = await fetchArticle(slug);
  if (!originalArticle) {
    return notFound();
  }

  const downloads = await fetchDownloads(originalArticle.id);

  // Generate structured data JSON-LD for the article
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
        categoryList={originalArticle.categoryList}
        authorUsername={originalArticle.author.username}
      />

      <ArticleContent
        article={originalArticle}
        slug={slug}
        downloads={downloads}
      />
    </>
  );
}