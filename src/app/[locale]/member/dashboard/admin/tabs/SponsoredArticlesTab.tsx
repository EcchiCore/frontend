'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getSdk } from '@/lib/sdk';
import type { SponsoredArticle, CreateSponsoredArticleDTO, UpdateSponsoredArticleDTO } from '@chanomhub/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, ExternalLink, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

export function SponsoredArticlesTab() {
    const [items, setItems] = useState<SponsoredArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create dialog state
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState<CreateSponsoredArticleDTO>({
        articleId: 0,
        isActive: true,
        priority: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        coverImage: null,
    });

    // Edit dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editTarget, setEditTarget] = useState<SponsoredArticle | null>(null);
    const [editForm, setEditForm] = useState<UpdateSponsoredArticleDTO>({});

    // Delete state
    const [deleting, setDeleting] = useState<number | null>(null);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const sdk = await getSdk();
            const data = await sdk.sponsoredArticles.getAll();
            setItems(data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load sponsored articles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleCreate = async () => {
        if (!createForm.articleId) {
            toast.error('กรุณาระบุ Article ID');
            return;
        }
        try {
            setCreating(true);
            const sdk = await getSdk();
            await sdk.sponsoredArticles.create(createForm);
            toast.success('สร้าง Sponsored Article สำเร็จ');
            setCreateOpen(false);
            setCreateForm({
                articleId: 0,
                isActive: true,
                priority: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: null,
                coverImage: null,
            });
            fetchItems();
        } catch (err: any) {
            toast.error(err?.message || 'เกิดข้อผิดพลาดในการสร้าง');
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        try {
            setEditing(true);
            const sdk = await getSdk();
            await sdk.sponsoredArticles.update(editTarget.id, editForm);
            toast.success('อัพเดท Sponsored Article สำเร็จ');
            setEditOpen(false);
            setEditTarget(null);
            fetchItems();
        } catch (err: any) {
            toast.error(err?.message || 'เกิดข้อผิดพลาดในการอัพเดท');
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('คุณต้องการลบ Sponsored Article นี้หรือไม่?')) return;
        try {
            setDeleting(id);
            const sdk = await getSdk();
            await sdk.sponsoredArticles.delete(id);
            toast.success('ลบ Sponsored Article สำเร็จ');
            fetchItems();
        } catch (err: any) {
            toast.error(err?.message || 'เกิดข้อผิดพลาดในการลบ');
        } finally {
            setDeleting(null);
        }
    };

    const openEditDialog = (item: SponsoredArticle) => {
        setEditTarget(item);
        setEditForm({
            coverImage: item.coverImage,
            isActive: item.isActive,
            priority: item.priority,
            startDate: item.startDate?.split('T')[0],
            endDate: item.endDate?.split('T')[0] || undefined,
        });
        setEditOpen(true);
    };

    const handleToggleActive = async (item: SponsoredArticle) => {
        try {
            const sdk = await getSdk();
            await sdk.sponsoredArticles.update(item.id, { isActive: !item.isActive });
            toast.success(`${!item.isActive ? 'เปิด' : 'ปิด'}ใช้งาน Sponsored Article`);
            fetchItems();
        } catch (err: any) {
            toast.error(err?.message || 'เกิดข้อผิดพลาด');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-amber-500" />
                            Sponsored Articles
                        </CardTitle>
                        <CardDescription>จัดการบทความ Sponsored ที่แสดงบนหน้าแรก</CardDescription>
                    </div>

                    {/* Create Button */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                เพิ่มใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>สร้าง Sponsored Article</DialogTitle>
                                <DialogDescription>เลือกบทความที่ต้องการ Sponsor แล้วตั้งค่า</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="articleId">Article ID *</Label>
                                    <Input
                                        id="articleId"
                                        type="number"
                                        placeholder="ระบุ Article ID"
                                        value={createForm.articleId || ''}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, articleId: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        placeholder="0"
                                        value={createForm.priority ?? 0}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                                    />
                                    <p className="text-xs text-muted-foreground">ยิ่งตัวเลขสูง ยิ่งแสดงก่อน</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coverImage">Cover Image URL (ไม่บังคับ)</Label>
                                    <Input
                                        id="coverImage"
                                        type="text"
                                        placeholder="https://..."
                                        value={createForm.coverImage || ''}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, coverImage: e.target.value || null }))}
                                    />
                                    <p className="text-xs text-muted-foreground">ถ้าไม่ระบุจะใช้ cover image ของบทความ</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">วันเริ่มต้น</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={createForm.startDate || ''}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">วันสิ้นสุด (ไม่บังคับ)</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={(createForm.endDate as string) || ''}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value || null }))}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={createForm.isActive ?? true}
                                        onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isActive: checked }))}
                                    />
                                    <Label htmlFor="isActive">เปิดใช้งานทันที</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateOpen(false)}>ยกเลิก</Button>
                                <Button onClick={handleCreate} disabled={creating}>
                                    {creating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                    สร้าง
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center p-8 space-y-2">
                        <p className="text-red-500">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchItems}>ลองใหม่</Button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center p-12 space-y-2">
                        <Megaphone className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">ยังไม่มี Sponsored Article</p>
                        <p className="text-xs text-muted-foreground">คลิก "เพิ่มใหม่" เพื่อเริ่มต้น</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Article</TableHead>
                                <TableHead className="w-20 text-center">Priority</TableHead>
                                <TableHead className="w-24 text-center">สถานะ</TableHead>
                                <TableHead className="w-28">เริ่มต้น</TableHead>
                                <TableHead className="w-28">สิ้นสุด</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium line-clamp-1">{item.article?.title || `Article #${item.articleId}`}</div>
                                        <div className="text-xs text-muted-foreground">ID: {item.articleId}</div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono">{item.priority}</TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={item.isActive}
                                            onCheckedChange={() => handleToggleActive(item)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {item.startDate ? new Date(item.startDate).toLocaleDateString('th-TH') : '-'}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {item.endDate ? new Date(item.endDate).toLocaleDateString('th-TH') : 'ไม่กำหนด'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.open(`/articles/${item.article?.slug}?id=${item.articleId}`, '_blank')}
                                            title="ดูบทความ"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(item)}
                                            title="แก้ไข"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deleting === item.id}
                                            title="ลบ"
                                        >
                                            {deleting === item.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>แก้ไข Sponsored Article</DialogTitle>
                        <DialogDescription>
                            {editTarget?.article?.title || `Article #${editTarget?.articleId}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-priority">Priority</Label>
                            <Input
                                id="edit-priority"
                                type="number"
                                value={editForm.priority ?? 0}
                                onChange={(e) => setEditForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-coverImage">Cover Image URL</Label>
                            <Input
                                id="edit-coverImage"
                                type="text"
                                placeholder="https://..."
                                value={editForm.coverImage || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, coverImage: e.target.value || null }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-startDate">วันเริ่มต้น</Label>
                                <Input
                                    id="edit-startDate"
                                    type="date"
                                    value={editForm.startDate || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-endDate">วันสิ้นสุด</Label>
                                <Input
                                    id="edit-endDate"
                                    type="date"
                                    value={(editForm.endDate as string) || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value || null }))}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-isActive"
                                checked={editForm.isActive ?? true}
                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="edit-isActive">เปิดใช้งาน</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleEdit} disabled={editing}>
                            {editing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            บันทึก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
