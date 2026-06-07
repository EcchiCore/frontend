import React, { useRef } from "react";
import Image from "next/image";
import { CommentsSectionProps } from "./Interfaces";
import { Trash2, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { useAppSelector } from "@/store/hooks";

const CommentsSection: React.FC<CommentsSectionProps> = ({
  isAuthenticated,
  comments,
  newComment,
  setNewComment,
  handleAddComment,
  isCurrentUserAuthor,
  handleDeleteComment,
  isLoading,
}) => {
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations('ArticleContent');
  const { user } = useAppSelector((state) => state.auth);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  const commentCount = comments?.length || 0;
  const reviewSentiment = commentCount > 5 
    ? "เป็นบวกอย่างยิ่ง (Very Positive)" 
    : commentCount > 0 
      ? "เป็นบวก (Positive)" 
      : "ยังไม่มีรีวิว (No Reviews)";

  return (
    <div className="mt-12 border-t border-border pt-8 text-muted-foreground">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
        <div className="p-2 bg-muted rounded-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
            {t('commentsTitle') || "Customer Reviews (บทวิจารณ์จากลูกค้า)"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            บทวิจารณ์ทั้งหมด: <span className="text-foreground font-semibold">{commentCount} รายการ</span> | ความเห็นโดยรวม: <span className="text-primary font-semibold">{reviewSentiment}</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground animate-pulse">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          {t('loadingComments') || "กำลังโหลดบทวิจารณ์..."}
        </div>
      ) : (
        <>
          {/* ── Write Review Box ── */}
          {isAuthenticated ? (
            <div className="mb-10 bg-card border border-border rounded-lg p-5 shadow-lg">
              <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                เขียนบทวิจารณ์สำหรับบทความนี้
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                โปรดอธิบายถึงสิ่งที่คุณชอบหรือไม่ชอบเกี่ยวกับเกม/บทความนี้ และข้อมูลที่เป็นประโยชน์ต่อสมาชิกคนอื่น
              </p>
              
              <div className="space-y-4">
                <Textarea
                  ref={commentInputRef}
                  className="w-full min-h-[100px] bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-md p-3 placeholder-muted-foreground/60 transition-all resize-y"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="เขียนความคิดเห็นหรือคำวิจารณ์ของคุณที่นี่..."
                />
                
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span>รีวิวของคุณจะแสดงแบบสาธารณะในหมวดหมู่คอมเมนต์</span>
                  </div>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md px-6 h-10 shadow-lg transition-all duration-200"
                  >
                    {t('submitComment') || "โพสต์บทวิจารณ์"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-muted/40 border border-border rounded-lg text-center text-sm text-muted-foreground font-medium">
              {t('loginToComment') || "โปรด login ก่อนเพื่อแสดงความคิดเห็น"}
            </div>
          )}

          {/* ── Review Cards List ── */}
          <div className="space-y-5">
            {comments && comments.length > 0 ? (
              comments.map((comment) => {
                const isAuthorOrOwner = isCurrentUserAuthor || (user && user.username === comment.author.username);
                const hasUserImage = comment.author.image && comment.author.image !== "";

                return (
                  <div
                    key={comment.id}
                    className="flex flex-col md:flex-row gap-4 bg-card border border-border border-l-2 border-l-primary rounded-lg p-5 relative group"
                  >
                    {/* Left Column: Author Info */}
                    <div className="w-full md:w-[150px] shrink-0 flex md:flex-col items-center md:items-start gap-3 md:gap-3 md:border-r md:border-border/60 md:pr-4">
                      <div className="relative w-10 h-10 md:w-12 md:h-12 border border-border bg-muted p-0.5 rounded-sm overflow-hidden shrink-0">
                        {hasUserImage ? (
                          <div className="w-full h-full relative">
                            <Image
                              src={comment.author.image}
                              alt={comment.author.username}
                              fill
                              sizes="48px"
                              className="object-cover rounded-sm"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-card flex items-center justify-center text-foreground font-bold text-lg rounded-sm">
                            {comment.author.username[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground hover:text-primary transition-colors truncate block text-sm">
                          {comment.author.username}
                        </span>
                        <span className="text-[10px] text-muted-foreground block font-medium mt-0.5">
                          {comment.author.username === "admin" || comment.author.username === "AdminChanom" 
                            ? "ผู้ดูแลระบบ (Admin)" 
                            : "สมาชิกชุมชน (Member)"}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Review Body */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Delete Button */}
                      {isAuthorOrOwner && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="w-8 h-8 hover:bg-destructive/20 text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/40 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {/* Review Header */}
                      <div className="flex items-center gap-3 border-b border-border/50 pb-2 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-muted border border-primary/30">
                          <ThumbsUp className="w-4 h-4 text-primary fill-primary/10" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-foreground tracking-wide">
                            แนะนำ (Recommended)
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5" suppressHydrationWarning>
                            โพสต์เมื่อ: {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Comment text */}
                      <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap break-words pr-6">
                        {comment.body}
                      </div>

                      {/* Review Helpfulness Bar */}
                      <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-border/30 text-[11px] text-muted-foreground">
                        <span>ข้อมูลนี้มีประโยชน์กับคุณหรือไม่?</span>
                        <div className="flex gap-1.5 ml-1">
                          <button className="bg-muted border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors px-3 py-0.5 rounded-sm font-medium">
                            ใช่
                          </button>
                          <button className="bg-muted border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors px-3 py-0.5 rounded-sm font-medium">
                            ไม่
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-lg bg-card/30">
                <p className="text-sm font-medium mb-1">ยังไม่มีบทวิจารณ์สำหรับบทความนี้</p>
                <p className="text-xs">ร่วมเขียนความเห็นของคุณเป็นคนแรกเพื่อช่วยแบ่งปันข้อมูลให้กับผู้เล่นคนอื่น!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentsSection;
