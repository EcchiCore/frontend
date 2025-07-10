'use client';

import { useState, useEffect } from 'react';

interface ActiveUsersCounterProps {
  initialCount: number;
}

export default function ActiveUsersCounter({ initialCount }: ActiveUsersCounterProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Random fluctuation between -5 to +5
      const change = Math.floor(Math.random() * 11) - 5;
      setCount(prevCount => {
        const newCount = prevCount + change;
        // Keep count within reasonable bounds (minimum 10, maximum 200)
        return Math.max(10, Math.min(200, newCount));
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return <span>{count}</span>;
}