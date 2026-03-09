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

export async function getSdk() {
    const { token: serverToken, refreshToken: serverRefreshToken } = typeof window !== 'undefined'
        ? { token: undefined, refreshToken: undefined }
        : await getServerAuth();

    const token = typeof window !== 'undefined'
        ? Cookies.get('token')
        : serverToken;

    const refreshToken = typeof window !== 'undefined'
        ? Cookies.get('refreshToken')
        : serverRefreshToken;

    return createChanomhubClient({
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com',
        token: token ?? undefined,
        refreshToken: refreshToken ?? undefined,
        onTokenRefreshed: (newToken, newRefreshToken) => {
            if (typeof window !== 'undefined') {
                Cookies.set('token', newToken, { expires: 7, path: '/' });
                Cookies.set('refreshToken', newRefreshToken, { expires: 7, path: '/' });
            }
            // Note: On server-side, we can't easily set cookies from here in Next.js App Router
            // unless this is a Server Action or Route Handler.
        }
    });
}
