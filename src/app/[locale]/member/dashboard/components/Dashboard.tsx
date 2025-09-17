'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import ArticleManagement from './components/ArticleManagement';
import ProfileUpdate from './components/ProfileUpdate';
import { DashboardUser } from './types';
import { Pencil, FileText, Calendar, Heart } from 'lucide-react';
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
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Welcome back, {userData.username}!
              </h1>
              <p className="text-muted-foreground text-lg">Here's your dashboard overview</p>
            </div>
            <Button
              variant="outline"
              className="bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 border-2 hover:border-blue-300 transition-all duration-200"
              onClick={() => setIsEditingProfile(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>
              
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center lg:items-start space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                      <Avatar className="relative w-32 h-32 border-4 border-white dark:border-gray-800 shadow-xl">
                        <AvatarImage src={userData.image || undefined} alt={userData.username} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          {userData.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="flex-1 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {userData.username}
                        </h2>
                        <Badge 
                          variant={
                            userData.ranks[0] === 'ADMIN' ? 'destructive' :
                            userData.ranks[0] === 'MODERATOR' ? 'secondary' :
                            'default'
                          }
                          className="text-xs font-semibold px-3 py-1"
                        >
                          {userData.ranks[0]}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-lg">{userData.email}</p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {userData.bio || 'No bio available. Tell us about yourself!'}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member since: {userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Articles</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{articlesData.articlesCount}</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                    {articlesData.articles.length > 0
                      ? `Last published: ${formatDate(articlesData.articles[0].createdAt)}`
                      : 'No articles yet'}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Draft Articles</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {articlesData.articles.filter(a => a.status === 'draft').length}
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Ready to be published</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Pencil className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Favorites</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {articlesData.articles.reduce((sum, article) => sum + article.favoritesCount, 0)}
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">Across all articles</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Recent Activity */}
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <FileText className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {articlesData.articles.length > 0 ? (
              <div className="space-y-4">
                {articlesData.articles.slice(0, 5).map((article, index) => (
                  <div 
                    key={article.slug} 
                    className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-700/30 hover:from-gray-100/50 hover:to-gray-200/30 dark:hover:from-gray-700/50 dark:hover:to-gray-600/30 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {article.title}
                        </p>
                        <Badge 
                          variant={
                            article.status === 'published' ? 'default' :
                            article.status === 'draft' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {article.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {article.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {article.favoritesCount} likes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {articlesData.articles.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                      View All Articles
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No articles yet</h3>
                <p className="text-muted-foreground mb-4">Start writing your first article to see it here!</p>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  <Pencil className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </div>
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
