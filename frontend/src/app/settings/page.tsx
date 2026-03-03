'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Phone, Menu, Globe, Shield,
    Settings as SettingsIcon, Crown, Key, MonitorSmartphone,
    LogOut, CheckCircle2, DollarSign, Calendar, Edit3, Image as ImageIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { user } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Mock States for UI interactions
    const [currency, setCurrency] = useState('UZS');
    const [timeFormat, setTimeFormat] = useState('24h');

    const handleAction = (msg: string) => {
        toast.success(msg, { icon: '✨' });
    }

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50/50 dark:bg-slate-950">
                <div className="hidden lg:block z-20">
                    <Sidebar />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
                    {/* Header Top - Mobile */}
                    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center transition-all duration-300 lg:hidden">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('app_name')}</h1>
                        </div>
                    </header>
                    {sidebarOpen && (
                        <div className="lg:hidden absolute top-0 left-0 bottom-0 z-50 animate-in slide-in-from-left duration-300">
                            <Sidebar isMobileItem={true} closeMobile={() => setSidebarOpen(false)} />
                        </div>
                    )}
                    {sidebarOpen && (
                        <div className="lg:hidden absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)}></div>
                    )}

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 dark:bg-slate-950 p-4 md:p-8 relative scroll-smooth">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 max-w-5xl mx-auto">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{t('settings')}</h1>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('settings_subtitle')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto pb-12">

                            {/* 1. Profile Settings */}
                            <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 p-6 md:p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl mr-3">
                                            <User className="w-5 h-5 stroke-[2.5]" />
                                        </div>
                                        {t('profile_info')}
                                    </h2>
                                    <button onClick={() => handleAction(t('edit_window_opened'))} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors flex items-center">
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        {t('edit')}
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 dark:border-slate-800 pb-6 mb-6">
                                    <div className="relative group cursor-pointer" onClick={() => handleAction(t('img_upload_opened'))}>
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg ring-4 ring-white dark:ring-slate-900">
                                            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <div className="absolute inset-0 bg-gray-900/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                            <ImageIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full ring-2 ring-white dark:ring-slate-900 border-none shadow-sm">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left mt-2 sm:mt-0 flex-1">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{user?.first_name} {user?.last_name}</h3>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{user?.business_name || t('not_specified')}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-gray-100 dark:border-slate-700/50 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                                        <div className="flex items-center text-gray-700 dark:text-gray-300 font-semibold gap-3">
                                            <Phone className="w-5 h-5 text-gray-400" /> {t('phone')}
                                        </div>
                                        <span className="font-black text-gray-900 dark:text-white">{user?.phone || t('phone_val')}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-gray-100 dark:border-slate-700/50 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                                        <div className="flex items-center text-gray-700 dark:text-gray-300 font-semibold gap-3">
                                            <Briefcase className="w-5 h-5 text-gray-400" /> {t('business_sector')}
                                        </div>
                                        <span className="font-black text-gray-900 dark:text-white capitalize">{user?.sector || t('not_specified')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. SECURITY */}
                            <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 p-6 md:p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl mr-3">
                                            <Shield className="w-5 h-5 stroke-[2.5]" />
                                        </div>
                                        {t('security')}
                                    </h2>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <button onClick={() => handleAction(t('pw_change_clicked'))} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 rounded-2xl transition-all group">
                                        <div className="flex items-center text-gray-800 dark:text-gray-200 font-bold text-sm">
                                            <Key className="w-5 h-5 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                            {t('change_password')}
                                        </div>
                                    </button>

                                    <button onClick={() => handleAction(t('sessions_clicked'))} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-2xl transition-all group">
                                        <div className="flex items-center text-gray-800 dark:text-gray-200 font-bold text-sm">
                                            <MonitorSmartphone className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            {t('active_sessions')}
                                        </div>
                                    </button>

                                    <div className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800 rounded-2xl cursor-not-allowed opacity-70">
                                        <div className="flex items-center text-gray-700 dark:text-gray-400 font-bold text-sm">
                                            <Shield className="w-5 h-5 mr-3 text-gray-400" />
                                            {t('two_factor_auth')}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-400 px-2 py-1 rounded">{t('coming_soon')}</span>
                                    </div>

                                    <button onClick={() => handleAction(t('logout_all_msg'))} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 rounded-2xl transition-all group mt-2">
                                        <div className="flex items-center text-rose-600 dark:text-rose-400 font-bold text-sm">
                                            <LogOut className="w-5 h-5 mr-3 text-rose-500 group-hover:scale-110 transition-transform" />
                                            {t('logout_all')}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* 3. APP SETTINGS */}
                            <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 p-6 md:p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center">
                                        <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400 p-2.5 rounded-xl mr-3">
                                            <SettingsIcon className="w-5 h-5 stroke-[2.5]" />
                                        </div>
                                        {t('app_settings')}
                                    </h2>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Globe className="w-4 h-4 mr-1.5" /> {t('language')}</label>
                                        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                            <button
                                                onClick={() => i18n.changeLanguage('uz')}
                                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${i18n.language === 'uz' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                {t('uzb_lang')}
                                            </button>
                                            <button
                                                onClick={() => i18n.changeLanguage('ru')}
                                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${i18n.language === 'ru' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                {t('rus_lang')}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center"><DollarSign className="w-4 h-4 mr-1.5" /> {t('currency')}</label>
                                        <div className="relative">
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                className="w-full appearance-none bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold py-3.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                                            >
                                                <option value="UZS">{t('currency_uzs')}</option>
                                                <option value="USD">{t('currency_usd')}</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {t('format_time')}</label>
                                        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                            <button
                                                onClick={() => setTimeFormat('24h')}
                                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${timeFormat === '24h' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                {t('hour_24')}
                                            </button>
                                            <button
                                                onClick={() => setTimeFormat('12h')}
                                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${timeFormat === '12h' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                {t('hour_12')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. SUBSCRIPTION PLAN */}
                            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-[28px] shadow-[0_8px_30px_rgba(49,46,129,0.3)] border border-indigo-500/30 p-8 flex flex-col relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-bl-full blur-2xl -z-0"></div>
                                <div className="absolute right-4 top-4 text-indigo-500/20">
                                    <Crown className="w-32 h-32" />
                                </div>

                                <div className="relative z-10 flex-1">
                                    <h2 className="text-xl font-black text-white mb-2 flex items-center tracking-tight">
                                        <Crown className="w-6 h-6 mr-3 text-amber-400" />
                                        {t('subscription')}
                                    </h2>

                                    <div className="flex items-baseline mt-4 mb-2">
                                        <span className="text-4xl font-black text-white tracking-tighter">{t('plan_basic')}</span>
                                        <span className="ml-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-indigo-200 border border-indigo-400/30">{t('plan_free')}</span>
                                    </div>
                                    <p className="text-indigo-200 text-sm font-medium mb-8"><span className="text-white font-bold ml-1">{t('duration_forever')}</span></p>

                                    <div className="space-y-3 mb-8">
                                        {[
                                            t('feat_1'),
                                            t('feat_2'),
                                            t('feat_3'),
                                            t('feat_4')
                                        ].map((feature, i) => (
                                            <div key={i} className="flex items-start text-sm text-indigo-100 font-medium">
                                                <CheckCircle2 className="w-5 h-5 mr-3 text-amber-400 shrink-0" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="relative w-full z-10 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-indigo-950 font-black py-4 px-6 rounded-2xl shadow-[0_4px_20px_rgba(251,191,36,0.3)] hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-auto flex items-center justify-center">
                                    <Crown className="w-5 h-5 mr-2" />
                                    {t('upgrade_premium')}
                                </button>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
