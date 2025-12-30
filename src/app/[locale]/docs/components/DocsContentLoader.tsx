// app/docs/components/DocsContentLoader.tsx
"use client";

import dynamic from "next/dynamic";
import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "../../components/mdx/MyComponent";
import { Loader2 } from "lucide-react";

// Content map for all products and slugs
const contentMap: Record<string, Record<string, () => Promise<any>>> = {
    chanox2: {
        installation: () => import("../contents/chanox2/installation.mdx"),
        "getting-started": () => import("../contents/chanox2/getting-started.mdx"),
        configuration: () => import("../contents/chanox2/configuration.mdx"),
        troubleshooting: () => import("../contents/chanox2/troubleshooting.mdx"),
    },
    // Legacy flat content for backward compatibility
    general: {
        "getting-started": () => import("../contents/getting-started.mdx"),
        installation: () => import("../contents/installation.mdx"),
        "advanced-features": () => import("../contents/advanced-features.mdx"),
        faq: () => import("../contents/faq.mdx"),
    },
};

interface DocsContentLoaderProps {
    product: string;
    slug: string;
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                <span className="text-gray-400 font-medium">กำลังโหลดเนื้อหา...</span>
            </div>
        </div>
    );
}

function ErrorMessage({ product, slug }: { product: string; slug: string }) {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">ไม่พบเนื้อหา</h3>
            <p className="text-gray-400">
                ไม่พบเนื้อหาสำหรับ &quot;{product}/{slug}&quot;
            </p>
        </div>
    );
}

export default function DocsContentLoader({ product, slug }: DocsContentLoaderProps) {
    const productContent = contentMap[product];

    if (!productContent || !productContent[slug]) {
        return <ErrorMessage product={product} slug={slug} />;
    }

    const Content = dynamic(productContent[slug], {
        ssr: true,
        loading: LoadingSpinner,
    });

    return (
        <MDXProvider components={mdxComponents}>
            <Content />
        </MDXProvider>
    );
}
