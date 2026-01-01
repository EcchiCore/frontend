// src/app/[locale]/articles/[...paths]/components/hooks/useArticleInteractions.ts
import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import Cookies from 'js-cookie';
import { Article } from '@/types/article';
import { AlertState } from '../Interfaces';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function useArticleInteractions(article: Article, slug: string) {
  const [isFavorited, setIsFavorited] = useState(article.favorited);
  const [favoritesCount, setFavoritesCount] = useState(article.favoritesCount);
  const [isFollowing, setIsFollowing] = useState(article.author.following);
  const [alert, setAlert] = useState<AlertState>({ open: false, message: '', severity: 'success' });


  // GraphQL fetcher for user-specific article interaction state
  const graphqlFetcher = async (key: string) => {
    const token = Cookies.get('token');
    if (!token) return null;

    const query = `
      query ArticleInteractionState($slug: String!) {
        article(slug: $slug) {
          favorited
          favoritesCount
          author {
            following
          }
        }
      }
    `;

    const response = await fetch(`${API_BASE_URL}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { slug: key },
        operationName: 'ArticleInteractionState',
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch article state');
    const json = await response.json();
    if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');
    return json.data;
  };

  const { data: articleData } = useSWR(
    Cookies.get('token') ? slug : null,
    graphqlFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (articleData?.article) {
      setIsFavorited(articleData.article.favorited);
      setFavoritesCount(articleData.article.favoritesCount);
      setIsFollowing(articleData.article.author?.following ?? false);
    }
  }, [articleData]);

  useEffect(() => {
    setIsFollowing(article.author.following);
  }, [article.author.following]);

  const showAlert = useCallback((message: string, severity: 'success' | 'error') => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert((prev) => ({ ...prev, open: false })), 4000);
  }, []);

  const handleFavorite = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) return showAlert('กรุณาเข้าสู่ระบบเพื่อบันทึกบทความนี้', 'error');

    const prevState = { isFavorited, favoritesCount };
    setIsFavorited(!isFavorited);
    setFavoritesCount(isFavorited ? favoritesCount - 1 : favoritesCount + 1);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/articles/${slug}/favorite`,
        {
          method: isFavorited ? 'DELETE' : 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      if (!response.ok) throw new Error();
    } catch {
      setIsFavorited(prevState.isFavorited);
      setFavoritesCount(prevState.favoritesCount);
      showAlert('ไม่สามารถอัปเดตสถานะรายการโปรด', 'error');
    }
  }, [isFavorited, favoritesCount, slug, showAlert]);

  const handleFollow = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) return showAlert('กรุณาเข้าสู่ระบบเพื่อติดตามผู้เขียน', 'error');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profiles/${article.author.name}/follow`,
        {
          method: isFollowing ? 'DELETE' : 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Follow API Response:', data);
        console.log('Following status:', data.profile.following);
        setIsFollowing(data.profile.following);
        showAlert(
          data.profile.following ? 'ติดตามผู้เขียนแล้ว' : 'เลิกติดตามผู้เขียน',
          'success'
        );
      } else {
        showAlert('ไม่สามารถอัปเดตสถานะการติดตาม', 'error');
      }
    } catch {
      showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  }, [isFollowing, article.author.name, showAlert]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: article.title,
      text: article.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      showAlert('คัดลอก URL บทความไปยังคลิปบอร์ดแล้ว', 'success');
    } catch {
      showAlert('ไม่สามารถแชร์หรือคัดลอกลิงก์ได้', 'error');
    }
  }, [article.title, article.description, showAlert]);

  return {
    isFavorited,
    favoritesCount,
    isFollowing,
    alert,
    handleFavorite,
    handleFollow,
    handleShare,
    showAlert,
  };
}
