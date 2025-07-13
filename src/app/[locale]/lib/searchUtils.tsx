// การกำหนด environment variables สำหรับ MeiliSearch
const MEILISEARCH_URL = "https://search.necroz.site";
const MEILISEARCH_API_KEY = "369773e2f7cbf64df2cbf12702103d0df6d1b25acaa7fef95c8b1f6bcddf1510";

// อินเตอร์เฟซสำหรับ filters และ search params
interface SearchFilters {
  categoryIds?: string[];
  tagIds?: string[];
  platformsIds?: string[];
  sequentialCode?: string | null;
}

interface SearchHit {
  id: string;
  title?: string;
  [key: string]: any; // for other potential fields
}

interface SearchParams {
  query: string;
  page: number;
  filters?: SearchFilters;
  pageSize?: number;
  hybridSearch?: boolean;
}

// ฟังก์ชันสำหรับค้นหาบทความใน MeiliSearch
export const searchArticles = async ({ query, page, filters, pageSize = 10 }: SearchParams) => {
  console.log('🔍 searchArticles called with:', { query, page, filters, pageSize });

  if (!MEILISEARCH_URL || !MEILISEARCH_API_KEY) {
    throw new Error('MeiliSearch configuration is missing');
  }

  // คำนวณ offset
  const offset = (page - 1) * pageSize;
  console.log(`📊 Pagination calculation: page=${page}, pageSize=${pageSize}, offset=${offset}`);

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

  console.log('📤 MeiliSearch request:', {
    url: `${MEILISEARCH_URL}/indexes/article/search`,
    method: 'POST',
    body: JSON.stringify(requestBody, null, 2)
  });

  try {
    const response = await fetch(`${MEILISEARCH_URL}/indexes/article/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 MeiliSearch response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ MeiliSearch error response:', errorText);
      throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log('📋 MeiliSearch response data:', {
      estimatedTotalHits: data.estimatedTotalHits,
      actualHitsReturned: data.hits?.length,
      requestedOffset: offset,
      responseOffset: data.offset,
      requestedLimit: pageSize,
      responseLimit: data.limit,
      processingTimeMs: data.processingTimeMs,
      firstItemId: data.hits?.[0]?.id,
      lastItemId: data.hits?.[data.hits?.length - 1]?.id
    });

    // ตรวจสอบว่าได้ข้อมูลที่คาดหวังหรือไม่
    if (data.hits && data.hits.length > 0) {
      console.log('✅ Got results! First 3 item titles:',
        data.hits.slice(0, 3).map((hit: SearchHit) => hit.title || hit.id)
      );
    } else {
      console.log('⚠️ No results returned!');
    }

    return {
      hits: data.hits || [],
      estimatedTotalHits: data.estimatedTotalHits || 0,
      offset: data.offset + 1, // แสดงเลขเริ่มต้นของรายการในหน้านี้
      limit: pageSize,
      processingTimeMs: data.processingTimeMs || 0,
    };
  } catch (error) {
    console.error('💥 Search error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// ฟังก์ชันสำหรับ fetch ตัวเลือก (categories, tags, platforms)
const fetchOptions = async (index: string) => {
  if (!MEILISEARCH_URL || !MEILISEARCH_API_KEY) {
    console.error('MeiliSearch configuration is missing for fetching options');
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
        attributesToRetrieve: ['id', 'name', 'articleCount']
      }),
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${index}: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const options = (data.hits || []).map((item: any) => ({
      id: String(item.id),
      name: item.name || 'Unknown',
      articleCount: item.articleCount || 0,
    }));

    console.log(`Fetched ${index} options:`, options.length, 'items');
    return options;
  } catch (error) {
    console.error(`Error fetching ${index}:`, error);
    return [];
  }
};

// ฟังก์ชันสำหรับ fetch ข้อมูล categories, tags, และ platforms
export const fetchCategories = () => fetchOptions('category');
export const fetchTags = () => fetchOptions('tag');
export const fetchPlatforms = () => fetchOptions('platform');

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ MeiliSearch
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
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};