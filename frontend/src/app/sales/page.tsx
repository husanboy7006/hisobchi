'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, ShoppingCart, Menu, Search, ShoppingBag, Calendar, CheckCircle2, Package, Tag, Layers, FileText, ChevronDown, ChevronUp, Receipt } from 'lucide-react';

export default function Sales() {
    const { t } = useTranslation();
    const [sales, setSales] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50 });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedSale, setExpandedSale] = useState<string | null>(null);

    // Add sale form
    const [itemsText, setItemsText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchSales = async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/sales?page=${page}`);
            setSales(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching sales", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleAddSale = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const items = itemsText.split('\n').filter(line => line.trim() !== '');

        if (items.length === 0) {
            toast.error("Kamida bitta mahsulot kiriting");
            setSubmitting(false);
            return;
        }

        try {
            await api.post('/sales', { items_text: items });
            toast.success('Savdo muvaffaqiyatli saqlandi');
            setItemsText('');
            setIsAdding(false);
            fetchSales();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Savdoni saqlashda xatolik');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedSale(expandedSale === id ? null : id);
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50/50 dark:bg-slate-950">
                <div className="hidden lg:block z-20">
                    <Sidebar />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
                    {/* Header Top - Mobile only */}
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
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{t('sales')}</h1>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Barcha savdolaringiz ro'yxati va tarixi</p>
                            </div>

                            {!isAdding && (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="hidden md:flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl items-center font-bold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2.5" />
                                    {t('new_sale')}
                                </button>
                            )}
                        </div>

                        {/* Floating Action Button for Mobile */}
                        {!isAdding && (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="md:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus className="w-7 h-7" />
                            </button>
                        )}

                        {isAdding && (
                            <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-800 mb-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-400 relative">
                                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
                                <div className="p-6 md:p-8">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center tracking-tight">
                                        <div className="bg-blue-50 dark:bg-blue-500/10 p-2.5 rounded-xl mr-3">
                                            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Yangi savdoni qayd etish
                                    </h2>
                                    <form onSubmit={handleAddSale}>
                                        <div className="mb-8 flex flex-col md:flex-row gap-8">
                                            <div className="flex-1">
                                                <label className="block text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
                                                    Mahsulotlar
                                                </label>
                                                <textarea
                                                    required
                                                    rows={6}
                                                    value={itemsText}
                                                    onChange={e => setItemsText(e.target.value)}
                                                    className="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100 shadow-inner"
                                                    placeholder="2.5 olma&#10;1 shakar&#10;3 non"
                                                />
                                            </div>
                                            <div className="md:w-[320px] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/60 dark:border-blue-800/30 rounded-2xl p-6 flex flex-col">
                                                <div className="flex items-center text-blue-800 dark:text-blue-300 font-bold mb-4 tracking-tight">
                                                    <FileText className="w-5 h-5 mr-2.5" />
                                                    Qanday ishlashadi?
                                                </div>
                                                <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-400 flex-1 font-medium">
                                                    <li className="flex items-start">
                                                        <div className="bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm border border-emerald-100 dark:border-emerald-900/30 mr-3 shrink-0 mt-0.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        </div>
                                                        Har bir mahsulotni yangi qatorga yozing
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm border border-emerald-100 dark:border-emerald-900/30 mr-3 shrink-0 mt-0.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        </div>
                                                        <span className="font-mono bg-white/60 dark:bg-slate-800/50 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-700 font-bold ml-1 mr-1">Miqdor</span> <span className="font-mono bg-white/60 dark:bg-slate-800/50 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-slate-700 font-bold">Nomi</span> orqali yozing.
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setIsAdding(false)}
                                                className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl font-bold transition-colors"
                                            >
                                                {t('cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 flex items-center justify-center transform active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
                                            >
                                                {submitting ? 'Saqlanmoqda...' : t('save')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {loading ? (
                                [...Array(4)].map((_, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl h-[104px] shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/80 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                                    </div>
                                ))
                            ) : sales.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 py-16 px-6 rounded-[32px] text-center border border-dashed border-gray-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                                    <div className="bg-gray-50 dark:bg-slate-800 w-28 h-28 rounded-full flex items-center justify-center mb-6 ring-[12px] ring-gray-50/50 dark:ring-slate-800/50 shadow-inner">
                                        <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Hozircha savdolar yo'q</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-sm">Birinchi foyda keltiruvchi tranzaksiyangizni qo'shing va biznesni yurgizing.</p>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                    >
                                        Birinchi savdoni qo'shish
                                    </button>
                                </div>
                            ) : (
                                (sales || []).map((sale) => {
                                    const isExpanded = expandedSale === sale.id;
                                    const itemCount = sale.items ? sale.items.length : 0;
                                    const displayId = sale.id.substring(0, 8).toUpperCase();

                                    return (
                                        <div
                                            key={sale.id}
                                            className={`bg-white dark:bg-slate-900 rounded-[20px] transition-all duration-300 overflow-hidden group ${isExpanded ? 'shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-blue-200 dark:border-slate-700 ring-1 ring-blue-50/50 dark:ring-0 my-6 scale-[1.01]' : 'shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700'}`}
                                        >
                                            <div
                                                className="px-5 py-5 sm:px-6 cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4 group"
                                                onClick={() => toggleExpand(sale.id)}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-3.5 rounded-2xl flex-shrink-0 transition-all duration-300 ${isExpanded ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-500/20 group-hover:scale-105'}`}>
                                                        <ShoppingCart className={`w-6 h-6 stroke-[2.5]`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <p className="font-black text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Savdo <span className="text-gray-400 font-bold ml-1">#{displayId}</span></p>
                                                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30">
                                                                Tugallangan
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                            <Calendar className="w-3.5 h-3.5 mr-1" />
                                                            {new Date(sale.created_at).toLocaleString('uz-UZ', {
                                                                day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                            <span className="mx-2 w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                                            <Layers className="w-3.5 h-3.5 mr-1" />
                                                            {itemCount} xil mahsulot
                                                            {sale.cashier_name && (
                                                                <>
                                                                    <span className="mx-2 w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                                                    <Tag className="w-3.5 h-3.5 mr-1" />
                                                                    {sale.cashier_name}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end space-x-6 sm:w-auto w-full pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-slate-800">
                                                    <div className="flex sm:hidden items-center text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded">
                                                        Tugallangan
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="text-right mr-4">
                                                            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 sm:hidden block mb-0.5">Jami so'mma</span>
                                                            <div className="font-black text-2xl text-gray-900 dark:text-white tracking-tighter flex items-center">
                                                                {new Intl.NumberFormat('uz-UZ').format(sale.total_amount)}
                                                            </div>
                                                        </div>
                                                        <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-gray-50 text-gray-400 dark:bg-slate-800 dark:text-gray-500 group-hover:bg-gray-100 dark:group-hover:text-gray-600'}`}>
                                                            {isExpanded ? <ChevronUp className="w-5 h-5 stroke-[3]" /> : <ChevronDown className="w-5 h-5 stroke-[3]" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expandable Body with smooth transition classes handled by DOM directly */}
                                            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                <div className="overflow-hidden">
                                                    <div className="px-6 pb-6 pt-2">
                                                        <div className="bg-gray-50 dark:bg-slate-950/50 rounded-[16px] border border-gray-100/80 dark:border-slate-800/50 p-1 mt-2">
                                                            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                                                                <div className="col-span-6 md:col-span-5">Mahsulot Nomi</div>
                                                                <div className="col-span-3 text-center">Hajmi</div>
                                                                <div className="col-span-3 md:col-span-4 text-right">Narxi</div>
                                                            </div>
                                                            <div className="divide-y divide-gray-100/50 dark:divide-slate-800/50">
                                                                {(sale.items || []).map((item: any, idx: number) => (
                                                                    <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-colors">
                                                                        <div className="col-span-6 md:col-span-5 flex items-center space-x-3">
                                                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                                {item.product_name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <span className="font-bold text-gray-900 dark:text-gray-100 truncate text-[15px]">{item.product_name}</span>
                                                                        </div>
                                                                        <div className="col-span-3">
                                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-[13px] mx-auto">
                                                                                {item.quantity} <span className="ml-1 text-gray-500 font-normal">{item.unit || 'dona'}</span>
                                                                            </span>
                                                                        </div>
                                                                        <div className="col-span-3 md:col-span-4 text-right">
                                                                            <div className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">
                                                                                {new Intl.NumberFormat('uz-UZ').format(item.price)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination (Backend Powered) */}
                        {!loading && sales?.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between mt-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Ko'rsatilmoqda <span className="font-bold text-gray-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> dan <span className="font-bold text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> gacha (<span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> dan)
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => fetchSales(pagination.page - 1)}
                                        className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                        disabled={pagination.page <= 1}
                                    >
                                        <ChevronDown className="w-4 h-4 rotate-90" />
                                    </button>
                                    <button
                                        onClick={() => fetchSales(pagination.page + 1)}
                                        className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                        disabled={pagination.page * pagination.limit >= pagination.total}
                                    >
                                        <ChevronUp className="w-4 h-4 rotate-90" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
