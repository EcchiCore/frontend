import { Inter } from 'next/font/google';
import { ToolsClient } from './ToolsClient';
import Navbar from "@/app/[locale]/components/Navbar";
import { Tool } from '@/types/tool';
import { client } from '@/lib/sanity';

const inter = Inter({ subsets: ['latin'] });

// Metadata สำหรับ SEO
export async function generateMetadata() {
  return {
    title: 'เครื่องมือสุดเจ๋งของเรา',
    description: 'ค้นพบเครื่องมือที่ช่วยจัดการเกม แปลภาษา และใช้งานได้ทุกแพลตฟอร์ม',
    keywords: ['Chanomhub', 'เครื่องมือ', 'โปรแกรม', 'T++', 'Chanomhub-Desktop', 'Chanomhub-Multiplatform', 'nst'],
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
      <Navbar />
      <ToolsClient tools={tools} />
    </div>
  );
}
