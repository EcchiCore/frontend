import { NextResponse } from 'next/server';

// n8n Translation Interface
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

const n8nWebhookUrl = process.env.N8N_TRANSLATION_WEBHOOK_URL; // Webhook URL for n8n translation workflow

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, body: articleBody, sourceLanguage = 'auto', targetLanguage = 'th', slug } = body;

    if (!n8nWebhookUrl) {
      console.error('N8N_TRANSLATION_WEBHOOK_URL is not configured');
      return NextResponse.json({ error: 'Translation service not configured' }, { status: 500 });
    }

    if (!title || !description || !articleBody || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const translationRequest: N8nTranslationRequest = {
      title,
      description,
      body: articleBody,
      sourceLanguage,
      targetLanguage,
      slug
    };

    // Retry logic: up to 3 attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Triggering n8n webhook for article translation: ${slug} (Attempt ${attempt}/3)`);

        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Optional: Add authentication headers if required
            // 'Authorization': `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`
          },
          body: JSON.stringify(translationRequest),
          signal: AbortSignal.timeout(60000) // 60 seconds for LLM processing
        });

        if (!response.ok) {
          console.error(`n8n webhook error: ${response.status} ${response.statusText} (Attempt ${attempt}/3)`);
          if (attempt === 3) {
            return NextResponse.json({ error: 'Translation service unavailable' }, { status: 503 });
          }
          continue;
        }

        const translationResult = await response.json() as N8nTranslationResponse;

        if (!translationResult.success) {
          console.error(`n8n translation failed: ${translationResult.error} (Attempt ${attempt}/3)`);
          if (attempt === 3) {
            return NextResponse.json({ error: translationResult.error || 'Translation failed' }, { status: 500 });
          }
          continue;
        }

        const translatedArticle: TranslatedArticle = {
          title: translationResult.translatedTitle,
          description: translationResult.translatedDescription,
          body: translationResult.translatedBody,
          slug
        };

        return NextResponse.json({ article: translatedArticle }, { status: 200 });

      } catch (error) {
        console.error(`Error triggering n8n webhook: ${error} (Attempt ${attempt}/3)`);
        if (attempt === 3) {
          return NextResponse.json({ error: 'Translation service error' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ error: 'Translation service unavailable after retries' }, { status: 503 });

  } catch (error) {
    console.error('Error processing translation request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}