import { useState } from 'react'
import { Button } from '@repo/ui/Button'
import { Card } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { Dialog } from '@repo/ui/Dialog'
import { Plus, X, Target, Dumbbell, Calendar, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../../hooks/useGoals'
import type { Goal } from '@repo/shared/schemas'
import { useToast } from '@repo/ui/useToast'

export default function Goals() {
  const { data: goals = [], isLoading } = useGoals()
  const updateGoal = useUpdateGoal()
  const deleteGoalMutation = useDeleteGoal()
  const toast = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)

  const toggleGoalComplete = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'completed' ? 'active' : 'completed'
      await updateGoal.mutateAsync({
        id: goal.id!,
        data: {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null,
        },
      })
      toast.success(
        newStatus === 'completed' ? 'Goal completed! Great job!' : 'Goal marked as active'
      )
    } catch (error) {
      toast.error('Failed to update goal')
    }
  }

  const handleDeleteClick = (id: string) => {
    setGoalToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return
    try {
      await deleteGoalMutation.mutateAsync(goalToDelete)
      toast.success('Goal deleted successfully')
    } catch (error) {
      toast.error('Failed to delete goal')
    } finally {
      setGoalToDelete(null)
    }
  }

  const getCategoryIcon = (type: Goal['type']) => {
    switch (type) {
      case 'weight':
        return <Target className="text-blue-500" size={24} />
      case 'strength':
        return <Dumbbell className="text-purple-500" size={24} />
      case 'habit':
        return <Calendar className="text-green-500" size={24} />
      default:
        return <Target className="text-neutral-500" size={24} />
    }
  }

  const getCategoryColor = (type: Goal['type']) => {
    switch (type) {
      case 'weight':
        return 'bg-blue-500/20'
      case 'strength':
        return 'bg-purple-500/20'
      case 'habit':
        return 'bg-green-500/20'
      default:
        return 'bg-neutral-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-neutral-100">Fitness Goals</h1>
          <p className="text-neutral-400">Set and track your fitness objectives</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus size={20} className="mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Target className="text-blue-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-neutral-400 mb-1">Active Goals</p>
          <p className="text-3xl font-bold">{activeGoals.length}</p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-neutral-400 mb-1">Completed</p>
          <p className="text-3xl font-bold">{completedGoals.length}</p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Dumbbell className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-neutral-400 mb-1">Total Goals</p>
          <p className="text-3xl font-bold">{goals.length}</p>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Active Goals</h2>
          <div className="space-y-4">
            {activeGoals.map(goal => (
              <Card key={goal.id} className="bg-neutral-900 border-neutral-800 p-6">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleGoalComplete(goal)}
                    disabled={updateGoal.isPending}
                    className="mt-1 text-neutral-500 hover:text-green-500 transition-colors disabled:opacity-50"
                  >
                    <Circle size={24} />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(goal.type)}`}>
                          {getCategoryIcon(goal.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{goal.title}</h3>
                          <p className="text-sm text-neutral-400">{goal.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(goal.id!)}
                        disabled={deleteGoalMutation.isPending}
                        className="text-neutral-500 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {goal.targetValue && goal.currentValue !== undefined && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-neutral-400">Progress</span>
                          <span className="text-neutral-300">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {goal.targetDate && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
                        <Calendar size={16} />
                        <span>
                          Target:{' '}
                          {new Date(goal.targetDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Completed Goals</h2>
          <div className="space-y-4">
            {completedGoals.map(goal => (
              <Card key={goal.id} className="bg-neutral-900 border-neutral-800 p-6 opacity-60">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleGoalComplete(goal)}
                    disabled={updateGoal.isPending}
                    className="mt-1 text-green-500 hover:text-neutral-500 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={24} />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(goal.type)}`}>
                          {getCategoryIcon(goal.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold line-through">{goal.title}</h3>
                          <p className="text-sm text-neutral-400">{goal.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(goal.id!)}
                        disabled={deleteGoalMutation.isPending}
                        className="text-neutral-500 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="bg-neutral-900 border-neutral-800 p-12">
          <div className="text-center">
            <Target className="mx-auto h-16 w-16 text-neutral-700 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Goals Yet</h3>
            <p className="text-neutral-500 mb-6">
              Start setting fitness goals to track your progress and stay motivated!
            </p>
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus size={20} className="mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </Card>
      )}

      {/* Add Goal Modal */}
      {showAddModal && <AddGoalModal onClose={() => setShowAddModal(false)} />}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? It will be removed from your goals list."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const createGoal = useCreateGoal()
  const toast = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other' as Goal['type'],
    targetValue: '',
    currentValue: '',
    unit: '',
    targetDate: '',
  })

  const handleSubmit = async () => {
    if (!formData.title) return

    try {
      await createGoal.mutateAsync({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        unit: formData.unit || undefined,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
        status: 'active',
        startDate: new Date(),
      })
      toast.success('Goal created successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to create goal')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-neutral-900 border-neutral-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Goal</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Goal Title *</label>
            <Input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="bg-neutral-800 border-neutral-700"
              placeholder="e.g., Reach 75kg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 resize-none"
              rows={3}
              placeholder="What do you want to achieve?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Category</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as Goal['type'] })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100"
            >
              <option value="weight">Weight Goal</option>
              <option value="strength">Strength Goal</option>
              <option value="habit">Habit Goal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Current Value
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.currentValue}
                onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
                className="bg-neutral-800 border-neutral-700"
                placeholder="85"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Target Value
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.targetValue}
                onChange={e => setFormData({ ...formData, targetValue: e.target.value })}
                className="bg-neutral-800 border-neutral-700"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Unit</label>
              <Input
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="bg-neutral-800 border-neutral-700"
                placeholder="kg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Target Deadline
            </label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={!formData.title || createGoal.isPending}
          >
            {createGoal.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Goal'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
