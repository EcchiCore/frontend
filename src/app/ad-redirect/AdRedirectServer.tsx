// File: app/ad-redirect/AdRedirectServer.tsx
import React from 'react';
import AdRedirectContent from "./AdRedirectContent";
import crypto from 'crypto';
import { cookies } from 'next/headers';
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

interface AdRedirectServerProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdRedirectServer({ searchParams }: AdRedirectServerProps) {
    const encryptionKey = process.env.ENCRYPTION_KEY || 'w89esQq0cs28f49Gu4e29qC4QARLFXgx';
    const cookieStore = await cookies();
    const hasAuthToken = Boolean(cookieStore.get('token')?.value);

    const resolvedSearchParams = await searchParams;

    let decryptedUrl: string | null = null;
    if (typeof resolvedSearchParams.link === 'string') {
        decryptedUrl = decryptLink(resolvedSearchParams.link, encryptionKey);
    }

    const shouldBypassAds = hasAuthToken;

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
        !shouldBypassAds &&
        decryptedUrl &&
        apiToken &&
        shouldShortenWithShrtfly(decryptedUrl, includeDomains, excludeDomains)
    ) {
        redirectUrl = buildShrtflyUrl(normalizedBase, apiToken, decryptedUrl, advertMode);
    }

    if (!shouldBypassAds && apiToken) {
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
    if (!shouldBypassAds && inlineScriptContent) {
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

            <AdRedirectContent redirectUrl={redirectUrl} displayUrl={decryptedUrl} />
        </>
    );
}
