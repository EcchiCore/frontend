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
import { userApi, ApiError, getCookie, setCookie } from '../utils/api';
import { DashboardUser, SocialMediaLink, Token } from '../utils/types';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserLocal } from '@/store/features/auth/authSlice';

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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

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
    return user?.rank && ['USER', 'MODERATOR', 'ADMIN'].includes(user.rank);
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


  /* 
  * Conflicting with DashboardLayout hash routing.
  * Disabling hash sync for tabs.
  */

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
    } catch {
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
      dispatch(updateUserLocal(updateData));
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
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h2 className="text-lg font-bold mb-4 text-foreground">Settings</h2>
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
            {/* Preview Section */}
            <Card className="mt-8">
              <CardHeader>
                <h3 className="text-lg font-semibold">Preview</h3>
              </CardHeader>
              <CardContent>
                {activeTab === 'profile' && (
                  <Card>
                    {profileForm.backgroundImage && (
                      <div className="relative h-32 overflow-hidden">
                        <ImageWithFallback
                          src={profileForm.backgroundImage}
                          alt="Profile background"
                          fill
                          style={{ objectFit: 'cover' }}
                          type="nextImage"
                        />
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center mb-4">
                        <Avatar
                          className={`h-24 w-24 ${profileForm.backgroundImage ? '-mt-12' : ''}`}
                        >
                          {profileForm.image ? (
                            <ImageWithFallback src={profileForm.image} alt={profileForm.username} type="avatarImage" />
                          ) : (
                            <AvatarFallback>
                              {profileForm.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h2 className="text-xl font-bold mt-4">{profileForm.username || 'Username'}</h2>
                        <p className="text-sm text-muted-foreground">{profileForm.email || 'email@example.com'}</p>
                      </div>
                      <div className="divider">Bio</div>
                      <p className="whitespace-pre-line">{profileForm.bio || 'No bio provided yet.'}</p>
                    </CardContent>
                  </Card>
                )}
                {activeTab === 'appearance' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Theme Preview</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-primary text-primary-foreground p-2 rounded text-center">Primary</div>
                      <div className="bg-secondary text-secondary-foreground p-2 rounded text-center">Secondary</div>
                      <div className="bg-accent text-accent-foreground p-2 rounded text-center">Accent</div>
                      <div className="bg-muted text-muted-foreground p-2 rounded text-center">Neutral</div>
                    </div>
                    <p><strong>Theme:</strong> {appearanceSettings.theme}</p>
                    <p><strong>Font Size:</strong> {appearanceSettings.fontSize}</p>
                    <p><strong>Language:</strong> {languages.find((l) => l.code === appearanceSettings.language)?.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6 text-foreground">Your Settings</h1>

          {/* Mobile Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="lg:hidden mb-6">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
              {message.type === 'success' ? (
                <CheckIcon className="h-6 w-6" />
              ) : (
                <XMarkIcon className="h-6 w-6" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6 text-foreground">
              <div className="space-y-2">
                <Label htmlFor="image">Profile Picture URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={profileForm.image}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">Background Image URL</Label>
                <Input
                  id="backgroundImage"
                  type="url"
                  value={profileForm.backgroundImage}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, backgroundImage: e.target.value }))}
                  placeholder="https://example.com/background.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="h-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shrtflyApiKey">ShrtFly API Key</Label>
                <Input
                  id="shrtflyApiKey"
                  type="text"
                  value={profileForm.shrtflyApiKey}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, shrtflyApiKey: e.target.value }))}
                  placeholder="ShrtFly API Key"
                />
              </div>
              <div className="space-y-2">
                <Label>Social Media Links</Label>
                {profileForm.socialMediaLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="w-1/3">
                      <Input
                        value={link.platform}
                        onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                        placeholder="Platform (e.g., Twitter)"
                      />
                    </div>
                    <div className="w-2/3">
                      <Input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                        placeholder="URL (e.g., https://twitter.com/username)"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSocialMediaLink(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addSocialMediaLink}
                  className="mt-2"
                >
                  Add Social Media Link
                </Button>
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/profile">Cancel</Link>
                </Button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6 text-foreground">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  minLength={8}
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    'Update Password'
                  )}
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/profile">Cancel</Link>
                </Button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 text-foreground">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              {Object.entries(notificationSettings)
                .filter(([key]) => key.startsWith('email'))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label>{key.replace('email', '').replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              <h3 className="text-lg font-medium mt-6">Push Notifications</h3>
              {Object.entries(notificationSettings)
                .filter(([key]) => key.startsWith('push'))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label>{key.replace('push', '').replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 text-foreground">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      profileVisibility: value as 'public' | 'private',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Email Address</Label>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) =>
                    setPrivacySettings((prev) => ({ ...prev, showEmail: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Bio</Label>
                <Switch
                  checked={privacySettings.showBio}
                  onCheckedChange={(checked) =>
                    setPrivacySettings((prev) => ({ ...prev, showBio: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow Others to Follow</Label>
                <Switch
                  checked={privacySettings.allowFollows}
                  onCheckedChange={(checked) =>
                    setPrivacySettings((prev) => ({ ...prev, allowFollows: checked }))
                  }
                />
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <form onSubmit={handleAppearanceUpdate} className="space-y-6 text-foreground">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={appearanceSettings.theme}
                  onValueChange={(value) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      theme: value as 'light' | 'dark' | 'auto',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select
                  value={appearanceSettings.fontSize}
                  onValueChange={(value) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      fontSize: value as 'small' | 'medium' | 'large',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={appearanceSettings.language}
                  onValueChange={(value) =>
                    setAppearanceSettings((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Articles Per Page</Label>
                <Select
                  value={appearanceSettings.articlesPerPage.toString()}
                  onValueChange={(value) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      articlesPerPage: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select articles per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Compact View</Label>
                <Switch
                  checked={appearanceSettings.compactView}
                  onCheckedChange={(checked) =>
                    setAppearanceSettings((prev) => ({ ...prev, compactView: checked }))
                  }
                />
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/profile">Cancel</Link>
                </Button>
              </div>
            </form>
          )}

          {/* Tokens Tab */}
          {activeTab === 'tokens' && hasTokenAccess() && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">API Tokens</h2>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Create New Token</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select value={newTokenDuration} onValueChange={setNewTokenDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Permission Level</Label>
                      <Select value={newTokenRank} onValueChange={setNewTokenRank}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select permission" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredRankOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={createToken}
                        disabled={isCreatingToken}
                      >
                        {isCreatingToken ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Creating...
                          </>
                        ) : (
                          'Create Token'
                        )}
                      </Button>
                    </div>
                  </div>
                  {newCreatedToken && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground mb-1 block">Your new API token:</span>
                      <div className="flex items-center">
                        <code className="text-sm bg-background p-2 rounded flex-1 overflow-x-auto">
                          {newCreatedToken}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            navigator.clipboard.writeText(newCreatedToken);
                            showMessage('success', 'Token copied to clipboard!');
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-warning mt-2">
                        Copy your token now. You won’t see it again!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <h3 className="font-semibold mt-6 mb-3">Your Tokens</h3>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : tokens.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell>{token.id}</TableCell>
                        <TableCell>
                          <code className="text-xs">
                            {token.token.substring(0, 10)}...
                            {token.token.substring(token.token.length - 10)}
                          </code>
                        </TableCell>
                        <TableCell>
                          {token.ranks.map((rank) => (
                            <span key={rank.id} className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded mr-1">
                              {rank.rank}
                            </span>
                          ))}
                        </TableCell>
                        <TableCell>
                          {new Date(token.expiresAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteToken(token.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">You don’t have any API tokens yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-destructive">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Danger Zone
                </h2>
                <h3 className="text-lg font-medium text-destructive mb-2">Delete Account</h3>
                <p className="text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. All your data will be
                  permanently removed.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    'Delete Account'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;