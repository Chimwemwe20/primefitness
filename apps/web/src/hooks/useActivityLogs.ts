import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { ActivityLog } from '@repo/shared/schemas'

export function useActivityLogs() {
  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      // In a real app with many logs, use pagination. checking limit 50.
      const q = query(collection(db, 'activity-logs'), orderBy('timestamp', 'desc'), limit(50))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        // Convert Firestore Timestamp to Date if needed, or handle in UI
        return {
          id: doc.id,
          ...data,
          // Handle timestamp conversion safely
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        }
      }) as unknown as ActivityLog[]
    },
  })
}
