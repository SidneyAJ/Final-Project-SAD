import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Info, AlertTriangle, X } from 'lucide-react'

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)

        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            clearInterval(interval)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const markAsRead = async () => {
        if (unreadCount === 0) return

        try {
            await fetch('http://localhost:3000/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setUnreadCount(0)
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })))
        } catch (error) {
            console.error('Error marking notifications as read:', error)
        }
    }

    const toggleDropdown = () => {
        if (!isOpen) {
            markAsRead()
        }
        setIsOpen(!isOpen)
    }

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <Check className="w-5 h-5 text-green-500" />
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
            case 'error': return <X className="w-5 h-5 text-red-500" />
            default: return <Info className="w-5 h-5 text-blue-500" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                        <span className="text-xs text-gray-500">{notifications.length} Terbaru</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">Belum ada notifikasi</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{notif.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            {new Date(notif.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
