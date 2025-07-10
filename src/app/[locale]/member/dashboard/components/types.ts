export interface DashboardUser {
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
  token?: string;
  createdAt?: string;
  ranks: string[];
}