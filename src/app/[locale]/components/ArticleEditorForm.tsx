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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Upload, Image as ImageIcon, LayoutIcon, BookOpenIcon, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { getSdk } from '@/lib/sdk';
import { NewArticleDTO, UpdateArticleDTO } from '@chanomhub/sdk';

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
    fileSize?: string;
}

interface ModItem {
    name: string;
    description: string;
    downloadLink: string;
    version: string;
    status: string;
    creditTo: string;
}

export interface ArticleEditorFormProps {
    slug?: string;
    initialData?: NewArticleDTO | UpdateArticleDTO;
    mode: 'create' | 'edit';
    locale?: string;
}

/* ---------------------- Inner Components ---------------------- */

const TagsInput: React.FC<{
    items?: string[];
    onAdd: (v: string) => void;
    onRemove: (v: string) => void;
    placeholder?: string;
    suggestions?: string[];
}> = ({ items = [], onAdd, onRemove, placeholder, suggestions = [] }) => {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !items.includes(s));

    return (
        <div className="relative">
            <div className="mt-2 flex flex-wrap gap-2">
                {items.map((it) => (
                    <Badge key={it} variant="secondary" className="group relative">
                        {it}
                        <X className="ml-1 h-3 w-3 cursor-pointer opacity-50 group-hover:opacity-100" onClick={() => onRemove(it)} />
                    </Badge>
                ))}
            </div>
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
                className="mt-2"
            />
            {showSuggestions && input && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((s) => (
                        <div
                            key={s}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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
        <div>
            <div className="mt-1 flex gap-2">
                <Input
                    placeholder="Enter image URL"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addImage();
                        }
                    }}
                />
                <Button type="button" onClick={addImage} variant="outline" className="shrink-0">
                    <Upload className="h-4 w-4 mr-2" /> Add
                </Button>
            </div>

            {imageItems.length > 0 && (
                <ScrollArea className="h-[300px] mt-4 pr-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imageItems.map((image) => (
                            <div key={image.id} className="relative group">
                                <div className="relative h-32 w-full rounded-lg overflow-hidden">
                                    <Image
                                        src={image.url}
                                        alt={image.url}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className={`text-white ${mainId === image.id ? 'ring-2 ring-white' : ''}`}
                                        onClick={() => setSpecialImageId('main', image.id)}
                                        title="Set as main"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className={`text-white ${backgroundId === image.id ? 'ring-2 ring-white' : ''}`}
                                        onClick={() => setSpecialImageId('background', image.id)}
                                        title="Set as background"
                                    >
                                        <LayoutIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className={`text-white ${coverId === image.id ? 'ring-2 ring-white' : ''}`}
                                        onClick={() => setSpecialImageId('cover', image.id)}
                                        title="Set as cover"
                                    >
                                        <BookOpenIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-white"
                                        onClick={() => removeImage(image.id)}
                                        title="Remove"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
};

const DownloadManager: React.FC<{
    items: DownloadItem[];
    setItems: (val: DownloadItem[]) => void;
}> = ({ items, setItems }) => {
    const addDownload = () => {
        const newItem: DownloadItem = {
            tempId: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `dl-${Date.now()}`,
            name: 'New Download',
            url: '',
            iframe: '',
            isActive: true,
            vipOnly: false
        };
        setItems([...items, newItem]);
    };

    const removeDownload = (tempId: string) => {
        setItems(items.filter(i => i.tempId !== tempId));
    };

    const updateDownload = (tempId: string, field: keyof DownloadItem, value: any) => {
        setItems(items.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Downloads</h3>
                <Button type="button" onClick={addDownload} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Download
                </Button>
            </div>

            {items.length === 0 && <p className="text-sm text-gray-500 italic">No downloads added yet.</p>}

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <Card key={item.tempId}>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Name</Label>
                                <Input value={item.name} onChange={(e) => updateDownload(item.tempId, 'name', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>URL</Label>
                                <Input value={item.url} onChange={(e) => updateDownload(item.tempId, 'url', e.target.value)} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Embed / Iframe Code</Label>
                                <Input value={item.iframe} onChange={(e) => updateDownload(item.tempId, 'iframe', e.target.value)} placeholder="<iframe ...>" className="mt-1" />
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
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeDownload(item.tempId)}>
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

const ModsManager: React.FC<{
    items: ModItem[];
    setItems: (val: ModItem[]) => void;
}> = ({ items, setItems }) => {
    const addMod = () => {
        // Assuming simple structure for now
        const newMod: ModItem = {
            name: '',
            description: '',
            downloadLink: '',
            version: '',
            status: 'active',
            creditTo: ''
        };
        setItems([...items, newMod]);
    };

    const removeMod = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateMod = (index: number, field: keyof ModItem, value: any) => {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Mods</h3>
                <Button type="button" onClick={addMod} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Add Mod
                </Button>
            </div>

            {items.length === 0 && <p className="text-sm text-gray-500 italic">No mods added yet.</p>}

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Mod Name</Label>
                                <Input value={item.name} onChange={(e) => updateMod(idx, 'name', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>Version</Label>
                                <Input value={item.version} onChange={(e) => updateMod(idx, 'version', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>Credit To</Label>
                                <Input value={item.creditTo} onChange={(e) => updateMod(idx, 'creditTo', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>Download Link</Label>
                                <Input value={item.downloadLink} onChange={(e) => updateMod(idx, 'downloadLink', e.target.value)} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea value={item.description} onChange={(e) => updateMod(idx, 'description', e.target.value)} rows={2} className="mt-1" />
                            </div>
                            <div className="flex justify-end md:col-span-2">
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeMod(idx)}>
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


/* ---------------------- Main Component ---------------------- */

export const ArticleEditorForm: React.FC<ArticleEditorFormProps> = ({ slug = '', initialData, mode, locale = 'en' }) => {
    const router = useRouter();

    // Use a local state that mostly matches UpdateArticleDTO/NewArticleDTO but handles form-specific needs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({
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

        // Internal state for selected IDs
        mainImageId: null,
        backgroundImageId: null,
        coverImageId: null
    });

    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
    const [availableEngines, setAvailableEngines] = useState<{ id: number; name: string }[]>([]);

    const [imageItems, setImageItems] = useState<ImageItem[]>([]);

    // New State for Downloads and Mods
    const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
    const [modItems, setModItems] = useState<ModItem[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const sdk = await getSdk();

                // 1. Load options via GraphQL directly
                // Note: Based on error messages, tags/categories/platforms return [String!]!, not objects.
                // Engines query seems unavailable on root, so we rely on fallback.
                const query = `
          query GetDirectOptions {
            tags
            categories
            platforms
          }
        `;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const optionsData: any = await sdk.graphql(query);

                if (optionsData?.tags) setAvailableTags(optionsData.tags);
                if (optionsData?.categories) setAvailableCategories(optionsData.categories);
                if (optionsData?.platforms) setAvailablePlatforms(optionsData.platforms);

                // Engines fallback since it's not queryable directly
                // if (optionsData?.engines) setAvailableEngines(optionsData.engines.map((e: any) => ({ id: e.id, name: e.name })));

                // 2. If 'edit' mode, ensure we have full data
                if (mode === 'edit' && slug) {
                    let articleData = null;
                    let downloadsData: any[] = [];
                    let modsData: any[] = [];

                    try {
                        // Prefer getWithDownloads as it seems to return full relational data (tags, creators, etc.)
                        // which getBySlug might miss depending on backend implementation.
                        // Pass locale to ensure strict localized data is returned
                        const withDl = await sdk.articles.getWithDownloads(slug, locale);
                        if (withDl.article) {
                            articleData = withDl.article;
                        }
                        if (withDl.downloads) {
                            downloadsData = withDl.downloads;
                        }
                    } catch (err) {
                        console.warn("getWithDownloads failed, falling back to getBySlug", err);
                        // Fallback
                        const res = await sdk.articles.getBySlug(slug);
                        if (res) articleData = res;
                    }

                    if (articleData) {
                        const article = articleData;

                        // Prepare images
                        const rawImages = article.images || [];
                        const imageUrls = rawImages.map((img: any) => typeof img === 'string' ? img : img.url);

                        const items: ImageItem[] = imageUrls.map((url: string) => ({
                            id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                            url
                        }));
                        setImageItems(items);

                        // Extract engine name
                        let engineName = null;
                        if (article.engine && typeof article.engine === 'object') {
                            engineName = article.engine.name;
                        } else if (typeof article.engine === 'string') {
                            engineName = article.engine;
                        }

                        // Prepare downloads
                        const dls = downloadsData.map((d: any) => ({
                            id: d.id,
                            tempId: `dl-${d.id}`,
                            name: d.name,
                            url: d.url,
                            iframe: d.iframe || '',
                            isActive: d.isActive,
                            vipOnly: d.vipOnly,
                            fileSize: d.fileSize
                        }));
                        setDownloadItems(dls);

                        // Prepare mods
                        if (article.mods) {
                            setModItems(article.mods);
                        }

                        setFormData({
                            ...article,
                            // Map NamedEntity[] to string[] for the form
                            tags: article.tags?.map((t: any) => t.name || t) || [],
                            categories: article.categories?.map((c: any) => c.name || c) || [],
                            platforms: article.platforms?.map((p: any) => p.name || p) || [],
                            // Map creators array to single creator string (assuming first one)
                            creator: article.creators && article.creators.length > 0 ? article.creators[0].name : '',
                            engine: engineName,

                            // Resolve Special Images
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
                status: formData.status,
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

                // Add downloads and mods to payload - SDK types might ignore this but backend may accept it if adjusted
                downloads: downloadItems.map(d => ({
                    id: d.id, // Include ID if updating
                    name: d.name,
                    url: d.url,
                    iframe: d.iframe,
                    isActive: d.isActive,
                    vipOnly: d.vipOnly
                })),
                mods: modItems
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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{mode === 'create' ? 'Create Article' : 'Edit Article'}</h1>
                {formData.updatedAt && (
                    <p className="text-sm text-gray-500">Last updated: {new Date(formData.updatedAt).toLocaleString()}</p>
                )}
            </div>

            {successMessage && (
                <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
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

            <Card className="shadow-lg">
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="basic" className="relative">
                            <div className="sticky top-0 z-10 bg-white border-b overflow-x-auto">
                                <TabsList className="w-full justify-start px-6 min-w-max">
                                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                    <TabsTrigger value="content">Content</TabsTrigger>
                                    <TabsTrigger value="media">Media & Metadata</TabsTrigger>
                                    <TabsTrigger value="downloads">Downloads</TabsTrigger>
                                    <TabsTrigger value="mods">Mods</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-6">
                                <TabsContent value="basic">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></Label>
                                                <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} placeholder="Enter article title" className="mt-1" required />
                                            </div>

                                            <div>
                                                <Label htmlFor="creator" className="text-sm font-medium">Creator / Studio <span className="text-red-500">*</span></Label>
                                                <Input id="creator" name="creator" value={formData.creator || ''} onChange={handleInputChange} placeholder="Enter creator or studio" className="mt-1" required />
                                            </div>

                                            <div>
                                                <Label htmlFor="slug" className="text-sm font-medium">Slug</Label>
                                                <Input id="slug" name="slug" value={formData.slug || ''} onChange={handleInputChange} placeholder="article-url-slug" className="mt-1" disabled={mode === 'create'} />
                                            </div>

                                            <div>
                                                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                                <Select value={formData.status} onValueChange={handleStatusChange}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                                        <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                                                        <SelectItem value="PUBLISHED">Published</SelectItem>
                                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                                        <SelectItem value="NOT_APPROVED">Not Approved</SelectItem>
                                                        <SelectItem value="NEEDS_REVISION">Needs Revision</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Switch id="favorited" checked={formData.favorited || false} onCheckedChange={handleFavoritedChange} />
                                                <Label htmlFor="favorited" className="font-medium">Mark as favorited ({formData.favoritesCount || 0} favorites)</Label>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></Label>
                                                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Brief overview" rows={4} className="mt-1" required />
                                            </div>

                                            <div>
                                                <Label htmlFor="ver" className="text-sm font-medium">Version Name</Label>
                                                <Input id="ver" name="ver" value={formData.ver || ''} onChange={handleInputChange} placeholder="e.g., v1.0" className="mt-1" />
                                            </div>

                                            <div>
                                                <Label htmlFor="version" className="text-sm font-medium">Version Number</Label>
                                                <Input id="version" name="version" type="number" min={1} value={formData.version || 1} onChange={handleInputChange} className="mt-1" />
                                            </div>

                                            <div>
                                                <Label htmlFor="sequentialCode" className="text-sm font-medium">Sequential Code</Label>
                                                <Input id="sequentialCode" name="sequentialCode" value={formData.sequentialCode || ''} onChange={handleInputChange} placeholder="e.g., HJ103" className="mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="content">
                                    <div>
                                        <Label htmlFor="body" className="text-sm font-medium">Article Content <span className="text-red-500">*</span></Label>
                                        <Textarea id="body" name="body" value={formData.body || ''} onChange={handleInputChange} placeholder="Write your article here (Markdown supported)" rows={20} className="mt-1 font-mono text-sm resize-none" required />
                                        <p className="mt-2 text-xs text-gray-500">Markdown formatting is supported for rich text.</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="media">
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <Label className="text-sm font-medium">Tags</Label>
                                                <TagsInput items={formData.tags || []} onAdd={(v) => addItem('tags', v)} onRemove={(v) => removeItem('tags', v)} placeholder="Add tag" suggestions={availableTags} />
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">Categories</Label>
                                                <TagsInput items={formData.categories || []} onAdd={(v) => addItem('categories', v)} onRemove={(v) => removeItem('categories', v)} placeholder="Add category" suggestions={availableCategories} />
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">Platforms</Label>
                                                <TagsInput items={formData.platforms || []} onAdd={(v) => addItem('platforms', v)} onRemove={(v) => removeItem('platforms', v)} placeholder="Add platform" suggestions={availablePlatforms} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="engine" className="text-sm font-medium">Game Engine</Label>
                                            <Select value={formData.engine || ''} onValueChange={handleEngineChange}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select engine" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableEngines.length > 0 ? (
                                                        availableEngines.map((eng) => (
                                                            <SelectItem key={eng.id} value={eng.name}>{eng.name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <SelectItem value="RENPY">Ren&#39;Py</SelectItem>
                                                            <SelectItem value="RPGM">RPG Maker</SelectItem>
                                                            <SelectItem value="UNITY">Unity</SelectItem>
                                                            <SelectItem value="UNREAL">Unreal Engine</SelectItem>
                                                            <SelectItem value="GODOT">Godot</SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <Label className="text-sm font-medium">Main Image (preview)</Label>
                                                <Input id="mainImage" name="mainImage" value={
                                                    (formData.mainImageId ? imageItems.find(i => i.id === formData.mainImageId)?.url : (typeof formData.mainImage === 'string' ? formData.mainImage : formData.mainImage?.url)) || ''
                                                } readOnly placeholder="Select from images below" className="mt-1 bg-gray-50" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Background Image (preview)</Label>
                                                <Input id="backgroundImage" name="backgroundImage" value={
                                                    (formData.backgroundImageId ? imageItems.find(i => i.id === formData.backgroundImageId)?.url : (typeof formData.backgroundImage === 'string' ? formData.backgroundImage : formData.backgroundImage?.url)) || ''
                                                } readOnly placeholder="Select from images below" className="mt-1 bg-gray-50" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Cover Image (preview)</Label>
                                                <Input id="coverImage" name="coverImage" value={
                                                    (formData.coverImageId ? imageItems.find(i => i.id === formData.coverImageId)?.url : (typeof formData.coverImage === 'string' ? formData.coverImage : formData.coverImage?.url)) || ''
                                                } readOnly placeholder="Select from images below" className="mt-1 bg-gray-50" />
                                            </div>
                                        </div>


                                        <div>
                                            <Label className="text-sm font-medium">Article Images</Label>
                                            <ImageManager imageItems={imageItems} setImageItems={setImageItems} setSpecialImageId={setSpecialImageId} mainId={formData.mainImageId} backgroundId={formData.backgroundImageId} coverId={formData.coverImageId} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="downloads">
                                    <DownloadManager items={downloadItems} setItems={setDownloadItems} />
                                </TabsContent>

                                <TabsContent value="mods">
                                    <ModsManager items={modItems} setItems={setModItems} />
                                </TabsContent>
                            </div>
                        </Tabs>

                        <div className="flex justify-end space-x-3 p-6 border-t bg-white sticky bottom-0 z-10">
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving} className="gap-2">
                                <ArrowLeft className="h-4 w-4" /> Cancel
                            </Button>
                            <Button type="submit" disabled={saving} className="gap-2">
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {saving ? 'Saving...' : (mode === 'create' ? 'Create Article' : 'Update Article')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
