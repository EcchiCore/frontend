'use client';

import { useState, useEffect } from 'react';

interface ActiveUsersCounterProps {
  initialCount: number;
}

export default function ActiveUsersCounter({ initialCount }: ActiveUsersCounterProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 11) - 5;
      setCount(prevCount => {
        const newCount = prevCount + change;
        return Math.max(10, Math.min(200, newCount));
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block">
      <span className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-500 blur opacity-30"></span>
      <span className="relative text-teal-300 font-semibold">{count}</span>
    </span>
  );
}