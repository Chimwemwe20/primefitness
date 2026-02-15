import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import AppLoader from './AppLoader'
import type { Role } from '@repo/shared/schemas'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <AppLoader />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
