'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "@/i18n/navigation";
import { useAppSelector } from '@/store/hooks';
import { Loader2 } from 'lucide-react';
import { hasRole } from '@/lib/permissions';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const { user, loading } = useAppSelector((state) => state.auth);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || !hasRole(user, ['ADMIN', 'SUPERADMIN'])) {
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
