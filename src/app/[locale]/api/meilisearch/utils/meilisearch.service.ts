// MeiliSearch Service Implementation
import { MeiliSearch } from 'meilisearch';

interface LoggerError {
  message: string;
  stack?: string;
}

const logger = {
  error: (message: string, error?: LoggerError) => console.error(message, error)
};

export interface SearchOptions {
  fields?: string[];
  offset?: number;
  limit?: number;
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>;
  per_page?: number;
  page?: number;
  filters: string[];
  matchingStrategy?: 'all' | 'last';
  userId?: string;
  categoryId?: string | string[];
  tagId?: string | string[];
}

export interface SearchResult<T> {
  total: number;
  items: (T & { score: number })[];
  meta?: {
    page: number;
    per_page: number;
    total_pages: number;
    links?: {
      self: string;
      next?: string;
      prev?: string;
    };
  };
}

export class MeiliSearchService {
  private readonly meiliClient: MeiliSearch;

  constructor() {
    const { MEILISEARCH_HOST, MEILISEARCH_API_KEY } = process.env;

    if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
      throw new Error('Missing MeiliSearch configuration');
    }

    this.meiliClient = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY
    });
  }

  async search<T extends Record<string, any>>(indexName: string, query: string, options: SearchOptions): Promise<SearchResult<T>> {
    try {
      const index = this.meiliClient.index(indexName);

      const searchParams: any = {
        q: query,
      };

      // Add filter if exists
      if (options.filters.length > 0) {
        searchParams.filter = options.filters;
      }

      // Handle pagination
      if (options.page !== undefined && options.per_page !== undefined) {
        searchParams.page = options.page;
        searchParams.hitsPerPage = options.per_page;
      } else {
        searchParams.offset = options.offset || 0;
        searchParams.limit = options.limit || 10;
      }

      // Handle sorting
      if (options.sort && options.sort.length > 0) {
        searchParams.sort = options.sort.map(
          sortOption => `${sortOption.field}:${sortOption.order}`
        );
      }

      // Handle attribute restriction
      if (options.fields && options.fields.length > 0) {
        searchParams.attributesToRetrieve = options.fields;
        searchParams.attributesToSearchOn = options.fields;
      }

      // Handle matching strategy
      if (options.matchingStrategy) {
        searchParams.matchingStrategy = options.matchingStrategy;
      }

      // Show ranking score
      searchParams.showRankingScore = true;

      const response = await index.search<T>(query, searchParams);

      return {
        total: response.estimatedTotalHits || 0,
        items: response.hits.map(hit => ({
          ...hit,
          score: (hit as any)._rankingScore || 0
        }) as T & { score: number }),
        meta: this.buildMeta(options, response.estimatedTotalHits || 0)
      };
    } catch (error: unknown) {
      logger.error(`Search error in index ${indexName}:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async searchAll(query: string, options: SearchOptions = { filters: [] }) {
    // Since we only have the article index, we only search that
    const articles = await this.searchArticles(query, options);
    return [
      { total: 0, items: [], meta: { page: 1, per_page: 10, total_pages: 0 } }, // Empty users result
      articles,
      { total: 0, items: [], meta: { page: 1, per_page: 10, total_pages: 0 } }  // Empty categories result
    ];
  }

  private buildMeta(options: SearchOptions, total: number) {
    const page = options.page || 1;
    const per_page = options.per_page || 10;
    const totalPages = Math.ceil(total / per_page);

    return {
      page,
      per_page,
      total_pages: totalPages,
      links: {
        self: `/search?page=${page}&per_page=${per_page}`,
        next: page < totalPages ? `/search?page=${page + 1}&per_page=${per_page}` : undefined,
        prev: page > 1 ? `/search?page=${page - 1}&per_page=${per_page}` : undefined
      }
    };
  }

  // ใช้แค่ searchArticles เท่านั้นเพราะมีแค่ index article เท่านั้น
  searchArticles(query: string, options: SearchOptions) {
    return this.search<any>('article', query, {
      ...options,
      fields: options.fields || ['title', 'description', 'body']
    });
  }

  // ฟังก์ชันเหล่านี้ไม่ได้ใช้จริงเนื่องจากไม่มี indexes แต่เก็บไว้เพื่อความสมบูรณ์ของโค้ด
  searchUsers(query: string, options: SearchOptions) {
    return this.searchArticles(query, options); // ไม่มี users index จึงใช้ article แทน
  }

  searchCategories(query: string, options: SearchOptions) {
    return this.searchArticles(query, options); // ไม่มี categories index จึงใช้ article แทน
  }

  searchTags(query: string, options: SearchOptions) {
    return this.searchArticles(query, options); // ไม่มี tags index จึงใช้ article แทน
  }
}