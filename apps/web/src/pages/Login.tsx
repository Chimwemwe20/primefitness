import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../providers/AuthContext'
import { useEffect } from 'react'

export default function AuthPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/app')
    }
  }, [user, authLoading, navigate])

  const handleEmailAuth = async () => {
    setError('')
    setResetEmailSent(false)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // test

    setLoading(true)

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/app')
    } catch (err) {
      console.error('Auth error:', err)

      const error = err as { code?: string; message?: string }

      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password')
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later')
      } else {
        setError(error.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError('')
    setResetEmailSent(false)
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)

      navigate('/app')
    } catch (err) {
      console.error('Google auth error:', err)

      const error = err as { code?: string; message?: string }

      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups for this site')
      } else {
        setError(error.message || 'Google authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setResetEmailSent(false)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setResetEmailSent(true)
    } catch (err) {
      console.error('Password reset error:', err)

      const error = err as { code?: string; message?: string }

      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else {
        setError(error.message || 'Failed to send reset email')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleEmailAuth()
    }
  }

  return (
    <div className="auth-page min-h-screen bg-black text-neutral-100">
      {/* Heavy grain overlay */}
      <div
        className="grain-overlay fixed inset-0 pointer-events-none z-[100] opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          mixBlendMode: 'overlay',
        }}
      ></div>

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none z-[90]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      ></div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-blob floating-blob-1"></div>
        <div className="floating-blob floating-blob-2"></div>
        <div className="floating-blob floating-blob-3"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b-2 border-neutral-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <a href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 flex items-center justify-center border-2 border-neutral-700 relative overflow-hidden transition-all duration-300 group-hover:border-neutral-600">
                <span className="bebas text-2xl sm:text-3xl text-neutral-200 relative z-10">F</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
              </div>
              <span className="bebas text-xl sm:text-3xl text-neutral-100 tracking-[0.15em]">
                PRIME<span className="text-neutral-600">FIT</span>
              </span>
            </a>

            <a
              href="/"
              className="text-neutral-500 hover:text-neutral-100 transition-colors duration-300 text-sm sm:text-base font-medium tracking-wide"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </nav>

      {/* Main Auth Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-up">
            <h1 className="bebas text-6xl sm:text-7xl text-neutral-100 mb-4 tracking-tight leading-none">
              {isSignUp ? 'JOIN THE ELITE' : 'WELCOME BACK'}
            </h1>
            <p className="text-neutral-500 text-base sm:text-lg font-light">
              {isSignUp
                ? 'Start your transformation journey today'
                : 'Continue your path to greatness'}
            </p>
          </div>

          {/* Auth Card */}
          <Card
            className="p-8 sm:p-10 bg-neutral-950/90 backdrop-blur-md border-2 border-neutral-900 animate-slide-up shadow-2xl"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-950/50 border-2 border-red-900 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Success Message */}
            {resetEmailSent && (
              <div className="mb-6 p-4 bg-green-950/50 border-2 border-green-900 text-green-400 text-sm font-medium">
                Password reset email sent! Check your inbox.
              </div>
            )}

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="auth-button w-full py-4 sm:py-5 mb-5 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-800 hover:border-neutral-700 text-neutral-100 transition-all duration-300 bebas text-lg tracking-[0.15em] rounded-none"
            >
              <svg className="w-5 h-5 mr-2 inline-block" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'LOADING...' : 'Continue with Google'}
            </Button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-neutral-900"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-neutral-950 text-neutral-600 uppercase tracking-[0.2em] font-bold">
                  Or
                </span>
              </div>
            </div>

            {/* Email/Password Inputs */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-[0.2em] mb-3 font-bold">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="auth-input w-full px-5 py-4 rounded-none text-base"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-[0.2em] mb-3 font-bold">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  disabled={loading}
                  className="auth-input w-full px-5 py-4 rounded-none text-base"
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-[0.2em] mb-3 font-bold">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    disabled={loading}
                    className="auth-input w-full px-5 py-4 rounded-none text-base"
                  />
                </div>
              )}

              {!isSignUp && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-50 tracking-wide font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                onClick={handleEmailAuth}
                disabled={loading}
                className="auth-button w-full py-4 sm:py-5 bg-neutral-200 text-black hover:bg-neutral-100 transition-all duration-300 bebas text-xl tracking-[0.15em] rounded-none mt-6 shadow-xl hover:shadow-2xl hover:shadow-neutral-200/10 border-2 border-transparent hover:border-neutral-300 group relative overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? 'LOADING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </div>

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500 font-light">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                    setResetEmailSent(false)
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  disabled={loading}
                  className="text-neutral-300 hover:text-neutral-100 font-bold transition-colors disabled:opacity-50"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Terms */}
            {isSignUp && (
              <p className="mt-8 text-xs text-neutral-600 text-center font-light leading-relaxed">
                By signing up, you agree to our{' '}
                <a
                  href="/terms"
                  className="text-neutral-500 hover:text-neutral-400 transition-colors font-medium"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-neutral-500 hover:text-neutral-400 transition-colors font-medium"
                >
                  Privacy Policy
                </a>
              </p>
            )}
          </Card>

          {/* Additional Info */}
          <div className="mt-10 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              <div className="text-center">
                <div className="bebas text-3xl text-neutral-400 mb-2 bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-600 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-xs text-neutral-700 uppercase tracking-[0.15em] font-medium">
                  Members
                </div>
              </div>
              <div className="text-center">
                <div className="bebas text-3xl text-neutral-400 mb-2 bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-xs text-neutral-700 uppercase tracking-[0.15em] font-medium">
                  Success
                </div>
              </div>
              <div className="text-center">
                <div className="bebas text-3xl text-neutral-400 mb-2 bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-xs text-neutral-700 uppercase tracking-[0.15em] font-medium">
                  Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
