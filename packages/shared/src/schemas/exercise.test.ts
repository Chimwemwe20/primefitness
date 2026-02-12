import { describe, it, expect } from 'vitest'
import { ExerciseSchema } from './exercise'

describe('ExerciseSchema', () => {
  it('should validate a correct exercise', () => {
    const validExercise = {
      name: 'Push Up',
      category: 'strength',
      muscleGroups: ['chest'],
      createdBy: 'user1',
      isPublic: true,
    }
    expect(ExerciseSchema.safeParse(validExercise).success).toBe(true)
  })

  it('should fail for missing required fields', () => {
    const invalidExercise = {
      name: 'Push Up',
      muscleGroups: ['chest'],
    }
    // missing category and createdBy
    expect(ExerciseSchema.safeParse(invalidExercise).success).toBe(false)
  })
})
