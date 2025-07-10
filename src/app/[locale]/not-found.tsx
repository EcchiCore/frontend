'use client';

import React from 'react';
import Link from 'next/link';
import { Home, RefreshCcw } from 'lucide-react';

export default function PageNotFound() {
  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-lg">
          <h1 className="text-8xl font-bold text-gray-800 animate-bounce">
            404
          </h1>

          <div className="opacity-0 animate-[fadeIn_0.8s_ease-out_0.3s_forwards]">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
            <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
            >
              <Home className="animate-bounce" size={20} />
              Go Home
            </Link>
            <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 hover:scale-105"
            >
              <RefreshCcw className="animate-bounce" size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>
  );
}