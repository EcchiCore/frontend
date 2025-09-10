'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Key } from 'lucide-react';
import ProfileSettingsForm from './components/ProfileSettingsForm';
import ThemeSettingsForm from './components/ThemeSettingsForm';
import LanguageSettingsForm from './components/LanguageSettingsForm';
import TokenManagerForm from './components/TokenManagerForm';
import SettingsPreview from './components/SettingsPreview';

interface FormData {
  username: string;
  email: string;
  bio: string;
  image: string;
  backgroundImage: string;
  password: string;
  shrtflyApiKey: string;
}

interface ThemeSettings {
  theme: string;
  fontSize: string;
}

interface LanguageSettings {
  language: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userRanks, setUserRanks] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    bio: '',
    image: '',
    backgroundImage: '',
    password: '',
    shrtflyApiKey: '',
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    theme: 'dark',
    fontSize: 'medium',
  });

  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    language: 'en',
  });

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
    return null;
  };

  // ฟังก์ชันสำหรับตั้งค่า activeTab จาก hash
  const setTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['profile', 'theme', 'language', 'tokens'];
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab('profile'); // ค่าเริ่มต้นถ้า hash ไม่ถูกต้อง
    }
  };

  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [activeTab]);

  useEffect(() => {
    const tokenFromCookie = getCookie('token');
    setToken(tokenFromCookie);

    if (!tokenFromCookie) {
      setShowLoginAlert(true);
      setIsLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('userTheme') ?? 'dark';
      const savedFontSize = localStorage.getItem('userFontSize') ?? 'medium';
      setThemeSettings({ theme: savedTheme, fontSize: savedFontSize });

      // ตั้งค่า activeTab จาก hash เมื่อหน้าโหลด
      setTabFromHash();

      // เพิ่ม event listener สำหรับการเปลี่ยนแปลง hash
      window.addEventListener('hashchange', setTabFromHash);
    }

    const savedLanguage = getCookie('userLanguage') ?? 'en';
    setLanguageSettings({ language: savedLanguage });

    // Cleanup event listener เมื่อ component unmount
    return () => {
      window.removeEventListener('hashchange', setTabFromHash);
    };
  }, []);

  useEffect(() => {
    async function loadUserData() {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
        const response = await fetch(`${apiUrl}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error(`Failed to load user data: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.user) {
          setFormData({
            username: data.user.username ?? '',
            email: data.user.email ?? '',
            bio: data.user.bio ?? '',
            image: data.user.image ?? '',
            backgroundImage: data.user.backgroundImage ?? '',
            password: '',
            shrtflyApiKey: data.user.shrtflyApiKey ?? '',
          });
          setUserRanks(data.user.ranks ?? []);
        } else {
          throw new Error('Invalid user data format received');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      loadUserData();
    } else if (token === null && !isLoading) {
      setIsLoading(false);
    }
  }, [router, token, isLoading]);

  // อัปเดต hash ใน URL เมื่อ activeTab เปลี่ยน
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  const showTokensTab = userRanks.some(rank => ['USER', 'MODERATOR', 'ADMIN'].includes(rank));

  if (showLoginAlert) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="alert alert-warning mb-4 shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Authentication Required</h3>
              <div className="text-sm">
                You need to be logged in to access settings. Please log in to continue.
              </div>
            </div>
            <div className="flex-none">
              <Link href="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-base-content/70">Loading your settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="alert alert-warning mb-4">
            <AlertCircle className="h-6 w-6" />
            <span>Please log in to access your settings.</span>
          </div>
          <Link href="/login" className="btn btn-primary btn-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="hidden lg:block">
          <div className="sticky top-4">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <ul className="menu bg-base-100 w-full rounded-box shadow-lg p-2">
              <li>
                <button
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile Settings
                </button>
              </li>
              <li>
                <button
                  className={activeTab === 'theme' ? 'active' : ''}
                  onClick={() => setActiveTab('theme')}
                >
                  Theme & Display
                </button>
              </li>
              <li>
                <button
                  className={activeTab === 'language' ? 'active' : ''}
                  onClick={() => setActiveTab('language')}
                >
                  Language
                </button>
              </li>
              {showTokensTab && (
                <li>
                  <button
                    className={activeTab === 'tokens' ? 'active' : ''}
                    onClick={() => setActiveTab('tokens')}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    API Tokens
                  </button>
                </li>
              )}
            </ul>

            <div className="mt-8">
              <SettingsPreview
                activeTab={activeTab}
                formData={formData}
                themeSettings={themeSettings}
                languageSettings={languageSettings}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Your Settings</h1>

          <div className="tabs tabs-boxed mb-6 lg:hidden">
            <button
              className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`tab ${activeTab === 'theme' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('theme')}
            >
              Theme
            </button>
            <button
              className={`tab ${activeTab === 'language' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              Language
            </button>
            {showTokensTab && (
              <button
                className={`tab ${activeTab === 'tokens' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('tokens')}
              >
                API
              </button>
            )}
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <ProfileSettingsForm
              formData={formData}
              setFormData={setFormData}
              token={token}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          ) : activeTab === 'theme' ? (
            <ThemeSettingsForm
              themeSettings={themeSettings}
              setThemeSettings={setThemeSettings}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          ) : activeTab === 'language' ? (
            <LanguageSettingsForm
              languageSettings={languageSettings}
              setLanguageSettings={setLanguageSettings}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          ) : activeTab === 'tokens' && showTokensTab ? (
            <TokenManagerForm
              token={token}
              ranks={userRanks}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          ) : null}

          <div className="mt-8 lg:hidden">
            <SettingsPreview
              activeTab={activeTab}
              formData={formData}
              themeSettings={themeSettings}
              languageSettings={languageSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}