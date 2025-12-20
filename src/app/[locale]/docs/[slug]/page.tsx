// app/docs/[slug]/page.tsx
import { FileText, Book, Settings, HelpCircle, ChevronRight } from "lucide-react";
import DocsContent from "../components/DocsContent";
import Link from "next/link";

interface DocsPageProps {
  params: Promise<{ slug: string }>;
}

// แมป slug พร้อมข้อมูลเพิ่มเติม
const contentMap = {
  "getting-started": {
    title: "เริ่มต้นใช้งาน",
    icon: Book,
    description: "คู่มือเริ่มต้นใช้งานอย่างรวดเร็ว"
  },
  "installation": {
    title: "การติดตั้ง",
    icon: Settings,
    description: "วิธีการติดตั้งและตั้งค่าระบบ"
  },
  "advanced-features": {
    title: "ฟีเจอร์ขั้นสูง",
    icon: FileText,
    description: "ฟีเจอร์และการใช้งานขั้นสูง"
  },
  "faq": {
    title: "คำถามที่พบบ่อย",
    icon: HelpCircle,
    description: "คำตอบสำหรับคำถามที่พบบ่อย"
  }
};

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const currentPage = contentMap[slug as keyof typeof contentMap];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            หน้าแรก
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/docs" className="hover:text-blue-400 transition-colors">
            เอกสาร
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-400 font-medium">
            {currentPage?.title || "เอกสาร"}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700/20">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-100">เมนูนำทาง</h3>
                </div>

                <nav className="space-y-2">
                  {Object.entries(contentMap).map(([key, item]) => {
                    const Icon = item.icon;
                    const isActive = slug === key;

                    return (
                      <Link
                        key={key}
                        href={`/docs/${key}`}
                        className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                            ? "bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg transform scale-105"
                            : "text-gray-300 hover:bg-gray-700 hover:text-blue-400 hover:transform hover:scale-105"
                          }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-400"}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.title}</div>
                          {!isActive && (
                            <div className="text-xs text-gray-400 group-hover:text-blue-300 mt-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white">
                <div className="flex items-center space-x-4">
                  {currentPage && (
                    <>
                      <div className="w-12 h-12 bg-gray-900/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <currentPage.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{currentPage.title}</h1>
                        <p className="text-blue-200 text-lg">{currentPage.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-gray-100 prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-pre:bg-gray-900 prose-pre:text-gray-100">
                  <DocsContent slug={slug} />
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                เอกสารประกอบ
              </div>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-gray-300 hover:text-blue-400">
                  <span>แก้ไขหน้านี้</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(contentMap).map((slug) => ({
    slug,
  }));
}