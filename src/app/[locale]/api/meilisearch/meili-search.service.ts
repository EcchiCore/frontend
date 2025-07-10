// meili-search.service.ts
import { MeiliSearch } from 'meilisearch';

interface LoggerError {
  message: string;
  stack?: string;
}

export interface SearchOptions {
  fields?: string[];
  offset?: number;
  limit?: number;
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>;
  per_page?: number;
  page?: number;
  filters: string[];
  matchingStrategy?: 'all' | 'last';
  authorId?: string;
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

const logger = {
  error: (message: string, error?: LoggerError) => console.error(message, error),
  info: (message: string) => console.log(message),
};

export class MeiliSearchService {
  private readonly meiliClient: MeiliSearch;
  private initialized = false;

  constructor() {
    const { MEILISEARCH_HOST, MEILISEARCH_API_KEY } = process.env;
    if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
      throw new Error('Missing MeiliSearch configuration');
    }
    this.meiliClient = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
    });
  }

  private async ensureIndexInitialized() {
    if (!this.initialized) {
      await this.initializeIndex();
      this.initialized = true;
    }
  }

  private async initializeIndex() {
    try {
      const index = this.meiliClient.index('article');
      // Check if index exists, create if not
      try {
        await index.getStats();
        logger.info('Index `article` already exists');
      } catch {
        logger.info('Index `article` not found, creating it...');
        const createTask = await this.meiliClient.createIndex('article');
        await this.meiliClient.waitForTask(createTask.taskUid);
      }
      // Update searchable attributes
      const searchableTask = await index.updateSearchableAttributes([
        'title',
        'description',
        'body',
        'mainImage',
        'categories',
        'tags',
        'status',
      ]);
      await this.meiliClient.waitForTask(searchableTask.taskUid);
      logger.info('Searchable attributes updated');
      // Update filterable attributes
      const filterableTask = await index.updateFilterableAttributes([
        'status',
        'authorId',
        'categories.id',
        'tags.id',
      ]);
      await this.meiliClient.waitForTask(filterableTask.taskUid);
      logger.info('Filterable attributes updated');
      logger.info('MeiliSearch index `article` settings applied successfully');
    } catch (error: unknown) {
      logger.error('Failed to initialize MeiliSearch index:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async search<T extends Record<string, any>>(indexName: string, query: string, options: SearchOptions): Promise<SearchResult<T>> {
    await this.ensureIndexInitialized();
    try {
      const index = this.meiliClient.index(indexName);
      const searchParams: any = {
        q: query,
      };
      if (options.filters.length > 0) {
        searchParams.filter = options.filters;
      }
      if (options.page !== undefined && options.per_page !== undefined) {
        searchParams.page = options.page;
        searchParams.hitsPerPage = options.per_page;
      } else {
        searchParams.offset = options.offset || 0;
        searchParams.limit = options.limit || 10;
      }
      if (options.sort && options.sort.length > 0) {
        searchParams.sort = options.sort.map(
          (sortOption) => `${sortOption.field}:${sortOption.order}`,
        );
      }
      if (options.fields && options.fields.length > 0) {
        searchParams.attributesToRetrieve = options.fields;
        searchParams.attributesToSearchOn = options.fields.filter((field) =>
          ['title', 'description', 'body', 'mainImage', 'categories', 'tags', 'status'].includes(field),
        );
      }
      if (options.matchingStrategy) {
        searchParams.matchingStrategy = options.matchingStrategy;
      }
      searchParams.showRankingScore = true;
      const response = await index.search<T>(query, searchParams);
      return {
        total: response.estimatedTotalHits || 0,
        items: response.hits.map((hit) => ({
          ...hit,
          score: (hit as any)._rankingScore || 0,
        }) as T & { score: number }),
        meta: this.buildMeta(options, response.estimatedTotalHits || 0),
      };
    } catch (error: unknown) {
      logger.error(`Search error in index ${indexName}:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async searchAll(query: string, options: SearchOptions = { filters: [] }) {
    const articles = await this.searchArticles(query, options);
    return [
      { total: 0, items: [], meta: { page: 1, per_page: 10, total_pages: 0 } },
      articles,
      { total: 0, items: [], meta: { page: 1, per_page: 10, total_pages: 0 } },
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
        prev: page > 1 ? `/search?page=${page - 1}&per_page=${per_page}` : undefined,
      },
    };
  }

  searchArticles(query: string, options: SearchOptions) {
    const defaultFields = ['title', 'description', 'body', 'mainImage', 'categories', 'tags', 'status'];
    const mergedFields = [...defaultFields, ...(options.fields || [])];
    return this.search<any>('article', query, {
      ...options,
      fields: Array.from(new Set(mergedFields)), // Ensure unique fields
    });
  }

  searchUsers(query: string, options: SearchOptions) {
    return this.search<any>('users', query, options);
  }

  searchCategories(query: string, options: SearchOptions) {
    return this.search<any>('categories', query, options);
  }

  searchTags(query: string, options: SearchOptions) {
    return this.search<any>('tags', query, options);
  }
}