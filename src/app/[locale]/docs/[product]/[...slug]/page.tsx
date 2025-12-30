// app/docs/[product]/[...slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import DocsSidebar from "../../components/DocsSidebar";
import DocsContentLoader from "../../components/DocsContentLoader";
import type { Metadata } from "next";
import { products, contentMeta } from "@/config/docs";

interface DocPageProps {
    params: Promise<{
        product: string;
        slug: string[];
        locale: string;
    }>;
}

// Helper to get product data
function getProduct(key: string) {
    return products[key];
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
    const { product, slug } = await params;
    const slugStr = slug.join("/");
    const productData = getProduct(product);
    const meta = contentMeta[product]?.[slugStr];

    if (!productData || !meta) {
        return { title: "Documentation Not Found" };
    }

    return {
        title: `${meta.title} - ${productData.name} Docs`,
        description: meta.description,
        openGraph: {
            title: `${meta.title} - ${productData.name} Docs`,
            description: meta.description,
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${meta.title} - ${productData.name} Docs`,
            description: meta.description,
        }
    };
}

export default async function DocPage({ params }: DocPageProps) {
    const { product, slug, locale } = await params;
    const slugStr = slug.join("/");
    const productData = getProduct(product);

    if (!productData) {
        notFound();
    }

    // Find current doc for title and navigation
    const currentDocIndex = productData.docs.findIndex((d) => d.slug === slugStr);
    const currentDoc = productData.docs[currentDocIndex];

    if (!currentDoc) {
        notFound();
    }

    const prevDoc = productData.docs[currentDocIndex - 1];
    const nextDoc = productData.docs[currentDocIndex + 1];

    // Structured Data (JSON-LD)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: currentDoc.title,
        description: currentDoc.description,
        author: {
            "@type": "Organization",
            name: "Chanomhub"
        },
        publisher: {
            "@type": "Organization",
            name: "Chanomhub",
            logo: {
                "@type": "ImageObject",
                url: "https://chanomhub.com/icon.png"
            }
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://chanomhub.com/${locale}/docs/${product}/${slugStr}`
        }
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Docs",
                item: `https://chanomhub.com/${locale}/docs`
            },
            {
                "@type": "ListItem",
                position: 2,
                name: productData.name,
                item: `https://chanomhub.com/${locale}/docs/${product}`
            },
            {
                "@type": "ListItem",
                position: 3,
                name: currentDoc.title,
                item: `https://chanomhub.com/${locale}/docs/${product}/${slugStr}`
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <div className="flex flex-col md:flex-row max-w-[1440px] mx-auto">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:block w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 overflow-y-auto pt-8 pb-8 pl-6">
                    <DocsSidebar
                        product={product}
                        productName={productData.name}
                        docs={productData.docs}
                        currentSlug={slugStr}
                        locale={locale}
                    />
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 px-6 md:px-12 py-8 md:py-12">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                        <Link href={`/${locale}/docs`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Docs
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href={`/${locale}/docs/${product}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {productData.name}
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {currentDoc.title}
                        </span>
                    </nav>

                    {/* Content Wrapper */}
                    <div className="max-w-3xl">
                        {/* Article Content */}
                        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg">
                            <DocsContentLoader product={product} slug={slugStr} />
                        </article>

                        {/* Page Navigation */}
                        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-4">
                            {prevDoc ? (
                                <Link
                                    href={`/${locale}/docs/${product}/${prevDoc.slug}`}
                                    className="group flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
                                >
                                    <span className="text-xs text-gray-500 dark:text-gray-500 mb-1">Previous</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <ChevronLeft className="inline-block w-4 h-4 mr-1" />
                                        {prevDoc.title}
                                    </span>
                                </Link>
                            ) : <div />}

                            {nextDoc ? (
                                <Link
                                    href={`/${locale}/docs/${product}/${nextDoc.slug}`}
                                    className="group flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-right"
                                >
                                    <span className="text-xs text-gray-500 dark:text-gray-500 mb-1">Next</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {nextDoc.title}
                                        <ChevronRight className="inline-block w-4 h-4 ml-1" />
                                    </span>
                                </Link>
                            ) : <div />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    return [];
}
