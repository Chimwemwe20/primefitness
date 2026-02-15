import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { WorkoutPlan } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workout-plans', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const userPlansQuery = query(
        collection(db, 'workout-plans'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(userPlansQuery)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as WorkoutPlan & { id: string }
      })
    },
    enabled: !!auth.currentUser?.uid,
  })
}

export function usePublicWorkoutTemplates() {
  return useQuery({
    queryKey: ['public-workout-templates'],
    queryFn: async () => {
      const templatesQuery = query(
        collection(db, 'workout-templates'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(templatesQuery)
      return snapshot.docs
        .filter(d => d.data().status !== 'deleted')
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as WorkoutPlan & { id: string }
        })
    },
  })
}

/** Create a personal workout plan for the current user */
export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (planData: Omit<WorkoutPlan, 'id' | 'userId' | 'status'>) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const docRef = await addDoc(collection(db, 'workout-plans'), {
        ...planData,
        userId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'create', 'workout-plan', docRef.id, {
        title: planData.title,
      })

      return { id: docRef.id, ...planData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] })
    },
  })
}

/** Update an existing workout plan */
export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkoutPlan> }) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      await updateDoc(doc(db, 'workout-plans', id), {
        ...data,
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'update', 'workout-plan', id, {
        updates: Object.keys(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] })
    },
  })
}

/** Soft delete: sets status to 'deleted' */
export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      await updateDoc(doc(db, 'workout-plans', id), {
        status: 'deleted',
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'delete', 'workout-plan', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] })
    },
  })
}

/** Archive a workout plan (soft, recoverable) */
export function useArchiveWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      await updateDoc(doc(db, 'workout-plans', id), {
        status: 'archived',
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'update', 'workout-plan', id, { status: 'archived' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] })
    },
  })
}
