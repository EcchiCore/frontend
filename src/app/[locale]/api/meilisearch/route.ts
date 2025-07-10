// app/api/meilisearch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MeiliSearchService, SearchOptions, SearchResult } from './meili-search.service'; // Adjust the path as needed

// Define a type for the combined result in the 'all' case
interface AllSearchResult {
  articles: SearchResult<any>;
  users: SearchResult<any>;
  categories: SearchResult<any>;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const hasPagination = searchParams.has('page') || searchParams.has('per_page');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '10', 10);
    const options: SearchOptions = {
      fields: searchParams.get('fields')?.split(','),
      sort: searchParams.get('sort')?.split(',').map((param) => {
        const [field, order = 'asc'] = param.split(':');
        return { field, order: order as 'asc' | 'desc' };
      }),
      page: hasPagination ? page : undefined,
      per_page: hasPagination ? perPage : undefined,
      offset: hasPagination ? undefined : parseInt(searchParams.get('from') || '0', 10),
      limit: hasPagination ? undefined : parseInt(searchParams.get('size') || '10', 10),
      filters: [],
      matchingStrategy: searchParams.get('operator') === 'and' ? 'all' : 'last',
      authorId: searchParams.get('userId') || undefined,
      categoryId: searchParams.get('categoryId')?.includes(',')
        ? searchParams.get('categoryId')?.split(',')
        : searchParams.get('categoryId') || undefined,
      tagId: searchParams.get('tagId')?.includes(',')
        ? searchParams.get('tagId')?.split(',')
        : searchParams.get('tagId') || undefined,
    };
    if (options.authorId) {
      options.filters.push(`authorId = ${options.authorId}`);
    }
    if (options.categoryId) {
      const ids = Array.isArray(options.categoryId) ? options.categoryId : [options.categoryId];
      options.filters.push(`categories.id IN [${ids.join(', ')}]`);
    }
    if (options.tagId) {
      const ids = Array.isArray(options.tagId) ? options.tagId : [options.tagId];
      options.filters.push(`tags.id IN [${ids.join(', ')}]`);
    }
    const status = searchParams.get('status');
    if (status) {
      options.filters.push(`status = ${status}`);
    }
    const meiliService = new MeiliSearchService();
    let result: SearchResult<any> | AllSearchResult; // Union type for result
    switch (type) {
      case 'articles':
        result = await meiliService.searchArticles(query, options);
        break;
      case 'users':
        result = await meiliService.searchUsers(query, options);
        break;
      case 'categories':
        result = await meiliService.searchCategories(query, options);
        break;
      case 'tags':
        result = await meiliService.searchTags(query, options);
        break;
      case 'all':
      default:
        const articles = await meiliService.searchArticles(query, options);
        result = {
          articles,
          users: { total: 0, items: [], meta: { page: 1, per_page: 10, total_pages: 0 } },
          categories: { total: 0, items: [], meta: { page: 1, per_page: 10, total_pages: 0 } },
        };
        break;
    }

    // Calculate total based on the type
    let total: number;
    if (type === 'all') {
      const allResult = result as AllSearchResult;
      total = allResult.users.total + allResult.articles.total + allResult.categories.total;
    } else {
      total = (result as SearchResult<any>).total;
    }

    return NextResponse.json({
      query,
      type,
      total,
      _embedded: result,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'เกิดข้อผิดพลาดในการประมวลผล API',
        code: 'api_error',
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}