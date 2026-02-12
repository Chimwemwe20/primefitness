// schemas/workout-session.ts
import { z } from 'zod'

export const SessionExerciseSchema = z.object({
  exerciseId: z.string().optional(),
  name: z.string().min(1),
  sets: z.array(
    z.object({
      reps: z.number().int().positive(),
      weight: z.number().optional(),
      completed: z.boolean().default(false),
      notes: z.string().optional(),
    })
  ),
})

export const WorkoutSessionSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  workoutPlanId: z.string().optional(), // reference to the plan used
  title: z.string().min(1),
  exercises: z.array(SessionExerciseSchema),
  startTime: z.union([z.date(), z.string(), z.any()]),
  endTime: z.union([z.date(), z.string(), z.any()]).optional(),
  duration: z.number().optional(), // in minutes
  notes: z.string().optional(),
  mood: z.enum(['great', 'good', 'okay', 'tired', 'exhausted']).optional(),
  completedAt: z.union([z.date(), z.string(), z.any()]).optional(),
  createdAt: z.union([z.date(), z.string(), z.any()]).optional(),
})

export type SessionExercise = z.infer<typeof SessionExerciseSchema>
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>
