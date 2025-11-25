import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    const [isExiting, setIsExiting] = useState(false)
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        if (duration) {
            const startTime = Date.now()
            const endTime = startTime + duration

            const timer = setInterval(() => {
                const now = Date.now()
                const remaining = endTime - now
                const percentage = (remaining / duration) * 100

                if (remaining <= 0) {
                    handleClose()
                    clearInterval(timer)
                } else {
                    setProgress(percentage)
                }
            }, 10)

            return () => clearInterval(timer)
        }
    }, [duration])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(() => {
            onClose()
        }, 300) // Match animation duration
    }

    const styles = {
        success: {
            gradient: 'from-emerald-500 to-green-600',
            icon: <CheckCircle className="w-6 h-6 text-emerald-50" />,
            title: 'Berhasil!',
            shadow: 'shadow-emerald-500/30'
        },
        error: {
            gradient: 'from-red-500 to-rose-600',
            icon: <AlertCircle className="w-6 h-6 text-rose-50" />,
            title: 'Gagal!',
            shadow: 'shadow-red-500/30'
        },
        info: {
            gradient: 'from-blue-500 to-indigo-600',
            icon: <Info className="w-6 h-6 text-blue-50" />,
            title: 'Informasi',
            shadow: 'shadow-blue-500/30'
        },
        warning: {
            gradient: 'from-amber-500 to-orange-600',
            icon: <AlertTriangle className="w-6 h-6 text-amber-50" />,
            title: 'Peringatan',
            shadow: 'shadow-amber-500/30'
        }
    }

    const style = styles[type] || styles.info

    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${isExiting ? 'opacity-0 -translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
            <div className={`relative bg-gradient-to-r ${style.gradient} text-white pl-4 pr-12 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[340px] max-w-md border border-white/20 backdrop-blur-xl overflow-hidden ${style.shadow}`}>

                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>

                {/* Icon Container */}
                <div className="relative bg-white/20 p-2.5 rounded-xl backdrop-blur-sm shadow-inner">
                    {style.icon}
                </div>

                {/* Content */}
                <div className="relative flex-1 z-10">
                    <p className="font-bold text-lg tracking-wide">{style.title}</p>
                    <p className="text-white/90 text-sm font-medium leading-relaxed mt-0.5">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Progress Bar */}
                {duration && (
                    <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full">
                        <div
                            className="h-full bg-white/40 transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
