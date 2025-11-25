import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Users, UserPlus, CreditCard, BarChart, ShieldAlert,
    LogOut, Menu, X, User, ChevronRight, Building2, Settings
} from 'lucide-react'
import NotificationDropdown from '../components/NotificationDropdown'

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const handleLogout = () => {
        if (confirm('Apakah anda yakin ingin keluar?')) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
        }
    }

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Manajemen Pengguna' },
        { path: '/admin/patients', icon: UserPlus, label: 'Registrasi Pasien' },
        { path: '/admin/payments', icon: CreditCard, label: 'Kasir & Pembayaran' },
        { path: '/admin/reports', icon: BarChart, label: 'Laporan' },
        { path: '/admin/logs', icon: ShieldAlert, label: 'Audit Logs' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-500 p-2 rounded-xl">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Klinik Sentosa</h1>
                                <p className="text-xs text-indigo-400 font-bold tracking-wider uppercase">Admin Panel</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Menu Utama
                        </div>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 translate-x-1'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                                    <span className="font-medium relative z-10">{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-80" />}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-sm mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {user.name ? user.name.charAt(0) : 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{user.name || 'Admin'}</p>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/admin/settings')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all font-medium group"
                        >
                            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Pengaturan
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all font-medium group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Keluar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
                                {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Dashboard'}
                            </h2>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3 ml-auto">
                            <NotificationDropdown />
                            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
