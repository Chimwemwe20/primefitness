import { z } from 'zod'

export const ActivityLogSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  action: z.enum(['create', 'update', 'delete', 'login', 'complete', 'other']),
  resourceType: z.enum(['workout-plan', 'user', 'profile', 'system', 'goal']),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.union([z.date(), z.string(), z.any()]), // Firestore Timestamp or Date
})

export type ActivityLog = z.infer<typeof ActivityLogSchema>
