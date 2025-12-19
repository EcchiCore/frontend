'use client';

import React, { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
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
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserLocal } from '@/store/features/auth/authSlice';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and profile information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckIcon className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
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
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.username || undefined}
                />
                <AvatarFallback className="text-4xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <div className="w-full max-w-xs space-y-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <div className="flex">
                    <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                      <PhotoIcon className="h-4 w-4" />
                    </div>
                    <Input
                      id="image"
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-medium">Username</Label>
                  {isEditing ? (
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <Input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="rounded-l-none"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{user.username}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email</Label>
                  {isEditing ? (
                    <div className="flex">
                      <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                        <EnvelopeIcon className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="rounded-l-none"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="font-medium">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-lg min-h-[6rem]">
                    <p className="text-foreground">
                      {user.bio || 'No bio provided'}
                    </p>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium">Account Rank</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Badge
                      variant={
                        user.rank === 'ADMIN' ? 'destructive' :
                          user.rank === 'MODERATOR' ? 'secondary' :
                            'default'
                      }
                    >
                      {user.rank || 'No rank'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Member Since</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'Unknown'
                      }
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
