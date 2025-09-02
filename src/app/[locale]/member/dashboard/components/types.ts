export interface DashboardUser {
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
  backgroundImage: string | null;
  shrtflyApiKey: string | null;
  socialMediaLinks: SocialMediaLink[];
  token?: string;
  createdAt?: string;
  ranks: string[];
}

interface SocialMediaLink {
  platform: string;
  url: string;
}