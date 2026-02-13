import { AuthProvider } from './providers/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
