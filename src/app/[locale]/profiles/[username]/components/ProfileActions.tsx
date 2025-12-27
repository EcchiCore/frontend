'use client';

import { useState } from 'react';

interface ProfileActionsProps {
    username: string;
    isFollowing: boolean;
    onFollow?: () => void;
}

export default function ProfileActions({
    username,
    isFollowing,
    onFollow,
}: ProfileActionsProps) {
    const [following, setFollowing] = useState(isFollowing);
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        setLoading(true);
        try {
            // TODO: Implement actual follow API call
            setFollowing(!following);
            onFollow?.();
        } catch (error) {
            console.error('Failed to follow:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center gap-3 mt-6">
            <button
                onClick={handleFollow}
                disabled={loading}
                className={`
          px-6 py-2.5 rounded-full font-semibold text-sm
          transition-all duration-300 ease-out
          ${following
                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                        : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/25'
                    }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
            >
                {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : following ? (
                    'Following'
                ) : (
                    'Follow'
                )}
            </button>
            <button
                className="
          px-6 py-2.5 rounded-full font-semibold text-sm
          bg-white/10 text-white border border-white/20
          hover:bg-white/20 transition-all duration-300
        "
            >
                Message
            </button>
        </div>
    );
}
