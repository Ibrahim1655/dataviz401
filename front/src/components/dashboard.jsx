import React from 'react';
import {
    LayoutDashboard, ShoppingCart, Package, Map, Users, Tag,
    Wallet, Receipt, Settings, Moon, LogOut, Calendar,
    TrendingUp, TrendingDown, PlusSquare, MapPin
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {

    // Bar Chart Data (Product sales)
    const barChartData = {
        labels: ['1 Jul', '2 Jul', '3 Jul', '4 Jul', '5 Jul', '6 Jul', '7 Jul', '8 Jul', '9 Jul', '10 Jul', '11 Jul', '12 Jul'],
        datasets: [
            {
                label: 'Gross margin',
                data: [28, 32, 20, 31, 52, 53, 22, 38, 25, 45, 33, 58],
                backgroundColor: '#60a5fa', // Blue
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.8
            },
            {
                label: 'Revenue',
                data: [38, 48, 55, 42, 35, 55, 40, 48, 30, 49, 45, 48],
                backgroundColor: '#fb923c', // Orange
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.8
            }
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 6,
                    boxHeight: 6,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 70,
                ticks: {
                    stepSize: 10,
                    callback: (value) => value === 0 ? '0' : value + ' K',
                    color: '#94a3b8',
                    font: { size: 11 }
                },
                grid: {
                    color: '#f1f5f9',
                    drawBorder: false,
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } },
                border: { display: false }
            }
        }
    };

    // Doughnut Chart Data (Sales by product category)
    const doughnutData = {
        labels: ['Living room', 'Kids', 'Office', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining room', 'Decor', 'Lighting', 'Outdoor'],
        datasets: [
            {
                data: [25, 17, 13, 12, 9, 8, 6, 5, 3, 2],
                backgroundColor: [
                    '#6366f1', // Indigo/Purple
                    '#3b82f6', // Blue
                    '#10b981', // Emerald
                    '#f43f5e', // Rose
                    '#d946ef', // Fuchsia
                    '#8b5cf6', // Violet
                    '#06b6d4', // Cyan
                    '#f59e0b', // Amber
                    '#84cc16', // Lime
                    '#14b8a6', // Teal
                ],
                borderWidth: 0,
                hoverOffset: 4
            }
        ]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                display: false // We build a custom legend
            }
        }
    };

    const menuGroups = [
        {
            title: 'MARKETING',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', active: true },
                { icon: ShoppingCart, label: 'Marketplace' },
                { icon: Package, label: 'Orders' },
                { icon: Map, label: 'Tracking', hasChevron: true },
                { icon: Users, label: 'Customers' },
                { icon: Tag, label: 'Discounts' },
            ]
        },
        {
            title: 'PAYMENTS',
            items: [
                { icon: Wallet, label: 'Ledger' },
                { icon: Receipt, label: 'Taxes' },
            ]
        },
        {
            title: 'SYSTEM',
            items: [
                { icon: Settings, label: 'Settings' },
                { icon: Moon, label: 'Dark mode', rightComponent: <div className="w-8 h-4 bg-slate-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5"></div></div> },
            ]
        }
    ];

    const StatCard = ({ title, value, change, isPositive, extraIcon: ExtraIcon }) => (
        <div className="bg-white border text-sm border-slate-100 rounded-xl p-4 flex-1 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-slate-500 font-medium flex items-center gap-2">
                    {ExtraIcon && <ExtraIcon className="w-4 h-4 text-slate-400" />} {title}
                </h3>
            </div>
            <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-slate-800">{value}</span>
                {change && (
                    <span className={`text-sm font-medium flex items-center pb-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {change}%
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between hidden md:flex">
                <div>
                    {/* Logo */}
                    <div className="h-20 flex items-center px-6 gap-3 pt-4 mb-4">
                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                            <LogOut className="w-6 h-6 rotate-180" /> {/* Simulate flup logo */}
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Flup</span>
                    </div>

                    {/* Navigation */}
                    <nav className="px-4 overflow-y-auto pb-4">
                        {menuGroups.map((group, idx) => (
                            <div key={idx} className="mb-6">
                                <h4 className="text-xs font-semibold text-slate-400 mb-3 px-3 uppercase tracking-wider">{group.title}</h4>
                                <ul className="space-y-1">
                                    {group.items.map((item, i) => (
                                        <li key={i}>
                                            <a href="#" className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`w-5 h-5 ${item.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                    {item.label}
                                                </div>
                                                {item.hasChevron && <span className="text-slate-300 text-xs">▼</span>}
                                                {item.rightComponent}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                        <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="text-sm font-bold text-slate-800">Harper Nelson</p>
                            <p className="text-xs text-slate-500">Admin Manager</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-slate-500 text-sm font-medium px-2 py-2 hover:text-slate-800 w-full transition-colors">
                        <LogOut className="w-4 h-4 ml-1" /> Log out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 xl:p-10 overflow-y-auto">

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-all focus:ring-2 focus:ring-emerald-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Time period: Last week
                    </button>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                    <StatCard title="Total customers" value="567,899" change="2.5" isPositive={true} ExtraIcon={Users} />
                    <StatCard title="Total revenue" value="$3,465 M" change="0.5" isPositive={true} ExtraIcon={Wallet} />
                    <StatCard title="Total orders" value="1,136 M" change="0.2" isPositive={false} ExtraIcon={Package} />
                    <StatCard title="Total returns" value="1,789" change="0.12" isPositive={true} ExtraIcon={ShoppingCart} />

                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 cursor-pointer transition-colors shadow-sm">
                        <PlusSquare className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Add data</span>
                    </div>
                </div>

                {/* Charts Main Row */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Product sales</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* Charts Bottom Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">

                    {/* Doughnut Chart Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
                        <div className="flex-1 w-full">
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Sales by product category</h2>

                            {/* Custom Legend Grid */}
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-medium text-slate-600">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#6366f1]"></div> Living room - 25%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#3b82f6]"></div> Kids - 17%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#10b981]"></div> Office - 13%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#f43f5e]"></div> Bedroom - 12%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#d946ef]"></div> Kitchen - 9%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#8b5cf6]"></div> Bathroom - 8%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#06b6d4]"></div> Dining room - 6%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#f59e0b]"></div> Decor - 5%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#84cc16]"></div> Lighting - 3%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#14b8a6]"></div> Outdoor - 2%</div>
                            </div>
                        </div>

                        <div className="w-[200px] h-[200px] flex-shrink-0 flex items-center justify-center relative mt-4 md:mt-0">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                            {/* Center hole design (optional) */}
                            <div className="absolute inset-0 m-auto w-[65%] h-[65%] rounded-full bg-white shadow-inner flex items-center justify-center">
                            </div>
                        </div>
                    </div>

                    {/* Map/List Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Sales by countries</h2>
                        <div className="flex justify-between items-start">

                            <div className="flex-1 max-w-[200px] space-y-3 z-10 relative">
                                {[
                                    { country: 'Poland', value: '19%', color: 'bg-emerald-600' },
                                    { country: 'Austria', value: '15%', color: 'bg-emerald-500' },
                                    { country: 'Spain', value: '13%', color: 'bg-emerald-400' },
                                    { country: 'Romania', value: '12%', color: 'bg-emerald-300' },
                                    { country: 'France', value: '11%', color: 'bg-emerald-200' },
                                    { country: 'Italy', value: '11%', color: 'bg-teal-200' },
                                    { country: 'Germany', value: '10%', color: 'bg-cyan-200' },
                                    { country: 'Ukraine', value: '9%', color: 'bg-blue-200' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2 text-slate-600 font-medium">
                                            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                            {item.country}
                                        </span>
                                        <span className="font-bold text-slate-800">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Map Illustration Placeholder */}
                            <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
                                <svg width="300" height="300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M70 120 C 50 110, 30 140, 40 160 C 50 180, 80 170, 90 150 C 100 130, 90 130, 70 120 Z" fill="#10b981" />
                                    <path d="M120 70 C 140 50, 160 80, 150 100 C 140 120, 110 110, 100 90 C 90 70, 100 90, 120 70 Z" fill="#10b981" />
                                    <path d="M90 100 C 110 110, 130 140, 120 160 C 110 180, 80 170, 70 150 M 60 70 C 40 50, 20 80, 30 100 C 40 120, 70 110, 80 90" stroke="#10b981" strokeWidth="20" strokeLinecap="round" />
                                </svg>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;