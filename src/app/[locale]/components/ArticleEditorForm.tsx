'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Image as ImageIcon, LayoutIcon, BookOpenIcon, Save, ArrowLeft, Plus, Trash2, Eye, FileText, Download, Gamepad, FolderOpen, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getSdk } from '@/lib/sdk';
import { NewArticleDTO, UpdateArticleDTO } from '@chanomhub/sdk';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface ArticleEditorFormProps {
    slug?: string;
    initialData?: any;
    mode: 'create' | 'edit';
    locale?: string;
}

interface ImageItem {
    id: string;
    url: string;
}

interface DownloadItem {
    id?: number;
    tempId: string;
    name: string;
    url: string;
    iframe: string;
    isActive: boolean;
    vipOnly: boolean;
    forVersion?: string;
    fileSize?: string;
    syncStatus: 'synced' | 'saving' | 'error' | 'new';
}

const PLATFORMS_SHORT = ["Win", "Android", "Mac", "Linux", "iOS"];

const COMMON_PROVIDERS = [
    "Google Drive", "Mega", "MediaFire", "Pixeldrain", "Workupload", "Gofile", "Steam", "itch.io", "Patreon"
];

const DOMAIN_MAPPINGS: Record<string, string> = {
    'drive.google.com': 'Google Drive',
    'mega.nz': 'Mega',
    'mediafire.com': 'MediaFire',
    'pixeldrain.com': 'Pixeldrain',
    'workupload.com': 'Workupload',
    'gofile.io': 'Gofile',
    'steamcommunity.com': 'Steam',
    'store.steampowered.com': 'Steam',
    'itch.io': 'itch.io',
    'patreon.com': 'Patreon'
};

const EditorHeader: React.FC<{
    title: string;
    mode: 'create' | 'edit';
    lastUpdated?: string | Date;
    onSave: () => void;
    saving: boolean;
    onBack: () => void;
}> = ({ title, mode, lastUpdated, onSave, saving, onBack }) => (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{mode === 'create' ? 'Create New Article' : 'Edit Article'}</h1>
                {lastUpdated && (
                    <p className="text-sm text-muted-foreground">Last saved: {new Date(lastUpdated).toLocaleString()}</p>
                )}
            </div>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving ? 'Saving...' : (
                    <>
                        <Save className="h-4 w-4 mr-2" /> {mode === 'create' ? 'Publish Article' : 'Save Changes'}
                    </>
                )}
            </Button>
        </div>
    </div>
);

