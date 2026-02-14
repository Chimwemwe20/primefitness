import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
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

      const q = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          targetDate: data.targetDate?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Goal & { id: string }
      })
    },
    enabled: !!auth.currentUser?.uid,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalData: Omit<Goal, 'id'>) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const docRef = await addDoc(collection(db, 'goals'), {
        ...goalData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await logActivity(userId, 'create', 'profile', docRef.id, {
        title: goalData.title,
        type: goalData.type,
      })

      return { id: docRef.id, ...goalData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
      const goalRef = doc(db, 'goals', id)
      await updateDoc(goalRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      const userId = auth.currentUser?.uid
      if (userId && data.status === 'completed') {
        await logActivity(userId, 'update', 'profile', id, {
          goalCompleted: true,
          title: data.title,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'goals', id))

      const userId = auth.currentUser?.uid
      if (userId) {
        await logActivity(userId, 'delete', 'profile', id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}
