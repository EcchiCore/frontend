import React from "react";
import Image from "next/image";
import { CommentsSectionProps } from "./Interfaces";
import myImageLoader from "@/lib/imageLoader";
import { Trash } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const CommentsSection: React.FC<CommentsSectionProps> = ({
                                                           isAuthenticated,
                                                           comments,
                                                           newComment,
                                                           setNewComment,
                                                           handleAddComment,
                                                           isCurrentUserAuthor,
                                                           handleDeleteComment,
                                                           formatDate,
                                                           commentInputRef,
                                                           isLoading,
                                                         }) => (
  <div className="mt-8 border-t border-border pt-6">
    <h2 className="text-xl font-semibold mb-2 text-foreground">ความคิดเห็น</h2>

    {isLoading ? (
      <div className="text-center py-8 text-muted-foreground">
        กำลังโหลดความคิดเห็น...
      </div>
    ) : (
      <>
        {isAuthenticated && (
          <div className="mb-8">
            <div className="flex gap-3 mb-4">
              <Textarea
                ref={commentInputRef}
                className="w-full"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="เขียนความคิดเห็นของคุณ..."
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                ส่ง
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-6">
          ทั้งหมด {comments?.length || 0} ความคิดเห็น
        </p>

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg bg-muted border border-border transition-shadow duration-200 hover:shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      <Image
                        loader={myImageLoader}
                        src={comment.author.image}
                        alt={comment.author.username}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{comment.author.username}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  {isCurrentUserAuthor && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(comment.id)}>
                      <Trash className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-foreground">{comment.body}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">ยังไม่มีความคิดเห็น</p>
          )}
        </div>
      </>
    )}
  </div>
);

export default CommentsSection;

