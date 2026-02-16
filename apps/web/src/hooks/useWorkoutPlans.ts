import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { WorkoutPlan, WorkoutExercise } from '@repo/shared/schemas'
import { logActivity } from '../lib/activity'

// ── Helpers ────────────────────────────────────────────────

/**
 * Strip undefined values from an object so Firestore never chokes.
 * Handles nested objects and arrays recursively.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => {
        if (Array.isArray(v))
          return [
            k,
            v.map(item =>
              typeof item === 'object' && item !== null
                ? stripUndefined(item as Record<string, unknown>)
                : item
            ),
          ]
        if (typeof v === 'object' && v !== null && !(v instanceof Date))
          return [k, stripUndefined(v as Record<string, unknown>)]
        return [k, v]
      })
  ) as T
}

/** Sanitize exercises for Firestore — strips undefined and trims strings */
function sanitizeExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises
    .filter(ex => ex.name.trim() !== '')
    .map(
      ex =>
        stripUndefined({
          name: ex.name.trim(),
          sets: ex.sets,
          reps: ex.reps,
          ...(ex.weight != null && { weight: ex.weight }),
          ...(ex.rest != null && { rest: ex.rest }),
          ...(ex.notes?.trim() && { notes: ex.notes.trim() }),
        }) as WorkoutExercise
    )
}

/** Silent activity logging — never blocks the main operation */
async function safeLogActivity(...args: Parameters<typeof logActivity>) {
  try {
    await logActivity(...args)
  } catch (err) {
    console.warn('[activity-log] failed silently:', err)
  }
}

/** Check if an active plan with the same title already exists for the given user */
async function checkDuplicateTitle(userId: string, title: string): Promise<boolean> {
  if (!userId) return false
  const snapshot = await getDocs(
    query(
      collection(db, 'workout-plans'),
      where('userId', '==', userId),
      where('status', '==', 'active')
    )
  )
  return snapshot.docs.some(d => d.data().title.trim().toLowerCase() === title.trim().toLowerCase())
}

// ── Query keys (centralised for easy invalidation) ─────────

const planKeys = {
  all: ['workout-plans'] as const,
  user: (uid: string) => ['workout-plans', uid] as const,
  templates: ['public-workout-templates'] as const,
}

// ── Queries ────────────────────────────────────────────────

export function useWorkoutPlans() {
  return useQuery({
    queryKey: planKeys.user(auth.currentUser?.uid ?? ''),
    queryFn: async () => {
      const userId = auth.currentUser?.uid
      console.log('useWorkoutPlans - userId:', userId)
      if (!userId) throw new Error('Not authenticated')

      const snapshot = await getDocs(
        query(
          collection(db, 'workout-plans'),
          where('userId', '==', userId),
          where('status', '==', 'active')
        )
      )

      return snapshot.docs
        .map(d => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
            updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
          } as WorkoutPlan & { id: string }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    },
    enabled: !!auth.currentUser?.uid,
  })
}

export function usePublicWorkoutTemplates() {
  return useQuery({
    queryKey: planKeys.templates,
    queryFn: async () => {
      const snapshot = await getDocs(
        query(
          collection(db, 'workout-templates'),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc')
        )
      )

      return snapshot.docs
        .filter(d => d.data().status !== 'deleted')
        .map(d => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as WorkoutPlan & { id: string }
        })
    },
  })
}

// ── Mutations ──────────────────────────────────────────────

