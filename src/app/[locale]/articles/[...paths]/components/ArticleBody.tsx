"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import myImageLoader from "../../../lib/imageLoader";
import { ArticleBodyProps } from "./Interfaces";
import { useTranslations } from 'next-intl';

const ArticleBody: React.FC<ArticleBodyProps> = ({
                                                   content,
                                                   article,
                                                   selectedImage,
                                                   setSelectedImage,
                                                   handleOpenLightbox,
                                                   isDarkBackground,
                                                   isTranslated,
                                                   slug,
                                                 }) => {
  const [showAlert, setShowAlert] = useState(false);
  const t = useTranslations('ArticleBody');

  const handleCopyCode = async () => {
    if (article.sequentialCode) {
      try {
        await navigator.clipboard.writeText(article.sequentialCode);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <>
      {showAlert && (
        <div className="fixed top-4 right-4 bg-success text-success-content px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          {t('copySuccess')}
        </div>
      )}
      {article.images && article.images.length > 0 && (
        <div className="my-6">
          <div className="mb-6 flex items-start justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-base-content">
              {article.title} {article.ver && <span className="text-secondary">[{article.ver}]</span>}
            </h1>
            {article.sequentialCode && (
              <button
                onClick={handleCopyCode}
                className="text-primary font-medium text-sm md:text-base hover:bg-primary/10 px-2 py-1 rounded transition-colors cursor-pointer"
                title={t('copyButtonTitle')}
              >
                {article.sequentialCode}
              </button>
            )}
          </div>

          <div
            className={`relative h-64 md:h-80 rounded-xl overflow-hidden bg-base-200 flex justify-center items-center border border-base-content/20 shadow-lg`}
          >
            <Image
              loader={myImageLoader}
              src={selectedImage}
              alt="ภาพที่เลือก"
              fill
              className="object-contain rounded-xl cursor-pointer transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              onClick={() =>
                handleOpenLightbox(
                  article.images?.findIndex((img) => img === selectedImage) || 0
                )
              }
            />
          </div>
          <div className="mt-4">
            <div
              id="thumbnail-container"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3"
            >
              {article.images &&
                article.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-full h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 shadow-md ${
                      selectedImage === image
                        ? "border-3 border-primary ring-2 ring-primary/50 shadow-lg"
                        : "border-2 border-base-content/20 hover:border-primary hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      loader={myImageLoader}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                      quality={80}
                      loading="lazy"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className={`my-6 leading-relaxed text-base-content ${isDarkBackground ? "text-base-content" : "text-base-content"}`}>
        {content}
      </div>
      {!isTranslated && (
        <div className="mt-6">
          <Link href={`/articles/${slug}/translate`} className="inline-flex items-center text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {t('translateLink')}
          </Link>
        </div>
      )}
    </>
  );
};

export default ArticleBody;