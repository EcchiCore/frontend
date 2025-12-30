// app/docs/[product]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Book } from "lucide-react";
import type { Metadata } from "next";
import { products, iconMap } from "@/config/docs";

// Helper to get product data
export function getProduct(key: string) {
    return products[key];
}

export function getAllProducts() {
    return Object.entries(products).map(([key, value]) => ({
        key,
        ...value,
    }));
}

interface ProductPageProps {
    params: Promise<{ product: string; locale: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { product } = await params;
    const productData = getProduct(product);

    if (!productData) {
        return { title: "Not Found" };
    }

    return {
        title: `${productData.name} Documentation - Chanomhub Docs`,
        description: productData.description,
        openGraph: {
            title: `${productData.name} Documentation - Chanomhub Docs`,
            description: productData.description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${productData.name} Documentation - Chanomhub Docs`,
            description: productData.description,
        }
    };
}

export default async function ProductDocsPage({ params }: ProductPageProps) {
    const { product, locale } = await params;
    const productData = getProduct(product);

    if (!productData) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-300">
            <div className="container mx-auto px-6 py-12 max-w-5xl">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                    <Link href={`/${locale}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href={`/${locale}/docs`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Docs
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{productData.name}</span>
                </nav>

                {/* Product Header */}
                <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Book className="w-8 h-8 text-gray-900 dark:text-white" />
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">{productData.name} Docs</h1>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                        {productData.description}
                    </p>
                </div>

                {/* Documentation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {productData.docs.map((doc) => {
                        const Icon = iconMap[doc.iconName] || Book;
                        return (
                            <Link
                                key={doc.slug}
                                href={`/${locale}/docs/${product}/${doc.slug}`}
                                className="group block p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-white dark:bg-[#161b22]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {doc.title}
                                            </h3>
                                            {doc.badge && (
                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-medium rounded-full">
                                                    {doc.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {doc.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="p-6 bg-gray-50 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Resources</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/${locale}/chanox2`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Download ChanoX2
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <a
                            href="https://github.com/Chanomhub/ChanoX2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            GitHub Repository
                        </a>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <a
                            href="https://discord.gg/chanomhub"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Discord Community
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    return Object.keys(products).map((product) => ({
        product,
    }));
}
