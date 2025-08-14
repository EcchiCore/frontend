// ===============================
// app/games/components/GameCard.tsx
// ===============================
import type { Article } from "@/lib/api";

export default function GameCard({ article }: { article: Article }) {
  return (
    <article className="rounded-2xl border overflow-hidden hover:shadow-sm transition">
      {article.mainImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.mainImage} alt={article.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-muted/30" />
      )}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold line-clamp-2">{article.title}</h3>
        {article.description && (
          <p className="text-sm opacity-80 line-clamp-2">{article.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {article.tagList.map((tag) => (
            <span key={tag} className="text-xs bg-muted/50 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs opacity-70 mt-1">
          <span>โดย {article.author.username}</span>
          <span>{article.platformList.join(', ')}</span>
          <span>❤️ {article.favoritesCount}</span>
        </div>
      </div>
    </article>
  );
}