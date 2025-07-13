export interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  body: string;
  ver: string;
  status: 'DRAFT' | 'PUBLISHED';
  engine: 'RENPY' | 'UNITY' | 'GODOT' | 'CONSTRUCT3';
  mainImage: string;
  backgroundImage: string;
  coverImage: string;
  images: string[];
  tagList: string[];
  categoryList: string[];
  platformList: string[];
}