'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, MoveDown, Menu, Filter, Calendar, TrendingDown, Clock, Briefcase, Car, ShoppingBag, Coffee, HelpCircle, X, CheckCircle2, WalletCards } from 'lucide-react';

export default function Expenses() {
    const { t } = useTranslation();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50 });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Add form
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter state
    const [filter, setFilter] = useState('bugun');

    const commonCategories = [
        { id: 'Tushlik/Oziq-ovqat', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' },
        { id: 'Yoqilg\'i/Transport', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
        { id: 'Ijara/Xizmat', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
        { id: 'Bozorlik', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20' },
    ];

    const fetchExpenses = async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/expenses?page=${page}&filter=${filter}`);
            setExpenses(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching expenses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [filter]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/expenses', { title, amount });
            toast.success('Xarajat muvaffaqiyatli saqlandi');
            setTitle('');
            setAmount('');
            setIsAdding(false);
            fetchExpenses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setSubmitting(false);
        }
    };

    const getIconForTitle = (expenseTitle: string) => {
        const lower = expenseTitle.toLowerCase();
        if (lower.includes('ovqat') || lower.includes('tushlik')) return <Coffee className="w-5 h-5 text-amber-500" />;
        if (lower.includes('yoqilg') || lower.includes('benzin') || lower.includes('propan') || lower.includes('metan')) return <Car className="w-5 h-5 text-blue-500" />;
        if (lower.includes('ijara') || lower.includes('boshqa') || lower.includes('xizmat')) return <Briefcase className="w-5 h-5 text-emerald-500" />;
        if (lower.includes('bozor') || lower.includes('xarid')) return <ShoppingBag className="w-5 h-5 text-purple-500" />;
        return <HelpCircle className="w-5 h-5 text-gray-400" />;
    };

    const getBgForTitle = (expenseTitle: string) => {
        const lower = expenseTitle.toLowerCase();
        if (lower.includes('ovqat') || lower.includes('tushlik')) return 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
        if (lower.includes('yoqilg') || lower.includes('benzin') || lower.includes('propan') || lower.includes('metan')) return 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
        if (lower.includes('ijara') || lower.includes('boshqa') || lower.includes('xizmat')) return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
        if (lower.includes('bozor') || lower.includes('xarid')) return 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20';
        return 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700';
    };

    const totalToday = (expenses || []).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50/50 dark:bg-slate-950">
                <div className="hidden lg:block z-20">
                    <Sidebar />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
                    {/* Header Top for Mobile */}
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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{t('expenses')}</h1>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('expense_history_desc')}</p>
                            </div>

                            <button
                                onClick={() => setIsAdding(true)}
                                className="hidden md:flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none text-gray-900 dark:text-gray-100 px-6 py-3 rounded-2xl items-center font-bold transition-all hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5 mr-2.5 text-rose-500" />
                                {t('add_expense')}
                            </button>
                        </div>

                        {/* Mobile FAB */}
                        <button
                            onClick={() => setIsAdding(true)}
                            className="md:hidden fixed bottom-6 right-6 z-40 bg-rose-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(244,63,94,0.4)] hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-7 h-7" />
                        </button>

                        {/* Top Summary Widgets */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 rounded-[28px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-rose-100/50 dark:border-slate-800 p-8 flex items-center justify-between relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/40 dark:bg-rose-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-rose-500/10 dark:bg-rose-500/20 blur-3xl rounded-full z-0"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center space-x-2 text-rose-600/80 dark:text-gray-400 font-bold tracking-widest uppercase text-xs mb-3">
                                        <Calendar className="w-4 h-4 stroke-[2.5]" />
                                        <span>{filter === 'bugun' ? t('today') : (filter === 'hafta' ? t('this_week') : t('this_month'))}</span>
                                    </div>
                                    <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-baseline">
                                        {new Intl.NumberFormat('uz-UZ').format(totalToday)}
                                        <span className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 ml-2 tracking-normal">so'm</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-white dark:bg-rose-500/10 rounded-[24px] text-rose-500 dark:text-rose-400 shadow-md shadow-rose-100/50 dark:shadow-none relative z-10 hidden sm:block ring-1 ring-inset ring-rose-100/50 dark:ring-rose-500/20">
                                    <WalletCards className="w-8 h-8 stroke-[2]" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-slate-800 p-6 flex flex-col">
                                <h3 className="text-gray-900 dark:text-white font-black text-lg mb-4 tracking-tight flex items-center">
                                    <Filter className="w-5 h-5 mr-2 text-gray-400" /> {t('filter')}
                                </h3>
                                <div className="flex flex-col gap-3 flex-1">
                                    <button
                                        onClick={() => setFilter('bugun')}
                                        className={`px-5 py-3.5 rounded-2xl flex justify-between items-center transition-all font-bold ${filter === 'bugun' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-500/30' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'}`}
                                    >
                                        <span>{t('today')}</span>
                                        {filter === 'bugun' && <CheckCircle2 className="w-5 h-5 text-rose-500 dark:text-rose-400 stroke-[2.5]" />}
                                    </button>
                                    <button
                                        onClick={() => setFilter('hafta')}
                                        className={`px-5 py-3.5 rounded-2xl flex justify-between items-center transition-all font-bold ${filter === 'hafta' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-500/30' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'}`}
                                    >
                                        <span>{t('week_7')}</span>
                                        {filter === 'hafta' && <CheckCircle2 className="w-5 h-5 text-rose-500 dark:text-rose-400 stroke-[2.5]" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                                    {t('daily_exp_history')}
                                </h2>
                                <div className="text-sm text-gray-500 font-bold bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
                                    {t('total_records', { count: expenses.length })}
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50 dark:divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="px-6 md:px-8 py-5 flex items-center justify-between animate-pulse">
                                            <div className="flex items-center space-x-5">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl"></div>
                                                <div>
                                                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                                                    <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-20"></div>
                                                </div>
                                            </div>
                                            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                                        </div>
                                    ))
                                ) : expenses.length === 0 ? (
                                    <div className="px-6 py-20 flex flex-col items-center justify-center text-gray-500">
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center z-10 relative border-4 border-white dark:border-slate-900 shadow-sm">
                                                <TrendingDown className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-50/50 dark:bg-slate-800/30 rounded-full z-0 animate-ping" style={{ animationDuration: '3s' }}></div>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{t('empty_expenses')}</h3>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xs text-center">{t('empty_expenses_desc')}</p>
                                    </div>
                                ) : (
                                    (expenses || []).map((expense) => {
                                        const bgClass = getBgForTitle(expense.title);
                                        const icon = getIconForTitle(expense.title);

                                        return (
                                            <div key={expense.id} className="px-6 md:px-8 py-5 flex justify-between items-center hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                                <div className="flex items-center space-x-5">
                                                    <div className={`p-3.5 rounded-2xl border flex-shrink-0 transition-all group-hover:scale-110 duration-300 shadow-sm ${bgClass}`}>
                                                        {icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-[16px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{expense.title}</p>
                                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {new Date(expense.created_at).toLocaleString('uz-UZ', {
                                                                day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-black text-xl text-gray-900 dark:text-white tracking-tighter">
                                                    <span className="text-gray-300 dark:text-gray-600 mr-1.5 font-bold">-</span>
                                                    {new Intl.NumberFormat('uz-UZ').format(expense.amount)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Pagination (Backend Powered) */}
                            {!loading && expenses?.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between mt-6">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Ko'rsatilmoqda <span className="font-bold text-gray-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> dan <span className="font-bold text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> gacha (<span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> dan)
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchExpenses(pagination.page - 1)}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                            disabled={pagination.page <= 1}
                                        >
                                            <Plus className="w-4 h-4 rotate-180" />
                                        </button>
                                        <button
                                            onClick={() => fetchExpenses(pagination.page + 1)}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                            disabled={pagination.page * pagination.limit >= pagination.total}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Premium Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-400">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-orange-400"></div>
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center tracking-tight">
                                <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 p-2 rounded-xl mr-3">
                                    <TrendingDown className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                Yangi Xarajat
                            </h2>
                            <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="p-8">
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                    Tavsiya etilgan toifalar
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                    {commonCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setTitle(cat.id)}
                                            className={`px-4 py-2.5 rounded-xl border flex items-center text-sm font-bold transition-all duration-200 ${title === cat.id
                                                ? `${cat.bg} ${cat.border} ${cat.color} ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-${cat.color.split('-')[1]}-400 shadow-md scale-105`
                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm'
                                                }`}
                                        >
                                            <cat.icon className="w-4 h-4 mr-2" />
                                            {cat.id.split('/')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('expense_title')} (Nima uchun?)</label>
                                    <input
                                        required
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all shadow-inner font-medium"
                                        placeholder="Masalan: Tushlik yoki Xom-ashyo"
                                    />
                                </div>
                                <div className="pb-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('amount')} (so'm)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-black">UZS</span>
                                        </div>
                                        <input
                                            required
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            className="w-full pl-16 pr-5 py-4 text-2xl font-black bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all shadow-inner tracking-widest font-mono placeholder:font-sans placeholder:tracking-normal placeholder:font-bold placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                            placeholder="50 000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex space-x-4 border-t border-gray-100 dark:border-slate-800 mt-6">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-5 py-3.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl font-bold transition-colors">
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-5 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl font-black shadow-lg shadow-gray-200/50 dark:shadow-none transition-all disabled:opacity-70 flex items-center justify-center transform active:-translate-y-0 hover:-translate-y-0.5"
                                >
                                    {submitting ? 'Saqlanmoqda...' : t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
