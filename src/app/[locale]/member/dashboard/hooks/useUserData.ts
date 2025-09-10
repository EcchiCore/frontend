import { useState, useCallback } from 'react';
import { Article, ArticleStatus, ArticlesResponse } from '../utils/types';
import { articlesApi, ApiError } from '../utils/api';

export const useUserData = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async (params?: {
    status?: ArticleStatus;
    limit?: number;
    offset?: number;
    feedMode?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = params?.feedMode
        ? await articlesApi.getFeedArticles(queryParams)
        : await articlesApi.getMyArticles(queryParams) as ArticlesResponse;

      const responseTyped = response as ArticlesResponse;

      // Transform API response if backend returns lowercase status values
      const transformedArticles = responseTyped.articles.map(article => ({
        ...article,
        status: article.status.toUpperCase() as ArticleStatus
      }));

      setArticles(transformedArticles);
      setArticlesCount(responseTyped.articlesCount);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to fetch articles';
      setError(errorMessage);

      // Set empty state on error
      setArticles([]);
      setArticlesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateArticles = useCallback((newArticles: Article[]) => {
    setArticles(newArticles);
    setArticlesCount(newArticles.length);
  }, []);

  const updateArticle = useCallback((slug: string, updates: Partial<Article>) => {
    setArticles(prev =>
      prev.map(article =>
        article.slug === slug ? { ...article, ...updates } : article
      )
    );
  }, []);

  const removeArticle = useCallback((slug: string) => {
    setArticles(prev => prev.filter(article => article.slug !== slug));
    setArticlesCount(prev => Math.max(0, prev - 1));
  }, []);

  const addArticle = useCallback((newArticle: Article) => {
    setArticles(prev => [newArticle, ...prev]);
    setArticlesCount(prev => prev + 1);
  }, []);

  const toggleFavorite = useCallback(async (slug: string, currentFavorited: boolean) => {
    try {
      const response = currentFavorited
        ? await articlesApi.unfavoriteArticle(slug)
        : await articlesApi.favoriteArticle(slug);

      const updatedArticle = (response as { article: Article }).article;
      updateArticle(slug, {
        favorited: updatedArticle.favorited,
        favoritesCount: updatedArticle.favoritesCount
      });

      return updatedArticle;
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to toggle favorite';
      throw new Error(errorMessage);
    }
  }, [updateArticle]);

  const deleteArticle = useCallback(async (slug: string) => {
    try {
      await articlesApi.deleteArticle(slug);
      removeArticle(slug);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to delete article';
      throw new Error(errorMessage);
    }
  }, [removeArticle]);

  const publishRequest = useCallback(async (slug: string) => {
    try {
      await articlesApi.publishRequest(slug);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to request publish';
      throw new Error(errorMessage);
    }
  }, []);

  return {
    articles,
    articlesCount,
    loading,
    error,
    fetchArticles,
    updateArticles,
    updateArticle,
    removeArticle,
    addArticle,
    toggleFavorite,
    deleteArticle,
    publishRequest
  };
};