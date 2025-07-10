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
import { useAuthContext } from '../providers/AuthProvider';
import { userApi, ApiError } from '../utils/api';
import Image from 'next/image';
import myImageLoader from "../../../lib/imageLoader";

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
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Profile</h1>
          <p className="text-base-content/70">Manage your account settings and profile information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="btn btn-success"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                Save
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={loading}
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="avatar">
                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.username}
                      loader={myImageLoader}
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">Profile Image URL</span>
                  </label>
                  <div className="input-group">
                    <span className="bg-base-300">
                      <PhotoIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="input input-bordered flex-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Username</span>
                  </label>
                  {isEditing ? (
                    <div className="input-group">
                      <span className="bg-base-300">
                        <UserIcon className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="input input-bordered flex-1"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-300 rounded-lg">
                      <UserIcon className="h-4 w-4 text-base-content/70" />
                      <span>{user.username}</span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  {isEditing ? (
                    <div className="input-group">
                      <span className="bg-base-300">
                        <EnvelopeIcon className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input input-bordered flex-1"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-base-300 rounded-lg">
                      <EnvelopeIcon className="h-4 w-4 text-base-content/70" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-24"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="p-3 bg-base-300 rounded-lg min-h-[6rem]">
                    <p className="text-base-content/90">
                      {user.bio || 'No bio provided'}
                    </p>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Account Rank</span>
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-base-300 rounded-lg">
                    <div className={`badge ${
                      user.rank
                        ? user.rank === 'ADMIN'
                          ? 'badge-error'
                          : user.rank === 'MODERATOR'
                            ? 'badge-warning'
                            : 'badge-info'
                        : 'badge-info'
                    }`}>
                      {user.rank || 'No rank'} {/* Changed to use user.rank */}
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Member Since</span>
                  </label>
                  <div className="p-3 bg-base-300 rounded-lg">
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
        </div>
      </div>
    </div>
  );
};