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
    const [phone, setPhone] = useState('+998');
    const [password, setPassword] = useState('');
    const [sector, setSector] = useState('bozor');
    const [loading, setLoading] = useState(false);

    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        businessName: false,
        phone: false,
        password: false
    });

    const { setToken, setUser } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();

    const isFirstNameValid = firstName.trim().length >= 2;
    const isLastNameValid = lastName.trim().length >= 2;
    const isBusinessNameValid = businessName.trim().length >= 2;
    const isPhoneValid = phone.replace(/\D/g, '').length === 12;
    const isPassValid = password.length >= 6;

    const isFormValid = isFirstNameValid && isLastNameValid && isBusinessNameValid && isPhoneValid && isPassValid;

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

    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({
            firstName: true, lastName: true, businessName: true, phone: true, password: true
        });

        if (!isFormValid) return;

        setLoading(true);
        const cleanPhone = phone.replace(/\s+/g, '');
        try {
            const { data } = await api.post('/auth/register', {
                phone: cleanPhone, password, sector,
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-600/10 to-transparent dark:from-blue-600/5 z-0"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[80px] z-0 pointer-events-none"></div>

            <div className="max-w-[480px] w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 my-8">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] border border-white/60 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                    <div className="text-center mb-8 mt-2">
                        <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl w-14 h-14 shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <span className="text-white font-black text-2xl leading-none">H</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {t('app_name')}
                        </h2>
                        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('register')} - Yangi hisob yaratish
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ism</label>
                                <input
                                    type="text"
                                    required
                                    className={`appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border ${touched.firstName && !isFirstNameValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/50'} text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-sm`}
                                    placeholder="Ism"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    onBlur={() => handleBlur('firstName')}
                                />
                                {touched.firstName && !isFirstNameValid && (
                                    <p className="mt-1.5 text-[10px] font-bold text-rose-500 ml-1">Kamida 2 ta harf</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Familiya</label>
                                <input
                                    type="text"
                                    required
                                    className={`appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border ${touched.lastName && !isLastNameValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/50'} text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-sm`}
                                    placeholder="Familiya"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    onBlur={() => handleBlur('lastName')}
                                />
                                {touched.lastName && !isLastNameValid && (
                                    <p className="mt-1.5 text-[10px] font-bold text-rose-500 ml-1">Kamida 2 ta harf</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Biznes / Kompaniya nomi</label>
                            <input
                                type="text"
                                required
                                className={`appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border ${touched.businessName && !isBusinessNameValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/50'} text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-sm`}
                                placeholder="Gullola MCHJ"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                onBlur={() => handleBlur('businessName')}
                            />
                            {touched.businessName && !isBusinessNameValid && (
                                <p className="mt-1.5 text-[10px] font-bold text-rose-500 ml-1">Kamida 2 ta harf</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('phone')}</label>
                            <input
                                type="tel"
                                required
                                className={`appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border ${touched.phone && !isPhoneValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/50'} text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-sm`}
                                placeholder="+998 __ ___ __ __"
                                value={phone}
                                onChange={handlePhoneChange}
                                onBlur={() => handleBlur('phone')}
                            />
                            {touched.phone && !isPhoneValid && (
                                <p className="mt-1.5 text-[10px] font-bold text-rose-500 ml-1">Raqam to'liq emas</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('password')}</label>
                            <input
                                type="password"
                                required
                                className={`appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border ${touched.password && !isPassValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-gray-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/50'} text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-sm`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => handleBlur('password')}
                            />
                            {touched.password && !isPassValid && (
                                <p className="mt-1.5 text-[10px] font-bold text-rose-500 ml-1">Kamida 6 ta belgi bo'lishi shart</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Faoliyat turi</label>
                            <select
                                required
                                className="appearance-none block w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-sm cursor-pointer"
                                value={sector}
                                onChange={(e) => setSector(e.target.value)}
                            >
                                <option value="bozor">{t('bozor')}</option>
                                <option value="qurilish">{t('qurilish')}</option>
                                <option value="avto">{t('avto')}</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_20px_rgba(37,99,235,0.25)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? 'Kutib turing...' : t('register')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Hisobingiz bormi?{' '}
                            <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                {t('login')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}



