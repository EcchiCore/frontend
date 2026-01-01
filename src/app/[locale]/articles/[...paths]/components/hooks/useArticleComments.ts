// src/app/[locale]/articles/[...paths]/components/hooks/useArticleComments.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import Cookies from 'js-cookie';
import { Comment } from '../Interfaces';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const fetcher = (url: string) => {
  const token = Cookies.get('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { headers }).then((res) => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  });
};

export function useArticleComments(slug: string, showAlert: (message: string, severity: 'success' | 'error') => void) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [topCommenters, setTopCommenters] = useState<{ username: string; count: number }[]>([]);
  const hasShownCommentsErrorRef = useRef(false);

  const { data: commentsData, error: commentsError, isLoading } = useSWR(
    `${API_BASE_URL}/api/articles/${slug}/comments`,
    fetcher,
    {
      refreshInterval: 60000,
      fallbackData: { comments: [] },
      revalidateOnMount: true,
    }
  );

  const areCommentsEqual = useCallback((a: Comment[], b: Comment[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i]?.id !== b[i]?.id) return false;
    }
    return true;
  }, []);

  const buildTopCommenters = useCallback((commentsList: Comment[]) => {
    const commentCount: { [key: string]: number } = {};
    commentsList.forEach((comment: Comment) => {
      if (comment?.author?.username) {
        commentCount[comment.author.username] =
          (commentCount[comment.author.username] || 0) + 1;
      }
    });

    return Object.entries(commentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([username, count]) => ({ username, count }));
  }, []);

  useEffect(() => {
    if (commentsData) {
      const commentsArray = Array.isArray(commentsData)
        ? commentsData
        : Array.isArray(commentsData.data)
          ? commentsData.data
          : commentsData.comments || [];
      setComments((prev) => {
        if (areCommentsEqual(prev, commentsArray)) return prev;
        return commentsArray;
      });

      const nextTopCommenters = buildTopCommenters(commentsArray);
      setTopCommenters((prev) => {
        if (prev.length === nextTopCommenters.length && prev.every((item, index) => item.username === nextTopCommenters[index]?.username && item.count === nextTopCommenters[index]?.count)) {
          return prev;
        }
        return nextTopCommenters;
      });
    }

    if (commentsError) {
      if (!hasShownCommentsErrorRef.current) {
        hasShownCommentsErrorRef.current = true;
        showAlert('ไม่สามารถโหลดความคิดเห็นได้', 'error');
      }
    } else {
      hasShownCommentsErrorRef.current = false;
    }
  }, [commentsData, commentsError, showAlert, areCommentsEqual, buildTopCommenters]);

  const handleAddComment = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token || !newComment.trim())
      return showAlert('กรุณาเข้าสู่ระบบหรือกรอกความคิดเห็น', 'error');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/articles/${slug}/comments`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: newComment }),
        }
      );
      if (response.ok) {
        const newCommentData = await response.json();
        // The API might return { data: Comment } or just Comment. Check based on structure.
        const createdComment = newCommentData.data || newCommentData.comment || newCommentData;
        setComments((prev) => [createdComment, ...prev]);
        setNewComment('');
        showAlert('เพิ่มความคิดเห็นสำเร็จ', 'success');
        mutate(`${API_BASE_URL}/api/articles/${slug}/comments`);
      } else {
        showAlert('ไม่สามารถเพิ่มความคิดเห็น', 'error');
      }
    } catch {
      showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  }, [newComment, comments, slug, showAlert]);

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      const token = Cookies.get('token');
      if (!token) return showAlert('กรุณาเข้าสู่ระบบเพื่อลบความคิดเห็น', 'error');

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/articles/${slug}/comments/${commentId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          setComments(comments.filter((comment) => comment.id !== commentId));
          showAlert('ลบความคิดเห็นสำเร็จ', 'success');
          mutate(`${API_BASE_URL}/api/articles/${slug}/comments`);
        } else {
          showAlert('ไม่สามารถลบความคิดเห็น', 'error');
        }
      } catch {
        showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
      }
    },
    [comments, slug, showAlert]
  );

  return {
    comments,
    newComment,
    setNewComment,
    topCommenters,
    commentsError,
    isLoading,
    handleAddComment,
    handleDeleteComment,
  };
}
