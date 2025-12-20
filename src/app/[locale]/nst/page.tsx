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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import Image from "next/image";
import { Metadata } from 'next';
import { TriangleAlert, Download, Calendar, FileArchive, ChevronDown, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'NST: Game Translator for Linux | Chanomhub',
  description: 'ดาวน์โหลด NST โปรแกรมแปลเกมสำหรับ Linux ที่เขียนด้วย C++ เพื่อประสิทธิภาพสูงสุด แปลเกมที่คุณชื่นชอบได้ง่ายๆ และทลายกำแพงภาษาในโลกของเกม',
  icons: {
    icon: 'https://cdn.chanomhub.online/icon.png',
  },
};

// SVG Icon Components
const LinuxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 13.371h20v-1.942H2v1.942zm10.659-5.815l-1.131-3.445h-1.056l-1.131 3.445h3.318zM2 15.313v-1.942h20v1.942H2zm10.019 3.932c.82 0 1.485-.665 1.485-1.485s-.665-1.485-1.485-1.485c-.82 0-1.485.665-1.485 1.485s.665 1.485 1.485 1.485zm-1.056-5.874h2.112v3.884h-2.112v-3.884zM12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
  content_type: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  html_url: string;
  assets: GitHubAsset[];
  published_at: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Format date to Thai
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}



