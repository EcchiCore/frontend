'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const UserClientComponent = dynamic(() => import('./UserClientComponent'), { 
  ssr: false 
});

const UserPage = () => {
  return <UserClientComponent />;
};

export default UserPage;