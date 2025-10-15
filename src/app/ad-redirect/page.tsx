// File: app/ad-redirect/page.tsx
import React, { Suspense } from 'react';
import AdRedirectContent from "./AdRedirectContent";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
// ลบ import { motion } from 'framer-motion'; ออกเพราะไม่สามารถใช้ใน server component
import crypto from 'crypto';
import type { Metadata } from 'next';
import Script from 'next/script';
import { client } from '@/lib/sanity';

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

interface AdRedirectSettings {
  shrtflyUrl?: string;
  apiToken?: string;
  advertMode?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  externalScriptLoading?: 'defer' | 'async';
}

async function getAdRedirectSettings(): Promise<AdRedirectSettings | null> {
  const query = `*[_type == "adRedirectSettings" && isActive == true][0]{
    shrtflyUrl,
    apiToken,
    advertMode,
    includeDomains,
    excludeDomains,
    externalScriptLoading
  }`;

  try {
    const result = await client.fetch<AdRedirectSettings | null>(query);
    return result ?? null;
  } catch (error) {
    console.error('Failed to fetch ad redirect settings from Sanity:', error);
    return null;
  }
}

function normalizeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function domainListMatches(domains: string[], hostname: string): boolean {
  return domains
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean)
    .some((domain) => {
      if (domain.startsWith('*.')) {
        const suffix = domain.slice(2);
        return hostname === suffix || hostname.endsWith(`.${suffix}`);
      }

      return hostname === domain;
    });
}

function shouldShortenWithShrtfly(targetUrl: string, includeDomains: string[], excludeDomains: string[]): boolean {
  const hostname = normalizeHostname(targetUrl);
  if (!hostname) {
    return false;
  }

  const includeMatches = includeDomains.length === 0 || domainListMatches(includeDomains, hostname);
  const excludeMatches = excludeDomains.length > 0 && domainListMatches(excludeDomains, hostname);

  return includeMatches && !excludeMatches;
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function buildShrtflyUrl(baseUrl: string, apiToken: string, destinationUrl: string, advertMode: number): string {
  const normalizedBase = ensureTrailingSlash(baseUrl);
  const encodedUrl = Buffer.from(destinationUrl, 'utf8').toString('base64');
  return `${normalizedBase}full?api=${encodeURIComponent(apiToken)}&url=${encodedUrl}&type=${encodeURIComponent(advertMode.toString())}`;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const encryptionKey = process.env.ENCRYPTION_KEY || 'w89esQq0cs28f49Gu4e29qC4QARLFXgx';

  const resolvedSearchParams = await searchParams; // Await searchParams เพื่อแก้ไข error

  let decryptedUrl: string | null = null;
  if (typeof resolvedSearchParams.link === 'string') {
    decryptedUrl = decryptLink(resolvedSearchParams.link, encryptionKey);
  }

  const adSettings = await getAdRedirectSettings();
  const shrtflyBase = adSettings?.shrtflyUrl ?? 'https://shrtfly.com/';
  const advertMode = typeof adSettings?.advertMode === 'number' ? adSettings.advertMode : 1;
  const includeDomains = adSettings?.includeDomains ?? [];
  const excludeDomains = adSettings?.excludeDomains ?? [];
  const scriptLines: string[] = [];
  const normalizedBase = ensureTrailingSlash(shrtflyBase);
  const apiToken = adSettings?.apiToken?.trim();
  const scriptLoadingAttributes = adSettings?.externalScriptLoading === 'async'
    ? { async: true as const }
    : { defer: true as const };

  let redirectUrl: string | null = decryptedUrl;

  if (
    decryptedUrl &&
    apiToken &&
    shouldShortenWithShrtfly(decryptedUrl, includeDomains, excludeDomains)
  ) {
    redirectUrl = buildShrtflyUrl(normalizedBase, apiToken, decryptedUrl, advertMode);
  }

  if (apiToken) {
    scriptLines.push(`var app_url = ${JSON.stringify(normalizedBase)};`);
    scriptLines.push(`var app_api_token = ${JSON.stringify(apiToken)};`);
    scriptLines.push(`var app_advert = ${advertMode};`);

    if (includeDomains.length > 0) {
      scriptLines.push(`var app_domains = ${JSON.stringify(includeDomains)};`);
    }

    if (excludeDomains.length > 0) {
      scriptLines.push(`var app_exclude_domains = ${JSON.stringify(excludeDomains)};`);
    }
  }

  const inlineScriptContent = scriptLines.length > 0 ? scriptLines.join('\n') : null;

  let externalScriptUrl: string | null = null;
  if (inlineScriptContent) {
    try {
      externalScriptUrl = new URL('js/full-page-script.js', normalizedBase).toString();
    } catch (error) {
      console.error('Failed to build ShrtFly script URL:', error);
      externalScriptUrl = 'https://shrtfly.com/js/full-page-script.js';
    }
  }

  return (
    <>
      {inlineScriptContent && (
        <Script
          id="ad-redirect-inline"
          type="text/javascript"
          strategy="beforeInteractive"
        >
          {inlineScriptContent}
        </Script>
      )}

      {externalScriptUrl && (
        <Script
          id="ad-redirect-external"
          src={externalScriptUrl}
          strategy="afterInteractive"
          {...scriptLoadingAttributes}
        />
      )}

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
        <AdRedirectContent redirectUrl={redirectUrl} displayUrl={decryptedUrl} />
      </Suspense>
    </>
  );
}