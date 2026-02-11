import { z } from 'zod'
import { RoleSchema } from './role'

export const UserSchema = z.object({
  uid: z.string().min(1),
  role: RoleSchema,
  email: z.string().email(),
  name: z.string().optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
