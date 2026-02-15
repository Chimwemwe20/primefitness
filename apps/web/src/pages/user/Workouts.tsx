import { useState } from 'react'
import {
  useWorkoutPlans,
  useDeleteWorkoutPlan,
  useCreateWorkoutPlan,
  usePublicWorkoutTemplates,
} from '../../hooks/useWorkoutPlans'
import { Button } from '@repo/ui/Button'
import { Card } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { Dialog } from '@repo/ui/Dialog'
import { useToast } from '@repo/ui/useToast'
import { Loader2, Dumbbell, Plus, Search, TrendingUp, Trash2, X, Play } from 'lucide-react'
import type { WorkoutExercise, WorkoutPlan } from '@repo/shared/schemas'

const emptyExercise = (): WorkoutExercise => ({
  name: '',
  sets: 3,
  reps: 10,
  weight: undefined,
  rest: 60,
  notes: '',
})

export default function Workouts() {
  const { data: userPlans, isLoading: plansLoading } = useWorkoutPlans()
  const { data: templates, isLoading: templatesLoading } = usePublicWorkoutTemplates()
  const deleteWorkoutPlan = useDeleteWorkoutPlan()
  const createWorkoutPlan = useCreateWorkoutPlan()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState('')

  // Dialog open states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<(WorkoutPlan & { id: string }) | null>(
    null
  )

  const [startNowDialogOpen, setStartNowDialogOpen] = useState(false)
  const [createdPlanId, setCreatedPlanId] = useState<string | null>(null)

  // Create plan form
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newExercises, setNewExercises] = useState<WorkoutExercise[]>([emptyExercise()])

  // Start workout search
  const [startSearch, setStartSearch] = useState('')

  const filteredPlans = userPlans?.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredTemplates = templates?.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Combined list for "Start Workout" picker
  const startOptions = [
    ...(userPlans ?? []).map(p => ({ ...p, kind: 'plan' as const })),
    ...(templates ?? []).map(t => ({ ...t, kind: 'template' as const })),
  ].filter(o => o.title.toLowerCase().includes(startSearch.toLowerCase()))

  // ── Form helpers ──

  const resetCreateForm = () => {
    setNewTitle('')
    setNewDescription('')
    setNewExercises([emptyExercise()])
  }

  const updateExercise = (idx: number, field: keyof WorkoutExercise, value: unknown) => {
    setNewExercises(prev => prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)))
  }

  const removeExercise = (idx: number) => {
    setNewExercises(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)))
  }

  // ── Handlers ──

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setPlanToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return
    try {
      await deleteWorkoutPlan.mutateAsync(planToDelete)
      toast.success('Workout plan deleted!')
    } catch {
      toast.error('Failed to delete workout plan.')
    } finally {
      setPlanToDelete(null)
    }
  }

  const handleCreatePlan = async () => {
    const validExercises = newExercises.filter(ex => ex.name.trim() !== '')
    if (!newTitle.trim()) {
      toast.error('Please enter a plan title.')
      return
    }
    if (validExercises.length === 0) {
      toast.error('Add at least one exercise with a name.')
      return
    }
    try {
      const result = await createWorkoutPlan.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        exercises: validExercises,
      })
      toast.success('Workout plan created!')
      setCreateDialogOpen(false)
      resetCreateForm()
      setCreatedPlanId(result.id)
      setStartNowDialogOpen(true)
    } catch {
      toast.error('Failed to create workout plan.')
    }
  }

  const handleTemplateClick = (template: WorkoutPlan & { id: string }) => {
    setSelectedTemplate(template)
    setTemplateDialogOpen(true)
  }

  const handleSaveTemplateAsPlan = async () => {
    if (!selectedTemplate) return
    try {
      const result = await createWorkoutPlan.mutateAsync({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        exercises: selectedTemplate.exercises,
      })
      toast.success('Saved template as your plan!')
      setTemplateDialogOpen(false)
      setSelectedTemplate(null)
      setCreatedPlanId(result.id)
      setStartNowDialogOpen(true)
    } catch {
      toast.error('Failed to save template as plan.')
    }
  }

  const handleStartOption = (kind: 'plan' | 'template', id: string) => {
    setStartDialogOpen(false)
    const param = kind === 'plan' ? 'planId' : 'templateId'
    window.location.href = `/workouts/log?${param}=${id}`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-neutral-100">Workouts</h1>
          <p className="text-neutral-400">Choose a workout or create your own</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            variant="outline"
            className="border-neutral-700 text-neutral-300 hover:text-neutral-100 flex-1 sm:flex-initial"
          >
            <Plus size={20} className="sm:mr-2" />
            <span className="hidden sm:inline">Create Plan</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <Button
            onClick={() => {
              setStartSearch('')
              setStartDialogOpen(true)
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white flex-1 sm:flex-initial"
          >
            <Play size={20} className="sm:mr-2" />
            <span className="hidden sm:inline">Start Workout</span>
            <span className="sm:hidden">Start</span>
          </Button>
        </div>
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
                    onClick={e => handleDeleteClick(e, plan.id)}
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
              onClick={() => setCreateDialogOpen(true)}
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
                onClick={() => handleTemplateClick(template)}
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

      {/* ── DIALOGS ──────────────────────────────────────────── */}

      {/* Delete Confirmation */}
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

      {/* Create Plan Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={open => {
          setCreateDialogOpen(open)
          if (!open) resetCreateForm()
        }}
        title="Create Workout Plan"
        description="Set up a new custom workout plan with your exercises."
        size="lg"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Plan Title</label>
            <Input
              placeholder="e.g. Push Day, Full Body Friday"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Description <span className="text-neutral-500">(optional)</span>
            </label>
            <Input
              placeholder="A short description of this plan"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
            />
          </div>

          {/* Exercises */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Exercises</label>
            <div className="space-y-3">
              {newExercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 font-medium">Exercise {idx + 1}</span>
                    {newExercises.length > 1 && (
                      <button
                        onClick={() => removeExercise(idx)}
                        className="text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Exercise name"
                    value={ex.name}
                    onChange={e => updateExercise(idx, 'name', e.target.value)}
                    className="bg-neutral-900 border-neutral-600 text-neutral-100"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Sets</label>
                      <Input
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                        className="bg-neutral-900 border-neutral-600 text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Reps</label>
                      <Input
                        value={ex.reps}
                        onChange={e => updateExercise(idx, 'reps', e.target.value)}
                        placeholder="10 or 8-12"
                        className="bg-neutral-900 border-neutral-600 text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Weight (kg)</label>
                      <Input
                        type="number"
                        min={0}
                        value={ex.weight ?? ''}
                        onChange={e =>
                          updateExercise(
                            idx,
                            'weight',
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                        placeholder="—"
                        className="bg-neutral-900 border-neutral-600 text-neutral-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setNewExercises(prev => [...prev, emptyExercise()])}
              className="mt-3 w-full border-dashed border-neutral-700 text-neutral-400 hover:text-neutral-200"
            >
              <Plus size={16} className="mr-2" />
              Add Exercise
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                resetCreateForm()
              }}
              className="border-neutral-700 text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={createWorkoutPlan.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createWorkoutPlan.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Plan'
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Start Workout Picker Dialog */}
      <Dialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        title="Start Workout"
        description="Choose a plan or template to start your workout."
      >
        <div className="space-y-3">
          {/* Search within picker */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <Input
              placeholder="Search plans & templates..."
              value={startSearch}
              onChange={e => setStartSearch(e.target.value)}
              className="pl-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
            />
          </div>

          {/* Option list */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {startOptions.length > 0 ? (
              startOptions.map(opt => (
                <button
                  key={`${opt.kind}-${opt.id}`}
                  onClick={() => handleStartOption(opt.kind, opt.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition-colors text-left"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      opt.kind === 'plan' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                    }`}
                  >
                    {opt.kind === 'plan' ? (
                      <Dumbbell className="text-blue-500" size={18} />
                    ) : (
                      <TrendingUp className="text-purple-500" size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-100 truncate">{opt.title}</p>
                    <p className="text-xs text-neutral-500">
                      {opt.exercises.length} exercises ·{' '}
                      {opt.kind === 'plan' ? 'My Plan' : 'Template'}
                    </p>
                  </div>
                  <Play size={16} className="text-neutral-500 flex-shrink-0" />
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-neutral-500 py-4">
                No workouts found. Create a plan first!
              </p>
            )}
          </div>

          {/* Quick action */}
          <Button
            variant="outline"
            onClick={() => {
              setStartDialogOpen(false)
              window.location.href = '/workouts/log'
            }}
            className="w-full border-dashed border-neutral-700 text-neutral-400 hover:text-neutral-200"
          >
            <Plus size={16} className="mr-2" />
            Start Empty Workout
          </Button>
        </div>
      </Dialog>

      {/* Template Action Dialog */}
      <Dialog
        open={templateDialogOpen}
        onOpenChange={open => {
          setTemplateDialogOpen(open)
          if (!open) setSelectedTemplate(null)
        }}
        title={selectedTemplate?.title ?? 'Workout Template'}
        description={
          selectedTemplate?.description ?? 'What would you like to do with this template?'
        }
      >
        <div className="space-y-3 mt-2">
          {/* Show exercises preview */}
          {selectedTemplate && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 mb-2">
              <p className="text-xs font-medium text-neutral-400 mb-2">
                {selectedTemplate.exercises.length} exercises
              </p>
              <div className="space-y-1">
                {selectedTemplate.exercises.map((ex, i) => (
                  <p key={i} className="text-sm text-neutral-300">
                    {ex.name}{' '}
                    <span className="text-neutral-500">
                      — {ex.sets}×{ex.reps}
                      {ex.weight ? ` @ ${ex.weight}kg` : ''}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveTemplateAsPlan}
            disabled={createWorkoutPlan.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createWorkoutPlan.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus size={16} className="mr-2" />
            )}
            Save as My Plan
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!selectedTemplate) return
              setTemplateDialogOpen(false)
              window.location.href = `/workouts/log?templateId=${selectedTemplate.id}`
            }}
            className="w-full border-neutral-700 text-neutral-300 hover:text-neutral-100"
          >
            <Play size={16} className="mr-2" />
            Start Without Saving
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setTemplateDialogOpen(false)
              setSelectedTemplate(null)
            }}
            className="w-full text-neutral-500"
          >
            Cancel
          </Button>
        </div>
      </Dialog>

      {/* Start Now? (after plan creation) */}
      <Dialog
        open={startNowDialogOpen}
        onOpenChange={open => {
          setStartNowDialogOpen(open)
          if (!open) setCreatedPlanId(null)
        }}
        title="Plan Created!"
        description="Your workout plan has been saved. Would you like to start it now?"
        confirmText="Start Now"
        cancelText="Later"
        onConfirm={() => {
          if (createdPlanId) {
            window.location.href = `/workouts/log?planId=${createdPlanId}`
          }
        }}
      />
    </div>
  )
}
