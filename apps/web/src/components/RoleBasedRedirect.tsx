import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import AppLoader from './AppLoader'

/**
 * After login, redirect to the correct destination by role.
 * Waits for profile so role is known before routing.
 */
export default function RoleBasedRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <AppLoader />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!profile) {
    return <AppLoader />
  }

  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/dashboard" replace />
}
