// src/app/profiles/[username]/ProfileClient.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface Profile {
  username: string;
  following: boolean;
  bio?: string | null;
  image?: string | null;
  backgroundImage?: string | null;
  socialMediaLinks?: SocialMediaLink[]; // Added socialMediaLinks
}

interface TokenPayload {
  username: string;
  sub: number;
  rank: string;
  iat: number;
  exp: number;
}

export default function ProfileClient({ profile }: Readonly<{ profile: Profile }>) {
  const [following, setFollowing] = useState(profile.following);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));

    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      try {
        const decodedToken = jwt.decode(token);
        if (decodedToken && typeof decodedToken === 'object' && 'username' in decodedToken) {
          const tokenPayload = decodedToken as jwt.JwtPayload & TokenPayload;
          if (tokenPayload.username === profile.username) {
            setIsOwnProfile(true);
          }
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [profile.username]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profile.username}/follow`, {
        method: following ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setFollowing(!following);
      } else if (res.status === 401) {
        router.push("/login");
      } else {
        console.error("Failed to toggle follow status");
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (isOwnProfile) {
    return (
      <div className="card-actions justify-center mt-6">
        <button
          className="btn btn-outline btn-wide"
          onClick={() => router.push('/member/settings')}
        >
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <div className="card-actions justify-center mt-6">
      <button
        className={`btn ${following ? 'btn-error' : 'btn-primary'} btn-wide`}
        onClick={handleFollowToggle}
      >
        {following ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
}