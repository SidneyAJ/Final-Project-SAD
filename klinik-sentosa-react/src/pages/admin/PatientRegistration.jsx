import { useState } from 'react'
import { UserPlus, Save, User, Mail, Lock, Phone, MapPin, Calendar, CreditCard, CheckCircle, AtSign, Heart } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function PatientRegistration() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        nik: '',
        phone: '',
        address: '',
        dob: '',
        gender: 'L'
    })
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/admin/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                showToast('Pasien berhasil didaftarkan! Akun dapat langsung digunakan untuk login.', 'success')
                // Reset form
                setFormData({
                    name: '', username: '', email: '', password: '', nik: '',
                    phone: '', address: '', dob: '', gender: 'L'
                })
            } else {
                const data = await response.json()
                showToast(`Gagal mendaftarkan pasien: ${data.error}`, 'error')
            }
        } catch (error) {
            console.error('Error registering patient:', error)
            showToast('Terjadi kesalahan saat mendaftarkan pasien. Silakan coba lagi.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header */}
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <UserPlus className="w-7 h-7" />
                            </div>
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse">
                                <Heart className="w-7 h-7" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Registrasi Pasien Baru</h1>
                        <p className="text-white/90 text-lg font-medium">
                            Daftarkan pasien baru ke dalam sistem klinik dengan cepat dan mudah
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Registration Form */}
            <ScrollReveal direction="up" delay={100}>
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-slate-100">
                    {/* Account Information Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gradient-to-r from-blue-200 to-cyan-200">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Informasi Akun Login</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-500" />
                                    Nama Lengkap Pasien
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all group-hover:border-blue-300"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Contoh: Ahmad Rizki"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <AtSign className="w-4 h-4 text-blue-500" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all group-hover:border-blue-300"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="username_unik"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    📝 Username untuk login (tanpa spasi, lowercase recommended)
                                </p>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all group-hover:border-blue-300"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-blue-500" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all group-hover:border-blue-300"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personal Information Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gradient-to-r from-cyan-200 to-teal-200">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Data Pribadi Pasien</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-cyan-500" />
                                    NIK (Nomor Induk Kependudukan)
                                </label>
                                <input
                                    type="text"
                                    name="nik"
                                    required
                                    maxLength={16}
                                    pattern="\d{16}"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all group-hover:border-cyan-300"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    placeholder="16 digit angka"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-cyan-500" />
                                    Nomor Telepon / HP
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all group-hover:border-cyan-300"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-cyan-500" />
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all group-hover:border-cyan-300"
                                    value={formData.dob}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4 text-cyan-500" />
                                    Jenis Kelamin
                                </label>
                                <select
                                    name="gender"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all group-hover:border-cyan-300"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="L">👨 Laki-laki</option>
                                    <option value="P">👩 Perempuan</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-cyan-500" />
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    name="address"
                                    rows="4"
                                    required
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all group-hover:border-cyan-300 resize-none"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Masukkan alamat lengkap termasuk RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 pt-8 border-t-2 border-slate-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 transition-all shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-1'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Mendaftarkan...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-6 h-6" />
                                    Daftarkan Pasien Baru
                                </>
                            )}
                        </button>
                        <p className="text-center text-sm text-slate-500 mt-4">
                            ℹ️ Pastikan semua data yang dimasukkan sudah benar dan lengkap
                        </p>
                    </div>
                </form>
            </ScrollReveal>

            {/* Info Card */}
            <ScrollReveal direction="up" delay={200}>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        Cara Login Pasien
                    </h4>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p>✅ Pasien dapat login menggunakan <strong>Email</strong> atau <strong>Username</strong></p>
                        <p>✅ Password yang dibuat akan langsung aktif</p>
                        <p>✅ Akun akan otomatis masuk ke role "Pasien"</p>
                        <p>✅ Data akan tersimpan di database untuk keperluan rekam medis</p>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    )
}
