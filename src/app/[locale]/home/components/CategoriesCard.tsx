// components/CategoriesCard.tsx
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ข้อมูลหมวดหมู่พร้อม URL slug
const categories = [
  { 
    name: "windows", 
    icon: "📰", 
    count: 5420,
    slug: "news"
  },
  { 
    name: "android", 
    icon: "🎬", 
    count: 3890,
    slug: "entertainment"
  },
  { 
    name: "linux", 
    icon: "⚽", 
    count: 2340,
    slug: "sports"
  },
  { 
    name: "macos", 
    icon: "💻", 
    count: 4560,
    slug: "technology"
  }
];

export default function CategoriesCard() {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2 text-foreground">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <div className="w-4 h-4 bg-primary rounded-sm"></div>
          </div>
          <span>หมวดหมู่ยอดนิยม</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map((category, index) => (
          <Link 
            key={index}
            href={`/platforms/${category.slug}`}
            className="block"
          >
            <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm border border-transparent hover:border-primary/20 group">
              <div className="flex items-center space-x-3">
                <div className="text-xl group-hover:scale-110 transition-transform duration-200">
                  {category.icon}
                </div>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {category.count.toLocaleString()}
                </Badge>
                <svg 
                  className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
