// schemas/progress.ts
import { z } from 'zod'

export const ProgressEntrySchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  date: z.union([z.date(), z.string(), z.any()]),
  weight: z.number().positive().optional(), // kg
  bodyFat: z.number().min(0).max(100).optional(), // percentage
  measurements: z
    .object({
      chest: z.number().optional(), // cm
      waist: z.number().optional(),
      hips: z.number().optional(),
      biceps: z.number().optional(),
      thighs: z.number().optional(),
    })
    .optional(),
  photos: z.array(z.string().url()).optional(),
  notes: z.string().optional(),
  createdAt: z.union([z.date(), z.string(), z.any()]).optional(),
})

export type ProgressEntry = z.infer<typeof ProgressEntrySchema>
