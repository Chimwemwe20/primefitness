import { useState } from 'react'
import {
  useAdminExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from '../../hooks/useAdminExcercises'
import { Card } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { Input } from '@repo/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@repo/ui/Table'
import { Plus, Search, Edit2, Trash2, X, Dumbbell } from 'lucide-react'
import type { Exercise } from '@repo/shared/schemas'

export default function ExerciseManagement() {
  const { data: exercises, isLoading } = useAdminExercises()
  const createExercise = useCreateExercise()
  const updateExercise = useUpdateExercise()
  const deleteExercise = useDeleteExercise()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<(Exercise & { id: string }) | null>(null)

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
      } else {
        await createExercise.mutateAsync(formData as Omit<Exercise, 'id'>)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save exercise:', error)
      alert('Failed to save exercise')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exercise?')) {
      await deleteExercise.mutateAsync(id)
    }
  }

  const filteredExercises = exercises?.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelection = (field: 'muscleGroups' | 'equipment', value: string) => {
    const current = (formData[field] || []) as string[]
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    setFormData({ ...formData, [field]: updated })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exercise Management</h1>
          <p className="text-neutral-400">Create and manage global exercises</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Add Exercise
        </Button>
      </div>

      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-800 border-neutral-700"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Muscle Groups</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading exercises...
                  </TableCell>
                </TableRow>
              ) : filteredExercises?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No exercises found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExercises?.map(exercise => (
                  <TableRow
                    key={exercise.id}
                    className="border-neutral-800 hover:bg-neutral-800/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-neutral-800">
                          <Dumbbell size={16} className="text-blue-500" />
                        </div>
                        {exercise.name}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{exercise.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {exercise.muscleGroups.map(m => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded text-xs bg-neutral-800 text-neutral-400 capitalize"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          exercise.difficulty === 'beginner'
                            ? 'bg-green-500/20 text-green-500'
                            : exercise.difficulty === 'intermediate'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {exercise.difficulty}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(exercise)}
                          className="hover:text-blue-400"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exercise.id)}
                          className="hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="bg-neutral-900 border-neutral-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-400">Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700"
                    placeholder="e.g. Bench Press"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-400">
                      Category
                    </label>
                    <select
                      className="w-full bg-neutral-800 border-neutral-700 rounded-md p-2 text-sm"
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
                    <label className="block text-sm font-medium mb-1 text-neutral-400">
                      Difficulty
                    </label>
                    <select
                      className="w-full bg-neutral-800 border-neutral-700 rounded-md p-2 text-sm"
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

                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-400">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-neutral-800 border-neutral-700 rounded-md p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe proper form and technique..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-400">
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
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          formData.muscleGroups?.includes(m as Exercise['muscleGroups'][number])
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-transparent border-neutral-700 text-neutral-400 hover:border-neutral-500'
                        }`}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-400">
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
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          formData.equipment?.includes(
                            e as NonNullable<Exercise['equipment']>[number]
                          )
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-transparent border-neutral-700 text-neutral-400 hover:border-neutral-500'
                        }`}
                      >
                        {e.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-400">
                    Video URL
                  </label>
                  <Input
                    type="url"
                    value={formData.videoUrl || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-700"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingExercise ? 'Update Exercise' : 'Create Exercise'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
