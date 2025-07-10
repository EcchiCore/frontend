'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import ArticleManagement from './components/ArticleManagement';
import ProfileUpdate from './components/ProfileUpdate';
import { DashboardUser } from './types';
import {
  MinusIcon,
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  UserCircleIcon,
  PencilIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import myImageLoader from "../../../lib/imageLoader";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'profile' | 'articles' | 'moderate'>('profile');
  const [userData, setUserData] = useState<DashboardUser | null>(null);
  const [articlesData, setArticlesData] = useState<ArticlesResponse>({ articles: [], articlesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setLoading(true);
        const token = getCookie('token');

        if (!token) {
          setError('Authorization token not found. Please log in.');
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
          setError('Unauthorized access for this rank');
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
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rank, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUpdateUser = (updatedUser: DashboardUser) => {
    setUserData(updatedUser);
    setIsEditingProfile(false);
  };

  const selectPage = (page: 'profile' | 'articles' | 'moderate') => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const drawer = (
    <div className="bg-base-200 h-full">
      <div className="p-4 text-center">
        <h2 className="text-lg font-semibold">Welcome to Dashboard</h2>
      </div>
      <div className="divider"></div>
      <ul className="menu p-2">
        <li>
          <a
            className={currentPage === 'profile' ? 'active' : ''}
            onClick={() => selectPage('profile')}
          >
            <UserIcon className="h-5 w-5" />
            Profile
          </a>
        </li>
        <li>
          <a
            className={currentPage === 'articles' ? 'active' : ''}
            onClick={() => selectPage('articles')}
          >
            <DocumentTextIcon className="h-5 w-5" />
            Articles
          </a>
        </li>
        {userData?.ranks.includes('MODERATOR') && (
          <li>
            <a
              className={currentPage === 'moderate' ? 'active' : ''}
              onClick={() => {
                const userRank = userData.ranks[0].toLowerCase();
                router.push(`/member/dashboard/${userRank}#moderate`);
                setCurrentPage('moderate');
              }}
            >
              <ShieldCheckIcon className="h-5 w-5" />
              Moderate Content
            </a>
          </li>
        )}
      </ul>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4 text-center">
        <h2 className="text-2xl text-error mb-2">Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary mt-4" onClick={() => router.push('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-2xl">No user data available</h2>
      </div>
    );
  }

  const renderProfile = () => {
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
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="avatar">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-4xl text-white">
                {userData.image ? (
                  <Image
                    loader={myImageLoader}
                    src={userData.image}
                    alt={userData.username}
                    className="rounded-full"
                    width={96}
                    height={96}
                  />
                ) : (
                  userData.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {userData.username} ({userData.ranks[0]})
              </h2>
              <p className="text-base-content/70">{userData.email}</p>
              <p className="mt-2">{userData.bio || 'No bio available'}</p>
              <p className="text-sm text-base-content/50">
                Member since: {userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}
              </p>
              <button
                className="btn btn-outline btn-sm mt-2"
                onClick={() => setIsEditingProfile(true)}
              >
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-sm text-base-content/70">Total Articles</h3>
              <p className="text-3xl font-bold">{articlesData.articlesCount}</p>
              <p className="text-sm text-base-content/50">
                {articlesData.articles.length > 0
                  ? `Last published: ${formatDate(articlesData.articles[0].createdAt)}`
                  : 'No articles yet'}
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-sm text-base-content/70">Draft Articles</h3>
              <p className="text-3xl font-bold">
                {articlesData.articles.filter(a => a.status === 'draft').length}
              </p>
              <p className="text-sm text-base-content/50">Ready to be published</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-sm text-base-content/70">Total Favorites</h3>
              <p className="text-3xl font-bold">
                {articlesData.articles.reduce((sum, article) => sum + article.favoritesCount, 0)}
              </p>
              <p className="text-sm text-base-content/50">Across all articles</p>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Recent Activity</h2>
            {articlesData.articles.length > 0 ? (
              <ul className="space-y-4">
                {articlesData.articles.map((article, index) => (
                  <li key={article.slug} className="flex items-start gap-4">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Created article: {article.title}</p>
                      <p className="text-sm text-base-content/70">
                        {formatDate(article.createdAt)} — Status: {article.status}
                      </p>
                    </div>
                    {index < articlesData.articles.length - 1 && <div className="divider"></div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4">No articles yet. Start writing your first article!</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModerateContent = () => {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Moderate Content</h2>
        <p>This is the moderation panel for {userData.ranks[0]}.</p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <div className={`drawer lg:drawer-open ${mobileOpen ? 'drawer-open' : ''}`}>
        <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={mobileOpen} onChange={handleDrawerToggle} />
        <div className="drawer-content flex flex-col">
          <div className="navbar bg-primary text-primary-content fixed top-0 w-full z-10">
            <div className="flex-none lg:hidden">
              <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                <MinusIcon className="h-6 w-6" />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {currentPage === 'profile'
                  ? (isEditingProfile ? 'Edit Profile' : 'User Profile')
                  : currentPage === 'articles'
                    ? 'Articles'
                    : 'Moderate Content'} - {userData.ranks[0]}
              </h1>
            </div>
            <div className="flex-none gap-2">
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6" />
              </button>
              <button className="btn btn-ghost btn-circle">
                <UserCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <main className="mt-16 p-4 flex-1">
            {currentPage === 'profile' ? renderProfile() : currentPage === 'articles' ? <ArticleManagement /> : renderModerateContent()}
          </main>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <div className="w-64 bg-base-200">
            {drawer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;