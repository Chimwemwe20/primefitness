import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'

export default function AdminRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
