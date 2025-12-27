'use client';

interface ProfileStatsProps {
    postsCount: number;
    followersCount?: number;
    followingCount?: number;
}

export default function ProfileStats({
    postsCount,
    followersCount = 0,
    followingCount = 0,
}: ProfileStatsProps) {
    const stats = [
        { label: 'Posts', value: postsCount },
        { label: 'Followers', value: followersCount },
        { label: 'Following', value: followingCount },
    ];

    return (
        <div className="flex justify-center gap-8 py-4">
            {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
