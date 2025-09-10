import React, { useState, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ArticleData } from '@/types/article';

export const useArticleEditor = (initialData: ArticleData) => {
  const [articleData, setArticleData] = useState<ArticleData>(initialData);
  const [currentTag, setCurrentTag] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishRequesting, setPublishRequesting] = useState(false);
  const [publishRequestNote, setPublishRequestNote] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const handleTitleChange = (title: string) => {
    setArticleData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: articleData.body,
    onUpdate: ({ editor }) => {
      setArticleData(prev => ({
        ...prev,
        body: editor.getHTML()
      }));
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error('ImgBB API key is not configured');
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', apiKey);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ImgBB API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
      }

      return data.data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'main' | 'background' | 'cover' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageType === 'gallery') {
        setArticleData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
      } else {
        setArticleData(prev => ({
          ...prev,
          [`${imageType}Image`]: imageUrl
        }));
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setImageUploadLoading(false);
    }
  };

  const insertImageIntoEditor = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImageUploadLoading(true);
      try {
        const imageUrl = await uploadImage(file);
        editor?.chain().focus().setImage({ src: imageUrl }).run();
      } catch {
        setMessage({ type: 'error', text: 'Failed to upload image' });
      } finally {
        setImageUploadLoading(false);
      }
    };
    input.click();
  };

  const addTag = () => {
    if (currentTag.trim() && !articleData.tagList.includes(currentTag.trim())) {
      setArticleData(prev => ({
        ...prev,
        tagList: [...prev.tagList, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const addCategory = () => {
    if (currentCategory.trim() && !articleData.categoryList.includes(currentCategory.trim())) {
      setArticleData(prev => ({
        ...prev,
        categoryList: [...prev.categoryList, currentCategory.trim()]
      }));
      setCurrentCategory('');
    }
  };

  const addPlatform = () => {
    if (currentPlatform.trim() && !articleData.platformList.includes(currentPlatform.trim())) {
      setArticleData(prev => ({
        ...prev,
        platformList: [...prev.platformList, currentPlatform.trim()]
      }));
      setCurrentPlatform('');
    }
  };

  const removeFromArray = (array: string[], item: string, field: keyof ArticleData) => {
    setArticleData(prev => ({
      ...prev,
      [field]: array.filter(i => i !== item)
    }));
  };

  const submitArticle = async () => {
    if (!articleData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' });
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setArticleData(prev => ({ ...prev, id: Date.now().toString() }));
      setMessage({ type: 'success', text: 'Article saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save article' });
    } finally {
      setSaving(false);
    }
  };

  const requestPublish = async () => {
    if (!articleData.id) {
      setMessage({ type: 'error', text: 'Please save the article first' });
      return;
    }

    setPublishRequesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Publish request submitted successfully!' });
      setPublishRequestNote('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to submit publish request' });
    } finally {
      setPublishRequesting(false);
    }
  };

  return {
    articleData,
    setArticleData,
    currentTag,
    setCurrentTag,
    currentCategory,
    setCurrentCategory,
    currentPlatform,
    setCurrentPlatform,
    imageUploadLoading,
    saving,
    publishRequesting,
    publishRequestNote,
    setPublishRequestNote, // This was missing!
    message,
    setMessage,
    generateSlug,
    handleTitleChange,
    editor,
    uploadImage,
    handleImageUpload,
    insertImageIntoEditor,
    addTag,
    addCategory,
    addPlatform,
    removeFromArray,
    submitArticle,
    requestPublish
  };
};