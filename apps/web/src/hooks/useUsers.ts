import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { User, CreateUser } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      return snapshot.docs
        .filter(d => d.data().status !== 'deleted') // filter out soft-deleted users
        .map(doc => ({ uid: doc.id, ...doc.data() }) as unknown as User)
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const snapshot = await getDoc(doc(db, 'users', id))
      if (!snapshot.exists()) return null
      const data = snapshot.data()
      // Return null if soft-deleted
      if (data.status === 'deleted') return null
      return { uid: snapshot.id, ...data } as unknown as User
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: CreateUser & { uid?: string }) => {
      const currentUserId = auth.currentUser?.uid || 'system'

      // If a uid is provided (e.g. from Firebase Auth), use setDoc to match auth UID
      if (userData.uid) {
        const userRef = doc(db, 'users', userData.uid)
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: 'user',
          status: 'active',
        })

        await logActivity(currentUserId, 'create', 'user', userData.uid, {
          email: userData.email,
          createdBy: currentUserId,
        })

        return { uid: userData.uid, ...userData }
      }

      // Fallback: auto-generated ID (admin creating a user record without auth)
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'user',
        status: 'active',
      })

      await logActivity(currentUserId, 'create', 'user', docRef.id, {
        email: userData.email,
        createdBy: currentUserId,
      })

      return { uid: docRef.id, ...userData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ uid, data }: { uid: string; data: Partial<User> }) => {
      const currentUserId = auth.currentUser?.uid || 'system'
      const userRef = doc(db, 'users', uid)

      await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })

      await logActivity(currentUserId, 'update', 'user', uid, {
        updates: data,
        updatedBy: currentUserId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/** Soft delete: sets status to 'deleted' instead of removing the document */
export function useSoftDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uid: string) => {
      const currentUserId = auth.currentUser?.uid || 'system'
      const userRef = doc(db, 'users', uid)

      await setDoc(
        userRef,
        {
          status: 'deleted',
          isActive: false,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      await logActivity(currentUserId, 'delete', 'user', uid, {
        deletedBy: currentUserId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/** Restore a soft-deleted user */
export function useRestoreUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uid: string) => {
      const currentUserId = auth.currentUser?.uid || 'system'
      const userRef = doc(db, 'users', uid)

      await setDoc(
        userRef,
        {
          status: 'active',
          isActive: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      await logActivity(currentUserId, 'update', 'user', uid, {
        action: 'restore',
        restoredBy: currentUserId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
