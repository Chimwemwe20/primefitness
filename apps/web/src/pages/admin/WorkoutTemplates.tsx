import { useState } from 'react'
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
} from 'lucide-react'
import type { WorkoutPlan, WorkoutExercise } from '@repo/shared/schemas'

export default function WorkoutTemplates() {
  const { data: templates, isLoading } = useAdminTemplates()
  const { data: exercises } = useExercises()

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()

  const [searchQuery, setSearchQuery] = useState('')
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
      alert('Title is required')
      return
    }

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          data: formData,
        })
      } else {
        await createTemplate.mutateAsync(formData as Omit<WorkoutPlan, 'id' | 'userId' | 'status'>)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id)
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

  const filteredTemplates = templates?.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredExercises = exercises
    ?.filter(ex => ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workout Templates</h1>
          <p className="text-neutral-400">Manage public workout templates</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Create Template
        </Button>
      </div>

      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-800 border-neutral-700"
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-500">Loading templates...</div>
          ) : filteredTemplates?.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No templates found</div>
          ) : (
            filteredTemplates?.map(template => (
              <Card key={template.id} className="bg-neutral-800 border-neutral-700 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded bg-neutral-700">
                      <FileText size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{template.title}</h3>
                      <p className="text-sm text-neutral-400">
                        {template.exercises.length} Exercises
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedTemplate(expandedTemplate === template.id ? null : template.id)
                      }
                    >
                      {expandedTemplate === template.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </Button>
                    <div className="h-6 w-px bg-neutral-700 mx-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(template)}
                      className="hover:text-blue-400"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {expandedTemplate === template.id && (
                  <div className="bg-neutral-900/50 p-4 border-t border-neutral-700">
                    <p className="text-neutral-400 mb-4">
                      {template.description || 'No description provided.'}
                    </p>
                    <div className="space-y-2">
                      {template.exercises.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-sm p-2 rounded bg-neutral-800"
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-700 text-xs text-neutral-400">
                            {i + 1}
                          </span>
                          <span className="font-medium flex-1">{ex.name}</span>
                          <span className="text-neutral-400">
                            {ex.sets} sets x {ex.reps} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-neutral-900 border-neutral-800 p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X size={20} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Left Column: Details */}
              <div className="space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-400">
                    Template Title
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="bg-neutral-800 border-neutral-700"
                    placeholder="e.g. Full Body Strength"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-400">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-neutral-800 border-neutral-700 rounded-md p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the goal of this workout..."
                  />
                </div>

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
                      className="pl-9 bg-neutral-800 border-neutral-700"
                    />
                  </div>
                  {exerciseSearch && (
                    <div className="mt-2 space-y-1 border border-neutral-800 rounded-md bg-neutral-900 max-h-48 overflow-y-auto">
                      {filteredExercises?.length === 0 ? (
                        <div className="p-3 text-sm text-neutral-500 text-center">
                          No exercises found
                        </div>
                      ) : (
                        filteredExercises?.map(ex => (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() => addExercise(ex.name)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                          >
                            <Plus size={14} className="text-blue-500" />
                            {ex.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Exercises List */}
              <div className="flex flex-col bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden">
                <div className="p-3 bg-neutral-900 border-b border-neutral-800 font-medium text-sm flex justify-between items-center">
                  <span>Selected Exercises ({formData.exercises?.length || 0})</span>
                  <span className="text-xs text-neutral-500">Drag to reorder (coming soon)</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {formData.exercises?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm">
                      <Dumbbell size={32} className="mb-2 opacity-20" />
                      <p>No exercises added yet</p>
                    </div>
                  ) : (
                    formData.exercises?.map((ex, i) => (
                      <div key={i} className="bg-neutral-900 rounded border border-neutral-800 p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            {i + 1}. {ex.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExercise(i)}
                            className="text-neutral-500 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-neutral-500 uppercase">Sets</label>
                            <Input
                              type="number"
                              min="1"
                              value={ex.sets}
                              onChange={e =>
                                updateExerciseDetail(i, 'sets', parseInt(e.target.value) || 0)
                              }
                              className="h-7 text-xs bg-neutral-800 border-neutral-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 uppercase">Reps</label>
                            <Input
                              type="text"
                              value={ex.reps}
                              onChange={e => updateExerciseDetail(i, 'reps', e.target.value)}
                              className="h-7 text-xs bg-neutral-800 border-neutral-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 uppercase">
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
                              className="h-7 text-xs bg-neutral-800 border-neutral-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-4">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
