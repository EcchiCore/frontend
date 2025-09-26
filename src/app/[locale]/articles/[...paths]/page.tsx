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


interface TranslatedArticle {
  title: string;
  description: string;
  body: string;
  slug: string;
  author?: {
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
  mainImage?: string | { url?: string };
  tagList?: string[];
  categoryList?: string[];
  ver?: string;
  sequentialCode?: string;
  engine?: string;
  version?: number;
}

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

// N8N Translation Interfaces
interface N8nTranslationRequest {
  title: string;
  description: string;
  body: string;
  sourceLanguage: string;
  targetLanguage: string;
  slug: string;
}

interface N8nTranslationResponse {
  success: boolean;
  translatedTitle: string;
  translatedDescription: string;
  translatedBody: string;
  error?: string;
}



const apiUrl = process.env.API_URL;
const n8nWebhookUrl = process.env.N8N_TRANSLATION_WEBHOOK_URL;
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

// N8N Translation Function
async function translateArticleWithN8n(
  article: Article,
  sourceLanguage: string = 'auto',
  targetLanguage: string = 'th'
): Promise<TranslatedArticle | null> {
  try {
    if (!n8nWebhookUrl) {
      console.error('N8N_TRANSLATION_WEBHOOK_URL is not configured');
      return null;
    }

    console.log(`Translating article via n8n webhook: ${article.slug}`);

    const translationRequest: N8nTranslationRequest = {
      title: article.title,
      description: article.description,
      body: article.body,
      sourceLanguage,
      targetLanguage,
      slug: article.slug
    };

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(translationRequest),
      signal: AbortSignal.timeout(45000) // Increased timeout to 45 seconds
    });

    if (!response.ok) {
      console.error(`N8n webhook translation error: ${response.status} ${response.statusText}`);
      return null;
    }

    const translationResult = await response.json() as N8nTranslationResponse;

    if (!translationResult.success) {
      console.error('N8n webhook translation failed:', translationResult.error);
      return null;
    }

    // Validate translation result
    const hasValidTranslation =
      translationResult.translatedTitle &&
      translationResult.translatedBody &&
      translationResult.translatedDescription !== "Translation Error";

    if (!hasValidTranslation) {
      console.warn('Translation result incomplete or has errors:', {
        hasTitle: !!translationResult.translatedTitle,
        hasBody: !!translationResult.translatedBody,
        descriptionError: translationResult.translatedDescription === "Translation Error"
      });

      // Return partial translation if title and body are available
      if (translationResult.translatedTitle && translationResult.translatedBody) {
        return {
          title: translationResult.translatedTitle,
          description: translationResult.translatedDescription === "Translation Error"
            ? article.description // Use original description if translation failed
            : translationResult.translatedDescription,
          body: translationResult.translatedBody,
          slug: article.slug,
          author: article.author,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          mainImage: article.mainImage,
          tagList: article.tagList,
          categoryList: article.categoryList,
          ver: article.ver,
          sequentialCode: article.sequentialCode,
          engine: 'n8n-webhook',
          version: 1
        };
      }

      return null;
    }

