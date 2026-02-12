// schemas/goal.ts
import { z } from 'zod'

export const GoalSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['weight', 'strength', 'endurance', 'flexibility', 'habit', 'other']),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  unit: z.string().optional(), // 'kg', 'reps', 'minutes', etc.
  startDate: z.union([z.date(), z.string(), z.any()]),
  targetDate: z.union([z.date(), z.string(), z.any()]),
  status: z.enum(['active', 'completed', 'abandoned']).default('active'),
  completedAt: z.union([z.date(), z.string(), z.any()]).optional(),
  createdAt: z.union([z.date(), z.string(), z.any()]).optional(),
  updatedAt: z.union([z.date(), z.string(), z.any()]).optional(),
})

export type Goal = z.infer<typeof GoalSchema>
