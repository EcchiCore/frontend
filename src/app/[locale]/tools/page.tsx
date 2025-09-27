import { Inter } from 'next/font/google';
import { ToolsClient } from './ToolsClient';
import Navbar from "@/app/[locale]/components/Navbar";
import { headers } from 'next/headers';
import { Tool } from '@/types/tool';

const inter = Inter({ subsets: ['latin'] });

// Metadata สำหรับ SEO
export async function generateMetadata() {
  return {
    title: 'เครื่องมือสุดเจ๋งของเรา',
    description: 'ค้นพบเครื่องมือที่ช่วยจัดการเกม แปลภาษา และใช้งานได้ทุกแพลตฟอร์ม',
    keywords: ['Chanomhub', 'เครื่องมือ', 'โปรแกรม', 'T++', 'Chanomhub-Desktop', 'Chanomhub-Multiplatform', 'nst'],
  };
}

// Server Component ส่งข้อมูลไปให้ Client Component
export default async function ToolsPage() {
  const tools: Tool[] = [
    {
      name: 'T++',
      description: 'เครื่องมือช่วยแปลภาษาเกม ทำให้เกมเข้าถึงผู้เล่นทั่วโลกได้ง่ายขึ้น',
      link: 'https://dreamsavior.net/download/',
      icon: 'Globe',
      os: ['Windows'],
      pricing: 'paid',
    },
    {
      name: 'Chanomhub-Desktop',
      description: 'แพลตฟอร์มสำหรับโหลดและจัดการเกมบนคอมพิวเตอร์ ใช้งานง่าย สะดวกสุดๆ',
      link: 'https://github.com/Chanomhub/Chanomhub-Desktop/releases',
      icon: 'Download',
      os: ['Windows', 'macOS', 'Linux'],
      pricing: 'free',
    },
    {
      name: 'Chanomhub-Multiplatform',
      description: 'แพลตฟอร์มสำหรับจัดการเกมบนมือถือ รองรับทั้ง iOS และ Android',
      link: 'https://github.com/Chanomhub/Chanomhub-Multiplatform',
      icon: 'Smartphone',
      os: ['Android', 'iOS'],
      pricing: 'free',
    },
    {
      name: 'NST',
      description: 'เครื่องมือแปลภาษาเกมอีกตัว ช่วยปรับแต่งข้อความในเกมให้หลากหลายภาษา',
      link: '/nst',
      icon: 'Globe',
      os: ['Windows', 'Linux', 'macOS'],
      pricing: ['free', 'paid'],
    },
  ];

  // SSR: Detect user's OS from User-Agent to recommend suitable tools
  const ua = ((await headers()).get('user-agent') || '').toLowerCase();
  let preferredOS: string | undefined = undefined;
  if (/android/.test(ua)) preferredOS = 'Android';
  else if (/iphone|ipad|ipod|ios/.test(ua)) preferredOS = 'iOS';
  else if (/windows/.test(ua)) preferredOS = 'Windows';
  else if (/mac os x|macintosh|mac os/.test(ua)) preferredOS = 'macOS';
  else if (/linux/.test(ua)) preferredOS = 'Linux';
  else preferredOS = 'Web';
 
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 ${inter.className}`}>
      <Navbar />
      <ToolsClient tools={tools} preferredOS={preferredOS} />
    </div>
  );
}