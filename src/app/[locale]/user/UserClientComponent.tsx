'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "@/i18n/navigation";
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';

interface UserData {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

const UserClientComponent = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const t = useTranslations('UserClient');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const jwt = Cookies.get('jwt');
    if (!jwt) {
      router.push('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:1337/api/users/me', {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/');
      }
    };

    fetchUserData();
  }, [router, mounted]);

  if (!mounted || !userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
  <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full text-center">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      {t('welcome', { username: userData.username })}
    </h2>
    <p className="text-gray-600 mb-2">{t('email')} {userData.email}</p>
    <p className="text-gray-500 text-sm">
      {t('accountCreated')} {new Date(userData.createdAt).toLocaleDateString()}
    </p>
    <p className="text-gray-500 text-sm">
      {t('lastUpdated')} {new Date(userData.updatedAt).toLocaleDateString()}
    </p>
    <p className="text-red-500 font-medium mt-4">
      {t('notComplete')}
    </p>
  </div>
</div>

  );
};

export default UserClientComponent;
