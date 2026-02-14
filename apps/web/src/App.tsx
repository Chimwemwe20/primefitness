import { AuthProvider } from './providers/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleBasedRedirect from './components/RoleBasedRedirect'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ActivityLogs from './pages/admin/ActivityLogs'
import Settings from './pages/admin/Settings'
import UserDashboard from './pages/user/UserDashboard'

/**
 * Main App Component
 *
 * This is the "main stage" of our application. Everything you see
 * in the browser starts here!
 */
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Login />} />

          {/* Centralized Redirect */}
          <Route path="/app" element={<RoleBasedRedirect />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/activity-logs" element={<ActivityLogs />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* User Routes - Only for regular users */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* Coach Routes - Add when coach pages are ready */}
          <Route element={<ProtectedRoute allowedRoles={['coach']} />}>
            <Route
              path="/coach"
              element={<div className="p-8 text-center">Coach Dashboard Coming Soon</div>}
            />
          </Route>

          {/* Catch all / fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
