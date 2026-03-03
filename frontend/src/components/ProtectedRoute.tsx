'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token, initialize } = useAuthStore();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        initialize();
        setMounted(true);
    }, [initialize]);

    useEffect(() => {
        if (mounted && !token) {
            router.push('/login');
        }
    }, [token, mounted, router]);

    if (!mounted || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-blue-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
