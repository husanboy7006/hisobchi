'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token, initialize } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    if (!token) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a proper loading spinner
    }

    return <>{children}</>;
}
