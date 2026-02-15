import type { Exercise } from '@repo/shared/schemas'

export const DEFAULT_EXERCISES: Omit<Exercise, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Barbell Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'arms'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    description:
      'A compound upper body exercise that primarily targets the chest muscles. Lie on a flat bench and press the barbell upward from chest level.',
    instructions: [
      'Lie flat on bench with feet firmly on the ground',
      'Grip barbell slightly wider than shoulder width',
      'Lower bar to mid-chest with control',
      'Press bar back up to starting position',
      'Keep elbows at 45-degree angle to body',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    isPublic: true,
  },
  {
    name: 'Barbell Back Squat',
    category: 'strength',
    muscleGroups: ['legs', 'glutes', 'core'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    description:
      'The king of leg exercises. A compound movement that builds overall lower body strength and mass.',
    instructions: [
      'Position barbell on upper back/traps',
      'Stand with feet shoulder-width apart',
      'Keep chest up and core braced',
      'Lower until thighs are parallel to ground',
      'Drive through heels to return to standing',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    isPublic: true,
  },
  {
    name: 'Conventional Deadlift',
    category: 'strength',
    muscleGroups: ['back', 'legs', 'glutes', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    description:
      'A fundamental compound exercise that works the entire posterior chain. Great for building overall strength.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend down and grip bar just outside legs',
      'Keep back flat, chest up, shoulders back',
      'Drive through heels while pulling bar up legs',
      'Stand fully upright, then lower with control',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    isPublic: true,
  },
  {
    name: 'Pull-Up',
    category: 'strength',
    muscleGroups: ['back', 'arms'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    description:
      'A challenging upper body exercise that builds back width and arm strength using your own bodyweight.',
    instructions: [
      'Hang from bar with hands slightly wider than shoulders',
      'Pull yourself up until chin clears the bar',
      'Keep core tight and avoid swinging',
      'Lower yourself with control to full extension',
      'Repeat for desired reps',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    isPublic: true,
  },
  {
    name: 'Dumbbell Shoulder Press',
    category: 'strength',
    muscleGroups: ['shoulders', 'arms'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    description:
      'An effective shoulder building exercise that allows for a natural range of motion and balanced development.',
    instructions: [
      'Sit on bench with back support',
      'Hold dumbbells at shoulder height',
      'Press dumbbells overhead until arms are extended',
      'Lower with control back to starting position',
      'Keep core engaged throughout movement',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    isPublic: true,
  },
  {
    name: 'Barbell Row',
    category: 'strength',
    muscleGroups: ['back', 'arms'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    description:
      'A compound pulling exercise that builds thickness in the back and strengthens the posterior chain.',
    instructions: [
      'Bend forward at hips with slight knee bend',
      'Grip barbell with hands shoulder-width apart',
      'Pull bar to lower chest/upper abdomen',
      'Squeeze shoulder blades together at top',
      'Lower bar with control to starting position',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
    isPublic: true,
  },
  {
    name: 'Romanian Deadlift',
    category: 'strength',
    muscleGroups: ['glutes', 'legs', 'back'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    description:
      'A hip-hinge movement that targets the hamstrings and glutes while teaching proper deadlift mechanics.',
    instructions: [
      'Stand holding barbell at hip level',
      'Keep slight bend in knees',
      'Push hips back while lowering bar down thighs',
      'Lower until you feel hamstring stretch',
      'Drive hips forward to return to standing',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=2SHsk9AzdjA',
    isPublic: true,
  },
  {
    name: 'Push-Up',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'arms', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description:
      'A fundamental bodyweight exercise that builds pushing strength and core stability. Can be done anywhere.',
    instructions: [
      'Start in plank position with hands shoulder-width',
      'Keep body in straight line from head to heels',
      'Lower chest to ground with control',
      'Push back up to starting position',
      'Keep elbows at 45-degree angle',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    isPublic: true,
  },
  {
    name: 'Plank',
    category: 'strength',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    description:
      'An isometric core exercise that builds stability and endurance in the abdominal muscles.',
    instructions: [
      'Start in forearm plank position',
      'Keep body in straight line',
      'Engage core and squeeze glutes',
      'Breathe steadily throughout hold',
      'Hold for desired time',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=pvIjsG5Svck',
    isPublic: true,
  },
  {
    name: 'Dumbbell Lunges',
    category: 'strength',
    muscleGroups: ['legs', 'glutes'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    description:
      'A unilateral leg exercise that builds balance, coordination, and strength in the lower body.',
    instructions: [
      'Hold dumbbells at sides',
      'Step forward into lunge position',
      'Lower back knee toward ground',
      'Front thigh should be parallel to ground',
      'Push through front heel to return to standing',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    isPublic: true,
  },
]

// Function to initialize default exercises in Firestore
export const initializeDefaultExercises = async (
  createExerciseFn: (exercise: Omit<Exercise, 'id'>) => Promise<void>,
  createdBy: string // admin user ID
) => {
  const exercisesWithCreator = DEFAULT_EXERCISES.map(exercise => ({
    ...exercise,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  for (const exercise of exercisesWithCreator) {
    try {
      await createExerciseFn(exercise)
    } catch (error) {
      console.error(`Failed to create exercise: ${exercise.name}`, error)
    }
  }
}
