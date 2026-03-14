"use client";

import { useEffect, useRef } from "react";
import { getSdk } from "@/lib/sdk";

interface ArticleViewTrackerProps {
    slug: string;
}

/**
 * Client component to track article views with a delay to avoid accidental or bot views.
 */
export default function ArticleViewTracker({ slug }: ArticleViewTrackerProps) {
    const trackedRef = useRef(false);

    useEffect(() => {
        // Only track once per component mount (page visit)
        if (trackedRef.current) return;

        const timer = setTimeout(async () => {
            try {
                const sdk = await getSdk();
                await sdk.articles.incrementView(slug);
                trackedRef.current = true;
                // console.log(`View recorded for ${slug}`);
            } catch (error) {
                // Silently fail view tracking to not affect UX
                console.error("Failed to record view:", error);
            }
        }, 5000); // 5 seconds delay

        return () => clearTimeout(timer);
    }, [slug]);

    return null; // This component doesn't render anything
}
