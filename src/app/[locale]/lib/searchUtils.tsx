// searchUtils.tsx

const MEILISEARCH_URL = process.env.NEXT_PUBLIC_MEILISEARCH_HOST_EXTERNAL;
const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY_EXTERNAL;

interface SearchFilters {
  categoryIds?: string[];
  tagIds?: string[];
  platformsIds?: string[];
  sequentialCode?: string | null;
}

interface SearchParams {
  query: string;
  page: number;
  filters?: SearchFilters;
  pageSize?: number;
  hybridSearch?: boolean;
}

export const searchArticles = async ({ query, page, filters, pageSize = 10 }: SearchParams) => {
  if (!MEILISEARCH_URL || !MEILISEARCH_API_KEY) {
    throw new Error('MeiliSearch configuration is missing');
  }

  const offset = (page - 1) * pageSize;
  const filterConditions: string[] = [];
  if (filters?.categoryIds?.[0]) filterConditions.push(`categories.id = "${filters.categoryIds[0]}"`);
  if (filters?.tagIds?.[0]) filterConditions.push(`tags.id = "${filters.tagIds[0]}"`);
  if (filters?.platformsIds?.[0]) filterConditions.push(`platforms.id = "${filters.platformsIds[0]}"`);
  if (filters?.sequentialCode) filterConditions.push(`sequentialCode = "${filters.sequentialCode}"`);

  const requestBody = {
    q: query || '',
    offset: offset,
    limit: pageSize,
    filter: filterConditions.length ? filterConditions : undefined,
    sort: ['updatedAt:desc'],
  };

  const response = await fetch(`${MEILISEARCH_URL}/indexes/article/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return {
    hits: data.hits || [],
    estimatedTotalHits: data.estimatedTotalHits || 0,
    offset: data.offset + 1,
    limit: pageSize,
    processingTimeMs: data.processingTimeMs || 0,
  };
};

export const fetchOptions = async (index: string) => {
  if (!MEILISEARCH_URL || !MEILISEARCH_API_KEY) {
    console.error(`MeiliSearch configuration missing for ${index}`);
    return [];
  }

  try {
    const response = await fetch(`${MEILISEARCH_URL}/indexes/${index}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      },
      body: JSON.stringify({
        q: '',
        limit: 100,
        sort: ['articleCount:desc'],
        attributesToRetrieve: ['id', 'name', 'articleCount'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch ${index}: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const data = await response.json();
    return (data.hits || []).map((item: any) => ({
      id: String(item.id),
      name: item.name || 'Unknown',
      articleCount: item.articleCount || 0,
    }));
  } catch (error) {
    console.error(`Error fetching ${index}:`, error);
    return [];
  }
};

export const fetchCategories = () => fetchOptions('category');
export const fetchTags = () => fetchOptions('tag');
export const fetchPlatforms = () => fetchOptions('platform');

export const testMeiliSearchConnection = async () => {
  if (!MEILISEARCH_URL || !MEILISEARCH_API_KEY) {
    return { success: false, error: 'Configuration missing' };
  }

  try {
    const response = await fetch(`${MEILISEARCH_URL}/health`);
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};