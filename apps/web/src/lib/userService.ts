import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { User as FirebaseUser } from 'firebase/auth'
import type { User } from '@repo/shared/schemas'

/**
 * Creates a new user profile in Firestore
 * This should be called after successful authentication signup
 */
export const createUserProfile = async (
  firebaseUser: FirebaseUser,
  additionalData?: Partial<User>
) => {
  const userRef = doc(db, 'users', firebaseUser.uid)

  const userData: Partial<User> = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    role: 'user', // Default role
    fullname: firebaseUser.displayName || additionalData?.fullname || '',
    username: additionalData?.username || '',
    phone: firebaseUser.phoneNumber || additionalData?.phone || '',
    isActive: true,
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...additionalData,
  }

  try {
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })

    return userData
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

/**
 * Updates user's last login timestamp
 */
export const updateUserLastLogin = async (userId: string) => {
  const userRef = doc(db, 'users', userId)

  try {
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating last login:', error)
    // Don't throw - this is not critical
  }
}

/**
 * Updates user profile data
 */
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, 'users', userId)

  // Remove fields that shouldn't be updated directly
  const allowedUpdates = { ...updates }
  delete allowedUpdates.uid
  delete allowedUpdates.createdAt

  try {
    await updateDoc(userRef, {
      ...allowedUpdates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}
