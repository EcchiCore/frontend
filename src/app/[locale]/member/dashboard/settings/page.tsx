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
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserLocal } from '@/store/features/auth/authSlice';
import { DeveloperSettingsTab } from './DeveloperSettingsTab';
import { Landmark as LandmarkIcon } from 'lucide-react';

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



const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'tokens' | 'developer' | 'danger'
  >('profile');

  // Handle URL parameters for tab switching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'security', 'tokens', 'developer', 'danger'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

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



  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        image: user.image || '',
        backgroundImage: user.backgroundImage || '',
        socialMediaLinks: user.socialMediaLinks || [],
      }));
    }
  }, [user]);

  // Load tokens if on tokens tab
  useEffect(() => {
    if (activeTab === 'tokens' && user) {
      fetchTokens();
    }
  }, [activeTab, user]);

  const fetchTokens = async () => {
    try {
      const response = await userApi.getTokens();
      setTokens(response);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userApi.updateUser({
        username: profileForm.username,
        email: profileForm.email,
        bio: profileForm.bio,
        image: profileForm.image,
        backgroundImage: profileForm.backgroundImage,
        socialMediaLinks: profileForm.socialMediaLinks,
      });
      dispatch(updateUserLocal({
        username: profileForm.username,
        email: profileForm.email,
        bio: profileForm.bio,
        image: profileForm.image,
        backgroundImage: profileForm.backgroundImage,
        socialMediaLinks: profileForm.socialMediaLinks,
      }));
      showMessage('success', 'Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update profile';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await userApi.updatePassword(profileForm.password, profileForm.newPassword);
      setProfileForm((prev) => ({
        ...prev,
        password: '',
        newPassword: '',
        confirmPassword: '',
      }));
      showMessage('success', 'Password updated successfully');
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update password';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    try {
      setLoading(true);
      const response = await userApi.createToken(newTokenDuration, newTokenRank);
      setNewCreatedToken(response.token);
      setIsCreatingToken(false);
      fetchTokens();
      showMessage('success', 'Token created successfully');
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to create token';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteToken = async (tokenId: number) => {
    if (!confirm('Are you sure you want to delete this token?')) return;

    try {
      setLoading(true);
      await userApi.deleteToken(tokenId);
      fetchTokens();
      showMessage('success', 'Token deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to delete token';
      showMessage('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const hasTokenAccess = () => {
    return user?.roles?.some((role) => ['ADMIN', 'MODERATOR'].includes(role?.role?.name || '')) || false;
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

  const hasDeveloperRole = useCallback(() => {
    return user?.roles?.some(role => role?.role?.name === 'DEVELOPER') || false;
  }, [user]);

  // Special logic: Show developer tab ONLY if user IS a dev OR has a verification token in URL
  const shouldShowDeveloperTab = useCallback(() => {
    if (hasDeveloperRole()) return true;
    const hasTokenInUrl = searchParams.has('token');
    const isCurrentlyOnTab = activeTab === 'developer';
    return hasTokenInUrl || isCurrentlyOnTab;
  }, [hasDeveloperRole, searchParams, activeTab]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    ...(shouldShowDeveloperTab() ? [{
      id: 'developer',
      label: 'Developer',
      icon: LandmarkIcon,
      badge: !hasDeveloperRole() ? 'Verification' : null
    }] : []),
    ...(hasTokenAccess() ? [{ id: 'tokens', label: 'API Tokens', icon: KeyIcon }] : []),
    { id: 'danger', label: 'Danger Zone', icon: ExclamationTriangleIcon },
  ] as const;

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
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
    <div className="container mx-auto px-0 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <h2 className="text-xl font-bold px-1 text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Settings
            </h2>
            <Card className="border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                        className={`w-full justify-start relative group transition-all duration-200 ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      >
                        <Icon className={`h-4 w-4 mr-2 transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
                        {tab.label}
                        {(tab as any).badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-[10px] py-0 px-1.5 h-4 bg-primary/20 text-primary border-none shadow-none group-hover:bg-primary/30"
                          >
                            {(tab as any).badge}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
              <AlertDescription>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <Card className="border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/30">
                  <h3 className="text-xl font-bold">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage your public profile information.</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Tell the world about yourself..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Profile Image URL</Label>
                      <Input
                        id="image"
                        value={profileForm.image}
                        onChange={(e) => setProfileForm({ ...profileForm, image: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backgroundImage">Background Image URL</Label>
                      <Input
                        id="backgroundImage"
                        value={profileForm.backgroundImage}
                        onChange={(e) => setProfileForm({ ...profileForm, backgroundImage: e.target.value })}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="font-bold">Social Media Links</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addSocialMediaLink}>
                          Add Link
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {profileForm.socialMediaLinks.map((link, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Platform (e.g. Twitter)"
                              className="flex-1"
                              value={link.platform}
                              onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                            />
                            <Input
                              placeholder="URL"
                              className="flex-2"
                              value={link.url}
                              onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => removeSocialMediaLink(index)}
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">Change your password and manage security preferences.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'developer' && (
            <DeveloperSettingsTab />
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <h3 className="text-xl font-bold">API Tokens</h3>
                    <p className="text-sm text-muted-foreground">Access tokens for external applications.</p>
                  </div>
                  <Button onClick={() => setIsCreatingToken(true)}>Create Token</Button>
                </CardHeader>
                <CardContent>
                  {newCreatedToken && (
                    <Alert className="mb-6 border-primary bg-primary/10">
                      <AlertDescription>
                        <p className="font-bold mb-1 text-primary">New Token Created:</p>
                        <code className="block p-2 bg-background border border-border rounded break-all">{newCreatedToken}</code>
                        <p className="text-xs mt-2 text-muted-foreground font-medium">Please copy this token now. You won't be able to see it again!</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => setNewCreatedToken(null)}
                        >
                          I've copied it
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created At</TableHead>
                        <TableHead>Expires At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens.map((token) => (
                        <TableRow key={token.id}>
                          <TableCell>{new Date(token.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDeleteToken(token.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {tokens.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No API tokens found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'danger' && (
            <Card className="border-destructive/50">
              <CardHeader>
                <h3 className="text-xl font-bold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Irreversible actions concerning your account.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                  <h4 className="font-bold text-destructive mb-1">Delete Account</h4>
                  <p className="text-sm text-destructive/80 mb-4">Once you delete your account, all your articles, mods, and data will be permanently removed.</p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Permanently Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
