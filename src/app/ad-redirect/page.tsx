// File: app/ad-redirect/page.tsx
import React, { Suspense } from 'react';
import AdRedirectContent from "./AdRedirectContent";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
// ลบ import { motion } from 'framer-motion'; ออกเพราะไม่สามารถใช้ใน server component
import crypto from 'crypto';
import type { Metadata } from 'next';

function decryptLink(encryptedLink: string, encryptionKey: string): string | null {
  try {
    const [ivHex, encryptedHex] = decodeURIComponent(encryptedLink).split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const keyData = Buffer.from(encryptionKey, 'utf8');
    const usableKeyData = keyData.slice(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', usableKeyData, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

export const metadata: Metadata = {
  title: "Redirecting - Chanomhub",
  description: "Please wait while we redirect you to your destination safely and securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const encryptionKey = process.env.ENCRYPTION_KEY || 'w89esQq0cs28f49Gu4e29qC4QARLFXgx';

  const resolvedSearchParams = await searchParams; // Await searchParams เพื่อแก้ไข error

  let decryptedUrl: string | null = null;
  if (typeof resolvedSearchParams.link === 'string') {
    decryptedUrl = decryptLink(resolvedSearchParams.link, encryptionKey);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Redirecting - Chanomhub",
            "description": "Please wait while we redirect you to your destination safely and securely.",
            "publisher": {
              "@type": "Organization",
              "name": "Chanomhub"
            }
          })
        }}
      />

      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 flex justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            </div>
            <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-slate-950/80 rounded-2xl shadow-2xl border border-primary/20 relative z-10">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary flex items-center justify-center gap-2">
                  Loading... <Sparkles className="h-8 w-8 animate-spin" />
                </CardTitle>
              </CardHeader>
              <CardContent className="py-8 flex justify-center">
                {/* ใช้ div ธรรมดาแทน motion.div และเพิ่ม class สำหรับ animation */}
                <div className="animate-spin">
                  <Loader2 className="h-16 w-16 text-primary drop-shadow-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <AdRedirectContent initialUrl={decryptedUrl} />
      </Suspense>
    </>
  );
}