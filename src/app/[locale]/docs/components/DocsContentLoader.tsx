// app/docs/components/DocsContentLoader.tsx
"use client";

import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "../../components/mdx/MyComponent";

// Lazy imports for code splitting while still being build-time compiled
import dynamic from "next/dynamic";

// Use dynamic with ssr: false to avoid SSR issues while keeping build-time compilation
const Chanox2Installation = dynamic(() => import("../contents/chanox2/installation.mdx"), { ssr: false });
const Chanox2GettingStarted = dynamic(() => import("../contents/chanox2/getting-started.mdx"), { ssr: false });
const Chanox2Configuration = dynamic(() => import("../contents/chanox2/configuration.mdx"), { ssr: false });
const Chanox2Troubleshooting = dynamic(() => import("../contents/chanox2/troubleshooting.mdx"), { ssr: false });
const GeneralGettingStarted = dynamic(() => import("../contents/getting-started.mdx"), { ssr: false });
const GeneralInstallation = dynamic(() => import("../contents/installation.mdx"), { ssr: false });
const GeneralAdvancedFeatures = dynamic(() => import("../contents/advanced-features.mdx"), { ssr: false });
const GeneralFaq = dynamic(() => import("../contents/faq.mdx"), { ssr: false });

// Content map using dynamic components
const contentMap: Record<string, Record<string, React.ComponentType>> = {
    chanox2: {
        installation: Chanox2Installation,
        "getting-started": Chanox2GettingStarted,
        configuration: Chanox2Configuration,
        troubleshooting: Chanox2Troubleshooting,
    },
    general: {
        "getting-started": GeneralGettingStarted,
        installation: GeneralInstallation,
        "advanced-features": GeneralAdvancedFeatures,
        faq: GeneralFaq,
    },
};

interface DocsContentLoaderProps {
    product: string;
    slug: string;
    locale: string;
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

    const Content = productContent[slug];

    return (
        <MDXProvider components={mdxComponents}>
            <Content />
        </MDXProvider>
    );
}
