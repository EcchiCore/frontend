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
      </div>
    </article>
  );
}