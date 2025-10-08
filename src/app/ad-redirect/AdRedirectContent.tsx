'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // เพิ่ม framer-motion สำหรับ animation ที่สวยงาม

function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return '';
  }
}

function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

interface AdRedirectContentProps {
  initialUrl: string | null;
}

export default function AdRedirectContent({ initialUrl }: AdRedirectContentProps): React.ReactElement {
  const [countdown, setCountdown] = useState(5);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    setDecryptedUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleRedirect = () => {
    if (decryptedUrl) {
      window.location.href = decryptedUrl;
    }
  };

  const progressValue = ((5 - countdown) / 5) * 100;
  const faviconUrl = decryptedUrl ? getFaviconUrl(decryptedUrl) : '';
  const domain = decryptedUrl ? getDomain(decryptedUrl) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 flex justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* เพิ่ม background particles สำหรับความสวยงาม */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl"
          animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full blur-xl"
          animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-lg rounded-3xl shadow-2xl border-2 border-gradient-to-r from-primary/30 to-secondary/30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg relative overflow-hidden animate-glow">
          {/* เพิ่ม gradient border animation */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 animate-border-glow pointer-events-none" />

          <CardHeader className="items-center text-center pt-8 pb-4 relative z-10">
            <motion.div
              className="mb-6 relative"
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Image src="/icon.svg" alt="ChanomHub Logo" width={80} height={80} className="drop-shadow-lg" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
            </motion.div>
            <CardTitle className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300">
              Redirecting Securely ✨
            </CardTitle>
            <p className="text-slate-500 dark:text-slate-400 pt-2 px-4">Please wait while we check your destination with magic security.</p>
          </CardHeader>

          <CardContent className="p-8 relative z-10">
            <AnimatePresence mode="wait">
              {decryptedUrl ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-inner"
                >
                  <motion.div
                    className="w-14 h-14 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-slate-800 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 animate-pulse" />
                    {!faviconError && faviconUrl ? (
                      <img
                        src={faviconUrl}
                        alt="Site icon"
                        width={36}
                        height={36}
                        onError={() => setFaviconError(true)}
                        className="rounded-lg z-10 relative"
                      />
                    ) : (
                      <ExternalLink className="h-7 w-7 text-emerald-500 relative z-10" />
                    )}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">You are heading to:</p>
                    <motion.p
                      className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-200 dark:to-slate-400 truncate"
                      initial={{ scaleX: 0.8 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {domain}
                    </motion.p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl border border-red-200/50 dark:border-red-700/50"
                >
                  <Zap className="h-8 w-8 text-red-500 mx-auto mb-2 animate-bounce" />
                  <p className="font-bold text-red-600 dark:text-red-400 text-lg">Oops! Invalid or missing link.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center mb-10">
              <motion.div
                className="relative w-28 h-28 mx-auto flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Progress
                  value={progressValue}
                  className="absolute w-full h-full rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-secondary transition-all duration-1000 shadow-lg"
                />
                <motion.div
                  className="absolute text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-wider drop-shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {countdown}
                </motion.div>
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400 animate-ping" />
              </motion.div>
              <p className="text-sm text-slate-400 dark:text-slate-500 animate-pulse">Securing your journey...</p>
            </div>

            <div className="flex justify-center">
              <AnimatePresence mode="wait">
                {countdown > 0 ? (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Button disabled className="w-full h-14 text-xl font-bold cursor-not-allowed bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 animate-shimmer" />
                      <span className="relative z-10">Please Wait... ⏳</span>
                    </Button>
                  </motion.div>
                ) : decryptedUrl ? (
                  <motion.div
                    key="continue"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Button
                      className="w-full h-14 text-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl shadow-emerald-500/30 transform hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group"
                      onClick={handleRedirect}
                    >
                      <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-opacity duration-300" />
                      <ShieldCheck className="w-7 h-7 mr-3 relative z-10" />
                      <span className="relative z-10">Continue Safely 🚀</span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="invalid"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <Button disabled className="w-full h-14 text-xl font-bold bg-gradient-to-r from-red-500/60 to-red-600/60 text-white shadow-lg">
                      Invalid Link ❌
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}