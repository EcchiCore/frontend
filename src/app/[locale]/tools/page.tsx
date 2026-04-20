import { Inter } from 'next/font/google';
import { ToolsClient } from './ToolsClient';
import { Tool } from '@/types/tool';
import { client } from '@/lib/sanity';

const inter = Inter({ subsets: ['latin'] });

import { getTranslations } from 'next-intl/server';
import { locales } from '@/app/[locale]/lib/navigation';

export async function generateMetadata({ params }: { params: { locale?: string } }) {
  const locale = (params?.locale || 'en') as (typeof locales)[number];
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

// Server Component ส่งข้อมูลไปให้ Client Component
export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 ${inter.className}`}>
      <ToolsClient tools={tools} />
    </div>
  );
}
