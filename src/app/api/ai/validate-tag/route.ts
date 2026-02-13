import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';



export async function POST(request: Request) {
    try {
        const { tags } = await request.json();

        // Support both single 'tag' (legacy) and 'tags' array for backward compatibility if needed, 
        // but we will primarily use 'tags'.
        // If 'tag' is provided, wrap it in array.
        let tagsToValidate: string[] = [];
        if (tags && Array.isArray(tags)) {
            tagsToValidate = tags;
        } else {
            const { tag } = await request.clone().json(); // Clone because we already read body
            if (tag) tagsToValidate = [tag];
        }

        if (tagsToValidate.length === 0) {
            return NextResponse.json(
                { error: 'Tags are required' },
                { status: 400 }
            );
        }

        const prompt = `
      Analyze the following list of tags and determine if EACH one is a valid, appropriate, and meaningful tag for a video game.
      
      Tags to validate:
      ${JSON.stringify(tagsToValidate)}
      
      Criteria for INVALID tags:
      - Profanity, hate speech, or offensive content.
      - Gibberish, random characters, or nonsense (e.g., "asdf", "123123").
      - Spam or promotional links.
      
      Criteria for VALID tags:
      - Describes a genre, theme, mechanic, art style, or feature of a game.
      - Can be a specific term (e.g., "Cyberpunk", "Visual Novel") or a general concept (e.g., "Funny", "Dark").
      - Even if it's a niche term, if it looks like a real word/phrase, it's likely valid.
      
      Return ONLY a JSON object with a single key "results" containing an array of objects.
      Each object must have:
      - "tag": string (the original tag)
      - "isValid": boolean
      - "reason": string (short explanation if invalid, otherwise null)
      
      Example output:
      {
        "results": [
          { "tag": "RPG", "isValid": true, "reason": null },
          { "tag": "badword", "isValid": false, "reason": "Profanity" }
        ]
      }
    `;

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0,
            max_tokens: 1024, // Increased token limit for batch
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

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error validating tags:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