type CreatePlanInput = Omit<WorkoutPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (planData: CreatePlanInput) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      const exercises = sanitizeExercises(planData.exercises)
      if (!planData.title.trim()) throw new Error('Plan must have a title')
      if (exercises.length === 0) throw new Error('Add at least one exercise')

      // Check for duplicate title among active plans in Firestore
      const isDuplicate = await checkDuplicateTitle(userId, planData.title)
      if (isDuplicate) {
        throw new Error('A workout plan with this title already exists.')
      }

      const payload = stripUndefined({
        title: planData.title.trim(),
        description: planData.description?.trim() || '',
        exercises,
        userId,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const docRef = await addDoc(collection(db, 'workout-plans'), payload)

      // Non-blocking activity log
      safeLogActivity(userId, 'create', 'workout-plan', docRef.id, {
        title: planData.title,
      })

      return {
        id: docRef.id,
        title: payload.title,
        description: payload.description,
        exercises,
        userId,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },

    // Optimistic: immediately show the new plan in the list
    onMutate: async planData => {
      const userId = auth.currentUser?.uid ?? ''
      const key = planKeys.user(userId)

      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<(WorkoutPlan & { id: string })[]>(key)

      const optimisticPlan: WorkoutPlan & { id: string } = {
        id: `temp-${Date.now()}`,
        title: planData.title.trim(),
        description: planData.description?.trim() || '',
        exercises: sanitizeExercises(planData.exercises),
        userId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      queryClient.setQueryData<(WorkoutPlan & { id: string })[]>(key, old => [
        optimisticPlan,
        ...(old ?? []),
      ])

      return { previous, key }
    },

    // Replace the optimistic entry with the real Firestore doc
    onSuccess: (result, _vars, context) => {
      if (!context) return
      queryClient.setQueryData<(WorkoutPlan & { id: string })[]>(context.key, old =>
        (old ?? []).map(p => (p.id.startsWith('temp-') ? { ...result } : p))
      )
    },

    // Roll back on error
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all })
    },
  })
}

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkoutPlan> }) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      // If title is being updated, check for duplicates (excluding the current plan)
      if (data.title) {
        const snapshot = await getDocs(
          query(
            collection(db, 'workout-plans'),
            where('userId', '==', userId),
            where('status', '==', 'active')
          )
        )
        const isDuplicate = snapshot.docs.some(
          d =>
            d.id !== id && d.data().title.trim().toLowerCase() === data.title!.trim().toLowerCase()
        )
        if (isDuplicate) {
          throw new Error('A workout plan with this title already exists.')
        }
      }

      const sanitized = stripUndefined({
        ...data,
        ...(data.exercises && { exercises: sanitizeExercises(data.exercises) }),
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(db, 'workout-plans', id), sanitized)

      safeLogActivity(userId, 'update', 'workout-plan', id, {
        updates: Object.keys(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all })
    },
  })
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      await updateDoc(doc(db, 'workout-plans', id), {
        status: 'deleted',
        updatedAt: serverTimestamp(),
      })

      safeLogActivity(userId, 'delete', 'workout-plan', id)
    },

    // Optimistic: instantly remove from UI
    onMutate: async id => {
      const userId = auth.currentUser?.uid ?? ''
      const key = planKeys.user(userId)

      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<(WorkoutPlan & { id: string })[]>(key)

      queryClient.setQueryData<(WorkoutPlan & { id: string })[]>(key, old =>
        (old ?? []).filter(p => p.id !== id)
      )

      return { previous, key }
    },

    onError: (_err, _id, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all })
    },
  })
}

export function useArchiveWorkoutPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = auth.currentUser?.uid
      if (!userId) throw new Error('Not authenticated')

      await updateDoc(doc(db, 'workout-plans', id), {
        status: 'archived',
        updatedAt: serverTimestamp(),
      })

      safeLogActivity(userId, 'update', 'workout-plan', id, { status: 'archived' })
    },

    // Optimistic: remove from active list immediately
    onMutate: async id => {
      const userId = auth.currentUser?.uid ?? ''
      const key = planKeys.user(userId)

      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<(WorkoutPlan & { id: string })[]>(key)

      queryClient.setQueryData<(WorkoutPlan & { id: string })[]>(key, old =>
        (old ?? []).filter(p => p.id !== id)
      )

      return { previous, key }
    },

    onError: (_err, _id, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all })
    },
  })
}
