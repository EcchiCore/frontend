'use client';

import React from 'react';
import { ArticleEditorForm } from '@/components/features/ArticleEditorForm';

const CreateArticlePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <ArticleEditorForm mode="create" />
        </div>
    );
};

export default CreateArticlePage;
