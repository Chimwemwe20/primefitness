import { useState } from 'react'
import { useWorkoutSessions, useDeleteWorkoutSession } from '../../hooks/useWorkoutSessions'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import { Dialog } from '@repo/ui/Dialog'
import { useToast } from '@repo/ui/useToast'
import { Loader2, Dumbbell, Search, Trash2, Calendar, Clock, Award } from 'lucide-react'

export default function WorkoutHistory() {
  const { data: sessions, isLoading } = useWorkoutSessions()
  const deleteSession = useDeleteWorkoutSession()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  const filteredSessions = sessions?.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return
    try {
      await deleteSession.mutateAsync(sessionToDelete)
      toast.success('Workout deleted successfully!')
    } catch (error) {
      console.error('Failed to delete workout:', error)
      toast.error('Failed to delete workout. Please try again.')
    } finally {
      setSessionToDelete(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-neutral-100">Workout History</h1>
        <p className="text-neutral-400">Review your past workouts and progress</p>
      </div>

      {/* Search */}
      <Card className="bg-neutral-900 border-neutral-800 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
          <Input
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-800 border-neutral-700 text-neutral-100"
          />
        </div>
      </Card>

      {/* Workout Sessions */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
        </div>
      ) : filteredSessions && filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map(session => (
            <Card
              key={session.id}
              className="bg-neutral-900 border-neutral-800 p-6 hover:border-neutral-700 transition-colors cursor-pointer"
              onClick={() => (window.location.href = `/workouts/${session.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Dumbbell className="text-blue-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{session.title}</h3>
                      {session.completedAt && (
                        <div className="p-1 rounded bg-green-500/20">
                          <Award className="text-green-500" size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          {new Date(session.startTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {session.duration && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{session.duration} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Dumbbell size={16} />
                        <span>{session.exercises?.length || 0} exercises</span>
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-neutral-500 mt-2">{session.notes}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    handleDeleteClick(session.id!)
                  }}
                  className="border-neutral-700 text-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-neutral-900 border-neutral-800 p-12 text-center">
          <Dumbbell className="mx-auto h-16 w-16 text-neutral-700 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Workouts Yet</h3>
          <p className="text-neutral-500 mb-6">Start logging your workouts to see them here</p>
          <Button
            onClick={() => (window.location.href = '/workouts/log')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Log Your First Workout
          </Button>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Workout"
        description="Are you sure you want to delete this workout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}
