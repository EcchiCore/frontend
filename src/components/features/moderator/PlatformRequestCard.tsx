'use client';

import React, { useState } from 'react';
import { Check, X, UserCheck, Landmark, Globe, Type, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ModerationRequest } from './ArticleModerationCard';

interface PlatformRequestCardProps {
    request: ModerationRequest;
    isSelected: boolean;
    onToggleSelect: (requestId: number) => void;
    onApprove: (requestId: number, reviewNote: string) => void;
    onReject: (requestId: number, reviewNote: string) => void;
    loading: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
    if (!status) return null;
    const config = {
        PENDING: 'secondary',
        APPROVED: 'default',
        REJECTED: 'destructive',
        NEEDS_REVISION: 'outline',
    }[status] || 'secondary';
    return (
        <Badge variant={config as 'default' | 'secondary' | 'outline' | 'destructive'} className="text-xs">
            {status.replace('_', ' ')}
        </Badge>
    );
};

export const PlatformRequestCard: React.FC<PlatformRequestCardProps> = ({
    request,
    isSelected,
    onToggleSelect,
    onApprove,
    onReject,
    loading,
}) => {
    const [reviewNote, setReviewNote] = useState('');
    const { entityType, requester, entityDetails } = request;

    const borderColorClass = entityType === 'FONT'
        ? 'border-l-4 border-l-teal-500'
        : 'border-l-4 border-l-indigo-500';

    const getTitle = () => {
        if (entityType === 'FONT') return entityDetails?.name || 'Unnamed Font';
        if (entityType === 'DEVELOPER_PROFILE') return entityDetails?.realName || 'Unnamed Developer';
        return `Request #${request.id}`;
    };

    const getSubtitle = () => {
        if (entityType === 'FONT') {
            const parts = [];
            if (entityDetails?.engine) parts.push(entityDetails.engine);
            if (entityDetails?.engineVersion) parts.push(`(${entityDetails.engineVersion})`);
            if (entityDetails?.language) parts.push(`• ${entityDetails.language.toUpperCase()}`);
            return parts.join(' ');
        }
        if (entityType === 'DEVELOPER_PROFILE') {
            return entityDetails?.bankName ? `Bank: ${entityDetails.bankName}` : '';
        }
        return '';
    };

    const titleIcon = entityType === 'FONT'
        ? <Type className="w-5 h-5 text-teal-600 flex-shrink-0" />
        : <UserCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />;

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className={`overflow-hidden rounded-lg bg-white dark:bg-gray-900 border transition-all duration-200 hover:shadow-md ${borderColorClass}`}>
            {/* Card Header — title row */}
            <div className="flex items-center gap-4 px-4 py-3">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(request.id)}
                    className="h-5 w-5 flex-shrink-0"
                />

                {/* Icon placeholder (16×16 = like thumbnail) */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    {titleIcon}
                </div>

                {/* Title + subtitle + requester */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base truncate">{getTitle()}</h3>
                        <StatusBadge status={request.status} />
                    </div>
                    {getSubtitle() && (
                        <p className="text-xs text-muted-foreground mt-0.5">{getSubtitle()}</p>
                    )}
                    {requester && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={requester.image || ''} alt={requester.name || 'User'} />
                                <AvatarFallback className="text-[9px]">{requester.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{requester.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</span>
                        </div>
                    )}
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap">1 pending</span>
            </div>

            {/* Body — details, files, review note, actions */}
            <div className="border-t px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">

                {/* Request Note */}
                {request.requestNote && (
                    <div className="text-xs bg-white dark:bg-gray-800 border border-dashed rounded p-2">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Note:</span>
                        <p className="text-muted-foreground">{request.requestNote}</p>
                    </div>
                )}

                {/* FONT details */}
                {entityType === 'FONT' && entityDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div><span className="font-bold text-gray-600 dark:text-gray-400">Slug:</span> {entityDetails.slug}</div>
                        <div>
                            <span className="font-bold text-gray-600 dark:text-gray-400">Engine:</span>{' '}
                            {entityDetails.engine} {entityDetails.engineVersion ? `(${entityDetails.engineVersion})` : ''}
                        </div>
                        <div><span className="font-bold text-gray-600 dark:text-gray-400">Language:</span> {entityDetails.language?.toUpperCase()}</div>

                        {entityDetails.assets && entityDetails.assets.length > 0 && (
                            <div className="col-span-full border-t pt-2 mt-1 border-gray-200 dark:border-gray-700">
                                <span className="font-bold text-[10px] text-gray-500 uppercase tracking-wide block mb-1.5">Files:</span>
                                <div className="space-y-1">
                                    {entityDetails.assets.map((asset: any) => (
                                        <div key={asset.id} className="flex items-center justify-between px-2 py-1.5 bg-white dark:bg-gray-800 rounded border text-xs">
                                            <span className="font-mono truncate max-w-[260px]">{asset.key.split('/').pop()}</span>
                                            <a href={asset.url} download className="text-blue-500 hover:underline font-semibold ml-3 whitespace-nowrap">
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* DEVELOPER_PROFILE details */}
                {entityType === 'DEVELOPER_PROFILE' && entityDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Landmark className="h-3.5 w-3.5 text-gray-400" />
                            <span className="font-bold">Bank Name:</span> {entityDetails.bankName}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {entityDetails.bankType === 'LOCAL' ? <Landmark className="h-3.5 w-3.5 text-gray-400" /> : <Globe className="h-3.5 w-3.5 text-gray-400" />}
                            <span className="font-bold">Account:</span> {entityDetails.bankAccount}
                        </div>
                        {entityDetails.swiftCode && (
                            <div className="flex items-center gap-1.5">
                                <Globe className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-bold">SWIFT:</span> {entityDetails.swiftCode}
                            </div>
                        )}
                        {entityDetails.citizenId && (
                            <div className="flex items-center gap-1.5">
                                <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-bold">ID:</span> {entityDetails.citizenId}
                            </div>
                        )}
                        {entityDetails.bankAddress && (
                            <div className="col-span-full border-t pt-2 mt-1 border-gray-200 dark:border-gray-700">
                                <span className="font-bold">Address:</span>{' '}
                                <span className="text-gray-600 dark:text-gray-400">{entityDetails.bankAddress}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Review note + Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Textarea
                        placeholder="Review note (optional)..."
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="flex-1 min-h-[44px] text-sm"
                    />
                    <div className="flex gap-2 sm:flex-col justify-end">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onReject(request.id, reviewNote)}
                            disabled={loading}
                            className="flex-1 h-9"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onApprove(request.id, reviewNote)}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 h-9"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
