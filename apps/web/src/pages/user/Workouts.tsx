import { useState } from 'react'
import { useWorkoutPlans, useDeleteWorkoutPlan } from '../../hooks/useWorkoutPlans'
import { usePublicWorkoutTemplates } from '../../hooks/useWorkoutPlans'
import { Button } from '@repo/ui/Button'
import { Card } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { Dialog } from '@repo/ui/Dialog'
import { useToast } from '@repo/ui/useToast'
import { Loader2, Dumbbell, Plus, Search, TrendingUp, Trash2 } from 'lucide-react'

export default function Workouts() {
  const { data: userPlans, isLoading: plansLoading } = useWorkoutPlans()
  const { data: templates, isLoading: templatesLoading } = usePublicWorkoutTemplates()
  const deleteWorkoutPlan = useDeleteWorkoutPlan()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  const filteredPlans = userPlans?.filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTemplates = templates?.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeletePlanClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setPlanToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return
    try {
      await deleteWorkoutPlan.mutateAsync(planToDelete)
      toast.success('Workout plan deleted successfully!')
    } catch (error) {
      console.error('Failed to delete workout plan:', error)
      toast.error('Failed to delete workout plan.')
    } finally {
      setPlanToDelete(null)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-neutral-100">Workouts</h1>
          <p className="text-neutral-400">Choose a workout or create your own</p>
        </div>
        <Button
          onClick={() => (window.location.href = '/workouts/log')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus size={20} className="mr-2" />
          Start Workout
        </Button>
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

      {/* My Workout Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-neutral-100">My Workout Plans</h2>
        {plansLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
          </div>
        ) : filteredPlans && filteredPlans.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map(plan => (
              <Card
                key={plan.id}
                className="bg-neutral-900 border-neutral-800 p-6 hover:border-neutral-700 transition-colors cursor-pointer group relative"
                onClick={() => (window.location.href = `/workouts/log?planId=${plan.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Dumbbell className="text-blue-500" size={24} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => handleDeletePlanClick(e, plan.id)}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <h3 className="font-bold text-lg mb-2">{plan.title}</h3>
                {plan.description && (
                  <p className="text-sm text-neutral-400 mb-4">{plan.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>{plan.exercises.length} exercises</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-neutral-900 border-neutral-800 p-8 text-center">
            <Dumbbell className="mx-auto h-12 w-12 text-neutral-700 mb-4" />
            <p className="text-neutral-500 mb-4">No custom workout plans yet</p>
            <Button
              onClick={() => (window.location.href = '/workouts/log')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Create Your First Plan
            </Button>
          </Card>
        )}
      </div>

      {/* Workout Templates */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-neutral-100">Workout Templates</h2>
        {templatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
          </div>
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className="bg-neutral-900 border-neutral-800 p-6 hover:border-neutral-700 transition-colors cursor-pointer"
                onClick={() => (window.location.href = `/workouts/log?templateId=${template.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <TrendingUp className="text-purple-500" size={24} />
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400">
                    Template
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{template.title}</h3>
                {template.description && (
                  <p className="text-sm text-neutral-400 mb-4">{template.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>{template.exercises.length} exercises</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-neutral-900 border-neutral-800 p-8 text-center">
            <p className="text-neutral-500">No workout templates available</p>
          </Card>
        )}
      </div>

      {/* Delete Plan Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Workout Plan"
        description="Are you sure you want to delete this workout plan? It can be recovered later if needed."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}
