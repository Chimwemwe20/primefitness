import { describe, it, expect } from 'vitest'
import { ProgressEntrySchema } from './progress'

describe('ProgressEntrySchema', () => {
  it('should validate a correct progress', () => {
    const validProgress = {
      userId: 'user1',
      date: new Date().toISOString(),
      weight: 70,
      bodyFat: 15,
      measurements: {
        chest: 100,
        waist: 80,
      },
    }
    expect(ProgressEntrySchema.safeParse(validProgress).success).toBe(true)
  })

  it('should fail for missing required fields', () => {
    const invalidProgress = {
      weight: 70,
    }
    // missing userId and date
    expect(ProgressEntrySchema.safeParse(invalidProgress).success).toBe(false)
  })
})
