import type { Article } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, User } from 'lucide-react';

export default function GameCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
        <CardHeader className="p-0">
          {article.mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={article.mainImage} 
              alt={article.title} 
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200" 
            />
          ) : (
            <div className="w-full h-40 bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          
          {article.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.description}
            </p>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {article.tagList.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {article.tagList.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.tagList.length - 3}
              </Badge>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-xs">
                  {article.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>โดย {article.author.username}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>{article.platformList.join(', ')}</span>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{article.favoritesCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}