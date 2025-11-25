import { useState } from 'react'
import { User, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ProfileSettings() {
    const [activeTab, setActiveTab] = useState('profile')
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setStatus({ type: '', message: '' })

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email
                })
            })

            const data = await response.json()

            if (response.ok) {
                setStatus({ type: 'success', message: 'Profil berhasil diperbarui' })
                // Update local storage
                const updatedUser = { ...user, name: formData.name, email: formData.email }
                localStorage.setItem('user', JSON.stringify(updatedUser))
                setUser(updatedUser)
                // Trigger custom event for header updates if needed
                window.dispatchEvent(new Event('storage'))
            } else {
                setStatus({ type: 'error', message: data.error || 'Gagal memperbarui profil' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Terjadi kesalahan server' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'Konfirmasi password tidak cocok' })
            return
        }

        setIsLoading(true)
        setStatus({ type: '', message: '' })

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            const data = await response.json()

            if (response.ok) {
                setStatus({ type: 'success', message: 'Password berhasil diubah' })
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
            } else {
                setStatus({ type: 'error', message: data.error || 'Gagal mengubah password' })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Terjadi kesalahan server' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-bold text-slate-800">Pengaturan Akun</h1>
                    <p className="text-slate-500">Kelola informasi profil dan keamanan akun anda</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => { setActiveTab('profile'); setStatus({ type: '', message: '' }) }}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'profile' ? 'text-primary-600 bg-primary-50/50' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Profil
                        {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
                    </button>
                    <button
                        onClick={() => { setActiveTab('password'); setStatus({ type: '', message: '' }) }}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'password' ? 'text-primary-600 bg-primary-50/50' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <Lock className="w-4 h-4" />
                        Password
                        {activeTab === 'password' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {status.message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <p className="font-medium">{status.message}</p>
                        </div>
                    )}

                    {activeTab === 'profile' ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Menyimpan...' : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Password Saat Ini</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Password Baru</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Menyimpan...' : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Ubah Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
