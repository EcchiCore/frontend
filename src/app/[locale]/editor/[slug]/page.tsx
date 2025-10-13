'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { X, Upload, Image as ImageIcon, LayoutIcon, BookOpenIcon, Save, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

/**
 * Refactor notes:
 * - Images are stored locally as objects with { id, url } so identical URLs can be kept separate.
 * - Special images (main/background/cover) are tracked by *id* locally to uniquely identify which image
 *   the user selected, even when two images share the same URL.
 * - On submit we convert local image objects back to the API shape (array of URLs, and URL fields).
 * - Component split is done as inner components so you can easily extract them into separate files.
 */

interface Author {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

interface ImageItem {
  id: string;
  url: string;
}

interface Article {
  tagList: string[];
  categoryList: string[];
  platformList: string[];
  title: string;
  slug: string;
  description: string;
  body: string;
  creator: string | null;
  author: Author;
  favorited: boolean;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  mainImage: string | null; // kept for API compatibility
  backgroundImage: string | null;
  coverImage: string | null;
  images: string[]; // kept for API compatibility
  ver: string | null;
  version: number;
  engine: string | null;
  sequentialCode: string | null;
  // local-only ids (optional)
  mainImageId?: string | null;
  backgroundImageId?: string | null;
  coverImageId?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ---------------------- Small inner components (extractable) ---------------------- */

const TagsInput: React.FC<{
  items?: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder?: string;
}> = ({ items = [], onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState('');
  return (
    <div>
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
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const v = input.trim();
            if (v) onAdd(v);
            setInput('');
          }
        }}
        className="mt-2"
      />
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
    // If removed image was special, clear it
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

/* ---------------------- Main page ---------------------- */

const EditArticlePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const slug = (params.slug as string) ?? '';

  const [article, setArticle] = useState<Partial<Article>>({
    tagList: [],
    categoryList: [],
    platformList: [],
    images: [],
    title: '',
    slug: '',
    description: '',
    body: '',
    creator: '',
    favorited: false,
    favoritesCount: 0,
    status: 'DRAFT',
    mainImage: null,
    backgroundImage: null,
    coverImage: null,
    ver: null,
    version: 1,
    engine: null,
    sequentialCode: null,
  });

  // Local structured image items
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(null);
      const token = getCookie('token');
      if (!token) throw new Error('Authorization token not found. Please log in.');

      const response = await fetch(`${API_URL}/api/articles/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch article');

      const data = await response.json();
      const art: Article = { ...data.article } as Article;

      // convert images (strings) to ImageItem[] with unique ids
      const items: ImageItem[] = (art.images || []).map(url => ({ id: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, url }));

      // find matching ids for special images (if any URLs match)
      const mainId = art.mainImage ? items.find(i => i.url === art.mainImage)?.id ?? null : null;
      const backgroundId = art.backgroundImage ? items.find(i => i.url === art.backgroundImage)?.id ?? null : null;
      const coverId = art.coverImage ? items.find(i => i.url === art.coverImage)?.id ?? null : null;

      setImageItems(items);
      setArticle({ ...art, creator: art.creator ?? '', mainImageId: mainId, backgroundImageId: backgroundId, coverImageId: coverId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  /* ---------------------- Handlers ---------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setArticle(prev => ({
        ...prev,
        [name]: value,
        slug: prev?.slug ? prev.slug : value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      }));
    } else if (name === 'version') {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 1) {
        setArticle(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setArticle(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStatusChange = (value: string) => {
    setArticle(prev => ({ ...prev, status: value }));
  };

  const handleFavoritedChange = (checked: boolean) => {
    setArticle(prev => ({ ...prev, favorited: checked }));
  };

  const handleEngineChange = (value: string) => {
    setArticle(prev => ({ ...prev, engine: value }));
  };

  const addItem = (type: 'tagList' | 'categoryList' | 'platformList', input: string) => {
    const v = input.trim();
    if (!v) return;
    setArticle(prev => {
      const list = (prev && prev[type]) || [];
      if (!list.includes(v)) return { ...prev, [type]: [...list, v] };
      return prev;
    });
  };

  const removeItem = (type: 'tagList' | 'categoryList' | 'platformList', item: string) => {
    setArticle(prev => ({ ...prev, [type]: (prev && prev[type] || []).filter((i: string) => i !== item) }));
  };

  const setSpecialImageId = (type: 'main' | 'background' | 'cover', id: string | null) => {
    if (type === 'main') setArticle(prev => ({ ...prev, mainImageId: id }));
    if (type === 'background') setArticle(prev => ({ ...prev, backgroundImageId: id }));
    if (type === 'cover') setArticle(prev => ({ ...prev, coverImageId: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!article.title || !article.description || !article.body || !article.creator) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = getCookie('token');
      if (!token) throw new Error('Authorization token not found. Please log in.');

      // Build payload: convert local imageItems to API shape
      const payloadArticle: Partial<Article> = {
        ...article,
        images: imageItems.map(i => i.url),
        mainImage: article.mainImageId ? imageItems.find(i => i.id === article.mainImageId)?.url ?? null : (article.mainImage ?? null),
        backgroundImage: article.backgroundImageId ? imageItems.find(i => i.id === article.backgroundImageId)?.url ?? null : (article.backgroundImage ?? null),
        coverImage: article.coverImageId ? imageItems.find(i => i.id === article.coverImageId)?.url ?? null : (article.coverImage ?? null),
      };

      const response = await fetch(`${API_URL}/api/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ article: payloadArticle }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update article');
      }

