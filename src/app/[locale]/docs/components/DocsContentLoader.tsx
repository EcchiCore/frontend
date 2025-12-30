import React from "react";

// Static imports for MDX content
import Chanox2Installation from "../contents/chanox2/installation.mdx";
import Chanox2GettingStarted from "../contents/chanox2/getting-started.mdx";
import Chanox2Configuration from "../contents/chanox2/configuration.mdx";
import Chanox2Troubleshooting from "../contents/chanox2/troubleshooting.mdx";
import GeneralGettingStarted from "../contents/getting-started.mdx";
import GeneralInstallation from "../contents/installation.mdx";
import GeneralAdvancedFeatures from "../contents/advanced-features.mdx";
import GeneralFaq from "../contents/faq.mdx";

// Static content map
const contentMap: Record<string, Record<string, React.ComponentType<any>>> = {
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

export default function DocsContentLoader({ product, slug, locale }: DocsContentLoaderProps) {
    const productContent = contentMap[product];

    if (!productContent || !productContent[slug]) {
        return <ErrorMessage product={product} slug={slug} />;
    }

    const Content = productContent[slug];

    return (
        <div className="mdx-content">
            <Content />
        </div>
    );
}
