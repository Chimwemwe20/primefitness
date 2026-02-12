import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
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
      // In a real app, you might want to use auth.currentUser.uid here
      // For this boilerplate, we'll assume a system user or let Firestore handle IDs if allow write
      // However, typically users are created via Auth, and we just create a profile document.
      // Assuming this is a profile creation or admin creating a user document:

      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Default values usually handled by backend or triggers, but setting here for Spark compatibility
        role: 'user',
        status: 'active',
      })

      // Log the activity
      // Using a placeholder userId since we might not have auth context in this hook yet
      await logActivity('system', 'create', 'user', docRef.id, { email: userData.email })

      return { uid: docRef.id, ...userData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
