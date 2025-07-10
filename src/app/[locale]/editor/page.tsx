'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Cookies from 'js-cookie';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online';

// Interface for download links
interface DownloadLink {
  id?: number;
  name: string;
  url: string;
  isActive: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`btn btn-sm ${editor.isActive('bold') ? 'btn-primary' : 'btn-outline'}`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`btn btn-sm ${editor.isActive('italic') ? 'btn-primary' : 'btn-outline'}`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`btn btn-sm ${editor.isActive('heading', { level: 1 }) ? 'btn-primary' : 'btn-outline'}`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`btn btn-sm ${editor.isActive('heading', { level: 2 }) ? 'btn-primary' : 'btn-outline'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-outline'}`}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`btn btn-sm ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-outline'}`}
      >
        Numbered List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="btn btn-sm btn-outline"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="btn btn-sm btn-outline"
      >
        Redo
      </button>
    </div>
  );
};

const ArticleCreatePage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('DRAFT');
  const [mainImage, setMainImage] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [newDownloadName, setNewDownloadName] = useState<string>('');
  const [newDownloadUrl, setNewDownloadUrl] = useState<string>('');
  const [platformList, setPlatformList] = useState<string[]>([]);
  const [newPlatform, setNewPlatform] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl p-5 focus:outline-none border border-base-300 rounded-lg',
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
    setToken(Cookies.get('token'));
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const tagsResponse = await fetch(`${API_URL}/api/tags`);
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setAvailableTags(tagsData.tags || []);
      }
      const categoriesResponse = await fetch(`${API_URL}/api/categories`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setAvailableCategories(categoriesData.categories || []);
      }
      const platformsResponse = await fetch(`${API_URL}/api/platforms`);
      if (platformsResponse.ok) {
        const platformsData = await platformsResponse.json();
        setAvailablePlatforms(platformsData.platforms || []);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!token) throw new Error('Authorization token not found. Please log in.');
      if (!editor) throw new Error('Editor not initialized');

      const content = editor.getHTML();
      const newArticle = {
        article: {
          title,
          description,
          body: content,
          status,
          mainImage: mainImage || null,
          images,
          tagList,
          categoryList,
          platformList,
        },
      };

      const response = await fetch(`${API_URL}/api/articles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newArticle),
      });

      if (!response.ok) throw new Error(`Failed to create article: ${response.statusText}`);

      const data = await response.json();
      const articleId = data.article.id;
      const articleSlug = data.article.slug;

      if (downloadLinks.length > 0) {
        try {
          await Promise.all(downloadLinks.map((link) => addDownloadLink(articleId, link)));
        } catch (downloadError) {
          console.error('Error adding downloads links:', downloadError);
          alert('Article created, but some download links failed.');
          router.push(`/articles/${articleSlug}`);
          return;
        }
      }

      setError(null);
      alert('Article created successfully!');
      router.push(`/articles/${articleSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
    } finally {
      setSaving(false);
    }
  };

  const addDownloadLink = async (articleId: number, link: DownloadLink) => {
    try {
      if (!token) throw new Error('Authorization token not found');
      const response = await fetch(`${API_URL}/api/downloads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: link.name,
          url: link.url,
          isActive: link.isActive,
          articleId,
        }),
      });
      if (!response.ok) throw new Error(`Failed to add download link: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error adding download link:', error);
      throw error;
    }
  };

  const handleAddDownloadLink = () => {
    if (newDownloadName.trim() && newDownloadUrl.trim()) {
      setDownloadLinks([
        ...downloadLinks,
        { name: newDownloadName.trim(), url: newDownloadUrl.trim(), isActive: true },
      ]);
      setNewDownloadName('');
      setNewDownloadUrl('');
    }
  };

  const handleRemoveDownloadLink = (index: number) => {
    setDownloadLinks(downloadLinks.filter((_, i) => i !== index));
  };

  const handleAddTag = (value: string) => {
    if (value && !tagList.includes(value)) {
      setTagList([...tagList, value]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tag: string) => {
    setTagList(tagList.filter((t) => t !== tag));
  };

  const handleAddCategory = (value: string) => {
    if (value && !categoryList.includes(value)) {
      setCategoryList([...categoryList, value]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category: string) => {
    setCategoryList(categoryList.filter((c) => c !== category));
  };

  const handleAddPlatform = (value: string) => {
    if (value && !platformList.includes(value)) {
      setPlatformList([...platformList, value]);
      setNewPlatform('');
    }
  };

  const handleDeletePlatform = (platform: string) => {
    setPlatformList(platformList.filter((p) => p !== platform));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const handleBack = () => router.back();

  if (!isMounted || !editor) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBack} className="btn btn-outline">
          Back to Articles
        </button>
      </div>
      <div className="card bg-base-100 shadow-xl p-6">
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        <div className="flex flex-col gap-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title"
              className="input input-bordered w-full"
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter article description"
              className="textarea textarea-bordered w-full"
              rows={2}
            />
          </div>

          {/* Body */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Body</span>
            </label>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          {/* Status */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Main Image */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Main Image</span>
            </label>
            <input
              type="text"
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              placeholder="Enter main image URL"
              className="input input-bordered w-full"
            />
            {mainImage && (
              <div className="mt-4">
                <Image
                  src={mainImage}
                  alt="Main Image"
                  className="w-48 h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setMainImage('')}
                  className="btn btn-error btn-sm mt-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Additional Images</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="input input-bordered w-full"
              />
              <button
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {images.map((url, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(url)}
                      className="btn btn-error btn-sm absolute top-0 right-0"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Download Links */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Download Links</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDownloadName}
                onChange={(e) => setNewDownloadName(e.target.value)}
                placeholder="Link Name"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newDownloadUrl}
                onChange={(e) => setNewDownloadUrl(e.target.value)}
                placeholder="URL"
                className="input input-bordered w-full"
              />
              <button
                onClick={handleAddDownloadLink}
                className="btn btn-outline"
              >
                <AddIcon />
                Add
              </button>
            </div>
            {downloadLinks.length > 0 && (
              <div className="card bg-base-200 mt-4">
                <ul className="menu">
                  {downloadLinks.map((link, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <div>
                        <h4>{link.name}</h4>
                        <p className="text-sm">{link.url}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveDownloadLink(index)}
                        className="btn btn-error btn-sm"
                      >
                        <DeleteIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tags</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add Tag"
                className="input input-bordered w-full"
                list="available-tags"
              />
              <datalist id="available-tags">
                {availableTags
                  .filter((tag) => !tagList.includes(tag))
                  .map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
              </datalist>
              <button
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim() || tagList.includes(newTag.trim())}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagList.map((tag) => (
                <div key={tag} className="badge badge-primary gap-2">
                  {tag}
                  <button onClick={() => handleDeleteTag(tag)}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Categories</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add Category"
                className="input input-bordered w-full"
                list="available-categories"
              />
              <datalist id="available-categories">
                {availableCategories
                  .filter((category) => !categoryList.includes(category))
                  .map((category) => (
                    <option key={category} value={category} />
                  ))}
              </datalist>
              <button
                onClick={() => handleAddCategory(newCategory)}
                disabled={!newCategory.trim() || categoryList.includes(newCategory.trim())}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryList.map((category) => (
                <div key={category} className="badge badge-primary gap-2">
                  {category}
                  <button onClick={() => handleDeleteCategory(category)}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Platforms</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                placeholder="Add Platform"
                className="input input-bordered w-full"
                list="available-platforms"
              />
              <datalist id="available-platforms">
                {availablePlatforms
                  .filter((platform) => !platformList.includes(platform))
                  .map((platform) => (
                    <option key={platform} value={platform} />
                  ))}
              </datalist>
              <button
                onClick={() => handleAddPlatform(newPlatform)}
                disabled={!newPlatform.trim() || platformList.includes(newPlatform.trim())}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {platformList.map((platform) => (
                <div key={platform} className="badge badge-primary gap-2">
                  {platform}
                  <button onClick={() => handleDeletePlatform(platform)}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn btn-primary w-full ${saving ? 'loading' : ''}`}
          >
            {saving ? 'Creating...' : 'Create Article'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCreatePage;