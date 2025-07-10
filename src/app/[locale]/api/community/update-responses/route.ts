// app/api/community/update-responses/route.ts
import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, responseCount } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Update the response count in Notion
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Responses: {
          number: responseCount || 0,
        },
      },
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error) {
    console.error('Error updating response count:', error);
    return NextResponse.json(
      { error: 'Failed to update response count' },
      { status: 500 }
    );
  }
}

// API route for updating problem status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, status } = body;

    if (!pageId || !status) {
      return NextResponse.json(
        { error: 'Page ID and status are required' },
        { status: 400 }
      );
    }

    // Update the status in Notion
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          select: {
            name: status,
          },
        },
      },
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}