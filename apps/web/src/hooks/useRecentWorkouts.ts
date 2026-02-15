import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { WorkoutSession } from '@repo/shared/schemas'

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return undefined
}

export function useRecentWorkouts() {
  return useQuery({
    queryKey: ['recent-workouts', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Simple where query — no orderBy so no composite index required
      const q = query(collection(db, 'workout-sessions'), where('userId', '==', userId))

      const snapshot = await getDocs(q)

      const sessions = snapshot.docs
        .filter(d => !d.data().deletedAt)
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            startTime: toDate(data.startTime) || new Date(),
            endTime: toDate(data.endTime),
            completedAt: toDate(data.completedAt),
          } as WorkoutSession & { id: string }
        })

      // Sort descending and take 10 most recent
      sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

      return sessions.slice(0, 10)
    },
    enabled: !!auth.currentUser?.uid,
  })
}
