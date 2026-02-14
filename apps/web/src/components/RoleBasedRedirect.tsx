// Update to remove coach
import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'

export default function RoleBasedRedirect() {
  const { profile, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!profile) {
    return <Navigate to="/auth" replace />
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  // Default to user dashboard
  return <Navigate to="/dashboard" replace />
}
