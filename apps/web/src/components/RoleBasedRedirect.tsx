import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'

export default function RoleBasedRedirect() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // If we have a user but no profile yet (fetching or error), wait or handle it.
  // Ideally AuthContext auth state change handles the profile fetch, so if !loading and user exists,
  // profile should be either available or null (if doc missing).

  if (!profile) {
    // Fallback if profile missing but user exists usually implies new user or error
    // For now, send to a general dashboard or onboarding if we had one.
    // Let's assume 'user' role default for now or handle explicitly.
    return <Navigate to="/dashboard" replace />
  }

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
