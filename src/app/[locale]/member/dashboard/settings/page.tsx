'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Lock,
  Key,
  Landmark,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Globe,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { userApi, ApiError } from '@/lib/api/dashboardApi';
import { SocialMediaLink, Token } from '@/types/dashboard';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { hasRole, getPrimaryRole, sortRolesByHierarchy } from '@/lib/permissions';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveArticleImageUrl } from '@/lib/articleImageUrl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserLocal, fetchUser } from '@/store/features/auth/authSlice';
import { DeveloperSettingsTab } from './DeveloperSettingsTab';
import { useTranslations } from 'next-intl';

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

export default function SettingsPage() {
  const t = useTranslations('ProfileSettings');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<string>('profile');

  // Handle URL parameters for tab switching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'security', 'tokens', 'developer', 'danger'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Handle Patreon connection status from URL
  useEffect(() => {
    const patreonStatus = searchParams.get('patreon');
    if (patreonStatus === 'connected') {
      showMessage('success', 'Successfully connected to Patreon!');
      dispatch(fetchUser());
      const newUrl = window.location.pathname + (searchParams.get('tab') ? `?tab=${searchParams.get('tab')}` : '');
      window.history.replaceState({}, '', newUrl);
    } else if (patreonStatus === 'error') {
      const reason = searchParams.get('reason');
      showMessage('error', reason === 'no_code' ? 'Patreon connection cancelled' : 'Failed to connect to Patreon');
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
  const isAdmin = user?.roles?.includes('ADMIN') || user?.rank === 'ADMIN';

  const availableRoles = useMemo(() => {
    if (isAdmin) {
      return sortRolesByHierarchy(['SUPERADMIN', 'ADMIN', 'MODERATOR', 'DEVELOPER', 'VIP', 'PREMIUM', 'USER']);
    }
    return sortRolesByHierarchy(Array.from(new Set([
      'USER',
      ...(user?.roles || []),
      ...(user?.rank ? [user.rank] : [])
    ])));
  }, [user, isAdmin]);

  useEffect(() => {
    if (availableRoles.length > 0 && !availableRoles.includes(newTokenRank)) {
      setNewTokenRank(availableRoles[0]);
    }
  }, [availableRoles, newTokenRank]);
  const [newCreatedToken, setNewCreatedToken] = useState<string | null>(null);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [passwordSavedSuccess, setPasswordSavedSuccess] = useState(false);

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

  // Sync user data to form
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

  // Load tokens when tokens tab is active
  useEffect(() => {
    if (activeTab === 'tokens' && user) {
      fetchTokens();
    }
  }, [activeTab, user]);

  const fetchTokens = async () => {
    try {
      const response = await userApi.getTokens();
      const tokenList = Array.isArray(response) ? response : ((response as any)?.tokens || []);
      setTokens(tokenList);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      setTokens([]);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      toast.success(text);
    } else {
      toast.error(text);
    }
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    router.replace(`/member/dashboard/settings?tab=${val}`, { scroll: false });
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
      toast.success('Profile updated successfully!');
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 2500);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('New passwords do not match');
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
      toast.success('Password updated successfully!');
      setPasswordSavedSuccess(true);
      setTimeout(() => setPasswordSavedSuccess(false), 2500);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    try {
      setLoading(true);
      const response = await userApi.createToken({
        duration: newTokenDuration,
        roles: [newTokenRank],
        ranks: [newTokenRank]
      });
      setNewCreatedToken(response.token);
      setIsCreatingToken(false);
      fetchTokens();
      toast.success('Token created successfully!');
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to create token';
      toast.error(errorMessage);
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
    return hasRole(user, ['ADMIN', 'MODERATOR', 'DEVELOPER', 'SUPERADMIN']);
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-indigo-400/40 shadow-md">
              <AvatarImage
                src={user?.image ? (resolveArticleImageUrl(user.image) || user.image) : ''}
                alt={user?.username || 'User'}
                className="object-cover"
              />
              <AvatarFallback className="bg-indigo-600 text-white text-xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-white/70 text-sm mt-0.5">
                Manage your identity, security preferences, and developer tools.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-400/30 text-indigo-300 bg-indigo-500/10 px-3 py-1 text-xs">
              Role: {getPrimaryRole(user)}
            </Badge>
          </div>
        </div>
      </div>



      {/* Main Tabs Control */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="bg-card border border-border p-1 rounded-xl h-auto inline-flex min-w-full sm:min-w-0">
            <TabsTrigger value="profile" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm">
              <User className="h-4 w-4" /> Profile & Identity
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            {hasTokenAccess() && (
              <TabsTrigger value="tokens" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm">
                <Key className="h-4 w-4" /> API Tokens
              </TabsTrigger>
            )}
            <TabsTrigger value="developer" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs sm:text-sm">
              <Landmark className="h-4 w-4" /> Developer Portal
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground font-medium text-xs sm:text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Profile Tab Content */}
        <TabsContent value="profile" className="animate-in fade-in-50 duration-200">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Profile Settings
              </CardTitle>
              <CardDescription>
                Customize how your avatar, bio, and social links appear to the community.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="h-11 bg-muted/50 cursor-not-allowed text-muted-foreground"
                    />
                    <p className="text-[11px] text-muted-foreground">Email is tied to your account and cannot be modified.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Biography / About You
                  </Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell the community about yourself..."
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Avatar Image URL
                    </Label>
                    <Input
                      id="image"
                      value={profileForm.image}
                      onChange={(e) => setProfileForm({ ...profileForm, image: e.target.value })}
                      placeholder="https://..."
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundImage" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cover Banner Image URL
                    </Label>
                    <Input
                      id="backgroundImage"
                      value={profileForm.backgroundImage}
                      onChange={(e) => setProfileForm({ ...profileForm, backgroundImage: e.target.value })}
                      placeholder="https://..."
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Patreon Integration Section */}
                <div className="pt-4 border-t border-border/60">
                  <Label className="text-sm font-bold block mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Patreon Supporter Integration
                  </Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-200/50 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/5">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        {(user as any)?.patreonAccount ? (
                          <><ShieldCheck className="h-4 w-4 text-emerald-500" /> Connected to Patreon</>
                        ) : (
                          "Not connected to Patreon"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sync your Patreon account to unlock exclusive perks from creators you support.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-background hover:bg-accent border-amber-300/50 text-amber-700 dark:text-amber-300 font-semibold gap-1.5"
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
                      <ExternalLink className="h-3.5 w-3.5" />
                      {(user as any)?.patreonAccount ? "Reconnect Patreon" : "Connect Patreon"}
                    </Button>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-500" /> Social Media Links
                    </Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialMediaLink} className="gap-1.5 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Add Social Link
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {profileForm.socialMediaLinks.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No social media links added yet.</p>
                    ) : (
                      profileForm.socialMediaLinks.map((link, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="Platform (e.g. Twitter, YouTube)"
                            className="w-1/3 h-10 text-xs"
                            value={link.platform}
                            onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                          />
                          <Input
                            placeholder="Full URL (e.g. https://twitter.com/username)"
                            className="flex-1 h-10 text-xs"
                            value={link.url}
                            onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-10 w-10"
                            onClick={() => removeSocialMediaLink(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || profileSavedSuccess}
                    className={`font-semibold px-6 gap-2 transition-all duration-300 ${
                      profileSavedSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving changes...
                      </>
                    ) : profileSavedSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 animate-bounce" /> Saved!
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Security Tab Content */}
        <TabsContent value="security" className="animate-in fade-in-50 duration-200">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Password & Security
              </CardTitle>
              <CardDescription>
                Ensure your account is protected with a strong, updated password.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="password">Current Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="h-11"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="h-11"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    className="h-11"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || passwordSavedSuccess}
                  className={`font-semibold px-6 gap-2 transition-all duration-300 ${
                    passwordSavedSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : passwordSavedSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 animate-bounce" /> Password Updated!
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. API Tokens Tab Content */}
        {hasTokenAccess() && (
          <TabsContent value="tokens" className="animate-in fade-in-50 duration-200">
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" /> API Access Tokens
                  </CardTitle>
                  <CardDescription>
                    Manage secret keys used for programmatic API access.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreatingToken(!isCreatingToken)} size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create Token
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {isCreatingToken && (
                  <Card className="bg-muted/40 border-primary/20 animate-in fade-in">
                    <CardContent className="pt-6 space-y-4">
                      <h4 className="font-bold text-sm">Generate New API Token</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Token Expiry Duration</Label>
                          <Select value={newTokenDuration} onValueChange={setNewTokenDuration}>
                            <SelectTrigger className="h-10 bg-background">
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
                          <Label className="text-xs">{t('assignedRole')}</Label>
                          <Select value={newTokenRank} onValueChange={setNewTokenRank}>
                            <SelectTrigger className="h-10 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsCreatingToken(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleCreateToken} disabled={loading} className="gap-1.5">
                          {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                          Generate Token
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {newCreatedToken && (
                  <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <AlertTitle className="font-bold">Token Created!</AlertTitle>
                    <AlertDescription className="space-y-2 mt-1">
                      <p className="text-xs">Copy your token now. For security reasons, it will not be shown again.</p>
                      <div className="flex gap-2">
                        <Input readOnly value={newCreatedToken} className="font-mono text-xs h-9 bg-background" />
                        <Button size="sm" variant="outline" className="gap-1 px-3" onClick={() => {
                          navigator.clipboard.writeText(newCreatedToken);
                          showMessage('success', 'Token copied to clipboard');
                        }}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-20">ID</TableHead>
                        <TableHead>Assigned Roles</TableHead>
                        <TableHead>Expires On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(!tokens || !Array.isArray(tokens) || tokens.length === 0) ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                            No active API tokens found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        tokens.map((token) => (
                          <TableRow key={token.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-xs font-semibold">#{token.id}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {token.ranks.map(rank => (
                                  <Badge key={rank.id} variant="secondary" className="text-[10px]">
                                    {rank.rank}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive h-8 w-8"
                                onClick={() => handleDeleteToken(token.id)}
                                title="Revoke Token"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </TabsContent>
        )}

        {/* 4. Developer Tab Content */}
        <TabsContent value="developer" className="animate-in fade-in-50 duration-200">
          <DeveloperSettingsTab />
        </TabsContent>

        {/* 5. Danger Zone Tab Content */}
        <TabsContent value="danger" className="animate-in fade-in-50 duration-200">
          <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
            <CardHeader className="border-b border-destructive/20">
              <CardTitle className="text-xl text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-destructive/80">
                Irreversible actions regarding your account and saved data.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-destructive/30 bg-background">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">Delete Account</h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Permanently remove your profile, game submissions, and associated data from ChanomHub.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading} className="font-semibold gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}