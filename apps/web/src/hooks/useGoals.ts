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
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Goal } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

export function useGoals() {
  return useQuery({
    queryKey: ['goals', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const q = query(collection(db, 'goals'), where('userId', '==', userId))

      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data()

        // Helper to safely convert Firestore timestamp/string/date to Date object
        const toDate = (val: unknown): Date | undefined => {
          if (!val) return undefined
          if (val instanceof Timestamp) return val.toDate()
          if (val instanceof Date) return val
          if (typeof val === 'string') return new Date(val)
          return undefined
        }

        return {
          id: docSnapshot.id,
          ...data,
          startDate: toDate(data.startDate),
          targetDate: toDate(data.targetDate),
          completedAt: toDate(data.completedAt),
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          deletedAt: toDate(data.deletedAt),
        } as Goal
      })

      // Client-side filtering and sorting to avoid composite index requirement
      return data
        .filter(goal => !goal.deletedAt)
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
    },
    enabled: !!auth.currentUser?.uid,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    ) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Remove undefined values as Firestore doesn't support them
      const cleanedData = Object.fromEntries(
        Object.entries(goalData).filter(([, v]) => v !== undefined)
      )

      const docRef = await addDoc(collection(db, 'goals'), {
        ...cleanedData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
      })

      await logActivity(userId, 'create', 'goal', docRef.id, {
        title: goalData.title,
        type: goalData.type,
      })

      return { id: docRef.id, ...goalData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Remove undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      )

      const formattedData = {
        ...cleanedData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, 'goals', id), formattedData)

      if (data.status === 'completed') {
        await logActivity(userId, 'complete', 'goal', id, {
          status: 'completed',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Soft delete: update deletedAt instead of deleting document
      await updateDoc(doc(db, 'goals', id), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'delete', 'goal', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
