// src/app/[locale]/articles/[...paths]/components/hooks/useDownloadDialog.ts
import { useState, useCallback, useMemo } from 'react';
import { DownloadFile, TranslationFile } from '../Interfaces';
import { useTranslations } from 'next-intl';

export function useDownloadDialog(downloads: DownloadFile[], showAlert: (message: string, severity: 'success' | 'error') => void) {
  const t = useTranslations('ArticleContent');
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const sortItems = useCallback(<T extends DownloadFile | TranslationFile>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name' || !('createdAt' in a && 'createdAt' in b)) {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sortBy, sortOrder]);

  const filteredDownloads = useMemo(() => {
    if (!downloads) return [];
    const filtered = downloads.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ('description' in item && typeof item.description === 'string' && item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return sortItems(filtered);
  }, [downloads, searchQuery, sortItems]);

  const handleCopyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
      showAlert(t('linkCopied'), 'success');
      setTimeout(() => setCopiedLink(null), 2000); // Clear copied state after 2 seconds
    } catch {
      showAlert(t('copyLinkError'), 'error');
    }
  }, [t, showAlert]);

  return {
    openDownloadDialog,
    setOpenDownloadDialog,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredDownloads,
    handleCopyLink,
    copiedLink,
    setCopiedLink,
  };
}