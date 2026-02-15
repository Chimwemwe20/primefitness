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
        limit(20) // fetch more to account for soft-deleted
      )

      const snapshot = await getDocs(q)

      return snapshot.docs
        .filter(d => !d.data().deletedAt)
        .slice(0, 10)
        .map(doc => {
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
