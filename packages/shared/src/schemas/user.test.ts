import { describe, it, expect } from 'vitest'
import { UserSchema, CreateUserSchema } from './user'

describe('UserSchema', () => {
  it('validates correct user data', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      token: 'valid-token',
      fullname: 'Test User',
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

  it('allows optional fullname', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      token: 'valid-token',
    })
    expect(result.success).toBe(true)
  })

  it('allows missing token (token is optional)', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
    })
    expect(result.success).toBe(true)
  })

  it('validates optional fields', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      height: 180,
      weight: 75,
      age: 30,
      gender: 'male',
      phone: '+1234567890',
      address: '123 Main St',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid gender', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      gender: 'other', // 'other' is not in the enum
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative height', () => {
    const result = UserSchema.safeParse({
      uid: '123',
      email: 'test@example.com',
      role: 'user',
      height: -180,
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

  it('validates with all optional fields', () => {
    const result = CreateUserSchema.safeParse({
      email: 'new@example.com',
      name: 'New User',
      height: 175,
      weight: 70,
      age: 25,
      gender: 'female',
      phone: '+1234567890',
      address: '456 Oak Ave',
    })
    expect(result.success).toBe(true)
  })

  it('allows "other" gender in CreateUserSchema', () => {
    const result = CreateUserSchema.safeParse({
      email: 'new@example.com',
      gender: 'other',
    })
    expect(result.success).toBe(true)
  })
})
