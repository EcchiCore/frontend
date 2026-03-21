'use client';

import React from 'react';
import { Check, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkActionBarProps {
    totalCount: number;
    selectedCount: number;
    isAllSelected: boolean;
    onSelectAll: () => void;
    onApproveSelected: () => void;
    onRejectSelected: () => void;
    loading: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    totalCount,
    selectedCount,
    isAllSelected,
    onSelectAll,
    onApproveSelected,
    onRejectSelected,
    loading,
}) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
            {/* Select All */}
            <div className="flex items-center gap-2">
                <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    className="h-5 w-5"
                />
                <span className="text-sm font-medium">
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Selection Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckSquare className="w-4 h-4" />
                <span>
                    {selectedCount} of {totalCount} selected
                </span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="default"
                    size="sm"
                    onClick={onApproveSelected}
                    disabled={loading || selectedCount === 0}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    <Check className="w-4 h-4 mr-1" />
                    Approve Selected ({selectedCount})
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onRejectSelected}
                    disabled={loading || selectedCount === 0}
                >
                    <X className="w-4 h-4 mr-1" />
                    Reject Selected
                </Button>
            </div>
        </div>
    );
};

export default BulkActionBar;
