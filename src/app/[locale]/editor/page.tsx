'use client';

import React from 'react';
import { ArticleEditorForm } from '@/app/[locale]/components/ArticleEditorForm';

const CreateArticlePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <ArticleEditorForm mode="create" />
        </div>
    );
};

export default CreateArticlePage;
