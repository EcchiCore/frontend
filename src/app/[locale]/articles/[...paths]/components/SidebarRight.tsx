"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SidebarRightProps } from "./Interfaces";
import myImageLoader from "../../../lib/imageLoader";
import {
  BookmarkIcon as BookmarkOutline,
  UserPlusIcon,
  CheckIcon,
  CloudArrowDownIcon,
  EyeIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";

const SidebarRight: React.FC<SidebarRightProps> = ({
                                                     article,
                                                     isCurrentUserAuthor,
                                                     isFollowing,
                                                     handleFollow,
                                                     isFavorited,
                                                     handleFavorite,
                                                     formatDate,
                                                     downloads,
                                                     translationFiles,
                                                     setOpenDownloadDialog,
                                                     isDarkBackground,
                                                   }) => {
  const t = useTranslations('sidebar');

  const encodeURLComponent = (value: string) =>
    encodeURIComponent(value.trim()).replace(/%20/g, "%20").replace(/\//g, "%2F");

  // Function to format status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return t('status.published');
      case 'DRAFT':
        return t('status.draft');
      case 'ARCHIVED':
        return t('status.archived');
      default:
        return status;
    }
  };

  // Function to get status color and badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25';
      case 'DRAFT':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-500/25';
      case 'ARCHIVED':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25';
    }
  };

  return (
    <aside className="hidden md:block space-y-6">
      {/* Author Card */}
      <div
        className={`relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
          isDarkBackground
            ? "bg-gradient-to-br from-base-100/90 to-base-100/80 border border-base-content/10"
            : "bg-gradient-to-br from-white/90 to-base-200/90 border border-base-content/5"
        }`}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary rounded-full blur-2xl"></div>
          <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-secondary rounded-full blur-2xl"></div>
        </div>

        <div className="relative p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-75 group-hover:opacity-100 blur transition-all duration-300"></div>
              <Image
                loader={myImageLoader}
                src={article.author.image}
                alt={article.author.username}
                width={56}
                height={56}
                className="relative rounded-full ring-4 ring-base-100 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex-1">
              <Link
                href={`/profiles/${encodeURLComponent(article.author.username)}`}
                className="block text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:from-secondary hover:to-primary transition-all duration-300"
              >
                {article.author.username}
              </Link>
              <p className="text-sm text-base-content/70 line-clamp-2 mt-1">
                {article.author.bio || t('author.noBio')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!isCurrentUserAuthor && (
              <button
                className={`group w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  isFollowing
                    ? "bg-gradient-to-r from-base-300 to-base-300/80 text-base-content/80 hover:from-base-300/90 hover:to-base-300/70 shadow-lg"
                    : "bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40"
                }`}
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <CheckIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    {t('author.following')}
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    {t('author.follow')}
                  </>
                )}
              </button>
            )}

            <button
              className={`group w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                isFavorited
                  ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-500 hover:from-red-500/30 hover:to-pink-500/30 shadow-lg shadow-red-500/10"
                  : "bg-gradient-to-r from-base-300 to-base-300/80 text-base-content/70 hover:from-base-300/90 hover:to-base-300/70 shadow-lg"
              }`}
              onClick={handleFavorite}
            >
              {isFavorited ? (
                <>
                  <BookmarkSolid className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 text-red-500" />
                  {t('bookmark.bookmarked')}
                </>
              ) : (
                <>
                  <BookmarkOutline className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  {t('bookmark.bookmark')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Article Info Card */}
      <div
        className={`relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
          isDarkBackground
            ? "bg-gradient-to-br from-base-100/90 to-base-100/80 border border-base-content/10"
            : "bg-gradient-to-br from-white/90 to-base-200/90 border border-base-content/5"
        }`}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-info rounded-full blur-3xl"></div>
        </div>

        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-info to-info/80 rounded-xl">
              <EyeIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-base-content">
              {t('articleInfo.title')}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-base-content/60" />
                  <span className="text-sm font-medium text-base-content/70">{t('articleInfo.published')}:</span>
                </div>
                <span className="text-sm font-semibold text-base-content">
                  {formatDate(article.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-base-content/60" />
                  <span className="text-sm font-medium text-base-content/70">{t('articleInfo.updated')}:</span>
                </div>
                <span className="text-sm font-semibold text-base-content">
                  {formatDate(article.updatedAt)}
                </span>
              </div>

              {article.engine && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4 text-base-content/60" />
                    <span className="text-sm font-medium text-base-content/70">{t('articleInfo.engine')}:</span>
                  </div>
                  <span className="text-sm font-semibold text-base-content px-2 py-1 bg-primary/20 text-primary rounded-lg">
                    {article.engine}
                  </span>
                </div>
              )}

              {article.status && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <span className="text-sm font-medium text-base-content/70">{t('articleInfo.status')}:</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg ${getStatusStyle(article.status)}`}>
                    {getStatusText(article.status)}
                  </span>
                </div>
              )}

              {article.version && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-base-content/5 hover:bg-base-content/10 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 text-base-content/60 font-bold text-xs border border-base-content/60 rounded flex items-center justify-center">v</div>
                    <span className="text-sm font-medium text-base-content/70">{t('articleInfo.version')}:</span>
                  </div>
                  <span className="text-sm font-semibold text-base-content">
                    {article.version}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Downloads Card */}
      {(downloads.length > 0 || translationFiles.length > 0) && (
        <div
          className={`relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            isDarkBackground
              ? "bg-gradient-to-br from-base-100/90 to-base-100/80 border border-base-content/10"
              : "bg-gradient-to-br from-white/90 to-base-200/90 border border-base-content/5"
          }`}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-success rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-success to-success/80 rounded-xl">
                <CloudArrowDownIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-base-content">
                {t('downloads.title')}
              </h3>
            </div>

            <button
              className="group w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-success to-success/90 text-white font-medium shadow-lg shadow-success/25 hover:shadow-success/40 transition-all duration-300 transform hover:scale-105"
              onClick={() => setOpenDownloadDialog(true)}
            >
              <CloudArrowDownIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              {t('downloads.viewFiles', { count: downloads.length + translationFiles.length })}
              <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                {downloads.length + translationFiles.length}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Platforms Card */}
      {article.platformList?.length > 0 && (
        <div
          className={`relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            isDarkBackground
              ? "bg-gradient-to-br from-base-100/90 to-base-100/80 border border-base-content/10"
              : "bg-gradient-to-br from-white/90 to-base-200/90 border border-base-content/5"
          }`}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -right-4 -top-4 w-28 h-28 bg-warning rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-warning to-warning/80 rounded-xl">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-base-content">
                {t('platforms.title')}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {article.platformList.map((platform, index) => (
                <Link
                  href={`/platforms/${encodeURLComponent(platform)}`}
                  key={index}
                  className="group"
                >
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-warning/20 to-warning/30 text-warning hover:from-warning hover:to-warning/90 hover:text-white border border-warning/30 hover:border-warning transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md">
                    {platform}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tags Card */}
      {article.tagList?.length > 0 && (
        <div
          className={`relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            isDarkBackground
              ? "bg-gradient-to-br from-base-100/90 to-base-100/80 border border-base-content/10"
              : "bg-gradient-to-br from-white/90 to-base-200/90 border border-base-content/5"
          }`}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -left-6 -top-6 w-28 h-28 bg-primary rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl">
                <TagIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-base-content">
                {t('tags.title')}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {article.tagList.map((tag, index) => (
                <Link href={`/tag/${encodeURLComponent(tag)}`} key={index} className="group">
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary/20 to-primary/30 text-primary hover:from-primary hover:to-primary/90 hover:text-white border border-primary/30 hover:border-primary transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Card */}
      {article.categoryList?.length > 0 && (
        <div
          className={`relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
            isDarkBackground
              ? "bg-gradient-to-br from-base-100/90 to-base-100/80 border border-base-content/10"
              : "bg-gradient-to-br from-white/90 to-base-200/90 border border-base-content/5"
          }`}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-secondary to-secondary/80 rounded-xl">
                <FolderIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-base-content">
                {t('categories.title')}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {article.categoryList.map((category, index) => (
                <Link
                  href={`/category/${encodeURLComponent(category)}`}
                  key={index}
                  className="group"
                >
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-secondary/20 to-secondary/30 text-secondary hover:from-secondary hover:to-secondary/90 hover:text-white border border-secondary/30 hover:border-secondary transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md">
                    {category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarRight;