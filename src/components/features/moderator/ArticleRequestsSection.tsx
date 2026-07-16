'use client';

import React from 'react';
import ArticleModerationCard, { 
    ArticleModerationGroup 
} from './ArticleModerationCard';

interface ArticleRequestsSectionProps {
    title?: string;
    groups: ArticleModerationGroup[];
    activeFilter: string;
    selectedArticles: Set<number>;
    expandedArticle: number | null;
    selectedRequests: Set<number>;
    onToggleSelect: (articleId: number) => void;
    onToggleExpand: (articleId: number) => void;
    onToggleRequestSelect: (requestId: number) => void;
    onApproveRequest: (requestId: number, reviewNote: string) => void;
    onRejectRequest: (requestId: number, reviewNote: string) => void;
    onApproveAll: (requestIds: number[], reviewNote: string) => void;
    onRejectAll: (requestIds: number[], reviewNote: string) => void;
    loading: boolean;
}

export const ArticleRequestsSection: React.FC<ArticleRequestsSectionProps> = ({
    title = 'Article Requests',
    groups,
    activeFilter,
    selectedArticles,
    expandedArticle,
    selectedRequests,
    onToggleSelect,
    onToggleExpand,
    onToggleRequestSelect,
    onApproveRequest,
    onRejectRequest,
    onApproveAll,
    onRejectAll,
    loading,
}) => {
    if (groups.length === 0) return null;

    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {title} ({groups.length})
            </h2>
            <div className="space-y-3">
                {groups.map((group) => {
                    const displayGroup = activeFilter === 'ALL'
                        ? group
                        : {
                            ...group,
                            requests: group.requests.filter(r => r.entityType === activeFilter)
                        };

                    return (
                        <ArticleModerationCard
                            key={group.article.id}
                            group={displayGroup}
                            isSelected={selectedArticles.has(group.article.id)}
                            isExpanded={expandedArticle === group.article.id}
                            selectedRequests={selectedRequests}
                            onToggleSelect={onToggleSelect}
                            onToggleExpand={onToggleExpand}
                            onToggleRequestSelect={onToggleRequestSelect}
                            onApproveRequest={onApproveRequest}
                            onRejectRequest={onRejectRequest}
                            onApproveAll={onApproveAll}
                            onRejectAll={onRejectAll}
                            loading={loading}
                        />
                    );
                })}
            </div>
        </div>
    );
};
