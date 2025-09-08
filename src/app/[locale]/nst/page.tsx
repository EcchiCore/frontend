// src/app/[locale]/nst/page.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import Image from "next/image";
import { Metadata } from 'next';
import { TriangleAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'NST: Game Translator for Linux | Chanomhub',
  description: 'ดาวน์โหลด NST โปรแกรมแปลเกมสำหรับ Linux ที่เขียนด้วย Rust เพื่อประสิทธิภาพสูงสุด แปลเกมที่คุณชื่นชอบได้ง่ายๆ และทลายกำแพงภาษาในโลกของเกม',
  icons: {
    icon: 'https://cdn.chanomhub.online/icon.png',
  },
};

// SVG Icon Components
const LinuxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 13.371h20v-1.942H2v1.942zm10.659-5.815l-1.131-3.445h-1.056l-1.131 3.445h3.318zM2 15.313v-1.942h20v1.942H2zm10.019 3.932c.82 0 1.485-.665 1.485-1.485s-.665-1.485-1.485-1.485c-.82 0-1.485.665-1.485 1.485s.665 1.485 1.485 1.485zm-1.056-5.874h2.112v3.884h-2.112v-3.884zM12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
);

const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const GiftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);


export default function NstPromotionPage() {
  const features = [
    {
      name: "สร้างเพื่อ Linux",
      description: "ออกแบบและพัฒนามาเพื่อทำงานบน Linux ได้อย่างราบรื่น",
      icon: LinuxIcon,
    },
    {
      name: "ประสิทธิภาพสูงด้วย Rust",
      description: "เขียนด้วย Rust ทั้งหมด มั่นใจในความเร็วและทรัพยากรที่ต่ำ",
      icon: ZapIcon,
    },
    {
      name: "แปลแบบ Real-time (คาดการณ์)",
      description: "แสดงคำแปลทันที (รอการยืนยันฟีเจอร์)",
      icon: ClockIcon,
    },
    {
      name: "ฟรีและใช้งานง่าย",
      description: "ดาวน์โหลดและเริ่มใช้งานได้ทันที ไม่มีค่าใช้จ่าย",
      icon: GiftIcon,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">NST: Game Translator for Linux</h1>
          <p className="text-muted-foreground">
            โปรแกรมแปลเกมบน Linux ที่เขียนด้วย Rust เพื่อประสิทธิภาพสูงสุด
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ภาพรวม</CardTitle>
                <CardDescription>
                  ภาพหน้าจอของแอปพลิเคชัน NST ขณะทำงาน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src="https://cdn.chanomhub.online/Screenshot_08-%E0%B8%81.%E0%B8%A2._15-15-36_10718.png"
                  alt="App screenshot"
                  width={1920}
                  height={1080}
                  className="rounded-md ring-1 ring-border"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader className="items-center text-center">
                <Image
                  className="mx-auto mb-4 rounded-lg"
                  src="https://cdn.chanomhub.online/icon.png"
                  alt="NST App Icon"
                  width={80}
                  height={80}
                />
                <CardTitle>NST Game Translator</CardTitle>
                <CardDescription>
                  ทลายกำแพงภาษาในโลกของเกม
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                  <Button asChild className="w-full">
                    <a href="https://nst.chanomhub.online/NST-Linux-dev-0.2.zip">
                      ดาวน์โหลด (Linux)
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <a href="https://nst.chanomhub.online/NST-Window-dev-0.2.zip">
                      ดาวน์โหลด (Win)
                    </a>
                  </Button>
              </CardContent>
              <CardFooter>
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>คำแนะนำ</AlertTitle>
                  <AlertDescription>
                    แม้ว่าจะรองรับ Windows แต่แอปนี้ถูกออกแบบมาเพื่อ Linux เป็นหลัก ฟังก์ชันบางอย่างบน Windows อาจทำงานได้ไม่สมบูรณ์
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>ฟีเจอร์เด่น</CardTitle>
                <CardDescription>
                  สร้างมาให้เล็ก ใช้งานง่าย และมีประสิทธิภาพ
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-6 gap-y-8">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <feature.icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{feature.name}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
