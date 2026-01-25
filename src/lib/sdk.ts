import { createChanomhubClient } from '@chanomhub/sdk';
import Cookies from 'js-cookie';

// Server-side helper to get token from cookies
async function getServerToken() {
    if (typeof window === 'undefined') {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        return cookieStore.get('token')?.value;
    }
    return undefined;
}

export async function getSdk() {
    const token = typeof window !== 'undefined'
        ? Cookies.get('token')
        : await getServerToken();

    return createChanomhubClient({
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com',
        token, // Optional: only if user is logged in
    });
}
