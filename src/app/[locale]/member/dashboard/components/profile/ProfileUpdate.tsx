'use client';

import React, { useState } from 'react';
import { DashboardUser } from '../types';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface User {
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
  backgroundImage: string | null;
  shrtflyApiKey: string | null;
  socialMediaLinks: SocialMediaLink[];
}

interface ProfileUpdateProps {
  user: DashboardUser;
  onUpdate: (updatedUser: DashboardUser) => void;
  onCancel: () => void;
}

const ProfileUpdate: React.FC<ProfileUpdateProps> = ({ user, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState<User>({
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    image: user.image || '',
    backgroundImage: user.backgroundImage || '',
    shrtflyApiKey: user.shrtflyApiKey || '',
    socialMediaLinks: user.socialMediaLinks || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialMediaChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newSocialMediaLinks = [...formData.socialMediaLinks];
    newSocialMediaLinks[index] = { ...newSocialMediaLinks[index], [name]: value };
    setFormData(prev => ({ ...prev, socialMediaLinks: newSocialMediaLinks }));
  };

  const handleAddSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: [...prev.socialMediaLinks, { platform: '', url: '' }]
    }));
  };

  const handleRemoveSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.filter((_, i) => i !== index)
    }));
  };

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${apiUrl}/api/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: formData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      onUpdate(data.user);
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <div className="card bg-base-100 shadow-xl max-w-lg mx-auto mt-6">
      <div className="card-body">
        <h2 className="card-title">Update Profile</h2>
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Bio</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows={4}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Profile Image URL</span>
            </label>
            <input
              type="text"
              name="image"
              value={formData.image || ''}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Background Image URL</span>
            </label>
            <input
              type="text"
              name="backgroundImage"
              value={formData.backgroundImage || ''}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="https://example.com/background.jpg"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Shrtfly API Key</span>
            </label>
            <input
              type="text"
              name="shrtflyApiKey"
              value={formData.shrtflyApiKey || ''}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Your Shrtfly API Key"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Social Media Links</span>
            </label>
            <div className="space-y-2">
              {formData.socialMediaLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    name="platform"
                    value={link.platform}
                    onChange={(e) => handleSocialMediaChange(index, e)}
                    className="input input-bordered w-1/3"
                    placeholder="Platform (e.g., Twitter)"
                  />
                  <input
                    type="text"
                    name="url"
                    value={link.url}
                    onChange={(e) => handleSocialMediaChange(index, e)}
                    className="input input-bordered w-2/3"
                    placeholder="URL (e.g., https://twitter.com/yourhandle)"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialMedia(index)}
                    className="btn btn-error btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddSocialMedia}
              className="btn btn-outline btn-success mt-2"
            >
              Add Social Media Link
            </button>
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="btn btn-outline btn-error"
              onClick={onCancel}
              disabled={loading}
            >
              <XCircleIcon className="h-5 w-5" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <CheckCircleIcon className="h-5 w-5" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        {success && (
          <div className="toast toast-end">
            <div className="alert alert-success">
              <span>Profile updated successfully</span>
              <button className="btn btn-ghost btn-sm" onClick={handleCloseSnackbar}>
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileUpdate;