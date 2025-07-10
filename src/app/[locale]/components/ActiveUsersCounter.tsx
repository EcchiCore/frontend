'use client';

import { useState, useEffect } from 'react';

export default function ActiveUsersCounter({ initialCount }: { initialCount: number }) {
  // Use state with a function to prevent hydration mismatch
  const [activeUsers, setActiveUsers] = useState(() => initialCount);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/active-users');
        if (!response.ok) {
          throw new Error('Failed to fetch active users');
        }
        const data = await response.json();
        setActiveUsers(data.activeUsers);
      } catch (error) {
        console.error('Error polling active users:', error);
        // Don't update the state on error to keep showing the last known value
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Convert to string for consistent rendering
  return activeUsers.toString();
}
