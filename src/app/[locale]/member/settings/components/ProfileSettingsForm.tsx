import { useState, FormEvent } from 'react';
import Link from 'next/link';

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface ProfileSettingsFormProps {
  formData: {
    username: string;
    email: string;
    bio: string;
    image: string;
    backgroundImage: string;
    shrtflyApiKey: string;
    password: string;
    socialMediaLinks?: SocialMediaLink[];
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      username: string;
      email: string;
      bio: string;
      image: string;
      backgroundImage: string;
      shrtflyApiKey: string;
      password: string;
      socialMediaLinks?: SocialMediaLink[];
    }>
  >;
  token: string | null;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

export default function ProfileSettingsForm({
                                              formData,
                                              setFormData,
                                              token,
                                              setError,
                                              setSuccessMessage,
                                            }: ProfileSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Ensure socialMediaLinks is always an array
  const socialMediaLinks = formData.socialMediaLinks || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (
    index: number,
    field: keyof SocialMediaLink,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedLinks = [...(prev.socialMediaLinks || [])];
      updatedLinks[index] = { ...updatedLinks[index], [field]: value };
      return { ...prev, socialMediaLinks: updatedLinks };
    });
  };

  const addSocialMediaLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: [...(prev.socialMediaLinks || []), { platform: '', url: '' }],
    }));
  };

  const removeSocialMediaLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: (prev.socialMediaLinks || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const userData: Record<string, any> = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        image: formData.image,
        backgroundImage: formData.backgroundImage,
        shrtflyApiKey: formData.shrtflyApiKey,
        socialMediaLinks,
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: userData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing form fields */}
      <div className="form-control mb-4">
        <label className="label" htmlFor="image">
          <span className="label-text">Profile Picture URL</span>
        </label>
        <input
          id="image"
          name="image"
          type="text"
          value={formData.image}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          placeholder="URL of profile picture"
        />
      </div>

      <div className="form-control mb-4">
        <label className="label" htmlFor="backgroundImage">
          <span className="label-text">Profile Background Image URL</span>
        </label>
        <input
          id="backgroundImage"
          name="backgroundImage"
          type="text"
          value={formData.backgroundImage}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          placeholder="URL of background image"
        />
        <div className="text-xs mt-1 opacity-70">
          This image will appear as a background on your profile page.
        </div>
      </div>

      <div className="form-control mb-4">
        <label className="label" htmlFor="username">
          <span className="label-text">Username</span>
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          required
        />
      </div>

      <div className="form-control mb-4">
        <label className="label" htmlFor="shrtflyApiKey">
          <span className="label-text">ShrtFly API Key</span>
        </label>
        <input
          id="shrtflyApiKey"
          name="shrtflyApiKey"
          type="text"
          value={formData.shrtflyApiKey}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          placeholder="ShrtFly API Key"
        />
        <div className="text-xs mt-1 opacity-70">
          This is used for URL shortening. You can find your API key in your{' '}
          <a
            href="https://shrtfly.com/ref/dayfree"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover text-blue-500"
          >
            ShrtFly account settings
          </a>.
        </div>
      </div>

      <div className="form-control mb-4">
        <label className="label" htmlFor="email">
          <span className="label-text">Email</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          required
        />
      </div>

      <div className="form-control mb-4">
        <label className="label" htmlFor="bio">
          <span className="label-text">Bio</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="textarea textarea-bordered w-full"
          rows={4}
          placeholder="Tell us about yourself"
        />
      </div>

      <div className="form-control mb-4">
        <label className="label" htmlFor="password">
          <span className="label-text">New Password (leave blank to keep current)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          className="input input-bordered w-full"
          placeholder="New password"
        />
      </div>

      {/* Social Media Links Section */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Social Media Links</span>
        </label>
        {socialMediaLinks.map((link, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={link.platform}
              onChange={(e) =>
                handleSocialMediaChange(index, 'platform', e.target.value)
              }
              className="input input-bordered w-1/3"
              placeholder="Platform (e.g., Twitter)"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
              className="input input-bordered w-2/3"
              placeholder="URL (e.g., https://twitter.com/username)"
            />
            <button
              type="button"
              onClick={() => removeSocialMediaLink(index)}
              className="btn btn-error btn-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSocialMediaLink}
          className="btn btn-secondary btn-sm mt-2"
        >
          Add Social Media Link
        </button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button type="submit" disabled={isSaving} className="btn btn-primary">
          {isSaving ? <span className="loading loading-spinner loading-xs"></span> : null}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
        <Link href="/profile" className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}