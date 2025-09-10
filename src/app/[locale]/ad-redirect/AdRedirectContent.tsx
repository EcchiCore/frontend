'use client';
import React, { useState, useEffect } from 'react';
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

  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'w89esQq0cs28f49Gu4e29qC4QARLFXgx';

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

    if (encryptedLink && !decryptedUrl) {
      decryptLink(encryptedLink, encryptionKey).then((url) => {
        if (url) setDecryptedUrl(url);
      });
    }
  }, [countdown, encryptedLink, decryptedUrl, encryptionKey]);

  const handleRedirect = () => {
    if (decryptedUrl) {
      window.location.href = decryptedUrl;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl font-bold">{t("Redirecting")}</h2>
          <div className="divider"></div>

          <div className="text-center">
            <p className="mb-4">
              Please wait <span className="font-bold text-primary">{countdown}</span> {t("countdown")}
            </p>
            <progress className="progress progress-primary w-full" value={3 - countdown} max={3}></progress>
          </div>

          <div className="card-actions justify-center">
            {countdown > 0 ? (
              <button className="btn btn-disabled btn-block">Please wait ({countdown}s)</button>
            ) : decryptedUrl ? (
              <button className="btn btn-primary btn-block" onClick={handleRedirect}>{t("Continue")}</button>
            ) : (
              <button className="btn btn-primary btn-block" disabled>{t("Decrypting")}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}