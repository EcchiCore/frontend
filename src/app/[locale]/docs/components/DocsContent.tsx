// app/docs/components/DocsContent.tsx
"use client";

import dynamic from "next/dynamic";
import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "../../components/mdx/MyComponent";
import { Loader2 } from "lucide-react";

// แมป slug ไปยังไฟล์ MDX
const contentMap: { [key: string]: () => Promise<any> } = {
  "getting-started": () => import("../contents/getting-started.mdx"),
  "installation": () => import("../contents/installation.mdx"),
  "advanced-features": () => import("../contents/advanced-features.mdx"),
  "faq": () => import("../contents/faq.mdx"),
};

interface DocsContentProps {
  slug: string;
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-gray-600 font-medium">กำลังโหลดเนื้อหา...</span>
      </div>
    </div>
  );
}

// Error Component
function ErrorMessage({ slug }: { slug: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-500 text-2xl">⚠️</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่พบเนื้อหา</h3>
      <p className="text-gray-600">ไม่พบเนื้อหาสำหรับหน้า &#34;{slug}&#34;</p>
    </div>
  );
}

export default function DocsContent({ slug }: DocsContentProps) {
  // ตรวจสอบว่า slug มีอยู่ใน contentMap หรือไม่
  if (!contentMap[slug]) {
    return <ErrorMessage slug={slug} />;
  }

  const DocsContent = dynamic(
    contentMap[slug],
    {
      ssr: true,
      loading: LoadingSpinner,
    }
  );

  return (
    <MDXProvider components={mdxComponents}>
      <DocsContent />
    </MDXProvider>
  );
}