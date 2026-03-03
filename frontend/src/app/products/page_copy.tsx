'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Menu, Search, PackageOpen, MoreVertical, X, Package, Tag, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Products() {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50 });
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [stock, setStock] = useState('0');
    const [stockAlert, setStockAlert] = useState('5');
    const [submitting, setSubmitting] = useState(false);

    const fetchProducts = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products?page=${page}&search=${search}`);
            setProducts(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        setName('');
        setUnit('');
        setSellPrice('');
        setBuyPrice('');
        setStock('0');
        setStockAlert('5');
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setIsEditing(true);
        setCurrentId(product.id);
        setName(product.name);
        setUnit(product.unit);
        setSellPrice(product.sell_price.toString());
        setBuyPrice(product.buy_price?.toString() || '');
        setStock(product.stock?.toString() || '0');
        setStockAlert(product.stock_alert?.toString() || '5');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name, unit, sell_price: sellPrice,
                buy_price: buyPrice || 0,
                stock: stock || 0,
                stock_alert: stockAlert || 5
            };
            if (isEditing && currentId) {
                await api.put(`/products/${currentId}`, payload);
                toast.success('Mahsulot yangilandi');
            } else {
                await api.post('/products', payload);
                toast.success('Mahsulot qo\'shildi');
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        // Custom confirm mock (replace with real custom modal later if possible, but simple confirm works for now as standard)
        if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Mahsulot o\'chirildi');
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{t('products')}</h1>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('products_desc')}</p>
                            </div>
                            <button
                                onClick={openAddModal}
                                className="hidden md:flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl items-center font-bold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Plus className="w-5 h-5 mr-2.5" />
                                {t('add_product')}
                            </button>
                        </div>

                        {/* Mobile FAB */}
                        <button
                            onClick={openAddModal}
                            className="md:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-7 h-7" />
                        </button>

                        {/* Actions Bar */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="relative w-full sm:max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-transparent dark:border-transparent text-gray-900 dark:text-white rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner font-medium"
                                    placeholder={t('search_products')}
                                />
                            </div>
                            <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                <button className="flex items-center px-4 py-2.5 whitespace-nowrap bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors border border-gray-200 dark:border-slate-700">
                                    <Filter className="w-4 h-4 mr-2 text-gray-500" /> Filtr
                                </button>
                                <div className="text-sm px-4 py-2.5 whitespace-nowrap text-gray-500 dark:text-gray-400 font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                    {pagination.total} ta natija
                                </div>
                            </div>
                        </div>

                        {/* Professional Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-[60vh] md:h-[calc(100vh-300px)]">
                            <div className="overflow-x-auto flex-1 custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead className="bg-gray-50/90 dark:bg-slate-950/90 sticky top-0 z-10 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-sm">
                                        <tr>
                                            <th className="px-6 md:px-8 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest w-16">#</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('product_name')}</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center w-32">{t('unit')}</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center w-32">Qoldiq</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right w-48">{t('price')}</th>
                                            <th className="px-8 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right w-24">Amal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                                        {loading ? (
                                            [...Array(6)].map((_, i) => (
                                                <tr key={i} className="animate-[pulse_1.5s_ease-in-out_infinite]">
                                                    <td className="px-6 md:px-8 py-5"><div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-md w-6"></div></td>
                                                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-md w-3/4"></div></td>
                                                    <td className="px-6 py-5 flex justify-center"><div className="h-6 bg-gray-100 dark:bg-slate-800 rounded-lg w-16"></div></td>
                                                    <td className="px-6 py-5 flex justify-center"><div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-md w-12"></div></td>
                                                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-md w-24 ml-auto"></div></td>
                                                    <td className="px-8 py-5 flex justify-end"><div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-xl w-16"></div></td>
                                                </tr>
                                            ))
                                        ) : products.length === 0 ? (
                                            <tr>
                                                <td colSpan={6}>
                                                    <div className="flex flex-col items-center justify-center py-24 px-4">
                                                        <div className="relative mb-6">
                                                            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center z-10 relative border-4 border-white dark:border-slate-900 shadow-sm">
                                                                <PackageOpen className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                                            </div>
                                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gray-50/50 dark:bg-slate-800/30 rounded-full z-0 animate-ping" style={{ animationDuration: '3s' }}></div>
                                                        </div>
                                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{t('not_found')}</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-sm text-center font-medium">
                                                            {t('empty_products_desc')}
                                                        </p>
                                                        <button
                                                            onClick={openAddModal}
                                                            className="text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                                        >
                                                            + {t('add')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            (products || []).map((p, index) => (
                                                <tr key={p.id} className="group hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors duration-200">
                                                    <td className="px-6 md:px-8 py-5 text-sm font-bold text-gray-400 dark:text-gray-500">
                                                        {((pagination.page - 1) * pagination.limit + index + 1).toString().padStart(2, '0')}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                <Tag className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tracking-tight group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-slate-700 uppercase tracking-widest inline-block">
                                                            {p.unit || 'dona'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className={`px-2.5 py-1.5 rounded-lg text-xs font-black tracking-tight ${parseFloat(p.stock) <= parseFloat(p.stock_alert) ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'text-gray-900 dark:text-gray-300'}`}>
                                                            {p.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="font-black text-gray-900 dark:text-white text-[16px] tracking-tight">
                                                            {new Intl.NumberFormat('uz-UZ').format(p.sell_price)}
                                                            <span className="text-gray-400 dark:text-gray-500 ml-1.5 font-bold text-[14px]">so'm</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 pr-8">
                                                        <div className="flex items-center justify-end space-x-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <button
                                                                onClick={() => openEditModal(p)}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-all"
                                                                title="Tahrirlash"
                                                            >
                                                                <Edit2 className="w-4 h-4 stroke-[2.5]" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
                                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all"
                                                                title="O'chirish"
                                                            >
                                                                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!loading && products?.length > 0 && (
                                <div className="border-t border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-900">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Ko'rsatilmoqda <span className="font-bold text-gray-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> dan <span className="font-bold text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> gacha (<span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> dan)
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchProducts(pagination.page - 1, searchQuery)}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                            disabled={pagination.page <= 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => fetchProducts(pagination.page + 1, searchQuery)}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                            disabled={pagination.page * pagination.limit >= pagination.total}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-400">
                        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${isEditing ? 'from-amber-400 to-orange-500' : 'from-blue-600 to-indigo-600'}`}></div>
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
                                <div className={`p-2 rounded-xl mr-3 ${isEditing ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
                                    <Package className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                {isEditing ? 'Tahrirlash' : t('add_product')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 stroke-[2.5]" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('product_name')}</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner font-bold"
                                        placeholder="Masalan: Qora choy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('unit')}</label>
                                    <select
                                        value={unit}
                                        onChange={e => setUnit(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Avtomatik aniqlash --</option>
                                        <option value="kg">Kilogramm (kg)</option>
                                        <option value="dona">Dona</option>
                                        <option value="litr">Litr</option>
                                        <option value="metr">Metr</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sotish narxi</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="number"
                                                value={sellPrice}
                                                onChange={e => setSellPrice(e.target.value)}
                                                className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold"
                                                placeholder="Sotish"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sotib olish</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={buyPrice}
                                                onChange={e => setBuyPrice(e.target.value)}
                                                className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-green-500/50 outline-none transition-all font-bold"
                                                placeholder="Sotib olish"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Joriy qoldiq</label>
                                        <input
                                            type="number"
                                            value={stock}
                                            onChange={e => setStock(e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Limit (Aholat)</label>
                                        <input
                                            type="number"
                                            value={stockAlert}
                                            onChange={e => setStockAlert(e.target.value)}
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-2xl outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex space-x-4 border-t border-gray-100 dark:border-slate-800 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-5 py-3.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl font-bold transition-colors">
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`flex-1 px-5 py-3.5 rounded-2xl font-black text-white shadow-lg transition-all disabled:opacity-70 flex items-center justify-center transform active:scale-95 hover:-translate-y-0.5 ${isEditing ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 relative overflow-hidden'}`}
                                >
                                    {!isEditing && <div className="absolute inset-0 bg-white/20 -translate-x-full hover:animate-[shimmer_1.5s_infinite]"></div>}
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
