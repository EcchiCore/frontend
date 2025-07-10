import { Metadata } from 'next';
import ArticleList from '../ArticleList/ArticleList';
import Link from 'next/link';
import Image from 'next/image';
import { RssIcon, Tag, Monitor, FolderOpen, Calendar, User, Heart, Eye } from 'lucide-react';
import { ArticlesResponse } from '../ArticleList/article';
import myImageLoader from '../../lib/imageLoader';
import ErrorCard from '../../components/ErrorCard';
import { getTranslations } from 'next-intl/server';

// Define types for filter
type FilterType = 'platforms' | 'tag' | 'category';

// Props interface for the component
interface DynamicFilterPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  filterType: FilterType;
  hasRss?: boolean; // Optional: whether to show RSS link
}

// Fetch articles based on filter type
async function fetchArticles(slug: string, locale: string, filterType: FilterType): Promise<ArticlesResponse> {
  const queryParam = filterType === 'platforms' ? 'platforms' : filterType;
  const decodedSlug = decodeURIComponent(slug);
  const apiUrl = `${process.env.API_URL}/api/articles?${queryParam}=${encodeURIComponent(decodedSlug)}&locale=${encodeURIComponent(locale)}`;

  console.log('Fetching from URL:', apiUrl); // Debug log

  const res = await fetch(apiUrl, { next: { revalidate: 60 } }); // Use ISR for caching

  if (!res.ok) {
    throw new Error(`Failed to fetch articles for ${filterType}`);
  }

  return res.json();
}

