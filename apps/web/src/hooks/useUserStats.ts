import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

/** Safely convert a Firestore Timestamp (or Date, or null) to a Date */
function toDate(value: unknown): Date | undefined {
  if (!value) return undefined
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return undefined
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats', auth.currentUser?.uid],
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // Fetch all sessions for this user in one read (no orderBy = no composite index needed)
      const sessionsRef = collection(db, 'workout-sessions')
      const userQuery = query(sessionsRef, where('userId', '==', userId))
      const snapshot = await getDocs(userQuery)

      // Filter out soft-deleted sessions once, reuse everywhere
      const activeDocs = snapshot.docs.filter(d => !d.data().deletedAt)
      const totalWorkouts = activeDocs.length

      // --- Workouts this week ---
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const workoutsThisWeek = activeDocs.filter(d => {
        const start = toDate(d.data().startTime)
        return start && start >= oneWeekAgo
      }).length

      // --- Streak ---
      const sessionDates = activeDocs
        .map(d => toDate(d.data().startTime))
        .filter((d): d is Date => !!d)
        .sort((a, b) => b.getTime() - a.getTime())

      let streak = 0
      if (sessionDates.length > 0) {
        let lastDate = new Date()
        lastDate.setHours(0, 0, 0, 0)

        for (const sessionDate of sessionDates) {
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

      // --- Active goals ---
      const goalsRef = collection(db, 'goals')
      const goalsQuery = query(
        goalsRef,
        where('userId', '==', userId),
        where('status', '==', 'active')
      )
      const goalsSnapshot = await getDocs(goalsQuery)
      const activeGoals = goalsSnapshot.size

      // --- Personal records (max weight per exercise) ---
      const exerciseMaxes = new Map<string, number>()

      activeDocs.forEach(doc => {
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

      const personalRecords: Array<{ exercise: string; value: string }> = []
      exerciseMaxes.forEach((weight, exercise) => {
        personalRecords.push({ exercise, value: `${weight} kg` })
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
