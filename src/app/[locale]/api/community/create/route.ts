// app/api/community/create/route.ts
import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export async function POST(request: NextRequest) {
  try {
    if (!databaseId) {
      return NextResponse.json(
        { error: 'NOTION_DATABASE_ID is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title, description, category, priority, tags, author } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Create the page in Notion
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: description,
              },
            },
          ],
        },
        Status: {
          select: {
            name: 'Open',
          },
        },
        Category: {
          select: {
            name: category || 'General',
          },
        },
        Priority: {
          select: {
            name: priority || 'Medium',
          },
        },
        Author: {
          rich_text: [
            {
              text: {
                content: author || 'Anonymous',
              },
            },
          ],
        },
        DatePosted: {
          date: {
            start: new Date().toISOString().split('T')[0],
          },
        },
        Responses: {
          number: 0,
        },
        Tags: {
          multi_select: tags?.map((tag: string) => ({ name: tag })) || [],
        },
      },
    });

    return NextResponse.json({ success: true, id: response.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}