// components/ErrorCard.tsx
"use client";

import React from 'react';

interface ErrorCardProps {
  locale: string;
}

export default function ErrorCard({ locale }: ErrorCardProps) {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-error">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="card-title justify-center text-error">
            {locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error Occurred'}
          </h2>
          <p className="text-base-content/60 mb-4">
            {locale === 'th'
              ? 'เกิดข้อผิดพลาดในการโหลดบทความ กรุณาลองใหม่ภายหลัง'
              : 'Error loading articles. Please try again later.'
            }
          </p>
          <div className="card-actions justify-center">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              {locale === 'th' ? 'ลองใหม่' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}