import { useState, useEffect } from 'react'
import {
    Calendar, Plus, Clock, User, MapPin, X, Check,
    Search, Filter, ChevronRight, AlertCircle, Stethoscope,
    CalendarCheck, Heart, Sparkles, ArrowRight, FileText
} from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function Appointments() {
    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('upcoming')
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Booking Form State
    const [formData, setFormData] = useState({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
    })

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchData()
    }, [])

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const fetchData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` }

            // Fetch Appointments
            const aptRes = await fetch('http://localhost:3000/api/appointments', { headers })
            const aptData = await aptRes.json()
            setAppointments(aptData)

            // Fetch Doctors
            const docRes = await fetch('http://localhost:3000/api/patients/doctors', { headers })
            const docData = await docRes.json()
            setDoctors(docData)

            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error)
            showToast('Gagal memuat data. Silakan refresh halaman.', 'error')
            setLoading(false)
        }
    }

    const handleBooking = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Client-side validation
        if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
            showToast('Mohon lengkapi semua data: Pilih dokter, tanggal, dan jam.', 'error')
            setIsSubmitting(false)
            return
        }

        try {
            const res = await fetch('http://localhost:3000/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                let errorMessage = 'Gagal membuat janji temu. '

                if (data.error && data.error.includes('profile')) {
                    errorMessage = 'Lengkapi profil Anda terlebih dahulu di menu Pengaturan.'
                } else if (data.error && (data.error.includes('unavailable') || data.error.includes('booked'))) {
                    errorMessage = 'Dokter tidak tersedia pada waktu ini. Pilih jadwal lain.'
                } else if (data.error && (data.error.includes('duplicate') || data.error.includes('already'))) {
                    errorMessage = 'Anda sudah memiliki janji di waktu ini. Pilih waktu lain.'
                } else {
                    errorMessage += data.error || 'Terjadi kesalahan. Silakan coba lagi.'
                }

                throw new Error(errorMessage)
            }

            showToast('Janji temu berhasil dibuat! Kami tunggu kedatangan Anda.', 'success')
            setShowBookingModal(false)
            setFormData({ doctor_id: '', appointment_date: '', appointment_time: '', notes: '' })
            fetchData() // Refresh list

        } catch (error) {
            showToast(error.message, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const statusColors = {
        confirmed: 'bg-gradient-to-r from-green-500 to-emerald-600',
        pending: 'bg-gradient-to-r from-yellow-500 to-amber-600',
        cancelled: 'bg-gradient-to-r from-red-500 to-rose-600',
        completed: 'bg-gradient-to-r from-gray-500 to-slate-600',
        scheduled: 'bg-gradient-to-r from-primary-500 to-secondary-600'
    }

    const statusLabels = {
        confirmed: 'Dikonfirmasi',
        pending: 'Menunggu',
        cancelled: 'Dibatalkan',
        completed: 'Selesai',
        scheduled: 'Terjadwal'
    }

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (filter === 'upcoming') return aptDate >= today && apt.status !== 'cancelled'
        if (filter === 'past') return aptDate < today || apt.status === 'completed'
        return true
    })

    const selectedDoctor = doctors.find(d => d.id === formData.doctor_id)

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
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary-400/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <CalendarCheck className="w-7 h-7" />
                                </div>
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse">
                                    <Heart className="w-7 h-7" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold mb-2">Janji Temu Saya</h1>
                            <p className="text-white/90 text-lg font-medium">
                                Kelola jadwal konsultasi dengan dokter terbaik kami
                            </p>
                        </div>
                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold shadow-2xl hover:bg-white/90 transition-all hover:scale-105"
                        >
                            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                            Buat Janji Baru
                        </button>
                    </div>
                </div>
            </ScrollReveal>

            {/* Filters */}
            <ScrollReveal direction="up" delay={50}>
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-100">
                    <div className="flex items-center gap-4 overflow-x-auto">
                        {[
                            { key: 'upcoming', label: 'Akan Datang', icon: ArrowRight },
                            { key: 'past', label: 'Riwayat', icon: FileText },
                            { key: 'all', label: 'Semua', icon: Calendar }
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${filter === f.key
                                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg scale-105'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-102'
                                    }`}
                            >
                                <f.icon className="w-4 h-4" />
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </ScrollReveal>

            {/* Appointments List */}
            <div className="space-y-4">
                {loading ? (
                    <ScrollReveal direction="up" delay={100}>
                        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-slate-100">
                            <div className="animate-spin w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
                            <p className="text-slate-600 font-semibold">Memuat janji temu...</p>
                        </div>
                    </ScrollReveal>
                ) : filteredAppointments.length === 0 ? (
                    <ScrollReveal direction="up" delay={100}>
                        <div className="bg-gradient-to-br from-slate-50 to-primary-50 rounded-3xl shadow-xl p-12 text-center border-2 border-dashed border-primary-200">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-12 h-12 text-primary-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">Belum Ada Janji Temu</h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                {filter === 'upcoming' ? 'Anda belum memiliki janji temu yang akan datang' :
                                    filter === 'past' ? 'Belum ada riwayat janji temu' :
                                        'Anda belum pernah membuat janji temu'}
                            </p>
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-bold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg hover:scale-105"
                            >
                                <Sparkles className="w-5 h-5" />
                                Buat Janji Pertama
                            </button>
                        </div>
                    </ScrollReveal>
                ) : (
                    filteredAppointments.map((apt, idx) => (
                        <ScrollReveal key={apt.id} direction="up" delay={100 + idx * 50}>
                            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-100 hover:shadow-2xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 group">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Doctor Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                                                <Stethoscope className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-xl text-slate-900 mb-1">{apt.doctor_name}</h3>
                                                <p className="text-sm text-primary-600 font-semibold mb-4">{apt.specialization || 'Dokter Umum'}</p>
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                                                        <Calendar className="w-4 h-4 text-primary-600" />
                                                        <span className="font-medium text-slate-700">
                                                            {new Date(apt.appointment_date).toLocaleDateString('id-ID', {
                                                                weekday: 'long',
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-50 rounded-lg">
                                                        <Clock className="w-4 h-4 text-secondary-600" />
                                                        <span className="font-bold text-slate-700">{apt.appointment_time}</span>
                                                    </div>
                                                </div>
                                                {apt.notes && (
                                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                        <p className="text-sm text-slate-600 font-medium">
                                                            <span className="text-slate-400">Catatan:</span> {apt.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <span className={`${statusColors[apt.status] || 'bg-gray-500'} text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg inline-block`}>
                                            {statusLabels[apt.status] || apt.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))
                )}
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b-2 border-slate-100 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Buat Janji Temu Baru</h2>
                                    <p className="text-white/90 font-medium">Pilih dokter dan jadwal konsultasi Anda</p>
                                </div>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleBooking} className="p-8 space-y-8">
                            {/* Doctor Selection */}
                            <div>
                                <label className="block text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-primary-600" />
                                    Pilih Dokter
                                </label>
                                {doctors.length === 0 ? (
                                    <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                        <p className="text-amber-700 font-medium">
                                            Belum ada dokter tersedia. Silakan hubungi admin.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {doctors.map((doc) => (
                                            <div
                                                key={doc.id}
                                                onClick={() => setFormData({ ...formData, doctor_id: doc.id })}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all group ${formData.doctor_id === doc.id
                                                    ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 ring-4 ring-primary-200 scale-105 shadow-lg'
                                                    : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 hover:scale-102'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.doctor_id === doc.id
                                                            ? 'bg-gradient-to-br from-primary-500 to-secondary-600'
                                                            : 'bg-slate-200 group-hover:bg-primary-100'
                                                        }`}>
                                                        <Stethoscope className={`w-5 h-5 ${formData.doctor_id === doc.id ? 'text-white' : 'text-slate-600'}`} />
                                                    </div>
                                                    {formData.doctor_id === doc.id && (
                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-slate-900">{doc.full_name}</div>
                                                <div className="text-sm text-primary-600 font-semibold">{doc.specialization || 'Dokter Umum'}</div>
                                                {doc.phone && (
                                                    <div className="text-xs text-slate-500 mt-1">📞 {doc.phone}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-600" />
                                        Tanggal Kunjungan
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                                        value={formData.appointment_date}
                                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary-600" />
                                        Jam Konsultasi
                                    </label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                                        value={formData.appointment_time}
                                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                                    >
                                        <option value="">Pilih Jam</option>
                                        <option value="09:00">09:00 WIB</option>
                                        <option value="10:00">10:00 WIB</option>
                                        <option value="11:00">11:00 WIB</option>
                                        <option value="13:00">13:00 WIB</option>
                                        <option value="14:00">14:00 WIB</option>
                                        <option value="15:00">15:00 WIB</option>
                                        <option value="16:00">16:00 WIB</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary-600" />
                                    Keluhan / Catatan (Opsional)
                                </label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all resize-none"
                                    placeholder="Jelaskan keluhan atau gejala yang Anda rasakan..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Summary Card */}
                            {selectedDoctor && formData.appointment_date && formData.appointment_time && (
                                <div className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-200">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-primary-600" />
                                        Ringkasan Janji Temu
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Dokter:</strong> {selectedDoctor.full_name}</p>
                                        <p><strong>Tanggal:</strong> {new Date(formData.appointment_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p><strong>Jam:</strong> {formData.appointment_time} WIB</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="px-8 py-3 text-slate-700 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Konfirmasi Janji
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
