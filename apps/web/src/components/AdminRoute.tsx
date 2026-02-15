import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import AppLoader from './AppLoader'

export default function AdminRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <AppLoader />
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
