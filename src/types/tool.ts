export interface ToolVersion {
  _key: string;
  versionNumber: string;
  releaseDate: string;
  changelog?: string;
  downloadLink: string;
  exampleClip?: string; // YouTube URL
}

export interface Tool {
  _id: string;
  name: string;
  description: string;
  icon: string;
  os?: string[];
  pricing?: string | string[];
  author?: string;
  publisher?: string;
  isOfficial?: boolean;
  githubUrl?: string;
  websiteUrl?: string;
  detailUrl?: string;
  tags?: string[];
  versions?: ToolVersion[];
}
