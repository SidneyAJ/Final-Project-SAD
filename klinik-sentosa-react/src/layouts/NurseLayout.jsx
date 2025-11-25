import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Users, Activity, ClipboardList,
    LogOut, Menu, X, User, ChevronRight, HeartPulse, Settings
} from 'lucide-react'
import MedicalLogo from '../components/MedicalLogo'
import NotificationDropdown from '../components/NotificationDropdown'

export default function NurseLayout() {
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
        { path: '/nurse', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/nurse/queue', icon: Users, label: 'Antrean & Screening' },
        { path: '/nurse/vitals', icon: Activity, label: 'Input Tanda Vital' },
        { path: '/nurse/patients', icon: ClipboardList, label: 'Daftar Pasien' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-pink-50 p-2 rounded-xl">
                                <HeartPulse className="w-8 h-8 text-pink-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Klinik Sentosa</h1>
                                <p className="text-xs text-pink-500 font-bold tracking-wider uppercase">Portal Perawat</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
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
                                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 translate-x-1'
                                            : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:translate-x-1'
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
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {user.name ? user.name.charAt(0) : 'N'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{user.name || 'Perawat'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/nurse/settings')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-rose-100 hover:bg-rose-800 hover:text-white rounded-xl transition-all font-medium group"
                        >
                            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Pengaturan
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-medium group"
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
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
                                {menuItems.find(item => item.path === location.pathname)?.label || 'Portal Perawat'}
                            </h2>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3 ml-auto">
                            <NotificationDropdown />
                            <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
