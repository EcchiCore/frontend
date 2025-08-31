'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import ArticleManagement from './components/ArticleManagement';
import ProfileUpdate from './components/ProfileUpdate';
import { DashboardUser } from './types';
import { Pencil, FileText } from 'lucide-react';
import { DashboardLayoutShadcn } from '../layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Author {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

interface Article {
  tagList: string[];
  categoryList: string[];
  title: string;
  slug: string;
  description: string;
  body: string;
  author: Author;
  favorited: boolean;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  mainImage: string | null;
  images: string[];
}

interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'profile' | 'articles' | 'moderate'>('profile');
  const [userData, setUserData] = useState<DashboardUser | null>(null);
  const [articlesData, setArticlesData] = useState<ArticlesResponse>({ articles: [], articlesCount: 0 });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const router = useRouter();
  const { rank } = useParams();

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  const handleHashChange = () => {
    const hash = window.location.hash.replace('#', '');
    switch (hash) {
      case 'articles':
        setCurrentPage('articles');
        break;
      case 'moderate':
        setCurrentPage('moderate');
        break;
      case 'profile':
      default:
        setCurrentPage('profile');
        break;
    }
  };

  useEffect(() => {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie('token');

        if (!token) {
          router.push('/login');
          return;
        }

        const userResponse = await fetch(`${API_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userResponse.ok) {
          throw new Error(`User API error: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();
        const userRank = userData.user.ranks[0]?.toLowerCase();

        if (rank && userRank !== rank.toString().toLowerCase()) {
          router.push(`/member/dashboard/${userRank}`);
          return;
        }

        let articlesData: ArticlesResponse = { articles: [], articlesCount: 0 };
        try {
          const articlesResponse = await fetch(`${API_URL}/api/articles/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (articlesResponse.ok) {
            articlesData = await articlesResponse.json();
          } else if (articlesResponse.status === 404) {
            console.warn('No articles found for this user');
          } else {
            throw new Error(`Articles API error: ${articlesResponse.statusText}`);
          }
        } catch (articlesError) {
          console.warn('Articles fetch failed:', articlesError);
          articlesData = { articles: [], articlesCount: 0 };
        }

        setUserData(userData.user);
        setArticlesData(articlesData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
      }
    };

    fetchData();
  }, [rank, router]);

  const handleUpdateUser = (updatedUser: DashboardUser) => {
    setUserData(updatedUser);
    setIsEditingProfile(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const renderProfile = () => {
  if (!userData) {
    return null;
  }

  if (isEditingProfile) {
    return (
      <ProfileUpdate
        user={userData}
        onUpdate={handleUpdateUser}
        onCancel={() => setIsEditingProfile(false)}
      />
    );
  }

  return (
      <div className="container mx-auto p-4">
        <Card className="mb-6">
          <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-4 p-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userData.image || undefined} alt={userData.username} />
              <AvatarFallback>{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {userData.username} ({userData.ranks[0]})
              </h2>
              <p className="text-muted-foreground">{userData.email}</p>
              <p className="mt-2">{userData.bio || 'No bio available'}</p>
              <p className="text-sm text-muted-foreground">
                Member since: {userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setIsEditingProfile(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{articlesData.articlesCount}</p>
              <p className="text-sm text-muted-foreground">
                {articlesData.articles.length > 0
                  ? `Last published: ${formatDate(articlesData.articles[0].createdAt)}`
                  : 'No articles yet'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Draft Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {articlesData.articles.filter(a => a.status === 'draft').length}
              </p>
              <p className="text-sm text-muted-foreground">Ready to be published</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {articlesData.articles.reduce((sum, article) => sum + article.favoritesCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Across all articles</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {articlesData.articles.length > 0 ? (
              <ul className="space-y-4">
                {articlesData.articles.map((article) => (
                  <li key={article.slug} className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        <FileText className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Created article: {article.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(article.createdAt)} — Status: {article.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4">No articles yet. Start writing your first article!</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderModerateContent = () => {
  if (!userData) {
    return null;
  }
  return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Moderate Content</h2>
        <p>This is the moderation panel for {userData.ranks[0]}.</p>
      </div>
    );
  };

  return (
    <DashboardLayoutShadcn title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}>
      <main className="p-4 flex-1">
        {currentPage === 'profile' ? renderProfile() : currentPage === 'articles' ? <ArticleManagement /> : renderModerateContent()}
      </main>
    </DashboardLayoutShadcn>
  );
};

export default Dashboard;
