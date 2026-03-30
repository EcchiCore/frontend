"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useRef } from 'react';
import Cookies from 'js-cookie';

function AppBridgeContent() {
    const searchParams = useSearchParams();
    const isApp = searchParams.get('app') === 'chanox2';
    const lastReloadRef = useRef<number>(0);

    useEffect(() => {
        if (isApp) {
            document.documentElement.classList.add('is-app-chanox2');
            
            // Set a global flag for other components to check
            (window as any).__CHANOX2__ = true;

            const handleMessage = (event: MessageEvent) => {
                // Handle token response from ChanoX2
                if (event.data?.type === 'CHANOX2_TOKEN_RESPONSE' && event.data.token) {
                    const newToken = String(event.data.token).trim();
                    const oldToken = (Cookies.get('token') || '').trim();

                    // 1. If tokens are exactly the same, do nothing
                    if (newToken === oldToken) {
                        return;
                    }

                    // 2. Loop prevention: Don't reload more than once every 5 seconds
                    const now = Date.now();
                    if (now - lastReloadRef.current < 5000) {
                        return;
                    }

                    console.log('🔑 Token mismatch detected. Updating session...');
                    
                    // 3. Update cookie with explicit domain/path to ensure it's readable
                    Cookies.set('token', newToken, { 
                        expires: 7, 
                        path: '/',
                        sameSite: 'Lax'
                    });

                    // Verify if cookie was actually set before reloading
                    const verifiedToken = (Cookies.get('token') || '').trim();
                    if (verifiedToken === newToken) {
                        lastReloadRef.current = now;
                        console.log('🔄 Session updated, reloading page...');
                        window.location.reload();
                    } else {
                        console.error('❌ Failed to set auth cookie');
                    }
                }
            };

            // Request token from ChanoX2
            window.parent.postMessage({ type: 'CHANOX2_GET_TOKEN' }, '*');

            // Handle link clicks
            const handleClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                const link = target.closest('a');
                if (link && link.href) {
                    try {
                        const url = new URL(link.href);
                        if (url.origin === window.location.origin) {
                            const articleMatch = url.pathname.match(/\/[a-z]{2}\/articles\/([^\/]+)/);
                            if (articleMatch) {
                                e.preventDefault();
                                window.parent.postMessage({ type: 'CHANOX2_NAVIGATE', path: `/article/${articleMatch[1]}` }, '*');
                            } else if (url.pathname.match(/\/[a-z]{2}\/home$/) || url.pathname === '/' || url.pathname.match(/\/[a-z]{2}$/)) {
                                e.preventDefault();
                                window.parent.postMessage({ type: 'CHANOX2_NAVIGATE', path: `/` }, '*');
                            }
                        }
                    } catch (err) {}
                }
            };

            window.addEventListener('message', handleMessage);
            document.addEventListener('click', handleClick);
            
            return () => {
                window.removeEventListener('message', handleMessage);
                document.removeEventListener('click', handleClick);
            };
        }
    }, [isApp]);

    return null;
}

export default function AppBridge() {
    return (
        <Suspense fallback={null}>
            <AppBridgeContent />
        </Suspense>
    );
}
