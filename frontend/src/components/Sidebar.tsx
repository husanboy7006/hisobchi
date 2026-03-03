'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    TrendingDown,
    Settings,
    LogOut,
    User,
    ChevronLeft,
    ChevronRight,
    Languages
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar({ isMobileItem = false, closeMobile = () => { } }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const { t, i18n } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);

    // Initial check for mobile to perhaps collapse or something, but we rely on standard classes mostly
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && !isMobileItem) {
                setCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileItem]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'uz' ? 'ru' : 'uz';
        i18n.changeLanguage(newLang);
    };

    const navItems = [
        { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/products', label: t('products'), icon: Package },
        { href: '/sales', label: t('sales'), icon: ShoppingCart },
        { href: '/expenses', label: t('expenses'), icon: TrendingDown },
        { href: '/settings', label: t('settings'), icon: Settings },
    ];

    if (isMobileItem) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 shadow-2xl overflow-hidden w-72 transition-colors duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                        {user?.business_name || t('app_name')}
                    </h1>
                    <button onClick={closeMobile} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobile}
                                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${active
                                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"></div>}
                                <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'text-blue-600 dark:text-blue-400 scale-110' : 'group-hover:scale-110'}`} />
                                <span className={active ? 'font-bold' : ''}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 space-y-3">
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-sm transition-all duration-200"
                    >
                        <Languages className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span className="font-semibold text-sm">{i18n.language.toUpperCase() === 'UZ' ? "O'zbekcha" : "Русский"}</span>
                    </button>

                    <div className="pt-4 flex items-center px-2 space-x-3">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2.5 rounded-full text-white shadow-md">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {user?.first_name || 'Admin'} {user?.last_name || ''}
                            </p>
                            <button onClick={handleLogout} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center mt-0.5">
                                <LogOut className="w-3 h-3 mr-1" /> {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <aside
            className={`${collapsed ? 'w-[88px]' : 'w-72'} bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transition-all duration-400 relative group z-20`}
        >
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3.5 top-9 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 hidden group-hover:flex transition-all hover:scale-110 focus:outline-none z-30"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={`p-6 border-b border-gray-100 dark:border-slate-800 flex items-center h-[88px] transition-all ${collapsed ? 'justify-center px-0' : ''}`}>
                <div className={`flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all ${collapsed ? 'w-12 h-12' : 'w-10 h-10 mr-3.5 flex-shrink-0'}`}>
                    <span className="text-white font-black text-xl leading-none">H</span>
                </div>
                {!collapsed && (
                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight animate-in fade-in duration-300 truncate">
                        {user?.business_name || t('app_name')}
                    </h1>
                )}
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2.5 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : ""}
                            className={`flex items-center rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${active
                                ? 'text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                } ${collapsed ? 'justify-center py-4 px-0' : 'py-3.5 px-4 space-x-3.5'}`}
                        >
                            {active && !collapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"></div>}
                            {active && collapsed && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"></div>}

                            <item.icon className={`flex-shrink-0 transition-transform duration-300 ${active ? 'w-6 h-6 text-blue-600 dark:text-blue-400 scale-110' : 'w-5 h-5 group-hover:scale-110 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />

                            {!collapsed && (
                                <span className={`whitespace-nowrap transition-all duration-300 ${active ? 'font-bold' : ''}`}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className={`p-5 mb-2 mx-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50 flex flex-col space-y-4 transition-all duration-300 ${collapsed ? 'items-center px-2 py-4' : ''}`}>
                <button
                    onClick={toggleLanguage}
                    title={collapsed ? "Til" : ""}
                    className={`flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 ${collapsed ? '' : 'justify-between w-full'}`}
                >
                    <div className="flex items-center">
                        <Languages className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
                        {!collapsed && <span className="font-semibold text-sm">{i18n.language.toUpperCase() === 'UZ' ? "O'zbekcha" : "Русский"}</span>}
                    </div>
                </button>

                {!collapsed && <div className="h-px bg-gray-200 dark:bg-slate-700 w-full"></div>}

                <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-3' : 'justify-between w-full'}`}>
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-600 p-2.5 rounded-full text-white shadow-sm flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" title="Profil">
                            <User className="w-5 h-5" />
                        </div>
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {user?.first_name || 'Admin'}
                                </p>
                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate">
                                    {user?.role || 'OWNER'}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        title={collapsed ? t('logout') : ""}
                        className={`text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all duration-200 ${collapsed ? '' : ''}`}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
