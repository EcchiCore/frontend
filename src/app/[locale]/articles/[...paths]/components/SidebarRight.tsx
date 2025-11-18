"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SidebarRightProps } from "./Interfaces";

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

import {
  BookmarkIcon as BookmarkOutline,
  UserPlusIcon,
  CheckIcon,
  EyeIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  CpuChipIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { Download } from "lucide-react";

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
                                                     setOpenDownloadDialog,
                                                     downloads,
                                                   }) => {
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

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "secondary" | "destructive" => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "DRAFT":
        return "secondary";
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
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={article.author.image || PLACEHOLDER_IMAGE}
                alt={article.author.name || "Author avatar"}
                width={56}
                height={56}
                className="rounded-full ring-2 ring-primary"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profiles/${encodeURLComponent(article.author.name)}`}
                className="text-lg font-bold text-primary hover:underline block truncate"
              >
                {article.author.name}
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

      {/* Downloads Card */}
      {downloads && downloads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <CardTitle>{t("downloads.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setOpenDownloadDialog()}
            >
              <Download className="w-5 h-5" />
              {t("downloads.viewAll")} ({downloads.length})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Article Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <EyeIcon className="w-5 h-5 text-primary" />
            <CardTitle>{t("articleInfo.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
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

          {article.creators && article.creators.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("articleInfo.creator")}:</span>
              </div>
              <span className="text-sm font-semibold text-right max-w-[60%] truncate" title={article.creators[0]?.name}>
                {article.creators[0]?.name}
              </span>
            </div>
          )}

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

          {article.ver && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("articleInfo.version")}:</span>
              </div>
              <Badge variant="secondary">v{article.ver}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platforms Card */}
      {article.platforms && article.platforms.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5 text-warning" />
              <CardTitle>{t("platforms.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {article.platforms.map((platform, index) => (
                <Link href={`/games?platform=${encodeURLComponent(platform.name)}`} key={index}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:scale-105 hover:bg-primary/10 transition-all duration-200"
                  >
                    {platform.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Card */}
      {article.tags && article.tags.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-primary" />
              <CardTitle>{t("tags.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Link href={`/games?tag=${encodeURLComponent(tag.name)}`} key={index}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:scale-105 hover:bg-primary/10 transition-all duration-200"
                  >
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Card */}
      {article.categories && article.categories.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderIcon className="w-5 h-5 text-secondary" />
              <CardTitle>{t("categories.title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {article.categories.map((category, index) => (
                <Link href={`/games?category=${encodeURLComponent(category.name)}`} key={index}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:scale-105 hover:bg-secondary/10 transition-all duration-200"
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};

export default SidebarRight;