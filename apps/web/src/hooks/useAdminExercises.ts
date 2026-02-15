import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Exercise } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

export function useAdminExercises() {
  return useQuery({
    queryKey: ['admin-exercises'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'exercises'))
      return snapshot.docs
        .filter(d => !d.data().deletedAt)
        .map(
          d =>
            ({
              id: d.id,
              ...d.data(),
              createdAt: d.data().createdAt?.toDate(),
              updatedAt: d.data().updatedAt?.toDate(),
            }) as Exercise & { id: string }
        )
    },
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (exerciseData: Omit<Exercise, 'id'>) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const docRef = await addDoc(collection(db, 'exercises'), {
        ...exerciseData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'create', 'system', docRef.id, {
        exerciseName: exerciseData.name,
      })

      return { id: docRef.id, ...exerciseData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] })
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}

export function useUpdateExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Exercise> }) => {
      await updateDoc(doc(db, 'exercises', id), {
        ...data,
        updatedAt: serverTimestamp(),
      })

      const userId = auth.currentUser?.uid
      if (userId) {
        await logActivity(userId, 'update', 'system', id, { updates: data })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] })
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}

/** Soft delete: sets deletedAt so item is hidden from lists. */
export function useDeleteExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await updateDoc(doc(db, 'exercises', id), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const userId = auth.currentUser?.uid
      if (userId) {
        await logActivity(userId, 'delete', 'system', id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] })
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}
