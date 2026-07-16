'use client';

import React from 'react';
import { PlatformRequestCard } from './PlatformRequestCard';
import { ModerationRequest } from './ArticleModerationCard';

interface PlatformRequestsSectionProps {
    title: string;
    requests: ModerationRequest[];
    selectedPlatformRequests: Set<number>;
    onToggleSelect: (requestId: number) => void;
    onApprove: (requestId: number, reviewNote: string) => void;
    onReject: (requestId: number, reviewNote: string) => void;
    loading: boolean;
}

export const PlatformRequestsSection: React.FC<PlatformRequestsSectionProps> = ({
    title,
    requests,
    selectedPlatformRequests,
    onToggleSelect,
    onApprove,
    onReject,
    loading,
}) => {
    if (requests.length === 0) return null;

    return (
        <div className="space-y-3 pt-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {title} ({requests.length})
            </h2>
            <div className="space-y-3">
                {requests.map((request) => (
                    <PlatformRequestCard
                        key={request.id}
                        request={request}
                        isSelected={selectedPlatformRequests.has(request.id)}
                        onToggleSelect={onToggleSelect}
                        onApprove={onApprove}
                        onReject={onReject}
                        loading={loading}
                    />
                ))}
            </div>
        </div>
    );
};