async function getAllReleases(): Promise<GitHubRelease[]> {
  try {
    const res = await fetch('https://api.github.com/repos/NST-Ghost/NST-Ghost/releases', {
      next: { revalidate: 1800 }, // Cache for 30 minutes
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch releases:', res.statusText);
      return [];
    }

    const releases = await res.json();
    return releases.filter((r: GitHubRelease) => !r.draft); // Filter out drafts
  } catch (error) {
    console.error('Failed to fetch releases:', error);
    return [];
  }
}

// Release Card Component
function ReleaseCard({ release, isLatest = false }: { release: GitHubRelease; isLatest?: boolean }) {
  const linuxAsset = release.assets.find(a =>
    (a.name.toLowerCase().includes('linux') || a.name.toLowerCase().includes('x86_64')) &&
    (a.name.endsWith('.tar.gz') || a.name.endsWith('.tar.xz') || a.name.endsWith('.AppImage'))
  );

  const windowsAsset = release.assets.find(a =>
    (a.name.toLowerCase().includes('windows') || a.name.toLowerCase().includes('msvc')) &&
    (a.name.endsWith('.zip') || a.name.endsWith('.exe'))
  );

  const totalDownloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0);

  return (
    <Card className={isLatest ? "border-primary/50 shadow-lg" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{release.name || release.tag_name}</CardTitle>
              {isLatest && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                  ล่าสุด
                </span>
              )}
              {release.prerelease && (
                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                  Pre-release
                </span>
              )}
            </div>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Tag className="h-3 w-3" />
              <span className="font-mono text-xs">{release.tag_name}</span>
              <span>•</span>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(release.published_at)}</span>
            </CardDescription>
          </div>
          {totalDownloads > 0 && (
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-primary">{totalDownloads.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">ดาวน์โหลด</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {linuxAsset ? (
            <div>
              <Button asChild className="w-full" size={isLatest ? "default" : "sm"}>
                <a href={linuxAsset.browser_download_url}>
                  <Download className="mr-2 h-4 w-4" />
                  Linux
                </a>
              </Button>
              <div className="mt-1.5 text-center space-y-0.5">
                <p className="text-xs text-muted-foreground">{formatFileSize(linuxAsset.size)}</p>
                <p className="text-xs text-muted-foreground">
                  {linuxAsset.download_count.toLocaleString()} ครั้ง
                </p>
              </div>
            </div>
          ) : (
            <Button disabled size={isLatest ? "default" : "sm"} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Linux
            </Button>
          )}

          {windowsAsset ? (
            <div>
              <Button asChild variant="outline" className="w-full" size={isLatest ? "default" : "sm"}>
                <a href={windowsAsset.browser_download_url}>
                  <Download className="mr-2 h-4 w-4" />
                  Windows
                </a>
              </Button>
              <div className="mt-1.5 text-center space-y-0.5">
                <p className="text-xs text-muted-foreground">{formatFileSize(windowsAsset.size)}</p>
                <p className="text-xs text-muted-foreground">
                  {windowsAsset.download_count.toLocaleString()} ครั้ง
                </p>
              </div>
            </div>
          ) : (
            <Button disabled variant="outline" size={isLatest ? "default" : "sm"} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Windows
            </Button>
          )}
        </div>

        {/* Release Notes */}
        {release.body && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Release Notes</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-60">
                  {release.body}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* All Assets */}
        {release.assets.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>ไฟล์ทั้งหมด ({release.assets.length})</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-2">
                {release.assets.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileArchive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(asset.size)} • {asset.download_count.toLocaleString()} ครั้ง
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="ml-2">
                      <a href={asset.browser_download_url}>
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="pt-2">
          <Button asChild variant="link" size="sm" className="w-full text-xs">
            <a href={release.html_url} target="_blank" rel="noopener noreferrer">
              ดูรายละเอียดบน GitHub →
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function NstPromotionPage() {
  const allReleases = await getAllReleases();
  const latestRelease = allReleases[0] || null;
  const olderReleases = allReleases.slice(1);

  // Calculate total downloads across all releases
  const totalDownloads = allReleases.reduce((sum, release) => {
    return sum + release.assets.reduce((assetSum, asset) => assetSum + asset.download_count, 0);
  }, 0);

  const features = [
    {
      name: "สร้างเพื่อ Linux",
      description: "ออกแบบและพัฒนามาเพื่อทำงานบน Linux ได้อย่างราบรื่น",
      icon: LinuxIcon,
    },
    {
      name: "ประสิทธิภาพสูงด้วย C++",
      description: "เขียนด้วย C++ ทั้งหมด มั่นใจในความเร็วและทรัพยากรที่ต่ำ",
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
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src="https://cdn.chanomhub.online/icon.png"
              alt="NST Icon"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <h1 className="text-3xl font-bold">NST: Game Translator for Linux</h1>
          </div>
          <p className="text-muted-foreground">
            โปรแกรมแปลเกมบน Linux ที่เขียนด้วย C++ เพื่อประสิทธิภาพสูงสุด
          </p>
          {totalDownloads > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              ดาวน์โหลดทั้งหมด: <span className="font-bold text-primary">{totalDownloads.toLocaleString()}</span> ครั้ง
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Screenshot */}
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

            {/* Releases Section */}
            <Card>
              <CardHeader>
                <CardTitle>เวอร์ชันทั้งหมด</CardTitle>
                <CardDescription>
                  ดาวน์โหลด NST เวอร์ชันต่างๆ พร้อม Release Notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="latest" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="latest">เวอร์ชันล่าสุด</TabsTrigger>
                    <TabsTrigger value="older">เวอร์ชันเก่า ({olderReleases.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="latest" className="mt-4">
                    {latestRelease ? (
                      <ReleaseCard release={latestRelease} isLatest={true} />
                    ) : (
                      <Alert>
                        <AlertTitle>ไม่พบข้อมูล</AlertTitle>
                        <AlertDescription>
                          ไม่สามารถโหลดข้อมูล Release ได้ กรุณาลองใหม่อีกครั้ง
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="older" className="mt-4 space-y-4">
                    {olderReleases.length > 0 ? (
                      olderReleases.map((release) => (
                        <ReleaseCard key={release.id} release={release} />
                      ))
                    ) : (
                      <Alert>
                        <AlertTitle>ยังไม่มีเวอร์ชันเก่า</AlertTitle>
                        <AlertDescription>
                          ขณะนี้มีเฉพาะเวอร์ชันล่าสุดเท่านั้น
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Legacy Version */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>เวอร์ชัน Legacy (v0.3 - Rust)</span>
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-500 ring-1 ring-inset ring-orange-500/20">
                    Rust
                  </span>
                </CardTitle>
                <CardDescription>
                  เวอร์ชันเดิมที่เขียนด้วย Rust ก่อนที่จะ Rewrite ใหม่เป็น C++
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button asChild variant="secondary">
                  <a href="https://nst.chanomhub.online/NST-Linux-Dev-0.3.7z">
                    <Download className="mr-2 h-4 w-4" />
                    Linux (v0.3)
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a href="https://nst.chanomhub.online/NST-Windows-Dev-0.3.7z">
                    <Download className="mr-2 h-4 w-4" />
                    Windows (v0.3)
                  </a>
                </Button>
              </CardContent>
              <CardFooter>
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>คำเตือน</AlertTitle>
                  <AlertDescription>
                    เวอร์ชัน Rust นี้ไม่ได้รับการอัปเดตอีกต่อไป โปรเจกต์ได้ถูก Rewrite ใหม่ด้วย C++ แนะนำให้ใช้เวอร์ชันใหม่จาก GitHub แทน
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
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

            <Card>
              <CardHeader>
                <CardTitle>ลิงก์ที่เกี่ยวข้อง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="https://github.com/NST-Ghost/NST-Ghost" target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub Repository
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="https://github.com/NST-Ghost/NST-Ghost/issues" target="_blank" rel="noopener noreferrer">
                    <TriangleAlert className="mr-2 h-4 w-4" />
                    รายงานปัญหา / แนะนำ
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}