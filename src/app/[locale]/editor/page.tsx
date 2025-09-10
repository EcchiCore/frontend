"use client";
import React from 'react';
import { EditorContent } from '@tiptap/react';
import { X, FileText, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Local imports
import ArticleForm from './components/ArticleForm';
import EditorToolbar from './components/EditorToolbar';
import ImageUpload from './components/ImageUpload';
import MetadataFields from './components/MetadataFields';
import PublishTabContent from './components/PublishTabContent';
import { useArticleEditor } from './lib/useArticleEditor';
import { ArticleData } from '@/types/article';
import Image from "next/image"

const initialArticleData: ArticleData = {
  title: '',
  slug: '',
  description: '',
  body: '',
  ver: '1.0.0',
  status: 'DRAFT',
  engine: 'RENPY',
  mainImage: '',
  backgroundImage: '',
  coverImage: '',
  images: [],
  tagList: [],
  categoryList: [],
  platformList: []
};

const ArticleEditor: React.FC = () => {
  const {
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
    setPublishRequestNote,
    message,
    handleTitleChange,
    editor,
    handleImageUpload,
    insertImageIntoEditor,
    addTag,
    addCategory,
    addPlatform,
    removeFromArray,
    submitArticle,
    requestPublish
  } = useArticleEditor(initialArticleData);

  if (!editor) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content mt-4">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-4">
            <span className="p-2 bg-primary rounded-lg">
              <FileText className="w-8 h-8 text-primary-content" />
            </span>
            Article Editor
          </h1>
          <p className="text-base-content/70 text-lg mt-2">Create and manage your articles effortlessly</p>
        </header>

        {/* Alert Message */}
        {message && (
          <Alert className={`mb-6 alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Main Card */}
        <Card className="card bg-base-100 shadow-2xl border-base-300">
          <CardContent className="p-0">
            <Tabs defaultValue="content" className="w-full">
              {/* Tab Navigation */}
              <div className="bg-gradient-to-r from-primary to-accent p-1 rounded-t-lg">
                <TabsList className="tabs tabs-boxed bg-base-100/90 p-1">
                  <TabsTrigger value="content" className="tab tab-bordered text-base-content data-[state=active]:tab-active">
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="media" className="tab tab-bordered text-base-content data-[state=active]:tab-active">
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="metadata" className="tab tab-bordered text-base-content data-[state=active]:tab-active">
                    Metadata
                  </TabsTrigger>
                  <TabsTrigger value="publish" className="tab tab-bordered text-base-content data-[state=active]:tab-active">
                    Publish
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  <ArticleForm
                    articleData={articleData}
                    handleTitleChange={handleTitleChange}
                    setArticleData={setArticleData}
                  />

                  <div className="space-y-2">
                    <Label className="text-base-content font-semibold">Content Editor</Label>
                    <div className="border border-base-300 rounded-lg bg-base-200 overflow-hidden">
                      <EditorToolbar editor={editor} insertImageIntoEditor={insertImageIntoEditor} />
                      <div className="p-4">
                        <EditorContent
                          editor={editor}
                          className="min-h-[300px] text-base-content prose prose-invert max-w-none focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[{ key: 'main', label: 'Main Image', image: articleData.mainImage },
                      { key: 'background', label: 'Background Image', image: articleData.backgroundImage },
                      { key: 'cover', label: 'Cover Image', image: articleData.coverImage }
                    ].map(item => (
                      <ImageUpload
                        key={item.key}
                        label={item.label}
                        image={item.image}
                        onChange={(e) => handleImageUpload(e, item.key as 'main' | 'background' | 'cover')}
                        disabled={imageUploadLoading}
                      />
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base-content font-semibold">Gallery Images</Label>
                    <div className="border-2 border-dashed border-base-300 rounded-lg p-6 bg-base-200 hover:bg-base-300 transition-colors">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'gallery')}
                        disabled={imageUploadLoading}
                        className="hidden"
                        id="upload-gallery"
                      />
                      <label htmlFor="upload-gallery" className="flex flex-col items-center gap-2 cursor-pointer">
                        <Upload className="w-8 h-8 text-base-content/50" />
                        <span className="text-sm text-base-content/70">Add images to gallery</span>
                      </label>
                    </div>
                    {articleData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {articleData.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <Image
                              src={img}
                              alt={`Gallery ${idx}`}
                              className="w-full h-24 object-cover rounded-lg shadow-sm"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFromArray(articleData.images, img, 'images')}
                              className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>


                <TabsContent value="metadata" className="space-y-6">
                  <MetadataFields
                    articleData={articleData}
                    setArticleData={setArticleData}
                    currentTag={currentTag}
                    setCurrentTag={setCurrentTag}
                    currentCategory={currentCategory}
                    setCurrentCategory={setCurrentCategory}
                    currentPlatform={currentPlatform}
                    setCurrentPlatform={setCurrentPlatform}
                    addTag={addTag}
                    addCategory={addCategory}
                    addPlatform={addPlatform}
                    removeFromArray={removeFromArray}
                  />
                </TabsContent>

                {/* Publish Tab */}
                <TabsContent value="publish" className="space-y-6">
                  <PublishTabContent
                    articleData={articleData}
                    publishRequestNote={publishRequestNote}
                    setPublishRequestNote={setPublishRequestNote}
                    requestPublish={requestPublish}
                    publishRequesting={publishRequesting}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-4 p-8 border-t border-base-300">
              <Button
                onClick={submitArticle}
                disabled={saving || imageUploadLoading}
                className="btn btn-primary flex-1 text-lg font-semibold"
              >
                {saving ? 'Saving...' : 'Save Article'}
              </Button>
              <Button
                variant="outline"
                disabled={saving}
                className="btn btn-outline flex-1 text-base-content text-lg font-semibold"
              >
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArticleEditor;