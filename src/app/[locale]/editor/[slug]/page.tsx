'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ArticleEditorForm } from '@/app/[locale]/components/ArticleEditorForm';

const EditArticlePage: React.FC = () => {
  const params = useParams();
  const slug = (params.slug as string) ?? '';

  if (!slug) return <div>Invalid slug</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleEditorForm mode="edit" slug={slug} />
    </div>
  );
};

export default EditArticlePage;
