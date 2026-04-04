import { createChanomhubClient } from '@chanomhub/sdk';
import Cookies from 'js-cookie';

// Server-side helper to get token from cookies
async function getServerAuth() {
    if (typeof window === 'undefined') {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        return {
            token: cookieStore.get('token')?.value,
            refreshToken: cookieStore.get('refreshToken')?.value
        };
    }
    return { token: undefined, refreshToken: undefined };
}

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
};

export async function getSdk() {
    let token: string | undefined;
    let refreshToken: string | undefined;

    if (typeof window !== 'undefined') {
        // Client-side: use robust cookie helper
        token = getCookie('token') ?? undefined;
        refreshToken = getCookie('refreshToken') ?? undefined;
    } else {
        // Server-side: use next/headers
        const { token: serverToken, refreshToken: serverRefreshToken } = await getServerAuth();
        token = serverToken;
        refreshToken = serverRefreshToken;
    }

    return createChanomhubClient({
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com',
        token: token,
        refreshToken: refreshToken,
        onTokenRefreshed: (newToken, newRefreshToken) => {
            if (typeof window !== 'undefined') {
                // Use a reliable way to set cookies
                const expires = new Date();
                expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
                document.cookie = `token=${newToken};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
                document.cookie = `refreshToken=${newRefreshToken};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
            }
        }
    });
}
