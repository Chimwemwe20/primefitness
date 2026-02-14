import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { WorkoutPlan } from '@repo/shared/schemas'

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workout-plans', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Get user's personal workout plans and public templates
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
      // Templates created by admin with a special flag
      const templatesQuery = query(
        collection(db, 'workout-templates'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(templatesQuery)
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
  })
}
