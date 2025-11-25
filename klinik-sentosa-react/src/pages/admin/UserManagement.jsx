import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Search, Shield, UserCog, Stethoscope, HeartPulse, Edit2, X, Save, UserPlus } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'doctor'
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleNameBlur = () => {
        // Only apply auto-title when user leaves the name field and not in edit mode
        if (!editMode && formData.role && formData.name) {
            const name = formData.name.trim()

            // Remove existing titles
            let cleanName = name
                .replace(/^(Dr\.|dr\.|DR\.|Ns\.|ns\.|NS\.)\s*/i, '')
                .trim()

            // Add appropriate title
            let prefixedName = cleanName
            if (formData.role === 'doctor' && cleanName) {
                prefixedName = `Dr. ${cleanName}`
            } else if (formData.role === 'nurse' && cleanName) {
                prefixedName = `Ns. ${cleanName}`
            }

            if (prefixedName !== formData.name) {
                setFormData(prev => ({ ...prev, name: prefixedName }))
            }
        }
    }

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            showToast('Gagal memuat data pengguna', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id) => {
        // Custom confirmation modal (better than window.confirm)
        if (!window.confirm('Apakah anda yakin ingin menghapus pengguna ini?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                fetchUsers()
                showToast('Pengguna berhasil dihapus', 'success')
            } else {
                const data = await response.json()
                showToast(`Gagal menghapus: ${data.error}`, 'error')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            showToast('Gagal menghapus pengguna', 'error')
        }
    }

    const handleEdit = (user) => {
        setEditMode(true)
        setCurrentUserId(user.id)
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't populate password
            role: user.role
        })
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem('token')
            const url = editMode
                ? `http://localhost:3000/api/admin/users/${currentUserId}`
                : 'http://localhost:3000/api/admin/users'

            const payload = editMode && !formData.password
                ? { name: formData.name, email: formData.email, role: formData.role }
                : formData

            const response = await fetch(url, {
                method: editMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                showToast(editMode ? 'Pengguna berhasil diperbarui!' : 'Pengguna berhasil dibuat!', 'success')
                setShowModal(false)
                setFormData({ name: '', email: '', password: '', role: 'doctor' })
                setEditMode(false)
                setCurrentUserId(null)
                fetchUsers()
            } else {
                const data = await response.json()
                showToast(`Gagal: ${data.error}`, 'error')
            }
        } catch (error) {
            console.error('Error saving user:', error)
            showToast('Gagal menyimpan data pengguna', 'error')
        }
    }

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
            doctor: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
            nurse: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white',
            patient: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
            pharmacist: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
            owner: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
        }
        const icons = {
            admin: Shield,
            doctor: Stethoscope,
            nurse: HeartPulse,
            patient: Users,
            pharmacist: UserCog,
            owner: UserCog
        }
        const labels = {
            admin: 'Admin',
            doctor: 'Dokter',
            nurse: 'Perawat',
            patient: 'Pasien',
            pharmacist: 'Apoteker',
            owner: 'Pemilik'
        }
        const Icon = icons[role] || Users

        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md ${styles[role] || styles.patient}`}>
                <Icon className="w-3.5 h-3.5" />
                {labels[role] || role}
            </span>
        )
    }

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <ScrollReveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-3xl shadow-2xl text-white">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <UserCog className="w-6 h-6" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
                        <p className="text-white/90 font-medium">Kelola akun dokter, perawat, dan staf klinik</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditMode(false)
                            setFormData({ name: '', email: '', password: '', role: 'doctor' })
                            setShowModal(true)
                        }}
                        className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-2xl hover:scale-105"
                    >
                        <UserPlus className="w-5 h-5" />
                        Tambah Pengguna
                    </button>
                </div>
            </ScrollReveal>

            {/* Search Bar */}
            <ScrollReveal direction="up" delay={50}>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama, email, atau role..."
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </ScrollReveal>

            {/* User List */}
            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-indigo-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Nama & Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Tanggal Dibuat</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user, idx) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                                        style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hover:scale-110"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                                                    title="Hapus User"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && !isLoading && (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-semibold">
                                {searchQuery ? 'Tidak ada hasil yang cocok' : 'Belum ada pengguna terdaftar'}
                            </p>
                            <p className="text-sm text-slate-400 mt-2">
                                {searchQuery ? 'Coba dengan kata kunci lain' : 'Klik tombol "Tambah Pengguna" untuk memulai'}
                            </p>
                        </div>
                    )}
                </div>
            </ScrollReveal>

            {/* Create/Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b-2 border-slate-100 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {editMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                                    </h3>
                                    <p className="text-white/90 text-sm mt-1">
                                        {editMode ? 'Perbarui informasi pengguna' : 'Isi form untuk membuat akun baru'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false)
                                        setEditMode(false)
                                        setFormData({ name: '', email: '', password: '', role: 'doctor' })
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                <select
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="doctor">Dokter</option>
                                    <option value="nurse">Perawat</option>
                                    <option value="admin">Admin</option>
                                    <option value="patient">Pasien</option>
                                    <option value="pharmacist">Apoteker</option>
                                    <option value="owner">Pemilik</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.role === 'doctor' && '🩺 Gelar "Dr." akan ditambahkan otomatis'}
                                    {formData.role === 'nurse' && '💉 Gelar "Ns." akan ditambahkan otomatis'}
                                    {!['doctor', 'nurse'].includes(formData.role) && 'Pilih role sesuai jabatan'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    onBlur={handleNameBlur}
                                    placeholder={formData.role === 'doctor' ? 'Contoh: Budi Santoso (akan jadi Dr. Budi Santoso)' : 'Masukkan nama lengkap'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="nama@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Password {editMode && <span className="text-slate-400 font-normal">(kosongkan jika tidak ingin mengubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editMode}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editMode ? 'Isi jika ingin mengubah password' : 'Minimal 8 karakter'}
                                    minLength={editMode ? undefined : 8}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 mt-6 flex items-center justify-center gap-2 hover:scale-105"
                            >
                                <Save className="w-5 h-5" />
                                {editMode ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}
