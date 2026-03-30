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
            (window as any).__CHANOX2__ = true;

            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === 'CHANOX2_TOKEN_RESPONSE' && event.data.token) {
                    const newToken = String(event.data.token).trim();
                    const oldToken = (Cookies.get('token') || '').trim();
                    if (newToken === oldToken) return;

                    const now = Date.now();
                    if (now - lastReloadRef.current < 5000) return;

                    Cookies.set('token', newToken, { expires: 7, path: '/', sameSite: 'Lax' });
                    const verifiedToken = (Cookies.get('token') || '').trim();
                    if (verifiedToken === newToken) {
                        lastReloadRef.current = now;
                        window.location.reload();
                    }
                }
            };

            window.parent.postMessage({ type: 'CHANOX2_GET_TOKEN' }, '*');

            const handleClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                const link = target.closest('a');
                
                if (link && link.href) {
                    try {
                        const url = new URL(link.href);
                        
                        // --- Smart Link Logic ---
                        
                        // 1. External Links (e.g., Mega, Mediafire, etc.)
                        // Open in a new in-app Electron window (like the "old way")
                        if (url.origin !== window.location.origin) {
                            e.preventDefault();
                            console.log('🔗 Opening external link in a new in-app window:', url.href);
                            window.parent.postMessage({ 
                                type: 'CHANOX2_OPEN_WINDOW', 
                                url: url.href 
                            }, '*');
                            return;
                        }

                        // 2. Internal Article links (to sync app shell)
                        const articleMatch = url.pathname.match(/\/[a-z]{2}\/articles\/([^\/]+)/);
                        if (articleMatch) {
                            e.preventDefault();
                            window.parent.postMessage({ 
                                type: 'CHANOX2_NAVIGATE', 
                                path: `/article/${articleMatch[1]}` 
                                // path without 's' to match app routes if necessary
                            }, '*');
                            return;
                        }

                        // 3. Home/Root links
                        if (url.pathname.match(/\/[a-z]{2}\/home$/) || url.pathname === '/' || url.pathname.match(/\/[a-z]{2}$/)) {
                            e.preventDefault();
                            window.parent.postMessage({ type: 'CHANOX2_NAVIGATE', path: `/` }, '*');
                            return;
                        }

                        // For other internal links, let the iframe navigate normally
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
