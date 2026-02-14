import { describe, it, expect } from 'vitest'
import { WorkoutPlanSchema } from './workout-plan'

describe('WorkoutPlanSchema', () => {
  it('validates correct workout plan data', () => {
    const result = WorkoutPlanSchema.safeParse({
      userId: 'user123',
      title: 'My Workout',
      exercises: [
        {
          name: 'Pushups',
          sets: 3,
          reps: 10,
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing title', () => {
    const result = WorkoutPlanSchema.safeParse({
      userId: 'user123',
      exercises: [],
    })
    expect(result.success).toBe(false)
  })

  it('validates exercise structure', () => {
    const result = WorkoutPlanSchema.safeParse({
      userId: 'user123',
      title: 'Bad Workout',
      exercises: [
        {
          name: 'Pushups',
          sets: -1, // Invalid: must be positive
          reps: 10,
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('allows optional fields', () => {
    const result = WorkoutPlanSchema.safeParse({
      userId: 'user123',
      title: 'Minimal Workout',
      exercises: [],
      status: 'active',
    })
    expect(result.success).toBe(true)
  })
})
