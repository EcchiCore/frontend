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
  icon: "Globe" | "Download" | "Smartphone";
  os?: string[];
  pricing?: string | string[];
  author?: string;
  publisher?: string;
  isOfficial?: boolean;
  versions?: ToolVersion[];
}
