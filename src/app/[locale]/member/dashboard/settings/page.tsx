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
import { userApi, ApiError, getCookie, setCookie } from '@/lib/api/dashboardApi';
import { DashboardUser, SocialMediaLink, Token } from '@/types/dashboard';
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
import { updateUserLocal, fetchUser } from '@/store/features/auth/authSlice';
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

  // Handle Patreon connection status from URL
  useEffect(() => {
    const patreonStatus = searchParams.get('patreon');
    if (patreonStatus === 'connected') {
      showMessage('success', 'Successfully connected to Patreon!');
      // Refresh user data to get the new patreonAccount info
      dispatch(fetchUser());
      
      // Clean up URL
      const newUrl = window.location.pathname + (searchParams.get('tab') ? `?tab=${searchParams.get('tab')}` : '');
      window.history.replaceState({}, '', newUrl);
    } else if (patreonStatus === 'error') {
      const reason = searchParams.get('reason');
      showMessage('error', reason === 'no_code' ? 'Patreon connection cancelled' : 'Failed to connect to Patreon');
      
      // Clean up URL
      const newUrl = window.location.pathname + (searchParams.get('tab') ? `?tab=${searchParams.get('tab')}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, dispatch]);

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
      await userApi.updatePassword({
        currentPassword: profileForm.password,
        newPassword: profileForm.newPassword
      });
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
      const response = await userApi.createToken({
        duration: newTokenDuration,
        ranks: [newTokenRank]
      });
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
    return user?.roles?.some((role) => ['ADMIN', 'MODERATOR'].includes(role || '')) || false;
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
    const newLinks = [...profileForm.socialMediaLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setProfileForm({ ...profileForm, socialMediaLinks: newLinks });
  };

  const addSocialMediaLink = () => {
    setProfileForm({
      ...profileForm,
      socialMediaLinks: [...profileForm.socialMediaLinks, { platform: '', url: '' }],
    });
  };

  const removeSocialMediaLink = (index: number) => {
    const newLinks = profileForm.socialMediaLinks.filter((_, i) => i !== index);
    setProfileForm({ ...profileForm, socialMediaLinks: newLinks });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    { id: 'tokens', label: 'API Tokens', icon: KeyIcon, hidden: !hasTokenAccess() },
    { id: 'developer', label: 'Developer', icon: LandmarkIcon },
    { id: 'danger', label: 'Danger Zone', icon: ExclamationTriangleIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card className="border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center mb-6 pt-4">
                  <Avatar className="h-24 w-24 border-2 border-primary shadow-lg mb-4">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user?.username}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <nav className="space-y-1">
                  {tabs.filter(tab => !tab.hidden).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3 h-11"
                        onClick={() => setActiveTab(tab.id as any)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                        {(tab as any).badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-[10px] px-1.5 py-0"
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
                      <Label className="font-bold block mb-2">Patreon Integration</Label>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-amber-200 bg-amber-50/30 dark:border-amber-500/10 dark:bg-amber-500/5">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                            {(user as any)?.patreonAccount ? (
                              <><CheckIcon className="h-4 w-4 text-green-500" /> Connected to Patreon</>
                            ) : (
                              "Not connected to Patreon"
                            )}
                          </p>
                          <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70">
                            Connect your Patreon to unlock exclusive content from creators you support.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-amber-50 border-amber-200 text-amber-700 font-bold"
                          onClick={async () => {
                            try {
                              const sdk = await (await import('@/lib/sdk')).getSdk();
                              const { url } = await sdk.patreon.getAuthUrl();
                              if (url) window.location.href = url;
                            } catch (e) {
                              showMessage('error', "Failed to start Patreon connection");
                            }
                          }}
                        >
                          {(user as any)?.patreonAccount ? "Reconnect Patreon" : "Connect Patreon"}
                        </Button>
                      </div>
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
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold">Security</h3>
                  <p className="text-sm text-muted-foreground">Manage your password and account security.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Current Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">API Tokens</h3>
                    <p className="text-sm text-muted-foreground">Access the Chanomhub API with these tokens.</p>
                  </div>
                  <Button onClick={() => setIsCreatingToken(true)}>Create Token</Button>
                </CardHeader>
                <CardContent>
                  {isCreatingToken && (
                    <Card className="mb-6 bg-muted/50">
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select value={newTokenDuration} onValueChange={setNewTokenDuration}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1d">1 Day</SelectItem>
                                <SelectItem value="7d">7 Days</SelectItem>
                                <SelectItem value="30d">30 Days</SelectItem>
                                <SelectItem value="90d">90 Days</SelectItem>
                                <SelectItem value="365d">1 Year</SelectItem>
                                <SelectItem value="never">Never Expires</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Initial Rank</Label>
                            <Select value={newTokenRank} onValueChange={setNewTokenRank}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="PREMIUM">Premium</SelectItem>
                                <SelectItem value="VIP">VIP</SelectItem>
                                <SelectItem value="DEVELOPER">Developer</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleCreateToken} disabled={loading}>
                            {loading ? 'Creating...' : 'Generate Token'}
                          </Button>
                          <Button variant="ghost" onClick={() => setIsCreatingToken(false)}>Cancel</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {newCreatedToken && (
                    <Alert className="mb-6 bg-green-500/10 border-green-500/50">
                      <AlertDescription className="space-y-2">
                        <p className="font-bold text-green-700 dark:text-green-400">Token created! Copy it now, you won't see it again:</p>
                        <div className="flex gap-2">
                          <Input readOnly value={newCreatedToken} className="font-mono text-xs" />
                          <Button size="sm" onClick={() => {
                            navigator.clipboard.writeText(newCreatedToken);
                            showMessage('success', 'Token copied to clipboard');
                          }}>Copy</Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Ranks</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tokens.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No API tokens found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          tokens.map((token) => (
                            <TableRow key={token.id}>
                              <TableCell className="font-mono text-xs">#{token.id}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {token.ranks.map(rank => (
                                    <Badge key={rank.id} variant="outline" className="text-[10px]">
                                      {rank.rank}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive h-8 w-8"
                                  onClick={() => handleDeleteToken(token.id)}
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <DeveloperSettingsTab />
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <Card className="border-destructive/50">
                <CardHeader>
                  <h3 className="text-xl font-bold text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Irreversible and destructive actions.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <h4 className="font-bold mb-1">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete My Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;