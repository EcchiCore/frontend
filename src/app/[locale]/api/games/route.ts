import { NextRequest, NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return req.cookies.get('token')?.value || null;
}

async function fetchTags() {
    const response = await fetch('https://api.chanomhub.online/api/tags');
    if (!response.ok) {
        throw new Error('Failed to fetch tags from backend');
    }
    return response.json();
}

async function fetchCategories() {
    const response = await fetch('https://api.chanomhub.online/api/categories');
    if (!response.ok) {
        throw new Error('Failed to fetch categories from backend');
    }
    return response.json();
}

async function validateTaxonomies(tags: string[], categories: string[]): Promise<{isValid: boolean, error: string | null}> {
    try {
        const [tagsData, catsData] = await Promise.all([
            getCached('tags', fetchTags),
            getCached('categories', fetchCategories),
        ]);

        const allowedTags = tagsData.tags || [];
        const allowedCategories = catsData.categories || [];

        for (const tag of tags) {
            if (!allowedTags.includes(tag)) {
                return { isValid: false, error: `Invalid tag: ${tag}` };
            }
        }

        for (const category of categories) {
            if (!allowedCategories.includes(category)) {
                return { isValid: false, error: `Invalid category: ${category}` };
            }
        }

        return { isValid: true, error: null };
    } catch (error) {
        console.error("Taxonomy validation error:", error);
        return { isValid: false, error: "Failed to validate tags or categories." };
    }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('--- Received Game Upload Data on Server ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('--- End of Server Data ---');
    const {
      title,
      description,
      body,
      ver,
      creator,
      engine,
      tags,
      categories,
      platforms,
      coverImage,
      mainImage,
      backgroundImage,
      otherImages,
    } = data;

    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!coverImage) missingFields.push('coverImage');
    if (!engine) missingFields.push('engine');
    if (!creator) missingFields.push('creator');

    if (missingFields.length > 0) {
      return NextResponse.json({ message: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    const validationResult = await validateTaxonomies(tags || [], categories || []);
    if (!validationResult.isValid) {
        return NextResponse.json({ message: validationResult.error }, { status: 400 });
    }

    const articleData: any = {
      title,
      description,
      body: body || description,
      ver,
      engine,
      status: 'DRAFT',
      coverImage: coverImage,
      images: [coverImage, ...(otherImages || [])],
      tagList: tags || [],
      categoryList: categories || [],
      platformList: platforms || [],
      creator,
    };

    if (mainImage) {
      articleData.mainImage = mainImage;
    }

    if (backgroundImage) {
      articleData.backgroundImage = backgroundImage;
    }

    const newArticle = {
      article: articleData,
    };

    // CHANGE: Set to true to send to production
    const isProduction = true;

    if (isProduction) {
      const backendResponse = await fetch('https://api.chanomhub.online/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newArticle),
      });

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        return NextResponse.json({ message: 'Backend API error', details: backendData }, { status: backendResponse.status });
      }

      return NextResponse.json({ message: 'Game uploaded successfully!', data: backendData }, { status: 200 });
    } else {
      // Simulate a successful response without sending to the backend
      console.log('--- MOCK MODE: Request not sent to backend ---');
      return NextResponse.json({
        message: 'Mock success: Game data was logged but not sent to the backend.',
        data: { article: { id: 'mock-id-12345', ...newArticle.article } }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'An error occurred during upload.' }, { status: 500 });
  }
}