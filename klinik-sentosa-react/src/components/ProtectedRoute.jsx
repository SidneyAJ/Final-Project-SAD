import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, requiredRole = 'patient' }) {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
        return <Navigate to="/login" replace />
    }

    try {
        const user = JSON.parse(userStr)

        // Check if user role matches required role
        if (requiredRole && user.role !== requiredRole) {
            console.log(`⛔ Access Denied: Required '${requiredRole}', but user is '${user.role}'`)
            return <Navigate to="/" replace />
        }

        return children
    } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return <Navigate to="/login" replace />
    }
}
