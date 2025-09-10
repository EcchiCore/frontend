import React from 'react';
import { ArticleData } from '@/types/article';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ArticleFormProps {
  articleData: ArticleData;
  handleTitleChange: (title: string) => void;
  setArticleData: React.Dispatch<React.SetStateAction<ArticleData>>;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
                                                   articleData,
                                                   handleTitleChange,
                                                   setArticleData
                                                 }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base-content font-semibold">Title</Label>
          <Input
            id="title"
            value={articleData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter article title"
            className="input input-bordered w-full bg-base-200 text-base-content focus:input-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-base-content font-semibold">Slug</Label>
          <Input
            id="slug"
            value={articleData.slug}
            onChange={(e) => setArticleData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="article-slug"
            className="input input-bordered w-full bg-base-200 text-base-content focus:input-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base-content font-semibold">Description</Label>
        <Textarea
          id="description"
          value={articleData.description}
          onChange={(e) => setArticleData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of your article"
          rows={3}
          className="textarea textarea-bordered w-full bg-base-200 text-base-content focus:textarea-primary"
        />
      </div>
    </div>
  );
};

export default ArticleForm;