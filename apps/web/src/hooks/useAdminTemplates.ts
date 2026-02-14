import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { WorkoutPlan } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

export function useAdminTemplates() {
  return useQuery({
    queryKey: ['admin-templates'],
    queryFn: async () => {
      const q = query(collection(db, 'workout-templates'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          }) as WorkoutPlan & { id: string }
      )
    },
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateData: Omit<WorkoutPlan, 'id' | 'userId' | 'status'>) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const docRef = await addDoc(collection(db, 'workout-templates'), {
        ...templateData,
        userId: 'admin', // Templates are owned by system/admin
        status: 'active',
        isPublic: true, // Templates are public by default
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'create', 'system', docRef.id, {
        templateTitle: templateData.title,
      })

      return { id: docRef.id, ...templateData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      queryClient.invalidateQueries({ queryKey: ['public-workout-templates'] })
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkoutPlan> }) => {
      await updateDoc(doc(db, 'workout-templates', id), {
        ...data,
        updatedAt: serverTimestamp(),
      })

      const userId = auth.currentUser?.uid
      if (userId) {
        await logActivity(userId, 'update', 'system', id, { updates: data })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      queryClient.invalidateQueries({ queryKey: ['public-workout-templates'] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'workout-templates', id))

      const userId = auth.currentUser?.uid
      if (userId) {
        await logActivity(userId, 'delete', 'system', id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
      queryClient.invalidateQueries({ queryKey: ['public-workout-templates'] })
    },
  })
}
