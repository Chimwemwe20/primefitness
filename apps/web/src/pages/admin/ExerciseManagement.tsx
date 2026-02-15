import { useState, useRef, useEffect } from 'react'
import {
  useAdminExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from '../../hooks/useAdminExercises'
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
  Dumbbell,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Database,
} from 'lucide-react'
import type { Exercise } from '@repo/shared/schemas'
import { DEFAULT_EXERCISES } from './DefaultExercises'
import { auth } from '../../lib/firebase'

export default function ExerciseManagement() {
  const { data: exercises, isLoading } = useAdminExercises()
  const createExercise = useCreateExercise()
  const updateExercise = useUpdateExercise()
  const deleteExercise = useDeleteExercise()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<(Exercise & { id: string }) | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const hasAutoSeededRef = useRef(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null)

  // Form State
  const initialFormState: Partial<Exercise> = {
    name: '',
    category: 'strength',
    muscleGroups: [],
    equipment: [],
    difficulty: 'intermediate',
    description: '',
    videoUrl: '',
    imageUrl: '',
    isPublic: true,
  }
  const [formData, setFormData] = useState<Partial<Exercise>>(initialFormState)

  const handleOpenModal = (exercise?: Exercise & { id: string }) => {
    if (exercise) {
      setEditingExercise(exercise)
      setFormData(exercise)
    } else {
      setEditingExercise(null)
      setFormData(initialFormState)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExercise(null)
    setFormData(initialFormState)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingExercise) {
        await updateExercise.mutateAsync({
          id: editingExercise.id,
          data: formData,
        })
        toast.success('Exercise updated successfully!')
      } else {
        await createExercise.mutateAsync(formData as Omit<Exercise, 'id'>)
        toast.success('Exercise created successfully!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save exercise:', error)
      toast.error('Failed to save exercise. Please try again.')
    }
  }

  const handleDeleteClick = (id: string) => {
    setExerciseToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!exerciseToDelete) return
    try {
      await deleteExercise.mutateAsync(exerciseToDelete)
      toast.success('Exercise deleted successfully!')
    } catch (error) {
      console.error('Failed to delete exercise:', error)
      toast.error('Failed to delete exercise. Please try again.')
    } finally {
      setExerciseToDelete(null)
    }
  }

  const runSeedDefaults = async (options: { silent?: boolean } = {}) => {
    if (!auth.currentUser?.uid) {
      if (!options.silent) toast.error('You must be logged in to seed default exercises.')
      return
    }
    setIsSeeding(true)
    let added = 0
    let failed = 0
    try {
      for (const ex of DEFAULT_EXERCISES) {
        try {
          await createExercise.mutateAsync(ex as Omit<Exercise, 'id'>)
          added += 1
        } catch {
          failed += 1
        }
      }
      if (!options.silent) {
        if (added > 0) {
          toast.success(
            `Added ${added} default exercise${added === 1 ? '' : 's'}.${failed > 0 ? ` ${failed} skipped (may already exist).` : ''}`
          )
        }
        if (failed === DEFAULT_EXERCISES.length) {
          toast.info('No exercises were added. They may already exist in the library.')
        }
      }
    } catch (error) {
      console.error('Seed defaults failed:', error)
      if (!options.silent) toast.error('Failed to seed default exercises.')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleSeedDefaults = () => runSeedDefaults({ silent: false })

  // Auto-seed default exercises when library is empty (first-time setup)
  useEffect(() => {
    if (
      isLoading ||
      exercises === undefined ||
      exercises.length > 0 ||
      !auth.currentUser?.uid ||
      hasAutoSeededRef.current
    )
      return
    hasAutoSeededRef.current = true
    runSeedDefaults({ silent: true })
  }, [isLoading, exercises])

  const toggleSelection = (field: 'muscleGroups' | 'equipment', value: string) => {
    const current = (formData[field] || []) as string[]
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    setFormData({ ...formData, [field]: updated })
  }

  // Filter exercises
  const filteredExercises = exercises?.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || ex.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Pagination
  const totalPages = Math.ceil((filteredExercises?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedExercises = filteredExercises?.slice(startIndex, startIndex + itemsPerPage)

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      beginner: 'bg-green-500/20 text-green-500 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-500 border-red-500/30',
    }
    return badges[difficulty as keyof typeof badges] || badges.intermediate
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Exercise Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Create and manage global exercise library
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              variant="outline"
              className="border-border text-muted-foreground hover:bg-muted h-11"
            >
              {isSeeding ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full inline-block mr-2" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database size={18} className="mr-2" />
                  Seed default exercises
                </>
              )}
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 h-11"
            >
              <Plus size={20} className="mr-2" />
              Add Exercise
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-background border-input h-11 text-base"
              />
            </div>

            {/* Category and Difficulty Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  size={16}
                />
                <select
                  value={categoryFilter}
                  onChange={e => {
                    setCategoryFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full h-10 pl-9 pr-3 bg-background border border-input rounded-lg text-foreground text-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="balance">Balance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  size={16}
                />
                <select
                  value={difficultyFilter}
                  onChange={e => {
                    setDifficultyFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full h-10 pl-9 pr-3 bg-background border border-input rounded-lg text-foreground text-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-xs sm:text-sm text-muted-foreground">
            Showing {paginatedExercises?.length || 0} of {filteredExercises?.length || 0} exercises
          </div>
        </Card>

        {/* Exercise Grid - Mobile First */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-muted-foreground">Loading exercises...</p>
            </div>
          </div>
        ) : paginatedExercises?.length === 0 ? (
          <Card className="bg-card border-border p-12 text-center">
            <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No exercises found</p>
            <Button onClick={() => handleOpenModal()} className="bg-blue-600">
              <Plus size={16} className="mr-2" />
              Create First Exercise
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {paginatedExercises?.map(exercise => (
              <Card
                key={exercise.id}
                className="bg-card border-border p-4 hover:border-input transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 flex-shrink-0">
                    <Dumbbell size={20} className="text-blue-500" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(exercise)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-400"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(exercise.id)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{exercise.name}</h3>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground capitalize">
                      {exercise.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs border capitalize ${getDifficultyBadge(exercise.difficulty || 'intermediate')}`}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {exercise.muscleGroups.slice(0, 3).map(m => (
                      <span
                        key={m}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground capitalize"
                      >
                        {m}
                      </span>
                    ))}
                    {exercise.muscleGroups.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                        +{exercise.muscleGroups.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {exercise.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {exercise.description}
                  </p>
                )}

                {exercise.videoUrl && (
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400"
                  >
                    <ExternalLink size={12} />
                    View Tutorial
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
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
            <Card className="bg-card border-border w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-card border-b border-border px-4 sm:px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-lg sm:text-xl font-bold">
                  {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
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

              <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-5">
                {/* Exercise Name */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Exercise Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-background border-input h-11 text-base"
                    placeholder="e.g. Bench Press"
                  />
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      Category *
                    </label>
                    <select
                      className="w-full h-11 bg-background border-input rounded-lg p-2 text-base text-foreground"
                      value={formData.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as Exercise['category'],
                        })
                      }
                    >
                      {['strength', 'cardio', 'flexibility', 'balance', 'other'].map(c => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      Difficulty
                    </label>
                    <select
                      className="w-full h-11 bg-background border-input rounded-lg p-2 text-base text-foreground"
                      value={formData.difficulty}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as Exercise['difficulty'],
                        })
                      }
                    >
                      {['beginner', 'intermediate', 'advanced'].map(d => (
                        <option key={d} value={d}>
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-background border border-input rounded-lg p-3 text-base text-foreground placeholder:text-muted-foreground"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe proper form and technique..."
                  />
                </div>

                {/* Muscle Groups */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Muscle Groups
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'chest',
                      'back',
                      'shoulders',
                      'arms',
                      'legs',
                      'core',
                      'glutes',
                      'full-body',
                    ].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleSelection('muscleGroups', m)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all active:scale-95 ${
                          formData.muscleGroups?.includes(m as Exercise['muscleGroups'][number])
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-transparent border-input text-muted-foreground hover:border-foreground'
                        }`}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Equipment
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'barbell',
                      'dumbbell',
                      'kettlebell',
                      'machine',
                      'bodyweight',
                      'resistance-band',
                      'other',
                    ].map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => toggleSelection('equipment', e)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all active:scale-95 ${
                          formData.equipment?.includes(
                            e as NonNullable<Exercise['equipment']>[number]
                          )
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-transparent border-input text-muted-foreground hover:border-foreground'
                        }`}
                      >
                        {e.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Video URL (optional)
                  </label>
                  <Input
                    type="url"
                    value={formData.videoUrl || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700 h-11 text-base"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseModal}
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 h-11">
                    {editingExercise ? 'Update Exercise' : 'Create Exercise'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Exercise"
          description="Are you sure you want to delete this exercise? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </div>
  )
}