      setSuccessMessage('Article updated successfully!');
      // directly navigate after a short visible success (no setTimeout to avoid async waiting); using router.push immediately
      router.push(`/articles/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-lg font-medium text-gray-700">Loading article details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          {article.updatedAt && (
            <p className="text-sm text-gray-500">Last updated: {new Date(article.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
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
                <div className="sticky top-0 z-10 bg-white border-b">
                  <TabsList className="w-full justify-start px-6">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="media">Media & Metadata</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="basic">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></Label>
                          <Input id="title" name="title" value={article.title || ''} onChange={handleInputChange} placeholder="Enter article title" className="mt-1" required />
                        </div>

                        <div>
                          <Label htmlFor="creator" className="text-sm font-medium">Creator / Studio <span className="text-red-500">*</span></Label>
                          <Input id="creator" name="creator" value={article.creator || ''} onChange={handleInputChange} placeholder="Enter creator or studio" className="mt-1" required />
                        </div>

                        <div>
                          <Label htmlFor="slug" className="text-sm font-medium">Slug</Label>
                          <Input id="slug" name="slug" value={article.slug || ''} onChange={handleInputChange} placeholder="article-url-slug (auto-generated from title)" className="mt-1" />
                        </div>

                        <div>
                          <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                          <Select value={(article.status as string) ?? 'DRAFT'} onValueChange={handleStatusChange}>
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
                          <Switch id="favorited" checked={article.favorited || false} onCheckedChange={handleFavoritedChange} />
                          <Label htmlFor="favorited" className="font-medium">Mark as favorited ({article.favoritesCount || 0} favorites)</Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></Label>
                          <Textarea id="description" name="description" value={article.description || ''} onChange={handleInputChange} placeholder="Brief overview of the article" rows={4} className="mt-1" required />
                        </div>

                        <div>
                          <Label htmlFor="ver" className="text-sm font-medium">Version Name</Label>
                          <Input id="ver" name="ver" value={article.ver || ''} onChange={handleInputChange} placeholder="e.g., v1.0" className="mt-1" />
                        </div>

                        <div>
                          <Label htmlFor="version" className="text-sm font-medium">Version Number</Label>
                          <Input id="version" name="version" type="number" min={1} value={article.version || 1} onChange={handleInputChange} placeholder="e.g., 1" className="mt-1" />
                        </div>

                        <div>
                          <Label htmlFor="sequentialCode" className="text-sm font-medium">Sequential Code</Label>
                          <Input id="sequentialCode" name="sequentialCode" value={article.sequentialCode || ''} onChange={handleInputChange} placeholder="e.g., HJ103" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content">
                    <div>
                      <Label htmlFor="body" className="text-sm font-medium">Article Content <span className="text-red-500">*</span></Label>
                      <Textarea id="body" name="body" value={article.body || ''} onChange={handleInputChange} placeholder="Write your article here (Markdown supported)" rows={20} className="mt-1 font-mono text-sm resize-none" required />
                      <p className="mt-2 text-xs text-gray-500">Markdown formatting is supported for rich text.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="media">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-sm font-medium">Tags</Label>
                          <TagsInput items={article.tagList || []} onAdd={(v) => addItem('tagList', v)} onRemove={(v) => removeItem('tagList', v)} placeholder="Add tag and press Enter" />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Categories</Label>
                          <TagsInput items={article.categoryList || []} onAdd={(v) => addItem('categoryList', v)} onRemove={(v) => removeItem('categoryList', v)} placeholder="Add category and press Enter" />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Platforms</Label>
                          <TagsInput items={article.platformList || []} onAdd={(v) => addItem('platformList', v)} onRemove={(v) => removeItem('platformList', v)} placeholder="Add platform and press Enter" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="engine" className="text-sm font-medium">Game Engine</Label>
                        <Select value={(article.engine as string) ?? ''} onValueChange={handleEngineChange}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select engine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RENPY">Ren&#39;Py</SelectItem>
                            <SelectItem value="RPGM">RPG Maker</SelectItem>
                            <SelectItem value="UNITY">Unity</SelectItem>
                            <SelectItem value="UNREAL">Unreal Engine</SelectItem>
                            <SelectItem value="GODOT">Godot</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-sm font-medium">Main Image (preview)</Label>
                          <Input id="mainImage" name="mainImage" value={
                            (article.mainImageId ? imageItems.find(i => i.id === article.mainImageId)?.url : article.mainImage) || ''
                          } onChange={handleInputChange} placeholder="https://example.com/main.jpg" className="mt-1" />
                          {(article.mainImageId || article.mainImage) && (
                            <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden">
                              <Image src={(article.mainImageId ? imageItems.find(i => i.id === article.mainImageId)?.url : article.mainImage) || '/placeholder-image.png'} alt="Main Image Preview" fill className="object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }} />
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Background Image (preview)</Label>
                          <Input id="backgroundImage" name="backgroundImage" value={
                            (article.backgroundImageId ? imageItems.find(i => i.id === article.backgroundImageId)?.url : article.backgroundImage) || ''
                          } onChange={handleInputChange} placeholder="https://example.com/background.jpg" className="mt-1" />
                          {(article.backgroundImageId || article.backgroundImage) && (
                            <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden">
                              <Image src={(article.backgroundImageId ? imageItems.find(i => i.id === article.backgroundImageId)?.url : article.backgroundImage) || '/placeholder-image.png'} alt="Background Preview" fill className="object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }} />
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Cover Image (preview)</Label>
                          <Input id="coverImage" name="coverImage" value={
                            (article.coverImageId ? imageItems.find(i => i.id === article.coverImageId)?.url : article.coverImage) || ''
                          } onChange={handleInputChange} placeholder="https://example.com/cover.jpg" className="mt-1" />
                          {(article.coverImageId || article.coverImage) && (
                            <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden">
                              <Image src={(article.coverImageId ? imageItems.find(i => i.id === article.coverImageId)?.url : article.coverImage) || '/placeholder-image.png'} alt="Cover Preview" fill className="object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Additional Images</Label>
                        <ImageManager imageItems={imageItems} setImageItems={setImageItems} setSpecialImageId={setSpecialImageId} mainId={article.mainImageId ?? null} backgroundId={article.backgroundImageId ?? null} coverId={article.coverImageId ?? null} />
                      </div>
                    </div>
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
                  {saving ? 'Saving...' : 'Update Article'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditArticlePage;

