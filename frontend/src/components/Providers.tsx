'use client';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/i18n';
import { useAuthStore } from '@/store/authStore';

export default function Providers({ children }: { children: React.ReactNode }) {
    const { initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    );
}
