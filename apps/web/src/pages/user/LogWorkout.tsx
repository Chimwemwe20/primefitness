import { useState, useEffect } from 'react'
import { useExercises } from '../../hooks/useExercises.ts'
import { useCreateWorkoutSession, useUpdateWorkoutSession } from '../../hooks/useWorkoutSessions'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import { Plus, Trash2, Check, Pause, X, Search, Dumbbell, Timer } from 'lucide-react'
import type { Exercise } from '@repo/shared/schemas'

interface ExerciseSet {
  reps: number
  weight?: number
  completed: boolean
  notes?: string
}

interface WorkoutExercise {
  exerciseId?: string
  name: string
  sets: ExerciseSet[]
}

export default function LogWorkout() {
  const { data: exercises } = useExercises()
  const createSession = useCreateWorkoutSession()
  const updateSession = useUpdateWorkoutSession()

  const [workoutTitle, setWorkoutTitle] = useState('Quick Workout')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [startTime] = useState<Date>(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)

  // Timer for workout duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, startTime])

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startWorkout = async () => {
    setIsTimerRunning(true)
    const newSession = await createSession.mutateAsync({
      title: workoutTitle,
      exercises: workoutExercises,
      startTime: new Date(),
      notes: '',
    })
    setSessionId(newSession.id)
  }

  const addExercise = (exerciseName: string, exerciseId?: string) => {
    setWorkoutExercises([
      ...workoutExercises,
      {
        exerciseId,
        name: exerciseName,
        sets: [{ reps: 0, weight: 0, completed: false }],
      },
    ])
    setShowExercisePicker(false)
    setSearchQuery('')

    if (!isTimerRunning) {
      startWorkout()
    }
  }

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index))
  }

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises]
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1]
    updated[exerciseIndex].sets.push({
      reps: lastSet?.reps || 0,
      weight: lastSet?.weight || 0,
      completed: false,
    })
    setWorkoutExercises(updated)
  }

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: number | boolean | string
  ) => {
    const updated = [...workoutExercises]
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    }
    setWorkoutExercises(updated)
  }

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const updated = [...workoutExercises]
    const set = updated[exerciseIndex].sets[setIndex]
    set.completed = !set.completed
    setWorkoutExercises(updated)

    // Start rest timer if completing a set
    if (set.completed && !isResting) {
      setRestTimer(90) // 90 seconds rest
      setIsResting(true)
    }
  }

  const completeWorkout = async () => {
    if (!sessionId) return

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000) // minutes

    await updateSession.mutateAsync({
      id: sessionId,
      data: {
        exercises: workoutExercises,
        endTime,
        duration,
        completedAt: endTime,
      },
    })

    window.location.href = '/workouts/history'
  }

  const filteredExercises = exercises?.filter((ex: Exercise & { id: string }) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <Input
            value={workoutTitle}
            onChange={e => setWorkoutTitle(e.target.value)}
            className="text-3xl font-bold bg-transparent border-none text-neutral-100 p-0 mb-2"
            placeholder="Workout Title"
          />
          <div className="flex items-center gap-4 text-neutral-400">
            <div className="flex items-center gap-2">
              <Timer size={20} />
              <span className="text-2xl font-mono">{formatTime(elapsedTime)}</span>
            </div>
            {isResting && (
              <div className="flex items-center gap-2 text-orange-500">
                <Pause size={20} />
                <span className="font-mono">Rest: {formatTime(restTimer)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/workouts')}
            className="border-neutral-700"
          >
            <X size={20} className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={completeWorkout}
            disabled={workoutExercises.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Check size={20} className="mr-2" />
            Complete Workout
          </Button>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        {workoutExercises.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex} className="bg-neutral-900 border-neutral-800 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Dumbbell className="text-blue-500" size={20} />
                </div>
                <h3 className="font-bold text-lg">{exercise.name}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeExercise(exerciseIndex)}
                className="border-neutral-700 text-red-500 hover:text-red-400"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            {/* Sets */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-xs text-neutral-500 uppercase font-medium px-2">
                <div className="col-span-1">Set</div>
                <div className="col-span-4">Weight (kg)</div>
                <div className="col-span-4">Reps</div>
                <div className="col-span-3">Done</div>
              </div>

              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-neutral-400 font-medium">{setIndex + 1}</div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      value={set.weight || ''}
                      onChange={e =>
                        updateSet(
                          exerciseIndex,
                          setIndex,
                          'weight',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="bg-neutral-800 border-neutral-700"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      value={set.reps || ''}
                      onChange={e =>
                        updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)
                      }
                      className="bg-neutral-800 border-neutral-700"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-3">
                    <Button
                      onClick={() => toggleSetComplete(exerciseIndex, setIndex)}
                      className={`w-full ${
                        set.completed
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-neutral-800 hover:bg-neutral-700'
                      }`}
                    >
                      {set.completed ? <Check size={16} /> : ''}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => addSet(exerciseIndex)}
              className="border-neutral-700"
            >
              <Plus size={16} className="mr-2" />
              Add Set
            </Button>
          </Card>
        ))}

        {/* Add Exercise Button */}
        <Button
          onClick={() => setShowExercisePicker(true)}
          className="w-full bg-neutral-800 hover:bg-neutral-700 border-2 border-dashed border-neutral-700"
        >
          <Plus size={20} className="mr-2" />
          Add Exercise
        </Button>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-neutral-900 border-neutral-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Exercise</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExercisePicker(false)}
                className="border-neutral-700"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={20}
              />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredExercises && filteredExercises.length > 0 ? (
                filteredExercises.map((exercise: Exercise & { id: string }) => (
                  <div
                    key={exercise.id}
                    onClick={() => addExercise(exercise.name, exercise.id)}
                    className="p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors"
                  >
                    <h3 className="font-medium">{exercise.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-neutral-700 text-neutral-400">
                        {exercise.category}
                      </span>
                      {exercise.muscleGroups.slice(0, 2).map((muscle, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-neutral-700 text-neutral-400 capitalize"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-500 mb-4">No exercises found</p>
                  <Button
                    onClick={() => {
                      const customName = prompt('Enter custom exercise name:')
                      if (customName) {
                        addExercise(customName)
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Add Custom Exercise
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
