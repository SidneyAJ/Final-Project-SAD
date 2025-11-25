import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Mail, Lock, Eye, EyeOff,
    CheckCircle2, Calendar, Shield, ArrowLeft, ArrowRight,
    User, Users, UserCog, Briefcase, Pill, Building
} from 'lucide-react'
import MedicalLogo from '../components/MedicalLogo'
import Toast from '../components/Toast'

export default function Login() {
    const navigate = useNavigate()
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: ''
    })

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type })
    }

    const roles = [
        { value: 'pasien', label: 'Pasien', icon: User, color: 'from-blue-500 to-cyan-500' },
        { value: 'dokter', label: 'Dokter', icon: Briefcase, color: 'from-green-500 to-emerald-500' },
        { value: 'perawat', label: 'Perawat', icon: Users, color: 'from-pink-500 to-rose-500' },
        { value: 'admin', label: 'Admin', icon: UserCog, color: 'from-purple-500 to-indigo-500' },
        { value: 'apoteker', label: 'Apoteker', icon: Pill, color: 'from-orange-500 to-amber-500' },
        { value: 'pemilik', label: 'Pemilik', icon: Building, color: 'from-red-500 to-pink-500' }
    ]

    const features = [
        {
            icon: CheckCircle2,
            title: 'Rekam Medis Digital',
            description: 'Akses data pasien secara cepat dan aman'
        },
        {
            icon: Calendar,
            title: 'Manajemen Janji Temu',
            description: 'Jadwal otomatis dan pengingat pasien'
        },
        {
            icon: Shield,
            title: 'Keamanan Terjamin',
            description: 'Enkripsi data dan kontrol akses berbasis peran'
        }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.username,
                    password: formData.password
                })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))

                showToast('Login berhasil! Selamat datang kembali.', 'success')

                setTimeout(() => {
                    if (data.user.role === 'patient') {
                        navigate('/patient')
                    } else if (data.user.role === 'doctor') {
                        navigate('/doctor')
                    } else if (data.user.role === 'nurse') {
                        navigate('/nurse')
                    } else if (data.user.role === 'admin') {
                        navigate('/admin')
                    } else if (data.user.role === 'pharmacist') {
                        navigate('/pharmacist')
                    } else if (data.user.role === 'owner') {
                        navigate('/owner')
                    } else {
                        navigate('/')
                    }
                }, 1000)
            } else {
                // Provide specific error messages based on the error type
                if (data.error && data.error.includes('not found')) {
                    showToast('Akun tidak ditemukan. Pastikan email Anda benar atau daftar akun baru.')
                } else if (data.error && data.error.includes('password')) {
                    showToast('Email atau password salah. Periksa kembali dan pastikan huruf besar/kecil sudah benar.')
                } else if (data.error && data.error.includes('inactive')) {
                    showToast('Akun Anda belum aktif. Silakan hubungi administrator.')
                } else {
                    showToast(data.error || 'Login gagal. Email atau password Anda salah. Silakan coba lagi.')
                }
            }
        } catch (error) {
            console.error('Login error:', error)
            showToast('Tidak dapat terhubung ke server. Pastikan Anda terhubung ke internet dan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 p-12 relative overflow-hidden items-center justify-center">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 animate-pulse" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
                    </div>

                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"></div>
                        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
                    </div>

                    <div className="relative z-10 w-full max-w-xl space-y-12">
                        <div className="animate-in">
                            <Link to="/" className="inline-flex items-center gap-3 group mb-8">
                                <div className="bg-white/20 backdrop-blur-lg p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/10">
                                    <MedicalLogo size="md" variant="light" />
                                </div>
                            </Link>

                            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                                Selamat Datang di<br />
                                <span className="text-secondary-200">Portal Kesehatan</span>
                            </h2>
                            <p className="text-white/90 text-xl leading-relaxed font-light">
                                Akses sistem manajemen kesehatan yang aman dan terintegrasi untuk memberikan layanan terbaik bagi pasien.
                            </p>
                        </div>

                        <div className="space-y-4 animate-in" style={{ animationDelay: '0.2s' }}>
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 p-5 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all group cursor-pointer hover:translate-x-2"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-1">{feature.title}</h3>
                                        <p className="text-white/80 text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                    <div className="w-full max-w-md">
                        <Link to="/" className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                            <MedicalLogo size="md" />
                        </Link>

                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50 animate-in">
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Login Akun</h2>
                                <p className="text-gray-500">Silakan masuk untuk melanjutkan</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Pilih Peran
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {roles.map((role) => (
                                            <label key={role.value} className="cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={role.value}
                                                    checked={formData.role === role.value}
                                                    onChange={handleChange}
                                                    className="peer sr-only"
                                                    required
                                                />
                                                <div className={`p-3 border-2 rounded-xl text-center transition-all duration-300 peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary-500 peer-checked:bg-gradient-to-br ${role.color} peer-checked:text-white hover:border-primary-300 hover:shadow-md bg-white`}>
                                                    <role.icon className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                                    <div className="text-xs font-bold">{role.label}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">
                                        Email / Username
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                            placeholder="Masukkan email atau username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                            placeholder="Masukkan password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 transition-all" />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Ingat saya</span>
                                    </label>
                                    <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-bold hover:underline">
                                        Lupa password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Masuk Sekarang
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <div className="text-center pt-4">
                                    <span className="text-gray-600">Belum punya akun? </span>
                                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
                                        Daftar sekarang
                                    </Link>
                                </div>
                            </form>
                        </div>

                        <Link to="/" className="flex items-center justify-center gap-2 mt-8 text-gray-500 hover:text-primary-600 font-medium transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
