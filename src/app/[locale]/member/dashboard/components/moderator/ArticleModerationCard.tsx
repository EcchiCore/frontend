'use client';

import React from 'react';
import { Check, X, ChevronDown, ChevronUp, FileText, Link, ShoppingCart, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';

// Types
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
export type EntityType = 'ARTICLE' | 'DOWNLOAD_LINK' | 'OFFICIAL_DOWNLOAD_SOURCE' | 'COMMENT';
export type EntityStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED' | 'PENDING_REVIEW' | 'PENDING' | 'NEEDS_REVISION';

export interface ModerationRequest {
    id: number;
    entityId: number;
    entityType: EntityType;
    requesterId: number;
    reviewerId: number | null;
    status: RequestStatus;
    requestNote: string;
    reviewNote: string | null;
    createdAt: string;
    updatedAt: string;
    requester: {
        id: number;
        name: string;
        image: string | null;
    };
    reviewer: {
        id: number;
        name: string;
        image: string | null;
    } | null;
    entityDetails: {
        id: number;
        title?: string;
        slug?: string;
        description?: string;
        mainImage?: string | null;
        images?: { url: string }[];
        url?: string;
        name?: string;
        content?: string;
        status: EntityStatus;
        articleId?: number;
        author?: {
            name: string;
            image: string | null;
        };
    } | null;
}

export interface ArticleWithRequests {
    articleId: number;
    articleTitle: string;
    articleSlug: string;
    articleDescription: string;
    mainImage: string | null;
    images: { url: string }[];
    author: { name: string; image: string | null } | null;
    requests: ModerationRequest[];
    requester: { id: number; name: string; image: string | null };
}

interface ArticleModerationCardProps {
    article: ArticleWithRequests;
    isSelected: boolean;
    isExpanded: boolean;
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

const EntityIcon = ({ type }: { type: EntityType }) => {
    switch (type) {
        case 'ARTICLE':
            return <FileText className="w-4 h-4" />;
        case 'DOWNLOAD_LINK':
            return <Link className="w-4 h-4" />;
        case 'OFFICIAL_DOWNLOAD_SOURCE':
            return <ShoppingCart className="w-4 h-4" />;
        case 'COMMENT':
            return <MessageCircle className="w-4 h-4" />;
        default:
            return <FileText className="w-4 h-4" />;
    }
};

const EntityTypeBadge = ({ type }: { type: EntityType }) => {
    const getVariant = () => {
        switch (type) {
            case 'ARTICLE': return 'default';
            case 'DOWNLOAD_LINK': return 'secondary';
            case 'OFFICIAL_DOWNLOAD_SOURCE': return 'outline';
            case 'COMMENT': return 'destructive';
            default: return 'secondary';
        }
    };

    const getLabel = () => {
        switch (type) {
            case 'ARTICLE': return 'Article';
            case 'DOWNLOAD_LINK': return 'Download';
            case 'OFFICIAL_DOWNLOAD_SOURCE': return 'Official Source';
            case 'COMMENT': return 'Comment';
            default: return type;
        }
    };

    return (
        <Badge variant={getVariant() as any} className="gap-1 text-xs">
            <EntityIcon type={type} />
            {getLabel()}
        </Badge>
    );
};

const StatusBadge = ({ status }: { status: RequestStatus | EntityStatus }) => {
    if (!status) return null;

    const getVariant = () => {
        switch (status) {
            case 'PENDING':
            case 'PENDING_REVIEW':
                return 'secondary';
            case 'APPROVED':
            case 'PUBLISHED':
                return 'default';
            case 'REJECTED':
            case 'DELETED':
                return 'destructive';
            case 'NEEDS_REVISION':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <Badge variant={getVariant() as any} className="text-xs">
            {status.replace('_', ' ')}
        </Badge>
    );
};

export const ArticleModerationCard: React.FC<ArticleModerationCardProps> = ({
    article,
    isSelected,
    isExpanded,
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
    const [reviewNote, setReviewNote] = React.useState('');
    const pendingCount = article.requests.filter(r => r.status === 'PENDING' || r.status === 'NEEDS_REVISION').length;
    const requestIds = article.requests.map(r => r.id);

    // Group requests by type
    const articleRequests = article.requests.filter(r => r.entityType === 'ARTICLE');
    const downloadRequests = article.requests.filter(r => r.entityType === 'DOWNLOAD_LINK');
    const officialSourceRequests = article.requests.filter(r => r.entityType === 'OFFICIAL_DOWNLOAD_SOURCE');
    const commentRequests = article.requests.filter(r => r.entityType === 'COMMENT');

    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 border-l-purple-500">
            <CardContent className="p-0">
                {/* Collapsed Header */}
                <div className="flex items-center gap-4 p-4">
                    {/* Checkbox */}
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(article.articleId)}
                        className="h-5 w-5"
                    />

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {article.mainImage ? (
                            <img
                                src={article.mainImage}
                                alt={article.articleTitle}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Article Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{article.articleTitle}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {article.articleDescription || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={article.requester?.image || undefined} />
                                <AvatarFallback className="text-xs">
                                    {article.requester?.name?.charAt(0) || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                                {article.requester?.name || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* Pending Count Badge */}
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                        {pendingCount} pending
                    </Badge>

                    {/* Expand Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleExpand(article.articleId)}
                        className="ml-2"
                    >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Expanded Content */}
                <Collapsible open={isExpanded}>
                    <CollapsibleContent>
                        <div className="border-t px-4 py-4 bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
                            {/* Screenshots */}
                            {article.images && article.images.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Screenshots</h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {article.images.slice(0, 5).map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img.url}
                                                alt={`Screenshot ${idx + 1}`}
                                                className="h-20 w-auto rounded-md object-cover flex-shrink-0"
                                            />
                                        ))}
                                        {article.images.length > 5 && (
                                            <div className="h-20 w-20 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                                                +{article.images.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {article.articleDescription && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {article.articleDescription}
                                    </p>
                                </div>
                            )}

                            {/* Pending Requests */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Pending Requests ({article.requests.length})</h4>
                                <div className="space-y-2">
                                    {/* Article Requests */}
                                    {articleRequests.map((request) => (
                                        <RequestRow
                                            key={request.id}
                                            request={request}
                                            isSelected={selectedRequests.has(request.id)}
                                            onToggleSelect={() => onToggleRequestSelect(request.id)}
                                            onApprove={() => onApproveRequest(request.id, reviewNote)}
                                            onReject={() => onRejectRequest(request.id, reviewNote)}
                                            loading={loading}
                                        />
                                    ))}

                                    {/* Download Link Requests */}
                                    {downloadRequests.map((request) => (
                                        <RequestRow
                                            key={request.id}
                                            request={request}
                                            isSelected={selectedRequests.has(request.id)}
                                            onToggleSelect={() => onToggleRequestSelect(request.id)}
                                            onApprove={() => onApproveRequest(request.id, reviewNote)}
                                            onReject={() => onRejectRequest(request.id, reviewNote)}
                                            loading={loading}
                                        />
                                    ))}

                                    {/* Official Source Requests */}
                                    {officialSourceRequests.map((request) => (
                                        <RequestRow
                                            key={request.id}
                                            request={request}
                                            isSelected={selectedRequests.has(request.id)}
                                            onToggleSelect={() => onToggleRequestSelect(request.id)}
                                            onApprove={() => onApproveRequest(request.id, reviewNote)}
                                            onReject={() => onRejectRequest(request.id, reviewNote)}
                                            loading={loading}
                                        />
                                    ))}

                                    {/* Comment Requests */}
                                    {commentRequests.map((request) => (
                                        <RequestRow
                                            key={request.id}
                                            request={request}
                                            isSelected={selectedRequests.has(request.id)}
                                            onToggleSelect={() => onToggleRequestSelect(request.id)}
                                            onApprove={() => onApproveRequest(request.id, reviewNote)}
                                            onReject={() => onRejectRequest(request.id, reviewNote)}
                                            loading={loading}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Review Note & Bulk Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
                                <Textarea
                                    placeholder="Review note (optional)..."
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    className="flex-1 min-h-[60px]"
                                />
                                <div className="flex gap-2 sm:flex-col">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => onApproveAll(requestIds, reviewNote)}
                                        disabled={loading || requestIds.length === 0}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Approve All
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onRejectAll(requestIds, reviewNote)}
                                        disabled={loading || requestIds.length === 0}
                                        className="flex-1"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Reject All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
};

interface RequestRowProps {
    request: ModerationRequest;
    isSelected: boolean;
    onToggleSelect: () => void;
    onApprove: () => void;
    onReject: () => void;
    loading: boolean;
}

const RequestRow: React.FC<RequestRowProps> = ({
    request,
    isSelected,
    onToggleSelect,
    onApprove,
    onReject,
    loading,
}) => {
    const getEntityLabel = () => {
        switch (request.entityType) {
            case 'ARTICLE':
                return request.entityDetails?.title || 'Untitled Article';
            case 'DOWNLOAD_LINK':
            case 'OFFICIAL_DOWNLOAD_SOURCE':
                return request.entityDetails?.name || request.entityDetails?.url || 'Unnamed Link';
            case 'COMMENT':
                return request.entityDetails?.content?.substring(0, 50) + '...' || 'No content';
            default:
                return `Entity #${request.entityId}`;
        }
    };

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800 border">
            <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                className="h-4 w-4"
            />
            <EntityTypeBadge type={request.entityType} />
            <span className="flex-1 text-sm truncate">{getEntityLabel()}</span>
            {request.entityDetails?.url && (
                <a
                    href={request.entityDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            )}
            <StatusBadge status={request.status} />
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onApprove}
                    disabled={loading}
                    className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                    <Check className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReject}
                    disabled={loading}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default ArticleModerationCard;
