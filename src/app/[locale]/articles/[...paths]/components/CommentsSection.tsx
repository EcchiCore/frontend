import React from "react";
import Image from "next/image";
import { CommentsSectionProps } from "./Interfaces";
import myImageLoader from "../../../lib/imageLoader";
import { TrashIcon } from "@heroicons/react/24/outline";

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
  <div className="mt-8 border-t border-base-content/20 pt-6 dark:bg-gray-800">
    <h2 className="text-xl font-semibold mb-2 text-base-content">ความคิดเห็น</h2>

    {isLoading ? (
      <div className="text-center py-8 text-base-content/60">
        กำลังโหลดความคิดเห็น...
      </div>
    ) : (
      <>
        {isAuthenticated && (
          <div className="mb-8">
            <div className="flex gap-3 mb-4">
              <textarea
                ref={commentInputRef}
                className="w-full rounded-lg p-3 border bg-base-200 border-base-content/20 text-base-content focus:ring-2 focus:ring-primary transition-all duration-200"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="เขียนความคิดเห็นของคุณ..."
              />
              <button
                className={`px-5 py-2 rounded-lg text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 ${
                  !newComment.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                ส่ง
              </button>
            </div>
          </div>
        )}

        <p className="text-sm text-base-content/60 mb-6">
          ทั้งหมด {comments?.length || 0} ความคิดเห็น
        </p>

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg bg-base-200 border border-base-content/20 transition-shadow duration-200 hover:shadow-sm"
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
                      <p className="font-medium text-base-content">{comment.author.username}</p>
                      <p className="text-sm text-base-content/60">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  {isCurrentUserAuthor && (
                    <button
                      className="p-1 rounded-lg hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <TrashIcon className="w-5 h-5 text-base-content/60" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-base-content">{comment.body}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-base-content/60 py-8">ยังไม่มีความคิดเห็น</p>
          )}
        </div>
      </>
    )}
  </div>
);

export default CommentsSection;

