import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { WorkoutSession } from '@repo/shared/schemas'

export function useRecentWorkouts() {
  return useQuery({
    queryKey: ['recent-workouts', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const q = query(
        collection(db, 'workout-sessions'),
        where('userId', '==', userId),
        orderBy('startTime', 'desc'),
        limit(10)
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
        } as WorkoutSession & { id: string }
      })
    },
    enabled: !!auth.currentUser?.uid,
  })
}
