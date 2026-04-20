'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    // Use state only for triggering re-renders, use immediate check for logic
    const [authTrigger, setAuthTrigger] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isAuthenticated = typeof window !== 'undefined' ? !!localStorage.getItem("auth_token") : false;

    useEffect(() => {
        if (mounted && isAuthenticated && !pathname.startsWith("/profile")) {
            router.replace("/profile");
        }
    }, [mounted, isAuthenticated, pathname, router]);

    // Don't render anything that could flicker until we've checked the auth state on the client
    if (!mounted) return <div className="min-h-screen bg-white" />;

    // If we're logged in and not on profile, we're definitely redirecting
    if (isAuthenticated && !pathname.startsWith("/profile")) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Redirecting to Dashboard...</p>
            </div>
        );
    }

    return <>{children}</>;
}
