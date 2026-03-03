'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, TrendingDown, Menu, Activity, Search, Bell } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState<any>({
        today_sales: 0,
        today_expenses: 0,
        net_profit: 0,
        top_product: null,
        chart_data: []
    });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Map API chart data to recharts format
    const salesData = stats.chart_data?.map((item: any) => ({
        name: new Date(item.date).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' }),
        current: parseFloat(item.sales),
        previous: parseFloat(item.expenses) // Using expenses as a secondary line for now
    })) || [];

    const expensesData = [
        { name: 'Ijara', value: 400 },
        { name: 'Oziq-ovqat', value: 300 },
        { name: 'Soliq', value: 300 },
        { name: 'Boshqa', value: 200 },
    ];

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
    const totalExpenses = expensesData.reduce((acc, curr) => acc + curr.value, 0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ').format(amount);
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50/50 dark:bg-slate-950">
                <div className="hidden lg:block z-20">
                    <Sidebar />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
                    {/* Header */}
                    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center transition-all duration-300">
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex-1 md:flex-none truncate pr-4">{t('dashboard')}</h1>
                        </div>
                        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-2xl leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-all duration-300 shadow-sm"
                                placeholder="Tez qidirish (Mahsulotlar, Mijozlar)..."
                            />
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-3">
                            <button className="p-2.5 relative rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm">
                                <Bell className="w-5 h-5" />
                                <span className="absolute max-md:top-1.5 max-md:right-1.5 top-2 right-2 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-slate-800"></span>
                                </span>
                            </button>
                        </div>
                    </header>

                    {sidebarOpen && (
                        <div className="lg:hidden absolute top-0 left-0 bottom-0 z-50 animate-in slide-in-from-left duration-300">
                            <Sidebar isMobileItem={true} closeMobile={() => setSidebarOpen(false)} />
                        </div>
                    )}
                    {sidebarOpen && (
                        <div
                            className="lg:hidden absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
                            onClick={() => setSidebarOpen(false)}
                        ></div>
                    )}

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 dark:bg-slate-950 p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-40 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 animate-pulse relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Sales Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 md:p-7 border border-gray-100/80 dark:border-slate-800 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent dark:from-blue-900/20 rounded-bl-[100px] -z-10 opacity-70 group-hover:scale-125 transition-transform duration-700"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">{t('today_sales')}</p>
                                            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-baseline">
                                                {formatMoney(stats.today_sales)}
                                                <span className="text-lg lg:text-xl font-bold text-gray-400 dark:text-gray-500 ml-1.5 tracking-normal">so'm</span>
                                            </h3>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-500/10 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-100/50 dark:ring-blue-500/20">
                                            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm mt-6">
                                        <span className="text-blue-700 bg-blue-100/80 dark:bg-blue-500/20 dark:text-blue-300 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center shadow-sm">
                                            <ArrowTrendingUpIcon className="w-3.5 h-3.5 mr-1" />
                                            +14.5%
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 ml-2.5 text-xs font-medium">{t('compare_yesterday')}</span>
                                    </div>
                                </div>

                                {/* Expenses Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 md:p-7 border border-gray-100/80 dark:border-slate-800 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-rose-50 to-transparent dark:from-rose-900/20 rounded-bl-[100px] -z-10 opacity-70 group-hover:scale-125 transition-transform duration-700"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">{t('today_expenses')}</p>
                                            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-baseline">
                                                {formatMoney(stats.today_expenses)}
                                                <span className="text-lg lg:text-xl font-bold text-gray-400 dark:text-gray-500 ml-1.5 tracking-normal">so'm</span>
                                            </h3>
                                        </div>
                                        <div className="bg-rose-50 dark:bg-rose-500/10 p-3.5 rounded-2xl text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-100/50 dark:ring-rose-500/20">
                                            <TrendingDown className="w-6 h-6 stroke-[2.5]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm mt-6">
                                        <span className="text-rose-700 bg-rose-100/80 dark:bg-rose-500/20 dark:text-rose-300 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center shadow-sm">
                                            <ArrowTrendingDownIcon className="w-3.5 h-3.5 mr-1" />
                                            -4.2%
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 ml-2.5 text-xs font-medium">{t('compare_yesterday')}</span>
                                    </div>
                                </div>

                                {/* Net Profit Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 md:p-7 border border-gray-100/80 dark:border-slate-800 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent dark:from-emerald-900/20 rounded-bl-[100px] -z-10 opacity-70 group-hover:scale-125 transition-transform duration-700"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">{t('net_profit')}</p>
                                            <h3 className={`text-4xl lg:text-5xl font-black tracking-tighter flex items-baseline ${stats.net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {formatMoney(stats.net_profit)}
                                                <span className="text-lg lg:text-xl font-bold text-gray-400 dark:text-gray-500 ml-1.5 tracking-normal">so'm</span>
                                            </h3>
                                        </div>
                                        <div className={`p-3.5 rounded-2xl ring-1 ring-inset ${stats.net_profit >= 0 ? 'bg-emerald-50 text-emerald-600 ring-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' : 'bg-rose-50 text-rose-600 ring-rose-100/50 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20'}`}>
                                            <Activity className="w-6 h-6 stroke-[2.5]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm mt-6">
                                        {stats.net_profit >= 0 ? (
                                            <span className="text-emerald-700 bg-emerald-100/80 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center shadow-sm">
                                                <ArrowTrendingUpIcon className="w-3.5 h-3.5 mr-1" />
                                                +8.1%
                                            </span>
                                        ) : (
                                            <span className="text-rose-700 bg-rose-100/80 dark:bg-rose-500/20 dark:text-rose-300 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center shadow-sm">
                                                <ArrowTrendingDownIcon className="w-3.5 h-3.5 mr-1" />
                                                -2.4%
                                            </span>
                                        )}
                                        <span className="text-gray-400 dark:text-gray-500 ml-2.5 text-xs font-medium">{t('compare_yesterday')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            {/* Area Chart for Sales */}
                            <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 border border-gray-100 dark:border-slate-800 lg:col-span-2 group">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('sales_stats')}</h2>
                                        <p className="text-sm font-medium text-gray-400 mt-1">{t('last_7_days_sales')}</p>
                                    </div>
                                    <select className="text-sm font-bold border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                                        <option>{t('this_week')}</option>
                                        <option>{t('last_week')}</option>
                                    </select>
                                </div>
                                <div className="h-80 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                                dy={15}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                                dx={-10}
                                                tickFormatter={(value: any) => value > 0 ? `${value / 1000}k` : '0'}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(0,0,0,0.05)',
                                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                                    padding: '12px 16px',
                                                    fontWeight: 'bold'
                                                }}
                                                itemStyle={{ fontWeight: 800 }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="current"
                                                name={t('sales')}
                                                stroke="#2563eb"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorCurrent)"
                                                activeDot={{ r: 8, strokeWidth: 0, fill: '#2563eb', style: { filter: 'drop-shadow(0px 4px 6px rgba(37,99,235,0.4))' } }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="previous"
                                                name={t('expenses')}
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorPrev)"
                                                strokeDasharray="6 6"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pie Chart for Expenses */}
                            <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 border border-gray-100 dark:border-slate-800 flex flex-col items-center">
                                <div className="w-full mb-2">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('expense_stats')}</h2>
                                    <p className="text-sm font-medium text-gray-400 mt-1 flex items-center"><TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-500" /> {t('expense_desc')}</p>
                                </div>
                                <div className="flex-1 flex flex-col justify-center items-center relative w-full mt-4">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={expensesData}
                                                    innerRadius={75}
                                                    outerRadius={100}
                                                    paddingAngle={6}
                                                    dataKey="value"
                                                    stroke="none"
                                                    cornerRadius={8}
                                                >
                                                    {(expensesData || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer stroke-white dark:stroke-slate-900 stroke-2" />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                    itemStyle={{ color: '#1f2937' }}
                                                    formatter={(value: any) => [`${value} so'm`, '']}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Jami</span>
                                        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                            {totalExpenses}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full mt-6 grid grid-cols-2 gap-y-4 gap-x-2 px-2">
                                    {(expensesData || []).map((entry, index) => (
                                        <div key={index} className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors cursor-pointer group">
                                            <span className="w-3.5 h-3.5 rounded-full mr-3 shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            <span className="truncate">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

// Custom Icons for badges
const ArrowTrendingUpIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
)

const ArrowTrendingDownIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
)
