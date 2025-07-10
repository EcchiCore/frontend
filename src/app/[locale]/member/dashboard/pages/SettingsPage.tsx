'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserIcon,
  LockClosedIcon,
  BellIcon,
  EyeIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthContext } from '../providers/AuthProvider';
import { userApi, ApiError, getCookie, setCookie } from '../utils/api';
import { DashboardUser, SocialMediaLink, Token } from '../utils/types';
import Image from 'next/image';
import Link from 'next/link';

interface SettingsFormData {
  username: string;
  email: string;
  bio: string;
  image: string;
  backgroundImage: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  shrtflyApiKey: string;
  socialMediaLinks: SocialMediaLink[];
}

interface NotificationSettings {
  emailArticles: boolean;
  emailComments: boolean;
  emailFollows: boolean;
  pushArticles: boolean;
  pushComments: boolean;
  pushFollows: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showBio: boolean;
  allowFollows: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  articlesPerPage: number;
  compactView: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'tokens' | 'danger'
  >('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [newTokenDuration, setNewTokenDuration] = useState('7d');
  const [newTokenRank, setNewTokenRank] = useState('USER');
  const [newCreatedToken, setNewCreatedToken] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState<SettingsFormData>({
    username: '',
    email: '',
    bio: '',
    image: '',
    backgroundImage: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    shrtflyApiKey: '',
    socialMediaLinks: [],
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailArticles: true,
    emailComments: true,
    emailFollows: true,
    pushArticles: false,
    pushComments: false,
    pushFollows: false,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showBio: true,
    allowFollows: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'en',
    articlesPerPage: 10,
    compactView: false,
    fontSize: 'medium',
  });

  // Memoized fetchTokens
  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getTokens();
      setTokens(data);
    } catch {
      showMessage('error', 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  }, []);

  const hasTokenAccess = useCallback(() => {
    return user?.rank && ['USER', 'MODERATOR', 'ADMIN'].includes(user.rank); // Changed to use user.rank
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        image: user.image || '',
        backgroundImage: user.backgroundImage || '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        shrtflyApiKey: user.shrtflyApiKey || '',
        socialMediaLinks: user.socialMediaLinks || [],
      });

      const savedTheme = localStorage.getItem('userTheme') || 'light';
      const savedFontSize = localStorage.getItem('userFontSize') || 'medium';
      const savedLanguage = getCookie('userLanguage') || 'en';
      setAppearanceSettings((prev) => ({
        ...prev,
        theme: savedTheme as 'light' | 'dark' | 'auto',
        fontSize: savedFontSize as 'small' | 'medium' | 'large',
        language: savedLanguage,
      }));

      applyTheme(savedTheme);
      applyFontSize(savedFontSize);

