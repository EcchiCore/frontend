"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Cookies from 'js-cookie';

function AppBridgeContent() {
    const searchParams = useSearchParams();
    const isApp = searchParams.get('app') === 'chanox2';

    useEffect(() => {
        if (isApp) {
            document.documentElement.classList.add('is-app-chanox2');
            
            // Log that we are in ChanoX2 mode
            console.log('🎮 ChanoX2 Mode Enabled');
            
            // Set a global flag for other components to check
            (window as any).__CHANOX2__ = true;

            // Handle messages from ChanoX2 parent
            const handleMessage = (event: MessageEvent) => {
                // Handle token response from ChanoX2
                if (event.data?.type === 'CHANOX2_TOKEN_RESPONSE' && event.data.token) {
                    const newToken = event.data.token;
                    const oldToken = Cookies.get('token');

                    // If token is new or changed, set it and REFRESH to update SSR state
                    if (newToken !== oldToken) {
                        console.log('🔑 New token received, updating session...');
                        Cookies.set('token', newToken, { expires: 7, path: '/' });
                        
                        // Small delay to ensure cookie is written, then reload
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                }
            };

            // Request token from ChanoX2 on mount
            window.parent.postMessage({ type: 'CHANOX2_GET_TOKEN' }, '*');

            // Intercept link clicks to navigate the parent app
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
                                window.parent.postMessage({ 
                                    type: 'CHANOX2_NAVIGATE', 
                                    path: `/article/${articleMatch[1]}` 
                                }, '*');
                                return;
                            }
                            if (url.pathname.match(/\/[a-z]{2}\/home$/) || url.pathname === '/' || url.pathname.match(/\/[a-z]{2}$/)) {
                                e.preventDefault();
                                window.parent.postMessage({ type: 'CHANOX2_NAVIGATE', path: `/` }, '*');
                                return;
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
