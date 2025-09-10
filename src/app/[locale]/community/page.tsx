// app/community/page.tsx
import Community from './Community';
import { PageObjectResponse, PartialPageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { validateDatabaseStructure, logDatabaseValidation } from '../lib/notion-validator';

// Type guard to check if a response is a full PageObjectResponse
function isFullPageObjectResponse(
  result: PageObjectResponse | PartialPageObjectResponse
): result is PageObjectResponse {
  return 'properties' in result;
}

async function getNotionData(): Promise<PageObjectResponse[]> {
  const { Client } = await import('@notionhq/client');
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.NOTION_DATABASE_ID;
  const notionToken = process.env.NOTION_TOKEN;

  if (!databaseId || !notionToken) {
    throw new Error('NOTION_DATABASE_ID and NOTION_TOKEN must be defined');
  }

  try {
    // Validate database structure in development
    if (process.env.NODE_ENV === 'development') {
      const validation = await validateDatabaseStructure(databaseId, notionToken);
      logDatabaseValidation(validation);
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      // Remove sorting for now to avoid property not found error
      // Will be sorted on the frontend
    });

    // Filter to only return full page objects with properties
    const pageResults = response.results.filter(
      (result): result is PageObjectResponse =>
        result.object === 'page' && isFullPageObjectResponse(result)
    );

    return pageResults;
  } catch (error) {
    console.error('❌ Error fetching Notion data:', error);

    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Could not find database')) {
        console.error('🔍 Database not found. Please check your NOTION_DATABASE_ID');
      } else if (error.message.includes('Unauthorized')) {
        console.error('🔐 Unauthorized access. Please check your NOTION_TOKEN and database permissions');
      } else if (error.message.includes('sort property')) {
        console.error('📊 Sort property not found. Database structure may be incomplete');
      }
    }

    return [];
  }
}

export default async function CommunityPage() {
  const pages = await getNotionData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Community initialPages={pages} />
    </div>
  );
}

export const revalidate = 30; // Revalidate every 30 seconds