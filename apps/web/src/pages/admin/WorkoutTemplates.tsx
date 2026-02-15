import { useState, useRef, useEffect } from 'react'
import {
  useAdminTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from '../../hooks/useAdminTemplates'
import { useExercises } from '../../hooks/useExercises'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import { Dialog } from '@repo/ui/Dialog'
import { useToast } from '@repo/ui/useToast'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileText,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Database,
} from 'lucide-react'
import type { WorkoutPlan, WorkoutExercise } from '@repo/shared/schemas'
import { DEFAULT_WORKOUT_TEMPLATES } from './DefaultWorkoutTemplates'
import { auth } from '../../lib/firebase'

export default function WorkoutTemplates() {
  const { data: templates, isLoading } = useAdminTemplates()
  const { data: exercises } = useExercises()

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<(WorkoutPlan & { id: string }) | null>(
    null
  )

  // Form State
  const initialFormState: Partial<WorkoutPlan> = {
    title: '',
    description: '',
    exercises: [],
    status: 'active',
  }
  const [formData, setFormData] = useState<Partial<WorkoutPlan>>(initialFormState)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const hasAutoSeededRef = useRef(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false)

  const handleOpenModal = (template?: WorkoutPlan & { id: string }) => {
    if (template) {
      setEditingTemplate(template)
      setFormData(template)
    } else {
      setEditingTemplate(null)
      setFormData(initialFormState)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTemplate(null)
    setFormData(initialFormState)
    setExerciseSearch('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      toast.error('Title is required')
      return
    }

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          data: formData,
        })
        toast.success('Template updated successfully!')
      } else {
        await createTemplate.mutateAsync(formData as Omit<WorkoutPlan, 'id' | 'userId' | 'status'>)
        toast.success('Template created successfully!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save template:', error)
      toast.error('Failed to save template. Please try again.')
    }
  }

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return
    try {
      await deleteTemplate.mutateAsync(templateToDelete)
      toast.success('Template deleted successfully!')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template. Please try again.')
    } finally {
      setTemplateToDelete(null)
    }
  }

  const addExercise = (exerciseName: string) => {
    const newExercise: WorkoutExercise = {
      name: exerciseName,
      sets: 3,
      reps: 10,
      rest: 60,
    }
    setFormData({
      ...formData,
      exercises: [...(formData.exercises || []), newExercise],
    })
    setExerciseSearch('')
  }

  const removeExercise = (index: number) => {
    const updated = [...(formData.exercises || [])]
    updated.splice(index, 1)
    setFormData({ ...formData, exercises: updated })
  }

  const runSeedDefaults = async (options: { silent?: boolean } = {}) => {
    if (!auth.currentUser?.uid) {
      if (!options.silent) toast.error('You must be logged in to seed default templates.')
      return
    }
    if (!exercises?.length && !options.silent) {
      setSeedConfirmOpen(true)
      return
    }
    await performSeed(options)
  }

  const performSeed = async (options: { silent?: boolean } = {}) => {
    setIsSeeding(true)
    let added = 0
    let failed = 0
    try {
      for (const t of DEFAULT_WORKOUT_TEMPLATES) {
        try {
          await createTemplate.mutateAsync({
            title: t.title,
            description: t.description,
            exercises: t.exercises,
          })
          added += 1
        } catch (err) {
          console.error('Failed to create template:', t.title, err)
          failed += 1
        }
      }
      if (!options.silent) {
        if (added > 0) {
          toast.success(
            `Added ${added} default template${added === 1 ? '' : 's'}.${failed > 0 ? ` ${failed} failed (see console).` : ''}`
          )
        }
        if (failed === DEFAULT_WORKOUT_TEMPLATES.length) {
          toast.error('No templates were added. Check the browser console for errors.')
        }
      }
    } catch (error) {
      console.error('Seed default templates failed:', error)
      if (!options.silent) toast.error('Failed to seed default templates.')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleSeedDefaults = () => runSeedDefaults({ silent: false })

  // Auto-seed default templates when list is empty (no exercise requirement)
  useEffect(() => {
    if (
      isLoading ||
      templates === undefined ||
      templates.length > 0 ||
      !auth.currentUser?.uid ||
      hasAutoSeededRef.current
    )
      return
    hasAutoSeededRef.current = true
    runSeedDefaults({ silent: true })
  }, [isLoading, templates])

  const updateExerciseDetail = <K extends keyof WorkoutExercise>(
    index: number,
    field: K,
    value: WorkoutExercise[K]
  ) => {
    const updated = [...(formData.exercises || [])]
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value }
      setFormData({ ...formData, exercises: updated })
    }
  }

  // Filter and pagination
  const filteredTemplates = templates?.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil((filteredTemplates?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTemplates = filteredTemplates?.slice(startIndex, startIndex + itemsPerPage)

  const filteredExercises = exercises
    ?.filter(ex => ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-100">
              Workout Templates
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 mt-1">
              Manage public workout templates for users
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              variant="outline"
              className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 h-11"
            >
              {isSeeding ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full inline-block mr-2" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database size={18} className="mr-2" />
                  Seed default templates
                </>
              )}
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 h-11"
            >
              <Plus size={20} className="mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-neutral-900 border-neutral-800 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={18}
            />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 bg-neutral-800 border-neutral-700 h-11 text-base"
            />
          </div>
          <div className="mt-3 text-xs sm:text-sm text-neutral-500">
            Showing {paginatedTemplates?.length || 0} of {filteredTemplates?.length || 0} templates
          </div>
        </Card>

        {/* Templates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-neutral-500">Loading templates...</p>
            </div>
          </div>
        ) : paginatedTemplates?.length === 0 ? (
          <Card className="bg-neutral-900 border-neutral-800 p-12 text-center">
            <FileText className="h-16 w-16 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 mb-4">No templates found</p>
            <Button onClick={() => handleOpenModal()} className="bg-blue-600">
              <Plus size={16} className="mr-2" />
              Create First Template
            </Button>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {paginatedTemplates?.map(template => (
              <Card
                key={template.id}
                className="bg-neutral-900 border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all"
              >
                {/* Template Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-blue-500/20 flex-shrink-0">
                      <FileText size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-neutral-100 truncate">
                        {template.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400">
                        {template.exercises.length} Exercises
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedTemplate(expandedTemplate === template.id ? null : template.id)
                      }
                      className="h-9 w-9 p-0"
                    >
                      {expandedTemplate === template.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </Button>
                    <div className="hidden sm:block h-6 w-px bg-neutral-700" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(template)}
                      className="h-9 w-9 p-0 hover:text-blue-400"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(template.id)}
                      className="h-9 w-9 p-0 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTemplate === template.id && (
                  <div className="bg-neutral-950/50 p-4 sm:p-5 border-t border-neutral-800">
                    {template.description && (
                      <p className="text-sm text-neutral-400 mb-4">{template.description}</p>
                    )}
                    <div className="space-y-2">
                      {template.exercises.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-sm p-3 rounded-lg bg-neutral-900 border border-neutral-800"
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-500 text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <Dumbbell size={14} className="text-neutral-500 flex-shrink-0" />
                          <span className="font-medium flex-1 min-w-0 truncate text-neutral-200">
                            {ex.name}
                          </span>
                          <span className="text-neutral-400 text-xs sm:text-sm whitespace-nowrap">
                            {ex.sets}×{ex.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-neutral-700"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-neutral-700"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal - Mobile Optimized */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <Card className="bg-neutral-900 border-neutral-800 w-full sm:max-w-5xl sm:rounded-lg rounded-t-2xl max-h-[90vh] flex flex-col">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-lg sm:text-xl font-bold">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="h-9 w-9 p-0"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                  {/* Left Column: Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-400">
                        Template Title *
                      </label>
                      <Input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="bg-neutral-800 border-neutral-700 h-11 text-base"
                        placeholder="e.g. Full Body Strength"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-400">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-base text-neutral-100 placeholder:text-neutral-500"
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the goal of this workout..."
                      />
                    </div>

                    {/* Add Exercises Section */}
                    <div className="pt-4 border-t border-neutral-800">
                      <label className="block text-sm font-medium mb-2 text-neutral-400">
                        Add Exercises
                      </label>
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                          size={16}
                        />
                        <Input
                          placeholder="Search exercise database..."
                          value={exerciseSearch}
                          onChange={e => setExerciseSearch(e.target.value)}
                          className="pl-9 bg-neutral-800 border-neutral-700 h-11 text-base"
                        />
                      </div>
                      {exerciseSearch && (
                        <div className="mt-2 space-y-1 border border-neutral-800 rounded-lg bg-neutral-950 max-h-48 overflow-y-auto">
                          {filteredExercises?.length === 0 ? (
                            <div className="p-4 text-sm text-neutral-500 text-center">
                              No exercises found
                            </div>
                          ) : (
                            filteredExercises?.map(ex => (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() => addExercise(ex.name)}
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-neutral-800 flex items-center gap-2 transition-colors active:scale-95"
                              >
                                <Plus size={14} className="text-blue-500" />
                                <Dumbbell size={14} className="text-neutral-500" />
                                {ex.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Exercises List */}
                  <div className="flex flex-col bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden min-h-[400px]">
                    <div className="p-3 sm:p-4 bg-neutral-900 border-b border-neutral-800 font-medium text-sm flex justify-between items-center">
                      <span>Selected Exercises ({formData.exercises?.length || 0})</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
                      {formData.exercises?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm py-12">
                          <Dumbbell size={40} className="mb-3 opacity-20" />
                          <p>No exercises added yet</p>
                          <p className="text-xs mt-1">Search and add exercises from the left</p>
                        </div>
                      ) : (
                        formData.exercises?.map((ex, i) => (
                          <div
                            key={i}
                            className="bg-neutral-900 rounded-lg border border-neutral-800 p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <GripVertical
                                  size={14}
                                  className="text-neutral-600 flex-shrink-0"
                                />
                                <span className="font-medium text-sm truncate">
                                  {i + 1}. {ex.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExercise(i)}
                                className="text-neutral-500 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                                  Sets
                                </label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={ex.sets}
                                  onChange={e =>
                                    updateExerciseDetail(i, 'sets', parseInt(e.target.value) || 0)
                                  }
                                  className="h-9 text-sm bg-neutral-800 border-neutral-700"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                                  Reps
                                </label>
                                <Input
                                  type="text"
                                  value={ex.reps}
                                  onChange={e => updateExerciseDetail(i, 'reps', e.target.value)}
                                  className="h-9 text-sm bg-neutral-800 border-neutral-700"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-500 uppercase block mb-1">
                                  Rest (s)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={ex.rest || 0}
                                  onChange={e =>
                                    updateExerciseDetail(i, 'rest', parseInt(e.target.value) || 0)
                                  }
                                  className="h-9 text-sm bg-neutral-800 border-neutral-700"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-neutral-900 border-t border-neutral-800 p-4 sm:p-6 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModal}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Template"
          description="Are you sure you want to delete this template? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />

        {/* Seed Confirmation Dialog */}
        <Dialog
          open={seedConfirmOpen}
          onOpenChange={setSeedConfirmOpen}
          title="Seed Default Templates"
          description="No exercises in the library yet. Templates will still be created with default exercise names. Seed exercises in Exercise Management for the full experience. Continue?"
          confirmText="Continue"
          cancelText="Cancel"
          onConfirm={() => performSeed({ silent: false })}
        />
      </div>
    </div>
  )
}