const TagsInput: React.FC<{
    items?: string[];
    onAdd: (v: string) => void;
    onRemove: (v: string) => void;
    placeholder?: string;
    suggestions?: string[];
    label?: string;
}> = ({ items = [], onAdd, onRemove, placeholder, suggestions = [], label }) => {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !items.includes(s));

    return (
        <div className="space-y-2">
            {label && <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{label}</Label>}
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
                {items.length > 0 ? items.map((it) => (
                    <Badge key={it} variant="secondary" className="px-2 py-1 text-sm bg-muted text-muted-foreground border-border">
                        {it}
                        <X className="ml-1.5 h-3 w-3 cursor-pointer opacity-50 hover:text-destructive hover:opacity-100 transition-colors" onClick={() => onRemove(it)} />
                    </Badge>
                )) : (
                    <span className="text-sm text-muted-foreground italic">No items selected</span>
                )}
            </div>
            <div className="relative">
                <Input
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = input.trim();
                            if (v) {
                                onAdd(v);
                                setInput('');
                            }
                        }
                    }}
                    className="h-9"
                />
                {showSuggestions && input && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((s) => (
                            <div
                                key={s}
                                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm text-popover-foreground"
                                onClick={() => {
                                    onAdd(s);
                                    setInput('');
                                    setShowSuggestions(false);
                                }}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ImageManager: React.FC<{
    imageItems: ImageItem[];
    setImageItems: (items: ImageItem[]) => void;
    setSpecialImageId: (type: 'main' | 'background' | 'cover', id: string | null) => void;
    mainId?: string | null;
    backgroundId?: string | null;
    coverId?: string | null;
}> = ({ imageItems, setImageItems, setSpecialImageId, mainId, backgroundId, coverId }) => {
    const [imageUrlInput, setImageUrlInput] = useState('');

    const addImage = () => {
        const url = imageUrlInput.trim();
        if (!url) return;
        const id = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setImageItems([...imageItems, { id, url }]);
        setImageUrlInput('');
    };

    const removeImage = (id: string) => {
        setImageItems(imageItems.filter(i => i.id !== id));
        if (mainId === id) setSpecialImageId('main', null);
        if (backgroundId === id) setSpecialImageId('background', null);
        if (coverId === id) setSpecialImageId('cover', null);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Paste image URL..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addImage();
                        }
                    }}
                    className="h-9"
                />
                <Button type="button" onClick={addImage} variant="secondary" size="sm" className="shrink-0">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {imageItems.length > 0 && (
                <ScrollArea className="h-[240px] pr-3">
                    <div className="grid grid-cols-2 gap-3">
                        {imageItems.map((image) => (
                            <div key={image.id} className="relative group rounded-md overflow-hidden border border-border bg-muted/50 aspect-video">
                                <Image
                                    src={image.url}
                                    alt="preview"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1">
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={`h-7 w-7 rounded-full ${mainId === image.id ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                            onClick={() => setSpecialImageId('main', image.id)}
                                            title="Set as Main"
                                        >
                                            <ImageIcon className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={`h-7 w-7 rounded-full ${backgroundId === image.id ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                            onClick={() => setSpecialImageId('background', image.id)}
                                            title="Set as Background"
                                        >
                                            <LayoutIcon className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={`h-7 w-7 rounded-full ${coverId === image.id ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                            onClick={() => setSpecialImageId('cover', image.id)}
                                            title="Set as Cover"
                                        >
                                            <BookOpenIcon className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 px-2 text-xs w-full mt-1 bg-red-500/80 hover:bg-red-600"
                                        onClick={() => removeImage(image.id)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <div className="absolute bottom-1 right-1 flex flex-col gap-0.5 pointer-events-none">
                                    {mainId === image.id && <Badge variant="default" className="text-[10px] px-1 py-0 h-4">Main</Badge>}
                                    {backgroundId === image.id && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-700">BG</Badge>}
                                    {coverId === image.id && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-purple-100 text-purple-700">Cover</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}

            {imageItems.length === 0 && (
                <div className="h-24 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 text-sm">
                    No images added
                </div>
            )}
        </div>
    );
};

const DownloadManager: React.FC<{
    articleId: number | undefined;
    items: DownloadItem[];
    setItems: React.Dispatch<React.SetStateAction<DownloadItem[]>>;
}> = ({ articleId, items, setItems }) => {
    const itemsRef = React.useRef(items);
    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    useEffect(() => {
        const timeoutIds: Record<string, NodeJS.Timeout> = {};

        items.forEach(item => {
            if (item.syncStatus === 'saving') {
                if (timeoutIds[item.tempId]) clearTimeout(timeoutIds[item.tempId]);

                timeoutIds[item.tempId] = setTimeout(async () => {
                    if (!articleId) return;

                    const currentItem = itemsRef.current.find(i => i.tempId === item.tempId);
                    if (!currentItem) return;

                    try {
                        const sdk = await getSdk();

                        if (!currentItem.id) {
                            const created = await sdk.downloads.create({
                                articleId,
                                name: currentItem.name,
                                url: currentItem.url || 'https://example.com',
                                vipOnly: currentItem.vipOnly,
                                forVersion: currentItem.forVersion
                            });

                            if (created) {
                                setItems((currentItems: DownloadItem[]) =>
                                    currentItems.map(i => i.tempId === currentItem.tempId ? {
                                        ...i,
                                        id: created.id,
                                        syncStatus: 'synced' as const
                                    } : i)
                                );
                                toast.success("Download created");
                            } else {
                                console.error('SDK returned null for created download', currentItem);
                                setItems((currentItems: DownloadItem[]) =>
                                    currentItems.map(i => i.tempId === currentItem.tempId ? { ...i, syncStatus: 'error' as const } : i)
                                );
                                toast.error("Saved but server returned no ID. Please refresh.");
                            }
                        } else {
                            await sdk.downloads.update(currentItem.id, {
                                name: currentItem.name,
                                url: currentItem.url,
                                isActive: currentItem.isActive,
                                vipOnly: currentItem.vipOnly,
                                forVersion: currentItem.forVersion
                            });

                            setItems((currentItems: DownloadItem[]) =>
                                currentItems.map(i => i.tempId === currentItem.tempId ? { ...i, syncStatus: 'synced' as const } : i)
                            );
                        }
                    } catch (error) {
                        console.error('Failed to save download:', error);
                        setItems((currentItems: DownloadItem[]) =>
                            currentItems.map(i => i.tempId === currentItem.tempId ? { ...i, syncStatus: 'error' as const } : i)
                        );
                        toast.error('Failed to save download changes');
                    }
                }, 1500);
            }
        });

        return () => {
            Object.values(timeoutIds).forEach(clearTimeout);
        };
    }, [items, articleId, setItems]);

    const addDownload = () => {
        if (!articleId) {
            toast.error("Please save the article first to add downloads");
            return;
        }

        const tempId = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `dl-${Date.now()}`;
        const newItem: DownloadItem = {
            tempId,
            name: '',
            url: '',
            iframe: '',
            isActive: true,
            vipOnly: false,
            syncStatus: 'new'
        };

        setItems([...items, newItem]);
    };

    const removeDownload = async (item: DownloadItem) => {
        if (!item.id) {
            setItems(items.filter(i => i.tempId !== item.tempId));
            return;
        }

        const previousItems = [...items];
        setItems(items.filter(i => i.tempId !== item.tempId));

        try {
            const sdk = await getSdk();
            await sdk.downloads.delete(item.id);
            toast.success("Download removed");
        } catch (error) {
            console.error('Failed to delete download:', error);
            setItems(previousItems);
            toast.error("Failed to delete download");
        }
    };

    const updateDownload = (tempId: string, field: keyof DownloadItem, value: any) => {
        setItems(items.map(i => {
            if (i.tempId !== tempId) return i;

            const updates: Partial<DownloadItem> = { [field]: value, syncStatus: 'saving' };

            if (field === 'url') {
                const isNameEmptyOrPrefixOnly = !i.name || i.name === 'New Download' || /^[\[].*?[\]]\s*$/.test(i.name);

                if (isNameEmptyOrPrefixOnly) {
                    try {
                        const urlObj = new URL(value);
                        const domain = urlObj.hostname.replace('www.', '');

                        let detectedProvider = DOMAIN_MAPPINGS[domain];
                        if (!detectedProvider) {
                            for (const key in DOMAIN_MAPPINGS) {
                                if (domain.includes(key)) {
                                    detectedProvider = DOMAIN_MAPPINGS[key];
                                    break;
                                }
                            }
                        }

                        if (!detectedProvider) {
                            const parts = domain.split('.');
                            if (parts.length > 0) {
                                const name = parts[0];
                                detectedProvider = name.charAt(0).toUpperCase() + name.slice(1);
                            }
                        }

                        if (detectedProvider) {
                            const match = i.name.match(/^\[(.*?)\]/);
                            const prefix = match ? match[0] : '';
                            updates.name = `${prefix ? prefix + ' ' : ''}${detectedProvider}`;
                        }
                    } catch (e) {
                        // Invalid URL
                    }
                }
            }

            return { ...i, ...updates };
        }));
    };

    const togglePlatformPrefix = (tempId: string, platform: string) => {
        setItems(items.map(i => {
            if (i.tempId !== tempId) return i;

            let newName = i.name;
            const prefix = `[${platform}]`;

            if (newName.startsWith(prefix)) {
                newName = newName.replace(prefix, '').trim();
            } else if (newName.match(/^\[(.*?)\]/)) {
                newName = newName.replace(/^\[(.*?)\]/, prefix);
            } else {
                newName = `${prefix} ${newName}`.trim();
            }

            return { ...i, name: newName, syncStatus: 'saving' };
        }));
    };

    return (
        <div className="space-y-4">
            <datalist id="download-names">
                {COMMON_PROVIDERS.map(name => (
                    <option key={name} value={name} />
                ))}
            </datalist>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Downloads</h3>
                <Button type="button" onClick={addDownload} size="sm" variant="outline" disabled={!articleId}>
                    <Plus className="h-4 w-4 mr-2" /> Add Download
                </Button>
            </div>

            {!articleId && <p className="text-sm text-amber-500 bg-amber-50 p-2 rounded border border-amber-200">Please save the article first to manage downloads.</p>}

            {items.length === 0 && <p className="text-sm text-muted-foreground italic">No downloads added yet.</p>}

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <Card key={item.tempId} className={`border-none shadow-sm ring-1 transition-all ${item.syncStatus === 'error' ? 'ring-destructive/50 bg-destructive/10' : 'ring-border bg-card'}`}>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            {item.syncStatus === 'saving' && <div className="absolute top-2 right-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
                            {item.syncStatus === 'synced' && <div className="absolute top-2 right-2"><Check className="h-4 w-4 text-green-500" /></div>}

                            <div>
                                <Label>Name & Platform</Label>
                                <div className="flex flex-wrap gap-1 mb-2 mt-1">
                                    {PLATFORMS_SHORT.map(p => (
                                        <Badge
                                            key={p}
                                            variant="outline"
                                            className={`cursor-pointer select-none ${item.name.startsWith(`[${p}]`) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'}`}
                                            onClick={() => togglePlatformPrefix(item.tempId, p)}
                                        >
                                            {p}
                                        </Badge>
                                    ))}
                                </div>
                                <Input
                                    value={item.name}
                                    onChange={(e) => updateDownload(item.tempId, 'name', e.target.value)}
                                    className="mt-1"
                                    list="download-names"
                                    placeholder="e.g. [Win] Google Drive"
                                />
                            </div>
                            <div>
                                <Label>URL</Label>
                                <Input value={item.url} onChange={(e) => updateDownload(item.tempId, 'url', e.target.value)} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Embed / Iframe Code</Label>
                                <Input disabled value={item.iframe} placeholder="Iframe not editable directly" className="mt-1 bg-muted/50" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch checked={item.isActive} onCheckedChange={(c) => updateDownload(item.tempId, 'isActive', c)} id={`active-${idx}`} />
                                    <Label htmlFor={`active-${idx}`}>Active</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch checked={item.vipOnly} onCheckedChange={(c) => updateDownload(item.tempId, 'vipOnly', c)} id={`vip-${idx}`} />
                                    <Label htmlFor={`vip-${idx}`}>VIP Only</Label>
                                </div>
                            </div>
                            <div className="flex justify-end md:col-span-2">
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeDownload(item)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const ArticleEditorForm = ({ slug = '', initialData, mode, locale = 'en' }: ArticleEditorFormProps) => {
    const router = useRouter();

    const [formData, setFormData] = useState<any>({
        id: (initialData as any)?.id || null,
        title: initialData?.title || '',
        slug: mode === 'edit' ? slug : '',
        description: initialData?.description || '',
        body: initialData?.body || '',
        creator: initialData?.creator || '',
        status: initialData?.status || 'DRAFT',
        favorited: false,
        favoritesCount: initialData && 'favoritesCount' in initialData ? initialData.favoritesCount : 0,
        mainImage: initialData?.mainImage || null,
        backgroundImage: initialData?.backgroundImage || null,
        coverImage: initialData?.coverImage || null,
        ver: initialData?.ver || '',
        version: 1,
        engine: initialData?.engine || null,
        sequentialCode: '',
        tags: initialData?.tags || [],
        categories: initialData?.categories || [],
        platforms: initialData?.platforms || [],

        mainImageId: null,
        backgroundImageId: null,
        coverImageId: null
    });

    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
    const [availableEngines, setAvailableEngines] = useState<{ id: number; name: string }[]>([]);

    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const sdk = await getSdk();

                const [tags, categories, platforms] = await Promise.all([
                    sdk.articles.getTags(),
                    sdk.articles.getCategories(),
                    sdk.articles.getPlatforms()
                ]);

                if (tags) setAvailableTags(tags);
                if (categories) setAvailableCategories(categories);
                if (platforms) setAvailablePlatforms(platforms);

                if (mode === 'edit' && slug) {
                    let articleData = null;
                    let downloadsData: any[] = [];

                    const article = await sdk.articles.getBySlug(slug);

                    if (article) {
                        articleData = article;

                        try {
                            const downloads = await sdk.downloads.getByArticle(Number(article.id));
                            if (Array.isArray(downloads)) {
                                downloadsData = downloads;
                            }
                        } catch (e) {
                            console.warn("Failed to load downloads", e);
                            downloadsData = [];
                        }

                        const rawImages = article.images || [];
                        const imageUrls = Array.isArray(rawImages)
                            ? rawImages.map((img: any) => typeof img === 'string' ? img : img.url)
                            : [];

                        const items: ImageItem[] = imageUrls.map((url: string) => ({
                            id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                            url
                        }));
                        setImageItems(items);

                        let engineName = null;
                        if (article.engine && typeof article.engine === 'object') {
                            engineName = article.engine.name;
                        } else if (typeof article.engine === 'string') {
                            engineName = article.engine;
                        }

                        const dls = downloadsData.map((d: any) => ({
                            id: d.id,
                            tempId: `dl-${d.id}`,
                            name: d.name,
                            url: d.url,
                            iframe: d.iframe || '',
                            isActive: d.isActive ?? true,
                            vipOnly: d.vipOnly ?? false,
                            fileSize: d.fileSize,
                            syncStatus: 'synced' as const
                        }));
                        setDownloadItems(dls);

                        setFormData({
                            ...article,
                            id: Number(article.id),
                            tags: article.tags?.map((t: any) => t.name || t) || [],
                            categories: article.categories?.map((c: any) => c.name || c) || [],
                            platforms: article.platforms?.map((p: any) => p.name || p) || [],
                            creator: article.creators && article.creators.length > 0 ? article.creators[0].name : '',
                            engine: engineName,

                            mainImageId: article.mainImage ? items.find(i => i.url === article.mainImage)?.id : null,
                            backgroundImageId: article.backgroundImage ? items.find(i => i.url === article.backgroundImage)?.id : null,
                            coverImageId: article.coverImage ? items.find(i => i.url === article.coverImage)?.id : null
                        });
                    }
                }
            } catch (err) {
                console.error("Init Error", err);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [mode, slug, initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'title') {
            setFormData((prev: any) => ({
                ...prev,
                [name]: value,
                slug: mode === 'create' ? value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : prev.slug,
            }));
        } else if (name === 'version') {
            const numValue = parseInt(value);
            if (!isNaN(numValue) && numValue >= 1) {
                setFormData((prev: any) => ({ ...prev, [name]: numValue }));
            }
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev: any) => ({ ...prev, status: value }));
    };

    const handleFavoritedChange = (checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, favorited: checked }));
    };

    const handleEngineChange = (value: string) => {
        setFormData((prev: any) => ({ ...prev, engine: value }));
    };

    const addItem = (type: 'tags' | 'categories' | 'platforms', input: string) => {
        const v = input.trim();
        if (!v) return;
        setFormData((prev: any) => {
            const list = prev[type] || [];
            if (!list.includes(v)) return { ...prev, [type]: [...list, v] };
            return prev;
        });
    };

    const removeItem = (type: 'tags' | 'categories' | 'platforms', item: string) => {
        setFormData((prev: any) => ({ ...prev, [type]: (prev[type] || []).filter((i: string) => i !== item) }));
    };

    const setSpecialImageId = (type: 'main' | 'background' | 'cover', id: string | null) => {
        if (type === 'main') setFormData((prev: any) => ({ ...prev, mainImageId: id }));
        if (type === 'background') setFormData((prev: any) => ({ ...prev, backgroundImageId: id }));
        if (type === 'cover') setFormData((prev: any) => ({ ...prev, coverImageId: id }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.body || !formData.creator) {
            setError('Please fill in all required fields.');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const sdk = await getSdk();

            const payload: any = {
                title: formData.title,
                description: formData.description,
                body: formData.body,
                creator: formData.creator,
                ver: formData.ver,
                engine: formData.engine,
                tags: formData.tags,
                categories: formData.categories,
                platforms: formData.platforms,
                language: 'en',

                mainImage: formData.mainImageId ? imageItems.find(i => i.id === formData.mainImageId)?.url : (formData.mainImage?.url || formData.mainImage),
                backgroundImage: formData.backgroundImageId ? imageItems.find(i => i.id === formData.backgroundImageId)?.url : (formData.backgroundImage?.url || formData.backgroundImage),
                coverImage: formData.coverImageId ? imageItems.find(i => i.id === formData.coverImageId)?.url : (formData.coverImage?.url || formData.coverImage),
                otherImages: imageItems.map(i => i.url),
            };

            if (mode === 'create') {
                const res = await sdk.articles.create(payload as NewArticleDTO);
                setSuccessMessage('Article created successfully!');
                router.push(`/articles/${res.slug}`);
            } else {
                await sdk.articles.update(slug, payload as UpdateArticleDTO);
                setSuccessMessage('Article updated successfully!');
                router.push(`/articles/${slug}`);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium">Loading Editor...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-40 px-6 pt-6 pb-2 shadow-sm">
                <EditorHeader
                    title={formData.title}
                    mode={mode}
                    lastUpdated={formData.updatedAt}
                    onSave={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
                    saving={saving}
                    onBack={() => router.back()}
                />
            </div>

            <main className="container mx-auto max-w-[1600px] px-6 py-8">
                {successMessage && (
                    <Alert variant="default" className="mb-6 bg-green-50 text-green-800 border-green-200">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">

                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

                        <Card className="border border-border shadow-sm">
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Article Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter a descriptive title"
                                        className="text-lg font-semibold h-12 px-4 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Slug (URL)</Label>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md border border-input">
                                        <span className="shrink-0">/articles/</span>
                                        <input
                                            id="slug"
                                            name="slug"
                                            value={formData.slug || ''}
                                            onChange={handleInputChange}
                                            disabled={mode === 'create'}
                                            className="bg-transparent border-none w-full focus:ring-0 p-0 text-foreground font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Short Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={handleInputChange}
                                        placeholder="Brief overview of the game or content..."
                                        rows={3}
                                        className="resize-none border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border shadow-sm h-full">
                            <div className="border-b border-border px-6 py-4 flex items-center gap-2 bg-muted/20">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold text-foreground">Content Body</h3>
                            </div>
                            <CardContent className="p-0 min-h-[500px]">
                                <RichTextEditor
                                    content={formData.body || ''}
                                    onUpdate={(html) => setFormData((prev: any) => ({ ...prev, body: html }))}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border border-border shadow-sm">
                            <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-muted/40">
                                <div className="flex items-center gap-2">
                                    <Download className="h-5 w-5 text-blue-500" />
                                    <h3 className="font-semibold text-foreground">Downloads</h3>
                                </div>
                                <Badge variant="outline" className="bg-background border-border">{downloadItems.length} items</Badge>
                            </div>
                            <CardContent className="p-6">
                                <DownloadManager articleId={formData.id ? Number(formData.id) : undefined} items={downloadItems} setItems={setDownloadItems} />
                            </CardContent>
                        </Card>

                    </div>

                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

                        <Card className="border border-border shadow-sm">
                            <div className="border-b border-border px-4 py-3 bg-muted/40">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Publishing</h3>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Status</Label>
                                    <Select value={formData.status} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="w-full">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2.5 w-2.5 rounded-full ${formData.status === 'PUBLISHED' ? 'bg-green-500' :
                                                    formData.status === 'DRAFT' ? 'bg-gray-400' : 'bg-orange-400'
                                                    }`} />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                                            <SelectItem value="PUBLISHED">Published</SelectItem>
                                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between border-t pt-4">
                                    <Label htmlFor="favorited" className="text-sm text-gray-600">Featured / Favorite</Label>
                                    <Switch id="favorited" checked={formData.favorited || false} onCheckedChange={handleFavoritedChange} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border shadow-sm">
                            <div className="border-b border-border px-4 py-3 bg-muted/40 flex items-center gap-2">
                                <Gamepad className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Game Info</h3>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Creator / Studio</Label>
                                    <Input
                                        value={formData.creator || ''}
                                        onChange={handleInputChange}
                                        name="creator"
                                        placeholder="Developer Name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Version</Label>
                                        <Input
                                            value={formData.ver || ''}
                                            onChange={handleInputChange}
                                            name="ver"
                                            placeholder="v1.0"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Seq. Code</Label>
                                        <Input
                                            value={formData.sequentialCode || ''}
                                            onChange={handleInputChange}
                                            name="sequentialCode"
                                            placeholder="HJ-001"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Game Engine</Label>
                                    <Select value={formData.engine || ''} onValueChange={handleEngineChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableEngines.map((eng) => (
                                                <SelectItem key={eng.id} value={eng.name}>{eng.name}</SelectItem>
                                            ))}

                                            {availableEngines.length === 0 && (
                                                <>
                                                    <SelectItem value="Ren'Py">Ren&#39;Py</SelectItem>
                                                    <SelectItem value="RPG Maker">RPG Maker</SelectItem>
                                                    <SelectItem value="Unity">Unity</SelectItem>
                                                    <SelectItem value="Unreal Engine">Unreal Engine</SelectItem>
                                                    <SelectItem value="Godot">Godot</SelectItem>
                                                    <SelectItem value="RENPY">Ren&#39;Py (Legacy)</SelectItem>
                                                    <SelectItem value="RPGM">RPG Maker (Legacy)</SelectItem>
                                                </>
                                            )}

                                            {formData.engine &&
                                                !availableEngines.some(e => e.name === formData.engine) &&
                                                !['Ren\'Py', 'RPG Maker', 'Unity', 'Unreal Engine', 'Godot', 'RENPY', 'RPGM'].includes(formData.engine) && (
                                                    <SelectItem value={formData.engine}>{formData.engine}</SelectItem>
                                                )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border shadow-sm">
                            <div className="border-b border-border px-4 py-3 bg-muted/40 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Media Gallery</h3>
                            </div>
                            <CardContent className="p-4">
                                <ImageManager
                                    imageItems={imageItems}
                                    setImageItems={setImageItems}
                                    setSpecialImageId={setSpecialImageId}
                                    mainId={formData.mainImageId}
                                    backgroundId={formData.backgroundImageId}
                                    coverId={formData.coverImageId}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border border-border shadow-sm">
                            <div className="border-b border-border px-4 py-3 bg-muted/40 flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Classification</h3>
                            </div>
                            <CardContent className="p-4 space-y-6">
                                <TagsInput
                                    label="Tags"
                                    items={formData.tags || []}
                                    onAdd={(v) => addItem('tags', v)}
                                    onRemove={(v) => removeItem('tags', v)}
                                    placeholder="+ Tag"
                                    suggestions={availableTags}
                                />
                                <TagsInput
                                    label="Categories"
                                    items={formData.categories || []}
                                    onAdd={(v) => addItem('categories', v)}
                                    onRemove={(v) => removeItem('categories', v)}
                                    placeholder="+ Category"
                                    suggestions={availableCategories}
                                />
                                <TagsInput
                                    label="Platforms"
                                    items={formData.platforms || []}
                                    onAdd={(v) => addItem('platforms', v)}
                                    onRemove={(v) => removeItem('platforms', v)}
                                    placeholder="+ Platform"
                                    suggestions={availablePlatforms}
                                />
                            </CardContent>
                        </Card>

                    </div>
                </form>
            </main>
        </div>
    );
};