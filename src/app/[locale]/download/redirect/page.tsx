'use client';

import React, { Suspense } from 'react';
import DownloadRedirectContent from './DownloadRedirectContent';

export default function DownloadRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p>Loading download redirector...</p>
      </div>
    }>
      <DownloadRedirectContent />
    </Suspense>
  );
}
