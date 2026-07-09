'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';
import {
  Download,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Loader2,
  Heart,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { decodeDownloadUrl } from '@/utils/downloadUrl';
import { getFileIcon, getFileSize } from '@/utils/fileUtils';

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export default function DownloadRedirectContent() {
  const t = useTranslations('download-redirect');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract params
  const encodedUrl = searchParams.get('url') || '';
  const rawName = searchParams.get('name') || '';
  const rawSize = searchParams.get('size') || '';

  const fileName = decodeURIComponent(rawName) || 'Unknown File';
  const sizeValue = rawSize ? parseFloat(decodeURIComponent(rawSize)) : null;
  const fileSize = sizeValue && !isNaN(sizeValue) ? getFileSize(sizeValue) : null;

  // Decrypt URL
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [isStorage, setIsStorage] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [isHoveringAd, setIsHoveringAd] = useState(false);
  const [adClicked, setAdClicked] = useState(false);

  // Initialize JuicyAds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        ((window as any).adsbyjuicy = (window as any).adsbyjuicy || []).push({ adzone: 1121869 });
      } catch (e) {
        console.error('JuicyAds initialization failed:', e);
      }
    }
  }, []);

  // Check terms accepted cookie on mount
  useEffect(() => {
    const accepted = getCookie('chanomhub_download_terms_accepted');
    if (accepted === 'true') {
      setTermsAccepted(true);
    }
  }, []);

  // Iframe click detection helper via blur event
  useEffect(() => {
    const handleBlur = () => {
      if (isHoveringAd) {
        setAdClicked(true);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isHoveringAd]);

  const handleAcceptTerms = () => {
    setCookie('chanomhub_download_terms_accepted', 'true', 365);
    setTermsAccepted(true);
  };

  useEffect(() => {
    if (encodedUrl) {
      const decoded = decodeDownloadUrl(encodedUrl);
      setDecryptedUrl(decoded);

      // Determine if it is storage.chanomhub.com
      const storageMatch = decoded.includes('storage.chanomhub.com') ||
        decoded.startsWith('premium/') ||
        decoded.startsWith('public/');
      setIsStorage(storageMatch);
    }
  }, [encodedUrl]);

  // Countdown timer and status messages
  useEffect(() => {
    const canStartCountdown = termsAccepted && (!isStorage || adClicked);

    if (countdown > 0 && canStartCountdown) {
      const timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, termsAccepted, isStorage, adClicked]);

  // Update status messages
  useEffect(() => {
    if (isStorage && !adClicked) {
      setStatusMessage(t('adUnlockWaiting'));
      return;
    }

    if (countdown === 5 || countdown === 4) {
      setStatusMessage(t('securingConnection'));
    } else if (countdown === 3 || countdown === 2) {
      setStatusMessage(t('checkingIntegrity'));
    } else if (countdown === 1) {
      setStatusMessage(t('generatingLink'));
    } else {
      setStatusMessage(t('downloadReady'));
    }
  }, [countdown, t, isStorage, adClicked]);

  // Auto-start download for storage files once countdown hits 0
  useEffect(() => {
    if (countdown === 0 && decryptedUrl && isStorage && !downloadTriggered) {
      setDownloadTriggered(true);
      triggerDownload();
    }
  }, [countdown, decryptedUrl, isStorage, downloadTriggered]);

  const triggerDownload = () => {
    if (!decryptedUrl) return;

    // For storage, we can trigger direct anchor download or window location
    if (isStorage) {
      const a = document.createElement('a');
      a.href = decryptedUrl;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // For external links, open in the current window or a new tab
      window.location.href = decryptedUrl;
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Extract external domain name
  const getDomainName = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'External Site';
    }
  };

  const targetDomain = decryptedUrl ? getDomainName(decryptedUrl) : '';

  if (!encodedUrl || !decryptedUrl) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Download Link</h2>
          <p className="text-slate-400 mb-6">The download URL is missing or has expired. Please go back to the article page and try again.</p>
          <Button onClick={handleGoBack} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!termsAccepted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 font-sans relative overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="max-w-4xl w-full mx-auto py-4 flex items-center justify-between z-10">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t('cancelButton')}
          </Button>
        </header>

        {/* Main Terms Box */}
        <main className="flex-1 flex items-center justify-center py-8 z-10">
          <div className="w-full max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                  🛡️ Rules & Terms
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {t('termsTitle')}
                </h1>
                <p className="text-slate-400 text-sm">
                  {t('termsSubtitle')}
                </p>
              </div>

              {/* File details context */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">
                  {getFileIcon(fileName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">You are downloading</p>
                  <p className="font-extrabold text-white text-sm truncate" title={fileName}>{fileName}</p>
                </div>
              </div>

              {/* Terms List */}
              <div className="space-y-3 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/60">
                <div className="flex gap-3 items-start text-sm">
                  <span className="text-rose-500 text-base shrink-0">🔞</span>
                  <p className="text-slate-300 leading-relaxed font-semibold">{t('termsItem1')}</p>
                </div>
                <div className="h-[1px] bg-slate-800/40" />
                <div className="flex gap-3 items-start text-sm">
                  <span className="text-cyan-500 text-base shrink-0">🔗</span>
                  <p className="text-slate-300 leading-relaxed font-semibold">{t('termsItem2')}</p>
                </div>
                <div className="h-[1px] bg-slate-800/40" />
                <div className="flex gap-3 items-start text-sm">
                  <span className="text-emerald-500 text-base shrink-0">🛡️</span>
                  <p className="text-slate-300 leading-relaxed font-semibold">{t('termsItem3')}</p>
                </div>
              </div>

              {/* Agree Checkbox */}
              <label
                htmlFor="terms-checkbox"
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 cursor-pointer select-none transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0 focus:outline-none"
                />
                <span className="text-sm font-bold text-slate-300">
                  {t('termsCheckbox')}
                </span>
              </label>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="h-12 font-bold rounded-xl order-2 sm:order-1"
                >
                  {t('cancelButton').replace(' & Go Back', '')}
                </Button>
                <Button
                  disabled={!checkboxChecked}
                  onClick={handleAcceptTerms}
                  className="h-12 font-black bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/10 hover:scale-[1.01] transition-all duration-150 order-1 sm:order-2 cursor-pointer"
                >
                  {t('termsButton')}
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-4xl w-full mx-auto py-6 border-t border-slate-900 text-center text-slate-600 text-xs">
          <p>© {new Date().getFullYear()} ChanomHub. All Rights Reserved.</p>
        </footer>
      </div>
    );
  }

  const progress = ((5 - countdown) / 5) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 font-sans relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl w-full mx-auto py-4 flex items-center justify-between z-10">
        <Button
          onClick={handleGoBack}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          {t('cancelButton')}
        </Button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 z-10 gap-4">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {isStorage ? (
              /* PREMIUM STORAGE DOWNLOAD LAYOUT */
              <motion.div
                key="storage"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
                    <Server className="h-3.5 w-3.5" />
                    Premium Cloud Storage
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {t('storageTitle')}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    {t('storageSubtitle')}
                  </p>
                </div>

                {/* File Details Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-4 shadow-inner">
                  <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40 shrink-0">
                    {getFileIcon(fileName)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-bold text-white text-base sm:text-lg truncate" title={fileName}>
                      {fileName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
                      {fileSize && (
                        <span className="px-2 py-0.5 rounded bg-slate-800">
                          {fileSize}
                        </span>
                      )}
                      <span className="flex items-center text-emerald-400 gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        100% Virus-Free
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loader Screen */}
                <div className="text-center space-y-4">
                  {!adClicked ? (
                    <div className="w-24 h-24 mx-auto rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/20 flex items-center justify-center shadow-lg mb-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent animate-pulse" />
                      <svg className="w-10 h-10 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  ) : countdown > 0 ? (
                    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                      {/* SVG Circular Loader */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="52"
                          className="stroke-slate-800"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="52"
                          className="stroke-cyan-500 transition-all duration-300"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 52}
                          strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-3xl font-black text-white tracking-wider">
                        {countdown}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/5 mb-2"
                    >
                      <Download className="h-10 w-10 animate-bounce" />
                    </motion.div>
                  )}

                  <p className="text-sm font-semibold tracking-wide text-cyan-400 animate-pulse px-4">
                    {statusMessage}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!adClicked ? (
                    <Button
                      disabled
                      size="lg"
                      className="w-full h-14 text-lg font-black bg-slate-800 text-slate-500 rounded-2xl border border-slate-700/50 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>{t('adUnlockWaiting')}</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={triggerDownload}
                      disabled={countdown > 0}
                      size="lg"
                      className="w-full h-14 text-lg font-black bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-2xl shadow-lg shadow-cyan-500/10 hover:scale-[1.01] transition-all duration-200"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      {countdown > 0 ? `Preparing link... (${countdown}s)` : t('startDownload')}
                    </Button>
                  )}
                </div>

                {/* Donation CTA */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-slate-950 border border-cyan-500/10 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 text-cyan-500/10 pointer-events-none">
                    <Heart className="h-16 w-16 fill-current" />
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Heart className="h-4 w-4 fill-cyan-400" />
                    {t('supportTitle')}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t('supportDesc')}
                  </p>
                  <Button
                    onClick={() => window.open(`/${locale}/donations`, '_blank')}
                    size="sm"
                    variant="outline"
                    className="text-xs font-black border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer w-full sm:w-auto"
                  >
                    {t('donateButton')}
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* EXTERNAL HOST REDIRECTION LAYOUT */
              <motion.div
                key="external"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    External Link Warning
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {t('externalTitle')}
                  </h1>
                </div>

                {/* Warning Banner */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex gap-3 text-amber-200 text-xs sm:text-sm leading-relaxed">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                  <p>{t('externalWarning')}</p>
                </div>

                {/* Target Information */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Destination host</span>
                  <div className="flex items-center justify-between text-white font-extrabold text-lg sm:text-xl">
                    <span className="truncate pr-4">{targetDomain}</span>
                    <ExternalLink className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-500 truncate" title={decryptedUrl}>
                    {decryptedUrl}
                  </div>
                </div>

                {/* Redirect Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                    <span>{statusMessage}</span>
                    {countdown > 0 && (
                      <span className="text-amber-400 font-bold">
                        {t('redirectingIn', { count: countdown })}
                      </span>
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="h-12 font-bold rounded-xl order-2 sm:order-1"
                  >
                    {t('cancelButton').replace(' & Go Back', '')}
                  </Button>
                  <Button
                    onClick={triggerDownload}
                    disabled={countdown > 0}
                    className="h-12 font-black bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/10 hover:scale-[1.01] transition-all duration-200 order-1 sm:order-2"
                  >
                    {countdown > 0 ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        <span>Wait... ({countdown}s)</span>
                      </div>
                    ) : (
                      <span>{t('continueButton')}</span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bouncing Pointer Arrow */}
        {isStorage && !adClicked && termsAccepted && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1 my-3 text-cyan-400 font-extrabold text-sm select-none"
          >
            <span className="animate-pulse">{t('adClickRequired')}</span>
            <div className="animate-bounce mt-1">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
          </motion.div>
        )}

        {/* JuicyAds Banner */}
        <div
          className="flex flex-col items-center justify-center p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl w-[340px] shadow-inner shrink-0 mt-4 transition-all duration-300"
          onMouseEnter={() => setIsHoveringAd(true)}
          onMouseLeave={() => setIsHoveringAd(false)}
        >
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-2">Advertisement</span>
          <ins
            id="1121869"
            data-width="300"
            data-height="250"
            style={{ display: 'inline-block', width: '300px', height: '250px' }}
          />
        </div>
      </main>


      {/* JuicyAds Script */}
      <Script
        type="text/javascript"
        src="https://poweredby.jads.co/js/jads.js"
        strategy="afterInteractive"
        data-cfasync="false"
      />
    </div>
  );
}
