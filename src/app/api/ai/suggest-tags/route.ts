import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { title, description, engine, platforms, availableTags } = await request.json();

        if (!title && !description && !engine) {
            return NextResponse.json(
                { error: 'At least Title, Description, or Engine is required' },
                { status: 400 }
            );
        }

        const prompt = `
      Analyze the following game information and suggest relevant tags.
      
      Game Details:
      Title: ${title || 'N/A'}
      Description: ${description || 'N/A'}
      Engine: ${engine || 'N/A'}
      Platforms: ${platforms ? platforms.join(', ') : 'N/A'}

      Available Tags (PRIORITIZE THESE):
      ${availableTags ? availableTags.join(', ') : 'None provided'}

      Instructions:
      1. **STRICTLY PRIORITIZE** selecting from the "Available Tags" list.
      2. Do NOT suggest tags that are just the names of the Platforms or Engines (e.g., do not suggest "Windows", "Unity" as tags if they are already covered by the platform/engine fields, UNLESS they are explicitly in the Available Tags list).
      3. You MAY suggest new tags ONLY if they are highly relevant, specific to the game's genre/theme, and completely missing from the list.
      4. Return ONLY a JSON object with a single key "suggestions" containing an array of strings.
      5. Do not include any other text.
      
      Example output:
      { "suggestions": ["RPG", "Fantasy", "Turn-Based"] }
    `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false,
            response_format: { type: 'json_object' },
        });

        const content = chatCompletion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from AI');
        }

        const result = JSON.parse(content);
        const suggestions = result.suggestions || [];

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error suggesting tags:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
