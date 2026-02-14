import { describe, it, expect } from 'vitest'
import { RoleSchema } from './role'

describe('RoleSchema', () => {
  it('should validate correct roles', () => {
    expect(RoleSchema.safeParse('admin').success).toBe(true)
    expect(RoleSchema.safeParse('user').success).toBe(true)
    expect(RoleSchema.safeParse('coach').success).toBe(true)
  })

  it('should fail for invalid roles', () => {
    expect(RoleSchema.safeParse('superuser').success).toBe(false)
    expect(RoleSchema.safeParse('').success).toBe(false)
    expect(RoleSchema.safeParse(undefined).success).toBe(false)
  })
})
