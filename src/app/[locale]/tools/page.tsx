import { Inter } from 'next/font/google';
import { ToolsClient } from './ToolsClient';
import { Tool } from '@/types/tool';
import { client } from '@/lib/sanity';

const inter = Inter({ subsets: ['latin'] });

import { getTranslations } from 'next-intl/server';
import { locales } from '@/app/[locale]/lib/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale || 'en') as (typeof locales)[number];
  const t = await getTranslations({ locale, namespace: 'Tools' });
  return {
    title: t('title') + ' | Chanomhub',
    description: t('description'),
    keywords: t('keywords').split(','),
  };
}

async function getTools(): Promise<Tool[]> {
  const query = `*[_type == "tool"]{
    ...,
    versions[] | order(releaseDate desc)
  }`;
  const data = await client.fetch(query);
  return data;
}

export default async function ToolsPage() {
  let tools: Tool[] = [];
  try {
    tools = await getTools();
  } catch (error) {
    console.error('Error fetching tools from Sanity:', error);
    tools = [];
  }

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-50 selection:bg-zinc-800 overflow-x-hidden relative font-sans ${inter.className}`}>
      {/* Minimal Subtle Center Top Gradient matching ChanoX2 */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />

      <div className="relative z-10">
        <ToolsClient tools={tools} />
      </div>
    </div>
  );
}