      if (hasTokenAccess()) {
        fetchTokens();
      }
    }
  }, [user, fetchTokens, hasTokenAccess]);

  // Update URL hash when activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // Handle hash change to set active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = [
        'profile',
        'security',
        'notifications',
        'privacy',
        'appearance',
        'tokens',
        'danger',
      ] as const;
      if (validTabs.includes(hash as any)) {
        setActiveTab(hash as typeof validTabs[number]);
      } else {
        setActiveTab('profile');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial tab from hash
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const applyFontSize = (size: string) => {
    let rootSize = '16px';
    switch (size) {
      case 'small':
        rootSize = '14px';
        break;
      case 'large':
        rootSize = '18px';
        break;
    }
    document.documentElement.style.fontSize = rootSize;
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };



  const getHighestRank = () => {
    if (!user?.rank) return null;
    if (user.rank === 'ADMIN') return 'ADMIN';
    if (user.rank === 'MODERATOR') return 'MODERATOR';
    if (user.rank === 'USER') return 'USER';
    return null;
  };

  const getFilteredRankOptions = () => {
    const highestRank = getHighestRank();
    const allRankOptions = [
      { value: 'USER', label: 'User' },
      { value: 'MODERATOR', label: 'Moderator' },
      { value: 'ADMIN', label: 'Admin' },
    ];
    if (!highestRank) return [];
    switch (highestRank) {
      case 'ADMIN':
        return allRankOptions;
      case 'MODERATOR':
        return allRankOptions.filter((option) => option.value !== 'ADMIN');
      case 'USER':
        return allRankOptions.filter((option) => option.value === 'USER');
      default:
        return [];
    }
  };

  const createToken = async () => {
    setIsCreatingToken(true);
    setNewCreatedToken(null);
    try {
      const data = await userApi.createToken({
        duration: newTokenDuration,
        ranks: [newTokenRank],
      });
      setNewCreatedToken(data.token);
      showMessage('success', 'Token created successfully!');
      fetchTokens();
    } catch {
      showMessage('error', 'Failed to create token');
    } finally {
      setIsCreatingToken(false);
    }
  };

  const deleteToken = async (id: number) => {
    try {
      await userApi.deleteToken(id);
      setTokens(tokens.filter((t) => t.id !== id));
      showMessage('success', 'Token deleted successfully!');
    } catch  {
      showMessage('error', 'Failed to delete token');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const updateData: Partial<DashboardUser> = {
        username: profileForm.username,
        email: profileForm.email,
        bio: profileForm.bio || null,
        image: profileForm.image || null,
        backgroundImage: profileForm.backgroundImage || null,
        shrtflyApiKey: profileForm.shrtflyApiKey || null,
        socialMediaLinks: profileForm.socialMediaLinks,
      };

      await userApi.updateUser(updateData);
      updateUser(updateData);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update profile';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profileForm.newPassword !== profileForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (profileForm.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await userApi.updatePassword({
        currentPassword: profileForm.password,
        newPassword: profileForm.newPassword,
      });

      setProfileForm((prev) => ({
        ...prev,
        password: '',
        newPassword: '',
        confirmPassword: '',
      }));

      showMessage('success', 'Password updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update password';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAppearanceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      localStorage.setItem('userTheme', appearanceSettings.theme);
      localStorage.setItem('userFontSize', appearanceSettings.fontSize);
      setCookie('userLanguage', appearanceSettings.language, 365);
      applyTheme(appearanceSettings.theme);
      applyFontSize(appearanceSettings.fontSize);
      showMessage('success', 'Appearance settings saved successfully!');
    } catch {
      showMessage('error', 'Failed to save appearance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    );

    if (confirmation !== 'DELETE') {
      showMessage('error', 'Account deletion cancelled');
      return;
    }

    try {
      setLoading(true);
      await userApi.deleteAccount();
      showMessage('success', 'Account deleted successfully. Logging out...');
      // Redirect to logout or homepage
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to delete account';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMediaChange = (index: number, field: keyof SocialMediaLink, value: string) => {
    setProfileForm((prev) => {
      const updatedLinks = [...prev.socialMediaLinks];
      updatedLinks[index] = { ...updatedLinks[index], [field]: value };
      return { ...prev, socialMediaLinks: updatedLinks };
    });
  };

  const addSocialMediaLink = () => {
    setProfileForm((prev) => ({
      ...prev,
      socialMediaLinks: [...prev.socialMediaLinks, { platform: '', url: '' }],
    }));
  };

  const removeSocialMediaLink = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.filter((_, i) => i !== index),
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy', icon: EyeIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
    ...(hasTokenAccess() ? [{ id: 'tokens', label: 'API Tokens', icon: KeyIcon }] : []),
    { id: 'danger', label: 'Danger Zone', icon: ExclamationTriangleIcon },
  ] as const;

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
  ];

  const durations = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '365d', label: '1 Year' },
    { value: 'permanent', label: 'Permanent' },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <ul className="menu bg-base-200 rounded-box shadow-lg p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      className={activeTab === tab.id ? 'active' : ''}
                      onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'tokens' | 'danger')}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
            {/* Preview Section */}
            <div className="mt-8 bg-base-200 p-6 rounded-box">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              {activeTab === 'profile' && (
                <div className="card bg-base-100 shadow-xl">
                  {profileForm.backgroundImage && (
                    <figure className="relative h-32 overflow-hidden">
                      <Image
                        src={profileForm.backgroundImage}
                        alt="Profile background"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <div className="flex flex-col items-center mb-4">
                      {profileForm.image ? (
                        <div
                          className={`avatar ${profileForm.backgroundImage ? 'mt-[-48px]' : ''} mb-4`}
                        >
                          <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <Image
                              src={profileForm.image}
                              alt={profileForm.username}
                              width={96}
                              height={96}
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`avatar placeholder ${profileForm.backgroundImage ? 'mt-[-48px]' : ''} mb-4`}
                        >
                          <div className="bg-neutral text-neutral-content rounded-full w-24">
                            <span className="text-2xl">
                              {profileForm.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                      <h2 className="card-title">{profileForm.username || 'Username'}</h2>
                      <p className="text-sm opacity-70">{profileForm.email || 'email@example.com'}</p>
                    </div>
                    <div className="divider">Bio</div>
                    <p className="whitespace-pre-line">{profileForm.bio || 'No bio provided yet.'}</p>
                  </div>
                </div>
              )}
              {activeTab === 'appearance' && (
                <div className="prose">
                  <h4>Theme Preview</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-primary text-primary-content p-2 rounded text-center">
                      Primary
                    </div>
                    <div className="bg-secondary text-secondary-content p-2 rounded text-center">
                      Secondary
                    </div>
                    <div className="bg-accent text-accent-content p-2 rounded text-center">
                      Accent
                    </div>
                    <div className="bg-neutral text-neutral-content p-2 rounded text-center">
                      Neutral
                    </div>
                  </div>
                  <p><strong>Theme:</strong> {appearanceSettings.theme}</p>
                  <p><strong>Font Size:</strong> {appearanceSettings.fontSize}</p>
                  <p><strong>Language:</strong> {languages.find((l) => l.code === appearanceSettings.language)?.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Your Settings</h1>

          {/* Mobile Tabs */}
          <div className="tabs tabs-boxed mb-6 lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'tokens' | 'danger')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
              {message.type === 'success' ? (
                <CheckIcon className="h-6 w-6" />
              ) : (
                <XMarkIcon className="h-6 w-6" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Profile Picture URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={profileForm.image}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Background Image URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered"
                  value={profileForm.backgroundImage}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, backgroundImage: e.target.value }))
                  }
                  placeholder="https://example.com/background.jpg"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">ShrtFly API Key</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={profileForm.shrtflyApiKey}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, shrtflyApiKey: e.target.value }))
                  }
                  placeholder="ShrtFly API Key"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Social Media Links</span>
                </label>
                {profileForm.socialMediaLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                      className="input input-bordered w-1/3"
                      placeholder="Platform (e.g., Twitter)"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                      className="input input-bordered w-2/3"
                      placeholder="URL (e.g., https://twitter.com/username)"
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialMediaLink(index)}
                      className="btn btn-error btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSocialMediaLink}
                  className="btn btn-secondary btn-sm mt-2"
                >
                  Add Social Media Link
                </button>
              </div>
              <div className="flex justify-between items-center mt-6">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Save Profile'}
                </button>
                <Link href="/dashboard/profile" className="btn btn-ghost">
                  Cancel
                </Link>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={profileForm.newPassword}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  minLength={8}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={profileForm.confirmPassword}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  minLength={8}
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-6">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Update Password'}
                </button>
                <Link href="/dashboard/profile" className="btn btn-ghost">
                  Cancel
                </Link>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
              {Object.entries(notificationSettings)
                .filter(([key]) => key.startsWith('email'))
                .map(([key, value]) => (
                  <div key={key} className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        {key.replace('email', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={value}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                    </label>
                  </div>
                ))}
              <h3 className="text-lg font-medium mb-3">Push Notifications</h3>
              {Object.entries(notificationSettings)
                .filter(([key]) => key.startsWith('push'))
                .map(([key, value]) => (
                  <div key={key} className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">
                        {key.replace('push', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={value}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                    </label>
                  </div>
                ))}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Profile Visibility</span>
                </label>
                <select
                  className="select select-bordered"
                  value={privacySettings.profileVisibility}
                  onChange={(e) =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      profileVisibility: e.target.value as 'public' | 'private',
                    }))
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Show Email Address</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={privacySettings.showEmail}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        showEmail: e.target.checked,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Show Bio</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={privacySettings.showBio}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        showBio: e.target.checked,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Allow Others to Follow</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={privacySettings.allowFollows}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        allowFollows: e.target.checked,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <form onSubmit={handleAppearanceUpdate} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Theme</span>
                </label>
                <select
                  className="select select-bordered"
                  value={appearanceSettings.theme}
                  onChange={(e) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      theme: e.target.value as 'light' | 'dark' | 'auto',
                    }))
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Font Size</span>
                </label>
                <select
                  className="select select-bordered"
                  value={appearanceSettings.fontSize}
                  onChange={(e) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      fontSize: e.target.value as 'small' | 'medium' | 'large',
                    }))
                  }
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Language</span>
                </label>
                <select
                  className="select select-bordered"
                  value={appearanceSettings.language}
                  onChange={(e) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Articles Per Page</span>
                </label>
                <select
                  className="select select-bordered"
                  value={appearanceSettings.articlesPerPage}
                  onChange={(e) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      articlesPerPage: parseInt(e.target.value),
                    }))
                  }
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Compact View</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={appearanceSettings.compactView}
                    onChange={(e) =>
                      setAppearanceSettings((prev) => ({
                        ...prev,
                        compactView: e.target.checked,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="flex justify-between items-center mt-6">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Save Settings'}
                </button>
                <Link href="/dashboard/profile" className="btn btn-ghost">
                  Cancel
                </Link>
              </div>
            </form>
          )}

          {/* Tokens Tab */}
          {activeTab === 'tokens' && hasTokenAccess() && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">API Tokens</h2>
              <div className="bg-base-200 rounded-lg p-4 mb-8">
                <h3 className="font-semibold mb-3">Create New Token</h3>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="form-control w-full md:w-1/3">
                    <label className="label">
                      <span className="label-text">Duration</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={newTokenDuration}
                      onChange={(e) => setNewTokenDuration(e.target.value)}
                    >
                      {durations.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control w-full md:w-1/3">
                    <label className="label">
                      <span className="label-text">Permission Level</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={newTokenRank}
                      onChange={(e) => setNewTokenRank(e.target.value)}
                    >
                      {getFilteredRankOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control w-full md:w-1/3 md:self-end">
                    <button
                      className="btn btn-primary w-full"
                      onClick={createToken}
                      disabled={isCreatingToken}
                    >
                      {isCreatingToken ? (
                        <>
                          <span className="loading loading-spinner loading-sm mr-2"></span>
                          Creating...
                        </>
                      ) : (
                        'Create Token'
                      )}
                    </button>
                  </div>
                </div>
                {newCreatedToken && (
                  <div className="mt-4 p-3 bg-base-300 rounded-lg">
                    <span className="text-sm text-base-content/70 mb-1">Your new API token:</span>
                    <div className="flex items-center">
                      <code className="text-sm bg-base-100 p-2 rounded flex-1 overflow-x-auto">
                        {newCreatedToken}
                      </code>
                      <button
                        className="btn btn-ghost btn-sm ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(newCreatedToken);
                          showMessage('success', 'Token copied to clipboard!');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-warning mt-2">
                      Copy your token now. You won&#39;t see it again!
                    </p>
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-3">Your Tokens</h3>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : tokens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                    <tr>
                      <th>ID</th>
                      <th>Token</th>
                      <th>Permissions</th>
                      <th>Expires</th>
                      <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tokens.map((token) => (
                      <tr key={token.id}>
                        <td>{token.id}</td>
                        <td>
                          <code className="text-xs">
                            {token.token.substring(0, 10)}...
                            {token.token.substring(token.token.length - 10)}
                          </code>
                        </td>
                        <td>
                          {token.ranks.map((rank) => (
                            <span key={rank.id} className="badge badge-primary badge-sm mr-1">
                                {rank.rank}
                              </span>
                          ))}
                        </td>
                        <td>
                          {new Date(token.expiresAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td>
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => deleteToken(token.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-base-200 p-6 rounded-lg text-center">
                  <p className="text-base-content/70">You don&#39;t have any API tokens yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-error">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Danger Zone
              </h2>
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-error mb-2">Delete Account</h3>
                <p className="text-base-content/70 mb-4">
                  Once you delete your account, there is no going back. All your data will be
                  permanently removed.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-error"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;