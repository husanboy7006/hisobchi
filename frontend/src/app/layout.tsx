import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hisobchi',
  description: 'Kichik biznes uchun savdo va hisob tizimi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="light">
      <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-gray-100 antialiased selection:bg-blue-200 dark:selection:bg-blue-900/40`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-slate-700',
              duration: 3500,
              style: {
                background: '#fff',
                color: '#1f2937',
                padding: '16px 20px',
                borderRadius: '16px',
                fontWeight: '700',
                fontSize: '14px'
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
                style: { borderLeft: '4px solid #10b981' }
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                style: { borderLeft: '4px solid #ef4444' }
              }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
