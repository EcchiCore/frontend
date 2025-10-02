'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {useTranslations} from "next-intl";

async function decryptLink(encryptedLink: string, encryptionKey: string): Promise<string | null> {

  try {
    const [ivHex, encryptedHex] = decodeURIComponent(encryptedLink).split(':');
    const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
    const encryptedText = new Uint8Array(Buffer.from(encryptedHex, 'hex'));

    const keyData = new TextEncoder().encode(encryptionKey);
    const usableKeyData = keyData.slice(0, 32);

    const key = await crypto.subtle.importKey(
      'raw',
      usableKeyData,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      key,
      encryptedText
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

export default function AdRedirectContent(): React.ReactElement {
  const t = useTranslations("ad-redirect")
  const [countdown, setCountdown] = useState(3);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [encryptedLink, setEncryptedLink] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [domainName, setDomainName] = useState<string | null>(null);

  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'w89esQq0cs28f49Gu4e29qC4QARLFXgx';

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const link = urlParams.get('link');
      if (link) setEncryptedLink(link);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (encryptedLink && !decryptedUrl) {
      decryptLink(encryptedLink, encryptionKey).then((url) => {
        if (url) {
          setDecryptedUrl(url);
        }
      });
    }
  }, [encryptedLink, decryptedUrl, encryptionKey]);

  useEffect(() => {
    if (decryptedUrl) {
      const domain = getDomain(decryptedUrl);
      if (domain) {
        setFaviconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
        setDomainName(domain);
      }
    }
  }, [decryptedUrl]);

  const handleRedirect = () => {
    if (decryptedUrl) {
      window.location.href = decryptedUrl;
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">{t("Redirecting")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator />
          <div className="text-center mt-4">
            {faviconUrl && (
              <img src={faviconUrl} alt="Favicon" className="mx-auto mb-2 h-10 w-10" />
            )}
            {domainName && (
              <p className="text-sm text-muted-foreground mb-4">{domainName}</p>
            )}
            <p className="mb-4">
              Please wait <span className="font-bold text-primary">{countdown}</span> {t("countdown")}
            </p>
            <Progress value={(3 - countdown) * 100 / 3} className="w-full" />
          </div>
          <div className="mt-4">
            {countdown > 0 ? (
              <Button disabled className="w-full">Please wait ({countdown}s)</Button>
            ) : decryptedUrl ? (
              <Button className="w-full" onClick={handleRedirect}>{t("Continue")}</Button>
            ) : (
              <Button disabled className="w-full">{t("Decrypting")}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}