    // Return the translated article with original metadata preserved
    return {
      title: translationResult.translatedTitle,
      description: translationResult.translatedDescription,
      body: translationResult.translatedBody,
      slug: article.slug,
      author: article.author,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      mainImage: article.mainImage,
      tagList: article.tagList,
      categoryList: article.categoryList,
      ver: article.ver,
      sequentialCode: article.sequentialCode,
      engine: 'n8n-webhook',
      version: 1
    };

  } catch (error) {
    console.error('Error translating article with n8n webhook:', error);
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
function createSEOTitle(article: Article | TranslatedArticle, isTranslated: boolean = false): string {
  let title = article.title;

  if ('ver' in article && article.ver) {
    title += ` [${article.ver}]`;
  }

  if ('sequentialCode' in article && article.sequentialCode) {
    title += ` (${article.sequentialCode})`;
  }

  if (isTranslated) {
    title += ' (Translated)';
  }

  return title;
}

// Helper function to construct content path for metadata
function constructContentPath(locale: Locale, paths: string[], isTranslate: boolean, searchParams?: any): string {
  let contentPath = `articles/${paths[0]}`;

  if (isTranslate) {
    contentPath += '/translate';

    // Add query parameters if they exist
    const params = new URLSearchParams();
    if (searchParams?.sourceLanguage && typeof searchParams.sourceLanguage === 'string') {
      params.set('sourceLanguage', searchParams.sourceLanguage);
    }
    if (searchParams?.targetLanguage && typeof searchParams.targetLanguage === 'string') {
      params.set('targetLanguage', searchParams.targetLanguage);
    }

    if (params.toString()) {
      contentPath += `?${params.toString()}`;
    }
  }

  return contentPath;
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = paths[0];
  const isTranslate = paths.length > 1 && paths[1] === 'translate';

  const sourceLanguage = typeof searchParams?.sourceLanguage === 'string'
    ? searchParams.sourceLanguage
    : 'auto';
  const targetLanguage = typeof searchParams?.targetLanguage === 'string'
    ? searchParams.targetLanguage
    : 'th';

  // First check if original article exists
  const originalArticle = await fetchArticle(slug);
  if (!originalArticle) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found',
    };
  }

  // Get main image URL
  let mainImageUrl = typeof originalArticle.mainImage === 'string'
    ? originalArticle.mainImage
    : originalArticle.mainImage?.url || '';

  if (mainImageUrl) {
    mainImageUrl = mainImageUrl.replace('rustgram.onrender.com', 'oi.chanomhub.online');
  }

  // Construct content path for hreflang and canonical
  const contentPath = constructContentPath(locale, paths, isTranslate, searchParams);

  if (isTranslate) {
    // Use n8n translation
    const translatedArticle = await translateArticleWithN8n(originalArticle, sourceLanguage, targetLanguage);

    if (!translatedArticle) {
      const seoTitle = createSEOTitle(originalArticle) + ' (Translation Not Available)';
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

    const seoTitle = createSEOTitle(translatedArticle, true);
    return generatePageMetadata({
      title: seoTitle,
      description: translatedArticle.description,
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
  } else {
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
}

interface ArticlePageProps {
  params: Promise<{ locale: string; paths: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TranslationErrorBanner = ({ translationInfo }: { translationInfo: any }) => (
  <Alert variant="destructive" className="mb-6">
    <AlertTitle>Translation may be incomplete</AlertTitle>
    <AlertDescription>
      The translation service may have issues, or some content may not have been translated yet.
      {translationInfo && (
        <span className="ml-2">
          ({translationInfo.sourceLanguage} → {translationInfo.targetLanguage})
        </span>
      )}
    </AlertDescription>
  </Alert>
);

// Function to generate JSON-LD structured data for the article
function generateArticleJsonLd(
  article: Article,
  locale: Locale,
  slug: string,
  isTranslated: boolean = false,
  searchParams?: any
) {
  let mainImageUrl = typeof article.mainImage === 'string'
    ? article.mainImage
    : article.mainImage?.url || '';

  if (mainImageUrl) {
    mainImageUrl = mainImageUrl.replace('rustgram.onrender.com', 'oi.chanomhub.online');
  }

  // Construct the correct article URL with locale
  let articleUrl = `${siteUrl}/${locale}/articles/${slug}`;
  if (isTranslated) {
    articleUrl += '/translate';

    const params = new URLSearchParams();
    if (searchParams?.sourceLanguage && typeof searchParams.sourceLanguage === 'string') {
      params.set('sourceLanguage', searchParams.sourceLanguage);
    }
    if (searchParams?.targetLanguage && typeof searchParams.targetLanguage === 'string') {
      params.set('targetLanguage', searchParams.targetLanguage);
    }

    if (params.toString()) {
      articleUrl += `?${params.toString()}`;
    }
  }

  return generateArticleStructuredData({
    title: createSEOTitle(article, isTranslated),
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
  const searchParams = await props.searchParams;

  const locale = getValidLocale(params.locale);
  const paths = params.paths;
  const slug = paths[0];
  const isTranslate = paths.length > 1 && paths[1] === 'translate';

  const sourceLanguage = typeof searchParams.sourceLanguage === 'string'
    ? searchParams.sourceLanguage
    : 'auto';
  const targetLanguage = typeof searchParams.targetLanguage === 'string'
    ? searchParams.targetLanguage
    : 'th';

  const originalArticle = await fetchArticle(slug);
  if (!originalArticle) {
    return notFound();
  }

  const downloads = await fetchDownloads(originalArticle.id);

  let contentArticle = originalArticle;
  let isTranslated = false;
  let translationInfo = null;
  let hasTranslationError = false;

  if (isTranslate) {
    // Use n8n translation
    const translatedArticle = await translateArticleWithN8n(originalArticle, sourceLanguage, targetLanguage);

    if (translatedArticle) {
      contentArticle = {
        ...originalArticle,
        title: translatedArticle.title,
        description: translatedArticle.description,
        body: translatedArticle.body,
        ver: translatedArticle.ver || originalArticle.ver,
        sequentialCode: translatedArticle.sequentialCode || originalArticle.sequentialCode,
        engine: translatedArticle.engine,
        version: translatedArticle.version
      };
      isTranslated = true;
      translationInfo = { sourceLanguage, targetLanguage };

      // Check if translation has errors or is incomplete
      hasTranslationError =
        translatedArticle.description === originalArticle.description || // Description wasn't translated
        translatedArticle.body.length < originalArticle.body.length * 0.8; // Body is significantly shorter
    } else {
      // Translation completely failed
      hasTranslationError = true;
      translationInfo = { sourceLanguage, targetLanguage };
    }
  }

  // Generate structured data JSON-LD for the article
  const articleJsonLd = generateArticleJsonLd(
    contentArticle,
    locale,
    slug,
    isTranslated,
    searchParams
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

      {/* Show translation error banner if needed */}
      {isTranslate && hasTranslationError && (
        <TranslationErrorBanner translationInfo={translationInfo} />
      )}

      {/* Only show GTM tracker for original articles */}
      {!isTranslated && (
        <GTMArticleTracker
          title={originalArticle.title}
          slug={originalArticle.slug}
          categoryList={originalArticle.categoryList}
          authorUsername={originalArticle.author.username}
        />
      )}

      <ArticleContent
        article={contentArticle}
        slug={slug}
        downloads={downloads}
        isTranslated={isTranslated}
        translationInfo={translationInfo}
        hasTranslationError={hasTranslationError}
      />
    </>
  );
}