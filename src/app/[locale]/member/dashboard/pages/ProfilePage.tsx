'use client';

import React, { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  CalendarIcon,
  ShieldCheckIcon,
  StarIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuthContext } from '../providers/AuthProvider';
import { userApi, ApiError } from '../utils/api';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, TrendingUp, Users, FileText, Calendar, Award } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    image: user?.image || ''
  });

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

      updateUser(formData);
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
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Profile Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Manage your account settings and profile information</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="border-2 hover:bg-muted/50 transition-all duration-200"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Profile Card */}
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardContent className="p-0">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>
            
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center lg:items-start space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    <Avatar className="relative w-36 h-36 border-4 border-white dark:border-gray-800 shadow-xl">
                      <AvatarImage 
                        src={user.image || undefined} 
                        alt={user.username || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {!isEditing && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="w-full max-w-xs space-y-3">
                      <Label htmlFor="image" className="text-sm font-medium text-muted-foreground">
                        Profile Image URL
                      </Label>
                      <div className="flex">
                        <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                          <PhotoIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <Input
                          id="image"
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          className="rounded-l-none border-l-0 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Information */}
                <div className="flex-1 space-y-8">
                  {/* User Display Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.username}
                      </h2>
                      <Badge 
                        variant={
                          user.rank === 'ADMIN' ? 'destructive' :
                          user.rank === 'MODERATOR' ? 'secondary' :
                          'default'
                        }
                        className="text-xs font-semibold px-3 py-1"
                      >
                        {user.rank || 'MEMBER'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      {user.bio || 'No bio provided. Tell us about yourself!'}
                    </p>
                  </div>

                  <Separator className="my-6" />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Username
                      </Label>
                      {isEditing ? (
                        <div className="flex">
                          <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <Input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="rounded-l-none border-l-0 focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4" />
                        Email Address
                      </Label>
                      {isEditing ? (
                        <div className="flex">
                          <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                            <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="rounded-l-none border-l-0 focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                          <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4" />
                      Bio
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="min-h-[120px] focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 min-h-[6rem]">
                        <p className="text-gray-900 dark:text-white leading-relaxed">
                          {user.bio || 'No bio provided. Tell us about yourself!'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Account Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4" />
                        Account Rank
                      </Label>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                        <Badge 
                          variant={
                            user.rank === 'ADMIN' ? 'destructive' :
                            user.rank === 'MODERATOR' ? 'secondary' :
                            'default'
                          }
                          className="text-sm font-semibold px-3 py-1"
                        >
                          {user.rank || 'MEMBER'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Member Since
                      </Label>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Articles</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">12</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">+2 this month</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Likes</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">247</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">+15 this week</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <HeartIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Followers</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">89</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">+3 this week</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Rank Score</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">1,234</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70">+45 this month</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};