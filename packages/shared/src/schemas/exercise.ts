// schemas/exercise.ts
import { z } from 'zod'

export const ExerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.enum(['strength', 'cardio', 'flexibility', 'balance', 'other']),
  muscleGroups: z.array(
    z.enum(['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'full-body'])
  ),
  equipment: z
    .array(
      z.enum([
        'barbell',
        'dumbbell',
        'kettlebell',
        'machine',
        'bodyweight',
        'resistance-band',
        'other',
      ])
    )
    .optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  description: z.string().optional(),
  instructions: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  createdBy: z.string(), // userId of creator (admin/coach)
  isPublic: z.boolean().default(true),
  createdAt: z.union([z.date(), z.string(), z.any()]).optional(),
  updatedAt: z.union([z.date(), z.string(), z.any()]).optional(),
})

export type Exercise = z.infer<typeof ExerciseSchema>
