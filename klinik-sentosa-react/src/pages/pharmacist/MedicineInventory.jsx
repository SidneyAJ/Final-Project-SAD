import { useState, useEffect } from 'react'
import { Package, Plus, Search, Edit2, AlertTriangle, Filter } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function MedicineInventory() {
    const [medicines, setMedicines] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        name: '', category: '', stock: 0, unit: 'pcs', price: 0, expiry_date: ''
    })
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        fetchMedicines()
    }, [])

    const fetchMedicines = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/pharmacy/medicines', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setMedicines(data)
            }
        } catch (error) {
            console.error('Error fetching medicines:', error)
            setToast({ show: true, message: 'Gagal memuat data obat', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/pharmacy/medicines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setToast({ show: true, message: 'Obat berhasil ditambahkan ke inventaris!', type: 'success' })
                setShowModal(false)
                setFormData({ name: '', category: '', stock: 0, unit: 'pcs', price: 0, expiry_date: '' })
                fetchMedicines()
            } else {
                setToast({ show: true, message: 'Gagal menambahkan obat', type: 'error' })
            }
        } catch (error) {
            console.error('Error adding medicine:', error)
            setToast({ show: true, message: 'Terjadi kesalahan saat menambah obat', type: 'error' })
        }
    }

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Stok Obat</h1>
                        <p className="text-slate-500">Kelola inventaris obat dan stok klinik</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Obat
                    </button>
                </div>
            </ScrollReveal>

            {/* Search & Filter */}
            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama obat atau kategori..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </ScrollReveal>

            {/* Medicine List */}
            <ScrollReveal direction="up" delay={200}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMedicines.map((medicine) => (
                        <div key={medicine.id} className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-50 hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Package className="w-6 h-6" />
                                </div>
                                {medicine.stock <= 10 && (
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Stok Rendah
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{medicine.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{medicine.category || 'Umum'}</p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Stok:</span>
                                    <span className={`font-bold ${medicine.stock <= 10 ? 'text-red-600' : 'text-slate-800'}`}>
                                        {medicine.stock} {medicine.unit}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Harga:</span>
                                    <span className="font-bold text-emerald-600">Rp {medicine.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Exp:</span>
                                    <span className="text-slate-800">
                                        {medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                </div>
                            </div>

                            <button className="w-full mt-4 py-2 border border-emerald-200 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                                <Edit2 className="w-4 h-4" /> Edit Detail
                            </button>
                        </div>
                    ))}
                </div>
            </ScrollReveal>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-emerald-50">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Obat Baru</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Obat</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Satuan</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Stok Awal</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Harga (Rp)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal Kadaluarsa</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    value={formData.expiry_date}
                                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
                                >
                                    Simpan Obat
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
