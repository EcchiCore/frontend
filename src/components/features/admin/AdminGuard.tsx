'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const { user, loading } = useAppSelector((state) => state.auth);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            const hasAdminRank = user?.rank === 'ADMIN';
            const hasAdminRole = Array.isArray(user?.roles) && user.roles.some((r: any) =>
                r === 'ADMIN' || r?.name === 'ADMIN'
            );

            if (!user || (!hasAdminRank && !hasAdminRole)) {
                router.push('/member/dashboard');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
