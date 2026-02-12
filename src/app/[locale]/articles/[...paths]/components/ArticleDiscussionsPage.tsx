"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Article } from "@/types/article";
import ArticleCommunityTabs from "./ArticleCommunityTabs";
import CommentsSection from "./CommentsSection"; // Reuse existing comments section
import { useArticleComments } from "./hooks/useArticleComments"; // Reuse existing hook

interface ArticleDiscussionsPageProps {
    article: Article;
    isAuthenticated?: boolean;
}

const ArticleDiscussionsPage: React.FC<ArticleDiscussionsPageProps> = ({
    article,
    isAuthenticated = false,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Reuse the existing comments logic
    // In a real implementation, this might need to be adapted for a full forum-style view
    // For now, we wrap the existing CommentsSection to provide the "page" feel
    const {
        comments,
        newComment,
        setNewComment,
        handleAddComment,
        handleDeleteComment,
        isLoading
    } = useArticleComments(article.slug, (alert) => console.log(alert)); // Simple alert handler placeholder

    // Filter logic would go here if we were listing threads

    return (
        <div className="min-h-screen bg-[#1b2838] text-[#c6d4df]">
            {/* Search Header roughly matching Steam's style */}
            <div className="bg-[#171a21] pt-6 pb-0">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-[#8F98A0] hover:text-white mb-2 text-sm uppercase font-bold tracking-wider">
                        <Link href={`/articles/${article.slug}`}>
                            {article.title}
                        </Link>
                        <span>&gt;</span>
                        <span>Discussions</span>
                    </div>
                    <h1 className="text-2xl text-white font-medium mb-6 uppercase tracking-widest">
                        {article.title} Discussions
                    </h1>
                </div>

                <ArticleCommunityTabs slug={article.slug} />
            </div>


            <div className="container mx-auto px-4 py-8">
                {/* Steam-like Toolbar */}
                <div className="bg-[#2a475e] p-1 flex flex-col md:flex-row gap-2 mb-6 rounded-sm">
                    <div className="relative flex-1">
                        <Input
                            placeholder="To search localized discussions, select a language from the filter "
                            className="bg-[#1b2838] border-none text-white placeholder:text-[#67c1f5] h-9 focus-visible:ring-1 focus-visible:ring-[#67c1f5]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#67c1f5]" />
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" className="h-9 text-[#67c1f5] hover:text-white hover:bg-white/10 text-xs font-bold bg-[#1b2838]">
                            <Search className="w-4 h-4 mr-2" />
                        </Button>
                        <Button className="h-9 bg-[#66c0f4] hover:bg-[#66c0f4]/90 text-white font-bold rounded-[2px] px-6">
                            Start a New Discussion
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                    {/* Left Column: Discussions List (Using CommentsSection as placeholder/base) */}
                    <div>
                        <div className="bg-[#1b2838]/50 p-4 rounded-lg">
                            <CommentsSection
                                isAuthenticated={isAuthenticated}
                                isDarkBackground={true}
                                comments={comments} // Pass comments here
                                newComment={newComment}
                                setNewComment={setNewComment}
                                handleAddComment={handleAddComment}
                                isCurrentUserAuthor={false} // Adjust as needed
                                handleDeleteComment={handleDeleteComment}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>

                    {/* Right Column: Info/Stats */}
                    <div className="space-y-4">
                        <div className="bg-[#222b35] p-4 text-xs text-[#8f98a0]">
                            <h3 className="text-white font-medium text-sm mb-2">Discussion Rules</h3>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Be respectful and polite.</li>
                                <li>No spamming or advertising.</li>
                                <li>Keep discussions on topic.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDiscussionsPage;
