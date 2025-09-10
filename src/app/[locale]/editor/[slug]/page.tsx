"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Cookies from 'js-cookie';
import { IoArrowBack } from 'react-icons/io5';
import { FiBold, FiItalic, FiList, FiHash } from 'react-icons/fi';
import { MdUndo, MdRedo } from 'react-icons/md';
import Image from 'next/image';
import imageLoader from '@/app/[locale]/lib/imageLoader';

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

interface Author {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

interface DownloadLink {
  id: number;
  articleId: number;
  name: string;
  url: string;
  isActive: boolean;
  status?: string;  // Added to match potential status field in API response
  createdAt: string;
  updatedAt: string;
}
interface Article {
  title: string;
  slug: string;
  description: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  mainImage: string | null;
  images: string[];
  tagList: string[];
  categoryList: string[];
  platformList: string[];
  author: Author;
  favorited: boolean;
  favoritesCount: number;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        className={`btn btn-sm ${editor.isActive('bold') ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <FiBold />
      </button>
      <button
        className={`btn btn-sm ${editor.isActive('italic') ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <FiItalic />
      </button>
      <button
        className={`btn btn-sm ${editor.isActive('heading', { level: 1 }) ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </button>
      <button
        className={`btn btn-sm ${editor.isActive('heading', { level: 2 }) ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FiList />
      </button>
      <button
        className={`btn btn-sm ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <FiHash />
      </button>
      <button
        className="btn btn-sm btn-outline"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <MdUndo />
      </button>
      <button
        className="btn btn-sm btn-outline"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <MdRedo />
      </button>
    </div>
  );
};

const ArticleEditorPage: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [articleId, setArticleId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('DRAFT');
  const [mainImage, setMainImage] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [platformList, setPlatformList] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [newPlatform, setNewPlatform] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkActive, setLinkActive] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(false);

  const [publishRequestDialogOpen, setPublishRequestDialogOpen] = useState(false);
  const [publishRequestNote, setPublishRequestNote] = useState('');
  const [publishRequestLoading, setPublishRequestLoading] = useState(false);
  
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [suggestedPlatforms, setSuggestedPlatforms] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online';

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl p-5 border border-base-300 rounded-box focus:outline-none',
      },
    },
  });

  const fetchDownloadLinks = useCallback(async (articleId: number) => {
    if (!token) return;

    try {
      setLoadingLinks(true);
      const response = await fetch(`${API_URL}/api/downloads/article/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      // Check if data.links exists and use it, otherwise use the data itself if it's an array
      setDownloadLinks(data.links || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Error fetching download links:', err);
    } finally {
      setLoadingLinks(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    setIsMounted(true);
    setToken(Cookies.get('token') || null);

    const fetchSuggestions = async () => {
      try {
        const [tagsRes, categoriesRes, platformsRes] = await Promise.all([
          fetch(`${API_URL}/api/tags`, {
            headers: { Authorization: `Bearer ${Cookies.get('token')}` },
          }),
          fetch(`${API_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${Cookies.get('token')}` },
          }),
          fetch(`${API_URL}/api/platforms`, {
            headers: { Authorization: `Bearer ${Cookies.get('token')}` },
          }),
        ]);

        const tagsData = await tagsRes.json();
        const categoriesData = await categoriesRes.json();
        const platformsData = await platformsRes.json();

        setSuggestedTags(tagsData.tags || []);
        setSuggestedCategories(categoriesData.categories || []);
        setSuggestedPlatforms(platformsData.platforms || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    fetchSuggestions();
  }, [API_URL]);

  useEffect(() => {
    if (!slug || !isMounted || !token || !editor) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/articles/${slug}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        const fetchedArticle = data.article;
        setArticle(fetchedArticle);
        setArticleId(fetchedArticle.id);

        setTitle(fetchedArticle.title);
        setDescription(fetchedArticle.description);
        editor.commands.setContent(fetchedArticle.body || '');
        setStatus(fetchedArticle.status);
        setMainImage(fetchedArticle.mainImage || '');
        setImages(fetchedArticle.images || []);
        setTagList(fetchedArticle.tagList || []);
        setCategoryList(fetchedArticle.categoryList || []);
        setPlatformList(fetchedArticle.platformList || []);

        if (fetchedArticle.id) {
          fetchDownloadLinks(fetchedArticle.id);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, isMounted, token, editor, API_URL, fetchDownloadLinks]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!token) throw new Error('Authorization token not found. Please log in.');
      if (!editor) throw new Error('Editor not initialized');

      const content = editor.getHTML();

      const updatedArticle = {
        article: {
          title,
          description,
          body: content,
          status,
          mainImage,
          images,
          tagList,
          categoryList,
          platformList,
        },
      };

      const response = await fetch(`${API_URL}/api/articles/${slug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedArticle),
      });

      if (!response.ok) throw new Error(`Failed to update article: ${response.statusText}`);

      const data = await response.json();
      setArticle(data.article);

      setError(null);
      alert('Article updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tagList.includes(newTag.trim())) {
      setTagList([...tagList, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tag: string) => {
    setTagList(tagList.filter((t) => t !== tag));
  };

  const handleAddPlatform = () => {
    if (newPlatform.trim() && !platformList.includes(newPlatform.trim())) {
      setPlatformList([...platformList, newPlatform.trim()]);
      setNewPlatform('');
    }
  };

  const handleDeletePlatform = (platform: string) => {
    setPlatformList(platformList.filter((c) => c !== platform));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categoryList.includes(newCategory.trim())) {
      setCategoryList([...categoryList, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category: string) => {
    setCategoryList(categoryList.filter((c) => c !== category));
  };

  const handleAddImage = (url: string) => {
    if (url.trim() && !images.includes(url.trim())) {
      setImages([...images, url.trim()]);
    }
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const openAddLinkDialog = () => {
    setEditingLinkId(null);
    setLinkName('');
    setLinkUrl('');
    setLinkActive(true);
    setLinkDialogOpen(true);
  };

  const openEditLinkDialog = (link: DownloadLink) => {
    setEditingLinkId(link.id);
    setLinkName(link.name);
    setLinkUrl(link.url);
    setLinkActive(link.isActive);
    setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const handleSaveLink = async () => {
    if (!articleId || !token) return;

    try {
      const linkData = {
        name: linkName,
        url: linkUrl,
        isActive: linkActive,
        articleId,
      };

      let response;
      let newLink: DownloadLink;

      if (editingLinkId === null) {
        response = await fetch(`${API_URL}/api/downloads`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(linkData),
        });

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        newLink = await response.json();
        setDownloadLinks([...downloadLinks, newLink]);
      } else {
        response = await fetch(`${API_URL}/api/downloads/${editingLinkId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(linkData),
        });

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        newLink = await response.json();
        setDownloadLinks(downloadLinks.map((link) => (link.id === editingLinkId ? newLink : link)));
      }

      closeLinkDialog();
    } catch (err) {
      console.error('Error saving download link:', err);
      setError(err instanceof Error ? err.message : 'Failed to save download link');
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this download link?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/downloads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      setDownloadLinks(downloadLinks.filter((link) => link.id !== id));
    } catch (err) {
      console.error('Error deleting download link:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete download link');
    }
  };

  const handlePublishRequest = async () => {
    if (!token || !slug) return;
  
    try {
      setPublishRequestLoading(true);
      
      const response = await fetch(`${API_URL}/api/articles/${slug}/publish-request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: publishRequestNote }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to request publication: ${response.statusText}`);
      }
  
      // Close dialog and reset note
      setPublishRequestDialogOpen(false);
      setPublishRequestNote('');
      
      // Show success message
      alert('Publication request submitted successfully!');
    } catch (err) {
      console.error('Error requesting publication:', err);
      setError(err instanceof Error ? err.message : 'Failed to request publication');
    } finally {
      setPublishRequestLoading(false);
    }
  };
  
  const openPublishRequestDialog = () => {
    setPublishRequestDialogOpen(true);
    setPublishRequestNote('');
  };
  
  const closePublishRequestDialog = () => {
    setPublishRequestDialogOpen(false);
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

  if (error || !article) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          {error || 'Article not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button className="btn btn-outline btn-sm" onClick={handleBack}>
          <IoArrowBack className="mr-2" /> Back
        </button>
      </div>
      <div className="card bg-base-100 shadow-xl p-6">
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Body</span>
          </label>
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Main Image URL</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={mainImage}
            onChange={(e) => setMainImage(e.target.value)}
            placeholder="Paste image URL"
          />
          {mainImage && (
            <div className="mt-2">
              <Image
                loader={imageLoader}
                src={mainImage}
                alt="Main Image"
                className="w-32 h-32 object-cover rounded"
                onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
              />
              <button
                className="btn btn-error btn-sm mt-2"
                onClick={() => setMainImage('')}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Additional Image URLs</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input input-bordered w-full"
              value={newCategory} // Reusing newCategory state for image URL input
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Paste image URL"
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                handleAddImage(newCategory);
                setNewCategory('');
              }}
              disabled={!newCategory.trim() || images.includes(newCategory.trim())}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {images.map((url, index) => (
              <div key={index} className="relative">
                <Image
                  loader={imageLoader}
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                    // Optionally, update the state to reflect the placeholder
                    setImages(prevImages => prevImages.map(img => img === url ? PLACEHOLDER_IMAGE : img));
                  }}
                />
                <button
                  className="btn btn-error btn-xs absolute top-0 right-0"
                  onClick={() => handleRemoveImage(url)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Download Links</span>
          </label>
          <button className="btn btn-outline btn-sm mb-2" onClick={openAddLinkDialog}>
            Add Download Link
          </button>
          {loadingLinks ? (
            <span className="loading loading-spinner"></span>
          ) : downloadLinks.length === 0 ? (
            <p className="text-base-content/70">No download links available</p>
          ) : (
            <div className="space-y-2">
              {downloadLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-2 bg-base-200 rounded">
                  <div>
                    <p className="font-medium">{link.name}</p>
                    <p className="text-sm text-base-content/70">
                      {link.url} ·{' '}
                      <span className={link.isActive ? 'text-primary' : 'text-error'}>
                        {link.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditLinkDialog(link)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Platforms</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input input-bordered w-full"
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              list="platform-suggestions"
            />
            <datalist id="platform-suggestions">
              {suggestedPlatforms.map((platform) => (
                <option key={platform} value={platform} />
              ))}
            </datalist>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddPlatform}
              disabled={!newPlatform.trim() || platformList.includes(newPlatform.trim())}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {platformList.map((platform) => (
              <div key={platform} className="badge badge-primary badge-lg">
                {platform}
                <button
                  className="ml-1 text-white"
                  onClick={() => handleDeletePlatform(platform)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Tags</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input input-bordered w-full"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              list="tag-suggestions"
            />
            <datalist id="tag-suggestions">
              {suggestedTags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddTag}
              disabled={!newTag.trim() || tagList.includes(newTag.trim())}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => (
              <div key={tag} className="badge badge-primary badge-lg">
                {tag}
                <button className="ml-1 text-white" onClick={() => handleDeleteTag(tag)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Categories</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input input-bordered w-full"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {suggestedCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || categoryList.includes(newCategory.trim())}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryList.map((category) => (
              <div key={category} className="badge badge-primary badge-lg">
                {category}
                <button className="ml-1 text-white" onClick={() => handleDeleteCategory(category)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            className={`btn btn-primary flex-1 ${saving ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          
          <button
            className="btn btn-secondary flex-1"
            onClick={openPublishRequestDialog}
            disabled={saving}
          >
            Request Publication
          </button>
        </div>
      </div>

      <dialog open={linkDialogOpen} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {editingLinkId ? 'Edit Download Link' : 'Add Download Link'}
          </h3>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Link Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
            />
          </div>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">URL</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>
          <div className="form-control mt-4">
            <label className="cursor-pointer label">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={linkActive}
                onChange={(e) => setLinkActive(e.target.checked)}
              />
            </label>
          </div>
          <div className="modal-action">
            <button className="btn btn-outline" onClick={closeLinkDialog}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveLink}
              disabled={!linkName.trim() || !linkUrl.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </dialog>
      
      <dialog open={publishRequestDialogOpen} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Request Publication</h3>
          <p className="py-2">
            Your article will be reviewed by our editors before being published.
          </p>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Additional notes for the editors (optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              value={publishRequestNote}
              onChange={(e) => setPublishRequestNote(e.target.value)}
              placeholder="Any special considerations, sources, or context about this article..."
            />
          </div>
          <div className="modal-action">
            <button 
              className="btn btn-outline" 
              onClick={closePublishRequestDialog}
              disabled={publishRequestLoading}
            >
              Cancel
            </button>
            <button
              className={`btn btn-primary ${publishRequestLoading ? 'loading' : ''}`}
              onClick={handlePublishRequest}
              disabled={publishRequestLoading}
            >
              {publishRequestLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ArticleEditorPage;