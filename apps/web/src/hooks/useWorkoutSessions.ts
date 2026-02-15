import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { WorkoutSession } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

export function useWorkoutSessions() {
  return useQuery({
    queryKey: ['workout-sessions', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const q = query(
        collection(db, 'workout-sessions'),
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate() || new Date(),
          endTime: data.endTime?.toDate(),
          completedAt: data.completedAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
        } as WorkoutSession & { id: string }
      })
    },
    enabled: !!auth.currentUser?.uid,
  })
}

export function useWorkoutSession(id: string) {
  return useQuery({
    queryKey: ['workout-session', id],
    queryFn: async () => {
      const snapshot = await getDoc(doc(db, 'workout-sessions', id))
      if (!snapshot.exists()) return null

      const data = snapshot.data()
      return {
        id: snapshot.id,
        ...data,
        startTime: data.startTime?.toDate() || new Date(),
        endTime: data.endTime?.toDate(),
        completedAt: data.completedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as WorkoutSession & { id: string }
    },
    enabled: !!id,
  })
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionData: Omit<WorkoutSession, 'id' | 'userId' | 'createdAt'>) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const docRef = await addDoc(collection(db, 'workout-sessions'), {
        ...sessionData,
        userId,
        startTime: serverTimestamp(),
        createdAt: serverTimestamp(),
      })

      await logActivity(userId, 'create', 'workout-plan', docRef.id, {
        title: sessionData.title,
      })

      return { id: docRef.id, ...sessionData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['recent-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useUpdateWorkoutSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkoutSession> }) => {
      const sessionRef = doc(db, 'workout-sessions', id)
      await updateDoc(sessionRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      const userId = auth.currentUser?.uid
      if (userId && data.completedAt) {
        await logActivity(userId, 'update', 'workout-plan', id, {
          completed: true,
        })
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['workout-session', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['recent-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useDeleteWorkoutSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'workout-sessions', id))

      const userId = auth.currentUser?.uid
      if (userId) {
        await logActivity(userId, 'delete', 'workout-plan', id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['recent-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}
