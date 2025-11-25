import { useState, useEffect } from 'react'
import { Users, Phone, CheckCircle, Clock, Activity } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import { useNavigate } from 'react-router-dom'

export default function NurseQueue() {
    const navigate = useNavigate()
    const [queue, setQueue] = useState([])
    const [currentPatient, setCurrentPatient] = useState(null)

    useEffect(() => {
        // Mock data
        setQueue([
            { id: 1, name: 'Budi Santoso', queueNo: 'A001', status: 'waiting', time: '08:00' },
            { id: 2, name: 'Siti Aminah', queueNo: 'A002', status: 'waiting', time: '08:15' },
            { id: 3, name: 'Rudi Hartono', queueNo: 'A003', status: 'waiting', time: '08:30' },
        ])
    }, [])

    const handleCall = (patient) => {
        setCurrentPatient(patient)
        // Update status in real app
    }

    const handleProcess = (patient) => {
        navigate('/nurse/vitals', { state: { patient } })
    }

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Antrean & Screening</h1>
                    <p className="text-gray-600">Kelola antrean pemeriksaan awal pasien</p>
                </div>
            </ScrollReveal>

            {/* Current Patient */}
            {currentPatient && (
                <ScrollReveal direction="up" delay={100}>
                    <div className="bg-white rounded-2xl shadow-xl border-l-4 border-pink-500 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users className="w-32 h-32 text-pink-500" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-sm font-bold text-pink-500 uppercase tracking-wider mb-2">Sedang Dipanggil</h2>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="text-4xl font-bold text-gray-800 mb-1">{currentPatient.queueNo}</div>
                                    <h3 className="text-2xl font-bold text-gray-700">{currentPatient.name}</h3>
                                </div>
                                <button
                                    onClick={() => handleProcess(currentPatient)}
                                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
                                >
                                    <Activity className="w-5 h-5" />
                                    Input Tanda Vital
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* Queue List */}
            <div className="grid gap-4">
                {queue.map((patient, idx) => (
                    <ScrollReveal key={patient.id} direction="up" delay={idx * 50}>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 text-lg">
                                    {patient.queueNo}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{patient.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{patient.time}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCall(patient)}
                                className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                title="Panggil Pasien"
                            >
                                <Phone className="w-5 h-5" />
                            </button>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
        </div>
    )
}
