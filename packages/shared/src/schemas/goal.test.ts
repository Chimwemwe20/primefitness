import { describe, it, expect } from 'vitest'
import { GoalSchema } from './goal'

describe('GoalSchema', () => {
  it('should validate a correct goal', () => {
    const validGoal = {
      userId: 'user1',
      title: 'Lose weight',
      type: 'weight',
      startDate: new Date().toISOString(),
      targetDate: new Date().toISOString(),
    }
    expect(GoalSchema.safeParse(validGoal).success).toBe(true)
  })

  it('should fail for missing required fields', () => {
    const invalidGoal = {
      userId: 'user1',
      type: 'weight',
      startDate: new Date().toISOString(),
    }
    // missing title and targetDate
    expect(GoalSchema.safeParse(invalidGoal).success).toBe(false)
  })
})
