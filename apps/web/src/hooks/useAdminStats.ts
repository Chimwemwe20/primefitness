import { useQuery } from '@tanstack/react-query'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Users count
      const usersColl = collection(db, 'users')
      const totalUsersSnapshot = await getCountFromServer(usersColl)

      // Active Coaches count (assuming role='coach' and status='active' or isActive=true)
      const coachesQuery = query(usersColl, where('role', '==', 'coach'))
      const coachesSnapshot = await getCountFromServer(coachesQuery)

      return {
        totalUsers: totalUsersSnapshot.data().count,
        activeCoaches: coachesSnapshot.data().count,
        systemStatus: 'Healthy', // Placeholder for now, or check generic connectivity
      }
    },
    // Cache for 5 minutes since these counts don't change by the second
    staleTime: 5 * 60 * 1000,
  })
}
