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
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }) as unknown as User)
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const snapshot = await getDoc(doc(db, 'users', id))
      if (!snapshot.exists()) return null
      return { uid: snapshot.id, ...snapshot.data() } as unknown as User
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: CreateUser) => {
      const currentUserId = auth.currentUser?.uid || 'system'

      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'user',
        status: 'active',
      })

      // Log the activity with the current user who performed the action
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

      // Log activity with the user who made the change
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
