import { useState } from 'react'
import { useProgressEntries, useCreateProgressEntry } from '../../hooks/useProgress'
import { Button } from '@repo/ui/Button'
import { Card } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { useToast } from '@repo/ui/useToast'
import { Loader2, TrendingUp, TrendingDown, Plus, X, Scale, Activity, Calendar } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function Progress() {
  const { data: entries, isLoading } = useProgressEntries()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bodyFat'>('weight')

  const latestEntry = entries?.[0]
  const previousEntry = entries?.[1]

  const weightChange =
    latestEntry && previousEntry ? (latestEntry.weight || 0) - (previousEntry.weight || 0) : 0

  const bodyFatChange =
    latestEntry && previousEntry ? (latestEntry.bodyFat || 0) - (previousEntry.bodyFat || 0) : 0

  // Prepare chart data
  const chartData = entries
    ?.slice(0, 30)
    .reverse()
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight || 0,
      bodyFat: entry.bodyFat || 0,
    }))

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-neutral-100">Progress Tracking</h1>
          <p className="text-neutral-400">Monitor your body metrics and measurements</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus size={20} className="mr-2" />
          Log Entry
        </Button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Scale className="text-blue-500" size={24} />
            </div>
            {weightChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm ${weightChange > 0 ? 'text-red-500' : 'text-green-500'}`}
              >
                {weightChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(weightChange).toFixed(1)} kg</span>
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-400 mb-1">Current Weight</p>
          <p className="text-3xl font-bold">
            {latestEntry?.weight?.toFixed(1) || '—'}
            <span className="text-lg text-neutral-500 ml-1">kg</span>
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Activity className="text-purple-500" size={24} />
            </div>
            {bodyFatChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm ${bodyFatChange > 0 ? 'text-red-500' : 'text-green-500'}`}
              >
                {bodyFatChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(bodyFatChange).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-400 mb-1">Body Fat</p>
          <p className="text-3xl font-bold">
            {latestEntry?.bodyFat?.toFixed(1) || '—'}
            <span className="text-lg text-neutral-500 ml-1">%</span>
          </p>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Calendar className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-neutral-400 mb-1">Last Updated</p>
          <p className="text-lg font-bold">
            {latestEntry
              ? new Date(latestEntry.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-neutral-900 border-neutral-800 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Progress Over Time</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedMetric === 'weight' ? 'default' : 'outline'}
              className={selectedMetric === 'weight' ? 'bg-blue-500' : 'border-neutral-700'}
              onClick={() => setSelectedMetric('weight')}
            >
              Weight
            </Button>
            <Button
              size="sm"
              variant={selectedMetric === 'bodyFat' ? 'default' : 'outline'}
              className={selectedMetric === 'bodyFat' ? 'bg-purple-500' : 'border-neutral-700'}
              onClick={() => setSelectedMetric('bodyFat')}
            >
              Body Fat
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
          </div>
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={selectedMetric === 'weight' ? '#3b82f6' : '#a855f7'}
                strokeWidth={2}
                dot={{ fill: selectedMetric === 'weight' ? '#3b82f6' : '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-neutral-700 mb-4" />
            <p className="text-neutral-500">
              No progress data yet. Start logging your measurements!
            </p>
          </div>
        )}
      </Card>

      {/* Measurements History */}
      {latestEntry?.measurements && (
        <Card className="bg-neutral-900 border-neutral-800 p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Body Measurements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {latestEntry.measurements.chest && (
              <div>
                <p className="text-sm text-neutral-400 mb-1">Chest</p>
                <p className="text-2xl font-bold">{latestEntry.measurements.chest} cm</p>
              </div>
            )}
            {latestEntry.measurements.waist && (
              <div>
                <p className="text-sm text-neutral-400 mb-1">Waist</p>
                <p className="text-2xl font-bold">{latestEntry.measurements.waist} cm</p>
              </div>
            )}
            {latestEntry.measurements.hips && (
              <div>
                <p className="text-sm text-neutral-400 mb-1">Hips</p>
                <p className="text-2xl font-bold">{latestEntry.measurements.hips} cm</p>
              </div>
            )}
            {latestEntry.measurements.biceps && (
              <div>
                <p className="text-sm text-neutral-400 mb-1">Biceps</p>
                <p className="text-2xl font-bold">{latestEntry.measurements.biceps} cm</p>
              </div>
            )}
            {latestEntry.measurements.thighs && (
              <div>
                <p className="text-sm text-neutral-400 mb-1">Thighs</p>
                <p className="text-2xl font-bold">{latestEntry.measurements.thighs} cm</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add Entry Modal */}
      {showAddModal && <AddProgressModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

function AddProgressModal({ onClose }: { onClose: () => void }) {
  const createEntryMutation = useCreateProgressEntry()
  const toast = useToast()
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    notes: '',
  })

  const handleSubmit = async () => {
    try {
      await createEntryMutation.mutateAsync({
        date: new Date(),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
        measurements: {
          chest: formData.chest ? parseFloat(formData.chest) : undefined,
          waist: formData.waist ? parseFloat(formData.waist) : undefined,
          hips: formData.hips ? parseFloat(formData.hips) : undefined,
          biceps: formData.biceps ? parseFloat(formData.biceps) : undefined,
          thighs: formData.thighs ? parseFloat(formData.thighs) : undefined,
        },
        notes: formData.notes || undefined,
      })
      toast.success('Progress entry saved successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to create progress entry:', error)
      toast.error('Failed to save progress entry. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-neutral-900 border-neutral-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Log Progress Entry</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Primary Metrics */}
          <div>
            <h3 className="font-bold mb-4">Primary Metrics</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="70.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Body Fat (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={e => setFormData({ ...formData, bodyFat: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="15.5"
                />
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div>
            <h3 className="font-bold mb-4">Body Measurements (cm)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Chest</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.chest}
                  onChange={e => setFormData({ ...formData, chest: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Waist</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={e => setFormData({ ...formData, waist: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Hips</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.hips}
                  onChange={e => setFormData({ ...formData, hips: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="95"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Biceps</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.biceps}
                  onChange={e => setFormData({ ...formData, biceps: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="35"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Thighs</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.thighs}
                  onChange={e => setFormData({ ...formData, thighs: e.target.value })}
                  className="bg-neutral-800 border-neutral-700"
                  placeholder="55"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 resize-none"
              rows={3}
              placeholder="How are you feeling? Any observations?"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={createEntryMutation.isPending}
          >
            {createEntryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