// Generate metadata
export async function generateMetadata({ params, filterType }: {
  params: Promise<{ slug: string; locale: string }>;
  filterType: FilterType;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const t = await getTranslations({ locale, namespace: 'dynamicFilterPage' });
  const rssUrl = `/${locale}/${filterType}/${encodeURIComponent(slug)}/rss`;

  const metadata: Metadata = {
    title: t(`title_${filterType}`, { slug: decodedSlug }),
    description: t(`description_${filterType}`, { slug: decodedSlug }),
  };

  if (filterType !== 'category') {
    metadata.alternates = {
      types: {
        'application/rss+xml': [
          {
            url: rssUrl,
            title: t(`rss_title_${filterType}`, { slug: decodedSlug }),
          },
        ],
      },
    };
  }

  return metadata;
}

// Get filter icon based on type
function getFilterIcon(filterType: FilterType) {
  switch (filterType) {
    case 'platforms':
      return <Monitor className="w-6 h-6" />;
    case 'tag':
      return <Tag className="w-6 h-6" />;
    case 'category':
      return <FolderOpen className="w-6 h-6" />;
    default:
      return <Tag className="w-6 h-6" />;
  }
}

// Get filter color based on type
function getFilterColor(filterType: FilterType) {
  switch (filterType) {
    case 'platforms':
      return 'text-primary';
    case 'tag':
      return 'text-secondary';
    case 'category':
      return 'text-accent';
    default:
      return 'text-primary';
  }
}

// Component
export default async function DynamicFilterPage({ params, filterType, hasRss = true }: DynamicFilterPageProps) {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const t = await getTranslations({ locale, namespace: 'dynamicFilterPage' });
  const rssUrl = `/${locale}/${filterType}/${encodeURIComponent(slug)}/rss`;

  try {
    const { articles, articlesCount } = await fetchArticles(slug, locale, filterType);

    // Calculate comprehensive statistics
    const totalFavorites = articles.reduce((sum, article) => sum + article.favoritesCount, 0);
    const uniqueAuthors = new Set(articles.map(article => article.author.username)).size;
    const allTags = articles.flatMap(article => article.tagList);
    const uniqueTags = new Set(allTags).size;
    const allCategories = articles.flatMap(article => article.categoryList);
    const uniqueCategories = new Set(allCategories).size;
    const allPlatforms = articles.flatMap(article => article.platformList);
    const uniquePlatforms = new Set(allPlatforms).size;
    const engines = articles.map(article => article.engine).filter(Boolean);
    const uniqueEngines = new Set(engines).size;

    // Most popular tags
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Author statistics
    const authorStats = articles.reduce((acc, article) => {
      const username = article.author.username;
      if (!acc[username]) {
        acc[username] = {
          author: article.author,
          articleCount: 0,
          totalFavorites: 0,
          articles: [],
        };
      }
      acc[username].articleCount++;
      acc[username].totalFavorites += article.favoritesCount;
      acc[username].articles.push(article);
      return acc;
    }, {} as Record<string, any>);

    const topAuthors = Object.values(authorStats)
      .sort((a: any, b: any) => b.articleCount - a.articleCount)
      .slice(0, 5);

    // Recent articles
    const recentArticles = [...articles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    // Most liked articles
    const popularArticles = [...articles]
      .sort((a, b) => b.favoritesCount - a.favoritesCount)
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-base-200">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-white/20 rounded-xl ${getFilterColor(filterType)}`}>
                    {getFilterIcon(filterType)}
                  </div>
                  <div className="breadcrumbs text-sm opacity-80">
                    <ul>
                      <li><Link href={`/${locale}`}>{t('home')}</Link></li>
                      <li className="capitalize">{t(`filter_types.${filterType}`)}</li>
                      <li>{decodedSlug}</li>
                    </ul>
                  </div>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  {t(`filter_types.${filterType}`)}: {decodedSlug}
                </h1>

                <p className="text-lg opacity-90 max-w-2xl">
                  {t('description', { count: articlesCount, slug: decodedSlug })}
                </p>
              </div>

              {/* RSS Link */}
              {hasRss && filterType !== 'category' && (
                <div className="flex gap-3">
                  <Link
                    href={rssUrl}
                    className="btn btn-outline btn-primary bg-white/10 border-white/30 hover:bg-white hover:text-primary"
                    title={t(`rss_title_${filterType}`, { slug: decodedSlug })}
                  >
                    <RssIcon className="w-4 h-4" />
                    {t('rss_feed')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        {articlesCount > 0 && (
          <div className="container mx-auto px-4 py-8">
            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="stats shadow-lg">
                <div className="stat place-items-center">
                  <div className="stat-figure text-primary">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-xs">{t('stats.articles')}</div>
                  <div className="stat-value text-primary text-xl">{articlesCount}</div>
                </div>
              </div>

              <div className="stats shadow-lg">
                <div className="stat place-items-center">
                  <div className="stat-figure text-secondary">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-xs">{t('stats.likes')}</div>
                  <div className="stat-value text-secondary text-xl">{totalFavorites}</div>
                </div>
              </div>

              <div className="stats shadow-lg">
                <div className="stat place-items-center">
                  <div className="stat-figure text-accent">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-xs">{t('stats.authors')}</div>
                  <div className="stat-value text-accent text-xl">{uniqueAuthors}</div>
                </div>
              </div>

              <div className="stats shadow-lg">
                <div className="stat place-items-center">
                  <div className="stat-figure text-info">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-xs">{t('stats.tags')}</div>
                  <div className="stat-value text-info text-xl">{uniqueTags}</div>
                </div>
              </div>

              <div className="stats shadow-lg">
                <div className="stat place-items-center">
                  <div className="stat-figure text-warning">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-xs">{t('stats.categories')}</div>
                  <div className="stat-value text-warning text-xl">{uniqueCategories}</div>
                </div>
              </div>

              <div className="stats shadow-lg">
                <div className="stat place-items-center">
                  <div className="stat-figure text-success">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div className="stat-title text-xs">{t('stats.engines')}</div>
                  <div className="stat-value text-success text-xl">{uniqueEngines}</div>
                </div>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Popular Tags */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {t('stats.popular_tags')}
                  </h3>
                  <div className="space-y-2">
                    {popularTags.slice(0, 8).map(({ tag, count }) => (
                      <Link
                        key={tag}
                        href={`/${locale}/tag/${encodeURIComponent(tag)}`}
                        className="flex justify-between items-center p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer"
                      >
                        <span className="badge badge-outline text-xs hover:badge-primary">{tag}</span>
                        <span className="text-sm font-semibold">{count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Authors */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('stats.top_authors')}
                  </h3>
                  <div className="space-y-3">
                    {topAuthors.map((authorStat: any, index) => (
                      <div key={authorStat.author.username} className="flex items-center gap-3 p-2 bg-base-200 rounded-lg">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            <Image
                              src={authorStat.author.image || '/default-avatar.png'}
                              alt={authorStat.author.username}
                              width={32}
                              height={32}
                              loader={myImageLoader}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{authorStat.author.username}</div>
                          <div className="text-xs text-base-content/60">
                            {t('author_stats', {
                              articleCount: authorStat.articleCount,
                              favoritesCount: authorStat.totalFavorites,
                            })}
                          </div>
                        </div>
                        <div className="badge badge-primary badge-sm">{index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {t('stats.additional_stats')}
                  </h3>
                  <div className="space-y-3">
                    <div className="stat">
                      <div className="stat-title text-xs">{t('stats.total_platforms')}</div>
                      <div className="stat-value text-lg">{uniquePlatforms}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-xs">{t('stats.game_engines')}</div>
                      <div className="stat-value text-lg">{uniqueEngines}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-xs">{t('stats.avg_likes')}</div>
                      <div className="stat-value text-lg">
                        {articlesCount > 0 ? Math.round(totalFavorites / articlesCount) : 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Articles Showcase */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t('stats.recent_articles')}
                  </h3>
                  <div className="space-y-4">
                    {recentArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/${locale}/articles/${article.slug}`}
                        className="flex gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer block"
                      >
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-lg">
                            <Image
                              src={article.mainImage}
                              alt={article.title}
                              width={48}
                              height={48}
                              loader={myImageLoader}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-base-content/60">
                              {new Date(article.createdAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                            </div>
                            <div className="badge badge-xs">{article.engine}</div>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Heart className="w-3 h-3" />
                            <span className="text-xs">{article.favoritesCount}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Most Popular Articles */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {t('stats.most_popular')}
                  </h3>
                  <div className="space-y-4">
                    {popularArticles.map((article, index) => (
                      <Link
                        key={article.id}
                        href={`/${locale}/articles/${article.slug}`}
                        className="flex gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer block"
                      >
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-lg">
                            <Image
                              src={article.mainImage}
                              alt={article.title}
                              width={48}
                              height={48}
                              loader={myImageLoader}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-base-content/60">
                              {t('by_author', { username: article.author.username })}
                            </div>
                            <div className="badge badge-xs">{article.engine}</div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-red-500">
                              <Heart className="w-3 h-3" />
                              <span className="text-xs font-semibold">{article.favoritesCount}</span>
                            </div>
                            <div className="badge badge-primary badge-xs">#{index + 1}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Section */}
        <div className="container mx-auto px-4 pb-12">
          <div className="bg-base-100 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {getFilterIcon(filterType)}
                {t('stats.articles')}
              </h2>

              {/* Sort/Filter Options */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {t('sort.label')}
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                  <li><a>{t('sort.latest')}</a></li>
                  <li><a>{t('sort.oldest')}</a></li>
                  <li><a>{t('sort.most_popular')}</a></li>
                </ul>
              </div>
            </div>

            {articlesCount > 0 ? (
              <ArticleList
                articles={articles}
                filterType={filterType}
                slug={decodedSlug}
                locale={locale}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 opacity-20">
                  {getFilterIcon(filterType)}
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('no_articles_title')}</h3>
                <p className="text-base-content/60">
                  {t('no_articles', { filterType: t(`filter_types.${filterType}`), slug: decodedSlug })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error fetching articles for ${filterType}:`, error);
    return <ErrorCard locale={locale} />;
  }
}