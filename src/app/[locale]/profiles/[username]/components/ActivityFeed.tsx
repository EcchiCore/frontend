import Image from 'next/image';
import Link from 'next/link';
import { resolveArticleImageUrl, shouldSkipNextImageOptimization } from '@/lib/articleImageUrl';
import imageLoader from '@/lib/imageLoader';

interface Article {
    slug: string;
    title: string;
    mainImage: string | null;
    coverImage: string | null;
    createdAt: string;
    favoritesCount: number;
}

interface ActivityFeedProps {
    articles: Article[];
    username: string;
}

export default function ActivityFeed({ articles, username }: ActivityFeedProps) {
    if (!articles || articles.length === 0) {
        return (
            <section className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="card bg-base-100/10 backdrop-blur-md border border-white/10 p-8 text-center">
                    <p className="text-white/60">No posts yet</p>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-8 w-full max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.slice(0, 6).map((article) => (
                    <Link
                        key={article.slug}
                        href={`/articles/${article.slug}`}
                        className="group"
                    >
                        <div className="card bg-base-100/10 backdrop-blur-md border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                            <figure className="relative aspect-video bg-base-300/20">
                                {article.mainImage || article.coverImage ? (
                                    <Image
                                        loader={imageLoader}
                                        src={resolveArticleImageUrl(article.coverImage || article.mainImage) || ''}
                                        alt={article.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg
                                            className="w-12 h-12 text-white/20"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </figure>
                            <div className="card-body p-4">
                                <h3 className="card-title text-sm text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                                    {article.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-white/50 mt-2">
                                    <span>
                                        {new Date(article.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {article.favoritesCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
