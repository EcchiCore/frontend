export interface Tool {
  name: string;
  description: string;
  link: string;
  icon: "Globe" | "Download" | "Smartphone";
  os?: string[];
  pricing?: string | string[];
}