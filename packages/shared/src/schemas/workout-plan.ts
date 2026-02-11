import { z } from 'zod'

export const WorkoutExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.union([z.string(), z.number()]),
  weight: z.number().optional(),
  rest: z.number().optional(), // in seconds
  notes: z.string().optional(),
})

export const WorkoutPlanSchema = z.object({
  id: z.string().optional(), // Firestore ID
  userId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  exercises: z.array(WorkoutExerciseSchema),
  status: z.enum(['active', 'deleted', 'archived']).default('active'),
  createdAt: z.union([z.date(), z.string(), z.any()]).optional(), // Firestore Timestamp or Date
  updatedAt: z.union([z.date(), z.string(), z.any()]).optional(),
})

export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>
export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>
