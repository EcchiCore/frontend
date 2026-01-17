"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "chanomhub_view_history";
const MAX_TAGS = 50; // Maximum tags to track

interface ViewHistory {
    tags: Record<string, number>; // tag name -> view count
    lastUpdated: string;
}

interface UseViewHistoryReturn {
    /** Record a view for the given tags */
    recordView: (tags: string[]) => void;
    /** Get top N preferred tags based on view count */
    getPreferredTags: (limit?: number) => string[];
    /** Get all tag scores */
    tagScores: Record<string, number>;
    /** Check if a tag is in user's preferences */
    hasPreference: (tag: string) => boolean;
}

function getStoredHistory(): ViewHistory {
    if (typeof window === "undefined") {
        return { tags: {}, lastUpdated: new Date().toISOString() };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn("Failed to read view history:", e);
    }

    return { tags: {}, lastUpdated: new Date().toISOString() };
}

function saveHistory(history: ViewHistory): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.warn("Failed to save view history:", e);
    }
}

export function useViewHistory(): UseViewHistoryReturn {
    const [tagScores, setTagScores] = useState<Record<string, number>>({});

    // Load history on mount
    useEffect(() => {
        const history = getStoredHistory();
        setTagScores(history.tags);
    }, []);

    const recordView = useCallback((tags: string[]) => {
        if (tags.length === 0) return;

        const history = getStoredHistory();
        const normalizedTags = tags.map((t) => t.toLowerCase());

        // Increment count for each tag
        for (const tag of normalizedTags) {
            history.tags[tag] = (history.tags[tag] || 0) + 1;
        }

        // Prune if too many tags (keep top ones)
        const entries = Object.entries(history.tags);
        if (entries.length > MAX_TAGS) {
            const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, MAX_TAGS);
            history.tags = Object.fromEntries(sorted);
        }

        history.lastUpdated = new Date().toISOString();
        saveHistory(history);
        setTagScores(history.tags);
    }, []);

    const getPreferredTags = useCallback(
        (limit = 10): string[] => {
            return Object.entries(tagScores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([tag]) => tag);
        },
        [tagScores]
    );

    const hasPreference = useCallback(
        (tag: string): boolean => {
            return tag.toLowerCase() in tagScores;
        },
        [tagScores]
    );

    return {
        recordView,
        getPreferredTags,
        tagScores,
        hasPreference,
    };
}
