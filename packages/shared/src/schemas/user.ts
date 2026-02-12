import { z } from 'zod'
import { RoleSchema } from './role'

export const UserSchema = z.object({
  uid: z.string().min(1),
  role: RoleSchema,
  token: z.string().min(1),
  email: z.string().email(),
  fullname: z.string().optional(),
  username: z.string().optional(),
  height: z.number().int().positive().optional(), // cm
  weight: z.number().int().positive().optional(), // kg
  age: z.number().int().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  lastLogin: z.date().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  height: z.number().int().positive().optional(),
  weight: z.number().int().positive().optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
