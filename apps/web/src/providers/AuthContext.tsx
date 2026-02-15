import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { User as UserProfile } from '@repo/shared/schemas'
import Cookies from 'js-cookie'
import { createUserProfile, updateUserLastLogin } from '../lib/userService'
import { logActivity } from '../lib/activity'
import AppLoader from '../components/AppLoader'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser)
      if (currentUser) {
        try {
          // Get token
          const idToken = await currentUser.getIdToken()
          setToken(idToken)
          Cookies.set('token', idToken, { secure: true, sameSite: 'strict' })

          // Check if user profile exists in Firestore
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          // If user profile doesn't exist, create it (handles both new signups and Google sign-ins)
          if (!userDocSnap.exists()) {
            await createUserProfile(currentUser)
            await logActivity(currentUser.uid, 'create', 'user', currentUser.uid, {
              email: currentUser.email,
              method: currentUser.providerData[0]?.providerId || 'unknown',
            })
          } else {
            // Update last login for existing users
            await updateUserLastLogin(currentUser.uid)
          }

          // Listen to user profile changes
          const unsubscribeProfile = onSnapshot(userDocRef, snapshot => {
            if (snapshot.exists()) {
              const userData = snapshot.data() as UserProfile
              setProfile(userData)
              Cookies.set('role', userData.role, { secure: true, sameSite: 'strict' })
            } else {
              setProfile(null)
            }
            setLoading(false)
          })

          return () => {
            unsubscribeProfile()
          }
        } catch (error) {
          console.error('Error in auth listener:', error)
          setLoading(false)
        }
      } else {
        setToken(null)
        setProfile(null)
        Cookies.remove('token')
        Cookies.remove('role')
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)

    // Log login activity
    await logActivity(result.user.uid, 'login', 'system', undefined, {
      method: 'google',
      email: result.user.email,
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)

    // Log login activity
    await logActivity(result.user.uid, 'login', 'system', undefined, {
      method: 'email',
      email: result.user.email,
    })
  }

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)

    // User profile creation and activity logging are handled in onAuthStateChanged
    // This ensures it works for both email signup and Google sign-in
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setProfile(null)
    setToken(null)
    Cookies.remove('token')
    Cookies.remove('role')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        token,
      }}
    >
      {loading ? <AppLoader /> : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
