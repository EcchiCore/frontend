"use client";
import React from "react";
import Link from "next/link";

interface ArticleHeaderProps {
  isTranslated: boolean;
  translationInfo: {
    sourceLanguage: string;
    targetLanguage: string;
  } | null;
  slug: string;
}

const ArticleHeader: React.FC<ArticleHeaderProps> = ({
                                                       isTranslated,
                                                       translationInfo,
                                                       slug,
                                                     }) => (
  <div className="mb-6 md:mb-8">
    {isTranslated && (
      <div className="mb-4">
        <Link
          href={`/articles/${slug}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          กลับไปยังบทความต้นฉบับ
        </Link>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          แปลจาก{" "}
          {translationInfo?.sourceLanguage === "auto"
            ? "ภาษาที่ตรวจพบอัตโนมัติ"
            : translationInfo?.sourceLanguage}{" "}
          เป็น {translationInfo?.targetLanguage}
        </div>
      </div>
    )}
  </div>
);

export default ArticleHeader;