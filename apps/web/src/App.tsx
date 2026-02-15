import { AuthProvider } from './providers/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleBasedRedirect from './components/RoleBasedRedirect'
import ProtectedRoute from './components/ProtectedRoute'

// Admin
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ActivityLogs from './pages/admin/ActivityLogs'
import ExerciseManagement from './pages/admin/ExerciseManagement.tsx'
import WorkoutTemplates from './pages/admin/WorkoutTemplates.tsx'
import Settings from './pages/admin/Settings'

// User
import UserLayout from './layouts/UserLayout'
import UserDashboard from './pages/user/UserDashboard'
import Workouts from './pages/user/Workouts'
import LogWorkout from './pages/user/LogWorkout'
import WorkoutHistory from './pages/user/WorkoutHistory'
import WorkoutDetail from './pages/user/WorkoutDetail'
import Progress from './pages/user/Progress'
import Goals from './pages/user/Goals'
import UserCalendar from './pages/user/Calendar'
import UserSettings from './pages/user/Settings'

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
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Login />} />

          {/* Centralized Redirect */}
          <Route path="/app" element={<RoleBasedRedirect />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/exercises" element={<ExerciseManagement />} />
              <Route path="/admin/workout-templates" element={<WorkoutTemplates />} />
              <Route path="/admin/activity-logs" element={<ActivityLogs />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />

              {/* Workout Routes */}
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workouts/log" element={<LogWorkout />} />
              <Route path="/workouts/history" element={<WorkoutHistory />} />
              <Route path="/workouts/:id" element={<WorkoutDetail />} />

              {/* Progress & Goals */}
              <Route path="/progress" element={<Progress />} />
              <Route path="/goals" element={<Goals />} />

              {/* Calendar & Settings */}
              <Route path="/calendar" element={<UserCalendar />} />
              <Route path="/settings" element={<UserSettings />} />
            </Route>
          </Route>

          {/* Catch all / fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
