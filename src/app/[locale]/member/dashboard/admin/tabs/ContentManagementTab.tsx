import React, { useEffect, useState, useCallback } from 'react';
import { getSdk } from '@/lib/sdk';
import { ArticleListItem, ArticleListOptions } from '@chanomhub/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Megaphone } from 'lucide-react';

export function ContentManagementTab() {
    const [articles, setArticles] = useState<ArticleListItem[]>([]);
    const [sponsoredIds, setSponsoredIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const sdk = await getSdk();

            const [sponsoredRes, articlesRes] = await Promise.all([
                sdk.sponsoredArticles.getAll({ all: true }).catch(() => []),
                sdk.articles.getAllPaginated({
                    limit,
                    offset: (page - 1) * limit,
                    status: undefined // Get all statuses
                })
            ]);

            setSponsoredIds(new Set(sponsoredRes.map(s => s.articleId)));
            setArticles(articlesRes.items);
            setTotal(articlesRes.total);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load articles');
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage articles and content on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 p-4">{error}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.map((article) => {
                                const isSponsored = sponsoredIds.has(article.id);

                                return (
                                    <TableRow key={article.slug}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{article.title}</span>
                                                {isSponsored && (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 flex items-center px-1.5 h-5 text-[10px]">
                                                        <Megaphone className="h-3 w-3" />
                                                        SPONSORED
                                                    </Badge>
                                                )}
                                            </div>
                                            {article.sequentialCode && (
                                                <div className="text-[10px] text-muted-foreground font-mono">{article.sequentialCode}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>{typeof article.author === 'string' ? article.author : article.author?.name || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                {article.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => window.open(`/articles/${article.slug}`, '_blank')}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
