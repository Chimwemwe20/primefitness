import { useQuery } from '@tanstack/react-query'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface AdminStats {
  totalUsers: number
  workoutsToday: number
  systemStatus: string
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Users count
      const usersColl = collection(db, 'users')
      const totalUsersSnapshot = await getCountFromServer(usersColl)

      // Workouts today (all users)
      const sessionsColl = collection(db, 'workout-sessions')
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      const startOfTomorrow = new Date(startOfToday)
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
      const workoutsTodayQuery = query(
        sessionsColl,
        where('startTime', '>=', startOfToday),
        where('startTime', '<', startOfTomorrow)
      )
      const workoutsTodaySnapshot = await getCountFromServer(workoutsTodayQuery)

      return {
        totalUsers: totalUsersSnapshot.data().count,
        workoutsToday: workoutsTodaySnapshot.data().count,
        systemStatus: 'Healthy', // Placeholder for now, or check generic connectivity
      }
    },
    // Cache for 5 minutes since these counts don't change by the second
    staleTime: 5 * 60 * 1000,
  })
}
