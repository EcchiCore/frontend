// src/app/[locale]/articles/[...paths]/components/hooks/useArticleInteractions.ts
import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import Cookies from 'js-cookie';
import { createAuthenticatedClient, createChanomhubClient } from '@chanomhub/sdk';
import { Article } from '@/types/article';
import { AlertState } from '../Interfaces';
import { useTranslations } from 'next-intl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function useArticleInteractions(article: Article, slug: string) {
  const [isFavorited, setIsFavorited] = useState(article.favorited);
  const [favoritesCount, setFavoritesCount] = useState(article.favoritesCount);
  const [isFollowing, setIsFollowing] = useState(article.author.following ?? false);
  const [alert, setAlert] = useState<AlertState>({ open: false, message: '', severity: 'success' });
  const t = useTranslations('ArticleContent');

  // Get authenticated SDK client
  const getAuthenticatedSdk = useCallback(() => {
    const token = Cookies.get('token');
    if (!token) return null;
    return createAuthenticatedClient(token);
  }, []);

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
    setIsFollowing(article.author.following ?? false);
  }, [article.author.following]);

  const showAlert = useCallback((message: string, severity: 'success' | 'error') => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert((prev) => ({ ...prev, open: false })), 4000);
  }, []);

  const handleFavorite = useCallback(async () => {
    const sdk = getAuthenticatedSdk();
    if (!sdk) return showAlert(t('loginToSave'), 'error');

    const prevState = { isFavorited, favoritesCount };
    setIsFavorited(!isFavorited);
    setFavoritesCount(isFavorited ? favoritesCount - 1 : favoritesCount + 1);

    try {
      const result = isFavorited
        ? await sdk.favorites.remove(slug)
        : await sdk.favorites.add(slug);

      if (!result) throw new Error('Failed to update favorite');
    } catch {
      setIsFavorited(prevState.isFavorited);
      setFavoritesCount(prevState.favoritesCount);
      showAlert(t('unableToUpdateFavorite'), 'error');
    }
  }, [isFavorited, favoritesCount, slug, showAlert, getAuthenticatedSdk, t]);

  const handleFollow = useCallback(async () => {
    const sdk = getAuthenticatedSdk();
    if (!sdk) return showAlert(t('loginToFollow'), 'error');

    try {
      const profile = isFollowing
        ? await sdk.users.unfollow(article.author.name)
        : await sdk.users.follow(article.author.name);

      if (profile) {
        setIsFollowing(profile.following);
        showAlert(
          profile.following ? t('followedAuthor') : t('unfollowedAuthor'),
          'success'
        );
      } else {
        showAlert(t('unableToUpdateFollow'), 'error');
      }
    } catch {
      showAlert(t('connectionError'), 'error');
    }
  }, [isFollowing, article.author.name, showAlert, getAuthenticatedSdk, t]);

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
      showAlert(t('copiedArticleUrl'), 'success');
    } catch {
      showAlert(t('unableToShareOrCopy'), 'error');
    }
  }, [article.title, article.description, showAlert, t]);

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

