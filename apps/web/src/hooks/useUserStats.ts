import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Get total workouts
      const sessionsRef = collection(db, 'workout-sessions')
      const totalQuery = query(sessionsRef, where('userId', '==', userId))
      const totalSnapshot = await getDocs(totalQuery)
      const totalWorkouts = totalSnapshot.size

      // Get workouts this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const weekQuery = query(
        sessionsRef,
        where('userId', '==', userId),
        where('startTime', '>=', oneWeekAgo)
      )
      const weekSnapshot = await getDocs(weekQuery)
      const workoutsThisWeek = weekSnapshot.size

      // Calculate streak
      const recentQuery = query(
        sessionsRef,
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      )
      const recentSnapshot = await getDocs(recentQuery)

      let streak = 0
      if (!recentSnapshot.empty) {
        const sessions = recentSnapshot.docs
          .map(doc => {
            const data = doc.data()
            return data.startTime?.toDate() || new Date()
          })
          .sort((a, b) => b.getTime() - a.getTime())

        let lastDate = new Date()
        lastDate.setHours(0, 0, 0, 0)

        for (const sessionDate of sessions) {
          const sessionDay = new Date(sessionDate)
          sessionDay.setHours(0, 0, 0, 0)

          const diffDays = Math.floor(
            (lastDate.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (diffDays <= 1) {
            streak++
            lastDate = sessionDay
          } else {
            break
          }
        }
      }

      // Get active goals
      const goalsRef = collection(db, 'goals')
      const goalsQuery = query(
        goalsRef,
        where('userId', '==', userId),
        where('status', '==', 'active')
      )
      const goalsSnapshot = await getDocs(goalsQuery)
      const activeGoals = goalsSnapshot.size

      // Get personal records (max weight for each exercise)
      const personalRecords: Array<{ exercise: string; value: string }> = []
      const exerciseMaxes = new Map<string, number>()

      totalSnapshot.docs.forEach(doc => {
        const session = doc.data()
        const exercises = session.exercises as
          | Array<{ name: string; sets?: Array<{ weight?: number; completed?: boolean }> }>
          | undefined
        exercises?.forEach(exercise => {
          exercise.sets?.forEach(set => {
            if (set.weight && set.completed) {
              const currentMax = exerciseMaxes.get(exercise.name) || 0
              if (set.weight > currentMax) {
                exerciseMaxes.set(exercise.name, set.weight)
              }
            }
          })
        })
      })

      exerciseMaxes.forEach((weight, exercise) => {
        personalRecords.push({
          exercise,
          value: `${weight} kg`,
        })
      })

      return {
        totalWorkouts,
        workoutsThisWeek,
        streak,
        activeGoals,
        personalRecords: personalRecords.slice(0, 5),
      }
    },
    enabled: !!auth.currentUser?.uid,
  })
}
