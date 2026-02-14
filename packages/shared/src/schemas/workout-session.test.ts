import { describe, it, expect } from 'vitest'
import { SessionExerciseSchema } from './workout-session'

describe('SessionExerciseSchema', () => {
  it('should validate a correct session exercise', () => {
    const validSessionExercise = {
      exerciseId: 'ex1',
      name: 'Push Up',
      sets: [
        { reps: 10, weight: 20, completed: true },
        { reps: 8, weight: 20, completed: false },
      ],
    }
    expect(SessionExerciseSchema.safeParse(validSessionExercise).success).toBe(true)
  })

  it('should fail for missing required fields', () => {
    const invalidSessionExercise = {
      sets: [{ reps: 10 }],
    }
    // missing name
    expect(SessionExerciseSchema.safeParse(invalidSessionExercise).success).toBe(false)
  })
})
