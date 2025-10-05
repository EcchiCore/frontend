'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { userApi } from '../../utils/api'; // Import userApi

interface ProfileSettingsFormProps {
  formData: {
    username: string;
    email: string;
    bio: string;
    image: string;
    backgroundImage: string;
    password: string;
    shrtflyApiKey: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  formData,
  setFormData,
  setError,
  setSuccessMessage,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Create a payload with only the fields that are being changed.
      const payload: any = { ...formData };
      if (!payload.password) {
        delete payload.password; // Don't send an empty password
      }

      await userApi.updateUser(payload);
      // The success message is now handled by the parent component's `handleProfileUpdateSuccess` function
      // which is passed in as `setSuccessMessage`.
      setSuccessMessage('Profile updated successfully! Refreshing data...');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="image">Profile Image URL</Label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="backgroundImage">Background Image URL</Label>
        <Input
          id="backgroundImage"
          name="backgroundImage"
          value={formData.backgroundImage}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Leave blank to keep current password"
        />
      </div>
      <div>
        <Label htmlFor="shrtflyApiKey">Shrtfly API Key</Label>
        <Input
          id="shrtflyApiKey"
          name="shrtflyApiKey"
          value={formData.shrtflyApiKey}
          onChange={handleChange}
        />
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  );
};

export default ProfileSettingsForm;
