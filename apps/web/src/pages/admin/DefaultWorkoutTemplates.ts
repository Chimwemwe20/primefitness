import type { WorkoutExercise } from '@repo/shared/schemas'

/** Template definitions (no id/userId/status). Exercise names must match the exercise library (e.g. default exercises). */
export const DEFAULT_WORKOUT_TEMPLATES: {
  title: string
  description: string
  exercises: WorkoutExercise[]
}[] = [
  {
    title: 'Full Body Strength',
    description: 'Classic compound movements for overall strength. Good for 2–3x per week.',
    exercises: [
      { name: 'Barbell Back Squat', sets: 3, reps: 8, rest: 90 },
      { name: 'Barbell Bench Press', sets: 3, reps: 8, rest: 90 },
      { name: 'Barbell Row', sets: 3, reps: 10, rest: 60 },
      { name: 'Dumbbell Shoulder Press', sets: 2, reps: 10, rest: 60 },
      { name: 'Plank', sets: 2, reps: 30, rest: 45 },
    ],
  },
  {
    title: 'Upper Body Push',
    description: 'Chest, shoulders, and triceps focus.',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8, rest: 90 },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, rest: 60 },
      { name: 'Push-Up', sets: 3, reps: 12, rest: 45 },
    ],
  },
  {
    title: 'Upper Body Pull & Legs',
    description: 'Back, biceps, and lower body.',
    exercises: [
      { name: 'Conventional Deadlift', sets: 3, reps: 6, rest: 120 },
      { name: 'Pull-Up', sets: 3, reps: 8, rest: 60 },
      { name: 'Barbell Row', sets: 3, reps: 10, rest: 60 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10, rest: 60 },
      { name: 'Dumbbell Lunges', sets: 2, reps: 10, rest: 45 },
    ],
  },
  {
    title: 'Beginner Full Body',
    description: 'Simple, low-equipment options for getting started.',
    exercises: [
      { name: 'Push-Up', sets: 2, reps: 10, rest: 60 },
      { name: 'Dumbbell Lunges', sets: 2, reps: 10, rest: 45 },
      { name: 'Plank', sets: 2, reps: 20, rest: 45 },
    ],
  },
]
