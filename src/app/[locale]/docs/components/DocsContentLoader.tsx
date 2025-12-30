import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { mdxComponents } from '../../components/mdx/MyComponent';

interface DocsContentLoaderProps {
    product: string;
    slug: string;
    locale: string;
}

export default async function DocsContentLoader({ product, slug, locale }: DocsContentLoaderProps) {
    // Construct path using process.cwd() for Vercel compatibility
    // content is located at src/app/[locale]/docs/contents/[product]/[slug].mdx
    const contentPath = path.join(process.cwd(), 'src/app/[locale]/docs/contents', product, `${slug}.mdx`);

    try {
        if (!fs.existsSync(contentPath)) {
            return (
                <div className="p-4 rounded-lg bg-red-50 text-red-500 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                    Content not found: {product}/{slug}
                </div>
            );
        }

        const source = fs.readFileSync(contentPath, 'utf8');

        const { content } = await compileMDX({
            source,
            components: mdxComponents,
            options: {
                parseFrontmatter: true,
            },
        });

        return content;
    } catch (error) {
        console.error('Error loading MDX:', error);
        return (
            <div className="p-4 rounded-lg bg-red-50 text-red-500 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                Error loading content: {(error as Error).message}
            </div>
        );
    }
}
