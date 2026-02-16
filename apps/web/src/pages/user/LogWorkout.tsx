import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useExercises } from '../../hooks/useExercises.ts'
import { useCreateWorkoutSession, useUpdateWorkoutSession } from '../../hooks/useWorkoutSessions'
import { usePublicWorkoutTemplates, useWorkoutPlans } from '../../hooks/useWorkoutPlans'
import { useToast } from '@repo/ui/useToast'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import {
  Plus,
  Trash2,
  Check,
  Pause,
  X,
  Search,
  Dumbbell,
  Timer,
  Play,
  SkipForward,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import type { Exercise } from '@repo/shared/schemas'
import type { WorkoutPlan } from '@repo/shared/schemas'

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

const DEFAULT_REST_SECONDS = 90
const REST_PRESETS = [30, 60, 90, 120, 180]

function planToLogExercises(plan: WorkoutPlan & { id: string }): WorkoutExercise[] {
  return plan.exercises.map(ex => {
    const repsNum = typeof ex.reps === 'number' ? ex.reps : parseInt(String(ex.reps), 10) || 0
    const setCount = typeof ex.sets === 'number' ? Math.max(1, ex.sets) : 1
    return {
      name: ex.name,
      sets: Array.from({ length: setCount }, () => ({
        reps: repsNum,
        weight: 0,
        completed: false,
      })),
    }
  })
}

/** Strip undefined fields that Firestore rejects */
const cleanExercises = (exs: WorkoutExercise[]) =>
  exs.map(({ exerciseId, ...rest }) => ({
    ...rest,
    ...(exerciseId !== undefined && { exerciseId }),
  }))

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function LogWorkout() {
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('templateId')
  const planId = searchParams.get('planId')

  const { data: exercises } = useExercises()
  const { data: templates } = usePublicWorkoutTemplates()
  const { data: userPlans } = useWorkoutPlans()
  const createSession = useCreateWorkoutSession()
  const updateSession = useUpdateWorkoutSession()
  const { success, error, info } = useToast()

  const [workoutTitle, setWorkoutTitle] = useState('Quick Workout')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(Boolean(templateId || planId))

  // ── Workout timer state ──────────────────────────────────────────────
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [pausedElapsed, setPausedElapsed] = useState(0) // accumulated seconds before last pause
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // ── Rest timer state ─────────────────────────────────────────────────
  const [restTimer, setRestTimer] = useState(0)
  const [restDuration, setRestDuration] = useState(DEFAULT_REST_SECONDS)
  const [isResting, setIsResting] = useState(false)
  const [autoStartRest, setAutoStartRest] = useState(true)

  const hasPrefilledRef = useRef(false)

  // Whether we loaded from a template/plan (shows the start button)
  const hasPrefilledExercises = workoutExercises.length > 0 && !isTimerRunning && !isPaused

  // ── Pre-fill from template or plan ───────────────────────────────────
  useEffect(() => {
    if (hasPrefilledRef.current) return
    if (templateId && templates?.length) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        hasPrefilledRef.current = true
        setWorkoutTitle(template.title)
        setWorkoutExercises(planToLogExercises(template))
        setIsLoadingPrefill(false)
        success(`Loaded template: ${template.title}`)
      }
    } else if (planId && userPlans?.length) {
      const plan = userPlans.find(p => p.id === planId)
      if (plan) {
        hasPrefilledRef.current = true
        setWorkoutTitle(plan.title)
        setWorkoutExercises(planToLogExercises(plan))
        setIsLoadingPrefill(false)
        success(`Loaded plan: ${plan.title}`)
      }
    } else if (!templateId && !planId) {
      // No template or plan to load
      setIsLoadingPrefill(false)
    }
  }, [templateId, planId, templates, userPlans, success])

  // ── Workout elapsed timer ────────────────────────────────────────────
  // Only ticks while isTimerRunning is true (not while paused).
  useEffect(() => {
    if (!isTimerRunning || !startTime) return
    const interval = setInterval(() => {
      const liveSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000)
      setElapsedTime(pausedElapsed + liveSeconds)
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning, startTime, pausedElapsed])

  // ── Rest countdown timer ─────────────────────────────────────────────
  useEffect(() => {
    if (!isResting || restTimer <= 0) return
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          setIsResting(false)
          success('Rest complete! Ready for next set')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isResting, restTimer, success])

  // ── Workout controls ─────────────────────────────────────────────────
  const startWorkout = useCallback(
    async (exercisesToSave?: WorkoutExercise[]) => {
      if (sessionId) return

      const now = new Date()
      setStartTime(now)
      setPausedElapsed(0)
      setElapsedTime(0)
      setIsTimerRunning(true)
      setIsPaused(false)

      try {
        const newSession = await createSession.mutateAsync({
          title: workoutTitle,
          exercises: cleanExercises(exercisesToSave ?? workoutExercises),
          startTime: now,
          notes: '',
        })
        setSessionId(newSession.id)
        success("Workout started! Let's go 💪")
      } catch (err) {
        error('Failed to start workout. Please try again.')
      }
    },
    [sessionId, workoutTitle, workoutExercises, createSession, success, error]
  )

  const pauseWorkout = useCallback(() => {
    if (!isTimerRunning || !startTime) return
    // Accumulate elapsed time so far
    const liveSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000)
    setPausedElapsed(prev => prev + liveSeconds)
    setStartTime(null)
    setIsTimerRunning(false)
    setIsPaused(true)
    info('Workout paused')
  }, [isTimerRunning, startTime, info])

  const resumeWorkout = useCallback(() => {
    if (!isPaused) return
    setStartTime(new Date())
    setIsTimerRunning(true)
    setIsPaused(false)
    success('Workout resumed!')
  }, [isPaused, success])

  const workoutActive = isTimerRunning || isPaused

  // ── Rest timer controls ──────────────────────────────────────────────
  const startRest = useCallback(
    (seconds?: number) => {
      const duration = seconds ?? restDuration
      setRestTimer(duration)
      setRestDuration(duration)
      setIsResting(true)
      info(`Rest timer started: ${formatTime(duration)}`)
    },
    [restDuration, info]
  )

  const skipRest = useCallback(() => {
    setIsResting(false)
    setRestTimer(0)
    info('Rest skipped')
  }, [info])

  const resetRest = useCallback(() => {
    setRestTimer(restDuration)
    setIsResting(true)
    info('Rest timer restarted')
  }, [restDuration, info])

  // ── Exercise / set helpers ───────────────────────────────────────────
  const addExercise = (exerciseName: string, exerciseId?: string) => {
    const updated = [
      ...workoutExercises,
      {
        exerciseId,
        name: exerciseName,
        sets: [{ reps: 0, weight: 0, completed: false }],
      },
    ]
    setWorkoutExercises(updated)
    setShowExercisePicker(false)
    setSearchQuery('')

    success(`Added ${exerciseName}`)

    // Auto-start if adding the first exercise without a template
    if (!workoutActive && !sessionId) {
      startWorkout(updated)
    }
  }

  const removeExercise = (index: number) => {
    const exerciseName = workoutExercises[index].name
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index))
    info(`Removed ${exerciseName}`)
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
    success('Set added')
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

    if (set.completed) {
      success('✓ Set completed!')
      // Auto-start rest on set completion (if user opted in)
      if (autoStartRest && !isResting) {
        startRest()
      }
    }
  }

  const completeWorkout = async () => {
    if (!sessionId) return

    const endTime = new Date()
    const duration = Math.floor(elapsedTime / 60) // minutes from tracked elapsed

    setIsTimerRunning(false)
    setIsPaused(false)
    setIsResting(false)

    try {
      await updateSession.mutateAsync({
        id: sessionId,
        data: {
          exercises: cleanExercises(workoutExercises),
          endTime,
          duration,
          completedAt: endTime,
        },
      })

      success(`Workout completed! Duration: ${formatTime(elapsedTime)}`)

      setTimeout(() => {
        window.location.href = '/workouts/history'
      }, 1000)
    } catch (err) {
      error('Failed to save workout. Please try again.')
    }
  }

  const filteredExercises = exercises?.filter((ex: Exercise & { id: string }) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Loading state ────────────────────────────────────────────────────
  if (isLoadingPrefill) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-neutral-400">Loading workout...</p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────── */}
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
              <span
                className={`text-2xl font-mono ${workoutActive ? 'text-neutral-100' : 'text-neutral-600'}`}
              >
                {formatTime(elapsedTime)}
              </span>
              {/* Pause / Resume button */}
              {isTimerRunning && (
                <button
                  onClick={pauseWorkout}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-yellow-400 transition-colors"
                  title="Pause workout"
                >
                  <Pause size={18} />
                </button>
              )}
              {isPaused && (
                <button
                  onClick={resumeWorkout}
                  className="p-1 rounded hover:bg-neutral-800 text-yellow-500 hover:text-green-400 transition-colors"
                  title="Resume workout"
                >
                  <Play size={18} />
                </button>
              )}
            </div>
            {isPaused && <span className="text-sm text-yellow-500 font-medium">Paused</span>}
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
          {workoutActive && (
            <Button
              onClick={completeWorkout}
              disabled={workoutExercises.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Check size={20} className="mr-2" />
              Complete Workout
            </Button>
          )}
        </div>
      </div>

      {/* ── Rest Timer Banner ───────────────────────────────────────── */}
      {isResting && (
        <Card className="bg-neutral-900 border-orange-500/40 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pause size={20} className="text-orange-500" />
              <div>
                <span className="text-orange-400 font-mono text-2xl">{formatTime(restTimer)}</span>
                <span className="text-neutral-500 text-sm ml-2">rest</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetRest}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Restart rest timer"
              >
                <RotateCcw size={18} />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={skipRest}
                className="border-neutral-700 text-neutral-300"
              >
                <SkipForward size={16} className="mr-1" />
                Skip
              </Button>
            </div>
          </div>
          {/* Quick-adjust rest duration */}
          <div className="flex gap-2 mt-3">
            {REST_PRESETS.map(s => (
              <button
                key={s}
                onClick={() => startRest(s)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  restDuration === s
                    ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50'
                    : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300 border border-neutral-700'
                }`}
              >
                {formatTime(s)}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ── Rest timer settings (when not resting, while workout active) */}
      {workoutActive && !isResting && (
        <div className="flex items-center gap-3 mb-6 text-sm text-neutral-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoStartRest}
              onChange={e => setAutoStartRest(e.target.checked)}
              className="rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500"
            />
            Auto rest timer
          </label>
          {autoStartRest && (
            <div className="flex gap-1">
              {REST_PRESETS.map(s => (
                <button
                  key={s}
                  onClick={() => setRestDuration(s)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    restDuration === s
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-neutral-800 text-neutral-600 hover:text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {formatTime(s)}
                </button>
              ))}
            </div>
          )}
          {/* Manual rest start */}
          {!autoStartRest && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startRest()}
              className="border-neutral-700 text-neutral-400 text-xs"
            >
              <Pause size={14} className="mr-1" />
              Start rest ({formatTime(restDuration)})
            </Button>
          )}
        </div>
      )}

      {/* ── Start Workout Banner ────────────────────────────────────── */}
      {hasPrefilledExercises && (
        <Card className="bg-neutral-900 border-blue-500/40 p-6 mb-6 text-center">
          <p className="text-neutral-300 mb-1 text-lg font-medium">
            {workoutExercises.length} exercise{workoutExercises.length !== 1 ? 's' : ''} ready to go
          </p>
          <p className="text-neutral-500 text-sm mb-5">
            Tap start when you're ready — the timer will begin
          </p>
          <Button
            onClick={() => startWorkout()}
            className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-3 h-auto"
          >
            <Play size={22} className="mr-2" />
            Start Workout
          </Button>
        </Card>
      )}

      {/* ── Exercises ───────────────────────────────────────────────── */}
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
                      onClick={() => {
                        if (!workoutActive) return
                        toggleSetComplete(exerciseIndex, setIndex)
                      }}
                      disabled={!workoutActive}
                      className={`w-full ${
                        set.completed
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-neutral-800 hover:bg-neutral-700'
                      } ${!workoutActive ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* ── Exercise Picker Modal ───────────────────────────────────── */}
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
