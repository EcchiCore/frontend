"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SidebarRightProps } from "./Interfaces";



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

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("sidebar");

  const encodeURLComponent = (value: string) =>
    encodeURIComponent(value.trim()).replace(/%20/g, "%20").replace(/\//g, "%2F");

  const getStatusText = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return t("status.published");
      case "DRAFT":
        return t("status.draft");
      case "ARCHIVED":
        return t("status.archived");
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "success";
      case "DRAFT":
        return "warning";
      case "ARCHIVED":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <aside className="hidden md:block space-y-6">
      {/* Author Card */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={article.author.image}
                alt={article.author.username}
                width={56}
                height={56}
                className="rounded-full ring-2 ring-primary"
                onError={() => setError(true)}
                onLoad={() => setLoading(false)}
              />

            </div>
            <div>
              <Link
                href={`/profiles/${encodeURLComponent(article.author.username)}`}
                className="text-lg font-bold text-primary hover:underline"
              >
                {article.author.username}
              </Link>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {article.author.bio || t("author.noBio")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {!isCurrentUserAuthor && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                className="w-full flex items-center justify-center gap-2"
                onClick={handleFollow}
              >
                {isFollowing ? <CheckIcon className="w-5 h-5" /> : <UserPlusIcon className="w-5 h-5" />}
                {isFollowing ? t("author.following") : t("author.follow")}
              </Button>
            )}

            <Button
              variant={isFavorited ? "destructive" : "outline"}
              className="w-full flex items-center justify-center gap-2"
              onClick={handleFavorite}
            >
              {isFavorited ? <BookmarkSolid className="w-5 h-5" /> : <BookmarkOutline className="w-5 h-5" />}
              {isFavorited ? t("bookmark.bookmarked") : t("bookmark.bookmark")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Article Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <EyeIcon className="w-5 h-5 text-primary" />
            <CardTitle>{t("articleInfo.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("articleInfo.published")}:</span>
            </div>
            <span className="text-sm font-semibold">{formatDate(article.createdAt)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("articleInfo.updated")}:</span>
            </div>
            <span className="text-sm font-semibold">{formatDate(article.updatedAt)}</span>
          </div>

          {article.engine && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CpuChipIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("articleInfo.engine")}:</span>
              </div>
              <Badge variant="outline">{article.engine}</Badge>
            </div>
          )}

          {article.status && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-current rounded-full"></div>
                <span className="text-sm text-muted-foreground">{t("articleInfo.status")}:</span>
              </div>
              <Badge variant={getStatusVariant(article.status)}>{getStatusText(article.status)}</Badge>
            </div>
          )}

          {article.version && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("articleInfo.version")}:</span>
              </div>
              <Badge variant="secondary">v{article.version}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloads Card */}
      {(downloads.length > 0 || translationFiles.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CloudArrowDownIcon className="w-5 h-5 text-success" />
              <CardTitle>{t("downloads.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setOpenDownloadDialog(true)}
            >
              <CloudArrowDownIcon className="w-5 h-5" />
              {t("downloads.viewFiles", { count: downloads.length + translationFiles.length })}
              <Badge variant="secondary" className="ml-2">
                {downloads.length + translationFiles.length}
              </Badge>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Platforms, Tags, Categories */}
      {["platformList", "tagList", "categoryList"].map((key) => {
        const list = article[key as keyof typeof article] as string[] | undefined;
        if (!list || list.length === 0) return null;

        const iconMap: Record<string, React.ReactNode> = {
          platformList: <CpuChipIcon className="w-5 h-5 text-warning" />,
          tagList: <TagIcon className="w-5 h-5 text-primary" />,
          categoryList: <FolderIcon className="w-5 h-5 text-secondary" />,
        };

        const titleMap: Record<string, string> = {
          platformList: t("platforms.title"),
          tagList: t("tags.title"),
          categoryList: t("categories.title"),
        };

        const linkPrefixMap: Record<string, string> = {
          platformList: "/platforms/",
          tagList: "/tag/",
          categoryList: "/category/",
        };

        return (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {iconMap[key]}
                <CardTitle>{titleMap[key]}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {list.map((item, index) => (
                <Link href={`${linkPrefixMap[key]}${encodeURLComponent(item)}`} key={index}>
                  <Badge variant="outline" className={`cursor-pointer hover:scale-105 transition-transform`}>
                    {key === "tagList" ? `#${item}` : item}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </aside>
  );
};

export default SidebarRight;

