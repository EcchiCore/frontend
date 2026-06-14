"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { GitCommit, Calendar, User, ChevronRight, ArrowLeft } from "lucide-react";
import { Article } from "@/types/article";
import ArticleCommunityTabs from "./ArticleCommunityTabs";
import { getArticleRevisions, Revision } from "@/lib/devlog-api";

interface ArticleDevlogPageProps {
  article: Article;
}

export function generateDevlogSlug(version: number, message?: string): string {
  if (!message || !message.trim()) {
    return `update-${version}`;
  }
  return message
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0e00-\u0e7f-]/g, "") // support Thai characters + english alpha
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ArticleDevlogPage: React.FC<ArticleDevlogPageProps> = ({ article }) => {
  const t = useTranslations("ArticleContent");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRevisions() {
      try {
        const response = await getArticleRevisions(article.slug);
        // Sort revisions in descending order (newest first)
        const sorted = (response.revisions || []).sort((a, b) => b.version - a.version);
        setRevisions(sorted);
      } catch (err) {
        console.error("Failed to load revisions", err);
      } finally {
        setLoading(false);
      }
    }
    loadRevisions();
  }, [article.slug]);

  return (
    <div className="min-h-screen bg-[#1b2838] text-[#c6d4df]">
      {/* Header */}
      <div className="bg-[#171a21] pt-6 pb-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-[#8F98A0] hover:text-white mb-2 text-sm uppercase font-bold tracking-wider">
            <Link href={`/articles/${article.slug}`}>
              {article.title}
            </Link>
            <span>&gt;</span>
            <span>Devlog</span>
          </div>
          <h1 className="text-2xl text-white font-medium mb-6 uppercase tracking-widest">
            {article.title} - {t("devlog.title")}
          </h1>
        </div>

        <ArticleCommunityTabs slug={article.slug} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href={`/articles/${article.slug}`}
            className="flex items-center gap-1.5 text-sm text-[#67c1f5] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("devlog.backToList")}</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#1a9fff] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#8f98a0] text-sm">Loading update log...</p>
          </div>
        ) : revisions.length === 0 ? (
          <div className="bg-[#1b2838]/50 border border-white/5 rounded p-8 text-center">
            <GitCommit className="w-12 h-12 text-[#4f535c] mx-auto mb-4" />
            <p className="text-[#8f98a0]">{t("devlog.noRevisions")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {revisions.map((revision) => {
              const dateStr = new Date(revision.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const detailSlug = generateDevlogSlug(revision.version, revision.message);
              const detailUrl = `/articles/${article.slug}/devlog/${revision.version}/${detailSlug}`;

              return (
                <Link
                  key={revision.version}
                  href={detailUrl}
                  className="block bg-[#16202d] hover:bg-[#202d3d] border border-white/5 hover:border-[#67c1f5]/30 rounded-lg p-5 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#1a9fff]/10 text-[#67c1f5] text-xs font-bold px-2.5 py-1 rounded border border-[#1a9fff]/20">
                          {t("devlog.version", { version: revision.version })}
                        </span>
                        <h3 className="text-white font-medium text-lg group-hover:text-[#67c1f5] transition-colors">
                          {revision.message || `Update #${revision.version}`}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8f98a0]">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {t("devlog.author", { author: revision.author.name })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {t("devlog.date", { date: dateStr })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          +{revision.stats.additions}
                        </span>
                        <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          -{revision.stats.deletions}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#4f535c] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDevlogPage;
