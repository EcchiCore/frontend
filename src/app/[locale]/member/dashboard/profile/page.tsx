'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { userApi, ApiError } from '../utils/api';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserLocal } from '@/store/features/auth/authSlice';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

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

  const hasDeveloperRole = user?.roles?.some(role => role?.role?.name === 'DEVELOPER') || false;
  const isAdminOrMod = user?.roles?.some(role => ['ADMIN', 'MODERATOR'].includes(role?.role?.name || '')) || false;

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
    setApplying(true);
    try {
      // 1. Get Token directly from Cookies (Standard way in this project)
      const token = Cookies.get('token');
      if (!token) throw new Error('You must be logged in to apply');

      // 2. Build API URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com';
      const apiPath = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      
      // 3. Direct fetch call
      const response = await fetch(`${apiPath}/developer/generate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      toast.success("Application started! Redirecting...");
      
      // 4. Redirect to settings
      router.push(`/member/dashboard/settings?tab=developer&token=${data.token}`);
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
      {/* Developer Application CTA */}
      {!hasDeveloperRole && !isAdminOrMod && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background overflow-hidden relative shadow-sm">
          <div className="absolute -top-6 -right-6 p-8 opacity-5 pointer-events-none transform rotate-12">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-bold uppercase tracking-wider text-xs">New Opportunity</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">Become a Verified Developer</h2>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Submit your application to start uploading games and mods to ChanomHub.
                </p>
              </div>
              <Button 
                onClick={handleStartApplication} 
                disabled={applying}
                size="lg"
                className="font-bold px-10 shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                {applying ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="h-5 w-5 mr-2" />
                )}
                Start Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Account Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
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
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-muted">
                <AvatarImage src={user.image || undefined} alt={user.username || 'User'} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {user.username?.substring(0, 2).toUpperCase() || 'CH'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-bold text-lg">{user.username}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-medium text-xs uppercase text-muted-foreground">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-foreground font-medium">{user.username}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-xs uppercase text-muted-foreground">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-foreground">{user.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="font-medium text-xs uppercase text-muted-foreground">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg min-h-[6rem]">
                    <p className="text-foreground leading-relaxed">
                      {user.bio || 'No bio provided'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-muted">
                <div className="space-y-2">
                  <Label className="font-medium text-xs uppercase text-muted-foreground">Account Rank</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        user.rank === 'ADMIN' ? 'destructive' :
                          user.rank === 'MODERATOR' ? 'secondary' :
                            user.rank === 'DEVELOPER' ? 'outline' :
                              'default'
                      }
                      className={user.rank === 'DEVELOPER' ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-none' : ''}
                    >
                      {user.rank || 'USER'}
                    </Badge>
                    {hasDeveloperRole && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-normal">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-xs uppercase text-muted-foreground">Member Since</Label>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : 'Unknown'
                      }
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground opacity-50">
                      ID: {user.id}
                    </span>
                  </div>
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
