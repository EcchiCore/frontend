"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Filter, Clock, MessageCircle, User, Tag, ChevronDown, X, Send } from "lucide-react";
import PropTypes from "prop-types";

interface NotionPage {
  id: string;
  properties: {
    Title?: { title: { plain_text: string }[] };
    Description?: { rich_text: { plain_text: string }[] };
    Status?: { select: { name: string } };
    Tags?: { multi_select: { name: string }[] };
    DatePosted?: { date: { start: string } };
    Author?: { rich_text: { plain_text: string }[] };
    Priority?: { select: { name: string } };
    Category?: { select: { name: string } };
    Responses?: { number: number };
    [key: string]: any;
  };
}

interface CommunityProps {
  initialPages: NotionPage[];
}

const Community: React.FC<CommunityProps> = ({ initialPages }) => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "date" | "responses" | null>("date");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newProblem, setNewProblem] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    tags: [] as string[],
    tagInput: ""
  });

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const processedPages = initialPages.filter(
      (result): result is NotionPage => "properties" in result
    );
    setPages(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(processedPages)) {
        return processedPages;
      }
      return prev;
    });
  }, [initialPages]);

  // Filter and sort pages
  const filteredPages = useMemo(() => {
    return pages
      .filter((page) => {
        const title = page.properties.Title?.title[0]?.plain_text?.toLowerCase() || "";
        const description = page.properties.Description?.rich_text[0]?.plain_text?.toLowerCase() || "";
        const status = page.properties.Status?.select?.name || "";
        const category = page.properties.Category?.select?.name || "";
        const search = debouncedSearchTerm.toLowerCase();

        return (
          (title.includes(search) || description.includes(search)) &&
          (!statusFilter || status === statusFilter) &&
          (!categoryFilter || category === categoryFilter)
        );
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          const aTitle = a.properties.Title?.title[0]?.plain_text || "";
          const bTitle = b.properties.Title?.title[0]?.plain_text || "";
          return aTitle.localeCompare(bTitle);
        }
        if (sortBy === "date") {
          const aDate = a.properties.DatePosted?.date?.start || "0";
          const bDate = b.properties.DatePosted?.date?.start || "0";
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }
        if (sortBy === "responses") {
          const aResponses = a.properties.Responses?.number || 0;
          const bResponses = b.properties.Responses?.number || 0;
          return bResponses - aResponses;
        }
        return 0;
      });
  }, [pages, debouncedSearchTerm, statusFilter, categoryFilter, sortBy]);

  const handleAddTag = useCallback(() => {
    if (newProblem.tagInput.trim() && !newProblem.tags.includes(newProblem.tagInput.trim())) {
      setNewProblem(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ""
      }));
    }
  }, [newProblem.tagInput, newProblem.tags]); // Added newProblem.tags to dependencies

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setNewProblem(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!newProblem.title.trim() || !newProblem.description.trim()) {
      alert("กรุณากรอกหัวข้อและรายละเอียดปัญหา");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/community/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newProblem.title,
          description: newProblem.description,
          category: newProblem.category || "General",
          priority: newProblem.priority || "Medium",
          tags: newProblem.tags,
          author: "Anonymous"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "เกิดข้อผิดพลาดในการโพสต์");
      }

      const newPost = await response.json();
      setPages(prev => [newPost, ...prev]);
      setNewProblem({
        title: "",
        description: "",
        category: "",
        priority: "",
        tags: [],
        tagInput: ""
      });
      setShowCreateForm(false);
      alert("โพสต์ปัญหาเรียบร้อยแล้ว!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(error.message || "เกิดข้อผิดพลาดในการโพสต์");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-emerald-500 text-white";
      case "Solved":
        return "bg-blue-500 text-white";
      case "In Progress":
        return "bg-amber-500 text-white";
      case "Closed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative container mx-auto px-6 py-20">
            <div className="text-center text-white">
              <h1
                className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Community Help Center
              </h1>
              <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                แชร์ปัญหา แลกเปลี่ยนความรู้ และช่วยเหลือกันในชุมชนนักพัฒนา
              </p>
              <div className="mt-10">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="group bg-white text-blue-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
                  aria-label="แชร์ปัญหาใหม่"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  แชร์ปัญหาใหม่
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate登1.1.0 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาปัญหาหรือคำถาม..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="ค้นหาปัญหา"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                aria-expanded={showFilters}
                aria-label="สลับตัวกรอง"
              >
                <Filter className="w-5 h-5" />
                ตัวกรอง
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    className="p-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusFilter || ""}
                    onChange={(e) => setStatusFilter(e.target.value || null)}
                    aria-label="เลือกสถานะ"
                  >
                    <option value="">สถานะทั้งหมด</option>
                    <option value="Open">เปิดรับคำตอบ</option>
                    <option value="Solved">แก้ไขแล้ว</option>
                    <option value="In Progress">กำลังดำเนินการ</option>
                    <option value="Closed">ปิด</option>
                  </select>

                  <select
                    className="p-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={categoryFilter || ""}
                    onChange={(e) => setCategoryFilter(e.target.value || null)}
                    aria-label="เลือกหมวดหมู่"
                  >
                    <option value="">หมวดหมู่ทั้งหมด</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Web">Web Development</option>
                    <option value="General">General</option>
                    <option value="Other">Other</option>
                  </select>

                  <select
                    className="p-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sortBy || ""}
                    onChange={(e) => setSortBy(e.target.value as "title" | "date" | "responses" | null)}
                    aria-label="เลือกการเรียงลำดับ"
                  >
                    <option value="">เรียงตาม</option>
                    <option value="date">วันที่โพสต์</option>
                    <option value="title">หัวข้อ</option>
                    <option value="responses">จำนวนคำตอบ</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Problem Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">แชร์ปัญหาของคุณ</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="ปิดฟอร์ม"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="title">
                    หัวข้อปัญหา *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    className="w-full p-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                    placeholder="เช่น: ปัญหาการใช้งาน React Hook..."
                    value={newProblem.title}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, title: e.target.value }))}
                    aria-required="true"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="description">
                    รายละเอียดปัญหา *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={6}
                    className="w-full p-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none"
                    placeholder="อธิบายปัญหาของคุณให้ละเอียด รวมถึง code ที่เกี่ยวข้อง error message หรือสิ่งที่คุณได้ลองทำแล้ว..."
                    value={newProblem.description}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, description: e.target.value }))}
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="category">
                      หมวดหมู่
                    </label>
                    <select
                      id="category"
                      className="w-full p-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newProblem.category}
                      onChange={(e) => setNewProblem(prev => ({ ...prev, category: e.target.value }))}
                      aria-label="เลือกหมวดหมู่"
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Database">Database</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Web">Web Development</option>
                      <option value="General">General</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="priority">
                      ระดับความเร่งด่วน
                    </label>
                    <select
                      id="priority"
                      className="w-full p-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newProblem.priority}
                      onChange={(e) => setNewProblem(prev => ({ ...prev, priority: e.target.value }))}
                      aria-label="เลือกระดับความเร่งด่วน"
                    >
                      <option value="">เลือกระดับ</option>
                      <option value="Low">Low - ไม่เร่งด่วน</option>
                      <option value="Medium">Medium - ปานกลาง</option>
                      <option value="High">High - เร่งด่วน</option>
                      <option value="Critical">Critical - วิกฤต</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="tags">
                    แท็ก (ช่วยให้หาง่ายขึ้น)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      id="tags"
                      type="text"
                      className="flex-1 p-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                      placeholder="เช่น: React, TypeScript, CSS..."
                      value={newProblem.tagInput}
                      onChange={(e) => setNewProblem(prev => ({ ...prev, tagInput: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      aria-label="เพิ่มแท็ก"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors duration-200"
                      aria-label="เพิ่มแท็ก"
                    >
                      เพิ่ม
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newProblem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm flex items-center gap-2 border border-blue-200"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800 ml-1 p-1 hover:bg-blue-200 rounded-full transition-colors"
                          aria-label={`ลบแท็ก ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label="โพสต์ปัญหา"
                  >
                    <Send className="w-5 h-5" />
                    {isLoading ? "กำลังโพสต์..." : "โพสต์ปัญหา"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
                    aria-label="ยกเลิก"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Problem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredPages.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg font-medium">ไม่พบปัญหาที่ตรงกับการค้นหา</p>
                <p className="text-gray-400 text-sm mt-2">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
              </div>
            </div>
          )}

          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
              role="article"
              aria-labelledby={`page-title-${page.id}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <h3
                      id={`page-title-${page.id}`}
                      className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200"
                    >
                      {page.properties.Title?.title[0]?.plain_text || "ไม่มีหัวข้อ"}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(page.properties.Status?.select?.name || "Open")} shadow-sm`}
                    aria-label={`สถานะ: ${page.properties.Status?.select?.name || "Open"}`}
                  >
                    {page.properties.Status?.select?.name || "Open"}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{page.properties.Category?.select?.name || "General"}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(page.properties.Priority?.select?.name || "Medium")}`}
                    aria-label={`ความเร่งด่วน: ${page.properties.Priority?.select?.name || "Medium"}`}
                  >
                    {page.properties.Priority?.select?.name || "Medium"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {page.properties.Description?.rich_text[0]?.plain_text || "ไม่มีรายละเอียด"}
                </p>

                {page.properties.Tags?.multi_select && page.properties.Tags.multi_select.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {page.properties.Tags.multi_select.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium border border-gray-200 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                      </span>
                    ))}
                    {page.properties.Tags.multi_select.length > 3 && (
                      <span className="text-gray-500 text-xs px-2 py-1">
                        +{page.properties.Tags.multi_select.length - 3} เพิ่มเติม
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{page.properties.Author?.rich_text[0]?.plain_text || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{page.properties.Responses?.number || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {page.properties.DatePosted?.date?.start
                        ? new Date(page.properties.DatePosted.date.start).toLocaleDateString("th-TH")
                        : "ไม่ระบุ"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// PropTypes for type checking
Community.propTypes = {
  initialPages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      properties: PropTypes.object.isRequired
    }).isRequired
  ).isRequired
};

export default React.memo(Community);