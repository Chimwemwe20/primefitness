import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import type { Role } from '@repo/shared/schemas'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to their appropriate dashboard based on their role
    switch (profile.role) {
      case 'admin':
        return <Navigate to="/admin" replace />
      case 'coach':
        return <Navigate to="/coach" replace />
      case 'user':
      default:
        return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
