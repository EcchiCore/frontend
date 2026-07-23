'use client';

import React, { useState } from 'react';
import { useRouter } from "@/i18n/navigation";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { userApi, ApiError } from '@/lib/api/dashboardApi';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, CheckCircle2, ShieldCheck, Coins, Calendar, Globe, Mail, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserLocal } from '@/store/features/auth/authSlice';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { getSdk } from '@/lib/sdk';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    image: user?.image || ''
  });

  const hasDeveloperRole = user?.roles?.some(role => role === 'DEVELOPER') || false;
  const isAdminOrMod = user?.roles?.some(role => ['ADMIN', 'MODERATOR'].includes(role || '')) || false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await userApi.updateUser(formData);

      dispatch(updateUserLocal(formData));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      image: user?.image || ''
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleStartApplication = async () => {
    try {
      setApplying(true);
      const sdk = await getSdk();

      const result = await sdk.developer.startApplication();
      const tokenValue = (result as any)?.token || result;
      Cookies.set('dev_verification_token', tokenValue, { expires: 7 });

      toast.success("Application started! Redirecting...");
      router.push(`/member/dashboard/settings?tab=developer`);
    } catch (err: any) {
      console.error("Application Error:", err);
      toast.error(err.message || "Failed to start application");
    } finally {
      setApplying(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Cover Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
        {/* Cover Background Image */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-primary/30 via-primary/10 to-background relative overflow-hidden">
          {user.backgroundImage ? (
            <img
              src={user.backgroundImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#8b7bf5]/20 via-[#6a5cd4]/20 to-background flex items-center justify-center">
              <Sparkles className="h-24 w-24 text-primary/10 animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-card shadow-2xl rounded-2xl bg-card">
              <AvatarImage src={user.image || ""} alt={user.username || 'User'} className="object-cover rounded-2xl" />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary rounded-2xl">
                {user.username?.substring(0, 2).toUpperCase() || 'CH'}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
                <Badge
                  variant={
                    user.rank === 'ADMIN' ? 'destructive' :
                      user.rank === 'MODERATOR' ? 'secondary' :
                        user.rank === 'DEVELOPER' ? 'outline' :
                          'default'
                  }
                  className={user.rank === 'DEVELOPER' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                >
                  {user.rank || 'USER'}
                </Badge>
                {hasDeveloperRole && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="px-3 py-1.5 gap-2 bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold text-sm">
              <Coins className="h-4 w-4" /> {user.points ?? 0} Points
            </Badge>

            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Developer Application Banner */}
      {!hasDeveloperRole && !isAdminOrMod && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-background to-background overflow-hidden relative shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-bold uppercase tracking-wider text-xs">Developer Access</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">Become a Verified Developer</h2>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Submit your application to start uploading games, mods, and articles to ChanomHub.
                </p>
              </div>
              <Button 
                onClick={handleStartApplication} 
                disabled={applying}
                size="lg"
                className="font-bold px-8 shadow-md shadow-primary/20 hover:scale-105 transition-all"
              >
                {applying ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="h-5 w-5 mr-2" />
                )}
                Apply Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Details Grid */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" /> Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs uppercase text-muted-foreground font-semibold">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg text-foreground font-medium">
                    {user.username}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase text-muted-foreground font-semibold">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg text-foreground font-medium">
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs uppercase text-muted-foreground font-semibold">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg min-h-[5rem] text-foreground leading-relaxed">
                  {user.bio || 'No bio provided yet.'}
                </div>
              )}
            </div>

            {/* Social Media & Joined Metadata */}
            <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> Social Media Links
                </Label>
                {user.socialMediaLinks && user.socialMediaLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.socialMediaLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-muted hover:bg-accent rounded-full text-xs font-medium text-foreground transition-colors"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No social links added</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Account Details
                </Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Member since: <span className="text-foreground font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span></p>
                  <p className="font-mono opacity-60">ID: #{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
