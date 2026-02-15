import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkoutSession, useDeleteWorkoutSession } from '../../hooks/useWorkoutSessions'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Dialog } from '@repo/ui/Dialog'
import { useToast } from '@repo/ui/useToast'
import {
  Loader2,
  ArrowLeft,
  Dumbbell,
  Calendar,
  Clock,
  Award,
  Trash2,
  Check,
  X,
} from 'lucide-react'

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: workout, isLoading } = useWorkoutSession(id!)
  const deleteWorkoutMutation = useDeleteWorkoutSession()
  const toast = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteWorkoutMutation.mutateAsync(id!)
      toast.success('Workout deleted successfully!')
      window.location.href = '/workouts/history'
    } catch (error) {
      console.error('Failed to delete workout:', error)
      toast.error('Failed to delete workout. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">Workout not found</p>
        <Button onClick={() => (window.location.href = '/workouts/history')}>
          Back to History
        </Button>
      </div>
    )
  }

  const totalSets = workout.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0
  const completedSets =
    workout.exercises?.reduce(
      (acc, ex) => acc + (ex.sets?.filter(s => s.completed).length || 0),
      0
    ) || 0

  const totalVolume =
    workout.exercises?.reduce((acc, ex) => {
      return (
        acc +
        (ex.sets?.reduce((setAcc, set) => {
          return setAcc + (set.weight || 0) * set.reps
        }, 0) || 0)
      )
    }, 0) || 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700"
            onClick={() => (window.location.href = '/workouts/history')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2 text-neutral-100">{workout.title}</h1>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  {new Date(workout.startTime).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>
                  {new Date(workout.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {workout.completedAt && (
                <div className="flex items-center gap-1 text-green-500">
                  <Award size={14} />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-neutral-700 text-red-500 hover:text-red-400"
          onClick={handleDeleteClick}
          disabled={deleteWorkoutMutation.isPending}
        >
          {deleteWorkoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 size={16} className="mr-2" />
              Delete
            </>
          )}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Dumbbell className="text-blue-500" size={20} />
            </div>
            <span className="text-sm text-neutral-400">Exercises</span>
          </div>
          <p className="text-3xl font-bold">{workout.exercises?.length || 0}</p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Check className="text-green-500" size={20} />
            </div>
            <span className="text-sm text-neutral-400">Sets Completed</span>
          </div>
          <p className="text-3xl font-bold">
            {completedSets}/{totalSets}
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Clock className="text-purple-500" size={20} />
            </div>
            <span className="text-sm text-neutral-400">Duration</span>
          </div>
          <p className="text-3xl font-bold">
            {workout.duration || 0}
            <span className="text-lg text-neutral-500 ml-1">min</span>
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Award className="text-orange-500" size={20} />
            </div>
            <span className="text-sm text-neutral-400">Total Volume</span>
          </div>
          <p className="text-3xl font-bold">
            {totalVolume.toLocaleString()}
            <span className="text-lg text-neutral-500 ml-1">kg</span>
          </p>
        </Card>
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Exercises</h2>

        {workout.exercises && workout.exercises.length > 0 ? (
          workout.exercises.map((exercise, exerciseIndex) => {
            const exerciseVolume =
              exercise.sets?.reduce((acc, set) => {
                return acc + (set.weight || 0) * set.reps
              }, 0) || 0

            return (
              <Card key={exerciseIndex} className="bg-neutral-900 border-neutral-800 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <Dumbbell className="text-blue-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{exercise.name}</h3>
                      <p className="text-sm text-neutral-400">
                        {exercise.sets?.length || 0} sets • Volume:{' '}
                        {exerciseVolume.toLocaleString()} kg
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">
                          Set
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">
                          Weight
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">
                          Reps
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">
                          Volume
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-neutral-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets?.map((set, setIndex) => (
                        <tr
                          key={setIndex}
                          className="border-b border-neutral-800/50 hover:bg-neutral-800/30"
                        >
                          <td className="py-3 px-4 text-sm">{setIndex + 1}</td>
                          <td className="py-3 px-4 text-sm font-medium">
                            {set.weight ? `${set.weight} kg` : '—'}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{set.reps}</td>
                          <td className="py-3 px-4 text-sm text-neutral-400">
                            {set.weight ? `${(set.weight * set.reps).toFixed(0)} kg` : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {set.completed ? (
                              <div className="inline-flex items-center gap-1 text-green-500">
                                <Check size={16} />
                                <span className="text-xs">Done</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 text-neutral-500">
                                <X size={16} />
                                <span className="text-xs">Skipped</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Set Notes */}
                {exercise.sets?.some(set => set.notes) && (
                  <div className="mt-4 space-y-2">
                    {exercise.sets?.map((set, setIndex) =>
                      set.notes ? (
                        <div key={setIndex} className="p-3 rounded-lg bg-neutral-800/50">
                          <p className="text-xs text-neutral-500 mb-1">Set {setIndex + 1} Note:</p>
                          <p className="text-sm text-neutral-400 italic">"{set.notes}"</p>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </Card>
            )
          })
        ) : (
          <Card className="bg-neutral-900 border-neutral-800 p-12 text-center">
            <p className="text-neutral-500">No exercises logged</p>
          </Card>
        )}
      </div>

      {/* Workout Notes */}
      {workout.notes && (
        <Card className="bg-neutral-900 border-neutral-800 p-6 mt-8">
          <h3 className="font-bold mb-4">Workout Notes</h3>
          <p className="text-neutral-400">{workout.notes}</p>
        </Card>
      )}

      {/* Mood */}
      {workout.mood && (
        <Card className="bg-neutral-900 border-neutral-800 p-6 mt-6">
          <h3 className="font-bold mb-4">How You Felt</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {workout.mood === 'great'
                ? '😄'
                : workout.mood === 'good'
                  ? '🙂'
                  : workout.mood === 'okay'
                    ? '😐'
                    : workout.mood === 'tired'
                      ? '😓'
                      : '😫'}
            </span>
            <span className="text-lg capitalize">{workout.mood}</span>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Workout"
        description={`Are you sure you want to delete "${workout?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        isLoading={deleteWorkoutMutation.isPending}
      />
    </div>
  )
}
