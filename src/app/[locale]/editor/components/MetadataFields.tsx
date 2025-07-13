import React from 'react';
import { ArticleData } from '@/types/article';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MetadataFieldsProps {
  articleData: ArticleData;
  setArticleData: React.Dispatch<React.SetStateAction<ArticleData>>;
  currentTag: string;
  setCurrentTag: React.Dispatch<React.SetStateAction<string>>;
  currentCategory: string;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>;
  currentPlatform: string;
  setCurrentPlatform: React.Dispatch<React.SetStateAction<string>>;
  addTag: () => void;
  addCategory: () => void;
  addPlatform: () => void;
  removeFromArray: (array: string[], item: string, field: keyof ArticleData) => void;
}

const MetadataFields: React.FC<MetadataFieldsProps> = ({ 
  articleData, 
  setArticleData, 
  currentTag, 
  setCurrentTag, 
  currentCategory, 
  setCurrentCategory, 
  currentPlatform, 
  setCurrentPlatform, 
  addTag, 
  addCategory, 
  addPlatform, 
  removeFromArray 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-base-content font-semibold">Version</Label>
          <Input
            value={articleData.ver}
            onChange={(e) => setArticleData(prev => ({ ...prev, ver: e.target.value }))}
            className="input input-bordered w-full bg-base-200 text-base-content focus:input-primary"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base-content font-semibold">Status</Label>
          <Select
            value={articleData.status}
            onValueChange={(value: 'DRAFT' | 'PUBLISHED') => setArticleData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="select select-bordered w-full bg-base-200 text-base-content">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-base-100 border-base-300">
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-base-content font-semibold">Engine</Label>
          <Select
            value={articleData.engine}
            onValueChange={(value: any) => setArticleData(prev => ({ ...prev, engine: value }))}
          >
            <SelectTrigger className="select select-bordered w-full bg-base-200 text-base-content">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-base-100 border-base-300">
              <SelectItem value="RENPY">Ren&apos;Py</SelectItem>
              <SelectItem value="UNITY">Unity</SelectItem>
              <SelectItem value="GODOT">Godot</SelectItem>
              <SelectItem value="CONSTRUCT3">Construct 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {[{ label: 'Tags', value: currentTag, setValue: setCurrentTag, list: articleData.tagList, add: addTag, field: 'tagList' },
        { label: 'Categories', value: currentCategory, setValue: setCurrentCategory, list: articleData.categoryList, add: addCategory, field: 'categoryList' },
        { label: 'Platforms', value: currentPlatform, setValue: setCurrentPlatform, list: articleData.platformList, add: addPlatform, field: 'platformList' }
      ].map(section => (
        <div key={section.label} className="space-y-3">
          <Label className="text-base-content font-semibold">{section.label}</Label>
          <div className="flex gap-2">
            <Input
              value={section.value}
              onChange={(e) => section.setValue(e.target.value)}
              placeholder={`Add ${section.label.toLowerCase()}`}
              onKeyPress={(e) => e.key === 'Enter' && section.add()}
              className="input input-bordered flex-1 bg-base-200 text-base-content focus:input-primary"
            />
            <Button
              onClick={section.add}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {section.list.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {section.list.map((item, idx) => (
                <Badge key={idx} className="badge badge-outline badge-lg text-base-content hover:bg-base-300">
                  {item}
                  <X
                    className="ml-2 w-3 h-3 cursor-pointer hover:text-error"
                    onClick={() => removeFromArray(section.list, item, section.field as keyof ArticleData)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetadataFields;