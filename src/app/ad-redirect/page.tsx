// File: app/ad-redirect/page.tsx
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Redirecting - Chanomhub",
  description: "Please wait while we redirect you to your destination safely and securely.",
  robots: {
    index: false,
    follow: false,
  },
};

// Loading fallback component
function LoadingFallback() {
  return (
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
          <div className="animate-spin">
            <Loader2 className="h-16 w-16 text-primary drop-shadow-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dynamic import of the actual content to defer runtime data access
import AdRedirectServer from './AdRedirectServer';

export default function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
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
      <Suspense fallback={<LoadingFallback />}>
        <AdRedirectServer searchParams={searchParams} />
      </Suspense>
    </>
  );
}