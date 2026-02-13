import { describe, it, expect } from 'vitest'
import { UserSchema, CreateUserSchema } from './user'

describe('UserSchema', () => {
  it('validates correct user data', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      token: 'valid-token',
      name: 'Test User',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing uid', () => {
    const result = UserSchema.safeParse({
      email: 'test@example.com',
      role: 'user',
      token: 'valid-token',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'invalid-email',
      role: 'user',
      token: 'valid-token',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'superadmin', // invalid role
      token: 'valid-token',
    })
    expect(result.success).toBe(false)
  })

  it('validates status enum', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      token: 'valid-token',
      status: 'deleted',
    })
    expect(result.success).toBe(true)
  })

  it('allows optional name', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      token: 'valid-token',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing token', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
    })
    expect(result.success).toBe(false)
  })
})

describe('CreateUserSchema', () => {
  it('validates user creation input', () => {
    const result = CreateUserSchema.safeParse({
      email: 'new@example.com',
      name: 'New User',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email on creation', () => {
    const result = CreateUserSchema.safeParse({
      email: 'bad-email',
      name: 'New User',
    })
    expect(result.success).toBe(false)
  })

  it('requires email', () => {
    const result = CreateUserSchema.safeParse({
      name: 'New User',
    })
    expect(result.success).toBe(false)
  })
})
