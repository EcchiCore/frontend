// app/articles/[slug]/components/GTMArticleTracker.tsx
'use client';

import { useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';

interface GTMArticleTrackerProps {
  title: string;
  slug: string;
  categoryList: string[];
  authorUsername: string;
}

export default function GTMArticleTracker({
                                            title,
                                            slug,
                                            categoryList,
                                            authorUsername,
                                          }: GTMArticleTrackerProps) {
  useEffect(() => {
    sendGTMEvent({
      event: 'view_article',
      articleTitle: title,
      articleSlug: slug,
      articleCategory: categoryList.join(', '),
      articleAuthor: authorUsername,
    });
  }, [title, slug, categoryList, authorUsername]);

  // This component doesn't render anything
  return null;
}