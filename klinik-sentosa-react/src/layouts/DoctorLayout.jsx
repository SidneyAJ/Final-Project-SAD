import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Calendar, Users, FileText,
    LogOut, Menu, X, User, ChevronRight, Stethoscope, UserCog, Settings
} from 'lucide-react'
import MedicalLogo from '../components/MedicalLogo'
import NotificationDropdown from '../components/NotificationDropdown'

export default function DoctorLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const menuItems = [
        { path: '/doctor', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/doctor/appointments', icon: Calendar, label: 'Janji Temu' },
        { path: '/doctor/queue', icon: Users, label: 'Antrean' },
        { path: '/doctor/records', icon: FileText, label: 'Rekam Medis' },
        { path: '/doctor/patients', icon: UserCog, label: 'Daftar Pasien' }
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-50">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <Link to="/" className="group">
                            <MedicalLogo size="md" />
                        </Link>
                    </div>

                    {/* User Profile Card */}
                    <div className="px-6 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500">Dokter</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.path, item.exact)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${active
                                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-500/30'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-green-600'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span>{item.label}</span>
                                    {active && (
                                        <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="px-4 mt-6">
                        <button
                            onClick={() => navigate('/doctor/settings')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-medium group mb-2"
                        >
                            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Pengaturan
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <div
                    className={`absolute inset-y-0 left-0 w-72 bg-white transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="flex flex-col h-full pt-5 pb-4">
                        {/* Close Button */}
                        <div className="flex items-center justify-between px-6 mb-8">
                            <MedicalLogo size="md" />
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* User Profile Card */}
                        <div className="px-6 mb-6">
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500">Dokter</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.path, item.exact)
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${active
                                                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-500/30'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-green-600'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span>{item.label}</span>
                                        {active && (
                                            <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Logout Button */}
                        <div className="px-4 mt-6">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Keluar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-72">
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            {/* Page Title */}
                            <div className="hidden lg:block">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                    Portal Dokter
                                </h1>
                            </div>

                            {/* Right Side Actions */}
                            <div className="flex items-center gap-3 ml-auto">
                                <NotificationDropdown />
                                <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <User className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
