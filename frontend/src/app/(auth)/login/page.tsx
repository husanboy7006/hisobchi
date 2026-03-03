'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Lock, Phone, ArrowRight } from 'lucide-react';

export default function Login() {
    const [phone, setPhone] = useState('+998');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [phoneTouched, setPhoneTouched] = useState(false);
    const [passTouched, setPassTouched] = useState(false);

    const { setToken, setUser } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();

    const isPhoneValid = phone.replace(/\D/g, '').length === 12; // 998 + 9 digits
    const isPassValid = password.length >= 6;
    const isFormValid = isPhoneValid && isPassValid;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const digits = value.replace(/\D/g, '');
        let res = '+998';
        const rest = digits.startsWith('998') ? digits.slice(3) : digits;
        if (rest.length > 0) res += ' ' + rest.substring(0, 2);
        if (rest.length > 2) res += ' ' + rest.substring(2, 5);
        if (rest.length > 5) res += ' ' + rest.substring(5, 7);
        if (rest.length > 7) res += ' ' + rest.substring(7, 9);
        setPhone(res);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneTouched(true);
        setPassTouched(true);
        if (!isFormValid) return;

        setLoading(true);
        const cleanPhone = phone.replace(/\s+/g, '');
        try {
            const { data } = await api.post('/auth/login', { phone: cleanPhone, password });
            setToken(data.token);
            setUser(data.user);
            toast.success(t('welcome_back') + '!');
            router.push('/dashboard');
        } catch (error: any) {
            const msg = error.response?.data?.message;
            if (msg === 'Invalid Credentials') {
                toast.error(t('invalid_credentials') || 'Parol yoki telefon xato');
            } else {
                toast.error(t('error_occurred'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-600/10 to-transparent dark:from-blue-600/5 z-0"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[80px] z-0 pointer-events-none"></div>

            <div className="max-w-[420px] w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] border border-white/60 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                    <div className="text-center mb-10 mt-2">
                        <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl w-16 h-16 shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <span className="text-white font-black text-3xl leading-none">H</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t('welcome_back')}
                        </h2>
                        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[260px] mx-auto leading-relaxed">
                            {t('login_desc')}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="phone" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5 ml-1">{t('phone')}</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className={`appearance-none block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-950 border ${phoneTouched && !isPhoneValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/50'} text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium sm:text-sm placeholder:text-gray-400`}
                                        placeholder="+998 __ ___ __ __"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        onBlur={() => setPhoneTouched(true)}
                                    />
                                </div>
                                {phoneTouched && !isPhoneValid && (
                                    <p className="mt-2 text-xs font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">
                                        Telefon raqami to'liq kiritilmadi
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5 ml-1 flex justify-between">
                                    <span>{t('password')}</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className={`appearance-none block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-950 border ${passTouched && !isPassValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/50'} text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium sm:text-sm placeholder:text-gray-400`}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => setPassTouched(true)}
                                    />
                                </div>
                                {passTouched && !isPassValid && (
                                    <p className="mt-2 text-xs font-bold text-rose-500 ml-1 animate-in fade-in slide-in-from-top-1">
                                        Parol kamida 6 ta belgi bo'lishi kerak
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_20px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? t('loading') : t('login')}
                                {!loading && isFormValid && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('unregistered')}{' '}
                            <Link href="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                {t('register')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
