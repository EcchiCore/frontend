import { Metadata } from 'next';
import ArticleList from '../ArticleList/ArticleList';
import Link from 'next/link';
import { RssIcon, Tag, Monitor, FolderOpen, Calendar, User, Heart, Eye } from 'lucide-react';
import { ArticlesResponse } from '../ArticleList/article';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ErrorCard from '../../components/ErrorCard';
import { getTranslations } from 'next-intl/server';
import ImageWithFallback from '@/components/ImageWithFallback';

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

// Fetch articles based on filter type using GraphQL
async function fetchArticles(slug: string, locale: string, filterType: FilterType): Promise<ArticlesResponse> {
  const decodedSlug = decodeURIComponent(slug);
  const apiUrl = `${process.env.API_URL || 'https://api.chanomhub.online'}/api/graphql`;

  let filterArg = '';
  if (filterType === 'platforms') {
    filterArg = `platform: "${decodedSlug}"`;
  } else if (filterType === 'tag') {
    filterArg = `tag: "${decodedSlug}"`;
  } else if (filterType === 'category') {
    filterArg = `category: "${decodedSlug}"`;
  }

  const query = `query DynamicFilterArticles {
    articles(filter: { ${filterArg} }, status: PUBLISHED, limit: 50) {
      id
      title
      slug
      description
      createdAt
      favoritesCount
      mainImage
      images {
        url
      }
      ver
      engine {
        name
      }
      platforms {
        name
      }
      tags {
        name
      }
      categories {
        name
      }
      author {
        name
        image
      }
      sequentialCode
    }
  }`;

  // Note: We are fetching up to 50 items. For full pagination, we would need to implement it properly.
  // The REST API returned 'articlesCount', but the simple 'articles' query might not return total count directly
  // unless we use a paginated query structure if available.
  // For now, we'll use the length of returned articles as a proxy or if the API supports a separate count query.
  // Given the previous REST API usage, let's stick to fetching the list.

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch articles for ${filterType}`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL Errors:', json.errors);
    throw new Error(`GraphQL Error: ${json.errors.map((e: any) => e.message).join(', ')}`);
  }

  const articlesData = json.data.articles || [];

  // Map GraphQL data to Article interface
  const articles = articlesData.map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    createdAt: item.createdAt,
    favoritesCount: item.favoritesCount || 0,
    mainImage: item.mainImage || '',
    images: item.images?.map((img: any) => img.url) || [],
    ver: item.ver,
    engine: item.engine, // Object or null
    platformList: item.platforms?.map((p: any) => p.name) || [],
    tagList: item.tags?.map((t: any) => t.name) || [],
    categoryList: item.categories?.map((c: any) => c.name) || [],
    author: {
      name: item.author?.name || 'Unknown',
      image: item.author?.image || '',
      // Default values for missing fields
      bio: '',
      backgroundImage: '',
      following: false
    },
    sequentialCode: item.sequentialCode,
    // Default values for fields not in this specific GraphQL query but in interface
    excerpt: '',
    publishedAt: item.createdAt,
    body: '',
    version: 0,
    favorited: false,
    updatedAt: item.createdAt,
    status: 'PUBLISHED',
  }));

  return {
    articles,
    articlesCount: articles.length, // Approximate count based on fetched limit
  };
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
    const uniqueAuthors = new Set(articles.map(article => article.author.name)).size;
    const allTags = articles.flatMap(article => article.tagList);
    const uniqueTags = new Set(allTags).size;
    const allCategories = articles.flatMap(article => article.categoryList);
    const uniqueCategories = new Set(allCategories).size;
    const allPlatforms = articles.flatMap(article => article.platformList);
    const uniquePlatforms = new Set(allPlatforms).size;
    const engines = articles.map(article => typeof article.engine === 'object' ? article.engine?.name : article.engine).filter(Boolean);
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
      const name = article.author.name;
      if (!acc[name]) {
        acc[name] = {
          author: article.author,
          articleCount: 0,
          totalFavorites: 0,
          articles: [],
        };
      }
      acc[name].articleCount++;
      acc[name].totalFavorites += article.favoritesCount;
      acc[name].articles.push(article);
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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-white/20 rounded-xl ${getFilterColor(filterType)}`}>
                    {getFilterIcon(filterType)}
                  </div>
                  <div className="text-sm opacity-80 flex items-center space-x-1">
                    <Link href={`/${locale}`} className="hover:underline">
                      {t('home')}
                    </Link>
                    <span>/</span>
                    <span className="capitalize">
                      {t(`filter_types.${filterType}`)}
                    </span>
                    <span>/</span>
                    <span>{decodedSlug}</span>
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
                  <Button asChild variant="outline" className="bg-white/10 border-white/30 hover:bg-white hover:text-primary" title={t(`rss_title_${filterType}`, { slug: decodedSlug })}>
                    <Link href={rssUrl}>
                      <RssIcon className="w-4 h-4 mr-2" />
                      {t('rss_feed')}
                    </Link>
                  </Button>
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
              <Card className="shadow-lg flex flex-col items-center justify-center p-4">
                <div className="text-primary mb-2">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="text-xs text-muted-foreground">{t('stats.articles')}</div>
                <div className="text-primary text-xl font-bold">{articlesCount}</div>
              </Card>

              <Card className="shadow-lg flex flex-col items-center justify-center p-4">
                <div className="text-secondary mb-2">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="text-xs text-muted-foreground">{t('stats.likes')}</div>
                <div className="text-secondary text-xl font-bold">{totalFavorites}</div>
              </Card>

              <Card className="shadow-lg flex flex-col items-center justify-center p-4">
                <div className="text-accent mb-2">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-xs text-muted-foreground">{t('stats.authors')}</div>
                <div className="text-accent text-xl font-bold">{uniqueAuthors}</div>
              </Card>

              <Card className="shadow-lg flex flex-col items-center justify-center p-4">
                <div className="text-info mb-2">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="text-xs text-muted-foreground">{t('stats.tags')}</div>
                <div className="text-info text-xl font-bold">{uniqueTags}</div>
              </Card>

              <Card className="shadow-lg flex flex-col items-center justify-center p-4">
                <div className="text-warning mb-2">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="text-xs text-muted-foreground">{t('stats.categories')}</div>
                <div className="text-warning text-xl font-bold">{uniqueCategories}</div>
              </Card>

              <Card className="shadow-lg flex flex-col items-center justify-center p-4">
                <div className="text-success mb-2">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="text-xs text-muted-foreground">{t('stats.engines')}</div>
                <div className="text-success text-xl font-bold">{uniqueEngines}</div>
              </Card>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Popular Tags */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {t('stats.popular_tags')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {popularTags.slice(0, 8).map(({ tag, count }) => (
                      <Link
                        key={tag}
                        href={`/${locale}/tag/${encodeURIComponent(tag)}`}
                        className="flex justify-between items-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        <Badge variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground">{tag}</Badge>
                        <span className="text-sm font-semibold text-foreground">{count}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Authors */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('stats.top_authors')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topAuthors.map((authorStat: any, index) => (
                      <div key={authorStat.author.name} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={authorStat.author.image || '/default-avatar.png'} alt={authorStat.author.name} />
                          <AvatarFallback>{authorStat.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground">{authorStat.author.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {t('author_stats', {
                              articleCount: authorStat.articleCount,
                              favoritesCount: authorStat.totalFavorites,
                            })}
                          </div>
                        </div>
                        <Badge variant="default">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {t('stats.additional_stats')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">{t('stats.total_platforms')}</div>
                      <div className="text-lg font-bold">{uniquePlatforms}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">{t('stats.game_engines')}</div>
                      <div className="text-lg font-bold">{uniqueEngines}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">{t('stats.avg_likes')}</div>
                      <div className="text-lg font-bold">
                        {articlesCount > 0 ? Math.round(totalFavorites / articlesCount) : 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Articles Showcase */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {t('stats.recent_articles')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/${locale}/articles/${article.slug}`}
                        className="flex gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer block"
                      >
                        <Avatar className="w-12 h-12 rounded-lg">
                          <ImageWithFallback src={article.mainImage} alt={article.title} className="object-cover" type="nextImage" fill={true} />
                          <AvatarFallback>{article.title.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-muted-foreground">
                              {new Date(article.createdAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {typeof article.engine === 'object' ? article.engine?.name : article.engine}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Heart className="w-3 h-3" />
                            <span className="text-xs">{article.favoritesCount}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Most Popular Articles */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {t('stats.most_popular')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularArticles.map((article, index) => (
                      <Link
                        key={article.id}
                        href={`/${locale}/articles/${article.slug}`}
                        className="flex gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer block"
                      >
                        <Avatar className="w-12 h-12 rounded-lg">
                          <ImageWithFallback src={article.mainImage} alt={article.title} className="object-cover" type="nextImage" fill={true} />
                          <AvatarFallback>{article.title.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-muted-foreground">
                              {t('by_author', { username: article.author.name })}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {typeof article.engine === 'object' ? article.engine?.name : article.engine}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-red-500">
                              <Heart className="w-3 h-3" />
                              <span className="text-xs font-semibold">{article.favoritesCount}</span>
                            </div>
                            <Badge variant="default">#{index + 1}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Articles Section */}
        <div className="container mx-auto px-4 pb-12">
          <div className="bg-card rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                {getFilterIcon(filterType)}
                {t('stats.articles')}
              </h2>

              {/* Sort/Filter Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {t('sort.label')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52">
                  <DropdownMenuItem>{t('sort.latest')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('sort.oldest')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('sort.most_popular')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('no_articles_title')}</h3>
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