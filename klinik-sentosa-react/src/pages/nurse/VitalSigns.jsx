import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Activity, Heart, Thermometer, Scale, Ruler, Save, User } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function VitalSigns() {
    const location = useLocation()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(location.state?.patient || null)
    const [formData, setFormData] = useState({
        bloodPressure: '',
        temperature: '',
        heartRate: '',
        respiratoryRate: '',
        weight: '',
        height: '',
        notes: ''
    })
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // API call to save vitals
        setToast({ show: true, message: 'Tanda vital berhasil disimpan!', type: 'success' })
        setTimeout(() => {
            navigate('/nurse/queue')
        }, 2000)
    }

    return (
        <div className="space-y-6 relative">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Input Tanda Vital</h1>
                    <p className="text-gray-600">Catat data fisik awal pasien sebelum pemeriksaan dokter</p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info Card */}
                <div className="lg:col-span-1">
                    <ScrollReveal direction="right">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-500" />
                                Data Pasien
                            </h3>
                            {patient ? (
                                <div className="space-y-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-xl mb-4">
                                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-purple-600">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <h4 className="font-bold text-lg text-gray-800">{patient.name}</h4>
                                        <p className="text-purple-600 font-medium">{patient.queueNo}</p>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>ID Pasien:</span>
                                            <span className="font-medium">#12345</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Usia:</span>
                                            <span className="font-medium">32 Tahun</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Gender:</span>
                                            <span className="font-medium">Laki-laki</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Silakan pilih pasien dari antrean terlebih dahulu</p>
                                    <button
                                        onClick={() => navigate('/nurse/queue')}
                                        className="mt-4 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100"
                                    >
                                        Ke Antrean
                                    </button>
                                </div>
                            )}
                        </div>
                    </ScrollReveal>
                </div>

                {/* Input Form */}
                <div className="lg:col-span-2">
                    <ScrollReveal direction="up" delay={100}>
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Blood Pressure */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Activity className="w-4 h-4 inline mr-2 text-red-500" />
                                        Tekanan Darah (mmHg)
                                    </label>
                                    <input
                                        type="text"
                                        name="bloodPressure"
                                        value={formData.bloodPressure}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="120/80"
                                        required
                                    />
                                </div>

                                {/* Heart Rate */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Heart className="w-4 h-4 inline mr-2 text-red-500" />
                                        Denyut Nadi (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        name="heartRate"
                                        value={formData.heartRate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="72"
                                        required
                                    />
                                </div>

                                {/* Temperature */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Thermometer className="w-4 h-4 inline mr-2 text-orange-500" />
                                        Suhu Tubuh (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="temperature"
                                        value={formData.temperature}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="36.5"
                                        required
                                    />
                                </div>

                                {/* Respiratory Rate */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Activity className="w-4 h-4 inline mr-2 text-blue-500" />
                                        Laju Pernapasan (x/menit)
                                    </label>
                                    <input
                                        type="number"
                                        name="respiratoryRate"
                                        value={formData.respiratoryRate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="18"
                                    />
                                </div>

                                {/* Weight */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Scale className="w-4 h-4 inline mr-2 text-green-500" />
                                        Berat Badan (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="65.5"
                                    />
                                </div>

                                {/* Height */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Ruler className="w-4 h-4 inline mr-2 text-blue-500" />
                                        Tinggi Badan (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="170"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    placeholder="Keluhan awal pasien atau catatan observasi..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Simpan Data
                            </button>
                        </form>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    )
}
