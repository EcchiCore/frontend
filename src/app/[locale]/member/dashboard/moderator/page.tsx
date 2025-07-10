'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online';

interface User {
  username: string;
  ranks: string[];
}

export default function ModeratorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        const cookies = parseCookies();
        const token = cookies.token || '';

        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch user data to verify role
        const response = await fetch(`${API_URL}/api/user`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData: User = (await response.json()).user;

        // Check moderator rank
        if (!userData.ranks.includes('MODERATOR')) {
          if (userData.ranks.includes('ADMIN')) {
            router.push('/admin/dashboard');
          } else if (userData.ranks.includes('USER')) {
            router.push('/user/dashboard');
          } else {
            router.push('/');
          }
          return;
        }
      } catch {
        setError('Authentication failed. Please login again.');
        setTimeout(() => router.push('/login'), 3000);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleStartWork = () => {
    router.push('/moderator/pending-posts');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error shadow-lg max-w-md">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome, Moderator!</h2>
          <p className="text-base-content/70 mb-6">
            Thank you for your dedication to keeping our community safe and engaging.
            Ready to start moderating?
          </p>
          <div className="card-actions justify-center">
            <button className="btn btn-primary btn-lg" onClick={handleStartWork}>
              Start Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}