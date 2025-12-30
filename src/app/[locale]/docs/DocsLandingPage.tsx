// app/docs/DocsLandingPage.tsx (Updated)
"use client";

import Link from "next/link";
import { Book, FileText, Settings, HelpCircle, Gamepad2, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { products, ProductConfig } from "@/config/docs";

// General docs (legacy support - mapped to ChanoX2)
// Ideally this should also be in a config if it grows, but fine here for legacy mapping
interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics and get started with Chanomhub quickly",
    icon: <Book className="w-6 h-6" />,
    href: "/docs/chanox2/getting-started",
    badge: "Recommended",
  },
  {
    id: "installation",
    title: "Installation",
    description: "Step-by-step guide to setting up your project locally",
    icon: <FileText className="w-6 h-6" />,
    href: "/docs/chanox2/installation",
  },
  {
    id: "advanced-features",
    title: "Configuration",
    description: "Explore customization options for maximum efficiency",
    icon: <Settings className="w-6 h-6" />,
    href: "/docs/chanox2/configuration",
  },
  {
    id: "faq",
    title: "Troubleshooting",
    description: "Answers to common questions and basic troubleshooting",
    icon: <HelpCircle className="w-6 h-6" />,
    href: "/docs/chanox2/troubleshooting",
  },
];

export default function DocsLandingPage() {
  const params = useParams();
  const locale = params.locale as string || 'th';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-300">
      <div className="container mx-auto px-6 py-12 max-w-5xl">

        {/* Header */}
        <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Guides and reference for Chanomhub products.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {Object.entries(products).map(([key, product]) => (
            <Link
              key={key}
              href={`/${locale}/docs/${key}`}
              className="block p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-white dark:bg-[#161b22]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-gray-900 dark:text-white">
                  {/* Hardcoded icon for now as config has path string, but we want component here. 
                      In a full refactor we might map string to component lookup. 
                      For ChanoX2 specifically we know it's Gamepad2 */}
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {product.name}
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Product
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            </Link>
          ))}
        </div>

        {/* General / Legacy Docs */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Guides</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docSections.map((section) => (
              <li key={section.id}>
                <Link
                  href={`/${locale}${section.href}`}
                  className="flex items-start gap-3 p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {section.icon}
                  </div>
                  <div>
                    <div className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {section.title}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {section.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}