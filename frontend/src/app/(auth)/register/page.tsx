'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [sector, setSector] = useState('bozor');
    const [loading, setLoading] = useState(false);

    const { setToken, setUser } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                phone, password, sector,
                first_name: firstName,
                last_name: lastName,
                business_name: businessName
            });
            setToken(data.token);
            setUser(data.user);
            toast.success(t('register') + ' muvaffaqiyatli');
            router.push('/dashboard');
        } catch (error: any) {
            const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : null);
            if (msg === 'User already exists') {
                toast.error('Bu telefon raqami allaqachon ro\'yxatdan o\'tgan!');
            } else if (msg) {
                toast.error(`Xatolik: ${msg}`);
            } else {
                toast.error("Ro'yxatdan o'tishda xatolik yuz berdi");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-600">
                        {t('app_name')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t('register')}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ism"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Familiya"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <input
                            type="text"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Biznes / Kompaniya nomi"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                        />
                        <input
                            type="tel"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={t('phone')}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={t('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <select
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                        >
                            <option value="bozor">{t('bozor')}</option>
                            <option value="qurilish">{t('qurilish')}</option>
                            <option value="avto">{t('avto')}</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                        >
                            {loading ? '...' : t('register')}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <Link href="/login" className="text-blue-600 hover:text-blue-500 text-sm font-bold">
                        {t('login')}
                    </Link>
                </div>
            </div>
        </div>
    );
}



