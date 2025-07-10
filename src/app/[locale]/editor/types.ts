import { z } from 'zod';

// Define the Zod schema for article data
export const ArticleSchema = z.object({
  article: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    body: z.string().min(1, "Body is required"),
    tagList: z.array(z.string()).optional(),
    categoryList: z.array(z.string()).optional(),
    status: z.string().optional(),
    mainImage: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export type ArticleData = z.infer<typeof ArticleSchema>;