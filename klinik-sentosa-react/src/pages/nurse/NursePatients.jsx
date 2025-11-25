import { useState, useEffect } from 'react'
import { Users, Search, FileText } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'

export default function NursePatients() {
    const [patients, setPatients] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Mock data
        setPatients([
            { id: 1, name: 'Budi Santoso', nik: '3201012345678901', lastVisit: '2024-11-20' },
            { id: 2, name: 'Siti Aminah', nik: '3201012345678902', lastVisit: '2024-11-21' },
            { id: 3, name: 'Rudi Hartono', nik: '3201012345678903', lastVisit: '2024-11-22' },
        ])
    }, [])

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nik.includes(searchQuery)
    )

    return (
        <div className="space-y-6">
            <ScrollReveal direction="up">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Daftar Pasien</h1>
                    <p className="text-gray-600">Cari data pasien terdaftar</p>
                </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIK..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                        />
                    </div>
                </div>
            </ScrollReveal>

            <div className="space-y-4">
                {filteredPatients.map((patient, idx) => (
                    <ScrollReveal key={patient.id} direction="up" delay={idx * 50}>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                                    {patient.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{patient.name}</h4>
                                    <p className="text-xs text-gray-500">NIK: {patient.nik}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Terakhir: {patient.lastVisit}</p>
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
        </div>
    )
}
