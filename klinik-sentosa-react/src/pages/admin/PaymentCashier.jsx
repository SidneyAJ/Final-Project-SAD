import { useState, useEffect } from 'react'
import { DollarSign, CreditCard, CheckCircle, Clock, Printer, Plus, Search } from 'lucide-react'
import ScrollReveal from '../../components/ScrollReveal'
import Toast from '../../components/Toast'

export default function PaymentCashier() {
    const [payments, setPayments] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setPayments(data)
            }
        } catch (error) {
            console.error('Error fetching payments:', error)
            setToast({ show: true, message: 'Gagal memuat data pembayaran', type: 'error' })
        }
    }

    const handlePay = async () => {
        if (!selectedPayment) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:3000/api/payments/${selectedPayment.id}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ payment_method: paymentMethod })
            })

            if (response.ok) {
                setToast({ show: true, message: 'Pembayaran berhasil diproses!', type: 'success' })
                setShowModal(false)
                fetchPayments()
            } else {
                setToast({ show: true, message: 'Gagal memproses pembayaran', type: 'error' })
            }
        } catch (error) {
            console.error('Error processing payment:', error)
            setToast({ show: true, message: 'Terjadi kesalahan saat memproses pembayaran', type: 'error' })
        }
    }

    const openPaymentModal = (payment) => {
        setSelectedPayment(payment)
        setShowModal(true)
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
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Kasir & Pembayaran</h1>
                        <p className="text-slate-600">Kelola tagihan dan pembayaran pasien</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/30">
                        <Plus className="w-5 h-5" />
                        Buat Tagihan Baru
                    </button>
                </div>
            </ScrollReveal>

            {/* Payment List */}
            <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Tagihan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pasien</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            Belum ada data pembayaran
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-slate-600">#{payment.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{payment.patient_name}</p>
                                                <p className="text-xs text-slate-500">{payment.nik}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{payment.description}</td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                Rp {payment.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {payment.status === 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                        <CheckCircle className="w-3 h-3" /> Lunas
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                        <Clock className="w-3 h-3" /> Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {payment.status === 'pending' ? (
                                                    <button
                                                        onClick={() => openPaymentModal(payment)}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Bayar
                                                    </button>
                                                ) : (
                                                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Cetak Struk">
                                                        <Printer className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollReveal>

            {/* Payment Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Proses Pembayaran</h3>
                            <p className="text-sm text-slate-500">Tagihan #{selectedPayment.id} - {selectedPayment.patient_name}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-slate-500 mb-1">Total Tagihan</p>
                                <h2 className="text-3xl font-bold text-slate-800">Rp {selectedPayment.amount.toLocaleString()}</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Metode Pembayaran</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['cash', 'card', 'qris'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all ${paymentMethod === method
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {method.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handlePay}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
                            >
                                Konfirmasi Pembayaran
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 text-slate-500 font-bold hover:text-slate-700"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
