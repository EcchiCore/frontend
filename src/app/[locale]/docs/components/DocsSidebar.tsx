
// app/docs/components/DocsSidebar.tsx
"use client";

import Link from "next/link";
import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";
import { iconMap, DocItem } from "@/config/docs";

interface DocsSidebarProps {
    product: string;
    productName: string;
    docs: DocItem[];
    currentSlug: string;
    locale: string;
}


export default function DocsSidebar({
    product,
    productName,
    docs,
    currentSlug,
    locale,
}: DocsSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="w-64 pr-8 border-r border-gray-200 dark:border-gray-800 hidden md:block">
            <div className="sticky top-8">
                {/* Product Name */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                            <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        {productName}
                    </h3>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                    {docs.map((doc) => {
                        const isActive = currentSlug === doc.slug;
                        return (
                            <Link
                                key={doc.slug}
                                href={`/${locale}/docs/${product}/${doc.slug}`}
                                className={`group flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${isActive
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"
                                    }`}
                            >
                                <span>{doc.title}</span>
                                {
                                    doc.badge && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${isActive
                                            ? "border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-800 dark:bg-blue-900/50"
                                            : "border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800"
                                            }`}>
                                            {doc.badge}
                                        </span>
                                    )
                                }
                            </Link >
                        );
                    })}
                </nav >

                {/* Back Link */}
                < div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800" >
                    <Link
                        href={`/${locale}/docs`}
                        className="flex items-center text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                        <ChevronDown className="w-4 h-4 mr-1 rotate-90" />
                        All Products
                    </Link>
                </div >
            </div >
        </div >
    );
}
