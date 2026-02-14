import { describe, it, expect } from 'vitest'
import { ActivityLogSchema } from './activity-log'

describe('ActivityLogSchema', () => {
  it('validates correct activity log data', () => {
    const result = ActivityLogSchema.safeParse({
      userId: 'user123',
      action: 'create',
      resourceType: 'workout-plan',
      timestamp: new Date(),
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid action', () => {
    const result = ActivityLogSchema.safeParse({
      userId: 'user123',
      action: 'invalid-action',
      resourceType: 'workout-plan',
      timestamp: new Date(),
    })
    expect(result.success).toBe(false)
  })

  it('allows details object', () => {
    const result = ActivityLogSchema.safeParse({
      userId: 'user123',
      action: 'update',
      resourceType: 'user',
      resourceId: 'u1',
      details: { changedField: 'email' },
      timestamp: new Date(),
    })
    expect(result.success).toBe(true)
  })
})
