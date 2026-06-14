"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Calendar, User, ArrowLeft, GitCommit } from "lucide-react";
import { Article } from "@/types/article";
import ArticleCommunityTabs from "./ArticleCommunityTabs";
import { getArticleRevisionDetail, RevisionDetail, DiffLine } from "@/lib/devlog-api";

interface ArticleDevlogDetailProps {
  article: Article;
  version: number;
}

function parseDiffString(diffStr: string): DiffLine[] {
  if (!diffStr) return [];
  const lines = diffStr.split("\n");
  // Clean up empty lines at end
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines.map((line) => {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      return { type: "add", content: line.substring(1) };
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      return { type: "remove", content: line.substring(1) };
    }
    if (line.startsWith("@@")) {
      return { type: "context", content: line, isHeader: true } as any;
    }
    return { type: "context", content: line.startsWith(" ") ? line.substring(1) : line };
  });
}

function hasChanges(lines: DiffLine[]): boolean {
  return lines.some((line) => line.type === "add" || line.type === "remove");
}

const DiffBlock: React.FC<{ title: string; lines: DiffLine[]; emptyMessage: string }> = ({
  title,
  lines,
  emptyMessage,
}) => {
  const isChanged = hasChanges(lines);

  return (
    <div className="bg-[#0e141b] rounded-lg border border-white/5 overflow-hidden">
      <div className="bg-[#17202d] px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-xs leading-6 whitespace-pre-wrap select-text">
        {!isChanged ? (
          <p className="text-[#8f98a0] italic pl-2">{emptyMessage}</p>
        ) : (
          lines.map((line, idx) => {
            let bgColor = "hover:bg-white/5";
            let textColor = "text-[#c6d4df]";
            let indicator = " ";

            if (line.type === "add") {
              bgColor = "bg-emerald-950/45 text-emerald-400 border-l-2 border-emerald-500 hover:bg-emerald-950/60";
              textColor = "text-emerald-300";
              indicator = "+";
            } else if (line.type === "remove") {
              bgColor = "bg-rose-950/40 text-rose-400 border-l-2 border-rose-500 hover:bg-rose-950/50";
              textColor = "text-rose-300";
              indicator = "-";
            } else if (line.type === "context" && (line as any).isHeader) {
              bgColor = "bg-[#1f2833]/40 text-[#67c1f5]/70";
              textColor = "text-[#67c1f5]/70";
              indicator = " ";
            }

            return (
              <div key={idx} className={`flex ${bgColor} px-2 py-0.5 rounded-sm transition-colors`}>
                <span
                  className={`w-6 select-none opacity-40 font-bold mr-2 text-right ${
                    line.type === "add" ? "text-emerald-500" : line.type === "remove" ? "text-rose-500" : ""
                  }`}
                >
                  {indicator}
                </span>
                <span className={`flex-1 ${textColor}`}>{line.content}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const ArticleDevlogDetail: React.FC<ArticleDevlogDetailProps> = ({ article, version }) => {
  const t = useTranslations("ArticleContent");
  const [detail, setDetail] = useState<RevisionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const response = await getArticleRevisionDetail(article.slug, version);
        setDetail(response);
      } catch (err) {
        console.error("Failed to load revision detail", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [article.slug, version]);

  const dateStr = detail
    ? new Date(detail.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const titleDiffLines = detail ? parseDiffString(detail.titleDiff) : [];
  const descriptionDiffLines = detail ? parseDiffString(detail.descriptionDiff) : [];
  const bodyDiffLines = detail ? detail.parsedBodyDiff || parseDiffString(detail.bodyDiff) : [];

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
            <Link href={`/articles/${article.slug}/devlog`}>
              Devlog
            </Link>
            <span>&gt;</span>
            <span>Version {version}</span>
          </div>
          <h1 className="text-2xl text-white font-medium mb-6 uppercase tracking-widest">
            {detail?.message || `Update #${version}`}
          </h1>
        </div>

        <ArticleCommunityTabs slug={article.slug} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/articles/${article.slug}/devlog`}
            className="flex items-center gap-1.5 text-sm text-[#67c1f5] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("devlog.backToList")}</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#1a9fff] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#8f98a0] text-sm">Loading change history...</p>
          </div>
        ) : !detail ? (
          <div className="bg-[#1b2838]/50 border border-white/5 rounded p-8 text-center">
            <GitCommit className="w-12 h-12 text-[#4f535c] mx-auto mb-4" />
            <p className="text-[#8f98a0]">Revision details not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Revision metadata card */}
            <div className="bg-[#16202d] border border-white/5 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="bg-[#1a9fff]/10 text-[#67c1f5] text-xs font-bold px-2.5 py-1 rounded border border-[#1a9fff]/20">
                    {t("devlog.version", { version: detail.version })}
                  </span>
                  <h2 className="text-white font-medium text-lg">
                    {detail.message || `Update #${detail.version}`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8f98a0]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {t("devlog.author", { author: detail.author.name })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {t("devlog.date", { date: dateStr })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                <span className="text-green-500 bg-green-500/10 px-2.5 py-1 rounded border border-green-500/20 font-bold">
                  +{detail.stats.additions} additions
                </span>
                <span className="text-red-500 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 font-bold">
                  -{detail.stats.deletions} deletions
                </span>
              </div>
            </div>

            {/* Developer Notes (Optional) */}
            {detail.notes && (
              <div className="bg-[#16202d] border border-white/5 rounded-lg p-5 space-y-3">
                <h3 className="text-white font-medium text-sm border-b border-white/5 pb-2 uppercase tracking-wide">
                  {t("devlog.developerNotes")}
                </h3>
                <div className="text-sm text-[#c6d4df] whitespace-pre-wrap leading-relaxed">
                  {detail.notes}
                </div>
              </div>
            )}

            {/* Diffs */}
            <div className="space-y-6">
              <DiffBlock
                title={t("devlog.titleChanges")}
                lines={titleDiffLines}
                emptyMessage={t("devlog.noChanges")}
              />

              <DiffBlock
                title={t("devlog.descriptionChanges")}
                lines={descriptionDiffLines}
                emptyMessage={t("devlog.noChanges")}
              />

              <DiffBlock
                title={t("devlog.bodyChanges")}
                lines={bodyDiffLines}
                emptyMessage={t("devlog.noChanges")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDevlogDetail;
